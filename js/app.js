function updateThemeFromControls() {
  ThemeForge.theme.colors.primary =
    document.querySelector("#primaryColor").value;
  ThemeForge.theme.colors.secondary =
    document.querySelector("#secondaryColor").value;
  ThemeForge.theme.colors.background =
    document.querySelector("#backgroundColor").value;
  ThemeForge.theme.colors.surface =
    document.querySelector("#surfaceColor").value;
  ThemeForge.theme.colors.text = document.querySelector("#textColor").value;

  ThemeForge.theme.typography.baseFontSize = Number(
    document.querySelector("#baseFontSize").value,
  );
  ThemeForge.theme.typography.headingScale =
    Number(document.querySelector("#headingScale").value) / 100;

  ThemeForge.theme.shape.radius = Number(
    document.querySelector("#radiusControl").value,
  );
  ThemeForge.theme.shape.borderWidth = Number(
    document.querySelector("#borderWidthControl").value,
  );

  ThemeForge.applyTheme();
}

function bindControls() {
  const controls = document.querySelectorAll(
    "#primaryColor, #secondaryColor, #backgroundColor, #surfaceColor, #textColor, #baseFontSize, #headingScale, #radiusControl, #borderWidthControl",
  );

  controls.forEach((control) => {
    control.addEventListener("input", updateThemeFromControls);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindControls();
  ThemeForge.applyTheme();
  ThemeForge.colorEditor.init();
});
