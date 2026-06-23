function updateThemeFromControls(event) {
  const label = getControlHistoryLabel(event.target);

  ThemeForge.history.recordContinuousChange(label);

  ThemeForge.theme.typography.baseFontSize = Number(document.querySelector("#baseFontSize").value);
  ThemeForge.theme.typography.headingScale = Number(document.querySelector("#headingScale").value) / 100;

  ThemeForge.theme.shape.radius = Number(document.querySelector("#radiusControl").value);
  ThemeForge.theme.shape.borderWidth = Number(document.querySelector("#borderWidthControl").value);
  ThemeForge.theme.shape.overlayBlur = Number(document.querySelector("#overlayBlurControl").value);

  ThemeForge.applyTheme();
  ThemeForge.accessibility.updateScoreBadge();
}

function getControlHistoryLabel(control) {
  const labels = {
    baseFontSize: "Changed base font size",
    headingScale: "Changed heading scale",
    radiusControl: "Changed border radius",
    borderWidthControl: "Changed border width",
    overlayBlurControl: "Changed overlay blur",
  };

  return labels[control.id] || "Changed theme control";
}

function syncThemeControlsFromState() {
  document.querySelector("#baseFontSize").value = ThemeForge.theme.typography.baseFontSize;
  document.querySelector("#headingScale").value = ThemeForge.theme.typography.headingScale * 100;

  document.querySelector("#radiusControl").value = ThemeForge.theme.shape.radius;
  document.querySelector("#borderWidthControl").value = ThemeForge.theme.shape.borderWidth;
  document.querySelector("#overlayBlurControl").value = ThemeForge.theme.shape.overlayBlur;
}

ThemeForge.refreshThemeInterface = function refreshThemeInterface() {
  syncThemeControlsFromState();
  ThemeForge.applyTheme();
  ThemeForge.colorEditor.render();
  ThemeForge.accessibility.updateScoreBadge();
};

function bindControls() {
  const controls = document.querySelectorAll("#baseFontSize, #headingScale, #radiusControl, #borderWidthControl, #overlayBlurControl");

  controls.forEach((control) => {
    control.addEventListener("input", updateThemeFromControls);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindControls();
  ThemeForge.applyTheme();
  ThemeForge.colorEditor.init();
  ThemeForge.accessibility.init();
  ThemeForge.history.init();
});
