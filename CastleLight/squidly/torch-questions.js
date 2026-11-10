/*
 * Torch questions for Castle Light (therapy modes), following the Dress the
 * Monster "open" mode.
 *
 *   Free mode: the game plays exactly as before.
 *   Open mode: whenever EITHER player lights a torch (collects a key), both
 *              games freeze exactly where they are (the C2 runtime is
 *              suspended) and a question popup appears. The clinician (host)
 *              asks any question; the participant can point at 1 / 2 / 3 or
 *              answer out loud. The host marks it Correct (popup closes, the
 *              game resumes) or Try again (another attempt).
 *
 * The host picks the mode with the button left of the torch HUD. It is synced
 * to the participant and remembered across levels and reloads.
 *
 * One shared document (castle-light/v1/question) carries the mode and the
 * current question. Questions have a unique id and a revision, and the doc
 * is re-sent periodically, so lost, late or crossing writes converge.
 */
(function () {
    "use strict";

    const QUESTION_KEY = "castle-light/v1/question";
    const MODE_STORAGE_KEY = "castle-light/question-mode";
    const MODES = ["free", "open"];
    const MODE_LABELS = { free: "Mode: Free", open: "Mode: Open" };
    const OPTIONS = ["1", "2", "3"];
    const POLL_MS = 50;
    const REPUBLISH_MS = 2500;
    const CORRECT_CLOSE_MS = 1200;
    const PENDING_DELAY_MS = 600;
    const RESIZE_REDRAW_MS = 60;
    // The torch HUD (keyhud) spans game x 728-986 centred on y 65; the mode
    // button sits just to its left.
    const MODE_BUTTON = { right: 716, centerY: 65, height: 60 };
    const HINTS = {
        host: "Ask your question, then mark the answer.",
        client: "Tap a number, or say your answer.",
        again: "Not quite - have another go!",
        correct: "Correct! Well done!"
    };

    let bridge = null;
    let sync = null;
    let started = false;
    let role = "host";
    let mode = readStoredMode();
    let question = null;
    let frozen = false;
    let qCounter = 0;
    let watchedLayout = null;
    let presentKeys = new Map();      // key instance uid -> original "x,y"
    let lastPublishAt = 0;
    let closeTimer = 0;
    let pendingTimer = 0;
    let resizeTimer = 0;
    const handledTorches = new Set(); // "layout|x,y" torches already lit this run
    const resolvedQids = new Set();
    const pending = [];               // torches lit while another question was open
    const ui = {};
    const accessTargets = [];

    function readStoredMode() {
        try {
            const stored = localStorage.getItem(MODE_STORAGE_KEY);
            return MODES.includes(stored) ? stored : "free";
        } catch (_) {
            return "free";
        }
    }

    function storeMode() {
        try {
            localStorage.setItem(MODE_STORAGE_KEY, mode);
        } catch (_) {
            // The mode still applies for this session.
        }
    }

    // ---------- freeze (C2 runtime suspension) ----------

    function isDocHidden() {
        return !!(document.hidden || document.mozHidden || document.webkitHidden || document.msHidden);
    }

    function setFrozen(value) {
        if (frozen === value) {
            return;
        }
        frozen = value;
        if (typeof window.cr_setSuspended === "function") {
            window.cr_setSuspended(frozen || isDocHidden());
        }
    }

    // A resize clears the canvas, and a suspended runtime never redraws it.
    // Resume for a single tick (dt is reset to 0 on resume, so nothing moves)
    // to repaint the frozen scene behind the popup.
    function redrawFrozen() {
        resizeTimer = 0;
        if (frozen && !isDocHidden() && typeof window.cr_setSuspended === "function") {
            window.cr_setSuspended(false);
            window.cr_setSuspended(true);
        }
    }

    function onResize() {
        if (frozen) {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(redrawFrozen, RESIZE_REDRAW_MS);
        }
    }

    // ---------- UI ----------

    function el(tag, className, text) {
        const node = document.createElement(tag);
        node.className = className;
        if (text !== undefined) {
            node.textContent = text;
        }
        return node;
    }

    function button(className, text, onClick) {
        const node = el("button", className, text);
        node.type = "button";
        node.addEventListener("click", onClick);
        return node;
    }

    // The C2 Touch plugin listens for presses on the document; keep overlay
    // presses out of the game. Releases still propagate so a held move
    // button is let go normally.
    function shieldFromGame(node) {
        for (const type of ["pointerdown", "pointermove", "touchstart", "mousedown"]) {
            node.addEventListener(type, (event) => event.stopPropagation());
        }
    }

    function bindAccess(target, group, order, label, onActivate) {
        const proxy = document.createElement("access-button");
        proxy.className = "squidly-access-proxy";
        proxy.setAttribute("access-group", group);
        proxy.setAttribute("access-order", String(order));
        proxy.setAttribute("role", "button");
        proxy.setAttribute("aria-label", label);
        proxy.utteranceText = label;
        proxy.hidden = true;
        proxy.addEventListener("access-click", (event) => {
            event.preventDefault();
            onActivate();
        });
        proxy.addEventListener("click", (event) => {
            if (!window.customElements.get("access-button")) {
                event.preventDefault();
                onActivate();
            }
        });
        shieldFromGame(proxy);
        document.body.appendChild(proxy);
        accessTargets.push({ proxy, target });
    }

    function buildUi() {
        ui.modeButton = button("cl-mode-button", MODE_LABELS[mode], toggleMode);
        ui.modeButton.hidden = true;
        shieldFromGame(ui.modeButton);

        ui.scrim = el("div", "cl-question-scrim");
        ui.scrim.setAttribute("role", "dialog");
        ui.scrim.setAttribute("aria-modal", "true");
        ui.scrim.setAttribute("aria-labelledby", "cl-question-title");
        shieldFromGame(ui.scrim);
        const card = el("div", "cl-question-card");
        const header = el("div", "cl-question-header");
        const title = el("h2", "cl-question-title", "Your turn!");
        title.id = "cl-question-title";
        header.append(el("span", "cl-torch"), title, el("span", "cl-torch"));
        ui.hint = el("p", "cl-question-hint");
        ui.hint.setAttribute("aria-live", "polite");
        const answers = el("div", "cl-answers");
        ui.tiles = OPTIONS.map((label) => {
            const tile = button("cl-answer", label, () => selectOption(label));
            tile.dataset.option = label;
            tile.setAttribute("aria-label", "Option " + label);
            answers.appendChild(tile);
            return tile;
        });
        ui.controls = el("div", "cl-host-controls");
        ui.correct = button("cl-judge cl-judge-correct", "Correct", () => judge(true));
        ui.again = button("cl-judge cl-judge-again", "Try again", () => judge(false));
        ui.cancel = button("cl-judge cl-judge-cancel", "Cancel", cancelQuestion);
        ui.controls.append(ui.correct, ui.again, ui.cancel);
        card.append(header, ui.hint, answers, ui.controls);
        ui.scrim.appendChild(card);
        document.body.append(ui.scrim, ui.modeButton);

        bindAccess(ui.modeButton, "game-controls", 1, "Change mode", toggleMode);
        ui.tiles.forEach((tile, index) => {
            bindAccess(tile, "question-answers", index + 1, "Option " + OPTIONS[index], () => selectOption(OPTIONS[index]));
        });
        bindAccess(ui.correct, "host-judge", 1, "Mark correct", () => judge(true));
        bindAccess(ui.again, "host-judge", 2, "Try again", () => judge(false));
        bindAccess(ui.cancel, "host-judge", 3, "Cancel question", cancelQuestion);
    }

    // Only on the live level screen: never over Level Complete / Game Over
    // (state "win"/"lose") or while the knight is dying (no hearts left).
    function onLevelScreen() {
        if (!bridge.isOperational() || !bridge.isGameplayLayout()) {
            return false;
        }
        const globals = bridge.getGlobals();
        return globals.state !== "win" && globals.state !== "lose" && Number(globals.PlayerHeart) > 0;
    }

    function layoutModeButton() {
        const show = role === "host" && onLevelScreen();
        ui.modeButton.hidden = !show;
        if (!show) {
            return;
        }
        const rect = bridge.getGameRect();
        const height = MODE_BUTTON.height * rect.scale;
        const anchor = bridge.gameToClient(MODE_BUTTON.right, MODE_BUTTON.centerY);
        Object.assign(ui.modeButton.style, {
            height: height + "px",
            fontSize: Math.max(11, height * 0.4) + "px",
            top: (anchor.y - height / 2) + "px",
            right: (window.innerWidth - anchor.x) + "px"
        });
    }

    function refreshAccess() {
        const scrimOpen = ui.scrim.classList.contains("open");
        for (const { proxy, target } of accessTargets) {
            const visible = !target.closest("[hidden]") && !target.disabled &&
                (!ui.scrim.contains(target) || scrimOpen);
            proxy.hidden = !visible;
            proxy.setAttribute("aria-hidden", visible ? "false" : "true");
            if (visible) {
                const rect = target.getBoundingClientRect();
                Object.assign(proxy.style, {
                    left: rect.left + "px",
                    top: rect.top + "px",
                    width: rect.width + "px",
                    height: rect.height + "px"
                });
            }
        }
    }

    function isOpen() {
        return !!question && question.status === "open";
    }

    // Judging is the clinician's job; a player alone (no partner connected)
    // can always judge so a question can never lock the game.
    function canJudge() {
        return role === "host" || !sync.isPartnerAlive();
    }

    function render() {
        const open = isOpen();
        ui.scrim.classList.toggle("open", open);
        if (!open) {
            return;
        }
        const judged = question.judged === "correct";
        for (const tile of ui.tiles) {
            const option = tile.dataset.option;
            const isSelected = question.selected === option;
            tile.classList.toggle("selected", isSelected && !judged);
            tile.classList.toggle("correct", isSelected && judged);
            tile.classList.toggle("incorrect", question.wrong.includes(option));
            tile.disabled = judged;
        }
        let hint = canJudge() ? HINTS.host : HINTS.client;
        if (judged) {
            hint = HINTS.correct;
        } else if (question.tries > 0) {
            hint = HINTS.again;
        }
        ui.hint.textContent = hint;
        ui.controls.hidden = judged || !canJudge();
    }

    // ---------- questions ----------

    function publish(questionState) {
        lastPublishAt = Date.now();
        sync.publishShared(QUESTION_KEY, { role, mode, question: questionState === undefined ? question : questionState });
    }

    function newQuestion(torch, layout) {
        qCounter += 1;
        return {
            qid: Date.now() + "-" + sync.getActorId() + "-" + qCounter,
            torch,
            layout,
            status: "open",
            rev: 1,
            selected: null,
            wrong: [],
            tries: 0,
            judged: null
        };
    }

    function openQuestion(next, local) {
        clearTimeout(closeTimer);
        closeTimer = 0;
        question = next;
        handledTorches.add(next.torch);
        setFrozen(true);
        render();
        ui.tiles[0].focus({ preventScroll: true });
        if (local) {
            publish();
        }
    }

    function closeQuestion(local) {
        if (!isOpen()) {
            return;
        }
        clearTimeout(closeTimer);
        closeTimer = 0;
        question = Object.assign({}, question, { status: "closed", rev: question.rev + 1 });
        resolvedQids.add(question.qid);
        setFrozen(false);
        render();
        if (local) {
            publish();
        }
        if (pending.length) {
            clearTimeout(pendingTimer);
            pendingTimer = setTimeout(askPending, PENDING_DELAY_MS);
        }
    }

    function askPending() {
        pendingTimer = 0;
        if (!isOpen() && pending.length) {
            openQuestion(newQuestion(pending.shift(), watchedLayout), true);
        }
    }

    function mutate(changes) {
        question = Object.assign({}, question, changes, { rev: question.rev + 1 });
        render();
        publish();
    }

    function selectOption(option) {
        if (!isOpen() || question.judged || question.selected === option) {
            return;
        }
        mutate({ selected: option, wrong: [] });
    }

    function judge(isCorrect) {
        if (!isOpen() || question.judged || !canJudge()) {
            return;
        }
        if (isCorrect) {
            mutate({ judged: "correct" });
            closeTimer = setTimeout(() => closeQuestion(true), CORRECT_CLOSE_MS);
            return;
        }
        const wrong = question.selected && !question.wrong.includes(question.selected)
            ? question.wrong.concat(question.selected)
            : question.wrong;
        mutate({ wrong, selected: null, tries: question.tries + 1 });
    }

    function cancelQuestion() {
        if (isOpen() && canJudge()) {
            closeQuestion(true);
        }
    }

    function onTorchLit(torch, layout) {
        if (handledTorches.has(torch)) {
            return;
        }
        handledTorches.add(torch);
        if (mode !== "open") {
            return;
        }
        if (isOpen()) {
            pending.push(torch);
            return;
        }
        openQuestion(newQuestion(torch, layout), true);
    }

    function enterLayout(layout) {
        watchedLayout = layout;
        presentKeys = new Map();
        handledTorches.clear();
        pending.length = 0;
        closeQuestion(true);
    }

    function torchLoop() {
        if (!bridge.isOperational() || !bridge.isGameplayLayout()) {
            if (watchedLayout !== null) {
                enterLayout(null);
            }
            return;
        }
        const layout = bridge.getLayoutName();
        // Keys are tracked by instance uid with the position they were first
        // seen at: the partner's torch is collected locally by MOVING the
        // key onto the knight, which must not look like a new torch.
        const present = new Map();
        for (const key of bridge.getKeyStates()) {
            present.set(key.uid, presentKeys.has(key.uid) ? presentKeys.get(key.uid) : key.key);
        }
        if (layout !== watchedLayout) {
            enterLayout(layout);
        } else if (!sync.isApplyingRemote()) {
            for (const [uid, pos] of presentKeys) {
                if (!present.has(uid)) {
                    onTorchLit(layout + "|" + pos, layout);
                }
            }
            // A torch that comes back (level restart) can be lit - and asked - again.
            for (const [uid, pos] of present) {
                if (!presentKeys.has(uid)) {
                    handledTorches.delete(layout + "|" + pos);
                }
            }
        }
        presentKeys = present;
    }

    // ---------- mode ----------

    function setMode(next, local) {
        mode = next;
        storeMode();
        ui.modeButton.textContent = MODE_LABELS[mode];
        ui.modeButton.setAttribute("aria-pressed", mode === "open" ? "true" : "false");
        if (mode === "free") {
            pending.length = 0;
            closeQuestion(local);
        }
        if (local) {
            publish();
        }
    }

    function toggleMode() {
        if (role === "host") {
            setMode(mode === "free" ? "open" : "free", true);
        }
    }

    // ---------- shared document ----------

    function sanitizeQuestion(raw) {
        if (!raw || typeof raw !== "object" || typeof raw.qid !== "string" || typeof raw.torch !== "string" ||
            typeof raw.layout !== "string" || (raw.status !== "open" && raw.status !== "closed") ||
            !isFinite(raw.rev)) {
            return null;
        }
        return {
            qid: raw.qid,
            torch: raw.torch,
            layout: raw.layout,
            status: raw.status,
            rev: Number(raw.rev),
            selected: OPTIONS.includes(raw.selected) ? raw.selected : null,
            wrong: Array.isArray(raw.wrong) ? raw.wrong.filter((option) => OPTIONS.includes(option)) : [],
            tries: Number(raw.tries) > 0 ? Number(raw.tries) : 0,
            judged: raw.judged === "correct" ? "correct" : null
        };
    }

    function onDoc(doc) {
        if (doc.role === "host" && role !== "host" && MODES.includes(doc.mode) && doc.mode !== mode) {
            setMode(doc.mode, false);
        }
        const remote = sanitizeQuestion(doc.question);
        if (!remote || !bridge.isOperational() || !bridge.isGameplayLayout() ||
            remote.layout !== bridge.getLayoutName()) {
            return;
        }
        if (remote.status === "closed") {
            resolvedQids.add(remote.qid);
            if (isOpen() && question.qid === remote.qid) {
                closeQuestion(false);
            }
            return;
        }
        // Stored docs replayed on subscribe may be left over from an old
        // session; only a partner who is here now can open a question.
        if (resolvedQids.has(remote.qid) || !sync.isPartnerAlive()) {
            return;
        }
        handledTorches.add(remote.torch);
        if (question && question.qid === remote.qid) {
            // Ties go to the host so simultaneous edits converge.
            if (remote.rev > question.rev || (remote.rev === question.rev && doc.role === "host" && role !== "host")) {
                question = remote;
                render();
            }
            return;
        }
        if (role === "host" && mode !== "open") {
            // The clinician switched to Free: decline the stale question.
            resolvedQids.add(remote.qid);
            publish(Object.assign({}, remote, { status: "closed", rev: remote.rev + 1 }));
            return;
        }
        if (isOpen()) {
            // Both players lit a torch at the same moment: the older question
            // wins on both sides and the other torch is asked straight after.
            if (remote.qid > question.qid) {
                return;
            }
            if (question.torch !== remote.torch && !pending.includes(question.torch)) {
                pending.unshift(question.torch);
            }
            resolvedQids.add(question.qid);
        }
        openQuestion(remote, false);
    }

    // ---------- loop / startup ----------

    function loop() {
        torchLoop();
        layoutModeButton();
        render();
        refreshAccess();
        if (Date.now() - lastPublishAt > REPUBLISH_MS && (role === "host" || isOpen()) && sync.isPartnerAlive()) {
            publish();
        }
    }

    function start() {
        role = sync.getRole();
        sync.onRole((nextRole) => {
            role = nextRole;
        });
        buildUi();
        setMode(mode, false);
        sync.onShared(QUESTION_KEY, onDoc);
        window.addEventListener("resize", onResize);
        setInterval(loop, POLL_MS);
        loop();
        if (role === "host") {
            publish();
        }
    }

    function boot() {
        bridge = window.SquidlyC2Bridge;
        sync = window.CastleLightSync;
        if (!bridge || !sync || typeof sync.onShared !== "function") {
            setTimeout(boot, 250);
            return;
        }
        bridge.onReady((operational) => {
            if (operational && !started) {
                started = true;
                start();
            }
        });
    }

    window.CastleLightQuestions = {
        isFrozen: () => frozen,
        getMode: () => mode,
        getQuestion: () => (question ? Object.assign({}, question, { wrong: question.wrong.slice() }) : null)
    };

    boot();
})();
