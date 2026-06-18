ThemeForge.export = {
  filenamePrefix: "theme-forge",
  fallbackSlug: "theme",
  schemaVersion: 1,

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
      this.startCssExport();
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
    const { name, ...themeState } = ThemeForge.theme;

    return {
      schemaVersion: this.schemaVersion,
      name: themeName,
      ...themeState,
    };
  },

  async startCssExport() {
    const suggestedName = this.generateThemeNameSuggestion();
    const options = await this.openCssExportDialog(suggestedName);

    if (!options) return;

    this.downloadCss(options.themeName, options);
  },

  openCssExportDialog(suggestedName) {
    const { layer } = ThemeForge.appModal.getElements();

    if (!layer) return Promise.resolve(null);

    return new Promise((resolve) => {
      const form = document.createElement("form");
      const nameField = document.createElement("label");
      const nameLabel = document.createElement("span");
      const nameInput = document.createElement("input");
      const selectorGroup = document.createElement("fieldset");
      const selectorLegend = document.createElement("legend");
      const selectorOptions = document.createElement("div");
      const formatGroup = document.createElement("fieldset");
      const formatLegend = document.createElement("legend");
      const formatOptions = document.createElement("div");
      const commentsLabel = document.createElement("label");
      const commentsInput = document.createElement("input");
      const commentsText = document.createElement("span");
      const cancelButton = document.createElement("button");
      const confirmButton = document.createElement("button");

      form.id = "cssExportForm";
      form.className = "export-options-form";

      nameField.className = "app-modal-field";
      nameLabel.textContent = "Theme name";
      nameInput.type = "text";
      nameInput.value = suggestedName;
      nameField.append(nameLabel, nameInput);

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

      cancelButton.type = "button";
      cancelButton.className = "app-modal-secondary-action";
      cancelButton.textContent = "Cancel";
      cancelButton.addEventListener("click", () => {
        ThemeForge.appModal.close(null);
      });

      confirmButton.type = "submit";
      confirmButton.className = "app-modal-primary-action";
      confirmButton.textContent = "Export CSS";
      confirmButton.setAttribute("form", form.id);

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const themeName = nameInput.value.trim() || suggestedName;

        ThemeForge.appModal.close({
          themeName,
          selectorType: formData.get("cssSelectorType") || "root",
          colorFormat: formData.get("cssColorFormat") || "hsl",
          includeComments: commentsInput.checked,
        });
      });

      form.append(nameField, selectorGroup, formatGroup, commentsLabel);

      ThemeForge.appModal.open({
        eyebrow: "Export CSS",
        title: "Choose CSS options",
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

  downloadCss(themeName, options) {
    const css = this.createCssExport(themeName, options);

    this.downloadTextFile(css, this.getCssFilename(themeName), "text/css");
  },

  createCssExport(themeName, options = {}) {
    const selectorType = options.selectorType || "root";
    const colorFormat = options.colorFormat || "hsl";
    const includeComments = options.includeComments !== false;
    const selector = this.getCssSelector(selectorType, themeName);
    const declarations = this.getCssVariableDeclarations(colorFormat);
    const block = [
      `${selector} {`,
      ...declarations.map((declaration) => (declaration ? `  ${declaration}` : "")),
      "}",
    ].join("\n");

    if (!includeComments) return block;

    return [
      "/*",
      "  Theme Forge Export",
      `  Theme: ${this.getCssCommentValue(themeName)}`,
      `  Schema: ${this.schemaVersion}`,
      "*/",
      "",
      block,
    ].join("\n");
  },

  getCssVariableDeclarations(format) {
    const { typography, shape } = ThemeForge.theme;

    return [
      ...this.getColorVariableDeclarations(format),
      "",
      "--shadow-soft: 0 12px 30px var(--color-shadow-tint);",
      "",
      `--font-size-base: ${typography.baseFontSize}px;`,
      `--heading-scale: ${typography.headingScale};`,
      "",
      `--radius: ${shape.radius}px;`,
      `--border-width: ${shape.borderWidth}px;`,
      `--overlay-blur: ${shape.overlayBlur}px;`,
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

  getColorVariableDeclarations(format) {
    const colorFormat = ["hsl", "hex", "rgb"].includes(format) ? format : "hsl";
    const colorGroups = [
      ["primary", "secondary", "background", "surface"],
      ["success", "warning", "danger", "info"],
      ["text", "mutedText", "link"],
      ["border", "focus", "overlay", "shadowTint"],
    ];

    return colorGroups.flatMap((group, index) => {
      const declarations = group.map((tokenName) => {
        const colorToken = ThemeForge.theme.colors[tokenName];
        const variableName = `--color-${this.getCssVariableName(tokenName)}`;

        return `${variableName}: ${ThemeForge.getColorValue(colorToken, colorFormat)};`;
      });

      return index < colorGroups.length - 1 ? [...declarations, ""] : declarations;
    });
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
    const { primary, secondary } = ThemeForge.theme.colors;
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

  getCssCommentValue(value) {
    return String(value).replace(/\*\//g, "* /");
  },

  slugifyThemeName(themeName) {
    return themeName
      .toLowerCase()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || this.fallbackSlug;
  },
};

document.addEventListener("DOMContentLoaded", () => {
  ThemeForge.export.init();
});
