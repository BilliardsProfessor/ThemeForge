ThemeForge.export = {
    filenamePrefix: "theme-forge",
    fallbackSlug: "theme",
    schemaVersion: 1,

    activeTarget: localStorage.getItem("themeForge.export.activeTarget") || "css",

    hasCustomFilename: false,
    filenameBase: "",

    targets: {
        css: { label: "CSS" },
        scss: { label: "SCSS" },
        json: { label: "Theme Forge JSON" },
    },

    settings: {
        css: {
            selectorType: "root",
            themeModes: ["light", "dark"],
            colorFormat: "hsl",
            includeComments: true,
            includeExample: false,
        },
        scss: {
            themeModes: ["light", "dark"],
            colorFormat: "hsl",
            includeComments: true,
            includeExample: false,
            variablePrefix: "tf",
        },
        json: { prettyPrint: true },
    },

    exportMenu: null,
    exportMenuButton: null,
    exportMenuList: null,

    adjectivesByMood: {
        dark: ["Midnight", "Shadow", "Deep", "Velvet"],
        light: ["Pearl", "Frost", "Airy", "Luminous"],
        vivid: ["Electric", "Vivid", "Bold", "Radiant"],
        muted: ["Muted", "Soft", "Dusty", "Stone"],
        balanced: ["Luscious", "Solar", "Arctic", "Golden"],
    },

    nounsByHue: {
        red: ["Crimson", "Ruby", "Ember", "Rose", "Garnet"],
        orange: ["Ember", "Copper", "Marigold", "Cider", "Canyon"],
        yellow: ["Honey", "Amber", "Sunbeam", "Gold", "Wheat"],
        green: ["Sage", "Forest", "Moss", "Jade", "Fern"],
        cyan: ["Current", "Lagoon", "Glacier", "Teal", "Mist"],
        blue: ["Azure", "Current", "Harbor", "Sky", "Indigo"],
        purple: ["Grape", "Amethyst", "Violet", "Plum", "Iris"],
        pink: ["Bloom", "Orchid", "Rose", "Petal", "Fuchsia"],
    },

    init() {
        this.initExportMenu();
        this.initWorkspace();
    },

    initExportMenu() {
        this.exportMenu = document.querySelector("[data-export-menu]");
        this.exportMenuButton = document.querySelector("#exportMenuBtn");
        this.exportMenuList = document.querySelector("[data-export-menu-list]");

        if (!this.exportMenu || !this.exportMenuButton || !this.exportMenuList) return;

        this.exportMenuButton.addEventListener("click", () => {
            this.toggleExportMenu();
        });

        this.exportMenu.addEventListener("click", (event) => {
            this.handleExportMenuClick(event);
        });

        document.addEventListener("click", (event) => {
            this.handleDocumentClick(event);
        });

        document.addEventListener("keydown", (event) => {
            this.handleDocumentKeydown(event);
        });

        this.closeExportMenu();
    },

    initWorkspace() {
        document.querySelectorAll("[data-export-target-tab]").forEach((button) => {
            button.addEventListener("click", () => {
                this.setActiveTarget(button.dataset.exportTargetTab);
            });
        });

        document.querySelector("[data-export-target-select]")?.addEventListener("change", (event) => {
            this.setActiveTarget(event.target.value);
        });

        document.querySelector("[data-export-filename-base]")?.addEventListener("input", (event) => {
            this.hasCustomFilename = true;
            this.filenameBase = event.target.value;
            this.updateWorkspace();
        });

        document.querySelector("[data-export-copy]")?.addEventListener("click", () => {
            this.copyActiveOutput();
        });

        document.querySelector("[data-export-download]")?.addEventListener("click", () => {
            this.downloadActiveOutput();
        });

        document.querySelectorAll("[data-export-setting]").forEach((control) => {
            const eventName = control.tagName.toLowerCase() === "input" && control.type === "text" ? "input" : "change";

            control.addEventListener(eventName, (event) => {
                this.handleExportSettingChange(event);
            });
        });

        this.setActiveTarget(this.activeTarget);
        this.updateWorkspace();
    },

    setActiveTarget(target) {
        if (!this.targets[target]) {
            target = "css";
        }

        this.activeTarget = target;
        localStorage.setItem("themeForge.export.activeTarget", target);

        document.querySelectorAll("[data-export-target-tab]").forEach((button) => {
            const isActive = button.dataset.exportTargetTab === target;

            button.classList.toggle("active", isActive);
            button.setAttribute("aria-selected", String(isActive));
        });

        const tabs = document.querySelector(".export-tabs");

        if (tabs) {
            tabs.dataset.activeExportTarget = target;
            this.updateTabIndicator(tabs);
        }

        const select = document.querySelector("[data-export-target-select]");

        if (select) {
            select.value = target;
        }

        document.querySelectorAll("[data-export-options]").forEach((section) => {
            section.hidden = section.dataset.exportOptions !== target;
        });

        document.querySelectorAll(`[data-export-options="${target}"] [data-export-setting]`).forEach((control) => {
            const settingName = control.dataset.exportSetting;
            const settingValue = this.settings[target]?.[settingName];

            if (control.type === "checkbox") {
                if (settingName !== "themeModes") {
                    control.checked = Boolean(settingValue);
                }

                return;
            }

            if (settingValue !== undefined) {
                control.value = settingValue;
            }
        });

        document.querySelector("[data-export-target-title]")?.replaceChildren(this.targets[target].label);

        this.updateWorkspace();
    },

    handleExportSettingChange(event) {
        const control = event.target;
        const optionSection = control.closest("[data-export-options]");

        if (!optionSection) {
            return;
        }

        const target = optionSection.dataset.exportOptions;
        const settingName = control.dataset.exportSetting;

        if (!this.settings[target] || !settingName) {
            return;
        }

        if (settingName === "themeModes") {
            this.settings[target].themeModes = Array.from(optionSection.querySelectorAll("[data-export-setting='themeModes']:checked")).map(
                (input) => input.value,
            );

            this.updateWorkspace();
            return;
        }

        if (control.type === "checkbox") {
            this.settings[target][settingName] = control.checked;
            this.updateWorkspace();
            return;
        }

        this.settings[target][settingName] = control.value;
        this.updateWorkspace();
    },

    updateWorkspace() {
        const output = document.querySelector("[data-export-output]");
        const filenameInput = document.querySelector("[data-export-filename-base]");
        const filename = document.querySelector("[data-export-filename]");
        const scrollTop = output?.scrollTop || 0;
        const scrollLeft = output?.scrollLeft || 0;

        if (!output) {
            return;
        }

        if (filenameInput && !this.hasCustomFilename) {
            filenameInput.value = this.getSuggestedFilenameBase();
        }

        output.textContent = this.getActiveOutput();
        output.scrollTop = scrollTop;
        output.scrollLeft = scrollLeft;

        if (filename) {
            filename.textContent = this.getActiveFilename();
        }
    },

    getActiveOutput() {
        const themeName = this.generateThemeNameSuggestion();
        const options = this.getWorkspaceExportOptions();

        if (this.activeTarget === "scss") {
            return this.createScssExport(themeName, options);
        }

        if (this.activeTarget === "json") {
            const spacing = this.settings.json.prettyPrint ? 2 : 0;

            return JSON.stringify(this.createExportTheme(themeName), null, spacing);
        }

        return this.createCssExport(themeName, options);
    },

    getActiveFilename() {
        return `${this.getActiveFilenameBase()}.${this.getActiveFilenameExtension()}`;
    },

    getActiveFilenameBase() {
        const filenameBase = this.hasCustomFilename ? this.filenameBase : this.getSuggestedFilenameBase();

        return this.normalizeFilenameBase(filenameBase);
    },

    getSuggestedFilenameBase() {
        return `${this.filenamePrefix}-${this.slugifyThemeName(this.generateThemeNameSuggestion())}`;
    },

    getActiveFilenameExtension() {
        if (this.activeTarget === "scss") {
            return "scss";
        }

        if (this.activeTarget === "json") {
            return "json";
        }

        return "css";
    },

    normalizeFilenameBase(filenameBase) {
        const extension = this.getActiveFilenameExtension();
        const cleanBase = String(filenameBase)
            .trim()
            .replace(/[\\/:*?"<>|]+/g, "-")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");

        const matchingExtension = `.${extension}`;

        if (cleanBase.toLowerCase().endsWith(matchingExtension)) {
            return cleanBase.slice(0, -matchingExtension.length).replace(/^-+|-+$/g, "") || this.getSuggestedFilenameBase();
        }

        return cleanBase || this.getSuggestedFilenameBase();
    },

    getActiveMimeType() {
        if (this.activeTarget === "scss") {
            return "text/x-scss";
        }

        if (this.activeTarget === "json") {
            return "application/json";
        }

        return "text/css";
    },

    async copyActiveOutput() {
        try {
            await navigator.clipboard.writeText(this.getActiveOutput());
            this.setExportActionState("copy", "Copied", "success");
        } catch (error) {
            this.setExportActionState("copy", "Copy failed", "error");
        }
    },

    downloadActiveOutput() {
        try {
            this.downloadTextFile(this.getActiveOutput(), this.getActiveFilename(), this.getActiveMimeType());
            this.setExportActionState("download", "Downloaded", "success");
        } catch (error) {
            this.setExportActionState("download", "Download failed", "error");
        }
    },

    setExportActionState(actionName, message, state = "success") {
        const button = document.querySelector(`[data-export-${actionName}]`);

        if (!button) {
            return;
        }

        const originalTooltip = button.dataset.tooltip;
        const originalLabel = button.getAttribute("aria-label");

        button.dataset.exportActionState = state;
        button.dataset.tooltip = message;
        button.setAttribute("aria-label", message);

        window.setTimeout(() => {
            button.dataset.exportActionState = "idle";
            button.dataset.tooltip = originalTooltip;
            button.setAttribute("aria-label", originalLabel);
        }, 2000);
    },

    getWorkspaceExportOptions() {
        const settings = this.settings[this.activeTarget] || {};

        return {
            themeName: this.generateThemeNameSuggestion(),
            selectorType: settings.selectorType || "root",
            themeModes: settings.themeModes || ["light", "dark"],
            colorFormat: settings.colorFormat || "hsl",
            includeComments: settings.includeComments !== false,
            includeExample: settings.includeExample === true,
            variablePrefix: this.normalizeScssVariablePrefix(settings.variablePrefix || ""),
        };
    },

    normalizeScssVariablePrefix(prefix) {
        return String(prefix)
            .trim()
            .replace(/^\$+/, "")
            .replace(/[^a-zA-Z0-9_-]+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
    },

    updateTabIndicator(tabs) {
        const activeButton = tabs.querySelector("[data-export-target-tab].active");

        if (!activeButton) {
            return;
        }

        const tabsRect = tabs.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        tabs.style.setProperty("--active-tab-width", `${buttonRect.width}px`);
        tabs.style.setProperty("--active-tab-offset", `${buttonRect.left - tabsRect.left}px`);
    },

    toggleExportMenu() {
        if (!this.exportMenuList || !this.exportMenuButton) return;

        if (this.exportMenuList.hidden) {
            this.openExportMenu();
            return;
        }

        this.closeExportMenu();
    },

    openExportMenu() {
        if (!this.exportMenuList || !this.exportMenuButton) return;

        this.exportMenuList.hidden = false;
        this.exportMenuButton.setAttribute("aria-expanded", "true");
    },

    closeExportMenu() {
        if (!this.exportMenuList || !this.exportMenuButton) return;

        this.exportMenuList.hidden = true;
        this.exportMenuButton.setAttribute("aria-expanded", "false");
    },

    handleExportMenuClick(event) {
        const exportTypeButton = event.target.closest("[data-export-type]");

        if (!exportTypeButton || !this.exportMenu?.contains(exportTypeButton)) return;

        const exportType = exportTypeButton.dataset.exportType;

        this.closeExportMenu();

        if (exportType === "json") {
            this.startJsonExport();
            return;
        }

        if (exportType === "css") {
            this.startStylesExport();
        }
    },

    handleDocumentClick(event) {
        if (!this.exportMenu || this.exportMenu.contains(event.target)) return;

        this.closeExportMenu();
    },

    handleDocumentKeydown(event) {
        if (event.key !== "Escape" || !this.exportMenuList || this.exportMenuList.hidden) return;

        this.closeExportMenu();
        this.exportMenuButton?.focus();
    },

    async startJsonExport() {
        const suggestedName = this.generateThemeNameSuggestion();
        const themeName = await ThemeForge.appModal.prompt({
            eyebrow: "Export theme",
            title: "Name this theme",
            label: "Theme name",
            value: suggestedName,
            confirmText: "Export JSON",
            cancelText: "Cancel",
        });

        if (themeName === null) return;

        this.downloadJson(themeName.trim() || suggestedName);
    },

    downloadJson(themeName) {
        const exportTheme = this.createExportTheme(themeName);
        const json = JSON.stringify(exportTheme, null, 2);

        this.downloadTextFile(json, this.getJsonFilename(themeName), "application/json");
    },

    createExportTheme(themeName) {
        return {
            schemaVersion: this.schemaVersion,
            name: themeName,

            theme: { ...ThemeForge.theme, name: themeName },

            settings: {
                previewMode: ThemeForge.getActiveMode(),
                appAppearance: document.body.dataset.appModePreference || localStorage.getItem("themeForge.appAppearance") || "system",
            },
        };
    },

    async startStylesExport() {
        const suggestedName = this.generateThemeNameSuggestion();
        const options = await this.openStylesExportDialog(suggestedName);

        if (!options) return;

        this.downloadStyles(options.themeName, options);
    },

    openStylesExportDialog(suggestedName) {
        const { layer } = ThemeForge.appModal.getElements();

        if (!layer) return Promise.resolve(null);

        return new Promise((resolve) => {
            const form = document.createElement("form");
            const nameField = document.createElement("label");
            const nameLabel = document.createElement("span");
            const nameInput = document.createElement("input");
            const outputGroup = document.createElement("fieldset");
            const outputLegend = document.createElement("legend");
            const outputOptions = document.createElement("div");
            const selectorGroup = document.createElement("fieldset");
            const selectorLegend = document.createElement("legend");
            const selectorOptions = document.createElement("div");
            const modeGroup = document.createElement("fieldset");
            const modeLegend = document.createElement("legend");
            const modeOptions = document.createElement("div");
            const formatGroup = document.createElement("fieldset");
            const formatLegend = document.createElement("legend");
            const formatOptions = document.createElement("div");
            const commentsLabel = document.createElement("label");
            const commentsInput = document.createElement("input");
            const commentsText = document.createElement("span");
            const exampleLabel = document.createElement("label");
            const exampleInput = document.createElement("input");
            const exampleText = document.createElement("span");
            const cancelButton = document.createElement("button");
            const confirmButton = document.createElement("button");

            form.id = "cssExportForm";
            form.className = "export-options-form";

            nameField.className = "app-modal-field";
            nameLabel.textContent = "Theme name";
            nameInput.type = "text";
            nameInput.value = suggestedName;
            nameField.append(nameLabel, nameInput);

            outputGroup.className = "export-option-group";
            outputLegend.textContent = "Output";
            outputOptions.className = "export-radio-group";

            [
                { value: "css", label: "CSS custom properties", checked: true },
                { value: "scss", label: "SCSS theme maps" },
            ].forEach((option) => {
                outputOptions.append(this.createRadioOption("stylesheetOutput", option));
            });

            outputGroup.append(outputLegend, outputOptions);

            selectorGroup.className = "export-option-group";
            selectorLegend.textContent = "Selector";
            selectorOptions.className = "export-radio-group";
            [
                { value: "root", label: ":root", checked: true },
                { value: "themeClass", label: ".theme-{slug}" },
                { value: "previewArea", label: ".preview-area" },
            ].forEach((option) => {
                selectorOptions.append(this.createRadioOption("cssSelectorType", option));
            });
            selectorGroup.append(selectorLegend, selectorOptions);

            modeGroup.className = "export-option-group";
            modeLegend.textContent = "Theme modes";
            modeOptions.className = "export-radio-group";

            [
                { value: "light", label: "Light mode", checked: true },
                { value: "dark", label: "Dark mode", checked: true },
            ].forEach((option) => {
                modeOptions.append(this.createCheckboxOption("themeModes", option));
            });
            modeGroup.append(modeLegend, modeOptions);

            formatGroup.className = "export-option-group";
            formatLegend.textContent = "Color format";
            formatOptions.className = "export-radio-group";
            [
                { value: "hsl", label: "HSL", checked: true },
                { value: "hex", label: "HEX" },
                { value: "rgb", label: "RGB" },
            ].forEach((option) => {
                formatOptions.append(this.createRadioOption("cssColorFormat", option));
            });
            formatGroup.append(formatLegend, formatOptions);

            commentsLabel.className = "export-checkbox";
            commentsInput.type = "checkbox";
            commentsInput.checked = true;
            commentsText.textContent = "Include comments";
            commentsLabel.append(commentsInput, commentsText);

            exampleLabel.className = "export-checkbox";
            exampleInput.type = "checkbox";
            exampleInput.checked = false;
            exampleText.textContent = "Include example styles";
            exampleLabel.append(exampleInput, exampleText);

            cancelButton.type = "button";
            cancelButton.className = "app-modal-secondary-action";
            cancelButton.textContent = "Cancel";
            cancelButton.addEventListener("click", () => {
                ThemeForge.appModal.close(null);
            });

            confirmButton.type = "submit";
            confirmButton.className = "app-modal-primary-action";
            confirmButton.textContent = "Export Styles";
            confirmButton.setAttribute("form", form.id);

            form.addEventListener("submit", (event) => {
                event.preventDefault();

                const formData = new FormData(form);
                const themeName = nameInput.value.trim() || suggestedName;

                ThemeForge.appModal.close({
                    themeName,
                    stylesheetOutput: formData.get("stylesheetOutput") || "css",
                    selectorType: formData.get("cssSelectorType") || "root",
                    themeModes: formData.getAll("themeModes"),
                    colorFormat: formData.get("cssColorFormat") || "hsl",
                    includeComments: commentsInput.checked,
                    includeExample: exampleInput.checked,
                });
            });

            form.append(nameField, outputGroup, selectorGroup, modeGroup, formatGroup, commentsLabel, exampleLabel);

            ThemeForge.appModal.open({
                eyebrow: "Export styles",
                title: "Choose style options",
                body: form,
                footer: [cancelButton, confirmButton],
                initialFocusElement: nameInput,
            });

            ThemeForge.appModal.activeResolver = resolve;
            nameInput.select();
        });
    },

    createRadioOption(name, { value, label, checked = false }) {
        const optionLabel = document.createElement("label");
        const input = document.createElement("input");
        const text = document.createElement("span");

        input.type = "radio";
        input.name = name;
        input.value = value;
        input.checked = checked;
        text.textContent = label;

        optionLabel.append(input, text);

        return optionLabel;
    },

    createCheckboxOption(name, { value, label, checked = false }) {
        const optionLabel = document.createElement("label");
        const input = document.createElement("input");
        const text = document.createElement("span");

        input.type = "checkbox";
        input.name = name;
        input.value = value;
        input.checked = checked;
        text.textContent = label;

        optionLabel.append(input, text);

        return optionLabel;
    },

    downloadStyles(themeName, options) {
        if (options.stylesheetOutput === "scss") {
            const scss = this.createScssExport(themeName, options);

            this.downloadTextFile(scss, this.getScssFilename(themeName), "text/x-scss");
            return;
        }

        const css = this.createCssExport(themeName, options);

        this.downloadTextFile(css, this.getCssFilename(themeName), "text/css");
    },

    createCssExport(themeName, options = {}) {
        const colorFormat = options.colorFormat || "hsl";
        const includeComments = options.includeComments !== false;
        const selectedModes = this.getSelectedThemeModes(options);
        const block = this.getCssModeBlocks(themeName, options, colorFormat, selectedModes).join("\n\n");
        const example = options.includeExample ? `\n\n${this.getCssUsageExample(themeName, options)}` : "";

        if (!includeComments) return `${block}${example}`;

        return [
            "/*",
            "  Theme Forge Export",
            `  Theme: ${this.getCssCommentValue(themeName)}`,
            `  Schema: ${this.schemaVersion}`,
            `  Modes: ${selectedModes.join(", ")}`,
            "*/",
            "",
            `${block}${example}`,
        ].join("\n");
    },

    createScssExport(themeName, options = {}) {
        const colorFormat = options.colorFormat || "hsl";
        const includeComments = options.includeComments !== false;
        const selectedModes = this.getSelectedThemeModes(options);
        const variablePrefix = this.normalizeScssVariablePrefix(options.variablePrefix || "");
        const selector = this.getCssSelector(options.selectorType || "root", themeName);
        const output = this.getScssThemeOutput({
            colorFormat,
            includeComments,
            selectedModes,
            selector,
            variablePrefix,
        });
        const example = options.includeExample ? `\n\n${this.getScssUsageExample(variablePrefix, includeComments)}` : "";

        const header = includeComments
            ? [
                  "// Theme Forge SCSS Export",
                  `// Theme: ${this.getScssCommentValue(themeName)}`,
                  `// Schema: ${this.schemaVersion}`,
                  `// Modes: ${selectedModes.join(", ")}`,
                  "//",
                  "// Theme values are stored in Sass maps, then emitted as CSS custom",
                  "// properties so the compiled stylesheet can switch themes at runtime.",
                  "",
                  "// Sass string utilities preserve complex CSS values, including",
                  "// comma-separated shadow lists, as single map values.",
                  '@use "sass:string";',
                  "",
              ]
            : ['@use "sass:string";', ""];

        return `${[...header, ...output].join("\n")}${example}`;
    },

    getScssThemeOutput({ colorFormat, includeComments, selectedModes, selector, variablePrefix }) {
        const names = this.getScssExportNames(variablePrefix);
        const lines = [];
        const singleMode = selectedModes.length === 1;

        if (singleMode) {
            const mode = selectedModes[0];

            if (includeComments) {
                lines.push(
                    `// ${this.capitalize(mode)} mode was selected as the only exported theme.`,
                    `// Because no alternate mode is included, ${mode} mode becomes the`,
                    "// default color scheme wherever this stylesheet is applied.",
                    "",
                );
            }

            lines.push(
                ...this.getScssThemeMap(names.theme, this.getExportTokenGroups(colorFormat, mode), includeComments, `${this.capitalize(mode)} theme values`),
                "",
            );
        } else {
            lines.push(
                ...this.getScssThemeMap(names.lightTheme, this.getExportTokenGroups(colorFormat, "light"), includeComments, "Light-mode theme values"),
                "",
                ...this.getScssThemeMap(names.darkTheme, this.getExportTokenGroups(colorFormat, "dark"), includeComments, "Dark-mode theme values"),
                "",
            );
        }

        if (includeComments) {
            lines.push(
                "// Converts a theme map into runtime CSS custom properties.",
                "// Sass variables disappear during compilation; custom properties remain",
                "// available to the browser and can therefore change with the active mode.",
            );
        }

        lines.push(
            `@mixin ${names.mixin}($theme) {`,
            "  @each $token, $value in $theme {",
            `    --${names.customPropertyPrefix}#{\$token}: #{\$value};`,
            "  }",
            "}",
            "",
        );

        if (singleMode) {
            const mode = selectedModes[0];

            if (includeComments) {
                lines.push(`// Applies the selected ${mode} theme as the default theme.`);
            }

            lines.push(`${selector} {`, `  color-scheme: ${mode};`, `  @include ${names.mixin}(${names.theme});`, "}");

            return lines;
        }

        if (includeComments) {
            lines.push("// Light mode is the default when both modes are exported.");
        }

        lines.push(`${selector} {`, "  color-scheme: light;", `  @include ${names.mixin}(${names.lightTheme});`, "}", "");

        if (includeComments) {
            lines.push("// Replaces the custom properties when the operating system requests", "// a dark color scheme.");
        }

        lines.push(
            "@media (prefers-color-scheme: dark) {",
            `  ${selector} {`,
            "    color-scheme: dark;",
            `    @include ${names.mixin}(${names.darkTheme});`,
            "  }",
            "}",
        );

        return lines;
    },

    getScssExportNames(prefix = "") {
        const namePrefix = prefix ? `${prefix}-` : "";

        return {
            theme: `$${namePrefix}theme`,
            lightTheme: `$${namePrefix}theme-light`,
            darkTheme: `$${namePrefix}theme-dark`,
            mixin: `${namePrefix}theme-properties`,
            customPropertyPrefix: namePrefix,
        };
    },

    getScssThemeMap(mapName, groups, includeComments, description) {
        const lines = [];

        if (includeComments) {
            lines.push(`// ${description}.`);
        }

        lines.push(`${mapName}: (`);

        groups.forEach((group, groupIndex) => {
            if (includeComments) {
                lines.push(`  // ${group.label}: ${group.description}`);
            }

            group.tokens.forEach((token, tokenIndex) => {
                const isLastToken = groupIndex === groups.length - 1 && tokenIndex === group.tokens.length - 1;
                const comma = isLastToken ? "" : ",";

                lines.push(`  ${token.name}: ${this.getScssMapValue(token.value)}${comma}`);
            });

            if (groupIndex < groups.length - 1) {
                lines.push("");
            }
        });

        lines.push(");");

        return lines;
    },

    getScssMapValue(value) {
        const escapedValue = String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

        return `string.unquote("${escapedValue}")`;
    },

    getCssUsageExample(themeName, options = {}) {
        const selector = this.getCssSelector(options.selectorType || "root", themeName);
        const scopeSelector = selector === ":root" ? "body" : selector;

        return [
            "/* Example styles",
            "",
            `${scopeSelector} {`,
            "  color: var(--color-text);",
            "  background: var(--color-background);",
            "  font-size: var(--font-size-base);",
            "}",
            "",
            "main {",
            "  background: var(--color-surface);",
            "  border: var(--border-width) solid var(--color-border);",
            "  border-radius: var(--radius);",
            "  box-shadow: var(--shadow-soft);",
            "}",
            "",
            ".example-card {",
            "  color: var(--color-text);",
            "  background: var(--color-surface);",
            "  border: var(--border-width) solid var(--color-border);",
            "  border-radius: var(--radius);",
            "}",
            "",
            ".example-card a {",
            "  color: var(--color-link);",
            "}",
            "",
            ".example-card a:focus-visible {",
            "  outline: 2px solid var(--color-focus);",
            "  outline-offset: 3px;",
            "}",
            "",
            ".example-alert {",
            "  color: var(--color-text);",
            "  background: var(--color-warning);",
            "  border-radius: var(--radius);",
            "}",
            "",
            "*/",
        ].join("\n");
    },

    getScssUsageExample(prefix = "", includeComments = true) {
        const customPropertyPrefix = prefix ? `${prefix}-` : "";
        const lines = [];

        if (includeComments) {
            lines.push(
                "// Example styles",
                "// Consume the generated CSS custom properties with var().",
                "// These values update automatically when the active theme changes.",
                "",
            );
        }

        lines.push(
            "body {",
            `  color: var(--${customPropertyPrefix}color-text);`,
            `  background: var(--${customPropertyPrefix}color-background);`,
            `  font-size: var(--${customPropertyPrefix}font-size-base);`,
            "}",
            "",
            "main {",
            `  background: var(--${customPropertyPrefix}color-surface);`,
            `  border: var(--${customPropertyPrefix}border-width) solid var(--${customPropertyPrefix}color-border);`,
            `  border-radius: var(--${customPropertyPrefix}radius);`,
            `  box-shadow: var(--${customPropertyPrefix}shadow-soft);`,
            "}",
            "",
            ".example-card {",
            `  color: var(--${customPropertyPrefix}color-text);`,
            `  background: var(--${customPropertyPrefix}color-surface);`,
            `  border: var(--${customPropertyPrefix}border-width) solid var(--${customPropertyPrefix}color-border);`,
            `  border-radius: var(--${customPropertyPrefix}radius);`,
            "}",
            "",
            ".example-card a {",
            `  color: var(--${customPropertyPrefix}color-link);`,
            "}",
            "",
            ".example-card a:focus-visible {",
            `  outline: 2px solid var(--${customPropertyPrefix}color-focus);`,
            "  outline-offset: 3px;",
            "}",
            "",
            ".example-alert {",
            `  color: var(--${customPropertyPrefix}color-text);`,
            `  background: var(--${customPropertyPrefix}color-warning);`,
            `  border-radius: var(--${customPropertyPrefix}radius);`,
            "}",
        );

        return lines.join("\n");
    },

    getSelectedThemeModes(options = {}) {
        const modes = Array.isArray(options.themeModes) ? options.themeModes : [];
        const validModes = modes.filter((mode) => ["light", "dark"].includes(mode));

        return validModes.length ? validModes : [ThemeForge.getActiveMode()];
    },

    getCssModeBlocks(themeName, options, colorFormat, selectedModes) {
        const selector = this.getCssSelector(options.selectorType || "root", themeName);

        if (selectedModes.length === 1) {
            return [this.getCssDeclarationBlock(selector, colorFormat, selectedModes[0])];
        }

        return [
            this.getCssDeclarationBlock(selector, colorFormat, "light"),
            ["@media (prefers-color-scheme: dark) {", this.getCssDeclarationBlock(selector, colorFormat, "dark", 2), "}"].join("\n"),
        ];
    },

    getCssDeclarationBlock(selector, colorFormat, mode, indent = 0) {
        const pad = " ".repeat(indent);
        const declarations = this.getCssVariableDeclarations(colorFormat, mode);

        return [`${pad}${selector} {`, ...declarations.map((declaration) => (declaration ? `${pad}  ${declaration}` : "")), `${pad}}`].join("\n");
    },

    getCssVariableDeclarations(format, mode = ThemeForge.getActiveMode()) {
        return this.getExportTokenGroups(format, mode).flatMap((group, index, groups) => {
            const declarations = group.tokens.map((token) => `--${token.name}: ${token.cssValue};`);

            return index < groups.length - 1 ? [...declarations, ""] : declarations;
        });
    },

    getExportTokenGroups(format, mode = ThemeForge.getActiveMode()) {
        const colorFormat = ["hsl", "hex", "rgb"].includes(format) ? format : "hsl";
        const { settings, shape } = ThemeForge.theme;
        const colors = ThemeForge.theme.modes[mode].colors;
        const { recipes, mappings: shadowMappings } = ThemeForge.getShadowsForMode(mode);

        const colorNames = [
            "primary",
            "secondary",
            "background",
            "surface",
            "success",
            "warning",
            "danger",
            "info",
            "text",
            "mutedText",
            "link",
            "border",
            "focus",
            "overlay",
            "shadowTint",
        ];
        const colorTokens = colorNames.map((tokenName) => ({
            name: `color-${this.getCssVariableName(tokenName)}`,
            value: ThemeForge.getColorValue(colors[tokenName], colorFormat),
            cssValue: ThemeForge.getColorValue(colors[tokenName], colorFormat),
        }));

        const shadowTokens = [
            ...Object.entries(recipes).map(([recipeName, recipe]) => {
                const value = ThemeForge.getShadowValue(recipe, colors, colorFormat);

                return {
                    name: `shadow-recipe-${this.getCssVariableName(recipeName)}`,
                    value,
                    cssValue: value,
                };
            }),
            ...Object.entries(shadowMappings).map(([mappingName, shadow]) => {
                const value = ThemeForge.getShadowValue(shadow, colors, colorFormat);

                return {
                    name: this.getCssVariableName(mappingName),
                    value,
                    cssValue: value,
                };
            }),
        ];

        shadowTokens.push({
            name: "shadow-soft",
            value: "var(--card-shadow)",
            cssValue: "var(--card-shadow)",
        });

        return [
            {
                label: "Colors",
                description: "semantic colors used throughout the theme.",
                tokens: colorTokens,
            },
            {
                label: "Shadows",
                description: "shadow recipes, component mappings, and aliases.",
                tokens: shadowTokens,
            },
            {
                label: "Typography",
                description: "base text sizing shared by the preview components.",
                tokens: [
                    {
                        name: "font-size-base",
                        value: ThemeForge.getTokenValue(settings.baseFontSize),
                        cssValue: ThemeForge.getTokenValue(settings.baseFontSize),
                    },
                ],
            },
            this.getFeatureExportTokenGroup("layout", "Layout"),
            this.getFeatureExportTokenGroup("components", "Components"),
            this.getShapeExportTokenGroup(shape),
        ];
    },

    getFeatureExportTokenGroup(featureName, label) {
        const feature = ThemeForge.theme[featureName];
        const scaleTokens = Object.entries(feature.scale).map(([tokenName, token]) => {
            const value = ThemeForge.getTokenValue(token);

            return {
                name: `${featureName}-${tokenName}`,
                value,
                cssValue: value,
            };
        });
        const mappingTokens = Object.entries(feature.mappings).map(([mappingName, token]) => {
            const matchingScaleToken = ThemeForge.findMatchingScaleToken(feature.scale, token);
            const value = ThemeForge.getTokenValue(token);

            return {
                name: this.getCssVariableName(mappingName),
                value: matchingScaleToken ? `var(--${featureName}-${matchingScaleToken})` : value,
                cssValue: matchingScaleToken ? `var(--${featureName}-${matchingScaleToken})` : value,
            };
        });

        return {
            label,
            description: `${featureName} scales and their semantic mappings.`,
            tokens: [...scaleTokens, ...mappingTokens],
        };
    },

    getShapeExportTokenGroup(shape) {
        const { corners, borders, overlayBlur } = shape;
        const tokens = [];

        Object.entries(corners.scale).forEach(([tokenName, token]) => {
            const value = ThemeForge.getTokenValue(token);

            tokens.push({
                name: `radius-${tokenName}`,
                value,
                cssValue: value,
            });
        });

        Object.entries(corners.mappings).forEach(([mappingName, token]) => {
            const matchingScaleToken = ThemeForge.findMatchingScaleToken(corners.scale, token);
            const name = this.getCssVariableName(mappingName);
            const value = ThemeForge.getTokenValue(token);

            tokens.push(
                {
                    name,
                    value: matchingScaleToken ? `var(--radius-${matchingScaleToken})` : value,
                    cssValue: matchingScaleToken ? `var(--radius-${matchingScaleToken})` : value,
                },
                {
                    name: name.replace(/-radius$/, "-corner-shape"),
                    value: token.cornerShape,
                    cssValue: token.cornerShape,
                },
            );
        });

        Object.entries(borders.scale).forEach(([tokenName, token]) => {
            const value = ThemeForge.getTokenValue(token);

            tokens.push({
                name: `border-width-${tokenName}`,
                value,
                cssValue: value,
            });
        });

        Object.entries(borders.mappings).forEach(([mappingName, token]) => {
            const matchingScaleToken = ThemeForge.findMatchingScaleToken(borders.scale, token);
            const value = ThemeForge.getTokenValue(token);

            tokens.push({
                name: this.getCssVariableName(mappingName),
                value: matchingScaleToken ? `var(--border-width-${matchingScaleToken})` : value,
                cssValue: matchingScaleToken ? `var(--border-width-${matchingScaleToken})` : value,
            });
        });

        tokens.push(
            {
                name: "overlay-blur",
                value: `${overlayBlur}px`,
                cssValue: `${overlayBlur}px`,
            },
            {
                name: "radius",
                value: "var(--card-radius)",
                cssValue: "var(--card-radius)",
            },
            {
                name: "border-width",
                value: "var(--card-border-width)",
                cssValue: "var(--card-border-width)",
            },
        );

        return {
            label: "Shape",
            description: "corner radii, border widths, blur, and convenience aliases.",
            tokens,
        };
    },

    getCssSelector(selectorType, themeName) {
        if (selectorType === "themeClass") {
            return `.theme-${this.slugifyThemeName(themeName)}`;
        }

        if (selectorType === "previewArea") {
            return ".preview-area";
        }

        return ":root";
    },

    capitalize(value) {
        return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
    },

    getCssVariableName(tokenName) {
        return tokenName.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    },

    downloadTextFile(content, filename, type = "text/plain") {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        document.body.append(link);
        link.click();
        link.remove();

        window.setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 0);
    },

    generateThemeNameSuggestion() {
        const { primary, secondary } = ThemeForge.getActiveColors();
        const blendedHue = this.getBlendedHue(primary, secondary);
        const saturation = this.getWeightedAverage(primary.s, secondary.s);
        const lightness = this.getWeightedAverage(primary.l, secondary.l);
        const hueFamily = this.getHueFamily(blendedHue);
        const adjectives = this.getAdjectivesForMood(saturation, lightness);
        const nouns = this.nounsByHue[hueFamily];
        const seed = Math.round(primary.h + secondary.h + saturation + lightness);
        const adjective = adjectives[seed % adjectives.length];
        const noun = nouns[(seed + Math.round(secondary.h)) % nouns.length];

        return `${adjective} ${noun}`;
    },

    getWeightedAverage(primaryValue, secondaryValue) {
        return (Number(primaryValue) * 2 + Number(secondaryValue)) / 3;
    },

    getBlendedHue(primary, secondary) {
        const primaryRadians = (Number(primary.h) * Math.PI) / 180;
        const secondaryRadians = (Number(secondary.h) * Math.PI) / 180;
        const primaryWeight = Math.max(1, Number(primary.s)) * 2;
        const secondaryWeight = Math.max(1, Number(secondary.s));
        const x = Math.cos(primaryRadians) * primaryWeight + Math.cos(secondaryRadians) * secondaryWeight;
        const y = Math.sin(primaryRadians) * primaryWeight + Math.sin(secondaryRadians) * secondaryWeight;
        const hue = Math.round((Math.atan2(y, x) * 180) / Math.PI);

        return (hue + 360) % 360;
    },

    getHueFamily(hue) {
        const normalizedHue = ((Number(hue) % 360) + 360) % 360;

        if (normalizedHue < 15 || normalizedHue >= 345) return "red";
        if (normalizedHue < 45) return "orange";
        if (normalizedHue < 70) return "yellow";
        if (normalizedHue < 155) return "green";
        if (normalizedHue < 190) return "cyan";
        if (normalizedHue < 250) return "blue";
        if (normalizedHue < 290) return "purple";

        return "pink";
    },

    getAdjectivesForMood(saturation, lightness) {
        if (lightness <= 28) return this.adjectivesByMood.dark;
        if (lightness >= 78) return this.adjectivesByMood.light;
        if (saturation >= 70) return this.adjectivesByMood.vivid;
        if (saturation <= 30) return this.adjectivesByMood.muted;

        return this.adjectivesByMood.balanced;
    },

    getJsonFilename(themeName) {
        return `${this.filenamePrefix}-${this.slugifyThemeName(themeName)}.json`;
    },

    getCssFilename(themeName) {
        return `${this.filenamePrefix}-${this.slugifyThemeName(themeName)}.css`;
    },

    getScssFilename(themeName) {
        return `${this.filenamePrefix}-${this.slugifyThemeName(themeName)}.scss`;
    },

    getCssCommentValue(value) {
        return String(value).replace(/\*\//g, "* /");
    },

    getScssCommentValue(value) {
        return String(value).replace(/\r?\n/g, " ");
    },

    slugifyThemeName(themeName) {
        return (
            themeName
                .toLowerCase()
                .replace(/['"]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "") || this.fallbackSlug
        );
    },
};

document.addEventListener("DOMContentLoaded", () => {
    ThemeForge.export.init();
});
