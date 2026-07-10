ThemeForge.history = {
    undoStack: [],
    redoStack: [],
    maxItems: 50,
    storageKey: "themeForge.historySession",
    continuousTimerId: null,
    continuousChangeLabel: null,
    continuousDelay: 650,
    menuOpenDelay: 1000,
    menuCloseDelay: 150,

    menu: {
        element: null,
        action: null,
        activeButton: null,
        activeItem: null,
        openTimerId: null,
        closeTimerId: null,
        pointerStarted: false,
        menuOpenedFromHold: false,
        openedFrom: null,
    },

    init() {
        this.menu.element = document.querySelector("#historyMenu");

        this.restoreSession();

        this.bindHistoryButton("#undoBtn", "undo");
        this.bindHistoryButton("#redoBtn", "redo");

        document.addEventListener("pointermove", (event) => {
            this.onDocumentPointerMove(event);
        });

        document.addEventListener("pointerup", (event) => {
            this.onDocumentPointerUp(event);
        });

        document.addEventListener("pointerdown", (event) => {
            this.onDocumentPointerDown(event);
        });

        document.addEventListener("keydown", (event) => {
            this.onDocumentKeyDown(event);
        });

        this.menu.element.addEventListener("click", (event) => {
            this.onMenuClick(event);
        });

        this.menu.element.addEventListener("pointerenter", () => {
            this.cancelMenuClose();
        });

        this.menu.element.addEventListener("pointerleave", () => {
            if (this.menu.openedFrom === "hover") {
                this.scheduleMenuClose();
            }
        });

        this.updateControls();
    },

    bindHistoryButton(selector, action) {
        const button = document.querySelector(selector);

        button.setAttribute("aria-haspopup", "menu");
        button.setAttribute("aria-expanded", "false");

        button.addEventListener("pointerenter", (event) => {
            if (event.pointerType !== "mouse" || button.disabled) {
                return;
            }

            this.scheduleMenuOpen(action, button, "hover");
        });

        button.addEventListener("pointerleave", () => {
            this.cancelMenuOpen();

            if (this.menu.openedFrom === "hover") {
                this.scheduleMenuClose();
            }
        });

        button.addEventListener("pointerdown", (event) => {
            this.cancelMenuOpen();
            this.onHistoryButtonPointerDown(event, action);
        });

        button.addEventListener("keydown", (event) => {
            this.onHistoryButtonKeyDown(event, action);
        });

        button.addEventListener("click", (event) => {
            event.preventDefault();
        });
    },

    scheduleMenuOpen(action, button, openedFrom) {
        this.cancelMenuOpen();
        this.cancelMenuClose();

        this.menu.openTimerId = window.setTimeout(() => {
            this.openMenu(action, button, openedFrom);
        }, this.menuOpenDelay);
    },

    cancelMenuOpen() {
        window.clearTimeout(this.menu.openTimerId);
        this.menu.openTimerId = null;
    },

    scheduleMenuClose() {
        this.cancelMenuClose();

        this.menu.closeTimerId = window.setTimeout(() => {
            this.closeMenu();
        }, this.menuCloseDelay);
    },

    cancelMenuClose() {
        window.clearTimeout(this.menu.closeTimerId);
        this.menu.closeTimerId = null;
    },

    executeHistoryAction(action) {
        if (action === "undo") {
            this.undo();
        }

        if (action === "redo") {
            this.redo();
        }
    },

    onHistoryButtonKeyDown(event, action) {
        if (event.currentTarget.disabled || event.repeat) {
            return;
        }

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();

            this.openMenu(action, event.currentTarget, "keyboard");

            const menuItems = this.getMenuItems();
            const menuItem = event.key === "ArrowDown" ? menuItems[0] : menuItems.at(-1);

            menuItem?.focus();
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.closeMenu();
            this.executeHistoryAction(action);
        }
    },

    getMenuItems() {
        return [...this.menu.element.querySelectorAll("[role='menuitem']")];
    },

    restoreSession() {
        const savedSession = sessionStorage.getItem(this.storageKey);

        if (!savedSession) {
            return;
        }

        try {
            const session = JSON.parse(savedSession);

            ThemeForge.theme = ThemeForge.normalizeTheme(session.theme);
            this.undoStack = Array.isArray(session.undoStack) ? session.undoStack : [];
            this.redoStack = Array.isArray(session.redoStack) ? session.redoStack : [];
        } catch {
            sessionStorage.removeItem(this.storageKey);
        }
    },

    saveSession() {
        sessionStorage.setItem(
            this.storageKey,
            JSON.stringify({
                theme: ThemeForge.theme,
                undoStack: this.undoStack,
                redoStack: this.redoStack,
            }),
        );
    },

    recordChange(label, detail = null, snapshot = null) {
        this.pushUndoState(label, detail, snapshot);
        this.redoStack = [];
        this.updateControls();
        this.saveSession();
    },

    recordContinuousChange(label, detail = null, snapshot = null) {
        if (this.continuousChangeLabel !== label) {
            this.pushUndoState(label, detail, snapshot);
            this.redoStack = [];
            this.continuousChangeLabel = label;
        }

        clearTimeout(this.continuousTimerId);

        this.continuousTimerId = setTimeout(() => {
            this.continuousChangeLabel = null;
        }, this.continuousDelay);

        this.updateControls();
    },

    pushUndoState(label, detail = null, snapshot = null) {
        this.undoStack.push({
            label,
            detail,
            snapshot: this.cloneTheme(snapshot || ThemeForge.theme),
        });

        if (this.undoStack.length > this.maxItems) {
            this.undoStack.shift();
        }
    },

    discardContinuousChange(label) {
        const latestItem = this.undoStack[this.undoStack.length - 1];

        if (!latestItem || latestItem.label !== label) {
            return;
        }

        this.undoStack.pop();
        this.clearContinuousChange();
        this.updateControls();
        this.saveSession();
    },

    themesMatch(firstTheme, secondTheme) {
        return JSON.stringify(firstTheme) === JSON.stringify(secondTheme);
    },

    updateLatestChangeDetail(detail) {
        const latestItem = this.undoStack[this.undoStack.length - 1];

        if (!latestItem) {
            return;
        }

        latestItem.detail = detail;
        this.saveSession();
    },

    getLatestUndoSnapshot() {
        const latestItem = this.undoStack[this.undoStack.length - 1];

        return latestItem ? latestItem.snapshot : null;
    },

    undo(steps = 1) {
        if (!this.undoStack.length) {
            return;
        }

        this.clearContinuousChange();

        let nextTheme = this.cloneTheme(ThemeForge.theme);

        for (let index = 0; index < steps && this.undoStack.length; index += 1) {
            const historyItem = this.undoStack.pop();

            this.redoStack.push({
                label: historyItem.label,
                detail: historyItem.detail,
                snapshot: nextTheme,
            });

            nextTheme = this.cloneTheme(historyItem.snapshot);
        }

        this.restoreTheme(nextTheme);
        this.updateControls();
    },

    redo(steps = 1) {
        if (!this.redoStack.length) {
            return;
        }

        this.clearContinuousChange();

        let nextTheme = this.cloneTheme(ThemeForge.theme);

        for (let index = 0; index < steps && this.redoStack.length; index += 1) {
            const historyItem = this.redoStack.pop();

            this.undoStack.push({
                label: historyItem.label,
                detail: historyItem.detail,
                snapshot: nextTheme,
            });

            if (this.undoStack.length > this.maxItems) {
                this.undoStack.shift();
            }

            nextTheme = this.cloneTheme(historyItem.snapshot);
        }

        this.restoreTheme(nextTheme);
        this.updateControls();
    },

    restoreTheme(snapshot) {
        ThemeForge.theme = this.cloneTheme(snapshot);
        ThemeForge.refreshThemeInterface();
        this.saveSession();
    },

    clearContinuousChange() {
        clearTimeout(this.continuousTimerId);
        this.continuousChangeLabel = null;
    },

    cloneTheme(theme) {
        if (typeof structuredClone === "function") {
            return structuredClone(theme);
        }

        return JSON.parse(JSON.stringify(theme));
    },

    getUndoItems() {
        return this.undoStack.slice().reverse();
    },

    getRedoItems() {
        return this.redoStack.slice().reverse();
    },

    onHistoryButtonPointerDown(event, action) {
        const button = event.currentTarget;

        if (event.button !== 0 || button.disabled) {
            return;
        }

        event.preventDefault();

        this.closeMenu();

        this.menu.pointerStarted = true;
        this.menu.menuOpenedFromHold = false;
        this.menu.action = action;
        this.menu.activeButton = button;
        this.menu.activeItem = null;

        if (button.setPointerCapture) {
            button.setPointerCapture(event.pointerId);
        }

        this.menu.openTimerId = window.setTimeout(() => {
            this.menu.menuOpenedFromHold = true;
            this.openMenu(action, button, "hold");
        }, this.menuOpenDelay);
    },

    onDocumentPointerMove(event) {
        if (!this.menu.menuOpenedFromHold || this.menu.element.hidden) {
            return;
        }

        const menuItem = this.getMenuItemFromPoint(event.clientX, event.clientY);

        this.setActiveMenuItem(menuItem);
    },

    onDocumentPointerUp(event) {
        if (!this.menu.pointerStarted) {
            return;
        }

        this.cancelMenuOpen();

        if (this.menu.menuOpenedFromHold) {
            if (this.menu.activeItem) {
                this.activateMenuItem(this.menu.activeItem);
            } else if (!this.isPointInsideMenu(event.clientX, event.clientY) && !this.isPointInsideButton(event.clientX, event.clientY)) {
                this.closeMenu();
            }

            this.resetPointerState();
            return;
        }

        this.executeHistoryAction(this.menu.action);

        this.resetPointerState();
    },

    onDocumentPointerDown(event) {
        if (this.menu.element.hidden) {
            return;
        }

        if (this.menu.element.contains(event.target) || event.target === this.menu.activeButton) {
            return;
        }

        this.closeMenu();
    },

    onDocumentKeyDown(event) {
        if (this.menu.element.hidden) {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();

            const activeButton = this.menu.activeButton;

            this.closeMenu();
            activeButton?.focus();
            return;
        }

        const menuItems = this.getMenuItems();
        const currentIndex = menuItems.indexOf(document.activeElement);

        if (!menuItems.length || currentIndex === -1) {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            menuItems[(currentIndex + 1) % menuItems.length].focus();
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            menuItems[(currentIndex - 1 + menuItems.length) % menuItems.length].focus();
        }

        if (event.key === "Home") {
            event.preventDefault();
            menuItems[0].focus();
        }

        if (event.key === "End") {
            event.preventDefault();
            menuItems.at(-1).focus();
        }
    },

    onMenuClick(event) {
        const menuItem = event.target.closest("[data-history-steps]");

        if (!menuItem) {
            return;
        }

        this.activateMenuItem(menuItem);
    },

    openMenu(action, button, openedFrom = null) {
        this.renderMenu(action);

        this.menu.element.hidden = false;
        this.menu.action = action;
        this.menu.activeButton = button;
        this.menu.openedFrom = openedFrom;
        this.cancelMenuOpen();
        this.cancelMenuClose();

        button.setAttribute("aria-expanded", "true");
        button.dataset.historyMenuOpen = "true";

        const buttonRect = button.getBoundingClientRect();
        const menuRect = this.menu.element.getBoundingClientRect();
        const viewportPadding = 8;

        const top = buttonRect.bottom + 6;
        const left = Math.min(Math.max(viewportPadding, buttonRect.left), window.innerWidth - menuRect.width - viewportPadding);

        this.menu.element.style.top = `${top}px`;
        this.menu.element.style.left = `${left}px`;
    },

    renderMenu(action) {
        const items = action === "undo" ? this.getUndoItems() : this.getRedoItems();
        const title = action === "undo" ? "UNDO" : "Redo";

        this.menu.element.textContent = "";

        const titleElement = document.createElement("div");
        titleElement.className = "history-menu-title";
        titleElement.textContent = title;
        this.menu.element.append(titleElement);

        if (!items.length) {
            const emptyElement = document.createElement("div");
            emptyElement.className = "history-menu-empty";
            emptyElement.textContent = `Nothing to ${action}`;
            this.menu.element.append(emptyElement);
            return;
        }

        items.forEach((item, index) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "history-menu-item";
            button.dataset.historyAction = action;
            button.dataset.historySteps = String(index + 1);
            button.setAttribute("role", "menuitem");

            this.renderMenuItemContent(button, item);

            this.menu.element.append(button);
        });
    },

    renderMenuItemContent(button, item) {
        if (!item.detail) {
            this.renderTextHistoryItem(button, item.label, "");
            return;
        }

        if (item.detail.type === "color") {
            this.renderColorHistoryItem(button, item.detail);
            return;
        }

        if (item.detail.type === "value") {
            this.renderTextHistoryItem(
                button,
                item.detail.label,
                `${this.formatHistoryValue(item.detail.before)} → ${this.formatHistoryValue(item.detail.after)}`,
            );
            return;
        }

        this.renderTextHistoryItem(button, item.label, "");
    },

    renderTextHistoryItem(button, labelText, detailText) {
        const label = document.createElement("span");
        const detail = document.createElement("span");

        label.className = "history-menu-item-label";
        label.textContent = labelText;

        detail.className = "history-menu-item-detail";
        detail.textContent = detailText;

        button.textContent = "";
        button.append(label, detail);
    },

    renderColorHistoryItem(button, detail) {
        const label = document.createElement("span");
        const value = document.createElement("span");
        const beforeSwatch = document.createElement("span");
        const arrow = document.createElement("span");
        const afterSwatch = document.createElement("span");

        label.className = "history-menu-item-label";
        label.textContent = detail.label;

        value.className = "history-menu-item-detail history-menu-color-detail";

        beforeSwatch.className = "history-menu-swatch";
        beforeSwatch.style.backgroundColor = this.formatColorDetail(detail.before);

        arrow.className = "history-menu-arrow";
        arrow.textContent = "→";

        afterSwatch.className = "history-menu-swatch";
        afterSwatch.style.backgroundColor = this.formatColorDetail(detail.after);

        value.append(beforeSwatch, arrow, afterSwatch);

        button.textContent = "";
        button.append(label, value);
        button.setAttribute("aria-label", `${detail.label}: ${this.formatColorDetail(detail.before)} to ${this.formatColorDetail(detail.after)}`);
    },

    formatHistoryValue(value) {
        const labels = {
            round: "Round",
            "superellipse(1)": "Round",
            squircle: "Squircle",
            bevel: "Bevel",
            notch: "Notch",
            scoop: "Scoop",
            square: "Square",
        };

        return labels[value] || value;
    },

    formatColorDetail(color) {
        return color.a === 1 ? `hsl(${color.h} ${color.s}% ${color.l}%)` : `hsl(${color.h} ${color.s}% ${color.l}% / ${ThemeForge.formatAlpha(color.a)})`;
    },

    activateMenuItem(menuItem) {
        const action = menuItem.dataset.historyAction;
        const steps = Number(menuItem.dataset.historySteps);

        this.closeMenu();

        if (action === "undo") {
            this.undo(steps);
        }

        if (action === "redo") {
            this.redo(steps);
        }
    },

    getMenuItemFromPoint(x, y) {
        const element = document.elementFromPoint(x, y);

        if (!element) {
            return null;
        }

        return element.closest("[data-history-steps]");
    },

    setActiveMenuItem(menuItem) {
        if (this.menu.activeItem === menuItem) {
            return;
        }

        if (this.menu.activeItem) {
            this.menu.activeItem.classList.remove("active");
        }

        this.menu.activeItem = menuItem;

        if (this.menu.activeItem) {
            this.menu.activeItem.classList.add("active");
        }
    },

    isPointInsideMenu(x, y) {
        const menuRect = this.menu.element.getBoundingClientRect();

        return x >= menuRect.left && x <= menuRect.right && y >= menuRect.top && y <= menuRect.bottom;
    },

    isPointInsideButton(x, y) {
        if (!this.menu.activeButton) {
            return false;
        }

        const buttonRect = this.menu.activeButton.getBoundingClientRect();

        return x >= buttonRect.left && x <= buttonRect.right && y >= buttonRect.top && y <= buttonRect.bottom;
    },

    closeMenu() {
        this.cancelMenuOpen();
        this.cancelMenuClose();
        if (this.menu.activeItem) {
            this.menu.activeItem.classList.remove("active");
        }

        if (this.menu.activeButton) {
            delete this.menu.activeButton.dataset.historyMenuOpen;
            this.menu.activeButton.setAttribute("aria-expanded", "false");
        }

        this.menu.element.hidden = true;
        this.menu.element.style.top = "";
        this.menu.element.style.left = "";
        this.menu.action = null;
        this.menu.activeButton = null;
        this.menu.activeItem = null;
        this.menu.openedFrom = null;
    },

    resetPointerState() {
        this.menu.pointerStarted = false;
        this.menu.menuOpenedFromHold = false;
        this.menu.openTimerId = null;
    },

    updateControls() {
        const undoButton = document.querySelector("#undoBtn");
        const redoButton = document.querySelector("#redoBtn");
        const undoDisabled = !this.undoStack.length;
        const redoDisabled = !this.redoStack.length;

        undoButton.disabled = undoDisabled;
        redoButton.disabled = redoDisabled;

        undoButton.setAttribute("aria-disabled", String(undoDisabled));
        redoButton.setAttribute("aria-disabled", String(redoDisabled));

        undoButton.dataset.tooltip = undoDisabled ? "Undo is unavailable" : "";
        redoButton.dataset.tooltip = redoDisabled ? "Redo is unavailable" : "";

        undoButton.classList.toggle("has-tooltip", undoDisabled);
        redoButton.classList.toggle("has-tooltip", redoDisabled);

        undoButton.setAttribute("aria-label", undoDisabled ? "No undo available" : "Undo");
        redoButton.setAttribute("aria-label", redoDisabled ? "No redo available" : "Redo");

        if (undoDisabled && this.menu.action === "undo") {
            this.closeMenu();
        }

        if (redoDisabled && this.menu.action === "redo") {
            this.closeMenu();
        }
    },
};
