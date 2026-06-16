const ThemeForge = {
  theme: {
    name: "Untitled Theme",

    colors: {
      primary: "#2563eb",
      secondary: "#7c3aed",
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#0f172a",
    },

    typography: { baseFontSize: 16, headingScale: 1.35 },

    shape: { radius: 10, borderWidth: 1 },
  },

  applyTheme() {
    const root = document.querySelector(".preview-area");
    const { colors, typography, shape } = ThemeForge.theme;

    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-secondary", colors.secondary);
    root.style.setProperty("--color-background", colors.background);
    root.style.setProperty("--color-surface", colors.surface);
    root.style.setProperty("--color-text", colors.text);

    root.style.setProperty("--font-size-base", `${typography.baseFontSize}px`);
    root.style.setProperty("--heading-scale", typography.headingScale);

    root.style.setProperty("--radius", `${shape.radius}px`);
    root.style.setProperty("--border-width", `${shape.borderWidth}px`);
  },
};
