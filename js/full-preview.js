(function () {
  const previewModes = new Set(["workbench", "full"]);
  const body = document.body;
  const fullPreviewButton = document.getElementById("fullPreviewBtn");
  const restoreWorkbenchButton = document.getElementById("restoreWorkbenchBtn");
  const restoreFadeDuration = 500;

  let restoreHideTimer = null;

  if (!fullPreviewButton || !restoreWorkbenchButton) {
    return;
  }

  function getPreviewMode() {
    const mode = body.dataset.previewMode;

    if (previewModes.has(mode)) {
      return mode;
    }

    return "workbench";
  }

  function showRestoreButton() {
    window.clearTimeout(restoreHideTimer);

    restoreWorkbenchButton.hidden = false;

    requestAnimationFrame(function () {
      restoreWorkbenchButton.classList.add("is-visible");
    });
  }

  function hideRestoreButton() {
    restoreWorkbenchButton.classList.remove("is-visible");
    window.clearTimeout(restoreHideTimer);

    restoreHideTimer = window.setTimeout(function () {
      if (getPreviewMode() === "full") {
        return;
      }

      restoreWorkbenchButton.hidden = true;
    }, restoreFadeDuration);
  }

  function setPreviewMode(mode) {
    const nextMode = previewModes.has(mode) ? mode : "workbench";
    const isFullPreview = nextMode === "full";

    body.dataset.previewMode = nextMode;
    fullPreviewButton.setAttribute("aria-pressed", String(isFullPreview));

    if (isFullPreview) {
      showRestoreButton();
      return;
    }

    hideRestoreButton();
  }

  function enterFullPreview() {
    setPreviewMode("full");
  }

  function restoreWorkbench() {
    setPreviewMode("workbench");
  }

  function handleDocumentKeydown(event) {
    if (event.key !== "Escape") {
      return;
    }

    if (getPreviewMode() !== "full") {
      return;
    }

    restoreWorkbench();
  }

  fullPreviewButton.addEventListener("click", enterFullPreview);
  restoreWorkbenchButton.addEventListener("click", restoreWorkbench);
  document.addEventListener("keydown", handleDocumentKeydown);

  setPreviewMode(getPreviewMode());
})();
