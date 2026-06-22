(function () {
  const previewSizeStorageKey = "themeForge.previewSize";
  const customWidthStorageKey = "themeForge.customPreviewWidth";

  const previewSizeSelect = document.getElementById("previewSizeSelect");
  const previewCustomToolbar = document.getElementById("previewCustomToolbar");
  const previewCustomWidthInput = document.getElementById("previewCustomWidthInput");
  const previewCustomResetBtn = document.getElementById("previewCustomResetBtn");
  const previewResizeHandles = document.querySelectorAll("[data-preview-resize-handle]");

  const minCustomWidth = 320;

  if (!previewSizeSelect) {
    return;
  }

  const root = document.documentElement;
  const body = document.body;
  const rootStyles = window.getComputedStyle(root);
  const desktopWidth = rootStyles.getPropertyValue("--preview-width").trim() || "900px";
  const desktopWidthValue = parseWidthValue(desktopWidth) || 900;
  const previewResizeThreshold = parseWidthValue(rootStyles.getPropertyValue("--preview-resize-threshold").trim()) || 3;

  const previewSizes = {
    desktop: `${desktopWidthValue}px`,
    tablet: "768px",
    mobile: "390px",
    fluid: "100%",
  };

  let activeResize = null;

  function parseWidthValue(value) {
    const numericValue = Number.parseInt(String(value).replace("px", ""), 10);

    if (Number.isNaN(numericValue)) {
      return null;
    }

    return numericValue;
  }

  function getPreviewAreaMaxWidth() {
    const previewArea = document.querySelector(".preview-area");

    if (!previewArea) {
      return Math.max(minCustomWidth, window.innerWidth);
    }

    const styles = window.getComputedStyle(previewArea);
    const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(styles.paddingRight) || 0;
    const availableWidth = previewArea.clientWidth - paddingLeft - paddingRight;

    return Math.max(minCustomWidth, Math.floor(availableWidth));
  }

  function clampCustomWidth(width) {
    const numericWidth = parseWidthValue(width);

    if (numericWidth === null) {
      return desktopWidthValue;
    }

    return Math.min(Math.max(numericWidth, minCustomWidth), getPreviewAreaMaxWidth());
  }

  function getStoredPreviewSize() {
    const storedSize = window.localStorage.getItem(previewSizeStorageKey);

    if (storedSize === "custom" || Object.prototype.hasOwnProperty.call(previewSizes, storedSize)) {
      return storedSize;
    }

    return "desktop";
  }

  function getStoredCustomWidth() {
    const storedWidth = parseWidthValue(window.localStorage.getItem(customWidthStorageKey));

    if (storedWidth === null) {
      return null;
    }

    return storedWidth;
  }

  function getCurrentRenderedPreviewWidth() {
    const previewPanel = document.querySelector(".preview-panel");

    if (!previewPanel) {
      return desktopWidthValue;
    }

    return Math.round(previewPanel.getBoundingClientRect().width);
  }

  function showCustomToolbar(showToolbar) {
    if (!previewCustomToolbar) {
      return;
    }

    previewCustomToolbar.hidden = !showToolbar;
  }

  function syncCustomInputLimits() {
    if (!previewCustomWidthInput) {
      return;
    }

    previewCustomWidthInput.min = String(minCustomWidth);
    previewCustomWidthInput.max = String(getPreviewAreaMaxWidth());
  }

  function setResetTooltip() {
    if (!previewCustomResetBtn) {
      return;
    }

    previewCustomResetBtn.dataset.tooltip = `Restore to ${desktopWidthValue}px`;
    previewCustomResetBtn.setAttribute("aria-label", `Restore custom preview width to ${desktopWidthValue}px`);
  }

  function setPreviewWidth(width) {
    root.style.setProperty("--preview-width", width);
  }

  function setCustomWidth(width, options) {
    const shouldStore = options?.store !== false;
    const clampedWidth = clampCustomWidth(width);

    setPreviewWidth(`${clampedWidth}px`);

    if (previewCustomWidthInput) {
      previewCustomWidthInput.value = String(clampedWidth);
    }

    if (shouldStore) {
      window.localStorage.setItem(customWidthStorageKey, String(clampedWidth));
    }
  }

  function seedCustomWidthIfNeeded() {
    if (getStoredCustomWidth() !== null) {
      return;
    }

    const currentWidth = getCurrentRenderedPreviewWidth();
    window.localStorage.setItem(customWidthStorageKey, String(currentWidth));
  }

  function setPreviewSize(sizeName) {
    const nextSizeName = sizeName === "custom" || Object.prototype.hasOwnProperty.call(previewSizes, sizeName) ? sizeName : "desktop";

    previewSizeSelect.value = nextSizeName;
    body.dataset.previewSize = nextSizeName;
    window.localStorage.setItem(previewSizeStorageKey, nextSizeName);

    if (nextSizeName === "custom") {
      seedCustomWidthIfNeeded();
      syncCustomInputLimits();
      showCustomToolbar(true);
      setCustomWidth(getStoredCustomWidth() || desktopWidthValue);
      return;
    }

    showCustomToolbar(false);
    setPreviewWidth(previewSizes[nextSizeName]);
  }

  function beginPreviewResize(event) {
    const handle = event.currentTarget;
    const side = handle.dataset.previewResizeHandle;
    const startWidth = getCurrentRenderedPreviewWidth();

    activeResize = {
      side,
      startX: event.clientX,
      startWidth,
      hasStarted: false,
      originalPreviewSize: previewSizeSelect.value,
    };

    body.classList.add("is-resizing-preview");
    handle.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function updatePreviewResize(event) {
    if (!activeResize) {
      return;
    }

    const deltaX = event.clientX - activeResize.startX;
    const distance = Math.abs(deltaX);

    if (!activeResize.hasStarted && distance < previewResizeThreshold) {
      return;
    }

    if (!activeResize.hasStarted) {
      activeResize.hasStarted = true;

      if (previewSizeSelect.value !== "custom") {
        window.localStorage.setItem(customWidthStorageKey, String(activeResize.startWidth));
        setPreviewSize("custom");
      }
    }

    const widthDelta = activeResize.side === "left" ? deltaX * -2 : deltaX * 2;
    const nextWidth = activeResize.startWidth + widthDelta;

    setCustomWidth(nextWidth);
  }

  function endPreviewResize(event) {
    if (!activeResize) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    activeResize = null;
    body.classList.remove("is-resizing-preview");
  }

  previewSizeSelect.addEventListener("change", function () {
    setPreviewSize(previewSizeSelect.value);
  });

  if (previewCustomWidthInput) {
    previewCustomWidthInput.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();
      setCustomWidth(previewCustomWidthInput.value);
      previewCustomWidthInput.blur();
    });

    previewCustomWidthInput.addEventListener("blur", function () {
      setCustomWidth(previewCustomWidthInput.value);
    });
  }

  if (previewCustomResetBtn) {
    previewCustomResetBtn.addEventListener("click", function () {
      setCustomWidth(desktopWidthValue);
    });
  }

  previewResizeHandles.forEach(function (handle) {
    handle.addEventListener("pointerdown", beginPreviewResize);
    handle.addEventListener("pointermove", updatePreviewResize);
    handle.addEventListener("pointerup", endPreviewResize);
    handle.addEventListener("pointercancel", endPreviewResize);
  });

  window.addEventListener("resize", function () {
    if (previewSizeSelect.value !== "custom") {
      return;
    }

    syncCustomInputLimits();

    if (document.activeElement === previewCustomWidthInput) {
      return;
    }

    setCustomWidth(previewCustomWidthInput.value, { store: false });
  });

  setResetTooltip();
  setPreviewSize(getStoredPreviewSize());
})();
