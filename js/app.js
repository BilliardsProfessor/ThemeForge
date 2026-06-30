const APP_APPEARANCE_STORAGE_KEY = "themeForge.appAppearance";
const APP_APPEARANCE_OPTIONS = ["light", "dark", "system"];
const VALUE_UNIT_OPTIONS = ["px", "rem", "em"];
const VALUE_STEP = 1;
const FEATURE_SCALE_TOKENS = [
    { key: "xs", label: "XS" },
    { key: "sm", label: "SM" },
    { key: "md", label: "MD" },
    { key: "lg", label: "LG" },
    { key: "xl", label: "XL" },
];
const FEATURE_CONTROLS = {
    layout: {
        label: "Layout",
        mappings: [
            { key: "pagePadding", label: "Page padding" },
            { key: "sectionGap", label: "Section gap" },
            { key: "gridGap", label: "Grid gap" },
            { key: "stackGap", label: "Stack gap" },
        ],
    },
    components: {
        label: "Components",
        mappings: [
            { key: "cardPadding", label: "Card padding" },
            { key: "cardGap", label: "Card gap" },
            { key: "buttonPaddingX", label: "Btn pad X" },
            { key: "buttonPaddingY", label: "Btn pad Y" },
            { key: "formGap", label: "Form gap" },
            { key: "inputPaddingX", label: "Input pad X" },
            { key: "inputPaddingY", label: "Input pad Y" },
            { key: "labelSpacing", label: "Label spacing" },
            { key: "tableCellPaddingX", label: "Cell pad X" },
            { key: "tableCellPaddingY", label: "Cell pad Y" },
            { key: "tableRowGap", label: "Table row gap" },
        ],
    },
};

function getStoredAppAppearancePreference() {
    const preference = localStorage.getItem(APP_APPEARANCE_STORAGE_KEY);

    return APP_APPEARANCE_OPTIONS.includes(preference) ? preference : "system";
}

function getResolvedAppAppearance(preference) {
    if (preference !== "system") {
        return preference;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyAppAppearance(preference) {
    const resolvedMode = getResolvedAppAppearance(preference);

    document.body.dataset.appModePreference = preference;
    document.body.dataset.appMode = resolvedMode;

    updateAppAppearanceControl(preference);
}

function updateAppAppearanceControl(preference = getStoredAppAppearancePreference()) {
    const button = document.querySelector("[data-app-appearance-toggle]");

    if (!button) {
        return;
    }

    const resolvedMode = getResolvedAppAppearance(preference);
    const currentIndex = APP_APPEARANCE_OPTIONS.indexOf(preference);
    const nextPreference = APP_APPEARANCE_OPTIONS[(currentIndex + 1) % APP_APPEARANCE_OPTIONS.length];
    const label = `Switch app appearance to ${nextPreference}`;

    button.dataset.appAppearancePreference = preference;
    button.dataset.appMode = resolvedMode;
    button.dataset.tooltip = label;
    button.setAttribute("aria-label", label);
}

function cycleAppAppearance() {
    const currentPreference = document.body.dataset.appModePreference || getStoredAppAppearancePreference();
    const currentIndex = APP_APPEARANCE_OPTIONS.indexOf(currentPreference);
    const nextPreference = APP_APPEARANCE_OPTIONS[(currentIndex + 1) % APP_APPEARANCE_OPTIONS.length];

    localStorage.setItem(APP_APPEARANCE_STORAGE_KEY, nextPreference);
    applyAppAppearance(nextPreference);
}

function bindAppAppearanceControl() {
    const button = document.querySelector("[data-app-appearance-toggle]");

    if (!button) {
        return;
    }

    button.addEventListener("click", cycleAppAppearance);

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        const preference = document.body.dataset.appModePreference || getStoredAppAppearancePreference();

        if (preference === "system") {
            applyAppAppearance(preference);
        }
    });
}

function openSettingsDialog() {
    const message = document.createElement("p");
    const closeButton = document.createElement("button");

    message.textContent = "Wouldn't it be nice if there were actually settings in here?";

    closeButton.type = "button";
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", () => {
        ThemeForge.appModal.close();
    });

    ThemeForge.appModal.open({
        eyebrow: "Settings",
        title: "Theme Forge Settings",
        body: message,
        footer: [closeButton],
        initialFocusElement: closeButton,
    });
}

function bindSettingsControl() {
    document.querySelector("#settingsBtn")?.addEventListener("click", openSettingsDialog);
}

function updateThemeModeControls() {
    const button = document.querySelector("[data-theme-mode-toggle]");

    if (!button) {
        return;
    }

    const activeMode = ThemeForge.getActiveMode();
    const nextMode = activeMode === "light" ? "dark" : "light";
    const label = `Switch to ${nextMode} mode`;

    button.dataset.themeMode = activeMode;
    button.dataset.tooltip = label;
    button.setAttribute("aria-label", label);
}

function bindThemeModeControls() {
    const button = document.querySelector("[data-theme-mode-toggle]");

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {
        const nextMode = ThemeForge.getActiveMode() === "light" ? "dark" : "light";

        setThemeMode(nextMode);
    });
}

function setThemeMode(mode) {
    if (mode === ThemeForge.getActiveMode()) {
        return;
    }

    const previousMode = ThemeForge.getActiveMode();

    ThemeForge.history.recordChange(`Switched to ${mode} mode`);

    ThemeForge.theme.activeMode = mode;

    ThemeForge.history.updateLatestChangeDetail({
        type: "value",
        label: "Theme Mode",
        before: previousMode === "light" ? "Light" : "Dark",
        after: mode === "light" ? "Light" : "Dark",
    });

    ThemeForge.refreshThemeInterface();
    ThemeForge.history.saveSession();
}

function renderSpacingControls() {
    renderSpacingRailButton();
    renderSpacingPanel();
}

function renderSpacingRailButton() {}

function renderSpacingPanel() {
    if (document.querySelector('[data-control-panel="spacing"]')) {
        return;
    }

    const shapePanel = document.querySelector('[data-control-panel="shape"]');
    const panel = document.createElement("details");
    const summary = document.createElement("summary");
    const title = document.createElement("span");
    const content = document.createElement("div");

    panel.className = "control-card";
    panel.dataset.controlPanel = "spacing";

    title.className = "control-card-title";
    title.textContent = "Dimensions";
    summary.append(title);

    content.className = "control-card-content dimensions-control-content";
    content.append(createFeatureSpacingControls("layout"), createFeatureSpacingControls("components"));

    panel.append(summary, content);
    shapePanel?.before(panel);
}

function createFeatureSpacingControls(featureName) {
    const group = document.createElement("fieldset");
    const legend = document.createElement("legend");

    group.className = "dimensions-feature";
    legend.className = "dimensions-feature-title";
    legend.textContent = FEATURE_CONTROLS[featureName].label;

    group.append(legend, createFeatureScaleControls(featureName), createFeatureMappingControls(featureName));

    return group;
}

function createFeatureScaleControls(featureName) {
    const group = document.createElement("fieldset");
    const legend = document.createElement("legend");

    group.className = "dimensions-scale";
    legend.className = "dimensions-subtitle";
    legend.textContent = "Scale";
    group.append(legend);

    FEATURE_SCALE_TOKENS.forEach((token) => {
        group.append(
            createValueTokenControl({
                label: token.label,
                featureName,
                tokenType: "scale",
                tokenName: token.key,
            }),
        );
    });

    return group;
}

function createFeatureMappingControls(featureName) {
    const group = document.createElement("fieldset");
    const legend = document.createElement("legend");

    group.className = "dimensions-mappings";
    legend.className = "dimensions-subtitle";
    legend.textContent = "Mappings";
    group.append(legend);

    FEATURE_CONTROLS[featureName].mappings.forEach((mapping) => {
        group.append(
            createValueTokenControl({
                label: mapping.label,
                featureName,
                tokenType: "mapping",
                tokenName: mapping.key,
                includeScaleSnap: true,
            }),
        );
    });

    return group;
}

function createValueTokenControl({ label, featureName, tokenType, tokenName, includeScaleSnap = false }) {
    const wrapper = document.createElement("div");
    const text = document.createElement("span");
    const valueInput = document.createElement("input");
    const unitSelect = document.createElement("select");
    const nearestScale = document.createElement("select");
    const nearestScaleButton = document.createElement("button");

    wrapper.className = `dimensions-token-control dimensions-token-control-${tokenType}`;
    text.className = "dimensions-token-label";
    text.textContent = label;

    valueInput.type = "text";
    valueInput.inputMode = "decimal";
    valueInput.autocomplete = "off";
    valueInput.spellcheck = false;
    valueInput.className = "dimensions-value-input";
    valueInput.dataset.themeControl = "token";
    valueInput.dataset.featureName = featureName;
    valueInput.dataset.tokenType = tokenType;
    valueInput.dataset.tokenName = tokenName;
    valueInput.dataset.tokenField = "value";
    valueInput.setAttribute("aria-label", `${label} value`);

    unitSelect.className = "dimensions-unit-select";
    unitSelect.dataset.themeControl = "token";
    unitSelect.dataset.featureName = featureName;
    unitSelect.dataset.tokenType = tokenType;
    unitSelect.dataset.tokenName = tokenName;
    unitSelect.dataset.tokenField = "unit";
    unitSelect.setAttribute("aria-label", `${label} unit`);

    VALUE_UNIT_OPTIONS.forEach((unit) => {
        const option = document.createElement("option");

        option.value = unit;
        option.textContent = unit;
        unitSelect.append(option);
    });

    wrapper.append(text);

    if (includeScaleSnap) {
        nearestScale.className = "dimensions-scale-snap";
        nearestScale.dataset.scaleSnap = "true";
        nearestScale.dataset.featureName = featureName;
        nearestScale.dataset.tokenName = tokenName;
        nearestScale.setAttribute("aria-label", `${label} scale`);
        nearestScaleButton.type = "button";
        nearestScaleButton.className = "dimensions-nearest-scale-button has-tooltip";
        nearestScaleButton.dataset.nearestScaleSnap = "true";
        nearestScaleButton.dataset.featureName = featureName;
        nearestScaleButton.dataset.tokenName = tokenName;
        nearestScaleButton.dataset.tooltipPosition = "bottom";
        nearestScaleButton.textContent = "↺";
        nearestScaleButton.hidden = true;
        nearestScaleButton.setAttribute("aria-label", `${label} snap to nearest scale`);
        const customOption = document.createElement("option");

        customOption.value = "";
        customOption.textContent = "···";
        // customOption.textContent = "⚙";
        nearestScale.append(customOption);

        FEATURE_SCALE_TOKENS.forEach((token) => {
            const option = document.createElement("option");

            option.value = token.key;
            option.textContent = token.label;
            nearestScale.append(option);
        });

        wrapper.append(nearestScaleButton, valueInput, unitSelect, nearestScale);
    }

    if (!includeScaleSnap) {
        wrapper.append(valueInput, unitSelect);
    }

    return wrapper;
}

function getScaleTokenLabel(tokenKey) {
    return FEATURE_SCALE_TOKENS.find((token) => token.key === tokenKey)?.label || tokenKey;
}

function getFeatureLabel(featureName) {
    return FEATURE_CONTROLS[featureName]?.label || featureName;
}

function getMappingLabel(featureName, mappingKey) {
    return FEATURE_CONTROLS[featureName]?.mappings.find((mapping) => mapping.key === mappingKey)?.label || mappingKey;
}

function getTokenLabel(featureName, tokenType, tokenName) {
    if (tokenType === "scale") {
        return `${getFeatureLabel(featureName)} ${getScaleTokenLabel(tokenName)}`;
    }

    return getMappingLabel(featureName, tokenName);
}

function getFormattedTokenValue(token) {
    return `${Number(token.value)}${token.unit}`;
}

function getTokenFromControl(control, sourceTheme = ThemeForge.theme) {
    const feature = sourceTheme[control.dataset.featureName];
    const collectionName = control.dataset.tokenType === "scale" ? "scale" : "mappings";

    return feature?.[collectionName]?.[control.dataset.tokenName];
}

function cleanNumericText(value) {
    return value
        .replace(/[^\d.-]/g, "")
        .replace(/(?!^)-/g, "")
        .replace(/(\..*)\./g, "$1");
}

function getControlNumericValue(control, fallback = 0) {
    const value = Number(cleanNumericText(control.value));

    return Number.isFinite(value) ? value : fallback;
}

function updateTokenFromControl(control) {
    const token = getTokenFromControl(control);

    if (!token) {
        return;
    }

    if (control.dataset.tokenField === "value") {
        const cleanedValue = cleanNumericText(control.value);

        if (control.value !== cleanedValue) {
            control.value = cleanedValue;
        }

        const value = Number(cleanedValue);

        if (Number.isFinite(value)) {
            token.value = value;
        }

        return;
    }

    if (control.dataset.tokenField === "unit" && VALUE_UNIT_OPTIONS.includes(control.value)) {
        token.unit = control.value;
    }
}

function updateTokensFromControls() {
    document.querySelectorAll("[data-theme-control='token']").forEach(updateTokenFromControl);
}

function updateNearestScaleButtons() {
    document.querySelectorAll("[data-scale-snap]").forEach((select) => {
        const featureName = select.dataset.featureName;
        const mappingName = select.dataset.tokenName;
        const feature = ThemeForge.theme[featureName];
        const mapping = feature.mappings[mappingName];
        const exactMatch = ThemeForge.findMatchingScaleToken(feature.scale, mapping);
        const nearest = getNearestScaleToken(feature.scale, mapping);
        const nearestButton = select.closest(".dimensions-token-control")?.querySelector("[data-nearest-scale-snap]");

        select.value = exactMatch || "";
        select.dataset.scaleToken = exactMatch || "";

        if (!nearestButton) {
            return;
        }

        nearestButton.hidden = Boolean(exactMatch);
        nearestButton.dataset.scaleToken = nearest || "";
        nearestButton.dataset.tooltip = nearest ? `Snap to ${getScaleTokenLabel(nearest)}` : "";
        nearestButton.setAttribute("aria-label", nearest ? `Snap to ${getScaleTokenLabel(nearest)}` : "Snap to nearest scale");
    });
}

function getNearestScaleToken(scale, mapping) {
    if (!mapping) return null;

    const baseFontSize = ThemeForge.theme.settings.baseFontSize.value;

    return Object.entries(scale).reduce((nearest, current) => {
        const nearestDistance = Math.abs(getComparableTokenValue(nearest[1], baseFontSize) - getComparableTokenValue(mapping, baseFontSize));
        const currentDistance = Math.abs(getComparableTokenValue(current[1], baseFontSize) - getComparableTokenValue(mapping, baseFontSize));

        return currentDistance < nearestDistance ? current : nearest;
    })[0];
}

function getComparableTokenValue(token, baseFontSize) {
    const value = Number(token.value);

    if (token.unit === "rem" || token.unit === "em") {
        return value * baseFontSize;
    }

    return value;
}

function snapMappingToScale(select) {
    const featureName = select.dataset.featureName;
    const mappingName = select.dataset.tokenName;
    const scaleTokenName = select.value || select.dataset.scaleToken;
    if (!scaleTokenName) {
        return;
    }

    const feature = ThemeForge.theme[featureName];
    const scaleToken = feature.scale[scaleTokenName];
    const mapping = feature.mappings[mappingName];

    if (!scaleToken || !mapping) {
        return;
    }

    ThemeForge.history.recordChange(
        `Set ${getMappingLabel(featureName, mappingName).toLowerCase()} to ${getFeatureLabel(featureName)} ${getScaleTokenLabel(scaleTokenName)}`,
    );

    mapping.value = scaleToken.value;
    mapping.unit = scaleToken.unit;

    ThemeForge.history.updateLatestChangeDetail(getMappingSnapshotDetail(featureName, mappingName, ThemeForge.history.getLatestUndoSnapshot()));

    ThemeForge.refreshThemeInterface();
    ThemeForge.history.saveSession();
}

function stepTokenValueControl(control, direction) {
    const token = getTokenFromControl(control);

    if (!token) {
        return;
    }

    const currentValue = getControlNumericValue(control, Number(token.value));
    const nextValue = Math.max(0, currentValue + direction * VALUE_STEP);

    control.value = String(Number(nextValue.toFixed(2)));

    updateThemeFromControls({ target: control });
}

function handleTokenValueKeydown(event) {
    if (event.target.dataset.tokenField !== "value") {
        return;
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        stepTokenValueControl(event.target, 1);
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();
        stepTokenValueControl(event.target, -1);
    }
}

function updateThemeFromControls(event) {
    const label = getControlHistoryLabel(event.target);

    ThemeForge.history.recordContinuousChange(label);

    ThemeForge.theme.settings.baseFontSize.value = Number(document.querySelector("#baseFontSize").value);
    ThemeForge.theme.settings.baseFontSize.unit = "px";
    updateTypographyFromControls();

    ThemeForge.theme.shape.radius = Number(document.querySelector("#radiusControl").value);
    ThemeForge.theme.shape.borderWidth = Number(document.querySelector("#borderWidthControl").value);
    ThemeForge.theme.shape.overlayBlur = Number(document.querySelector("#overlayBlurControl").value);

    updateTokensFromControls();

    function updateTypographyFromControls() {
        const { settings, elements } = ThemeForge.theme.typography;

        settings.bodyFontFamily = document.querySelector("#bodyFontFamily")?.value || settings.bodyFontFamily;
        settings.headingFontFamily = document.querySelector("#headingFontFamily")?.value || settings.headingFontFamily;
        settings.monoFontFamily = document.querySelector("#monoFontFamily")?.value || settings.monoFontFamily;

        document.querySelectorAll("[data-typography-element]").forEach((row) => {
            const elementName = row.dataset.typographyElement;
            const element = elements[elementName];

            if (!element) return;

            element.size.value = Number(row.querySelector("[data-typography-field='size']").value);
            element.size.unit = row.querySelector("[data-typography-field='unit']").value;
            element.weight = Number(row.querySelector("[data-typography-field='weight']").value);
            element.lineHeight = Number(row.querySelector("[data-typography-field='lineHeight']").value);
            element.letterSpacing = Number(row.querySelector("[data-typography-field='letterSpacing']").value);
        });
    }

    ThemeForge.history.updateLatestChangeDetail(getControlHistoryDetail(event.target));

    ThemeForge.applyTheme();
    ThemeForge.accessibility.updateScoreBadge();
    updateNearestScaleButtons();
}

function getControlHistoryLabel(control) {
    const labels = {
        baseFontSize: "Changed base font size",
        headingScale: "Changed heading scale",
        radiusControl: "Changed border radius",
        borderWidthControl: "Changed border width",
        overlayBlurControl: "Changed overlay blur",
    };

    if (control.dataset.themeControl === "token") {
        const label = getTokenLabel(control.dataset.featureName, control.dataset.tokenType, control.dataset.tokenName);

        if (control.dataset.tokenType === "scale") {
            const affectedCount = getAffectedMappingCount(control.dataset.featureName, control.dataset.tokenName, ThemeForge.theme);
            return `Changed ${label}${affectedCount ? ` (${affectedCount})` : ""}`;
        }

        return `Changed ${label.toLowerCase()}`;
    }

    return labels[control.id] || "Changed theme control";
}

function getControlHistoryDetail(control) {
    const snapshot = ThemeForge.history.getLatestUndoSnapshot();
    const normalizedSnapshot = snapshot ? ThemeForge.normalizeTheme(snapshot) : null;

    if (!normalizedSnapshot) {
        return null;
    }

    const details = {
        baseFontSize: {
            label: "Base Font Size",
            before: getFormattedTokenValue(normalizedSnapshot.settings.baseFontSize),
            after: getFormattedTokenValue(ThemeForge.theme.settings.baseFontSize),
        },
        headingScale: {
            label: "Heading Scale",
            before: `${Math.round(normalizedSnapshot.typography.settings.headingScale * 100)}%`,
            after: `${Math.round(ThemeForge.theme.typography.settings.headingScale * 100)}%`,
        },
        radiusControl: {
            label: "Border Radius",
            before: `${normalizedSnapshot.shape.radius}px`,
            after: `${ThemeForge.theme.shape.radius}px`,
        },
        borderWidthControl: {
            label: "Border Width",
            before: `${normalizedSnapshot.shape.borderWidth}px`,
            after: `${ThemeForge.theme.shape.borderWidth}px`,
        },
        overlayBlurControl: {
            label: "Overlay Blur",
            before: `${normalizedSnapshot.shape.overlayBlur}px`,
            after: `${ThemeForge.theme.shape.overlayBlur}px`,
        },
    };

    const detail = details[control.id] || getTokenControlHistoryDetail(control, normalizedSnapshot);

    if (!detail) {
        return null;
    }

    return {
        type: "value",
        ...detail,
    };
}

function getTokenControlHistoryDetail(control, snapshot) {
    if (control.dataset.themeControl !== "token") {
        return null;
    }

    const featureName = control.dataset.featureName;
    const tokenType = control.dataset.tokenType;
    const tokenName = control.dataset.tokenName;
    const collectionName = tokenType === "scale" ? "scale" : "mappings";
    const beforeToken = snapshot[featureName][collectionName][tokenName];
    const afterToken = ThemeForge.theme[featureName][collectionName][tokenName];
    const label = getTokenLabel(featureName, tokenType, tokenName);

    return {
        label,
        before: getFormattedTokenValue(beforeToken),
        after: getFormattedTokenValue(afterToken),
    };
}

function getMappingSnapshotDetail(featureName, mappingName, snapshot) {
    const normalizedSnapshot = snapshot ? ThemeForge.normalizeTheme(snapshot) : null;

    if (!normalizedSnapshot) {
        return null;
    }

    return {
        type: "value",
        label: getMappingLabel(featureName, mappingName),
        before: getFormattedTokenValue(normalizedSnapshot[featureName].mappings[mappingName]),
        after: getFormattedTokenValue(ThemeForge.theme[featureName].mappings[mappingName]),
    };
}

function getAffectedMappingCount(featureName, scaleTokenName, snapshot) {
    const normalizedSnapshot = snapshot ? ThemeForge.normalizeTheme(snapshot) : ThemeForge.theme;
    const feature = normalizedSnapshot[featureName];
    const scaleToken = feature?.scale?.[scaleTokenName];

    if (!scaleToken) {
        return 0;
    }

    return Object.values(feature.mappings).filter((mapping) => Number(mapping.value) === Number(scaleToken.value) && mapping.unit === scaleToken.unit).length;
}

function syncThemeControlsFromState() {
    ThemeForge.theme = ThemeForge.normalizeTheme(ThemeForge.theme);

    document.querySelector("#baseFontSize").value = ThemeForge.theme.settings.baseFontSize.value;

    syncTypographyControlsFromState();

    document.querySelector("#radiusControl").value = ThemeForge.theme.shape.radius;
    document.querySelector("#borderWidthControl").value = ThemeForge.theme.shape.borderWidth;
    document.querySelector("#overlayBlurControl").value = ThemeForge.theme.shape.overlayBlur;

    syncFeatureControlsFromState();
}

function syncTypographyControlsFromState() {
    const { settings, elements } = ThemeForge.theme.typography;

    document.querySelector("#bodyFontFamily").value = settings.bodyFontFamily;
    document.querySelector("#headingFontFamily").value = settings.headingFontFamily;
    document.querySelector("#monoFontFamily").value = settings.monoFontFamily;

    document.querySelectorAll("[data-typography-element]").forEach((row) => {
        const element = elements[row.dataset.typographyElement];

        if (!element) return;

        row.querySelector("[data-typography-field='size']").value = element.size.value;
        row.querySelector("[data-typography-field='unit']").value = element.size.unit;
        row.querySelector("[data-typography-field='weight']").value = element.weight;
        row.querySelector("[data-typography-field='lineHeight']").value = element.lineHeight;
        row.querySelector("[data-typography-field='letterSpacing']").value = element.letterSpacing;
    });
}

function syncFeatureControlsFromState() {
    document.querySelectorAll("[data-theme-control='token']").forEach((control) => {
        const token = getTokenFromControl(control);

        if (!token) {
            return;
        }

        control.value = token[control.dataset.tokenField];
    });

    updateNearestScaleButtons();
}

ThemeForge.refreshThemeInterface = function refreshThemeInterface() {
    ThemeForge.theme = ThemeForge.normalizeTheme(ThemeForge.theme);

    syncThemeControlsFromState();
    updateThemeModeControls();
    ThemeForge.applyTheme();
    ThemeForge.colorEditor.render();
    ThemeForge.accessibility.updateScoreBadge();
};

function bindControls() {
    const controls = document.querySelectorAll(
        [
            "#baseFontSize",
            "#bodyFontFamily",
            "#headingFontFamily",
            "#monoFontFamily",
            "#radiusControl",
            "#borderWidthControl",
            "#overlayBlurControl",
            "[data-theme-control='token']",
            "[data-typography-field]",
        ].join(", "),
    );

    controls.forEach((control) => {
        control.addEventListener("input", updateThemeFromControls);
    });

    document.querySelectorAll("[data-theme-control='token'][data-token-field='value']").forEach((control) => {
        control.addEventListener("keydown", handleTokenValueKeydown);
    });

    document.querySelectorAll("[data-scale-snap]").forEach((select) => {
        select.addEventListener("change", () => {
            snapMappingToScale(select);
        });
    });

    document.querySelectorAll("[data-nearest-scale-snap]").forEach((button) => {
        button.addEventListener("click", () => {
            snapMappingToScale(button);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderSpacingControls();
    bindControls();
    bindThemeModeControls();
    bindAppAppearanceControl();
    bindSettingsControl();
    applyAppAppearance(getStoredAppAppearancePreference());
    ThemeForge.history.init();
    updateThemeModeControls();
    syncThemeControlsFromState();
    ThemeForge.applyTheme();
    ThemeForge.colorEditor.init();
    ThemeForge.accessibility.init();
});
