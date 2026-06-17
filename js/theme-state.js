const ThemeForge = {
  theme: {
    name: "Untitled Theme",

    colors: {
      primary: { h: 221, s: 83, l: 53, a: 1, locked: false },
      secondary: { h: 262, s: 83, l: 58, a: 1, locked: false },
      background: { h: 210, s: 40, l: 98, a: 1, locked: false },
      surface: { h: 0, s: 0, l: 100, a: 1, locked: false },

      success: { h: 142, s: 71, l: 45, a: 1, locked: false },
      warning: { h: 38, s: 92, l: 50, a: 1, locked: false },
      danger: { h: 0, s: 84, l: 60, a: 1, locked: false },
      info: { h: 199, s: 89, l: 48, a: 1, locked: false },

      text: { h: 222, s: 47, l: 11, a: 1, locked: false },
      mutedText: { h: 215, s: 16, l: 47, a: 1, locked: false },
      link: { h: 221, s: 83, l: 53, a: 1, locked: false },

      border: { h: 214, s: 32, l: 91, a: 1, locked: false },
      focus: { h: 221, s: 83, l: 53, a: 1, locked: false },
      shadowTint: { h: 222, s: 47, l: 11, a: 0.08, locked: false },
    },

    typography: { baseFontSize: 16, headingScale: 1.35 },

    shape: { radius: 10, borderWidth: 1 },
  },

  getColorValue(colorToken, format = "hsl") {
    const rgb = hslToRgb(colorToken);
    const hex = rgbToHex(rgb);

    if (format === "hex") {
      return colorToken.a === 1 ? hex : `${hex}${ThemeForge.alphaToHex(colorToken.a)}`;
    }

    if (format === "rgb") {
      return colorToken.a === 1 ? `rgb(${rgb.r} ${rgb.g} ${rgb.b})` : `rgb(${rgb.r} ${rgb.g} ${rgb.b} / ${ThemeForge.formatAlpha(colorToken.a)})`;
    }

    return colorToken.a === 1
      ? `hsl(${colorToken.h} ${colorToken.s}% ${colorToken.l}%)`
      : `hsl(${colorToken.h} ${colorToken.s}% ${colorToken.l}% / ${ThemeForge.formatAlpha(colorToken.a)})`;
  },

  getColorHex(colorToken) {
    return rgbToHex(hslToRgb(colorToken));
  },

  formatAlpha(alpha) {
    return Number(alpha.toFixed(2));
  },

  alphaToHex(alpha) {
    return Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0");
  },

  applyTheme() {
    const root = document.querySelector(".preview-area");
    const { colors, typography, shape } = ThemeForge.theme;

    root.style.setProperty("--color-primary", ThemeForge.getColorValue(colors.primary));
    root.style.setProperty("--color-secondary", ThemeForge.getColorValue(colors.secondary));
    root.style.setProperty("--color-background", ThemeForge.getColorValue(colors.background));
    root.style.setProperty("--color-surface", ThemeForge.getColorValue(colors.surface));

    root.style.setProperty("--color-success", ThemeForge.getColorValue(colors.success));
    root.style.setProperty("--color-warning", ThemeForge.getColorValue(colors.warning));
    root.style.setProperty("--color-danger", ThemeForge.getColorValue(colors.danger));
    root.style.setProperty("--color-info", ThemeForge.getColorValue(colors.info));

    root.style.setProperty("--color-text", ThemeForge.getColorValue(colors.text));
    root.style.setProperty("--color-muted-text", ThemeForge.getColorValue(colors.mutedText));
    root.style.setProperty("--color-link", ThemeForge.getColorValue(colors.link));

    root.style.setProperty("--color-border", ThemeForge.getColorValue(colors.border));
    root.style.setProperty("--color-focus", ThemeForge.getColorValue(colors.focus));
    root.style.setProperty("--shadow-soft", `0 12px 30px ${ThemeForge.getColorValue(colors.shadowTint)}`);

    root.style.setProperty("--font-size-base", `${typography.baseFontSize}px`);
    root.style.setProperty("--heading-scale", typography.headingScale);

    root.style.setProperty("--radius", `${shape.radius}px`);
    root.style.setProperty("--border-width", `${shape.borderWidth}px`);
  },
};
