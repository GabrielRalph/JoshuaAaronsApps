/*
 * Squidly C2 bridge for the Castle Light Construct 2 export.
 *
 * c2runtime.js is minified, so internal property names are export-specific.
 * Every binding below was verified live against this exact build. The bridge
 * re-verifies all bindings at startup and recovers most of them with
 * value-shape probes if the game is ever re-exported. If verification fails,
 * the bridge reports non-operational and the game keeps working locally
 * without sync (it never throws into the game).
 *
 * Verified bindings for this export:
 *   window.cr_getC2Runtime()  -> runtime instance (official export global)
 *   rt.Ew                     -> global variables array [{name, data}]
 *   rt.Sc                     -> layouts array (layout objects with .name)
 *   rt.ua                     -> currently running layout object
 *   rt.qA()                   -> full save-game JSON string ({c2save:true,...})
 *   rt.zp / rt.Ol             -> save-slot / load-slot request properties;
 *                                setting rt.Ol = "slot" loads
 *                                localStorage["__c2save_" + slot] on next tick
 *   rt.Jb.W                   -> game time in seconds
 *   rt.dh                     -> tick count
 */
(function () {
    "use strict";

    const GAME_WIDTH = 1280;
    const GAME_HEIGHT = 720;
    const LAYOUT_NAMES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Menu", "SelectLevel"];
    const GLOBAL_NAMES = ["Music", "Sound", "state", "PlayerHeart", "Gem", "Level"];
    const LOAD_SLOT = "squidly-sync";
    const SAVE_PREFIX = "__c2save_";
    const PLAYER_SID = 4260988099634282; // t14: Platform + ScrollTo + Flash (the knight)
    // Enemy/hazard object types that kill the knight on contact (images
    // enem/enem2/enem3/fly/sprite). Verified live: moving an enem3 onto the
    // knight triggers the game's real death (state -> "lose").
    const HAZARD_SIDS = [7155079447696965, 7033604376307462, 1506432046983592, 7258353769484553, 1940788484455894];
    const RESTART_BUTTON = { x: 866, y: 510 }; // restart/next-level button on the end popup
    // Key collectibles (3 object types, images "key"). Stable across the
    // export. Collecting all keys opens the level's exit door (verified).
    const KEY_SIDS = [5211189489067056, 965325539043996, 978414378032003];
    const DOOR_SID = 7243685149399532; // t39: level doors (frame>0 = open)

    const defaultBindings = {
        globalsArray: "Ew",
        layoutsArray: "Sc",
        currentLayout: "ua",
        saveToJson: "qA",
        saveSlotProp: "zp",
        loadSlotProp: "Ol",
        clockObject: "Jb",
        tickCountProp: "dh"
    };

    const state = {
        runtime: null,
        bindings: null,
        operational: false,
        failures: [],
        probed: [],
        readyCallbacks: []
    };

    function warn(...args) {
        console.warn("[SquidlyC2Bridge]", ...args);
    }

    // ---------- value-shape probes (re-export fallback) ----------

    function probeGlobalsArray(rt) {
        for (const key of Object.keys(rt)) {
            const value = rt[key];
            if (Array.isArray(value) && value.length > 0 && value.length < 64 &&
                value.every((v) => v && typeof v === "object" && typeof v.name === "string") &&
                value.some((v) => v.name === "Music")) {
                return key;
            }
        }
        return undefined;
    }

    function probeLayoutsArray(rt) {
        for (const key of Object.keys(rt)) {
            const value = rt[key];
            if (Array.isArray(value) && value.length > 0 &&
                value.every((v) => v && typeof v === "object" && typeof v.name === "string")) {
                const names = value.map((v) => v.name);
                if (names.includes("Menu") && names.includes("SelectLevel")) {
                    return key;
                }
            }
        }
        return undefined;
    }

    function probeCurrentLayout(rt, layoutsKey) {
        const layouts = rt[layoutsKey];
        if (!Array.isArray(layouts)) {
            return undefined;
        }
        for (const key of Object.keys(rt)) {
            if (key !== layoutsKey && layouts.includes(rt[key])) {
                return key;
            }
        }
        return undefined;
    }

    function prototypeFunctionNames(rt) {
        const proto = Object.getPrototypeOf(rt);
        return proto ? Object.getOwnPropertyNames(proto).filter((k) => typeof proto[k] === "function") : [];
    }

    function returnsSaveJson(rt, key) {
        try {
            const result = rt[key]();
            return typeof result === "string" && result.startsWith("{\"c2save\":true");
        } catch (_) {
            return false;
        }
    }

    function probeSaveFunction(rt) {
        // Both the save and load functions mention "c2save"; only the save
        // function returns the save JSON when called, so call candidates to
        // disambiguate (the load/tick candidates no-op safely with no args).
        const proto = Object.getPrototypeOf(rt);
        const candidates = prototypeFunctionNames(rt).filter((key) => {
            const src = proto[key].toString();
            return src.includes("c2save") && !src.includes(SAVE_PREFIX);
        });
        return candidates.find((key) => returnsSaveJson(rt, key));
    }

    function probeSlotProps(rt) {
        // The per-tick save/load handler starts with:
        //   var a=this,d=this.<saveSlot>,e=this.<savedJson>,l=this.<loadSlot>
        const proto = Object.getPrototypeOf(rt);
        for (const key of prototypeFunctionNames(rt)) {
            const src = proto[key].toString();
            if (src.includes(SAVE_PREFIX)) {
                const match = src.match(/var \w+=this,\w+=this\.(\w+),\w+=this\.(\w+),\w+=this\.(\w+)/);
                if (match) {
                    return { saveSlotProp: match[1], loadSlotProp: match[3] };
                }
            }
        }
        return undefined;
    }

    // ---------- binding resolution and verification ----------

    function isGlobalsArray(value) {
        return Array.isArray(value) && GLOBAL_NAMES.every((n) => value.some((v) => v && v.name === n));
    }

    function resolveBindings(rt) {
        const bindings = Object.assign({}, defaultBindings);
        const failures = [];
        const probed = [];

        if (!isGlobalsArray(rt[bindings.globalsArray])) {
            const key = probeGlobalsArray(rt);
            if (key) {
                bindings.globalsArray = key;
                probed.push("globalsArray");
            } else {
                failures.push("globalsArray: no array of {name,data} globals found");
            }
        }

        const layoutsOk = (key) => Array.isArray(rt[key]) && rt[key].some((l) => l && l.name === "Menu");
        if (!layoutsOk(bindings.layoutsArray)) {
            const key = probeLayoutsArray(rt);
            if (key) {
                bindings.layoutsArray = key;
                probed.push("layoutsArray");
            } else {
                failures.push("layoutsArray: no layout list found");
            }
        }

        const currentOk = (key) => rt[key] && typeof rt[key].name === "string" && LAYOUT_NAMES.includes(rt[key].name);
        if (!currentOk(bindings.currentLayout)) {
            const key = probeCurrentLayout(rt, bindings.layoutsArray);
            if (key) {
                bindings.currentLayout = key;
                probed.push("currentLayout");
            } else {
                failures.push("currentLayout: no running-layout property found");
            }
        }

        const saveOk = (key) => typeof rt[key] === "function" && returnsSaveJson(rt, key);
        if (!saveOk(bindings.saveToJson)) {
            const key = probeSaveFunction(rt);
            if (key) {
                bindings.saveToJson = key;
                probed.push("saveToJson");
            } else {
                failures.push("saveToJson: no save-to-JSON function found");
            }
        }

        const slotOk = typeof rt[bindings.saveSlotProp] === "string" && typeof rt[bindings.loadSlotProp] === "string";
        if (!slotOk) {
            const slots = probeSlotProps(rt);
            if (slots) {
                bindings.saveSlotProp = slots.saveSlotProp;
                bindings.loadSlotProp = slots.loadSlotProp;
                probed.push("saveSlotProp/loadSlotProp");
            } else {
                failures.push("slot props: save/load slot properties not found");
            }
        }

        if (!rt[bindings.clockObject] || typeof rt[bindings.clockObject].W !== "number") {
            // Non-critical: used for diagnostics only.
            probed.push("clockObject (unverified, diagnostics only)");
        }

        return { bindings, failures, probed };
    }

    // ---------- public API helpers ----------

    function requireOperational() {
        if (!state.operational) {
            throw new Error("SquidlyC2Bridge is not operational");
        }
    }

    function findGlobal(name) {
        requireOperational();
        return state.runtime[state.bindings.globalsArray].find((v) => v.name === name);
    }

    function getCanvas() {
        return document.getElementById("c2canvas");
    }

    function getGameRect() {
        // The runtime letterboxes the 1280x720 game inside the canvas, which it
        // keeps sized to the window. Mapping is pure geometry from the aspect fit.
        const canvas = getCanvas();
        const rect = canvas.getBoundingClientRect();
        const scale = Math.min(rect.width / GAME_WIDTH, rect.height / GAME_HEIGHT);
        return {
            left: rect.left + (rect.width - GAME_WIDTH * scale) / 2,
            top: rect.top + (rect.height - GAME_HEIGHT * scale) / 2,
            width: GAME_WIDTH * scale,
            height: GAME_HEIGHT * scale,
            scale
        };
    }

    const api = {
        GAME_WIDTH,
        GAME_HEIGHT,
        LAYOUT_NAMES,
        GLOBAL_NAMES,

        isOperational() {
            return state.operational;
        },

        onReady(callback) {
            if (state.runtime) {
                callback(state.operational);
            } else {
                state.readyCallbacks.push(callback);
            }
        },

        diagnostics() {
            return {
                operational: state.operational,
                bindings: state.bindings,
                failures: state.failures.slice(),
                probed: state.probed.slice(),
                layout: state.operational ? api.getLayoutName() : undefined,
                globals: state.operational ? api.getGlobals() : undefined,
                saveLength: state.operational ? api.saveStateJson().length : undefined
            };
        },

        getRuntime() {
            return state.runtime;
        },

        getGlobal(name) {
            const entry = findGlobal(name);
            return entry ? entry.data : undefined;
        },

        setGlobal(name, value) {
            const entry = findGlobal(name);
            if (entry) {
                entry.data = value;
            }
        },

        getGlobals() {
            requireOperational();
            const globals = {};
            for (const name of GLOBAL_NAMES) {
                const entry = findGlobal(name);
                globals[name] = entry ? entry.data : undefined;
            }
            return globals;
        },

        getLayoutName() {
            requireOperational();
            const layout = state.runtime[state.bindings.currentLayout];
            return layout ? layout.name : undefined;
        },

        isGameplayLayout() {
            const name = api.getLayoutName();
            return name !== undefined && name !== "Menu" && name !== "SelectLevel";
        },

        saveStateJson() {
            requireOperational();
            return state.runtime[state.bindings.saveToJson]();
        },

        loadStateJson(json) {
            requireOperational();
            try {
                // Capture the currently-running (good) state so a load that
                // crashes the C2 deserializer mid-way can be rolled back.
                state.loadBackupJson = state.runtime[state.bindings.saveToJson]();
            } catch (_) {
                state.loadBackupJson = null;
            }
            try {
                localStorage.setItem(SAVE_PREFIX + LOAD_SLOT, json);
            } catch (error) {
                warn("Unable to stage save state for loading:", error);
                return false;
            }
            state.runtime[state.bindings.loadSlotProp] = LOAD_SLOT;
            return true;
        },

        // True while a staged load has not been consumed by the runtime yet
        // (the load-slot property resets to "" once the tick processes it).
        isLoadPending() {
            requireOperational();
            return state.runtime[state.bindings.loadSlotProp] !== "";
        },

        getGameTime() {
            requireOperational();
            const clock = state.runtime[state.bindings.clockObject];
            return clock && typeof clock.W === "number" ? clock.W : undefined;
        },

        getTickCount() {
            requireOperational();
            const ticks = state.runtime[state.bindings.tickCountProp];
            return typeof ticks === "number" ? ticks : undefined;
        },

        getCanvas,
        getGameRect,

        // Object types live in rt.D; type.qa is the export SID, type.j the
        // live instances. Verified live: setting inst.x/.y then inst.A()
        // (bbox-changed) teleports the instance and physics accepts it.
        // Platform behavior kinematics. Verified live on this export:
        // the Platform behavior instance (inst.V) exposes dx as .G and dy as
        // .I (confirmed by correlating them with measured velocities).
        getPlayerKinematics() {
            requireOperational();
            const type = state.runtime.D && state.runtime.D.find((t) => t && t.qa === PLAYER_SID);
            const inst = type && type.j && type.j[0];
            if (!inst) {
                return undefined;
            }
            const beh = (inst.V || []).find((b) => b && typeof b.G === "number" && typeof b.I === "number");
            return { x: inst.x, y: inst.y, dx: beh ? beh.G : 0, dy: beh ? beh.I : 0 };
        },

        setPlayerKinematics(x, y, dx, dy) {
            requireOperational();
            const type = state.runtime.D && state.runtime.D.find((t) => t && t.qa === PLAYER_SID);
            const inst = type && type.j && type.j[0];
            if (!inst || !isFinite(x) || !isFinite(y)) {
                return false;
            }
            inst.x = x;
            inst.y = y;
            const beh = (inst.V || []).find((b) => b && typeof b.G === "number" && typeof b.I === "number");
            if (beh && isFinite(dx) && isFinite(dy)) {
                beh.G = dx;
                beh.I = dy;
            }
            if (typeof inst.A === "function") {
                inst.A();
            }
            return true;
        },

        getPlayerPosition() {
            requireOperational();
            const type = state.runtime.D && state.runtime.D.find((t) => t && t.qa === PLAYER_SID);
            const inst = type && type.j && type.j[0];
            return inst ? { x: inst.x, y: inst.y } : undefined;
        },

        // Door sconces (open when P>0). Used to detect/replicate level
        // completion: the player finishes by reaching an OPEN exit door.
        getDoorStates() {
            requireOperational();
            const type = state.runtime.D && state.runtime.D.find((t) => t && t.qa === DOOR_SID);
            if (!type || !type.j) {
                return [];
            }
            return type.j.map((inst) => ({
                x: inst.x,
                y: inst.y,
                w: typeof inst.width === "number" ? inst.width : 0,
                h: typeof inst.height === "number" ? inst.height : 0,
                open: inst.P > 0
            }));
        },

        // Kills the knight through the game's own death event (eGame:
        // "PlayerHeart <= 0, trigger once" -> Dead animation, Platform off,
        // wait 2s, game-over popup, state = "lose"). Works on every level and
        // regardless of remaining hearts; moving a hazard onto the knight only
        // removed ONE heart and levels 4-12 contain none of HAZARD_SIDS.
        killPlayer() {
            requireOperational();
            const entry = findGlobal("PlayerHeart");
            if (!entry) {
                return false;
            }
            if (Number(entry.data) > 0) {
                entry.data = 0;
            }
            return true;
        },

        // Moves a hazard instance onto the knight (removes one heart via the
        // engine's collision event). Kept for diagnostics only.
        killPlayerViaHazard() {
            requireOperational();
            const playerType = state.runtime.D.find((t) => t && t.qa === PLAYER_SID);
            const player = playerType && playerType.j && playerType.j[0];
            if (!player) {
                return false;
            }
            for (const sid of HAZARD_SIDS) {
                const type = state.runtime.D && state.runtime.D.find((t) => t && t.qa === sid);
                const inst = type && type.j && type.j[0];
                if (inst) {
                    inst.x = player.x;
                    inst.y = player.y;
                    if (typeof inst.A === "function") {
                        inst.A();
                    }
                    return true;
                }
            }
            return false;
        },

        // Dispatches a synthetic tap at a game-space point (used to press the
        // restart/next button on the end popup so the partner advances too).
        tapGamePoint(gameX, gameY) {
            requireOperational();
            const canvas = getCanvas();
            if (!canvas) {
                return;
            }
            const client = api.gameToClient(gameX, gameY);
            const opts = {
                bubbles: true, cancelable: true, clientX: client.x, clientY: client.y,
                button: 0, pointerId: 2800, pointerType: "touch", isPrimary: true
            };
            const down = new PointerEvent("pointerdown", opts);
            const up = new PointerEvent("pointerup", opts);
            down.__squidlySynth = true;
            up.__squidlySynth = true;
            canvas.dispatchEvent(down);
            setTimeout(() => canvas.dispatchEvent(up), 60);
        },

        restartButton() {
            return RESTART_BUTTON;
        },

        // Keys are static collectibles; their coordinates identify them
        // across both games (instance uids differ per client).
        getKeyStates() {
            requireOperational();
            const states = [];
            for (const sid of KEY_SIDS) {
                const type = state.runtime.D && state.runtime.D.find((t) => t && t.qa === sid);
                if (type && type.j) {
                    for (const inst of type.j) {
                        states.push({ sid, uid: inst.uid, key: Math.round(inst.x) + "," + Math.round(inst.y) });
                    }
                }
            }
            return states;
        },

        // Collects a key the same way the player does: move the key onto the
        // knight so the engine's own overlap/collect event fires (increments
        // the counter and HUD, and opens the door when all keys are gathered).
        // This runs the real game logic rather than injecting state.
        collectKeyByPosition(posKey) {
            requireOperational();
            const playerType = state.runtime.D.find((t) => t && t.qa === PLAYER_SID);
            const player = playerType && playerType.j && playerType.j[0];
            if (!player) {
                return false;
            }
            for (const sid of KEY_SIDS) {
                const type = state.runtime.D && state.runtime.D.find((t) => t && t.qa === sid);
                if (!type || !type.j) {
                    continue;
                }
                const inst = type.j.find((i) => (Math.round(i.x) + "," + Math.round(i.y)) === posKey);
                if (inst) {
                    inst.x = player.x;
                    inst.y = player.y;
                    if (typeof inst.A === "function") {
                        inst.A();
                    }
                    return true;
                }
            }
            return false;
        },

        setPlayerPosition(x, y) {
            requireOperational();
            const type = state.runtime.D && state.runtime.D.find((t) => t && t.qa === PLAYER_SID);
            const inst = type && type.j && type.j[0];
            if (!inst || typeof x !== "number" || typeof y !== "number" || !isFinite(x) || !isFinite(y)) {
                return false;
            }
            inst.x = x;
            inst.y = y;
            if (typeof inst.A === "function") {
                inst.A();
            }
            return true;
        },

        clientToGame(clientX, clientY) {
            const rect = getGameRect();
            return {
                x: (clientX - rect.left) / rect.scale,
                y: (clientY - rect.top) / rect.scale
            };
        },

        gameToClient(gameX, gameY) {
            const rect = getGameRect();
            return {
                x: rect.left + gameX * rect.scale,
                y: rect.top + gameY * rect.scale
            };
        }
    };

    // ---------- startup ----------

    // The C2 deserializer (loadFromJSON) can throw mid-way on a save captured
    // during a layout transition, which otherwise kills the whole game loop.
    // Wrap it so a failed load can never crash the runtime: on error we roll
    // back to the state that was running before the load was staged.
    function installDefensiveLoader(rt) {
        const proto = Object.getPrototypeOf(rt);
        if (!proto || proto.__squidlyLoaderGuarded) {
            return;
        }
        let loadKey;
        for (const key of Object.getOwnPropertyNames(proto)) {
            if (typeof proto[key] !== "function") {
                continue;
            }
            const src = proto[key].toString();
            if (src.includes("c2save") && src.includes("JSON.parse") && !src.includes(SAVE_PREFIX)) {
                loadKey = key;
                break;
            }
        }
        if (!loadKey) {
            return;
        }
        const original = proto[loadKey];
        proto[loadKey] = function guardedLoad(jsonArg) {
            try {
                return original.call(this, jsonArg);
            } catch (error) {
                warn("Save load failed; rolling back to pre-load state.", error);
                if (state.loadBackupJson && jsonArg !== state.loadBackupJson) {
                    const backup = state.loadBackupJson;
                    state.loadBackupJson = null;
                    try {
                        // Re-run the loader synchronously with the known-good
                        // backup to restore a consistent instance set.
                        return original.call(this, backup);
                    } catch (rollbackError) {
                        warn("Rollback load also failed.", rollbackError);
                    }
                }
                return false;
            }
        };
        proto.__squidlyLoaderGuarded = true;
    }

    function initialise(rt) {
        state.runtime = rt;
        const { bindings, failures, probed } = resolveBindings(rt);
        state.bindings = bindings;
        state.failures = failures;
        state.probed = probed;
        state.operational = failures.length === 0;
        if (state.operational) {
            try {
                installDefensiveLoader(rt);
            } catch (error) {
                warn("Could not install defensive loader:", error);
            }
        }
        if (probed.length) {
            warn("Recovered bindings via probing:", probed.join(", "));
        }
        if (!state.operational) {
            warn("Bridge NOT operational; sync disabled, game continues locally.", failures);
        }
        for (const callback of state.readyCallbacks.splice(0)) {
            try {
                callback(state.operational);
            } catch (error) {
                warn("onReady callback failed:", error);
            }
        }
    }

    function runtimeHasRunningLayout(rt) {
        try {
            const defaultLayout = rt[defaultBindings.currentLayout];
            if (defaultLayout && typeof defaultLayout.name === "string") {
                return true;
            }
            const layoutsKey = probeLayoutsArray(rt);
            const currentKey = layoutsKey ? probeCurrentLayout(rt, layoutsKey) : undefined;
            return !!(currentKey && rt[currentKey] && typeof rt[currentKey].name === "string");
        } catch (_) {
            return false;
        }
    }

    function waitForRuntime() {
        const started = Date.now();
        const timer = setInterval(() => {
            let rt = null;
            try {
                rt = window.cr_getC2Runtime && window.cr_getC2Runtime();
            } catch (_) {
                rt = null;
            }
            // Wait until the runtime exists AND its first layout is running;
            // verifying earlier would mis-report the bindings as broken.
            if (rt && runtimeHasRunningLayout(rt)) {
                clearInterval(timer);
                initialise(rt);
                return;
            }
            if (Date.now() - started > 30000) {
                clearInterval(timer);
                state.failures = ["runtime: cr_getC2Runtime() did not become ready within 30s"];
                warn(state.failures[0]);
                for (const callback of state.readyCallbacks.splice(0)) {
                    callback(false);
                }
            }
        }, 100);
    }

    window.SquidlyC2Bridge = api;
    waitForRuntime();
})();
