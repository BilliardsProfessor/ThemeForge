const ThemeForge = {
  theme: {
    name: "Untitled Theme",

    colors: {
      primary: { h: 221, s: 83, l: 53, a: 1, locked: false },
      secondary: { h: 262, s: 83, l: 58, a: 1, locked: false },
      background: { h: 210, s: 40, l: 98, a: 1, locked: false },
      surface: { h: 0, s: 0, l: 100, a: 1, locked: false },
      text: { h: 222, s: 47, l: 11, a: 1, locked: false },
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
    root.style.setProperty("--color-text", ThemeForge.getColorValue(colors.text));

    root.style.setProperty("--font-size-base", `${typography.baseFontSize}px`);
    root.style.setProperty("--heading-scale", typography.headingScale);

    root.style.setProperty("--radius", `${shape.radius}px`);
    root.style.setProperty("--border-width", `${shape.borderWidth}px`);
  },
};
