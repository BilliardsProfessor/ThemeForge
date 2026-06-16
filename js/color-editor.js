ThemeForge.colorEditor = {
  activeColorKey: "primary",
  originalColor: null,

  init() {
    ThemeForge.ui = ThemeForge.ui || {};
    ThemeForge.ui.preferredColorFormat =
      localStorage.getItem("themeForge.preferredColorFormat") || "hex";

    this.bindTokenButtons();
    this.bindEditorControls();
    this.render();
  },

  bindTokenButtons() {
    document.querySelectorAll("[data-color-token]").forEach((button) => {
      button.addEventListener("click", () => {
        this.activeColorKey = button.dataset.colorToken;
        this.originalColor = ThemeForge.theme.colors[this.activeColorKey];
        this.render();
      });
    });
  },

  bindEditorControls() {
    document
      .querySelector("#colorNativePicker")
      .addEventListener("input", (event) => {
        this.setActiveColor(event.target.value);
      });

    document.querySelector("#hexValue").addEventListener("input", (event) => {
      const value = event.target.value;

      if (hexToRgb(value)) {
        this.setActiveColor(value);
      }
    });

    document.querySelectorAll("[data-color-format]").forEach((button) => {
      button.addEventListener("click", () => {
        ThemeForge.ui.preferredColorFormat = button.dataset.colorFormat;
        localStorage.setItem(
          "themeForge.preferredColorFormat",
          ThemeForge.ui.preferredColorFormat,
        );
        this.render();
      });
    });

    document.querySelectorAll("[data-rgb-channel]").forEach((input) => {
      input.addEventListener("input", () => {
        const rgb = {
          r: Number(document.querySelector("#rgbR").value),
          g: Number(document.querySelector("#rgbG").value),
          b: Number(document.querySelector("#rgbB").value),
        };

        this.setActiveColor(rgbToHex(rgb));
      });
    });

    document.querySelectorAll("[data-hsl-channel]").forEach((input) => {
      input.addEventListener("input", () => {
        const hsl = {
          h: Number(document.querySelector("#hslH").value),
          s: Number(document.querySelector("#hslS").value),
          l: Number(document.querySelector("#hslL").value),
        };

        this.setActiveColor(hslToHex(hsl));
      });
    });
  },

  setActiveColor(hex) {
    ThemeForge.theme.colors[this.activeColorKey] = hex;
    ThemeForge.applyTheme();
    this.render();
  },

  render() {
    const color = ThemeForge.theme.colors[this.activeColorKey];
    const rgb = hexToRgb(color);
    const hsl = hexToHsl(color);
    const format = ThemeForge.ui.preferredColorFormat;

    document.querySelector("#activeColorName").textContent = this.getLabel(
      this.activeColorKey,
    );
    document.querySelector("#colorNativePicker").value = color;
    document.querySelector("#hexValue").value = color;

    document.querySelector("#rgbR").value = rgb.r;
    document.querySelector("#rgbRNumber").value = rgb.r;
    document.querySelector("#rgbG").value = rgb.g;
    document.querySelector("#rgbGNumber").value = rgb.g;
    document.querySelector("#rgbB").value = rgb.b;
    document.querySelector("#rgbBNumber").value = rgb.b;

    document.querySelector("#hslH").value = hsl.h;
    document.querySelector("#hslHNumber").value = hsl.h;
    document.querySelector("#hslS").value = hsl.s;
    document.querySelector("#hslSNumber").value = hsl.s;
    document.querySelector("#hslL").value = hsl.l;
    document.querySelector("#hslLNumber").value = hsl.l;

    document.querySelectorAll("[data-color-format]").forEach((button) => {
      button.classList.toggle("active", button.dataset.colorFormat === format);
    });

    document.querySelectorAll("[data-format-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.formatPanel !== format;
    });

    document.querySelectorAll("[data-color-token]").forEach((button) => {
      const token = button.dataset.colorToken;
      const swatch = button.querySelector(".color-token-swatch");
      const value = button.querySelector(".color-token-value");

      button.classList.toggle("active", token === this.activeColorKey);
      swatch.style.backgroundColor = ThemeForge.theme.colors[token];
      value.textContent = ThemeForge.theme.colors[token];
    });
  },

  getLabel(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (letter) => letter.toUpperCase());
  },
};
