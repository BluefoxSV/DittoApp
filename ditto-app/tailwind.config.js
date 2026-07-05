/**
 * TAILWIND CONFIG — DittoApp / Jobcrafter / Micraft
 * ---------------------------------------------------
 * Filosofía: 1 solo lugar donde se declaran los colores base.
 * Todo lo demás (tints/shades 50–950, variantes hover/active, etc.)
 * se GENERA con una función. Si mañana cambia el morado de marca,
 * se edita 1 línea (BASE_COLORS) y toda la app se actualiza.
 */


const BASE_COLORS = {
    primary: "#BB6AF0", // morado de marca
    paper:   "#FCFCF5", // blanco (nombrado "paper", no "base": Tailwind ya usa "text-base" para font-size y choca)
    gray:    "#F4E8FD", // gris (con tinte morado)
  };
  
  // ---- utilidades de mezcla (sin dependencias externas) ----
  function hexToRgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex([r, g, b]) {
    return (
      "#" +
      [r, g, b]
        .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0"))
        .join("")
    );
  }
  // mezcla el color base con blanco (t>0) o negro (t<0), t en [-1,1]
  function mix(hex, t) {
    const [r, g, b] = hexToRgb(hex);
    const target = t >= 0 ? [255, 255, 255] : [0, 0, 0];
    const amt = Math.abs(t);
    return rgbToHex([
      r + (target[0] - r) * amt,
      g + (target[1] - g) * amt,
      b + (target[2] - b) * amt,
    ]);
  }

  corePlugins: { preflight: false };
  
  // Genera una escala 50–950 (11 pasos) a partir de un solo hex.
  // step 500 = color exacto que diste; <500 más claro, >500 más oscuro.
  function generateScale(hex) {
    const steps = {
      50: 0.92, 100: 0.84, 200: 0.68, 300: 0.52, 400: 0.28,
      500: 0,                              // color base, sin mezcla
      600: -0.12, 700: -0.28, 800: -0.44, 900: -0.6, 950: -0.76,
    };
    const scale = {};
    for (const [k, t] of Object.entries(steps)) {
      scale[k] = t === 0 ? hex : mix(hex, t);
    }
    return scale;
  }
  
  
  const colors = {
    primary: generateScale(BASE_COLORS.primary),
    gray: generateScale(BASE_COLORS.gray),
    paper: BASE_COLORS.paper, // blanco no necesita escala, es plano
  };

  colors.gray[700] = "#4a4550";
  colors.gray[800] = "#2e2b33";
  colors.gray[900] = "#1a1a1a";
  
  module.exports = {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors, // -> bg-primary-500, text-gray-700, bg-base, etc.
      },
    },
    plugins: [],
  };
  
  module.exports._debugColors = colors; // solo para inspección manual si se necesita
  