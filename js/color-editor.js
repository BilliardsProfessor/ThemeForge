ThemeForge.colorEditor = {
  activeColorKey: "primary",

  init() {
    ThemeForge.ui = ThemeForge.ui || {};
    ThemeForge.ui.preferredColorFormat = localStorage.getItem("themeForge.preferredColorFormat") || "hsl";

    this.bindTokenButtons();
    this.bindEditorControls();
    this.render();
  },

  getActiveColor() {
    return ThemeForge.theme.colors[this.activeColorKey];
  },

  bindTokenButtons() {
    document.querySelectorAll("[data-color-token]").forEach((button) => {
      button.addEventListener("click", () => {
        this.activeColorKey = button.dataset.colorToken;
        this.render();
      });
    });
  },

  bindEditorControls() {
    document.querySelector("#colorNativePicker").addEventListener("input", (event) => {
      const rgb = hexToRgb(event.target.value);
      Object.assign(this.getActiveColor(), rgbToHsl(rgb), { a: this.getActiveColor().a });
      ThemeForge.applyTheme();
      this.render();
    });

    document.querySelector("#hexValue").addEventListener("input", (event) => {
      const rgb = hexToRgb(event.target.value);

      if (!rgb) return;

      Object.assign(this.getActiveColor(), rgbToHsl(rgb), { a: this.getActiveColor().a });
      ThemeForge.applyTheme();
      this.render();
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
        const rgb = {
          r: Number(document.querySelector("#rgbR").value),
          g: Number(document.querySelector("#rgbG").value),
          b: Number(document.querySelector("#rgbB").value),
        };

        Object.assign(this.getActiveColor(), rgbToHsl(rgb), { a: this.getActiveColor().a });
        ThemeForge.applyTheme();
        this.render();
      });
    });

    document.querySelectorAll("[data-hsl-channel]").forEach((input) => {
      input.addEventListener("input", () => {
        Object.assign(this.getActiveColor(), {
          h: Number(document.querySelector("#hslH").value),
          s: Number(document.querySelector("#hslS").value),
          l: Number(document.querySelector("#hslL").value),
        });

        ThemeForge.applyTheme();
        this.render();
      });
    });

    document.querySelectorAll("#alphaValue, #alphaNumber").forEach((input) => {
      input.addEventListener("input", () => {
        const alpha = Number(input.value);
        const clampedAlpha = Math.max(0, Math.min(1, alpha));

        this.getActiveColor().a = clampedAlpha;

        ThemeForge.applyTheme();
        this.render();
      });
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

    document.querySelector("#alphaValue").value = color.a;
    document.querySelector("#alphaNumber").value = color.a;

    document.querySelectorAll("[data-color-format]").forEach((button) => {
      button.classList.toggle("active", button.dataset.colorFormat === format);
    });

    document.querySelectorAll("[data-format-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.formatPanel !== format;
    });

    document.querySelectorAll("[data-color-token]").forEach((button) => {
      const token = button.dataset.colorToken;
      const tokenColor = ThemeForge.theme.colors[token];
      const swatch = button.querySelector(".color-token-swatch");
      const value = button.querySelector(".color-token-value");

      button.classList.toggle("active", token === this.activeColorKey);
      swatch.style.backgroundColor = ThemeForge.getColorValue(tokenColor);
      value.textContent = ThemeForge.getColorValue(tokenColor, format);
    });
  },

  getLabel(key) {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
  },
};
