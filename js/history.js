ThemeForge.history = {
  undoStack: [],
  redoStack: [],
  maxItems: 50,
  continuousTimerId: null,
  continuousChangeLabel: null,
  continuousDelay: 650,
  holdDelay: 400,

  menu: {
    element: null,
    action: null,
    activeButton: null,
    activeItem: null,
    holdTimerId: null,
    pointerStarted: false,
    menuOpenedFromHold: false,
  },

  init() {
    this.menu.element = document.querySelector("#historyMenu");

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

    this.updateControls();
  },

  bindHistoryButton(selector, action) {
    const button = document.querySelector(selector);

    button.setAttribute("aria-haspopup", "menu");
    button.setAttribute("aria-expanded", "false");

    button.addEventListener("pointerdown", (event) => {
      this.onHistoryButtonPointerDown(event, action);
    });

    button.addEventListener("click", (event) => {
      event.preventDefault();
    });
  },

  recordChange(label) {
    this.pushUndoState(label);
    this.redoStack = [];
    this.updateControls();
  },

  recordContinuousChange(label) {
    if (this.continuousChangeLabel !== label) {
      this.pushUndoState(label);
      this.redoStack = [];
      this.continuousChangeLabel = label;
    }

    clearTimeout(this.continuousTimerId);

    this.continuousTimerId = setTimeout(() => {
      this.continuousChangeLabel = null;
    }, this.continuousDelay);

    this.updateControls();
  },

  pushUndoState(label) {
    this.undoStack.push({
      label,
      snapshot: this.cloneTheme(ThemeForge.theme),
    });

    if (this.undoStack.length > this.maxItems) {
      this.undoStack.shift();
    }
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

    this.menu.holdTimerId = setTimeout(() => {
      this.menu.menuOpenedFromHold = true;
      this.openMenu(action, button);
    }, this.holdDelay);
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

    clearTimeout(this.menu.holdTimerId);

    if (this.menu.menuOpenedFromHold) {
      if (this.menu.activeItem) {
        this.activateMenuItem(this.menu.activeItem);
      } else if (!this.isPointInsideMenu(event.clientX, event.clientY) && !this.isPointInsideButton(event.clientX, event.clientY)) {
        this.closeMenu();
      }

      this.resetPointerState();
      return;
    }

    if (this.menu.action === "undo") {
      this.undo();
    }

    if (this.menu.action === "redo") {
      this.redo();
    }

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
    if (event.key !== "Escape" || this.menu.element.hidden) {
      return;
    }

    this.closeMenu();
  },

  onMenuClick(event) {
    const menuItem = event.target.closest("[data-history-steps]");

    if (!menuItem) {
      return;
    }

    this.activateMenuItem(menuItem);
  },

  openMenu(action, button) {
    this.renderMenu(action);

    this.menu.element.hidden = false;
    this.menu.action = action;
    this.menu.activeButton = button;

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
    const title = action === "undo" ? "Undo" : "Redo";

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
      button.textContent = item.label;

      this.menu.element.append(button);
    });
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
  },

  resetPointerState() {
    this.menu.pointerStarted = false;
    this.menu.menuOpenedFromHold = false;
    this.menu.holdTimerId = null;
  },

  updateControls() {
    const undoButton = document.querySelector("#undoBtn");
    const redoButton = document.querySelector("#redoBtn");

    undoButton.disabled = !this.undoStack.length;
    redoButton.disabled = !this.redoStack.length;

    undoButton.setAttribute("aria-disabled", String(!this.undoStack.length));
    redoButton.setAttribute("aria-disabled", String(!this.redoStack.length));

    if (!this.undoStack.length && this.menu.action === "undo") {
      this.closeMenu();
    }

    if (!this.redoStack.length && this.menu.action === "redo") {
      this.closeMenu();
    }
  },
};
