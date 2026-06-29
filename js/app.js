const APP_APPEARANCE_STORAGE_KEY = "themeForge.appAppearance";
const APP_APPEARANCE_OPTIONS = ["light", "dark", "system"];
const SPACING_UNIT_OPTIONS = ["px", "rem", "em"];
const SPACING_TOKENS = [
    { key: "2xs", label: "2XS" },
    { key: "xs", label: "XS" },
    { key: "sm", label: "SM" },
    { key: "md", label: "MD" },
    { key: "lg", label: "LG" },
    { key: "xl", label: "XL" },
    { key: "2xl", label: "2XL" },
    { key: "3xl", label: "3XL" },
];
const SPACING_ASSIGNMENTS = [
    { key: "pagePadding", label: "Page padding" },
    { key: "sectionGap", label: "Section gap" },
    { key: "gridGap", label: "Grid gap" },
    { key: "stackGap", label: "Stack gap" },
    { key: "cardPadding", label: "Card padding" },
    { key: "cardGap", label: "Card gap" },
    { key: "buttonPaddingX", label: "Button padding X" },
    { key: "buttonPaddingY", label: "Button padding Y" },
    { key: "formGap", label: "Form gap" },
    { key: "inputPaddingX", label: "Input padding X" },
    { key: "inputPaddingY", label: "Input padding Y" },
    { key: "labelSpacing", label: "Label spacing" },
    { key: "tableCellPaddingX", label: "Table cell padding X" },
    { key: "tableCellPaddingY", label: "Table cell padding Y" },
    { key: "tableRowGap", label: "Table row gap" },
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

function renderSpacingControls() {
    renderSpacingRailButton();
    renderSpacingPanel();
}

function renderSpacingRailButton() {
    if (document.querySelector('[data-drawer-panel="spacing"]')) {
        return;
    }

    const shapeButton = document.querySelector('[data-drawer-panel="shape"]');
    const railButton = document.createElement("button");
    const icon = document.createElement("span");

    railButton.type = "button";
    railButton.className = "drawer-rail-button has-tooltip";
    railButton.dataset.drawerPanel = "spacing";
    railButton.dataset.tooltip = "Spacing";
    railButton.dataset.tooltipPosition = "right";
    railButton.setAttribute("aria-controls", "leftDrawer");
    railButton.setAttribute("aria-label", "Open spacing controls");

    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "↕";

    railButton.append(icon);

    shapeButton?.before(railButton);
}

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

    content.className = "control-card-content";
    content.append(createSpacingUnitControl(), createSpacingScaleControls(), createSpacingAssignmentControls());

    panel.append(summary, content);
    shapePanel?.before(panel);
}

function createSpacingUnitControl() {
    const fragment = document.createDocumentFragment();
    const label = document.createElement("label");
    const select = document.createElement("select");
    const note = document.createElement("p");

    label.textContent = "Unit";
    select.id = "spacingUnitControl";
    select.dataset.themeControl = "spacing";

    SPACING_UNIT_OPTIONS.forEach((unit) => {
        const option = document.createElement("option");

        option.value = unit;
        option.textContent = unit;
        select.append(option);
    });

    note.textContent = "em is relational and may vary by component context.";

    label.append(select);
    fragment.append(label, note);

    return fragment;
}

function createSpacingScaleControls() {
    const group = document.createElement("fieldset");
    const legend = document.createElement("legend");

    legend.textContent = "Scale";
    group.append(legend);

    SPACING_TOKENS.forEach((token) => {
        const label = document.createElement("label");
        const input = document.createElement("input");

        label.textContent = token.label;
        input.type = "number";
        input.min = "0";
        input.step = "0.05";
        input.inputMode = "decimal";
        input.dataset.themeControl = "spacing";
        input.dataset.spacingScale = token.key;

        label.append(input);
        group.append(label);
    });

    return group;
}

function createSpacingAssignmentControls() {
    const group = document.createElement("fieldset");
    const legend = document.createElement("legend");

    legend.textContent = "Assignments";
    group.append(legend);

    SPACING_ASSIGNMENTS.forEach((assignment) => {
        const label = document.createElement("label");
        const select = document.createElement("select");

        label.textContent = assignment.label;
        select.dataset.themeControl = "spacing";
        select.dataset.spacingAssignment = assignment.key;

        SPACING_TOKENS.forEach((token) => {
            const option = document.createElement("option");

            option.value = token.key;
            option.textContent = token.label;
            select.append(option);
        });

        label.append(select);
        group.append(label);
    });

    return group;
}

function getSpacingTokenLabel(tokenKey) {
    return SPACING_TOKENS.find((token) => token.key === tokenKey)?.label || tokenKey;
}

function getSpacingAssignmentLabel(assignmentKey) {
    return SPACING_ASSIGNMENTS.find((assignment) => assignment.key === assignmentKey)?.label || assignmentKey;
}

function updateSpacingFromControls() {
    const { spacing } = ThemeForge.theme;
    const unitControl = document.querySelector("#spacingUnitControl");

    if (unitControl && SPACING_UNIT_OPTIONS.includes(unitControl.value)) {
        spacing.unit = unitControl.value;
    }

    document.querySelectorAll("[data-spacing-scale]").forEach((control) => {
        const tokenName = control.dataset.spacingScale;
        const value = Number(control.value);

        if (!Number.isNaN(value)) {
            spacing.scale[tokenName] = value;
        }
    });

    document.querySelectorAll("[data-spacing-assignment]").forEach((control) => {
        const assignmentName = control.dataset.spacingAssignment;

        if (spacing.scale[control.value] !== undefined) {
            spacing.assignments[assignmentName] = control.value;
        }
    });
}

function updateThemeFromControls(event) {
    const label = getControlHistoryLabel(event.target);

    ThemeForge.history.recordContinuousChange(label);

    ThemeForge.theme.typography.baseFontSize = Number(document.querySelector("#baseFontSize").value);
    ThemeForge.theme.typography.headingScale = Number(document.querySelector("#headingScale").value) / 100;

    ThemeForge.theme.shape.radius = Number(document.querySelector("#radiusControl").value);
    ThemeForge.theme.shape.borderWidth = Number(document.querySelector("#borderWidthControl").value);
    ThemeForge.theme.shape.overlayBlur = Number(document.querySelector("#overlayBlurControl").value);

    updateSpacingFromControls();

    ThemeForge.history.updateLatestChangeDetail(getControlHistoryDetail(event.target));

    ThemeForge.applyTheme();
    ThemeForge.accessibility.updateScoreBadge();
}

function getControlHistoryLabel(control) {
    const labels = {
        baseFontSize: "Changed base font size",
        headingScale: "Changed heading scale",
        radiusControl: "Changed border radius",
        borderWidthControl: "Changed border width",
        overlayBlurControl: "Changed overlay blur",
        spacingUnitControl: "Changed spacing unit",
    };

    if (control.dataset.spacingScale) {
        return `Changed spacing token ${getSpacingTokenLabel(control.dataset.spacingScale)}`;
    }

    if (control.dataset.spacingAssignment) {
        return `Changed ${getSpacingAssignmentLabel(control.dataset.spacingAssignment).toLowerCase()} spacing`;
    }

    return labels[control.id] || "Changed theme control";
}

function getControlHistoryDetail(control) {
    const snapshot = ThemeForge.history.getLatestUndoSnapshot();

    if (!snapshot) {
        return null;
    }

    const details = {
        baseFontSize: {
            label: "Base Font Size",
            before: `${snapshot.typography.baseFontSize}px`,
            after: `${ThemeForge.theme.typography.baseFontSize}px`,
        },
        headingScale: {
            label: "Heading Scale",
            before: `${Math.round(snapshot.typography.headingScale * 100)}%`,
            after: `${Math.round(ThemeForge.theme.typography.headingScale * 100)}%`,
        },
        radiusControl: {
            label: "Border Radius",
            before: `${snapshot.shape.radius}px`,
            after: `${ThemeForge.theme.shape.radius}px`,
        },
        borderWidthControl: {
            label: "Border Width",
            before: `${snapshot.shape.borderWidth}px`,
            after: `${ThemeForge.theme.shape.borderWidth}px`,
        },
        overlayBlurControl: {
            label: "Overlay Blur",
            before: `${snapshot.shape.overlayBlur}px`,
            after: `${ThemeForge.theme.shape.overlayBlur}px`,
        },
        spacingUnitControl: {
            label: "Spacing Unit",
            before: snapshot.spacing.unit,
            after: ThemeForge.theme.spacing.unit,
        },
    };

    const detail = details[control.id] || getSpacingControlHistoryDetail(control, snapshot);

    if (!detail) {
        return null;
    }

    return {
        type: "value",
        ...detail,
    };
}

function getSpacingControlHistoryDetail(control, snapshot) {
    if (control.dataset.spacingScale) {
        const tokenName = control.dataset.spacingScale;

        return {
            label: `Spacing ${getSpacingTokenLabel(tokenName)}`,
            before: `${snapshot.spacing.scale[tokenName]}${snapshot.spacing.unit}`,
            after: `${ThemeForge.theme.spacing.scale[tokenName]}${ThemeForge.theme.spacing.unit}`,
        };
    }

    if (control.dataset.spacingAssignment) {
        const assignmentName = control.dataset.spacingAssignment;

        return {
            label: getSpacingAssignmentLabel(assignmentName),
            before: getSpacingTokenLabel(snapshot.spacing.assignments[assignmentName]),
            after: getSpacingTokenLabel(ThemeForge.theme.spacing.assignments[assignmentName]),
        };
    }

    return null;
}

function syncThemeControlsFromState() {
    document.querySelector("#baseFontSize").value = ThemeForge.theme.typography.baseFontSize;
    document.querySelector("#headingScale").value = ThemeForge.theme.typography.headingScale * 100;

    document.querySelector("#radiusControl").value = ThemeForge.theme.shape.radius;
    document.querySelector("#borderWidthControl").value = ThemeForge.theme.shape.borderWidth;
    document.querySelector("#overlayBlurControl").value = ThemeForge.theme.shape.overlayBlur;

    syncSpacingControlsFromState();
}

function syncSpacingControlsFromState() {
    const { spacing } = ThemeForge.theme;
    const unitControl = document.querySelector("#spacingUnitControl");

    if (unitControl) {
        unitControl.value = spacing.unit;
    }

    document.querySelectorAll("[data-spacing-scale]").forEach((control) => {
        control.value = spacing.scale[control.dataset.spacingScale];
    });

    document.querySelectorAll("[data-spacing-assignment]").forEach((control) => {
        control.value = spacing.assignments[control.dataset.spacingAssignment];
    });
}

ThemeForge.refreshThemeInterface = function refreshThemeInterface() {
    syncThemeControlsFromState();
    updateThemeModeControls();
    ThemeForge.applyTheme();
    ThemeForge.colorEditor.render();
    ThemeForge.accessibility.updateScoreBadge();
};

function bindControls() {
    const controls = document.querySelectorAll(
        "#baseFontSize, #headingScale, #radiusControl, #borderWidthControl, #overlayBlurControl, [data-theme-control='spacing']",
    );

    controls.forEach((control) => {
        control.addEventListener("input", updateThemeFromControls);
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