/*
 * Squidly input relay for Castle Light.
 *
 * The game is driven entirely by the Construct 2 Touch plugin (taps and
 * press-holds on canvas sprites; the Touch plugin also handles mouse input),
 * so mirroring pointer input keeps both sides in step moment-to-moment while
 * host snapshots (state-sync.js) provide authoritative corrections.
 *
 * Local pointer events are observed (never blocked), converted to game-space
 * coordinates (0-1280 x 0-720, letterbox-compensated so differing window
 * sizes don't matter) and published. Remote events are re-dispatched as
 * synthetic PointerEvents on the canvas, tagged so they are not re-published.
 *
 * Hold-to-walk safety: held pointers publish a heartbeat; receivers
 * auto-release any synthetic pointer whose heartbeat stops, so a dropped
 * "release" can never leave the remote knight walking forever.
 */
(function () {
    "use strict";

    const HEARTBEAT_MS = 900;
    const STALE_MS = 2500;
    const MOVE_THROTTLE_MS = 100;
    const MOVE_MIN_DISTANCE = 12; // game pixels
    const SYNTHETIC_POINTER_BASE = 3000;

    // Game controls (LEFT/RIGHT, and jump in later levels) live along the
    // bottom of gameplay layouts. Presses there are NOT relayed: each player
    // controls only their own knight (parallel play); the partner appears as
    // a ghost driven by the knight stream.
    function inMovementZone(gameX, gameY) {
        return bridge.isGameplayLayout() && gameY > 480;
    }

    const bridge = window.SquidlyC2Bridge;
    const sync = window.CastleLightSync;

    const heldLocal = new Map(); // local pointerId -> {x, y, lastMoveSent}
    const remotePointers = new Map(); // actorId + ":" + p -> {syntheticId, x, y, lastSeen}
    let nextSyntheticOffset = 0;
    let lastActivityAt = 0;
    let lastLocalActivityAt = 0;
    const ACTIVITY_GRACE_MS = 700; // let physics settle after the last release
    const LOCAL_CONTROL_GRACE_MS = 800; // keep authority briefly after release

    function gamePoint(event) {
        const point = bridge.clientToGame(event.clientX, event.clientY);
        return { x: Math.round(point.x * 10) / 10, y: Math.round(point.y * 10) / 10 };
    }

    // ---------- local capture ----------

    function isGameEvent(event) {
        if (event.__squidlySynth || !bridge.isOperational()) {
            return false;
        }
        const canvas = bridge.getCanvas();
        return !!canvas && (event.target === canvas || canvas.contains(event.target));
    }

    function movementDirection(gameX) {
        return gameX < 230 ? "left" : "right";
    }

    function onLocalDown(event) {
        if (!isGameEvent(event)) {
            return;
        }
        const point = gamePoint(event);
        if (inMovementZone(point.x, point.y)) {
            // Movement is fully local (parallel play); just nudge the ghost
            // stream so the partner sees the walk start promptly.
            heldLocal.set(event.pointerId, { x: point.x, y: point.y, lastMoveSent: Date.now(), movement: movementDirection(point.x) });
            lastActivityAt = Date.now();
            lastLocalActivityAt = Date.now();
            if (sync.pokeGhostStream) {
                sync.pokeGhostStream();
            }
            return;
        }
        heldLocal.set(event.pointerId, { x: point.x, y: point.y, lastMoveSent: Date.now(), movement: false });
        lastActivityAt = Date.now();
        lastLocalActivityAt = Date.now();
        sync.sendInputEvents([{ t: "d", p: event.pointerId, x: point.x, y: point.y }]);
    }

    function onLocalMove(event) {
        if (!isGameEvent(event)) {
            return;
        }
        const held = heldLocal.get(event.pointerId);
        if (!held) {
            return;
        }
        const point = gamePoint(event);
        const now = Date.now();
        const distance = Math.hypot(point.x - held.x, point.y - held.y);
        if (now - held.lastMoveSent < MOVE_THROTTLE_MS || distance < MOVE_MIN_DISTANCE) {
            return;
        }
        held.x = point.x;
        held.y = point.y;
        held.lastMoveSent = now;
        if (!held.movement) {
            sync.sendInputEvents([{ t: "m", p: event.pointerId, x: point.x, y: point.y }]);
        }
    }

    function onLocalUp(event, cancelled) {
        if (!isGameEvent(event)) {
            return;
        }
        const held = heldLocal.get(event.pointerId);
        if (!held) {
            return;
        }
        heldLocal.delete(event.pointerId);
        lastActivityAt = Date.now();
        lastLocalActivityAt = Date.now();
        if (held.movement) {
            // Movement is never relayed; nudge the ghost stream on release.
            if (sync.pokeGhostStream) {
                setTimeout(() => sync.pokeGhostStream(), 400); // after coast settles
            }
            return;
        }
        const point = gamePoint(event);
        sync.sendInputEvents([{ t: cancelled ? "c" : "u", p: event.pointerId, x: point.x, y: point.y }]);
    }

    function heartbeatLoop() {
        if (heldLocal.size === 0) {
            return;
        }
        const events = [];
        for (const [pointerId, held] of heldLocal) {
            if (!held.movement) {
                events.push({ t: "h", p: pointerId, x: held.x, y: held.y });
            }
        }
        if (events.length) {
            sync.sendInputEvents(events);
        }
    }

    // ---------- remote replay ----------

    function dispatchSynthetic(type, syntheticId, gameX, gameY) {
        const canvas = bridge.getCanvas();
        if (!canvas) {
            return;
        }
        const client = bridge.gameToClient(gameX, gameY);
        const event = new PointerEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: client.x,
            clientY: client.y,
            button: type === "pointermove" ? -1 : 0,
            buttons: type === "pointerup" || type === "pointercancel" ? 0 : 1,
            pointerId: syntheticId,
            pointerType: "touch",
            isPrimary: false
        });
        event.__squidlySynth = true;
        canvas.dispatchEvent(event);
    }

    function remoteKey(remoteActorId, pointerId) {
        return remoteActorId + ":" + pointerId;
    }

    function ensureRemoteDown(remoteActorId, pointerId, x, y) {
        const key = remoteKey(remoteActorId, pointerId);
        let pointer = remotePointers.get(key);
        if (!pointer) {
            nextSyntheticOffset = (nextSyntheticOffset + 1) % 1000;
            pointer = { syntheticId: SYNTHETIC_POINTER_BASE + nextSyntheticOffset, x, y, lastSeen: Date.now() };
            remotePointers.set(key, pointer);
            dispatchSynthetic("pointerdown", pointer.syntheticId, x, y);
        }
        return pointer;
    }

    function releaseRemote(key, cancelled) {
        const pointer = remotePointers.get(key);
        if (pointer) {
            remotePointers.delete(key);
            lastActivityAt = Date.now();
            dispatchSynthetic(cancelled ? "pointercancel" : "pointerup", pointer.syntheticId, pointer.x, pointer.y);
        }
    }

    function onRemoteEvents(remoteActorId, events) {
        for (const event of events) {
            // Movement presses are synced via the kinematics stream, never by
            // input replay (also guards against older-version senders).
            if (typeof event.x === "number" && typeof event.y === "number" && inMovementZone(event.x, event.y)) {
                continue;
            }
            const key = remoteKey(remoteActorId, event.p);
            if (event.t === "d") {
                ensureRemoteDown(remoteActorId, event.p, event.x, event.y);
            } else if (event.t === "m" || event.t === "h") {
                // A heartbeat for an unknown pointer means we missed the press
                // (late join or coalesced transport) - start the hold now.
                const pointer = ensureRemoteDown(remoteActorId, event.p, event.x, event.y);
                pointer.lastSeen = Date.now();
                if (event.t === "m" && (pointer.x !== event.x || pointer.y !== event.y)) {
                    pointer.x = event.x;
                    pointer.y = event.y;
                    dispatchSynthetic("pointermove", pointer.syntheticId, event.x, event.y);
                }
            } else if (event.t === "u" || event.t === "c") {
                releaseRemote(key, event.t === "c");
            }
            const pointer = remotePointers.get(key);
            if (pointer) {
                pointer.lastSeen = Date.now();
            }
        }
    }

    function staleSweep() {
        const cutoff = Date.now() - STALE_MS;
        for (const [key, pointer] of remotePointers) {
            if (pointer.lastSeen < cutoff) {
                releaseRemote(key, false);
            }
        }
    }

    // ---------- startup ----------

    window.CastleLightInputRelay = {
        // True while any pointer (local or mirrored remote) is held, or just
        // after one released. Sync uses this to defer disruptive resyncs.
        isAnyPointerActive() {
            return heldLocal.size > 0 || remotePointers.size > 0 || Date.now() - lastActivityAt < ACTIVITY_GRACE_MS;
        },
        // True only for pointers physically pressed on THIS device (mirrored
        // remote presses excluded).
        hasLocalInput() {
            return heldLocal.size > 0 || Date.now() - lastLocalActivityAt < LOCAL_CONTROL_GRACE_MS;
        }
    };

    bridge.onReady((operational) => {
        if (!operational) {
            return;
        }
        window.addEventListener("pointerdown", onLocalDown, true);
        window.addEventListener("pointermove", onLocalMove, true);
        window.addEventListener("pointerup", (event) => onLocalUp(event, false), true);
        window.addEventListener("pointercancel", (event) => onLocalUp(event, true), true);
        sync.onRemoteInput(onRemoteEvents);
        setInterval(heartbeatLoop, HEARTBEAT_MS);
        setInterval(staleSweep, 500);
    });
})();
