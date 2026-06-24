const APP_APPEARANCE_STORAGE_KEY = "themeForge.appAppearance";
const APP_APPEARANCE_OPTIONS = ["light", "dark", "system"];

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

    ThemeForge.history.recordChange(`Switched to ${mode} mode`);

    ThemeForge.theme.activeMode = mode;

    ThemeForge.history.updateLatestChangeDetail({
        type: "value",
        label: "Theme Mode",
        before: mode === "light" ? "Dark" : "Light",
        after: mode === "light" ? "Light" : "Dark",
    });

    ThemeForge.refreshThemeInterface();
    ThemeForge.history.saveSession();
}

function updateThemeFromControls(event) {
    const label = getControlHistoryLabel(event.target);

    ThemeForge.history.recordContinuousChange(label);

    ThemeForge.theme.typography.baseFontSize = Number(document.querySelector("#baseFontSize").value);
    ThemeForge.theme.typography.headingScale = Number(document.querySelector("#headingScale").value) / 100;

    ThemeForge.theme.shape.radius = Number(document.querySelector("#radiusControl").value);
    ThemeForge.theme.shape.borderWidth = Number(document.querySelector("#borderWidthControl").value);
    ThemeForge.theme.shape.overlayBlur = Number(document.querySelector("#overlayBlurControl").value);

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
    };

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
    };

    const detail = details[control.id];

    if (!detail) {
        return null;
    }

    return {
        type: "value",
        ...detail,
    };
}

function syncThemeControlsFromState() {
    document.querySelector("#baseFontSize").value = ThemeForge.theme.typography.baseFontSize;
    document.querySelector("#headingScale").value = ThemeForge.theme.typography.headingScale * 100;

    document.querySelector("#radiusControl").value = ThemeForge.theme.shape.radius;
    document.querySelector("#borderWidthControl").value = ThemeForge.theme.shape.borderWidth;
    document.querySelector("#overlayBlurControl").value = ThemeForge.theme.shape.overlayBlur;
}

ThemeForge.refreshThemeInterface = function refreshThemeInterface() {
    syncThemeControlsFromState();
    updateThemeModeControls();
    ThemeForge.applyTheme();
    ThemeForge.colorEditor.render();
    ThemeForge.accessibility.updateScoreBadge();
};

function bindControls() {
    const controls = document.querySelectorAll("#baseFontSize, #headingScale, #radiusControl, #borderWidthControl, #overlayBlurControl");

    controls.forEach((control) => {
        control.addEventListener("input", updateThemeFromControls);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    bindControls();
    bindThemeModeControls();
    bindAppAppearanceControl();
    bindSettingsControl();
    applyAppAppearance(getStoredAppAppearancePreference());
    updateThemeModeControls();
    ThemeForge.history.init();
    ThemeForge.applyTheme();
    ThemeForge.colorEditor.init();
    ThemeForge.accessibility.init();
});
