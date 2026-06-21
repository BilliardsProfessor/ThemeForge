(function () {
  const drawerStates = new Set(["collapsed", "temporary", "pinned"]);
  const body = document.body;

  const leftDrawer = document.getElementById("leftDrawerPanel");
  const leftDrawerPinnedOpen = document.querySelector('[data-drawer-open-pinned="left"]');
  const leftDrawerClose = document.querySelector('[data-drawer-close="left"]');
  const leftDrawerModeToggle = document.querySelector('[data-drawer-mode-toggle="left"]');
  const leftDrawerPanelButtons = document.querySelectorAll("[data-drawer-panel]");
  const leftControlPanels = document.querySelectorAll("[data-control-panel]");
  const leftDrawerRail = document.querySelector(".drawer-rail-left");

  if (!leftDrawer || !leftDrawerPinnedOpen) {
    return;
  }

  function getLeftDrawerState() {
    const state = body.dataset.leftDrawerState;

    if (drawerStates.has(state)) {
      return state;
    }

    return "collapsed";
  }

  function setLeftDrawerState(state) {
    const nextState = drawerStates.has(state) ? state : "collapsed";
    const isOpen = nextState !== "collapsed";
    const isPinned = nextState === "pinned";

    body.dataset.leftDrawerState = nextState;

    leftDrawerPinnedOpen.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
      leftDrawer.removeAttribute("aria-hidden");
    } else {
      leftDrawer.setAttribute("aria-hidden", "true");
    }

    if (!leftDrawerModeToggle) {
      return;
    }

    leftDrawerModeToggle.setAttribute("aria-pressed", String(isPinned));

    if (isPinned) {
      leftDrawerModeToggle.setAttribute("aria-label", "Unlock drawer");
      leftDrawerModeToggle.dataset.tooltip = "Unlock drawer";
      return;
    }

    leftDrawerModeToggle.setAttribute("aria-label", "Lock drawer");
    leftDrawerModeToggle.dataset.tooltip = "Lock drawer";
  }

  function activatePanel(panelName) {
    if (!panelName) {
      return;
    }

    leftControlPanels.forEach(function (panel) {
      panel.open = panel.dataset.controlPanel === panelName;
    });
  }

  function openPinnedDrawer() {
    setLeftDrawerState("pinned");
  }

  function openTemporaryDrawer(panelName) {
    activatePanel(panelName);
    setLeftDrawerState("temporary");
  }

  function closeDrawer() {
    setLeftDrawerState("collapsed");
  }

  function toggleCurrentDrawerMode() {
    const currentState = getLeftDrawerState();

    if (currentState === "pinned") {
      setLeftDrawerState("temporary");
      return;
    }

    if (currentState === "temporary") {
      setLeftDrawerState("pinned");
      return;
    }

    setLeftDrawerState("pinned");
  }

  function handleDocumentClick(event) {
    if (getLeftDrawerState() !== "temporary") {
      return;
    }

    if (leftDrawer.contains(event.target)) {
      return;
    }

    if (leftDrawerRail && leftDrawerRail.contains(event.target)) {
      return;
    }

    closeDrawer();
  }

  function handleDocumentKeydown(event) {
    if (event.key !== "Escape") {
      return;
    }

    if (getLeftDrawerState() !== "temporary") {
      return;
    }

    closeDrawer();
  }

  leftDrawerPinnedOpen.addEventListener("click", openPinnedDrawer);

  leftDrawerPanelButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      openTemporaryDrawer(button.dataset.drawerPanel);
    });
  });

  if (leftDrawerClose) {
    leftDrawerClose.addEventListener("click", closeDrawer);
  }

  if (leftDrawerModeToggle) {
    leftDrawerModeToggle.addEventListener("click", toggleCurrentDrawerMode);
  }

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);

  setLeftDrawerState(getLeftDrawerState());
})();
