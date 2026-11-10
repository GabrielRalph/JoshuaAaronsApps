/*
 * Squidly transport diagnostics for Castle Light.
 *
 * Measures the REAL transport behaviour inside a Squidly session so sync
 * tuning is based on facts, not local simulations:
 *   - round-trip latency (ping/pong echo on a dedicated key)
 *   - player-stream packets received per second
 *   - own write rate (all keys)
 *   - age of the last received player packet
 *
 * Shows a small overlay (top-left). Remove this script tag from index.html
 * when tuning is finished.
 */
(function () {
    "use strict";

    const DIAG_KEY = "castle-light/v1/diag";
    const KNIGHT_KEYS = ["castle-light/v1/knight/host", "castle-light/v1/knight/client"];
    const PING_INTERVAL_MS = 2000;

    const actorTag = Math.random().toString(36).slice(2, 8);
    let rttMs = null;
    let rttHistory = [];
    let playerDocsReceived = 0;
    let playerInRate = 0;
    let lastPlayerDocAt = 0;
    let writesOut = 0;
    let writeRate = 0;

    function api() {
        return window.SquidlyAPI;
    }

    function startWhenReady() {
        if (!window.SquidlyAPI || !window.CastleLightSync) {
            setTimeout(startWhenReady, 200);
            return;
        }
        start();
    }

    function start() {
        // Count own writes (all keys) by wrapping firebaseSet.
        const origSet = api().firebaseSet.bind(api());
        api().firebaseSet = function (key, value) {
            writesOut += 1;
            return origSet(key, value);
        };

        // Count knight packets from the other side.
        for (const key of KNIGHT_KEYS) {
            api().firebaseOnValue(key, (value) => {
                try {
                    const raw = typeof value === "string" ? JSON.parse(value) : value;
                    if (raw && raw.actorId && raw.actorId !== window.CastleLightSync.getActorId()) {
                        playerDocsReceived += 1;
                        lastPlayerDocAt = Date.now();
                    }
                } catch (_) { /* ignore */ }
            });
        }

        // Ping/pong echo for RTT (no clock sync needed: sender measures).
        api().firebaseOnValue(DIAG_KEY, (value) => {
            let doc;
            try {
                doc = typeof value === "string" ? JSON.parse(value) : value;
            } catch (_) {
                return;
            }
            if (!doc || doc.app !== "castle-light-diag") {
                return;
            }
            if (doc.kind === "ping" && doc.from !== actorTag) {
                origSet(DIAG_KEY, JSON.stringify({ app: "castle-light-diag", kind: "pong", from: actorTag, echoOf: doc.from, t: doc.t }));
            } else if (doc.kind === "pong" && doc.echoOf === actorTag) {
                const rtt = Date.now() - doc.t;
                rttHistory.push(rtt);
                if (rttHistory.length > 10) {
                    rttHistory.shift();
                }
                rttMs = Math.min(...rttHistory); // min filters echo-scheduling noise
            }
        });
        setInterval(() => {
            origSet(DIAG_KEY, JSON.stringify({ app: "castle-light-diag", kind: "ping", from: actorTag, t: Date.now() }));
        }, PING_INTERVAL_MS);

        // Rates over a 5s window.
        let lastPlayerCount = 0;
        let lastWriteCount = 0;
        setInterval(() => {
            playerInRate = (playerDocsReceived - lastPlayerCount) / 5;
            writeRate = (writesOut - lastWriteCount) / 5;
            lastPlayerCount = playerDocsReceived;
            lastWriteCount = writesOut;
        }, 5000);

        const overlay = document.createElement("div");
        overlay.id = "squidly-diag-overlay";
        Object.assign(overlay.style, {
            position: "fixed", left: "4px", top: "4px", zIndex: 99999,
            background: "rgba(0,0,0,.65)", color: "#9f9", padding: "4px 8px",
            font: "11px/1.5 monospace", borderRadius: "4px", pointerEvents: "none",
            whiteSpace: "pre"
        });
        document.body.appendChild(overlay);
        setInterval(() => {
            const sync = window.CastleLightSync;
            const age = lastPlayerDocAt ? Date.now() - lastPlayerDocAt : null;
            overlay.textContent =
                "role " + sync.getRole() +
                " | rtt " + (rttMs === null ? "?" : rttMs + "ms") +
                " | in " + playerInRate.toFixed(1) + "/s" +
                " | out " + writeRate.toFixed(1) + "/s" +
                " | pkt age " + (age === null ? "-" : (age > 9999 ? ">9s" : age + "ms"));
        }, 500);
        console.log("[CastleLightDiag] running; overlay top-left");
    }

    startWhenReady();
})();
