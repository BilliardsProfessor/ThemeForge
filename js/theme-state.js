const ThemeForge = {
    theme: {
        name: "Untitled Theme",
        schemaVersion: 1,
        activeMode: "light",

        modes: {
            light: {
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
                    overlay: { h: 222, s: 47, l: 11, a: 0.55, locked: false },
                },
            },

            dark: {
                colors: {
                    primary: { h: 221, s: 83, l: 63, a: 1, locked: false },
                    secondary: { h: 262, s: 83, l: 68, a: 1, locked: false },
                    background: { h: 222, s: 47, l: 8, a: 1, locked: false },
                    surface: { h: 222, s: 40, l: 13, a: 1, locked: false },

                    success: { h: 142, s: 71, l: 45, a: 1, locked: false },
                    warning: { h: 38, s: 92, l: 55, a: 1, locked: false },
                    danger: { h: 0, s: 84, l: 65, a: 1, locked: false },
                    info: { h: 199, s: 89, l: 58, a: 1, locked: false },

                    text: { h: 210, s: 40, l: 98, a: 1, locked: false },
                    mutedText: { h: 215, s: 20, l: 70, a: 1, locked: false },
                    link: { h: 221, s: 83, l: 70, a: 1, locked: false },

                    border: { h: 217, s: 33, l: 24, a: 1, locked: false },
                    focus: { h: 221, s: 83, l: 70, a: 1, locked: false },
                    shadowTint: { h: 0, s: 0, l: 0, a: 0.35, locked: false },
                    overlay: { h: 0, s: 0, l: 0, a: 0.65, locked: false },
                },
            },
        },

        typography: { baseFontSize: 16, headingScale: 1.35 },

        shape: {
            radius: 10,
            borderWidth: 1,
            overlayBlur: 2,
        },
    },

    normalizeTheme(theme) {
        const normalizedTheme = typeof structuredClone === "function" ? structuredClone(theme) : JSON.parse(JSON.stringify(theme));

        normalizedTheme.schemaVersion = normalizedTheme.schemaVersion || 1;
        normalizedTheme.activeMode = normalizedTheme.activeMode || "light";

        if (!normalizedTheme.modes) {
            normalizedTheme.modes = {
                light: {
                    colors: normalizedTheme.colors,
                },
                dark: {
                    colors: this.theme.modes.dark.colors,
                },
            };

            delete normalizedTheme.colors;
        }

        return normalizedTheme;
    },

    getActiveMode() {
        return this.theme.activeMode || "light";
    },

    getActiveColors() {
        return this.theme.modes[this.getActiveMode()].colors;
    },

    get colors() {
        return this.getActiveColors();
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
        const colors = ThemeForge.getActiveColors();
        const { typography, shape } = ThemeForge.theme;

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
        root.style.setProperty("--color-overlay", ThemeForge.getColorValue(colors.overlay));
        root.style.setProperty("--shadow-soft", `0 12px 30px ${ThemeForge.getColorValue(colors.shadowTint)}`);

        root.style.setProperty("--font-size-base", `${typography.baseFontSize}px`);
        root.style.setProperty("--heading-scale", typography.headingScale);

        root.style.setProperty("--radius", `${shape.radius}px`);
        root.style.setProperty("--border-width", `${shape.borderWidth}px`);
        root.style.setProperty("--overlay-blur", `${shape.overlayBlur}px`);
    },
};
