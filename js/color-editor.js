ThemeForge.colorEditor = {
    activeColorKey: "primary",
    activeColorGroup: "core",
    activeColorKeysByGroup: {
        core: "primary",
        states: "success",
        text: "text",
        ui: "border",
    },

    init() {
        ThemeForge.ui = ThemeForge.ui || {};
        ThemeForge.ui.preferredColorFormat = localStorage.getItem("themeForge.preferredColorFormat") || "hsl";

        this.bindTokenButtons();
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
        });
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
            value.textContent = ThemeForge.getColorValue(tokenColor, format);
        });

        this.updateAllTabIndicators();
    },

    getLabel(key) {
        return key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
    },
};
