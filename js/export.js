ThemeForge.export = {
    filenamePrefix: "theme-forge",
    fallbackSlug: "theme",
    schemaVersion: 1,

    activeTarget:
        localStorage.getItem("themeForge.export.activeTarget") || "css",

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

        if (!this.exportMenu || !this.exportMenuButton || !this.exportMenuList)
            return;

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
        document
            .querySelectorAll("[data-export-target-tab]")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    this.setActiveTarget(button.dataset.exportTargetTab);
                });
            });

        document
            .querySelector("[data-export-target-select]")
            ?.addEventListener("change", (event) => {
                this.setActiveTarget(event.target.value);
            });

        document
            .querySelector("[data-export-copy]")
            ?.addEventListener("click", () => {
                this.copyActiveOutput();
            });

        document
            .querySelector("[data-export-download]")
            ?.addEventListener("click", () => {
                this.downloadActiveOutput();
            });

        document
            .querySelectorAll("[data-export-setting]")
            .forEach((control) => {
                control.addEventListener("change", (event) => {
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

        document
            .querySelectorAll("[data-export-target-tab]")
            .forEach((button) => {
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

        document
            .querySelectorAll("[data-export-options]")
            .forEach((section) => {
                section.hidden = section.dataset.exportOptions !== target;
            });

        document
            .querySelector("[data-export-target-title]")
            ?.replaceChildren(this.targets[target].label);

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
            this.settings[target].themeModes = Array.from(
                optionSection.querySelectorAll(
                    "[data-export-setting='themeModes']:checked",
                ),
            ).map((input) => input.value);

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
        const filename = document.querySelector("[data-export-filename]");
        const scrollTop = output?.scrollTop || 0;
        const scrollLeft = output?.scrollLeft || 0;

        if (!output) {
            return;
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

            return JSON.stringify(
                this.createExportTheme(themeName),
                null,
                spacing,
            );
        }

        return this.createCssExport(themeName, options);
    },

    getActiveFilename() {
        const themeName = this.generateThemeNameSuggestion();

        if (this.activeTarget === "scss") {
            return this.getScssFilename(themeName);
        }

        if (this.activeTarget === "json") {
            return this.getJsonFilename(themeName);
        }

        return this.getCssFilename(themeName);
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
            this.setExportActionState("copy", "Copied");
        } catch (error) {
            this.setExportActionState("copy", "Copy failed");
        }
    },

    downloadActiveOutput() {
        this.downloadTextFile(
            this.getActiveOutput(),
            this.getActiveFilename(),
            this.getActiveMimeType(),
        );
        this.setExportActionState("download", "Downloaded");
    },

    setExportActionState(actionName, message) {
        const button = document.querySelector(`[data-export-${actionName}]`);

        if (!button) {
            return;
        }

        const originalTooltip = button.dataset.tooltip;
        const originalLabel = button.getAttribute("aria-label");

        button.dataset.exportActionState = "success";
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
        };
    },

    updateTabIndicator(tabs) {
        const activeButton = tabs.querySelector(
            "[data-export-target-tab].active",
        );

        if (!activeButton) {
            return;
        }

        const tabsRect = tabs.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        tabs.style.setProperty("--active-tab-width", `${buttonRect.width}px`);
        tabs.style.setProperty(
            "--active-tab-offset",
            `${buttonRect.left - tabsRect.left}px`,
        );
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

        if (!exportTypeButton || !this.exportMenu?.contains(exportTypeButton))
            return;

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
        if (
            event.key !== "Escape" ||
            !this.exportMenuList ||
            this.exportMenuList.hidden
        )
            return;

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

        this.downloadTextFile(
            json,
            this.getJsonFilename(themeName),
            "application/json",
        );
    },

    createExportTheme(themeName) {
        return {
            schemaVersion: this.schemaVersion,
            name: themeName,

            theme: { ...ThemeForge.theme, name: themeName },

            settings: {
                previewMode: ThemeForge.getActiveMode(),
                appAppearance:
                    document.body.dataset.appModePreference ||
                    localStorage.getItem("themeForge.appAppearance") ||
                    "system",
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
                { value: "scss", label: "SCSS variables" },
            ].forEach((option) => {
                outputOptions.append(
                    this.createRadioOption("stylesheetOutput", option),
                );
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
                selectorOptions.append(
                    this.createRadioOption("cssSelectorType", option),
                );
            });
            selectorGroup.append(selectorLegend, selectorOptions);

            modeGroup.className = "export-option-group";
            modeLegend.textContent = "Theme modes";
            modeOptions.className = "export-radio-group";

            [
                { value: "light", label: "Light mode", checked: true },
                { value: "dark", label: "Dark mode", checked: true },
            ].forEach((option) => {
                modeOptions.append(
                    this.createCheckboxOption("themeModes", option),
                );
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
                formatOptions.append(
                    this.createRadioOption("cssColorFormat", option),
                );
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

            form.append(
                nameField,
                outputGroup,
                selectorGroup,
                modeGroup,
                formatGroup,
                commentsLabel,
                exampleLabel,
            );

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

            this.downloadTextFile(
                scss,
                this.getScssFilename(themeName),
                "text/x-scss",
            );
            return;
        }

        const css = this.createCssExport(themeName, options);

        this.downloadTextFile(css, this.getCssFilename(themeName), "text/css");
    },

    createCssExport(themeName, options = {}) {
        const colorFormat = options.colorFormat || "hsl";
        const includeComments = options.includeComments !== false;
        const selectedModes = this.getSelectedThemeModes(options);
        const block = this.getCssModeBlocks(
            themeName,
            options,
            colorFormat,
            selectedModes,
        ).join("\n\n");
        const example = options.includeExample
            ? `\n\n${this.getCssUsageExample(themeName, options)}`
            : "";

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
        const declarations = this.getScssModeDeclarations(
            colorFormat,
            selectedModes,
        );
        const example = options.includeExample
            ? `\n\n${this.getScssUsageExample()}`
            : "";

        if (!includeComments) return `${declarations.join("\n")}${example}`;

        return (
            [
                "// Theme Forge Export",
                `// Theme: ${this.getScssCommentValue(themeName)}`,
                `// Schema: ${this.schemaVersion}`,
                `// Modes: ${selectedModes.join(", ")}`,
                "",
                ...declarations,
            ].join("\n") + example
        );
    },

    getCssUsageExample(themeName, options = {}) {
        const selector = this.getCssSelector(
            options.selectorType || "root",
            themeName,
        );
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

    getScssUsageExample() {
        return [
            "// Example styles",
            "",
            "body {",
            "  color: $color-text;",
            "  background: $color-background;",
            "  font-size: $font-size-base;",
            "}",
            "",
            "main {",
            "  background: $color-surface;",
            "  border: $border-width solid $color-border;",
            "  border-radius: $radius;",
            "  box-shadow: $shadow-soft;",
            "}",
            "",
            ".example-card {",
            "  color: $color-text;",
            "  background: $color-surface;",
            "  border: $border-width solid $color-border;",
            "  border-radius: $radius;",
            "}",
            "",
            ".example-card a {",
            "  color: $color-link;",
            "}",
            "",
            ".example-card a:focus-visible {",
            "  outline: 2px solid $color-focus;",
            "  outline-offset: 3px;",
            "}",
            "",
            ".example-alert {",
            "  color: $color-text;",
            "  background: $color-warning;",
            "  border-radius: $radius;",
            "}",
        ].join("\n");
    },

    getSelectedThemeModes(options = {}) {
        const modes = Array.isArray(options.themeModes)
            ? options.themeModes
            : [];
        const validModes = modes.filter((mode) =>
            ["light", "dark"].includes(mode),
        );

        return validModes.length ? validModes : [ThemeForge.getActiveMode()];
    },

    getCssModeBlocks(themeName, options, colorFormat, selectedModes) {
        const selector = this.getCssSelector(
            options.selectorType || "root",
            themeName,
        );

        if (selectedModes.length === 1) {
            return [
                this.getCssDeclarationBlock(
                    selector,
                    colorFormat,
                    selectedModes[0],
                ),
            ];
        }

        return [
            this.getCssDeclarationBlock(selector, colorFormat, "light"),
            [
                "@media (prefers-color-scheme: dark) {",
                this.getCssDeclarationBlock(selector, colorFormat, "dark", 2),
                "}",
            ].join("\n"),
        ];
    },

    getCssDeclarationBlock(selector, colorFormat, mode, indent = 0) {
        const pad = " ".repeat(indent);
        const declarations = this.getCssVariableDeclarations(colorFormat, mode);

        return [
            `${pad}${selector} {`,
            ...declarations.map((declaration) =>
                declaration ? `${pad}  ${declaration}` : "",
            ),
            `${pad}}`,
        ].join("\n");
    },

    getScssModeDeclarations(colorFormat, selectedModes) {
        if (selectedModes.length === 1) {
            return this.getScssVariableDeclarations(
                colorFormat,
                selectedModes[0],
            );
        }

        return [
            "// Light mode",
            ...this.getScssVariableDeclarations(colorFormat, "light"),
            "",
            "// Dark mode",
            ...this.getScssVariableDeclarations(colorFormat, "dark", "dark"),
        ];
    },

    getCssVariableDeclarations(format, mode = ThemeForge.getActiveMode()) {
        const { settings, typography, shape } = ThemeForge.theme;

        return [
            ...this.getColorVariableDeclarations(format, mode),
            "",
            ...this.getShadowCssDeclarations(mode),
            "",
            `--font-size-base: ${ThemeForge.getTokenValue(settings.baseFontSize)};`,
            "",
            ...this.getFeatureCssDeclarations("layout"),
            "",
            ...this.getFeatureCssDeclarations("components"),
            "",
            ...this.getShapeCssDeclarations(),
        ];
    },

    getScssVariableDeclarations(
        format,
        mode = ThemeForge.getActiveMode(),
        prefix = "",
    ) {
        const { settings, typography, shape } = ThemeForge.theme;
        const variablePrefix = prefix ? `${prefix}-` : "";

        return [
            ...this.getScssColorVariableDeclarations(
                format,
                mode,
                variablePrefix,
            ),
            "",
            ...this.getShadowScssDeclarations(mode, variablePrefix),
            "",
            `$${variablePrefix}font-size-base: ${ThemeForge.getTokenValue(settings.baseFontSize)};`,
            "",
            ...this.getFeatureScssDeclarations("layout", variablePrefix),
            "",
            ...this.getFeatureScssDeclarations("components", variablePrefix),
            "",
            ...this.getShapeScssDeclarations(variablePrefix),
        ];
    },

    getShadowCssDeclarations(mode = ThemeForge.getActiveMode()) {
        const { recipes, mappings } = ThemeForge.getShadowsForMode(mode);
        const colors = ThemeForge.theme.modes[mode].colors;

        return [
            ...Object.entries(recipes).map(([recipeName, recipe]) => {
                return `--shadow-recipe-${this.getCssVariableName(recipeName)}: ${ThemeForge.getShadowValue(recipe, colors)};`;
            }),
            "",
            ...Object.entries(mappings).map(([mappingName, shadow]) => {
                return `--${this.getCssVariableName(mappingName)}: ${ThemeForge.getShadowValue(shadow, colors)};`;
            }),
            "",
            "--shadow-soft: var(--card-shadow);",
        ];
    },

    getShadowScssDeclarations(mode = ThemeForge.getActiveMode(), prefix = "") {
        const { recipes, mappings } = ThemeForge.getShadowsForMode(mode);
        const colors = ThemeForge.theme.modes[mode].colors;

        return [
            ...Object.entries(recipes).map(([recipeName, recipe]) => {
                return `$${prefix}shadow-recipe-${this.getCssVariableName(recipeName)}: ${ThemeForge.getShadowValue(recipe, colors)};`;
            }),
            "",
            ...Object.entries(mappings).map(([mappingName, shadow]) => {
                return `$${prefix}${this.getCssVariableName(mappingName)}: ${ThemeForge.getShadowValue(shadow, colors)};`;
            }),
            "",
            `$${prefix}shadow-soft: $${prefix}card-shadow;`,
        ];
    },

    getShapeCssDeclarations() {
        const { corners, borders, overlayBlur } = ThemeForge.theme.shape;

        return [
            ...Object.entries(corners.scale).map(
                ([tokenName, token]) =>
                    `--radius-${tokenName}: ${ThemeForge.getTokenValue(token)};`,
            ),
            "",
            ...Object.entries(corners.mappings).flatMap(
                ([mappingName, token]) => {
                    const matchingScaleToken =
                        ThemeForge.findMatchingScaleToken(corners.scale, token);
                    const variableName = `--${this.getCssVariableName(mappingName)}`;
                    const cornerShapeName = variableName.replace(
                        /-radius$/,
                        "-corner-shape",
                    );

                    return [
                        matchingScaleToken
                            ? `${variableName}: var(--radius-${matchingScaleToken});`
                            : `${variableName}: ${ThemeForge.getTokenValue(token)};`,
                        `${cornerShapeName}: ${token.cornerShape};`,
                    ];
                },
            ),
            "",
            ...Object.entries(borders.scale).map(
                ([tokenName, token]) =>
                    `--border-width-${tokenName}: ${ThemeForge.getTokenValue(token)};`,
            ),
            "",
            ...Object.entries(borders.mappings).map(([mappingName, token]) => {
                const matchingScaleToken = ThemeForge.findMatchingScaleToken(
                    borders.scale,
                    token,
                );
                const variableName = `--${this.getCssVariableName(mappingName)}`;

                return matchingScaleToken
                    ? `${variableName}: var(--border-width-${matchingScaleToken});`
                    : `${variableName}: ${ThemeForge.getTokenValue(token)};`;
            }),
            "",
            `--overlay-blur: ${overlayBlur}px;`,
            "",
            "--radius: var(--card-radius);",
            "--border-width: var(--card-border-width);",
        ];
    },

    getShapeScssDeclarations(prefix = "") {
        const { corners, borders, overlayBlur } = ThemeForge.theme.shape;

        return [
            ...Object.entries(corners.scale).map(
                ([tokenName, token]) =>
                    `$${prefix}radius-${tokenName}: ${ThemeForge.getTokenValue(token)};`,
            ),
            "",
            ...Object.entries(corners.mappings).flatMap(
                ([mappingName, token]) => {
                    const matchingScaleToken =
                        ThemeForge.findMatchingScaleToken(corners.scale, token);
                    const variableName = `$${prefix}${this.getCssVariableName(mappingName)}`;
                    const cornerShapeName = variableName.replace(
                        /-radius$/,
                        "-corner-shape",
                    );

                    return [
                        matchingScaleToken
                            ? `${variableName}: $${prefix}radius-${matchingScaleToken};`
                            : `${variableName}: ${ThemeForge.getTokenValue(token)};`,
                        `${cornerShapeName}: ${token.cornerShape};`,
                    ];
                },
            ),
            "",
            ...Object.entries(borders.scale).map(
                ([tokenName, token]) =>
                    `$${prefix}border-width-${tokenName}: ${ThemeForge.getTokenValue(token)};`,
            ),
            "",
            ...Object.entries(borders.mappings).map(([mappingName, token]) => {
                const matchingScaleToken = ThemeForge.findMatchingScaleToken(
                    borders.scale,
                    token,
                );
                const variableName = `$${prefix}${this.getCssVariableName(mappingName)}`;

                return matchingScaleToken
                    ? `${variableName}: $${prefix}border-width-${matchingScaleToken};`
                    : `${variableName}: ${ThemeForge.getTokenValue(token)};`;
            }),
            "",
            `$${prefix}overlay-blur: ${overlayBlur}px;`,
            "",
            `$${prefix}radius: $${prefix}card-radius;`,
            `$${prefix}border-width: $${prefix}card-border-width;`,
        ];
    },

    getFeatureCssDeclarations(featureName) {
        const feature = ThemeForge.theme[featureName];

        return [
            ...Object.entries(feature.scale).map(
                ([tokenName, token]) =>
                    `--${featureName}-${tokenName}: ${ThemeForge.getTokenValue(token)};`,
            ),
            "",
            ...Object.entries(feature.mappings).map(([mappingName, token]) => {
                const matchingScaleToken = ThemeForge.findMatchingScaleToken(
                    feature.scale,
                    token,
                );
                const variableName = `--${this.getCssVariableName(mappingName)}`;

                return matchingScaleToken
                    ? `${variableName}: var(--${featureName}-${matchingScaleToken});`
                    : `${variableName}: ${ThemeForge.getTokenValue(token)};`;
            }),
        ];
    },

    getFeatureScssDeclarations(featureName, prefix = "") {
        const feature = ThemeForge.theme[featureName];

        return [
            ...Object.entries(feature.scale).map(
                ([tokenName, token]) =>
                    `$${prefix}${featureName}-${tokenName}: ${ThemeForge.getTokenValue(token)};`,
            ),
            "",
            ...Object.entries(feature.mappings).map(([mappingName, token]) => {
                const matchingScaleToken = ThemeForge.findMatchingScaleToken(
                    feature.scale,
                    token,
                );
                const variableName = `$${prefix}${this.getCssVariableName(mappingName)}`;

                return matchingScaleToken
                    ? `${variableName}: $${prefix}${featureName}-${matchingScaleToken};`
                    : `${variableName}: ${ThemeForge.getTokenValue(token)};`;
            }),
        ];
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

    getColorVariableDeclarations(format, mode = ThemeForge.getActiveMode()) {
        const colorFormat = ["hsl", "hex", "rgb"].includes(format)
            ? format
            : "hsl";
        const colors = ThemeForge.theme.modes[mode].colors;
        const colorGroups = [
            ["primary", "secondary", "background", "surface"],
            ["success", "warning", "danger", "info"],
            ["text", "mutedText", "link"],
            ["border", "focus", "overlay", "shadowTint"],
        ];

        return colorGroups.flatMap((group, index) => {
            const declarations = group.map((tokenName) => {
                const colorToken = colors[tokenName];
                const variableName = `--color-${this.getCssVariableName(tokenName)}`;

                return `${variableName}: ${ThemeForge.getColorValue(colorToken, colorFormat)};`;
            });

            return index < colorGroups.length - 1
                ? [...declarations, ""]
                : declarations;
        });
    },

    getScssColorVariableDeclarations(
        format,
        mode = ThemeForge.getActiveMode(),
        prefix = "",
    ) {
        const colorFormat = ["hsl", "hex", "rgb"].includes(format)
            ? format
            : "hsl";
        const colors = ThemeForge.theme.modes[mode].colors;
        const colorGroups = [
            ["primary", "secondary", "background", "surface"],
            ["success", "warning", "danger", "info"],
            ["text", "mutedText", "link"],
            ["border", "focus", "overlay", "shadowTint"],
        ];

        return colorGroups.flatMap((group, index) => {
            const declarations = group.map((tokenName) => {
                const colorToken = colors[tokenName];
                const variableName = `$${prefix}color-${this.getCssVariableName(tokenName)}`;

                return `${variableName}: ${ThemeForge.getColorValue(colorToken, colorFormat)};`;
            });

            return index < colorGroups.length - 1
                ? [...declarations, ""]
                : declarations;
        });
    },

    getCssVariableName(tokenName) {
        return tokenName.replace(
            /[A-Z]/g,
            (letter) => `-${letter.toLowerCase()}`,
        );
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
        const seed = Math.round(
            primary.h + secondary.h + saturation + lightness,
        );
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
        const x =
            Math.cos(primaryRadians) * primaryWeight +
            Math.cos(secondaryRadians) * secondaryWeight;
        const y =
            Math.sin(primaryRadians) * primaryWeight +
            Math.sin(secondaryRadians) * secondaryWeight;
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
