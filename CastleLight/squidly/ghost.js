/*
 * Partner ghost overlay for Castle Light (parallel play).
 *
 * Each player plays their own fully-local game; this renders the OTHER
 * player's knight as a translucent, blue-tinted ghost using the game's real
 * sprite animations. Display only - it never touches the local simulation.
 *
 * Rendering strategy: a constantly-bouncing character cannot be replicated
 * from a low-rate network stream without looking mushy, so the stream only
 * drives the ghost's GROUND position (where the partner is), while the hop
 * and the walk cycle are animated locally at full frame rate. The result is
 * fluid motion that stays glued to the partner's true location.
 */
(function () {
    "use strict";

    // Real sprite frames extracted from the export's data.js (type t14).
    // The ghost renders the knight's iconic Idle pose (knight holding torch)
    // as a single consistent frame - no animation swapping, so it never looks
    // like it "changes character". It hops locally and faces the move way.
    const SHEETS = {
        "boy1idle-sheet0.png": { w: 256, h: 256 }
    };
    const KNIGHT_FRAME = { s: "boy1idle-sheet0.png", x: 1, y: 1, w: 100, h: 83 };

    const STALE_MS = 4000;
    const EXTRAPOLATE_MAX_S = 0.4; // horizontal only: walking is linear
    const X_EASE = 0.3;            // per-frame easing toward the target x
    const GROUND_EASE = 0.22;      // per-frame easing of the ground level
    const GROUND_WINDOW_MS = 1400; // ground = max y seen over this window
    const HOP_HEIGHT = 115;        // game px, matches the knight's auto-bounce
    const HOP_PERIOD_MS = 760;
    const Y_MIN = 60;
    const Y_MAX = 700;

    let bridge = null;
    let sync = null;
    let ghost = null;
    let label = null;
    let shown = false;
    let displayX = null;
    let groundY = null;
    let facing = 1;
    let currentFrameKey = "";
    const groundSamples = []; // {y, at}

    function ensureElements() {
        if (ghost) {
            return;
        }
        ghost = document.createElement("div");
        ghost.id = "squidly-partner-ghost";
        Object.assign(ghost.style, {
            position: "fixed",
            left: "0px",
            top: "0px",
            backgroundRepeat: "no-repeat",
            opacity: "0.6",
            filter: "drop-shadow(0 0 6px rgba(120,190,255,.85))",
            pointerEvents: "none",
            zIndex: 9000,
            display: "none",
            willChange: "transform"
        });
        label = document.createElement("div");
        Object.assign(label.style, {
            position: "absolute",
            left: "50%",
            top: "-15px",
            transform: "translateX(-50%)",
            font: "bold 11px/1 sans-serif",
            color: "#aad4ff",
            textShadow: "0 0 4px #003",
            whiteSpace: "nowrap"
        });
        ghost.appendChild(label);
        document.body.appendChild(ghost);
    }

    function hide() {
        if (shown && ghost) {
            ghost.style.display = "none";
            shown = false;
            displayX = null;
            groundY = null;
            groundSamples.length = 0;
        }
    }

    function applyFrame(frameDef, scale, flip) {
        const key = frameDef.s + ":" + frameDef.x + ":" + frameDef.y + ":" + scale.toFixed(3) + ":" + flip;
        if (key === currentFrameKey) {
            return;
        }
        currentFrameKey = key;
        const sheet = SHEETS[frameDef.s];
        ghost.style.width = frameDef.w * scale + "px";
        ghost.style.height = frameDef.h * scale + "px";
        ghost.style.backgroundImage = "url(images/" + frameDef.s + ")";
        ghost.style.backgroundSize = sheet.w * scale + "px " + sheet.h * scale + "px";
        ghost.style.backgroundPosition = (-frameDef.x * scale) + "px " + (-frameDef.y * scale) + "px";
        label.style.transform = "translateX(-50%) scaleX(" + flip + ")";
    }

    function frame(now) {
        requestAnimationFrame(frame);
        const questions = window.CastleLightQuestions;
        if (questions && questions.isFrozen()) {
            return; // Torch question open: the ghost freezes with the game.
        }
        if (!bridge || !bridge.isOperational() || !sync) {
            hide();
            return;
        }
        const remote = sync.getRemoteKnight();
        if (!remote || !bridge.isGameplayLayout()) {
            hide();
            return;
        }
        const doc = remote.doc;
        const age = Date.now() - remote.receivedAt;
        if (age > STALE_MS || doc.layout !== bridge.getLayoutName() ||
            typeof doc.x !== "number" || typeof doc.y !== "number") {
            hide();
            return;
        }
        ensureElements();

        // --- horizontal: dead-reckon + ease (walking is linear) ---
        const aheadS = Math.min(age / 1000, EXTRAPOLATE_MAX_S);
        const targetX = doc.x + (doc.dx || 0) * aheadS;
        displayX = displayX === null ? targetX : displayX + (targetX - displayX) * X_EASE;

        // --- vertical: track the GROUND (max y in a bounce window) ---
        const nowMs = Date.now();
        if (groundSamples.length === 0 || groundSamples[groundSamples.length - 1].at !== remote.receivedAt) {
            groundSamples.push({ y: doc.y, at: remote.receivedAt });
        }
        while (groundSamples.length && groundSamples[0].at < nowMs - GROUND_WINDOW_MS) {
            groundSamples.shift();
        }
        let targetGround = doc.y;
        for (const sample of groundSamples) {
            targetGround = Math.max(targetGround, sample.y);
        }
        targetGround = Math.min(Y_MAX, Math.max(Y_MIN, targetGround));
        groundY = groundY === null ? targetGround : groundY + (targetGround - groundY) * GROUND_EASE;

        // --- local hop animation (the knight always auto-bounces) ---
        const hopPhase = (nowMs % HOP_PERIOD_MS) / HOP_PERIOD_MS;
        const hop = HOP_HEIGHT * Math.abs(Math.sin(hopPhase * Math.PI));
        const gameY = groundY - hop;

        // --- sprite selection ---
        if (Math.abs(doc.dx || 0) > 10) {
            facing = (doc.dx || 0) > 0 ? 1 : -1;
        }
        const rect = bridge.getGameRect();
        // One consistent knight frame always (no walk-cycle swapping).
        const frameDef = KNIGHT_FRAME;
        applyFrame(frameDef, rect.scale, facing);

        // --- place (hotspot is bottom-centre: game y = feet) ---
        const client = bridge.gameToClient(displayX, gameY);
        const w = frameDef.w * rect.scale;
        const h = frameDef.h * rect.scale;
        ghost.style.transform =
            "translate(" + (client.x - w / 2) + "px," + (client.y - h) + "px) scaleX(" + facing + ")";
        label.textContent = sync.getRole() === "host" ? "participant" : "host";
        if (!shown) {
            ghost.style.display = "block";
            shown = true;
        }
    }

    function startWhenReady() {
        bridge = window.SquidlyC2Bridge;
        sync = window.CastleLightSync;
        if (!bridge || !sync || !sync.getRemoteKnight) {
            setTimeout(startWhenReady, 250);
            return;
        }
        requestAnimationFrame(frame);
    }

    startWhenReady();
})();
