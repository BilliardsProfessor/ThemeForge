ThemeForge.export = {
  filenamePrefix: "theme-forge",
  fallbackSlug: "theme",
  schemaVersion: 1,

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
    document.querySelector("#exportJsonBtn")?.addEventListener("click", () => {
      this.startJsonExport();
    });
  },

  startJsonExport() {
    const suggestedName = this.generateThemeNameSuggestion();
    const themeName = window.prompt("Name this theme:", suggestedName);

    if (themeName === null) return;

    this.downloadJson(themeName.trim() || suggestedName);
  },

  downloadJson(themeName) {
    const exportTheme = this.createExportTheme(themeName);
    const json = JSON.stringify(exportTheme, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = this.getJsonFilename(themeName);
    document.body.append(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0);
  },

  createExportTheme(themeName) {
    const { name, ...themeState } = ThemeForge.theme;

    return {
      schemaVersion: this.schemaVersion,
      name: themeName,
      ...themeState,
    };
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
