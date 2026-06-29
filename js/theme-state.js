const ThemeForge = {
    theme: {
        name: "Untitled Theme",
        schemaVersion: 1,
        activeMode: "light",

        settings: {
            baseFontSize: { value: 16, unit: "px" },
        },

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

        typography: {
            settings: {
                headingScale: 1.35,
            },
            scale: {},
            mappings: {},
        },

        layout: {
            settings: {},
            scale: {
                xs: { value: 4, unit: "px" },
                sm: { value: 8, unit: "px" },
                md: { value: 12, unit: "px" },
                lg: { value: 16, unit: "px" },
                xl: { value: 24, unit: "px" },
            },
            mappings: {
                pagePadding: { value: 24, unit: "px" },
                sectionGap: { value: 32, unit: "px" },
                gridGap: { value: 16, unit: "px" },
                stackGap: { value: 12, unit: "px" },
            },
        },

        components: {
            settings: {},
            scale: {
                xs: { value: 4, unit: "px" },
                sm: { value: 8, unit: "px" },
                md: { value: 12, unit: "px" },
                lg: { value: 16, unit: "px" },
                xl: { value: 24, unit: "px" },
            },
            mappings: {
                cardPadding: { value: 16, unit: "px" },
                cardGap: { value: 12, unit: "px" },
                buttonPaddingX: { value: 16, unit: "px" },
                buttonPaddingY: { value: 8, unit: "px" },
                formGap: { value: 12, unit: "px" },
                inputPaddingX: { value: 12, unit: "px" },
                inputPaddingY: { value: 8, unit: "px" },
                labelSpacing: { value: 4, unit: "px" },
                tableCellPaddingX: { value: 12, unit: "px" },
                tableCellPaddingY: { value: 8, unit: "px" },
                tableRowGap: { value: 4, unit: "px" },
            },
        },

        shape: {
            radius: 10,
            borderWidth: 1,
            overlayBlur: 2,
        },
    },

    cloneValue(value) {
        return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
    },

    normalizeTheme(theme) {
        const normalizedTheme = this.cloneValue(theme || this.theme);
        const defaultTheme = this.theme;

        normalizedTheme.schemaVersion = normalizedTheme.schemaVersion || 1;
        normalizedTheme.activeMode = normalizedTheme.activeMode || "light";

        if (!normalizedTheme.modes) {
            normalizedTheme.modes = {
                light: {
                    colors: normalizedTheme.colors,
                },
                dark: {
                    colors: defaultTheme.modes.dark.colors,
                },
            };

            delete normalizedTheme.colors;
        }

        normalizedTheme.settings = {
            ...this.cloneValue(defaultTheme.settings),
            ...(normalizedTheme.settings || {}),
        };

        if (typeof normalizedTheme.settings.baseFontSize === "number") {
            normalizedTheme.settings.baseFontSize = { value: normalizedTheme.settings.baseFontSize, unit: "px" };
        }

        if (normalizedTheme.typography?.baseFontSize !== undefined) {
            normalizedTheme.settings.baseFontSize = { value: normalizedTheme.typography.baseFontSize, unit: "px" };
        }

        normalizedTheme.typography = this.normalizeTypography(normalizedTheme.typography);
        normalizedTheme.shape = normalizedTheme.shape || this.cloneValue(defaultTheme.shape);

        this.normalizeFeature(normalizedTheme, "layout");
        this.normalizeFeature(normalizedTheme, "components");

        if (normalizedTheme.spacing) {
            this.migrateSpacing(normalizedTheme);
            delete normalizedTheme.spacing;
        }

        return normalizedTheme;
    },

    normalizeTypography(typography = {}) {
        return {
            settings: {
                headingScale: typography.settings?.headingScale ?? typography.headingScale ?? this.theme.typography.settings.headingScale,
            },
            scale: typography.scale || {},
            mappings: typography.mappings || {},
        };
    },

    normalizeFeature(theme, featureName) {
        const feature = theme[featureName] || {};
        const defaultFeature = this.theme[featureName];

        theme[featureName] = {
            settings: feature.settings || {},
            scale: this.normalizeValueCollection(feature.scale || defaultFeature.scale),
            mappings: this.normalizeValueCollection(feature.mappings || defaultFeature.mappings),
        };
    },

    normalizeValueCollection(collection) {
        return Object.fromEntries(Object.entries(collection).map(([key, token]) => [key, this.normalizeValueToken(token)]));
    },

    normalizeValueToken(token) {
        if (typeof token === "number") {
            return { value: token, unit: "px" };
        }

        return {
            value: Number(token?.value ?? 0),
            unit: token?.unit || "px",
        };
    },

    migrateSpacing(theme) {
        const spacing = theme.spacing;
        const spacingUnit = spacing.unit || "px";
        const oldScale = Object.fromEntries(
            Object.entries(spacing.scale || {}).map(([key, value]) => [key, this.normalizeValueToken({ value, unit: spacingUnit })]),
        );

        ["layout", "components"].forEach((featureName) => {
            Object.keys(theme[featureName].scale).forEach((tokenName) => {
                if (oldScale[tokenName]) {
                    theme[featureName].scale[tokenName] = this.cloneValue(oldScale[tokenName]);
                }
            });
        });

        Object.entries(spacing.assignments || {}).forEach(([mappingName, tokenName]) => {
            const featureName = theme.layout.mappings[mappingName] ? "layout" : theme.components.mappings[mappingName] ? "components" : null;
            const token = oldScale[tokenName];

            if (featureName && token) {
                theme[featureName].mappings[mappingName] = this.cloneValue(token);
            }
        });
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

    getCssVariableName(tokenName) {
        return tokenName.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    },

    getTokenValue(token) {
        return `${Number(token.value)}${token.unit}`;
    },

    findMatchingScaleToken(scale, mapping) {
        return Object.entries(scale).find(([, token]) => Number(token.value) === Number(mapping.value) && token.unit === mapping.unit)?.[0] || null;
    },

    applyFeatureVariables(root, featureName) {
        const feature = ThemeForge.theme[featureName];

        Object.entries(feature.scale).forEach(([tokenName, token]) => {
            root.style.setProperty(`--${featureName}-${tokenName}`, ThemeForge.getTokenValue(token));
        });

        Object.entries(feature.mappings).forEach(([mappingName, token]) => {
            root.style.setProperty(`--${ThemeForge.getCssVariableName(mappingName)}`, ThemeForge.getTokenValue(token));
        });
    },

    applyTheme() {
        ThemeForge.theme = ThemeForge.normalizeTheme(ThemeForge.theme);

        const root = document.querySelector(".preview-area");
        const colors = ThemeForge.getActiveColors();
        const { settings, typography, shape } = ThemeForge.theme;

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

        root.style.setProperty("--font-size-base", ThemeForge.getTokenValue(settings.baseFontSize));
        root.style.setProperty("--heading-scale", typography.settings.headingScale);

        root.style.setProperty("--radius", `${shape.radius}px`);
        root.style.setProperty("--border-width", `${shape.borderWidth}px`);
        root.style.setProperty("--overlay-blur", `${shape.overlayBlur}px`);

        ThemeForge.applyFeatureVariables(root, "layout");
        ThemeForge.applyFeatureVariables(root, "components");
    },
};
