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
                bodyFontFamily: "systemSans",
                headingFontFamily: "inherit",
                monoFontFamily: "mono",
            },
            elements: {
                h1: { size: { value: 3, unit: "rem" }, weight: 800, lineHeight: 1.1, letterSpacing: -0.03 },
                h2: { size: { value: 2.25, unit: "rem" }, weight: 700, lineHeight: 1.15, letterSpacing: -0.02 },
                h3: { size: { value: 1.75, unit: "rem" }, weight: 700, lineHeight: 1.2, letterSpacing: -0.01 },
                h4: { size: { value: 1.35, unit: "rem" }, weight: 600, lineHeight: 1.25, letterSpacing: 0 },
                h5: { size: { value: 1.15, unit: "rem" }, weight: 600, lineHeight: 1.3, letterSpacing: 0 },
                h6: { size: { value: 1, unit: "rem" }, weight: 600, lineHeight: 1.35, letterSpacing: 0.02 },
                p: { size: { value: 1, unit: "rem" }, weight: 400, lineHeight: 1.6, letterSpacing: 0 },
                small: { size: { value: 0.875, unit: "rem" }, weight: 400, lineHeight: 1.45, letterSpacing: 0 },
                blockquote: { size: { value: 1.125, unit: "rem" }, weight: 400, lineHeight: 1.55, letterSpacing: 0 },
                code: { size: { value: 0.9, unit: "rem" }, weight: 400, lineHeight: 1.45, letterSpacing: 0 },
                label: { size: { value: 0.875, unit: "rem" }, weight: 600, lineHeight: 1.25, letterSpacing: 0.01 },
                eyebrow: { size: { value: 0.75, unit: "rem" }, weight: 800, lineHeight: 1.2, letterSpacing: 0.08 },
            },
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
            corners: {
                scale: {
                    none: { value: 0, unit: "px" },
                    xs: { value: 2, unit: "px" },
                    sm: { value: 4, unit: "px" },
                    md: { value: 8, unit: "px" },
                    lg: { value: 12, unit: "px" },
                    xl: { value: 20, unit: "px" },
                    pill: { value: 999, unit: "px" },
                },
                mappings: {
                    surfaceRadius: { value: 18, unit: "px", cornerShape: "round" },
                    cardRadius: { value: 12, unit: "px", cornerShape: "round" },
                    buttonRadius: { value: 8, unit: "px", cornerShape: "squircle" },
                    inputRadius: { value: 8, unit: "px", cornerShape: "round" },
                    badgeRadius: { value: 999, unit: "px", cornerShape: "round" },
                    dialogRadius: { value: 16, unit: "px", cornerShape: "round" },
                },
            },

            borders: {
                scale: {
                    none: { value: 0, unit: "px" },
                    thin: { value: 1, unit: "px" },
                    md: { value: 2, unit: "px" },
                    thick: { value: 4, unit: "px" },
                },
                mappings: {
                    cardBorderWidth: { value: 1, unit: "px" },
                    buttonBorderWidth: { value: 1, unit: "px" },
                    inputBorderWidth: { value: 1, unit: "px" },
                    dividerWidth: { value: 1, unit: "px" },
                    focusRingWidth: { value: 2, unit: "px" },
                },
            },

            overlayBlur: 2,
        },
        shadows: {
            recipes: {
                subtle: { x: 0, y: 4, blur: 12, spread: 0, opacity: 12, color: "shadowTint", inset: false },
                soft: { x: 0, y: 8, blur: 24, spread: 0, opacity: 18, color: "shadowTint", inset: false },
                raised: { x: 0, y: 12, blur: 32, spread: -4, opacity: 22, color: "shadowTint", inset: false },
                floating: { x: 0, y: 18, blur: 48, spread: -8, opacity: 28, color: "shadowTint", inset: false },
                dramatic: { x: 0, y: 24, blur: 64, spread: -12, opacity: 36, color: "shadowTint", inset: false },
                inset: { x: 0, y: 2, blur: 8, spread: 0, opacity: 18, color: "shadowTint", inset: true },
            },
            mappings: {
                surfaceShadow: { recipe: "soft", x: 0, y: 8, blur: 24, spread: 0, opacity: 18, color: "shadowTint", inset: false },
                cardShadow: { recipe: "soft", x: 0, y: 8, blur: 24, spread: 0, opacity: 18, color: "shadowTint", inset: false },
                buttonShadow: { recipe: "subtle", x: 0, y: 4, blur: 12, spread: 0, opacity: 12, color: "shadowTint", inset: false },
                dialogShadow: { recipe: "floating", x: 0, y: 18, blur: 48, spread: -8, opacity: 28, color: "shadowTint", inset: false },
                popoverShadow: { recipe: "raised", x: 0, y: 12, blur: 32, spread: -4, opacity: 22, color: "shadowTint", inset: false },
                toastShadow: { recipe: "raised", x: 0, y: 12, blur: 32, spread: -4, opacity: 22, color: "shadowTint", inset: false },
            },
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
        normalizedTheme.shape = this.normalizeShape(normalizedTheme.shape);
        normalizedTheme.shadows = this.normalizeShadows(normalizedTheme.shadows);

        this.normalizeFeature(normalizedTheme, "layout");
        this.normalizeFeature(normalizedTheme, "components");

        if (normalizedTheme.spacing) {
            this.migrateSpacing(normalizedTheme);
            delete normalizedTheme.spacing;
        }

        return normalizedTheme;
    },

    normalizeTypography(typography = {}) {
        const defaultTypography = this.theme.typography;

        return {
            settings: {
                ...this.cloneValue(defaultTypography.settings),
                ...(typography.settings || {}),
            },
            elements: this.normalizeTypographyElements(typography.elements || defaultTypography.elements),
        };
    },

    normalizeTypographyElements(elements = {}) {
        const defaultElements = this.theme.typography.elements;

        return Object.fromEntries(
            Object.entries(defaultElements).map(([elementName, defaultElement]) => [
                elementName,
                this.normalizeTypographyElement(elements[elementName] || defaultElement, defaultElement),
            ]),
        );
    },

    normalizeTypographyElement(element = {}, defaultElement = {}) {
        return {
            size: this.normalizeValueToken(element.size || defaultElement.size),
            weight: Number(element.weight ?? defaultElement.weight ?? 400),
            lineHeight: Number(element.lineHeight ?? defaultElement.lineHeight ?? 1.5),
            letterSpacing: Number(element.letterSpacing ?? defaultElement.letterSpacing ?? 0),
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

    normalizeShape(shape = {}) {
        const defaultShape = this.theme.shape;

        if (shape.radius !== undefined || shape.borderWidth !== undefined) {
            shape = this.migrateShape(shape);
        }

        return {
            corners: {
                scale: this.normalizeValueCollection(shape.corners?.scale || defaultShape.corners.scale),
                mappings: this.normalizeCornerMappingCollection(shape.corners?.mappings || defaultShape.corners.mappings),
            },

            borders: {
                scale: this.normalizeValueCollection(shape.borders?.scale || defaultShape.borders.scale),
                mappings: this.normalizeValueCollection(shape.borders?.mappings || defaultShape.borders.mappings),
            },

            overlayBlur: Number(shape.overlayBlur ?? defaultShape.overlayBlur),
        };
    },

    normalizeShadows(shadows = {}) {
        const defaultShadows = this.theme.shadows;

        return {
            recipes: this.normalizeShadowCollection(shadows.recipes || defaultShadows.recipes, defaultShadows.recipes),
            mappings: this.normalizeShadowCollection(shadows.mappings || defaultShadows.mappings, defaultShadows.mappings),
        };
    },

    normalizeShadowCollection(collection = {}, defaultCollection = {}) {
        return Object.fromEntries(
            Object.entries(defaultCollection).map(([key, defaultShadow]) => {
                return [key, this.normalizeShadowRecipe(collection[key] || defaultShadow, defaultShadow)];
            }),
        );
    },

    normalizeShadowRecipe(shadow = {}, defaultShadow = {}) {
        return {
            recipe: shadow.recipe || defaultShadow.recipe || "custom",
            x: Number(shadow.x ?? defaultShadow.x ?? 0),
            y: Number(shadow.y ?? defaultShadow.y ?? 0),
            blur: Number(shadow.blur ?? defaultShadow.blur ?? 0),
            spread: Number(shadow.spread ?? defaultShadow.spread ?? 0),
            opacity: Number(shadow.opacity ?? defaultShadow.opacity ?? 0),
            color: shadow.color || defaultShadow.color || "shadowTint",
            inset: Boolean(shadow.inset ?? defaultShadow.inset ?? false),
        };
    },

    normalizeCornerMappingCollection(collection) {
        const defaultMappings = this.theme.shape.corners.mappings;

        return Object.fromEntries(
            Object.entries(defaultMappings).map(([key, defaultToken]) => {
                const token = collection[key] || defaultToken;

                return [
                    key,
                    {
                        ...this.normalizeValueToken(token),
                        cornerShape: this.normalizeCornerShapeValue(token.cornerShape || defaultToken.cornerShape),
                    },
                ];
            }),
        );
    },

    normalizeCornerShapeValue(value) {
        if (value === "superellipse(1)") {
            return "round";
        }

        return value || "round";
    },

    migrateShape(shape = {}) {
        const migratedShape = this.cloneValue(this.theme.shape);

        if (shape.radius !== undefined) {
            Object.keys(migratedShape.corners.mappings).forEach((mappingName) => {
                migratedShape.corners.mappings[mappingName] = { value: Number(shape.radius), unit: "px" };
            });
        }

        if (shape.borderWidth !== undefined) {
            Object.keys(migratedShape.borders.mappings).forEach((mappingName) => {
                migratedShape.borders.mappings[mappingName] = {
                    value: Number(shape.borderWidth),
                    unit: "px",
                };
            });
        }

        migratedShape.overlayBlur = Number(shape.overlayBlur ?? migratedShape.overlayBlur);

        return migratedShape;
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

    getShadowValue(shadow, colors = ThemeForge.getActiveColors()) {
        if (shadow.recipe === "none") {
            return "none";
        }
        const opacity = Math.max(0, Math.min(100, Number(shadow.opacity))) / 100;
        const colorToken = colors[shadow.color] || colors.shadowTint;
        const shadowColor = {
            ...colorToken,
            a: opacity,
        };
        const inset = shadow.inset ? "inset " : "";

        return `${inset}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${ThemeForge.getColorValue(shadowColor)}`;
    },

    getFontFamilyValue(fontFamilyKey) {
        const fontFamilies = {
            inherit: "inherit",
            systemSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            serif: 'Georgia, "Times New Roman", serif',
            mono: 'Consolas, Monaco, "Courier New", monospace',
        };

        return fontFamilies[fontFamilyKey] || fontFamilies.systemSans;
    },

    applyTypographyVariables(root) {
        const { settings, elements } = ThemeForge.theme.typography;

        root.style.setProperty("--font-family-body", ThemeForge.getFontFamilyValue(settings.bodyFontFamily));
        root.style.setProperty(
            "--font-family-heading",
            settings.headingFontFamily === "inherit" ? "var(--font-family-body)" : ThemeForge.getFontFamilyValue(settings.headingFontFamily),
        );
        root.style.setProperty("--font-family-mono", ThemeForge.getFontFamilyValue(settings.monoFontFamily));

        Object.entries(elements).forEach(([elementName, element]) => {
            const cssName = ThemeForge.getCssVariableName(elementName);

            root.style.setProperty(`--typography-${cssName}-size`, ThemeForge.getTokenValue(element.size));
            root.style.setProperty(`--typography-${cssName}-weight`, element.weight);
            root.style.setProperty(`--typography-${cssName}-line-height`, element.lineHeight);
            root.style.setProperty(`--typography-${cssName}-letter-spacing`, `${element.letterSpacing}em`);
        });
    },

    findMatchingScaleToken(scale, mapping) {
        if (!scale || !mapping) {
            return null;
        }

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

    applyShapeVariables(root) {
        const { corners, borders, overlayBlur } = ThemeForge.theme.shape;

        Object.entries(corners.scale).forEach(([tokenName, token]) => {
            root.style.setProperty(`--radius-${tokenName}`, ThemeForge.getTokenValue(token));
        });

        Object.entries(corners.mappings).forEach(([mappingName, token]) => {
            const cssName = ThemeForge.getCssVariableName(mappingName);
            const cornerShapeName = cssName.replace(/-radius$/, "-corner-shape");

            root.style.setProperty(`--${cssName}`, ThemeForge.getTokenValue(token));
            root.style.setProperty(`--${cornerShapeName}`, token.cornerShape);
        });

        Object.entries(borders.scale).forEach(([tokenName, token]) => {
            root.style.setProperty(`--border-width-${tokenName}`, ThemeForge.getTokenValue(token));
        });

        Object.entries(borders.mappings).forEach(([mappingName, token]) => {
            root.style.setProperty(`--${ThemeForge.getCssVariableName(mappingName)}`, ThemeForge.getTokenValue(token));
        });

        root.style.setProperty("--overlay-blur", `${overlayBlur}px`);
        root.style.setProperty("--radius", ThemeForge.getTokenValue(corners.mappings.cardRadius));
        root.style.setProperty("--border-width", ThemeForge.getTokenValue(borders.mappings.cardBorderWidth));
    },

    applyShadowVariables(root) {
        const { recipes, mappings } = ThemeForge.theme.shadows;
        const colors = ThemeForge.getActiveColors();

        Object.entries(recipes).forEach(([recipeName, recipe]) => {
            root.style.setProperty(`--shadow-recipe-${ThemeForge.getCssVariableName(recipeName)}`, ThemeForge.getShadowValue(recipe, colors));
        });

        Object.entries(mappings).forEach(([mappingName, shadow]) => {
            root.style.setProperty(`--${ThemeForge.getCssVariableName(mappingName)}`, ThemeForge.getShadowValue(shadow, colors));
        });

        root.style.setProperty("--shadow-soft", "var(--card-shadow)");
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

        root.style.setProperty("--font-size-base", ThemeForge.getTokenValue(settings.baseFontSize));
        ThemeForge.applyTypographyVariables(root);

        ThemeForge.applyShapeVariables(root);
        ThemeForge.applyShadowVariables(root);
        ThemeForge.applyFeatureVariables(root, "layout");
        ThemeForge.applyFeatureVariables(root, "components");
    },
};
