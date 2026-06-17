function updateThemeFromControls() {
  ThemeForge.theme.typography.baseFontSize = Number(document.querySelector("#baseFontSize").value);
  ThemeForge.theme.typography.headingScale = Number(document.querySelector("#headingScale").value) / 100;

  ThemeForge.theme.shape.radius = Number(document.querySelector("#radiusControl").value);
  ThemeForge.theme.shape.borderWidth = Number(document.querySelector("#borderWidthControl").value);
  ThemeForge.theme.shape.overlayBlur = Number(document.querySelector("#overlayBlurControl").value);

  ThemeForge.applyTheme();
}

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
});
