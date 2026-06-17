function hexToRgb(hex) {
  const cleanHex = hex.replace("#", "").trim();

  if (!/^[0-9a-fA-F]{6}$/.test(cleanHex)) {
    return null;
  }

  return {
    r: parseInt(cleanHex.slice(0, 2), 16),
    g: parseInt(cleanHex.slice(2, 4), 16),
    b: parseInt(cleanHex.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) => {
    const clamped = Math.max(0, Math.min(255, Number(value)));
    return clamped.toString(16).padStart(2, "0");
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case red:
        h = 60 * (((green - blue) / delta) % 6);
        break;
      case green:
        h = 60 * ((blue - red) / delta + 2);
        break;
      case blue:
        h = 60 * ((red - green) / delta + 4);
        break;
    }
  }

  return {
    h: Number(((h + 360) % 360).toFixed(2)),
    s: Number((s * 100).toFixed(2)),
    l: Number((l * 100).toFixed(2)),
  };
}

function hslToRgb({ h, s, l }) {
  const hue = Number(h);
  const saturation = Number(s) / 100;
  const lightness = Number(l) / 100;

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue >= 0 && hue < 60) {
    red = chroma;
    green = x;
  } else if (hue < 120) {
    red = x;
    green = chroma;
  } else if (hue < 180) {
    green = chroma;
    blue = x;
  } else if (hue < 240) {
    green = x;
    blue = chroma;
  } else if (hue < 300) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  return {
    r: Math.round((red + m) * 255),
    g: Math.round((green + m) * 255),
    b: Math.round((blue + m) * 255),
  };
}

function hexToHsl(hex) {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return null;
  }

  return rgbToHsl(rgb);
}

function hslToHex(hsl) {
  return rgbToHex(hslToRgb(hsl));
}
