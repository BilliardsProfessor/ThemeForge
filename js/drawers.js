(function () {
    const drawerStates = new Set(["collapsed", "temporary", "pinned"]);
    const controlCardAnimationDuration = 260;
    const body = document.body;
    const drawerControllers = [];

    function getControlCardContent(panel) {
        return panel.querySelector(".control-card-content");
    }

    function openControlCard(panel) {
        const content = getControlCardContent(panel);

        if (!content) {
            panel.open = true;
            return;
        }

        if (panel.open && !panel.classList.contains("is-collapsing")) {
            return;
        }

        panel.classList.remove("is-collapsing");
        panel.classList.add("is-opening");
        panel.open = true;

        content.style.height = "0px";
        content.style.opacity = "0";

        requestAnimationFrame(function () {
            content.style.height = content.scrollHeight + "px";
            content.style.opacity = "1";
        });

        window.setTimeout(function () {
            if (!panel.open) {
                return;
            }

            panel.classList.remove("is-opening");
            content.style.height = "";
            content.style.opacity = "";
        }, controlCardAnimationDuration);
    }

    function closeControlCard(panel) {
        const content = getControlCardContent(panel);

        if (!content) {
            panel.open = false;
            return;
        }

        if (!panel.open || panel.classList.contains("is-collapsing")) {
            return;
        }

        panel.classList.add("is-collapsing");
        content.style.height = content.scrollHeight + "px";
        content.style.opacity = "1";

        requestAnimationFrame(function () {
            content.style.height = "0px";
            content.style.opacity = "0";
        });

        window.setTimeout(function () {
            panel.open = false;
            panel.classList.remove("is-collapsing");
            content.style.height = "";
            content.style.opacity = "";
        }, controlCardAnimationDuration);
    }

    function createDrawerController(options) {
        const side = options.side;
        const drawer = options.drawer;
        const rail = options.rail;
        const defaultState = options.defaultState || "collapsed";
        const defaultWidth = options.defaultWidth || 400;
        const minWidth = options.minWidth || 280;
        const maxWidth = options.maxWidth || 640;
        const minimumWorkspaceWidth = options.minimumWorkspaceWidth || 320;

        const stateStorageKey = `themeForge.${side}DrawerState`;
        const widthStorageKey = `themeForge.${side}DrawerWidth`;
        const stateDatasetKey = `${side}DrawerState`;
        const widthProperty = `--${side}-drawer-width`;

        const pinnedOpenButton = document.querySelector(`[data-drawer-open-pinned="${side}"]`);
        const closeButton = drawer?.querySelector(`[data-drawer-close="${side}"]`);
        const modeToggle = drawer?.querySelector(`[data-drawer-mode-toggle="${side}"]`);
        const resizeHandle = drawer?.querySelector(`[data-drawer-resize-handle="${side}"]`);

        let activeResize = null;

        if (!drawer || !pinnedOpenButton) {
            return null;
        }

        function parseWidth(value) {
            const parsedValue = Number.parseInt(value, 10);

            return Number.isNaN(parsedValue) ? null : parsedValue;
        }

        function getState() {
            const savedState = localStorage.getItem(stateStorageKey);
            const bodyState = body.dataset[stateDatasetKey];

            if (drawerStates.has(savedState)) {
                return savedState;
            }

            if (drawerStates.has(bodyState)) {
                return bodyState;
            }

            return defaultState;
        }

        function getPreferredWidth() {
            return parseWidth(localStorage.getItem(widthStorageKey)) || defaultWidth;
        }

        function getAvailableMaximumWidth() {
            const appShell = drawer.closest(".app-shell");
            const shellWidth = appShell?.getBoundingClientRect().width || window.innerWidth;

            const totalRailWidth = Array.from(appShell?.querySelectorAll(".drawer-rail") || []).reduce(function (total, drawerRail) {
                return total + drawerRail.getBoundingClientRect().width;
            }, 0);

            const oppositeSide = side === "left" ? "right" : "left";
            const bodyStyles = window.getComputedStyle(body);
            const oppositeDockWidth = parseWidth(bodyStyles.getPropertyValue(`--${oppositeSide}-drawer-dock-width`)) || 0;

            const availableWidth = shellWidth - totalRailWidth - oppositeDockWidth - minimumWorkspaceWidth;

            return Math.max(minWidth, Math.min(maxWidth, availableWidth));
        }

        function clampWidth(width) {
            const parsedWidth = parseWidth(width) || defaultWidth;

            return Math.round(Math.min(Math.max(parsedWidth, minWidth), getAvailableMaximumWidth()));
        }

        function applyWidth(width, options) {
            const shouldStore = options?.store !== false;
            const nextWidth = clampWidth(width);

            document.documentElement.style.setProperty(widthProperty, `${nextWidth}px`);

            if (shouldStore) {
                localStorage.setItem(widthStorageKey, String(nextWidth));
            }
        }

        function setState(state) {
            const nextState = drawerStates.has(state) ? state : "collapsed";
            const isOpen = nextState !== "collapsed";
            const isPinned = nextState === "pinned";

            body.dataset[stateDatasetKey] = nextState;
            localStorage.setItem(stateStorageKey, nextState);

            pinnedOpenButton.setAttribute("aria-expanded", String(isOpen));

            if (isOpen) {
                drawer.removeAttribute("aria-hidden");
            } else {
                drawer.setAttribute("aria-hidden", "true");
            }

            if (!modeToggle) {
                return;
            }

            modeToggle.setAttribute("aria-pressed", String(isPinned));

            if (isPinned) {
                modeToggle.setAttribute("aria-label", "Unlock drawer");
                modeToggle.dataset.tooltip = "Unlock drawer";
                return;
            }

            modeToggle.setAttribute("aria-label", "Lock drawer");
            modeToggle.dataset.tooltip = "Lock drawer";
        }

        function activatePanel(panelName) {
            if (!panelName) {
                return;
            }

            drawer.querySelectorAll("[data-control-panel]").forEach(function (panel) {
                if (panel.dataset.controlPanel === panelName) {
                    openControlCard(panel);
                    return;
                }

                closeControlCard(panel);
            });
        }

        function activatePanelImmediately(panelName) {
            drawer.querySelectorAll("[data-control-panel]").forEach(function (panel) {
                const content = getControlCardContent(panel);

                panel.classList.remove("is-opening", "is-collapsing");

                if (content) {
                    content.style.height = "";
                    content.style.opacity = "";
                }

                panel.open = panel.dataset.controlPanel === panelName;
            });
        }

        function getControlCardSummaryHeight(panel) {
            const summary = panel.querySelector("summary");

            return summary?.offsetHeight + 10 || 0;
        }

        function scrollPanelToTop(panelName, behavior = "smooth") {
            const drawerContent = drawer.querySelector(".drawer-content");
            const panel = drawer.querySelector(`[data-control-panel="${panelName}"]`);

            if (!drawerContent || !panel) {
                return;
            }

            window.setTimeout(
                function () {
                    drawerContent.scrollTo({
                        top: panel.offsetTop - getControlCardSummaryHeight(panel),
                        behavior,
                    });
                },
                behavior === "auto" ? 0 : controlCardAnimationDuration,
            );
        }

        function close() {
            setState("collapsed");
        }

        function togglePinned() {
            if (getState() === "collapsed") {
                setState("pinned");
                return;
            }

            close();
        }

        function toggleMode() {
            const currentState = getState();

            if (currentState === "pinned") {
                setState("temporary");
                return;
            }

            setState("pinned");
        }

        function openPanelFromRail(panelName) {
            const currentState = getState();

            if (currentState === "collapsed") {
                activatePanelImmediately(panelName);
                scrollPanelToTop(panelName, "auto");

                window.setTimeout(function () {
                    setState("temporary");
                }, 100);

                return;
            }

            activatePanel(panelName);
            scrollPanelToTop(panelName, "smooth");

            if (currentState !== "pinned") {
                setState("temporary");
            }
        }

        function handleDrawerClick(event) {
            const summary = event.target.closest("summary");

            if (summary && drawer.contains(summary)) {
                const panel = summary.closest("[data-control-panel]");

                if (!panel) {
                    return;
                }

                event.preventDefault();

                if (panel.open) {
                    closeControlCard(panel);
                    return;
                }

                openControlCard(panel);
            }
        }

        function handleRailClick(event) {
            const panelButton = event.target.closest("[data-drawer-panel]");

            if (!panelButton || !rail || !rail.contains(panelButton)) {
                return;
            }

            openPanelFromRail(panelButton.dataset.drawerPanel);
        }

        function containsEvent(event) {
            const eventPath = event.composedPath();

            return eventPath.includes(drawer) || eventPath.includes(pinnedOpenButton) || (rail && eventPath.includes(rail));
        }

        function handleOutsideClick(event) {
            if (getState() !== "temporary") {
                return;
            }

            if (!containsEvent(event)) {
                close();
            }
        }

        function handleEscape() {
            if (getState() === "temporary") {
                close();
            }
        }

        function beginResize(event) {
            activeResize = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startWidth: drawer.getBoundingClientRect().width,
            };

            body.classList.add("is-resizing-drawer");
            resizeHandle.setPointerCapture(event.pointerId);
            event.preventDefault();
        }

        function updateResize(event) {
            if (!activeResize) {
                return;
            }

            const deltaX = event.clientX - activeResize.startX;
            const widthDelta = side === "left" ? deltaX : deltaX * -1;

            applyWidth(activeResize.startWidth + widthDelta, { store: false });
        }

        function endResize(event) {
            if (!activeResize) {
                return;
            }

            if (resizeHandle.hasPointerCapture(activeResize.pointerId)) {
                resizeHandle.releasePointerCapture(activeResize.pointerId);
            }

            localStorage.setItem(widthStorageKey, String(Math.round(drawer.getBoundingClientRect().width)));

            activeResize = null;
            body.classList.remove("is-resizing-drawer");
        }

        function handleViewportResize() {
            if (activeResize) {
                return;
            }

            applyWidth(getPreferredWidth(), {
                store: false,
            });
        }

        pinnedOpenButton.addEventListener("click", togglePinned);
        drawer.addEventListener("click", handleDrawerClick);

        if (rail) {
            rail.addEventListener("click", handleRailClick);
        }

        if (closeButton) {
            closeButton.addEventListener("click", close);
        }

        if (modeToggle) {
            modeToggle.addEventListener("click", toggleMode);
        }

        if (resizeHandle) {
            resizeHandle.addEventListener("pointerdown", beginResize);
            resizeHandle.addEventListener("pointermove", updateResize);
            resizeHandle.addEventListener("pointerup", endResize);
            resizeHandle.addEventListener("pointercancel", endResize);
        }

        window.addEventListener("resize", handleViewportResize);

        applyWidth(getPreferredWidth(), {
            store: false,
        });
        setState(getState());

        return {
            side,
            drawer,
            rail,
            getState,
            setState,
            close,
            handleOutsideClick,
            handleEscape,
        };
    }

    const leftDrawerController = createDrawerController({
        side: "left",
        drawer: document.getElementById("leftDrawer"),
        rail: document.querySelector(".drawer-rail-left"),
        defaultState: "pinned",
        defaultWidth: 400,
        minWidth: 280,
        maxWidth: 640,
        minimumWorkspaceWidth: 320,
    });

    if (leftDrawerController) {
        drawerControllers.push(leftDrawerController);
    }

    const rightDrawerController = createDrawerController({
        side: "right",
        drawer: document.getElementById("rightDrawer"),
        rail: document.querySelector(".drawer-rail-right"),
        defaultState: "collapsed",
        defaultWidth: 360,
        minWidth: 280,
        maxWidth: 640,
        minimumWorkspaceWidth: 320,
    });

    if (rightDrawerController) {
        drawerControllers.push(rightDrawerController);
    }

    document.addEventListener("click", function (event) {
        drawerControllers.forEach(function (controller) {
            controller.handleOutsideClick(event);
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") {
            return;
        }

        drawerControllers.forEach(function (controller) {
            controller.handleEscape();
        });
    });

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            body.classList.remove("drawer-is-initializing");
        });
    });
})();
