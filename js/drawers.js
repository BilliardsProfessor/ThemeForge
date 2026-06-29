(function () {
  const drawerStates = new Set(["collapsed", "temporary", "pinned"]);
  const body = document.body;
  const drawerStateStorageKey = "themeForge.leftDrawerState";

  const leftDrawer = document.getElementById("leftDrawer");
  const leftDrawerPinnedOpen = document.querySelector('[data-drawer-open-pinned="left"]');
  const leftDrawerClose = document.querySelector('[data-drawer-close="left"]');
  const leftDrawerModeToggle = document.querySelector('[data-drawer-mode-toggle="left"]');
  const controlCardAnimationDuration = 260;
  const leftDrawerRail = document.querySelector(".drawer-rail-left");

  if (!leftDrawer || !leftDrawerPinnedOpen) {
    return;
  }

  function getLeftDrawerState() {
    const savedState = localStorage.getItem(drawerStateStorageKey);
    const bodyState = body.dataset.leftDrawerState;

    if (drawerStates.has(savedState)) {
      return savedState;
    }

    if (drawerStates.has(bodyState)) {
      return bodyState;
    }

    return "pinned";
  }

  function setLeftDrawerState(state) {
    const nextState = drawerStates.has(state) ? state : "collapsed";
    const isOpen = nextState !== "collapsed";
    const isPinned = nextState === "pinned";

    body.dataset.leftDrawerState = nextState;
    localStorage.setItem(drawerStateStorageKey, nextState);

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

  function activatePanel(panelName) {
    if (!panelName) {
      return;
    }

    document.querySelectorAll("[data-control-panel]").forEach(function (panel) {
      if (panel.dataset.controlPanel === panelName) {
        openControlCard(panel);
        return;
      }

      closeControlCard(panel);
    });
  }

  function togglePinnedDrawer() {
    const currentState = getLeftDrawerState();

    if (currentState === "collapsed") {
      setLeftDrawerState("pinned");
      return;
    }

    closeDrawer();
  }

  function openPanelFromRail(panelName) {
    const currentState = getLeftDrawerState();

    activatePanel(panelName);

    if (currentState === "pinned") {
      return;
    }

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

  function handleDrawerClick(event) {
    const summary = event.target.closest("summary");

    if (summary && leftDrawer.contains(summary)) {
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
      return;
    }

    const panelButton = event.target.closest("[data-drawer-panel]");

    if (!panelButton || !leftDrawerRail || !leftDrawerRail.contains(panelButton)) {
      return;
    }

    openPanelFromRail(panelButton.dataset.drawerPanel);
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

  leftDrawerPinnedOpen.addEventListener("click", togglePinnedDrawer);
  leftDrawer.addEventListener("click", handleDrawerClick);

  if (leftDrawerRail) {
    leftDrawerRail.addEventListener("click", handleDrawerClick);
  }

  if (leftDrawerClose) {
    leftDrawerClose.addEventListener("click", closeDrawer);
  }

  if (leftDrawerModeToggle) {
    leftDrawerModeToggle.addEventListener("click", toggleCurrentDrawerMode);
  }

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);

  setLeftDrawerState(getLeftDrawerState());

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      body.classList.remove("drawer-is-initializing");
    });
  });
})();