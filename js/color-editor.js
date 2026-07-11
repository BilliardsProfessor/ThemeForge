ThemeForge.colorEditor = {
    activeColorKey: "primary",
    activeColorGroup: "core",
    activeColorKeysByGroup: {
        core: "primary",
        states: "success",
        text: "text",
        ui: "border",
    },
    protectionHelpStorageKey: "themeForge.dismissProtectColorHelp",
    protectionHelpLayer: null,

    init() {
        ThemeForge.ui = ThemeForge.ui || {};
        ThemeForge.ui.preferredColorFormat = localStorage.getItem("themeForge.preferredColorFormat") || "hsl";

        this.bindTokenButtons();
        this.bindProtectionControl();
        this.bindGroupTabs();
        this.bindEditorControls();
        this.render();

        window.addEventListener("resize", () => {
            this.updateAllTabIndicators();
        });

        if ("ResizeObserver" in window) {
            const tabObserver = new ResizeObserver(() => {
                this.updateAllTabIndicators();
            });

            document.querySelectorAll(".segmented-control, .color-group-tabs").forEach((tabList) => {
                tabObserver.observe(tabList);
            });
        }
    },

    getActiveColor() {
        return ThemeForge.getActiveColors()[this.activeColorKey];
    },

    getActiveColorLabel() {
        return this.getLabel(this.activeColorKey);
    },

    getColorHistoryLabel(detail) {
        return `${this.getActiveColorLabel()} color ${detail}`;
    },

    getColorHistoryDetail(snapshot = null) {
        snapshot = snapshot || ThemeForge.history.getLatestUndoSnapshot();

        if (!snapshot) {
            return null;
        }

        return {
            type: "color",
            label: `${this.getActiveColorLabel()} color`,
            before: ThemeForge.history.cloneTheme(snapshot.modes[snapshot.activeMode].colors[this.activeColorKey]),
            after: ThemeForge.history.cloneTheme(this.getActiveColor()),
        };
    },

    applyColorControlValue(input) {
        if (input.id === "colorNativePicker" || input.id === "hexValue") {
            const rgb = hexToRgb(input.value);

            if (!rgb) return false;

            Object.assign(this.getActiveColor(), rgbToHsl(rgb), {
                a: this.getActiveColor().a,
            });

            return true;
        }

        if (input.dataset.rgbChannel) {
            const rawValue = input.value.trim();

            if (rawValue === "") return false;

            const rgb = hslToRgb(this.getActiveColor());
            const channel = input.dataset.rgbChannel;
            const value = Math.max(0, Math.min(255, Number(rawValue)));

            if (Number.isNaN(value)) return false;

            rgb[channel] = value;

            Object.assign(this.getActiveColor(), rgbToHsl(rgb), {
                a: this.getActiveColor().a,
            });

            return true;
        }

        if (input.dataset.hslChannel) {
            const rawValue = input.value.trim();

            if (rawValue === "") return false;

            const channel = input.dataset.hslChannel;
            const maxValue = channel === "h" ? 359 : 100;
            const value = Math.max(0, Math.min(maxValue, Number(rawValue)));

            if (Number.isNaN(value)) return false;

            this.getActiveColor()[channel] = value;

            return true;
        }

        if (input.id === "alphaValue" || input.id === "alphaNumber") {
            const alphaPercent = Number(input.value);
            const clampedAlphaPercent = Math.max(0, Math.min(100, alphaPercent));

            if (Number.isNaN(clampedAlphaPercent)) return false;

            this.getActiveColor().a = clampedAlphaPercent / 100;

            return true;
        }

        return false;
    },

    updateColorFromControl(input, detailLabel, options = {}) {
        const historySnapshot = options.historySnapshot || ThemeForge.history.cloneTheme(ThemeForge.theme);

        if (!this.applyColorControlValue(input)) {
            return;
        }

        if (!options.isPreviewOnly && !ThemeForge.history.themesMatch(historySnapshot, ThemeForge.theme)) {
            ThemeForge.history.recordContinuousChange(this.getColorHistoryLabel(detailLabel), null, historySnapshot);
            ThemeForge.history.updateLatestChangeDetail(this.getColorHistoryDetail(historySnapshot));
        }

        ThemeForge.applyTheme();
        ThemeForge.accessibility.updateScoreBadge();
        this.render();
    },

    enhanceDeferredColorSlider(input, detailLabel) {
        input.addEventListener("pointerdown", (event) => {
            if (event.button !== 0) {
                return;
            }

            beginDeferredControlChange(input);

            if (input.setPointerCapture) {
                input.setPointerCapture(event.pointerId);
            }
        });

        input.addEventListener(
            "input",
            (event) => {
                const historySnapshot = getDeferredControlSnapshot(input);

                if (!historySnapshot) {
                    return;
                }

                event.stopImmediatePropagation();

                this.updateColorFromControl(input, detailLabel, {
                    isPreviewOnly: true,
                    historySnapshot,
                });
            },
            true,
        );

        input.addEventListener("pointerup", () => {
            const historySnapshot = getDeferredControlSnapshot(input);

            if (!historySnapshot) {
                return;
            }

            this.updateColorFromControl(input, detailLabel, {
                historySnapshot,
            });

            cancelDeferredControlChange(input);
        });

        input.addEventListener("pointercancel", () => {
            cancelDeferredControlChange(input);
        });
    },

    bindTokenButtons() {
        document.querySelectorAll("[data-color-token]").forEach((button) => {
            button.addEventListener("click", () => {
                this.activeColorKey = button.dataset.colorToken;
                this.activeColorKeysByGroup[this.activeColorGroup] = this.activeColorKey;
                this.render();
            });

            button.querySelector(".color-token-swatch")?.addEventListener("click", () => {
                this.toggleColorProtection(button.dataset.colorToken);
            });
        });
    },

    bindProtectionControl() {
        document.querySelector("#colorProtectionToggle")?.addEventListener("change", (event) => {
            this.setColorProtection(this.activeColorKey, event.target.checked);
        });
    },

    toggleColorProtection(colorKey) {
        const color = ThemeForge.getActiveColors()[colorKey];

        if (!color) {
            return;
        }

        this.setColorProtection(colorKey, !color.locked);
    },

    setColorProtection(colorKey, isProtected) {
        const color = ThemeForge.getActiveColors()[colorKey];

        if (!color || color.locked === isProtected) {
            return;
        }

        const label = this.getLabel(colorKey);
        const historyLabel = isProtected ? `Protected ${label} color` : `Unprotected ${label} color`;

        ThemeForge.history.recordChange(historyLabel);

        color.locked = isProtected;

        ThemeForge.history.updateLatestChangeDetail({
            type: "value",
            label: `${label} protection`,
            before: isProtected ? "Unprotected" : "Protected",
            after: isProtected ? "Protected" : "Unprotected",
        });

        this.render();
        ThemeForge.history.saveSession();

        if (isProtected && localStorage.getItem(this.protectionHelpStorageKey) !== "true") {
            this.openProtectionHelp();
        }
    },

    getProtectionIcon(color) {
        const path = color.locked
            ? "M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4m0 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3"
            : "M12 0a4 4 0 0 1 4 4v2.5h-1V4a3 3 0 1 0-6 0v2h.5A2.5 2.5 0 0 1 12 8.5v5A2.5 2.5 0 0 1 9.5 16h-7A2.5 2.5 0 0 1 0 13.5v-5A2.5 2.5 0 0 1 2.5 6H8V4a4 4 0 0 1 4-4";

        return `
        <svg class="color-protection-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="${path}" />
        </svg>
    `;
    },

    getProtectionIconColor(color) {
        const foreground = hslToRgb(color);
        const backdrop = document.body.dataset.appMode === "dark" ? hslToRgb({ h: 222, s: 40, l: 13 }) : { r: 255, g: 255, b: 255 };

        const alpha = Number(color.a ?? 1);
        const composite = {
            r: Math.round(foreground.r * alpha + backdrop.r * (1 - alpha)),
            g: Math.round(foreground.g * alpha + backdrop.g * (1 - alpha)),
            b: Math.round(foreground.b * alpha + backdrop.b * (1 - alpha)),
        };

        const getLinearChannel = (channel) => {
            const value = channel / 255;
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        };

        const luminance = 0.2126 * getLinearChannel(composite.r) + 0.7152 * getLinearChannel(composite.g) + 0.0722 * getLinearChannel(composite.b);

        const blackContrast = (luminance + 0.05) / 0.05;
        const whiteContrast = 1.05 / (luminance + 0.05);

        return blackContrast >= whiteContrast ? "#000000" : "#ffffff";
    },

    openProtectionHelp() {
        this.closeProtectionHelp();

        const drawer = document.querySelector("#leftDrawer");
        const layer = document.createElement("div");
        const dialog = document.createElement("div");
        const message = document.createElement("p");
        const preference = document.createElement("label");
        const checkbox = document.createElement("input");
        const checkboxText = document.createElement("span");
        const button = document.createElement("button");

        layer.className = "color-protection-help-layer";
        dialog.className = "color-protection-help";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        dialog.setAttribute("aria-labelledby", "colorProtectionHelpTitle");

        dialog.innerHTML = `
        <h3 id="colorProtectionHelpTitle">Color protected</h3>
    `;

        message.textContent = "Theme generation will not affect this color token. You can still edit it manually.";

        preference.className = "color-protection-help-preference";
        checkbox.type = "checkbox";
        checkboxText.textContent = "Don't show this message again";
        preference.append(checkbox, checkboxText);

        button.type = "button";
        button.className = "color-protection-help-confirm";
        button.textContent = "OK";

        button.addEventListener("click", () => {
            if (checkbox.checked) {
                localStorage.setItem(this.protectionHelpStorageKey, "true");
            }

            this.closeProtectionHelp();
        });

        layer.addEventListener("click", (event) => {
            if (event.target === layer) {
                this.closeProtectionHelp();
            }
        });

        dialog.append(message, preference, button);
        layer.append(dialog);
        drawer.append(layer);

        this.protectionHelpLayer = layer;

        const handleKeydown = (event) => {
            if (event.key === "Escape") {
                this.closeProtectionHelp();
            }
        };

        layer.handleKeydown = handleKeydown;
        document.addEventListener("keydown", handleKeydown);

        button.focus();
    },

    closeProtectionHelp() {
        if (!this.protectionHelpLayer) {
            return;
        }

        document.removeEventListener("keydown", this.protectionHelpLayer.handleKeydown);
        this.protectionHelpLayer.remove();
        this.protectionHelpLayer = null;
    },

    bindGroupTabs() {
        document.querySelectorAll("[data-color-group-tab]").forEach((button) => {
            button.addEventListener("click", () => {
                this.activeColorGroup = button.dataset.colorGroupTab;

                const rememberedColorKey = this.activeColorKeysByGroup[this.activeColorGroup];
                const rememberedToken = document.querySelector(`[data-color-token="${rememberedColorKey}"][data-color-group="${this.activeColorGroup}"]`);
                const firstTokenInGroup = document.querySelector(`[data-color-token][data-color-group="${this.activeColorGroup}"]`);

                this.activeColorKey = rememberedToken ? rememberedToken.dataset.colorToken : firstTokenInGroup.dataset.colorToken;

                this.render();
            });
        });
    },

    bindEditorControls() {
        document.querySelector("#colorNativePicker").addEventListener("input", (event) => {
            this.updateColorFromControl(event.target, "color");
        });

        document.querySelector("#hexValue").addEventListener("input", (event) => {
            this.updateColorFromControl(event.target, "HEX value");
        });

        document.querySelectorAll("[data-color-format]").forEach((button) => {
            button.addEventListener("click", () => {
                ThemeForge.ui.preferredColorFormat = button.dataset.colorFormat;
                localStorage.setItem("themeForge.preferredColorFormat", ThemeForge.ui.preferredColorFormat);
                this.render();
            });
        });

        document.querySelectorAll("[data-rgb-channel]").forEach((input) => {
            input.addEventListener("input", () => {
                this.updateColorFromControl(input, "RGB value");
            });

            if (input.type === "range") {
                this.enhanceDeferredColorSlider(input, "RGB value");
            }
        });

        document.querySelectorAll("[data-hsl-channel]").forEach((input) => {
            input.addEventListener("input", () => {
                this.updateColorFromControl(input, "HSL value");
            });

            if (input.type === "range") {
                this.enhanceDeferredColorSlider(input, "HSL value");
            }
        });

        document.querySelectorAll("#alphaValue, #alphaNumber").forEach((input) => {
            input.addEventListener("input", () => {
                this.updateColorFromControl(input, "alpha");
            });

            if (input.type === "range") {
                this.enhanceDeferredColorSlider(input, "alpha");
            }
        });
    },

    updateTabIndicator(tabList) {
        const activeButton = tabList.querySelector("button.active");

        if (!activeButton) {
            return;
        }

        const tabListRect = tabList.getBoundingClientRect();
        const activeButtonRect = activeButton.getBoundingClientRect();
        const offset = activeButtonRect.left - tabListRect.left;

        tabList.style.setProperty("--active-tab-width", `${activeButtonRect.width}px`);
        tabList.style.setProperty("--active-tab-offset", `${offset}px`);
    },

    updateAllTabIndicators() {
        document.querySelectorAll(".segmented-control, .color-group-tabs").forEach((tabList) => {
            this.updateTabIndicator(tabList);
        });
    },

    render() {
        const color = this.getActiveColor();
        const rgb = hslToRgb(color);
        const hex = rgbToHex(rgb);
        const format = ThemeForge.ui.preferredColorFormat;

        document.querySelector("#activeColorName").textContent = this.getLabel(this.activeColorKey);
        document.querySelector("#colorProtectionToggle").checked = Boolean(color.locked);
        document.querySelector("#colorNativePicker").value = hex;
        document.querySelector("#hexValue").value = hex;

        document.querySelector("#rgbR").value = rgb.r;
        document.querySelector("#rgbRNumber").value = rgb.r;
        document.querySelector("#rgbG").value = rgb.g;
        document.querySelector("#rgbGNumber").value = rgb.g;
        document.querySelector("#rgbB").value = rgb.b;
        document.querySelector("#rgbBNumber").value = rgb.b;

        document.querySelector("#hslH").value = color.h;
        document.querySelector("#hslHNumber").value = color.h;
        document.querySelector("#hslS").value = color.s;
        document.querySelector("#hslSNumber").value = color.s;
        document.querySelector("#hslL").value = color.l;
        document.querySelector("#hslLNumber").value = color.l;

        const alphaPercent = Math.round(color.a * 100);

        document.querySelector("#alphaValue").value = alphaPercent;
        document.querySelector("#alphaNumber").value = alphaPercent;
        document.querySelector(".segmented-control").dataset.activeFormat = format;

        document.querySelectorAll("[data-color-format]").forEach((button) => {
            button.classList.toggle("active", button.dataset.colorFormat === format);
        });

        document.querySelectorAll("[data-format-panel]").forEach((panel) => {
            panel.hidden = panel.dataset.formatPanel !== format;
        });

        document.querySelector(".color-group-tabs").dataset.activeGroup = this.activeColorGroup;

        document.querySelectorAll("[data-color-group-tab]").forEach((button) => {
            button.classList.toggle("active", button.dataset.colorGroupTab === this.activeColorGroup);
        });

        document.querySelectorAll("[data-color-token]").forEach((button) => {
            button.hidden = button.dataset.colorGroup !== this.activeColorGroup;

            const token = button.dataset.colorToken;
            const tokenColor = ThemeForge.getActiveColors()[token];
            const swatch = button.querySelector(".color-token-swatch");
            const value = button.querySelector(".color-token-value");

            button.classList.toggle("active", token === this.activeColorKey);
            swatch.style.backgroundColor = ThemeForge.getColorValue(tokenColor);
            const label = this.getLabel(token);

            swatch.innerHTML = this.getProtectionIcon(tokenColor);
            swatch.classList.toggle("is-protected", Boolean(tokenColor.locked));
            swatch.style.setProperty("--color-protection-icon", this.getProtectionIconColor(tokenColor));
            swatch.dataset.tooltip = tokenColor.locked ? `${label} is protected from theme generation` : `Protect ${label} from theme generation`;
            swatch.dataset.tooltipPlacement = "left";
            swatch.classList.add("has-tooltip");
            value.textContent = ThemeForge.getColorValue(tokenColor, format);
        });

        this.updateAllTabIndicators();
    },

    getLabel(key) {
        return key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
    },
};
