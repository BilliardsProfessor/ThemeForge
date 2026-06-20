(function () {
  const drawerStates = new Set(["open", "peek", "closed"]);
  const body = document.body;
  const leftDrawerTab = document.querySelector('[data-drawer-tab="left"]');
  const leftDrawerClose = document.querySelector('[data-drawer-close="left"]');

  if (!leftDrawerTab) {
    return;
  }

  function getLeftDrawerState() {
    const state = body.dataset.leftDrawerState;

    if (drawerStates.has(state)) {
      return state;
    }

    return "open";
  }

  function setLeftDrawerState(state) {
    const nextState = drawerStates.has(state) ? state : "open";

    body.dataset.leftDrawerState = nextState;
    leftDrawerTab.setAttribute("aria-expanded", String(nextState === "open"));

    if (nextState === "open") {
      leftDrawerTab.setAttribute("aria-label", "Collapse controls drawer");
      return;
    }

    leftDrawerTab.setAttribute("aria-label", "Open controls drawer");
  }

  function handleLeftDrawerTabClick() {
    const currentState = getLeftDrawerState();

    if (currentState === "open") {
      setLeftDrawerState("peek");
      return;
    }

    setLeftDrawerState("open");
  }

  function handleLeftDrawerCloseClick() {
    setLeftDrawerState("closed");
  }

  leftDrawerTab.addEventListener("click", handleLeftDrawerTabClick);

  if (leftDrawerClose) {
    leftDrawerClose.addEventListener("click", handleLeftDrawerCloseClick);
  }

  setLeftDrawerState(getLeftDrawerState());
})();
