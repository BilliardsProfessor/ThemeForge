const APP_APPEARANCE_STORAGE_KEY = "themeForge.appAppearance";
const APP_APPEARANCE_OPTIONS = ["light", "dark", "system"];
const VALUE_UNIT_OPTIONS = ["px", "rem", "em"];
const VALUE_STEP = 1;
const WORKSPACE_NUMBER_DRAG_THRESHOLD = 3;
const WORKSPACE_NUMBER_PIXELS_PER_STEP = 8;
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
const TYPOGRAPHY_ELEMENTS = [
    { key: "h1", label: "H1" },
    { key: "h2", label: "H2" },
    { key: "h3", label: "H3" },
    { key: "h4", label: "H4" },
    { key: "h5", label: "H5" },
    { key: "h6", label: "H6" },
    { key: "p", label: "Paragraph" },
    { key: "small", label: "Small" },
    { key: "blockquote", label: "Quote" },
    { key: "code", label: "Code" },
    { key: "label", label: "Label" },
    { key: "eyebrow", label: "Eyebrow" },
];

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

function renderTypographyControls() {
    const shell = document.querySelector("[data-typography-elements-shell]");

    if (!shell) {
        return;
    }

    const editor = document.createElement("div");
    const list = document.createElement("div");

    shell.className = "editor-shell";
    editor.className = "editor-panel";
    editor.dataset.typographyEditorPanel = "true";
    editor.hidden = true;

    list.className = "editor-list";
    list.dataset.typographySummaryList = "true";

    TYPOGRAPHY_ELEMENTS.forEach((element) => {
        const row = document.createElement("button");

        row.type = "button";
        row.className = "editor-list-row";
        row.dataset.typographySummaryElement = element.key;
        row.addEventListener("click", () => openTypographyEditor(element.key));

        list.append(row);
    });

    shell.replaceChildren(editor, list);

    updateTypographySummaryRows();
}

function updateTypographySummaryRows() {
    document.querySelectorAll("[data-typography-summary-element]").forEach((row) => {
        const elementName = row.dataset.typographySummaryElement;
        const element = ThemeForge.theme.typography.elements[elementName];
        const label = getTypographyElementLabel(elementName);

        if (!element) {
            return;
        }

        row.innerHTML = `
            <span>${label}</span>
            <span>${getFormattedTokenValue(element.size)}</span>
            <span>${element.weight}</span>
            <span>${element.lineHeight} / ${element.letterSpacing}</span>
        `;
    });
}

function openTypographyEditor(elementName) {
    const panel = document.querySelector("[data-typography-editor-panel]");
    const element = ThemeForge.theme.typography.elements[elementName];

    if (!panel || !element) {
        return;
    }

    panel.hidden = false;
    requestAnimationFrame(() => {
        panel.classList.add("is-visible");
    });
    panel.closest(".editor-shell")?.classList.add("is-editing");
    panel.dataset.typographyElement = elementName;
    panel.innerHTML = `
        <header class="editor-panel-header">
            <h3>${getTypographyElementLabel(elementName)}</h3>
            <button
                type="button"
                class="editor-panel-close"
                data-close-typography-editor
                aria-label="Close typography editor"
            >
                <svg
                    class="icon"
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 24 24"
                >
                    <path d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5" />
                    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </button>
        </header>

        <div class="editor-panel-content" data-typography-element="${elementName}">
            <label>
                Size
                <input type="text" inputmode="decimal" data-typography-field="size" value="${element.size.value}" aria-label="${getTypographyElementLabel(elementName)} size" />
            </label>

            <label>
                Unit
                <select data-typography-field="unit" aria-label="${getTypographyElementLabel(elementName)} unit">
                    ${VALUE_UNIT_OPTIONS.map((unit) => `<option value="${unit}" ${unit === element.size.unit ? "selected" : ""}>${unit}</option>`).join("")}
                </select>
            </label>

            <label>
                Weight
                <select data-typography-field="weight" aria-label="${getTypographyElementLabel(elementName)} weight">
                    ${[400, 500, 600, 700, 800, 900].map((weight) => `<option value="${weight}" ${weight === element.weight ? "selected" : ""}>${weight}</option>`).join("")}
                </select>
            </label>

            <label>
                Line
                <input type="text" inputmode="decimal" data-typography-field="lineHeight" value="${element.lineHeight}" aria-label="${getTypographyElementLabel(elementName)} line height" />
            </label>

            <label>
                Track
                <input type="text" inputmode="decimal" data-typography-field="letterSpacing" value="${element.letterSpacing}" aria-label="${getTypographyElementLabel(elementName)} letter spacing" />
            </label>
        </div>
    `;

    panel
        .querySelectorAll(["[data-typography-field='size']", "[data-typography-field='lineHeight']", "[data-typography-field='letterSpacing']"].join(", "))
        .forEach((control) => {
            const fieldOptions = {
                size: {
                    min: 0,
                    step: 0.1,
                    fineStep: 0.01,
                    coarseStep: 1,
                    decimals: 2,
                },
                lineHeight: {
                    min: 0,
                    step: 0.05,
                    fineStep: 0.01,
                    coarseStep: 0.25,
                    decimals: 2,
                },
                letterSpacing: {
                    step: 0.01,
                    fineStep: 0.001,
                    coarseStep: 0.05,
                    decimals: 3,
                },
            };

            enhanceWorkspaceNumberInput(control, fieldOptions[control.dataset.typographyField]);
        });

    panel.querySelectorAll("[data-typography-field]").forEach((control) => {
        control.addEventListener("input", updateThemeFromControls);
    });

    panel.querySelector("[data-close-typography-editor]").addEventListener("click", closeTypographyEditor);
}

function closeTypographyEditor() {
    const panel = document.querySelector("[data-typography-editor-panel]");

    if (!panel || panel.hidden) {
        return;
    }

    panel.classList.remove("is-visible");
    panel.closest(".editor-shell")?.classList.remove("is-editing");

    window.setTimeout(() => {
        if (!panel.classList.contains("is-visible")) {
            panel.hidden = true;
            delete panel.dataset.typographyElement;
        }
    }, 250);
}

function handleTypographyEditorOutsidePointerDown(event) {
    const panel = document.querySelector("[data-typography-editor-panel]");

    if (!panel || panel.hidden || panel.contains(event.target)) {
        return;
    }

    closeTypographyEditor();
}

function bindTypographyEditorDismissal() {
    document.addEventListener("pointerdown", handleTypographyEditorOutsidePointerDown, true);
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
    title.textContent = "Spacing";
    summary.append(title);

    content.className = "control-card-content spacing-control-content";
    content.append(createFeatureSpacingControls("layout"), createFeatureSpacingControls("components"));

    panel.append(summary, content);
    shapePanel?.before(panel);
}

function createFeatureSpacingControls(featureName) {
    const section = document.createElement("section");
    const title = document.createElement("h3");

    section.className = "control-section spacing-feature";
    title.className = "control-section-title";
    title.textContent = FEATURE_CONTROLS[featureName].label;

    section.append(title, createFeatureScaleControls(featureName), createFeatureMappingControls(featureName));

    return section;
}

function createFeatureScaleControls(featureName) {
    const group = document.createElement("fieldset");
    const legend = document.createElement("legend");

    group.className = "control-subsection spacing-scale";
    legend.className = "control-subsection-title";
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

    group.className = "control-subsection spacing-mappings";
    legend.className = "control-subsection-title";
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

    wrapper.className = `spacing-token-control spacing-token-control-${tokenType}`;
    text.className = "spacing-token-label";
    text.textContent = label;

    valueInput.type = "text";
    valueInput.inputMode = "decimal";
    valueInput.autocomplete = "off";
    valueInput.spellcheck = false;
    valueInput.className = "spacing-value-input";
    valueInput.dataset.themeControl = "token";
    valueInput.dataset.featureName = featureName;
    valueInput.dataset.tokenType = tokenType;
    valueInput.dataset.tokenName = tokenName;
    valueInput.dataset.tokenField = "value";
    valueInput.setAttribute("aria-label", `${label} value`);

    unitSelect.className = "spacing-unit-select";
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
        nearestScale.className = "spacing-scale-snap";
        nearestScale.dataset.scaleSnap = "true";
        nearestScale.dataset.featureName = featureName;
        nearestScale.dataset.tokenName = tokenName;
        nearestScale.setAttribute("aria-label", `${label} scale`);
        nearestScaleButton.type = "button";
        nearestScaleButton.className = "spacing-nearest-scale-button has-tooltip";
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

function cloneThemeSnapshot(theme) {
    return JSON.parse(JSON.stringify(theme));
}

function updateBaseFontSizeValue() {
    const input = document.querySelector("#baseFontSize");
    const output = document.querySelector("#baseFontSizeValue");

    if (!input || !output) {
        return;
    }

    output.value = `${input.value}px`;
    output.textContent = `${input.value}px`;
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

function createWorkspaceNumberInput(options = {}) {
    const input = document.createElement("input");

    input.type = "text";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.spellcheck = false;

    if (options.className) {
        input.className = options.className;
    }

    if (options.value !== undefined) {
        input.value = options.value;
    }

    if (options.ariaLabel) {
        input.setAttribute("aria-label", options.ariaLabel);
    }

    Object.entries(options.dataset || {}).forEach(([key, value]) => {
        input.dataset[key] = value;
    });

    enhanceWorkspaceNumberInput(input, options);

    return input;
}

function enhanceWorkspaceNumberInput(input, options = {}) {
    input.classList.add("workspace-number-input");

    let dragState = null;

    input.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) {
            return;
        }

        beginDeferredControlChange(input);

        dragState = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startValue: getControlNumericValue(input, Number(options.value) || 0),
            isDragging: false,
        };

        input.setPointerCapture(event.pointerId);
    });

    input.addEventListener("pointermove", (event) => {
        if (!dragState || event.pointerId !== dragState.pointerId) {
            return;
        }

        const deltaX = event.clientX - dragState.startX;

        if (!dragState.isDragging && Math.abs(deltaX) < WORKSPACE_NUMBER_DRAG_THRESHOLD) {
            return;
        }

        dragState.isDragging = true;
        event.preventDefault();

        const step = getWorkspaceNumberStep(event, options);
        const rawValue = dragState.startValue + (deltaX / WORKSPACE_NUMBER_PIXELS_PER_STEP) * step;
        const nextValue = clampWorkspaceNumberValue(rawValue, options);

        input.value = formatWorkspaceNumberValue(nextValue, options);
        previewDeferredControlChange(input);
    });

    input.addEventListener("pointerup", (event) => {
        if (!dragState || event.pointerId !== dragState.pointerId) {
            return;
        }

        const shouldCommitChange = dragState.isDragging;

        dragState = null;

        if (shouldCommitChange) {
            commitDeferredControlChange(input);
        }
    });

    input.addEventListener("pointercancel", () => {
        cancelDeferredControlChange(input);
        dragState = null;
    });
}

function enhanceDeferredHistoryControl(control) {
    control.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) {
            return;
        }

        beginDeferredControlChange(control);

        if (control.setPointerCapture) {
            control.setPointerCapture(event.pointerId);
        }
    });

    control.addEventListener(
        "input",
        (event) => {
            if (!getDeferredControlSnapshot(control) || event.detail?.isDeferredCommit) {
                return;
            }

            event.stopImmediatePropagation();

            updateThemeFromControls({
                target: control,
                detail: {
                    isPreviewOnly: true,
                    historySnapshot: getDeferredControlSnapshot(control),
                },
            });
        },
        true,
    );

    control.addEventListener("pointerup", () => {
        commitDeferredControlChange(control);
    });

    control.addEventListener("pointercancel", () => {
        cancelDeferredControlChange(control);
    });
}

function bindDeferredHistoryControls() {
    document
        .querySelectorAll(["#baseFontSize", "#radiusControl", "#borderWidthControl", "#overlayBlurControl"].join(", "))
        .forEach(enhanceDeferredHistoryControl);
}

function dispatchControlInput(control, detail = {}) {
    control.dispatchEvent(new CustomEvent("input", { bubbles: true, detail }));
}

function beginDeferredControlChange(control) {
    control.deferredHistorySnapshot = cloneThemeSnapshot(ThemeForge.theme);
}

function getDeferredControlSnapshot(control) {
    return control.deferredHistorySnapshot;
}

function cancelDeferredControlChange(control) {
    delete control.deferredHistorySnapshot;
}

function previewDeferredControlChange(control) {
    dispatchControlInput(control, {
        isPreviewOnly: true,
        historySnapshot: getDeferredControlSnapshot(control),
    });
}

function commitDeferredControlChange(control) {
    const historySnapshot = getDeferredControlSnapshot(control);

    if (!historySnapshot) {
        return;
    }

    dispatchControlInput(control, { historySnapshot, isDeferredCommit: true });

    cancelDeferredControlChange(control);
}

function getWorkspaceNumberStep(event, options) {
    if (event.shiftKey) {
        return options.fineStep ?? 0.1;
    }

    if (event.ctrlKey || event.metaKey) {
        return options.coarseStep ?? 10;
    }

    return options.step ?? 1;
}

function clampWorkspaceNumberValue(value, options) {
    let nextValue = value;

    if (Number.isFinite(options.min)) {
        nextValue = Math.max(options.min, nextValue);
    }

    if (Number.isFinite(options.max)) {
        nextValue = Math.min(options.max, nextValue);
    }

    return nextValue;
}

function formatWorkspaceNumberValue(value, options) {
    const decimals = options.decimals ?? 2;

    return String(Number(value.toFixed(decimals)));
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
        const nearestButton = select.closest(".spacing-token-control")?.querySelector("[data-nearest-scale-snap]");

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
    const control = event.target;
    const label = getControlHistoryLabel(control);
    const isPreviewOnly = event.detail?.isPreviewOnly;
    const startingSnapshot = event.detail?.historySnapshot || cloneThemeSnapshot(ThemeForge.theme);

    ThemeForge.theme.settings.baseFontSize.value = Number(document.querySelector("#baseFontSize").value);
    ThemeForge.theme.settings.baseFontSize.unit = "px";
    updateBaseFontSizeValue();
    updateTypographyFromControls();

    ThemeForge.theme.shape.radius = Number(document.querySelector("#radiusControl").value);
    ThemeForge.theme.shape.borderWidth = Number(document.querySelector("#borderWidthControl").value);
    ThemeForge.theme.shape.overlayBlur = Number(document.querySelector("#overlayBlurControl").value);

    updateTokensFromControls();
    updateTypographySummaryRows();

    if (!isPreviewOnly && !ThemeForge.history.themesMatch(startingSnapshot, ThemeForge.theme)) {
        ThemeForge.history.recordContinuousChange(label, null, startingSnapshot);
        ThemeForge.history.updateLatestChangeDetail(getControlHistoryDetail(control, startingSnapshot));
    }

    ThemeForge.applyTheme();
    ThemeForge.accessibility.updateScoreBadge();
    updateNearestScaleButtons();
}

function updateTypographyFromControls() {
    const { settings, elements } = ThemeForge.theme.typography;

    settings.bodyFontFamily = document.querySelector("#bodyFontFamily")?.value || settings.bodyFontFamily;
    settings.headingFontFamily = document.querySelector("#headingFontFamily")?.value || settings.headingFontFamily;
    settings.monoFontFamily = document.querySelector("#monoFontFamily")?.value || settings.monoFontFamily;

    document;
    document.querySelectorAll("[data-typography-element]").forEach((container) => {
        if (container.closest("[hidden], [disabled]")) return;

        const elementName = container.dataset.typographyElement;
        const element = elements[elementName];

        if (!element) return;

        const sizeControl = container.querySelector("[data-typography-field='size']");
        const unitControl = container.querySelector("[data-typography-field='unit']");
        const weightControl = container.querySelector("[data-typography-field='weight']");
        const lineHeightControl = container.querySelector("[data-typography-field='lineHeight']");
        const letterSpacingControl = container.querySelector("[data-typography-field='letterSpacing']");

        if (sizeControl) element.size.value = Number(sizeControl.value);
        if (unitControl) element.size.unit = unitControl.value;
        if (weightControl) element.weight = Number(weightControl.value);
        if (lineHeightControl) element.lineHeight = Number(lineHeightControl.value);
        if (letterSpacingControl) element.letterSpacing = Number(letterSpacingControl.value);
    });
}

function getControlHistoryLabel(control) {
    const labels = {
        baseFontSize: "Changed base font size",
        headingScale: "Changed heading scale",
        radiusControl: "Changed border radius",
        borderWidthControl: "Changed border width",
        overlayBlurControl: "Changed overlay blur",
        bodyFontFamily: "Changed body font",
        headingFontFamily: "Changed heading font",
        monoFontFamily: "Changed mono font",
    };

    if (control.dataset.themeControl === "token") {
        const label = getTokenLabel(control.dataset.featureName, control.dataset.tokenType, control.dataset.tokenName);

        if (control.dataset.tokenType === "scale") {
            const affectedCount = getAffectedMappingCount(control.dataset.featureName, control.dataset.tokenName, ThemeForge.theme);
            return `Changed ${label}${affectedCount ? ` (${affectedCount})` : ""}`;
        }

        return `Changed ${label.toLowerCase()}`;
    }

    if (control.dataset.typographyField) {
        const elementName = control.closest("[data-typography-element]")?.dataset.typographyElement;
        const fieldName = control.dataset.typographyField;

        return `${getTypographyElementLabel(elementName)} ${getTypographyFieldLabel(fieldName)}`;
    }

    return labels[control.id] || "Changed theme control";
}

function getTypographyElementLabel(elementName) {
    const labels = {
        h1: "H1",
        h2: "H2",
        h3: "H3",
        h4: "H4",
        h5: "H5",
        h6: "H6",
        p: "paragraph",
        small: "small text",
        blockquote: "quote",
        code: "code",
        label: "label",
        eyebrow: "eyebrow",
    };

    return labels[elementName] || "typography";
}

function getTypographyFieldLabel(fieldName) {
    const labels = {
        size: "size",
        unit: "unit",
        weight: "weight",
        lineHeight: "line height",
        letterSpacing: "track",
    };

    return labels[fieldName] || "setting";
}

function getControlHistoryDetail(control, snapshot = null) {
    snapshot = snapshot || ThemeForge.history.getLatestUndoSnapshot();
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

    const detail =
        details[control.id] || getTokenControlHistoryDetail(control, normalizedSnapshot) || getTypographyControlHistoryDetail(control, normalizedSnapshot);

    if (!detail) {
        return null;
    }

    return { type: "value", ...detail };
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

function getTypographyControlHistoryDetail(control, snapshot) {
    if (!control.dataset.typographyField) {
        return null;
    }

    const elementName = control.closest("[data-typography-element]")?.dataset.typographyElement;
    const fieldName = control.dataset.typographyField;
    const beforeElement = snapshot.typography.elements[elementName];
    const afterElement = ThemeForge.theme.typography.elements[elementName];

    if (!beforeElement || !afterElement) {
        return null;
    }

    if (fieldName === "size") {
        return {
            label: `${getTypographyElementLabel(elementName)} size`,
            before: getFormattedTokenValue(beforeElement.size),
            after: getFormattedTokenValue(afterElement.size),
        };
    }

    return {
        label: `${getTypographyElementLabel(elementName)} ${getTypographyFieldLabel(fieldName)}`,
        before: beforeElement[fieldName],
        after: afterElement[fieldName],
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
    updateBaseFontSizeValue();

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
        if (row.closest("[hidden], [disabled]")) return;

        const element = elements[row.dataset.typographyElement];

        if (!element) return;

        row.querySelector("[data-typography-field='size']").value = element.size.value;
        row.querySelector("[data-typography-field='unit']").value = element.size.unit;
        row.querySelector("[data-typography-field='weight']").value = element.weight;
        row.querySelector("[data-typography-field='lineHeight']").value = element.lineHeight;
        row.querySelector("[data-typography-field='letterSpacing']").value = element.letterSpacing;
    });
    updateTypographySummaryRows();
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
    renderTypographyControls();
    bindTypographyEditorDismissal();
    renderSpacingControls();
    bindControls();
    bindDeferredHistoryControls();
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
