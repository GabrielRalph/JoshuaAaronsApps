/*
 * Squidly state sync for Castle Light.
 *
 * Follows the Dress the Monster integration conventions:
 *   - window.SquidlyAPI (firebaseSet / firebaseOnValue / addSessionInfoListener)
 *     with a BroadcastChannel + localStorage fallback for standalone/local dev.
 *   - A versioned shared-state document with app id, schema, actorId,
 *     mutationId and updatedAt, guarded to 5000 bytes per write.
 *   - Host by default so the game is fully usable outside Squidly; session
 *     info overrides the role.
 *
 * Three channels keep both sides in step:
 *   1. State doc  (castle-light/v1/state): layout + globals telemetry, level
 *      unlock progress, and actor presence (used to discover input channels).
 *   2. Input keys (castle-light/v1/input/<actorId>): batched pointer events
 *      published by each actor, replayed by everyone else (see input-relay.js).
 *   3. Snapshots  (castle-light/v1/snapshot/*): the authoritative full C2
 *      save-game, lz-string compressed and chunked under the 5000-byte limit.
 *      The host publishes; participants apply (always for forced snapshots,
 *      otherwise only to hydrate on join / layout mismatch).
 */
(function () {
    "use strict";

    const APP_ID = "castle-light";
    const SCHEMA = 1;
    const KEY_PREFIX = "castle-light/v1";
    const STATE_KEY_PREFIX = KEY_PREFIX + "/state/"; // per-role so heartbeats never clobber
    const INPUT_KEY_PREFIX = KEY_PREFIX + "/input/";
    const SNAPSHOT_META_KEY = KEY_PREFIX + "/snapshot/meta";
    const SNAPSHOT_CHUNK_KEY = KEY_PREFIX + "/snapshot/chunk";
    const KNIGHT_KEY_PREFIX = KEY_PREFIX + "/knight/";
    const KEYS_KEY_PREFIX = KEY_PREFIX + "/keys/";
    const COMPLETE_KEY_PREFIX = KEY_PREFIX + "/complete/";
    const MAX_VALUE_BYTES = 5000;
    const CHUNK_DATA_CHARS = 3600;
    const MAX_CHUNKS = 6; // snapshots compress to 2-3 chunks; fewer listeners is safer
    const UNLOCK_STORAGE_KEY = "level";

    const STATE_POLL_MS = 250;
    const STATE_HEARTBEAT_MS = 3000;
    const SNAPSHOT_PERIODIC_MS = 10000;  // events force immediate snapshots; periodic is backup only
    const SNAPSHOT_MIN_INTERVAL_MS = 1000;
    const APPLY_SETTLE_MS = 400;
    const ACTOR_ALIVE_MS = 12000;
    const INITIAL_REPLAY_MS = 2500;      // subscribe-replay window: not proof of liveness
    const REPUBLISH_MS = 2500;           // periodic re-send of keys/complete (lost-write safety)
    const GHOST_PUBLISH_MS = 250;        // partner-ghost position stream (display only)

    const bridge = window.SquidlyC2Bridge;
    const actorId = (globalThis.crypto && globalThis.crypto.randomUUID && globalThis.crypto.randomUUID()) ||
        "actor-" + Date.now() + "-" + Math.random().toString(36).slice(2);

    let role = "host"; // Host by default; Squidly session info overrides this.
    let ready = false;
    let applyingRemote = false;
    let localRevision = 0;
    let initialDocReceived = false;
    const startedAt = Date.now();

    const knownActors = new Map(); // actorId -> { lastSeen }
    const inputSubscriptions = new Set();
    const inputHandlers = [];
    const roleHandlers = [];

    let inputSeq = 0;
    let inputBuffer = [];
    let inputFlushTimer = 0;
    const lastSeqByActor = new Map();

    let lastPublishedTier1 = "";
    let lastWatchedLayout = null;
    let lastTier1Doc = null;
    let lastTier1DocAt = 0;

    let snapshotCounter = 0;
    let lastSnapshotPublish = 0;
    let pendingSnapshotTimer = 0;
    let lastAppliedSnapshotId = "";
    let hydrated = false;
    const chunkCache = new Map(); // index -> {id, data}
    let latestMeta = null;
    let lastLayoutName = null;
    let lastLayoutChangeAt = 0;

    function layoutStable() {
        if (!bridge.isOperational()) {
            return false;
        }
        const name = bridge.getLayoutName();
        if (name !== lastLayoutName) {
            lastLayoutName = name;
            lastLayoutChangeAt = Date.now();
        }
        return Date.now() - lastLayoutChangeAt > 1200;
    }

    function warn(...args) {
        console.warn("[CastleLightSync]", ...args);
    }

    function log(...args) {
        console.log("[CastleLightSync]", ...args);
    }

    // ---------- SquidlyAPI (with Dress-style local fallback) ----------

    function ensureSquidlyApi() {
        if (window.SquidlyAPI) {
            return window.SquidlyAPI;
        }
        const listeners = new Map();
        let channel;
        try {
            channel = new BroadcastChannel("castle-light-squidly-sync");
            channel.onmessage = (event) => {
                const message = event.data;
                if (!message || message.sender === actorId || !message.key) {
                    return;
                }
                if (message.type === "set") {
                    localStorage.setItem(message.key, String(message.value));
                    for (const listener of listeners.get(message.key) || []) {
                        listener(message.value);
                    }
                }
            };
        } catch (_) {
            channel = undefined;
        }
        window.SquidlyAPI = {
            firebaseOnValue(key, callback) {
                if (!listeners.has(key)) {
                    listeners.set(key, new Set());
                }
                listeners.get(key).add(callback);
                queueMicrotask(() => callback(localStorage.getItem(key)));
                return () => listeners.get(key) && listeners.get(key).delete(callback);
            },
            firebaseSet(key, value) {
                localStorage.setItem(key, String(value));
                for (const listener of listeners.get(key) || []) {
                    queueMicrotask(() => listener(value));
                }
                try {
                    channel && channel.postMessage({ type: "set", sender: actorId, key, value });
                } catch (_) {
                    // Local fallback only; Squidly provides the production transport.
                }
                return Promise.resolve();
            },
            setGridSize() {}
        };
        return window.SquidlyAPI;
    }

    function unwrapFirebaseValue(value) {
        try {
            return value && typeof value.val === "function" ? value.val() : value;
        } catch (_) {
            return value;
        }
    }

    function parseEnvelope(value) {
        let raw = unwrapFirebaseValue(value);
        if (typeof raw === "string") {
            try {
                raw = JSON.parse(raw);
            } catch (_) {
                return undefined;
            }
        }
        if (!raw || raw.app !== APP_ID || raw.schema !== SCHEMA) {
            return undefined;
        }
        return raw;
    }

    function firebaseWrite(key, payload) {
        const json = JSON.stringify(payload);
        if (new TextEncoder().encode(json).length > MAX_VALUE_BYTES) {
            warn("Write to", key, "skipped: payload exceeds", MAX_VALUE_BYTES, "bytes");
            return;
        }
        ensureSquidlyApi().firebaseSet(key, json);
    }

    function envelope(extra) {
        localRevision += 1;
        return Object.assign({
            app: APP_ID,
            schema: SCHEMA,
            actorId,
            mutationId: actorId + ":" + Date.now() + ":" + localRevision,
            updatedAt: Date.now()
        }, extra);
    }

    // ---------- roles ----------

    function parseSquidlyRole(user) {
        const value = String(user === undefined || user === null ? "" : user).toLowerCase();
        if (value.startsWith("host")) {
            return "host";
        }
        if (value.startsWith("participant") || value.startsWith("client")) {
            return "client";
        }
        return undefined;
    }

    function setRole(newRole) {
        if (newRole === role) {
            return;
        }
        role = newRole;
        log("Role set to", role);
        for (const handler of roleHandlers) {
            try {
                handler(role);
            } catch (error) {
                warn("Role handler failed:", error);
            }
        }
    }

    function initRole() {
        try {
            // Local-dev override so two tabs can simulate host + participant:
            // index.html?squidlyRole=client
            const override = parseSquidlyRole(new URLSearchParams(location.search).get("squidlyRole"));
            if (override) {
                setRole(override);
            }
        } catch (_) {
            // Ignore malformed URLs.
        }
        const squidlyApi = ensureSquidlyApi();
        if (typeof squidlyApi.addSessionInfoListener !== "function") {
            return;
        }
        squidlyApi.addSessionInfoListener((info) => {
            const detected = parseSquidlyRole(info && info.user);
            if (detected) {
                setRole(detected);
            }
        });
    }

    // ---------- tier 1: state document ----------

    function getUnlockLevel() {
        try {
            return localStorage.getItem(UNLOCK_STORAGE_KEY);
        } catch (_) {
            return null;
        }
    }

    function buildTier1() {
        return {
            layout: bridge.getLayoutName(),
            globals: bridge.getGlobals(),
            unlockLevel: getUnlockLevel(),
            role
        };
    }

    function publishStateDoc(reason) {
        if (!ready || applyingRemote || !bridge.isOperational()) {
            return;
        }
        const tier1 = buildTier1();
        const doc = envelope({
            reason,
            layout: tier1.layout,
            globals: tier1.globals,
            unlockLevel: tier1.unlockLevel,
            role: tier1.role
        });
        lastPublishedTier1 = JSON.stringify([tier1.layout, tier1.globals, tier1.unlockLevel]);
        firebaseWrite(STATE_KEY_PREFIX + (role === "host" ? "host" : "client"), doc);
    }

    function noteActor(remoteActorId, isLive) {
        if (!remoteActorId || remoteActorId === actorId) {
            return;
        }
        // State heartbeats AND the ghost stream both prove the partner is in
        // the session now. Docs delivered in the initial subscribe window are
        // ignored for liveness: firebaseOnValue replays the stored value on
        // subscribe, which may be a leftover from a previous session.
        if (isLive && Date.now() - startedAt > INITIAL_REPLAY_MS) {
            knownActors.set(remoteActorId, { lastSeen: Date.now() });
        }
        subscribeToActorInput(remoteActorId);
    }

    // True when ANY partner is active in the session (state heartbeat or
    // ghost stream seen recently). All receive-side gates use this instead of
    // per-doc sender timestamps: sender clocks on another machine can be
    // skewed by minutes and must never be compared with our Date.now().
    function partnerAlive() {
        for (const entry of knownActors.values()) {
            if (Date.now() - entry.lastSeen < ACTOR_ALIVE_MS) {
                return true;
            }
        }
        return false;
    }

    function applyRemoteStateDoc(doc) {
        if (!doc || doc.actorId === actorId) {
            return;
        }
        noteActor(doc.actorId, true);
        lastTier1Doc = doc;
        lastTier1DocAt = Date.now();
        // A snapshot may have arrived before this actor proved it was alive.
        tryApplySnapshot();
        // Level-unlock progress is plain localStorage; mirror UPWARD only
        // (union of both players' progress - never downgrade local progress).
        const remoteUnlock = Number(doc.unlockLevel);
        const localUnlock = Number(getUnlockLevel()) || 0;
        if (isFinite(remoteUnlock) && remoteUnlock > localUnlock) {
            try {
                localStorage.setItem(UNLOCK_STORAGE_KEY, String(remoteUnlock));
            } catch (_) {
                // Ignore storage failures.
            }
            // The level-select screen reads the storage when its layout
            // starts; if we are sitting on it, refresh via the partner's
            // snapshot so the newly unlocked tiles appear immediately.
            if (bridge.isOperational() && bridge.getLayoutName() === "SelectLevel") {
                lastAppliedSnapshotId = "";
                tryApplySnapshot();
            }
        }
    }

    function stateWatchLoop() {
        if (!bridge.isOperational() || applyingRemote) {
            return;
        }
        const tier1 = buildTier1();
        const fingerprint = JSON.stringify([tier1.layout, tier1.globals, tier1.unlockLevel]);
        if (fingerprint !== lastPublishedTier1) {
            const layoutChanged = lastWatchedLayout !== tier1.layout;
            lastWatchedLayout = tier1.layout;
            publishStateDoc("change");
            // Parallel play: worlds are independent, so the ONLY snapshot we
            // publish is on a layout change, so whoever advances first (e.g.
            // through the unlocked door) pulls the other to the next level.
            if (layoutChanged) {
                lastLocalLayoutChangeAt = Date.now();
                scheduleSnapshot(true, "layout-change");
            }
        }
    }

    // Lost-write safety for navigation: while the partner's reported layout
    // still differs from ours and WE are the one who recently navigated,
    // re-publish the layout snapshot until they follow.
    let lastLocalLayoutChangeAt = 0;

    function layoutFollowLoop() {
        if (!ready || applyingRemote || !bridge.isOperational() || !partnerAlive()) {
            return;
        }
        if (!lastTier1Doc || Date.now() - lastTier1DocAt > 10000) {
            return;
        }
        if (lastTier1Doc.layout === bridge.getLayoutName()) {
            return;
        }
        const iNavigatedRecently = Date.now() - lastLocalLayoutChangeAt < 15000;
        if (iNavigatedRecently && !pendingSnapshotTimer && Date.now() - lastSnapshotPublish > 4000) {
            publishSnapshot(true, "layout-sync");
        }
    }

    // ---------- input channel ----------

    function subscribeToActorInput(remoteActorId) {
        if (inputSubscriptions.has(remoteActorId)) {
            return;
        }
        inputSubscriptions.add(remoteActorId);
        ensureSquidlyApi().firebaseOnValue(INPUT_KEY_PREFIX + remoteActorId, (value) => {
            const batch = parseEnvelope(value);
            if (!batch || batch.actorId === actorId || !Array.isArray(batch.events)) {
                return;
            }
            const lastSeq = lastSeqByActor.get(batch.actorId) || 0;
            const fresh = batch.events.filter((event) => event.seq > lastSeq);
            if (fresh.length === 0) {
                return;
            }
            lastSeqByActor.set(batch.actorId, fresh[fresh.length - 1].seq);
            for (const handler of inputHandlers) {
                try {
                    handler(batch.actorId, fresh);
                } catch (error) {
                    warn("Input handler failed:", error);
                }
            }
        });
    }

    function flushInput() {
        inputFlushTimer = 0;
        if (inputBuffer.length === 0) {
            return;
        }
        // Keep a short replay window so coalesced transport updates cannot
        // drop events: every write carries all events from the last 1.5s.
        const cutoff = Date.now() - 1500;
        inputBuffer = inputBuffer.filter((event) => event.at >= cutoff);
        const events = inputBuffer.map((event) => ({ seq: event.seq, t: event.t, p: event.p, x: event.x, y: event.y }));
        firebaseWrite(INPUT_KEY_PREFIX + actorId, envelope({ events }));
    }

    function sendInputEvents(events) {
        if (!ready) {
            return;
        }
        const now = Date.now();
        for (const event of events) {
            inputSeq += 1;
            inputBuffer.push(Object.assign({ seq: inputSeq, at: now }, event));
        }
        if (!inputFlushTimer) {
            inputFlushTimer = setTimeout(flushInput, 120);
        }
    }

    // ---------- ghost knight stream (parallel play) ----------
    //
    // Each player plays their OWN fully-local game (zero latency, no
    // corrections, ever). Each side publishes its knight's kinematics on its
    // own key; the other side renders it as a translucent "ghost" overlay
    // (squidly/ghost.js). Display-only: nothing ever touches the local
    // simulation, so lag can only ever delay the ghost, never the player.

    let lastPublishedGhost = null;
    let remoteKnight = null;
    let remoteKnightAt = 0;

    function ghostKeyFor(r) {
        return KNIGHT_KEY_PREFIX + (r === "host" ? "host" : "client");
    }

    function publishGhostState(force) {
        if (!ready || applyingRemote || !bridge.isOperational() || !bridge.isGameplayLayout()) {
            return;
        }
        const kin = bridge.getPlayerKinematics();
        if (!kin) {
            return;
        }
        const doc = {
            x: Math.round(kin.x * 10) / 10,
            y: Math.round(kin.y * 10) / 10,
            dx: Math.round(kin.dx),
            dy: Math.round(kin.dy),
            layout: bridge.getLayoutName()
        };
        if (!force && lastPublishedGhost &&
            Math.abs(lastPublishedGhost.x - doc.x) < 3 &&
            Math.abs(lastPublishedGhost.y - doc.y) < 3 &&
            Date.now() - lastPublishedGhost.at < 1200) {
            return;
        }
        lastPublishedGhost = Object.assign({ at: Date.now() }, doc);
        firebaseWrite(ghostKeyFor(role), envelope(doc));
    }

    function onRemoteGhostDoc(doc) {
        if (!doc || doc.actorId === actorId) {
            return;
        }
        // The ghost stream is continuous (4/s) while the partner plays, so it
        // is the most reliable liveness signal in the real Squidly transport.
        noteActor(doc.actorId, true);
        remoteKnight = doc;
        remoteKnightAt = Date.now();
    }

    // ---------- global keys (co-op) ----------
    //
    // Keys are shared: a key counts for BOTH players once EITHER collects it.
    // Each side tracks which key positions have left its world (collected),
    // publishes that set, and when the partner reports a key this side still
    // has, it collects it by moving the key onto the local knight so the
    // game's own overlap event fires (counter, HUD, and door-open all run
    // through the real game logic). First player through the opened door
    // changes layout, which pulls the other along (two-way level follow).

    let keysLayout = null;
    const knownKeyPositions = new Set();   // positions ever seen present locally
    const collectedLocal = new Set();      // positions gone from our world
    let lastPublishedKeys = "";
    let lastKeysPublishAt = 0;
    let lastRemoteKeys = null;
    let lastRemoteKeysAt = 0;

    function keysLoop() {
        if (!ready || applyingRemote || !bridge.isOperational() || !bridge.isGameplayLayout()) {
            return;
        }
        const layout = bridge.getLayoutName();
        if (layout !== keysLayout) {
            // New layout: unified reset (epoch back to 0) shared with the
            // outcome tracker so both sides' key docs stay comparable.
            resetLevelTracking(layout, false);
        }
        const present = new Set(bridge.getKeyStates().map((k) => k.key));
        for (const pos of present) {
            knownKeyPositions.add(pos);
        }
        // Any key we have seen but is no longer present was collected here.
        for (const pos of knownKeyPositions) {
            if (!present.has(pos)) {
                collectedLocal.add(pos);
            }
        }
        // Apply the partner's collected keys that we still hold. Gated on the
        // partner being in the session, on the SAME run epoch (a restart
        // invalidates all previous key docs so torches stay reset), and never
        // while we are dead (the pending restart would re-light them).
        if (lastRemoteKeys && lastRemoteKeys.layout === layout && partnerAlive() &&
            (Number(lastRemoteKeys.epoch) || 0) === levelEpoch &&
            localOutcome !== "lose" &&
            Date.now() - lastRemoteKeysAt < 30000 && Array.isArray(lastRemoteKeys.collected)) {
            for (const pos of lastRemoteKeys.collected) {
                if (present.has(pos)) {
                    bridge.collectKeyByPosition(pos);
                    collectedLocal.add(pos);
                }
            }
        }
        // Publish on change AND periodically: a one-shot write can be lost on
        // the real transport, so the current set is re-sent every few seconds.
        const fingerprint = layout + ":" + [...collectedLocal].sort().join(";");
        if (fingerprint !== lastPublishedKeys ||
            (collectedLocal.size > 0 && Date.now() - lastKeysPublishAt > REPUBLISH_MS)) {
            lastPublishedKeys = fingerprint;
            lastKeysPublishAt = Date.now();
            firebaseWrite(KEYS_KEY_PREFIX + (role === "host" ? "host" : "client"),
                envelope({ layout, epoch: levelEpoch, collected: [...collectedLocal] }));
        }
    }

    function onRemoteKeysDoc(doc) {
        if (!doc || doc.actorId === actorId) {
            return;
        }
        noteActor(doc.actorId, false);
        lastRemoteKeys = doc;
        lastRemoteKeysAt = Date.now();
    }

    // ---------- shared level outcome (win / lose / restart) ----------
    //
    // Both players should reach the SAME end state together. Each side
    // broadcasts its own current outcome for the level; the partner
    // reproduces it through the game's OWN logic so the real popups appear:
    //   win  -> teleport the knight onto its open exit door (Level Complete)
    //   lose -> set PlayerHeart to 0 (game's own death -> Game Over popup)
    //   restart (partner in a newer run) -> tap the restart button
    // Outcome docs carry the run epoch so a stale "lose" from before a
    // restart can never kill the new run.
    // Reproduction retries every ~500ms (handles the key/door race and lost
    // writes) and stops as soon as the local game reaches that outcome.

    let outcomeLayout = null;
    let localOutcome = "playing"; // "playing" | "win" | "lose"
    let localWinDoor = null;      // door coords included in our win doc
    let lastPublishedOutcome = "";
    let lastOutcomePublishAt = 0;
    let lastReproAt = 0;
    let lastRemoteOutcome = null;
    let lastRemoteOutcomeAt = 0;
    let lastRestartTapAt = 0;
    const RESTART_RETRY_MS = 1000;
    let levelEpoch = 0; // increments on each restart of the same level
    let heartGoneSince = 0;
    const HEART_LOSS_CONFIRM_MS = 1200; // > 0.5s door-win wait, < 2s death popup
    const RESTART_HEARTS = 3;      // value the game's Restart button sets
    const KNIGHT_HALF_WIDTH = 50;  // knight sprite is 100x83, origin bottom-centre
    const KNIGHT_HEIGHT = 83;
    const DOOR_EXIT_Y = -400;      // above the layout: no hazards, not a fall death
    const DOOR_REENTER_MS = 120;   // a few ticks so the engine registers the exit
    const WIN_RETRY_MS = 1500;     // > the game's 0.5s door wait before state = "win"
    let lastWinAttemptAt = 0;

    function resetLevelTracking(layout, isRestart) {
        outcomeLayout = layout;
        localOutcome = "playing";
        localWinDoor = null;
        heartGoneSince = 0;
        lastPublishedOutcome = "";
        lastRemoteOutcome = null;
        // Each restart begins a new epoch: key docs from the previous run are
        // ignored, so the restarted level's torches stay off instead of being
        // re-lit from stale pre-death data. A new level resets the epoch.
        levelEpoch = isRestart ? levelEpoch + 1 : 0;
        // Keys tracking also resets with the fresh run.
        keysLayout = layout;
        knownKeyPositions.clear();
        collectedLocal.clear();
        lastPublishedKeys = "";
        lastKeysPublishAt = 0;
        lastRemoteKeys = null;
    }

    function repairHearts() {
        if (Number(bridge.getGlobal("PlayerHeart")) <= 0) {
            bridge.setGlobal("PlayerHeart", RESTART_HEARTS);
        }
    }

    function outcomeLoop() {
        if (!ready || applyingRemote || !bridge.isOperational()) {
            return;
        }
        if (!bridge.isGameplayLayout()) {
            // Leaving the level (Home / level select) ends the run. Without
            // this, re-entering the SAME level kept the old "lose"/"win"
            // outcome and restart epoch, which blocked key sharing and
            // partner win/death reproduction for the rest of that level.
            outcomeLayout = null;
            keysLayout = null;
            // The game only refills hearts on its Restart button, so after
            // dying and pressing Home the next level starts at 0 hearts and
            // the knight dies instantly. Refill (to the Restart value) before
            // a level starts.
            repairHearts();
            return;
        }
        const layout = bridge.getLayoutName();
        if (layout !== outcomeLayout) {
            resetLevelTracking(layout);
        }
        // Same problem via "Next" after a win: the hidden knight can lose
        // hearts behind the Level Complete popup, and Next keeps them.
        if (localOutcome === "win") {
            repairHearts();
        }
        const player = bridge.getPlayerPosition();
        if (!player) {
            return;
        }
        const globals = bridge.getGlobals();

        // --- detect local outcome transitions ---
        // Event sheet (eGame): touching an OPEN door waits 0.5s, shows the
        // popup and sets state = "win". The Level global is NOT bumped until
        // the next layout starts (and holds the highest level reached), so it
        // cannot signal a win. state is reset to "" on every layout start.
        // A win is FINAL for the run: the hidden knight keeps moving behind
        // the popup, can lose hearts, and the game then sets state = "lose"
        // ~2s later - none of which may flip the outcome to lose.
        const stateValue = String(globals.state);
        const heartGone = Number(globals.PlayerHeart) <= 0;
        if (heartGone) {
            heartGoneSince = heartGoneSince || Date.now();
        } else {
            heartGoneSince = 0;
        }
        // Death: PlayerHeart hits 0 on impact; the game sets state = "lose"
        // 2s later. Hearts can also drain during the 0.5s door wait before
        // state = "win", so a heart-only signal must persist past that wait.
        const lostNow = stateValue === "lose" ||
            (heartGone && Date.now() - heartGoneSince >= HEART_LOSS_CONFIRM_MS);
        if (localOutcome === "playing" && stateValue === "win") {
            localOutcome = "win";
            // Remember which door we won at: identical level geometry means
            // the partner can finish through the same door on their side.
            const doors = bridge.getDoorStates();
            localWinDoor = doors.reduce((best, d) =>
                (!best || Math.hypot(d.x - player.x, d.y - player.y) < Math.hypot(best.x - player.x, best.y - player.y)) ? d : best, null);
        } else if (localOutcome === "playing" && lostNow) {
            localOutcome = "lose";
        } else if (localOutcome === "lose" && stateValue !== "lose" && !heartGone) {
            // Level was restarted locally -> back to playing, new epoch.
            resetLevelTracking(layout, true);
        }

        // --- broadcast our outcome (immediately on change + periodic re-send) ---
        if (localOutcome !== lastPublishedOutcome ||
            Date.now() - lastOutcomePublishAt > REPUBLISH_MS) {
            lastPublishedOutcome = localOutcome;
            lastOutcomePublishAt = Date.now();
            firebaseWrite(COMPLETE_KEY_PREFIX + (role === "host" ? "host" : "client"),
                envelope({
                    layout,
                    epoch: levelEpoch,
                    outcome: localOutcome,
                    doorX: localWinDoor ? Math.round(localWinDoor.x) : undefined,
                    doorY: localWinDoor ? Math.round(localWinDoor.y) : undefined
                }));
        }

        reproduceRemoteOutcome();
    }

    // The game's door win is an "On collision" TRIGGER: it fires only when
    // the knight starts overlapping an open door. If the knight is already
    // inside the door (e.g. it spawns in the level-1 arch, or was standing in
    // the doorway while the door was still closed), teleporting onto it again
    // fires nothing. Step it out of the door for a couple of ticks first -
    // straight up above the layout, clear of any hazard - then back in.
    function enterDoor(door) {
        const knight = bridge.getPlayerKinematics();
        const overlapping = knight && door.w > 0 && door.h > 0 &&
            Math.abs(knight.x - door.x) < door.w / 2 + KNIGHT_HALF_WIDTH &&
            knight.y > door.y - door.h / 2 && knight.y - KNIGHT_HEIGHT < door.y + door.h / 2;
        if (!overlapping) {
            bridge.setPlayerKinematics(door.x, door.y, 0, 0);
            return;
        }
        bridge.setPlayerKinematics(door.x, DOOR_EXIT_Y, 0, 0);
        setTimeout(() => {
            if (bridge.isOperational() && bridge.isGameplayLayout() && localOutcome === "playing") {
                bridge.setPlayerKinematics(door.x, door.y, 0, 0);
            }
        }, DOOR_REENTER_MS);
    }

    // Reproduce the partner's outcome through real game logic. Runs from the
    // loop (retry) AND directly on packet receipt (minimal latency).
    function reproduceRemoteOutcome() {
        if (!ready || applyingRemote || !bridge.isOperational() || !bridge.isGameplayLayout()) {
            return;
        }
        const layout = bridge.getLayoutName();
        if (!lastRemoteOutcome || lastRemoteOutcome.layout !== layout ||
            !partnerAlive() || Date.now() - lastRemoteOutcomeAt > 15000) {
            return;
        }
        const remote = lastRemoteOutcome.outcome;
        const remoteEpoch = Number(lastRemoteOutcome.epoch) || 0;
        if (Date.now() - lastReproAt < 400) {
            return;
        }
        if (remote === "win" && localOutcome === "playing") {
            // Finish through the SAME door the winner used (coords match
            // across both games); it must be open locally (keys sync race ->
            // retried by the loop until it is).
            const doors = bridge.getDoorStates().filter((d) => d.open);
            let target;
            if (typeof lastRemoteOutcome.doorX === "number") {
                target = doors.find((d) =>
                    Math.abs(d.x - lastRemoteOutcome.doorX) < 40 && Math.abs(d.y - lastRemoteOutcome.doorY) < 40);
            }
            if (!target && doors.length === 1) {
                target = doors[0];
            }
            if (target && Date.now() - lastWinAttemptAt >= WIN_RETRY_MS) {
                lastReproAt = Date.now();
                lastWinAttemptAt = lastReproAt;
                enterDoor(target);
            }
        } else if (remote === "lose" && localOutcome === "playing" && remoteEpoch === levelEpoch) {
            // Only a death in the SAME run counts. After we restart (epoch+1)
            // the partner keeps re-sending its old "lose" until it restarts
            // too; acting on that killed the freshly restarted knight.
            lastReproAt = Date.now();
            bridge.killPlayer();
        } else if (remote === "playing" && remoteEpoch > levelEpoch && localOutcome === "lose" &&
            String(bridge.getGlobal("state")) === "lose" && Date.now() - lastRestartTapAt >= RESTART_RETRY_MS) {
            // Partner restarted into a newer run; press our restart button
            // once the game-over popup (state "lose") is up. Retried until
            // the local restart happens (our epoch catches up).
            lastReproAt = Date.now();
            lastRestartTapAt = lastReproAt;
            const btn = bridge.restartButton();
            bridge.tapGamePoint(btn.x, btn.y);
        }
    }

    function onRemoteOutcomeDoc(doc) {
        if (!doc || doc.actorId === actorId) {
            return;
        }
        noteActor(doc.actorId, false);
        lastRemoteOutcome = doc;
        lastRemoteOutcomeAt = Date.now();
        // React immediately rather than waiting for the next loop tick.
        reproduceRemoteOutcome();
    }

    // ---------- snapshots ----------

    function compressSnapshot(json) {
        return window.LZString.compressToBase64(json);
    }

    function decompressSnapshot(data) {
        return window.LZString.decompressFromBase64(data);
    }

    function publishSnapshot(force, reason) {
        if (!ready || applyingRemote || !bridge.isOperational()) {
            return;
        }
        let json;
        try {
            json = bridge.saveStateJson();
        } catch (error) {
            warn("Snapshot capture failed:", error);
            return;
        }
        const compressed = compressSnapshot(json);
        const chunkCount = Math.ceil(compressed.length / CHUNK_DATA_CHARS);
        if (chunkCount > MAX_CHUNKS) {
            warn("Snapshot skipped: needs", chunkCount, "chunks (max", MAX_CHUNKS + ")");
            return;
        }
        snapshotCounter += 1;
        const id = actorId + ":" + snapshotCounter;
        for (let index = 0; index < chunkCount; index += 1) {
            firebaseWrite(SNAPSHOT_CHUNK_KEY + index, envelope({
                id,
                index,
                data: compressed.slice(index * CHUNK_DATA_CHARS, (index + 1) * CHUNK_DATA_CHARS)
            }));
        }
        // Meta is written last so receivers only assemble complete snapshots.
        firebaseWrite(SNAPSHOT_META_KEY, envelope({
            id,
            force: force === true,
            reason,
            chunkCount,
            rawLength: json.length,
            layout: bridge.getLayoutName(),
            globals: bridge.getGlobals()
        }));
        lastSnapshotPublish = Date.now();
    }

    function scheduleSnapshot(force, reason) {
        // Both sides publish layout-change and startup snapshots (either can
        // advance first); there are no other snapshot kinds in parallel play.
        if (!ready) {
            return;
        }
        const now = Date.now();
        const wait = Math.max(0, SNAPSHOT_MIN_INTERVAL_MS - (now - lastSnapshotPublish));
        if (pendingSnapshotTimer) {
            return;
        }
        pendingSnapshotTimer = setTimeout(() => {
            pendingSnapshotTimer = 0;
            publishSnapshot(force, reason);
        }, wait + APPLY_SETTLE_MS);
    }

    function verifySnapshotApplied(meta, json, attempt) {
        // A load staged while the runtime is suspended (hidden tab) can be
        // half-consumed and lost; verify the layout actually switched and
        // re-stage the load if it did not.
        setTimeout(() => {
            if (!latestMeta || latestMeta.id !== meta.id || lastAppliedSnapshotId !== meta.id) {
                return; // Superseded by a newer snapshot.
            }
            if (!bridge.isOperational() || bridge.getLayoutName() === meta.layout) {
                return; // Applied successfully.
            }
            if (attempt >= 3) {
                warn("Snapshot", meta.id, "did not apply after", attempt, "attempts");
                return;
            }
            log("Snapshot", meta.id, "not applied yet; retrying load (attempt " + (attempt + 1) + ")");
            bridge.loadStateJson(json);
            verifySnapshotApplied(meta, json, attempt + 1);
        }, 1500);
    }

    function tryApplySnapshot() {
        const meta = latestMeta;
        if (!meta || meta.actorId === actorId || meta.id === lastAppliedSnapshotId) {
            return;
        }
        // Gate only on the partner being active in this session, measured by
        // LOCAL receive times. Never compare the sender's updatedAt with our
        // own clock: machines can be skewed by minutes, which would silently
        // reject every follow (home, next level) between real devices.
        if (!partnerAlive()) {
            return;
        }
        const chunks = [];
        for (let index = 0; index < meta.chunkCount; index += 1) {
            const chunk = chunkCache.get(index);
            if (!chunk || chunk.id !== meta.id) {
                return; // Incomplete; chunk listeners will retry.
            }
            chunks.push(chunk.data);
        }
        // Parallel play: each side's world is independent. A snapshot is
        // applied ONLY to follow the partner to a DIFFERENT layout (menu,
        // level select, next level) or to hydrate on join - never to a level
        // already in progress (that would disrupt the local player).
        const shouldApply =
            !hydrated ||
            (bridge.isOperational() && bridge.getLayoutName() !== meta.layout);
        if (!shouldApply) {
            lastAppliedSnapshotId = meta.id; // Seen; not applied.
            return;
        }
        const json = decompressSnapshot(chunks.join(""));
        if (!json || json.length !== meta.rawLength) {
            warn("Snapshot", meta.id, "failed integrity check; skipping");
            return;
        }
        const sameLayout = bridge.isOperational() && bridge.getLayoutName() === meta.layout;
        // Applying a same-layout world snapshot while our layout is still
        // building its instances is what crashes the C2 deserializer. Defer
        // until the layout has settled. (Cross-layout loads rebuild the whole
        // layout internally and are safe.)
        if (sameLayout && !layoutStable()) {
            setTimeout(tryApplySnapshot, 300);
            return;
        }
        applyingRemote = true;
        try {
            if (bridge.loadStateJson(json)) {
                lastAppliedSnapshotId = meta.id;
                hydrated = true;
                log("Applied snapshot", meta.id, "(" + (meta.reason || "unknown") + ", layout " + meta.layout + ")");
                verifySnapshotApplied(meta, json, 1);
            }
        } finally {
            // Let the load settle before resuming change detection so the
            // applied state is not re-published as a local change (and never
            // echoed back as a layout-change snapshot).
            setTimeout(() => {
                applyingRemote = false;
                const layoutNow = bridge.isOperational() ? bridge.getLayoutName() : undefined;
                lastWatchedLayout = layoutNow;
                lastPublishedTier1 = JSON.stringify([
                    layoutNow,
                    bridge.isOperational() ? bridge.getGlobals() : undefined,
                    getUnlockLevel()
                ]);
                publishStateDoc("followed");
            }, APPLY_SETTLE_MS);
        }
    }

    function initSnapshotListeners() {
        const squidlyApi = ensureSquidlyApi();
        for (let index = 0; index < MAX_CHUNKS; index += 1) {
            squidlyApi.firebaseOnValue(SNAPSHOT_CHUNK_KEY + index, (value) => {
                const chunk = parseEnvelope(value);
                if (chunk && typeof chunk.data === "string") {
                    chunkCache.set(chunk.index, { id: chunk.id, data: chunk.data });
                    tryApplySnapshot();
                }
            });
        }
        squidlyApi.firebaseOnValue(SNAPSHOT_META_KEY, (value) => {
            const meta = parseEnvelope(value);
            if (meta && typeof meta.chunkCount === "number") {
                latestMeta = meta;
                noteActor(meta.actorId, false);
                tryApplySnapshot();
            }
        });
    }

    // ---------- startup ----------

    function initStateListener() {
        for (const r of ["host", "client"]) {
            ensureSquidlyApi().firebaseOnValue(STATE_KEY_PREFIX + r, (value) => {
                const doc = parseEnvelope(value);
                if (!initialDocReceived) {
                    initialDocReceived = true;
                    if (!doc) {
                        publishStateDoc("initialise");
                    }
                }
                if (doc) {
                    applyRemoteStateDoc(doc);
                }
            });
        }
        setTimeout(() => {
            if (!initialDocReceived) {
                initialDocReceived = true;
                publishStateDoc("initialise");
            }
        }, 500);
    }

    function start() {
        ready = true;
        try {
            ensureSquidlyApi().setGridSize && ensureSquidlyApi().setGridSize(4, 5);
        } catch (_) {
            // Optional Squidly overlay API.
        }
        initRole();
        // Subscribe the critical lightweight channels first; snapshot chunk
        // listeners come last in case the embedding transport caps listeners.
        initStateListener();
        for (const ghostRole of ["host", "client"]) {
            ensureSquidlyApi().firebaseOnValue(KNIGHT_KEY_PREFIX + ghostRole, (value) => {
                const doc = parseEnvelope(value);
                if (doc) {
                    onRemoteGhostDoc(doc);
                }
            });
            ensureSquidlyApi().firebaseOnValue(KEYS_KEY_PREFIX + ghostRole, (value) => {
                const doc = parseEnvelope(value);
                if (doc) {
                    onRemoteKeysDoc(doc);
                }
            });
            ensureSquidlyApi().firebaseOnValue(COMPLETE_KEY_PREFIX + ghostRole, (value) => {
                const doc = parseEnvelope(value);
                if (doc) {
                    onRemoteOutcomeDoc(doc);
                }
            });
        }
        initSnapshotListeners();
        setInterval(stateWatchLoop, STATE_POLL_MS);
        setInterval(layoutFollowLoop, 2000);
        setInterval(publishGhostState, GHOST_PUBLISH_MS);
        setInterval(keysLoop, 300);
        setInterval(outcomeLoop, 150);
        setInterval(() => publishStateDoc("heartbeat"), STATE_HEARTBEAT_MS);
        // Publish a startup snapshot from ANY layout: it both lets a late
        // joiner hydrate and overwrites any stale snapshot a previous session
        // left behind (so old state can never be resurrected).
        setTimeout(() => publishSnapshot(true, "startup"), 2500);
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden && latestMeta && latestMeta.actorId !== actorId &&
                bridge.isOperational() && !bridge.isGameplayLayout()) {
                // Only re-hydrate menus/level-select on return, never a level
                // in progress (that would disrupt the local player).
                lastAppliedSnapshotId = "";
                hydrated = false;
                tryApplySnapshot();
            }
        });
        log("Started as", role, "actor", actorId);
    }

    window.CastleLightSync = {
        getActorId: () => actorId,
        getRole: () => role,
        isApplyingRemote: () => applyingRemote,
        // Partner-ghost data for squidly/ghost.js (display only).
        getRemoteKnight() {
            return remoteKnight ? { doc: remoteKnight, receivedAt: remoteKnightAt } : null;
        },
        // Input relay pokes this on movement transitions for a snappier ghost.
        pokeGhostStream() {
            publishGhostState(true);
        },
        onRole(handler) {
            roleHandlers.push(handler);
        },
        onRemoteInput(handler) {
            inputHandlers.push(handler);
        },
        isPartnerAlive: partnerAlive,
        // Generic shared documents for add-on modules (torch questions): the
        // same envelope, schema check and 5000-byte guard as every channel.
        publishShared(key, extra) {
            if (ready) {
                firebaseWrite(key, envelope(extra));
            }
        },
        onShared(key, handler) {
            return ensureSquidlyApi().firebaseOnValue(key, (value) => {
                const doc = parseEnvelope(value);
                if (doc && doc.actorId !== actorId) {
                    handler(doc);
                }
            });
        },
        sendInputEvents,
        requestSnapshot(reason) {
            scheduleSnapshot(true, reason || "requested");
        },
        diagnostics() {
            return {
                actorId,
                role,
                ready,
                hydrated,
                knownActors: [...knownActors.keys()],
                lastAppliedSnapshotId,
                latestMetaId: latestMeta ? latestMeta.id : null,
                lastTier1Doc
            };
        }
    };

    bridge.onReady((operational) => {
        if (operational) {
            start();
        } else {
            warn("Bridge not operational; sync disabled.");
        }
    });
})();
