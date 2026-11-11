// Card design model (v2).
//
// A card's look is stored as a plain `design` object on the card document:
//   {
//     v: 2,
//     colors:  ["#hex", "#hex", "#hex"?]   1-3 background stops
//     angle:   0-360                        gradient angle in degrees
//     text:    "#hex"                       main text colour
//     accent:  "#hex"                       accent colour (bars, bands, icons)
//     font:    key of CARD_FONTS
//     layout:  key of CARD_LAYOUTS
//     pattern: key of CARD_PATTERNS
//     finish:  key of CARD_FINISHES
//   }
//
// Cards saved before v2 have no `design` and keep rendering from their legacy
// Tailwind `bgGrad` / `bgStyle` class strings. Everything here is plain data so
// the same rules run in the browser, in API routes and in the AI generator.

export const DESIGN_VERSION = 2;

export const CARD_FONTS = {
  modern: {
    label: "Modern",
    name: "'Poppins', ui-sans-serif, system-ui, sans-serif",
    body: "'Poppins', ui-sans-serif, system-ui, sans-serif",
    nameWeight: 600,
  },
  geometric: {
    label: "Geometric",
    name: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
    body: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
    nameWeight: 700,
  },
  classic: {
    label: "Classic serif",
    name: "'Playfair Display', Georgia, 'Times New Roman', serif",
    body: "'Poppins', ui-sans-serif, system-ui, sans-serif",
    nameWeight: 700,
  },
  tech: {
    label: "Tech mono",
    name: "'JetBrains Mono', 'Courier New', ui-monospace, monospace",
    body: "'JetBrains Mono', 'Courier New', ui-monospace, monospace",
    nameWeight: 700,
  },
  rounded: {
    label: "Friendly",
    name: "'Nunito', ui-rounded, system-ui, sans-serif",
    body: "'Nunito', ui-rounded, system-ui, sans-serif",
    nameWeight: 800,
  },
  display: {
    label: "Bold display",
    name: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif",
    body: "'Poppins', ui-sans-serif, system-ui, sans-serif",
    nameWeight: 400,
    uppercase: true,
    nameScale: 1.35,
  },
  script: {
    label: "Elegant script",
    name: "'Great Vibes', 'Brush Script MT', cursive",
    body: "'Poppins', ui-sans-serif, system-ui, sans-serif",
    nameWeight: 400,
    nameScale: 1.5,
  },
};

export const CARD_LAYOUTS = {
  centered: { label: "Centered" },
  left: { label: "Left aligned" },
  split: { label: "Split contact" },
  minimal: { label: "Minimal" },
  banner: { label: "Accent band" },
};

export const CARD_FINISHES = {
  matte: { label: "Matte" },
  glossy: { label: "Glossy" },
  metallic: { label: "Metallic" },
  frosted: { label: "Frosted" },
};

// Overlay patterns drawn with CSS backgrounds. `currentColor` takes the card's text colour.
export const CARD_PATTERNS = {
  none: { label: "Plain", overlayClass: "", overlayStyle: undefined },
  dots: {
    label: "Dots",
    overlayClass: "opacity-20",
    overlayStyle: {
      backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.5px)",
      backgroundSize: "14px 14px",
    },
  },
  grid: {
    label: "Grid",
    overlayClass: "opacity-[0.15]",
    overlayStyle: {
      backgroundImage:
        "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
      backgroundSize: "18px 18px",
    },
  },
  diagonal: {
    label: "Diagonal",
    overlayClass: "opacity-[0.15]",
    overlayStyle: {
      backgroundImage:
        "repeating-linear-gradient(45deg, currentColor 0, currentColor 1.5px, transparent 1.5px, transparent 12px)",
    },
  },
  waves: {
    label: "Waves",
    overlayClass: "opacity-20",
    overlayStyle: {
      backgroundImage:
        "radial-gradient(circle at 0 50%, transparent 24%, currentColor 25%, currentColor 26%, transparent 27%, transparent 74%, currentColor 75%, currentColor 76%, transparent 77%)",
      backgroundSize: "24px 24px",
    },
  },
  rings: {
    label: "Rings",
    overlayClass: "opacity-20",
    overlayStyle: {
      backgroundImage:
        "radial-gradient(circle, transparent 45%, currentColor 46%, currentColor 48%, transparent 49%)",
      backgroundSize: "26px 26px",
    },
  },
  stripes: {
    label: "Stripes",
    overlayClass: "opacity-[0.12]",
    overlayStyle: {
      backgroundImage:
        "repeating-linear-gradient(90deg, currentColor 0, currentColor 2px, transparent 2px, transparent 16px)",
    },
  },
  crosshatch: {
    label: "Crosshatch",
    overlayClass: "opacity-[0.12]",
    overlayStyle: {
      backgroundImage:
        "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 1px, transparent 10px), repeating-linear-gradient(-45deg, currentColor 0, currentColor 1px, transparent 1px, transparent 10px)",
    },
  },
  zigzag: {
    label: "Zigzag",
    overlayClass: "opacity-[0.14]",
    overlayStyle: {
      backgroundImage:
        "linear-gradient(135deg, currentColor 25%, transparent 25%), linear-gradient(225deg, currentColor 25%, transparent 25%)",
      backgroundSize: "20px 20px",
      backgroundPosition: "0 0, 10px 0",
    },
  },
  plus: {
    label: "Circuit",
    overlayClass: "opacity-[0.16]",
    overlayStyle: {
      backgroundImage:
        "radial-gradient(circle, currentColor 2px, transparent 2.5px), linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
      backgroundSize: "24px 24px, 48px 24px, 24px 48px",
      backgroundPosition: "0 0, 12px 12px, 12px 12px",
    },
  },
  confetti: {
    label: "Confetti",
    overlayClass: "opacity-25",
    overlayStyle: {
      backgroundImage:
        "radial-gradient(currentColor 1.5px, transparent 2px), radial-gradient(currentColor 1px, transparent 1.5px), radial-gradient(currentColor 2px, transparent 2.5px)",
      backgroundSize: "37px 41px, 23px 29px, 53px 47px",
      backgroundPosition: "0 0, 11px 7px, 19px 23px",
    },
  },
  topo: {
    label: "Contour",
    overlayClass: "opacity-[0.14]",
    overlayStyle: {
      backgroundImage:
        "repeating-radial-gradient(circle at 85% 20%, currentColor 0, currentColor 1px, transparent 1px, transparent 14px)",
    },
  },
};

export const FONT_KEYS = Object.keys(CARD_FONTS);
export const LAYOUT_KEYS = Object.keys(CARD_LAYOUTS);
export const FINISH_KEYS = Object.keys(CARD_FINISHES);
export const PATTERN_KEYS = Object.keys(CARD_PATTERNS);

// Named colour sets. `text` and `accent` are picked to stay readable on `colors`.
export const PALETTES = {
  midnight: { label: "Midnight", colors: ["#0f172a", "#1e293b", "#334155"], text: "#f8fafc", accent: "#38bdf8" },
  onyx: { label: "Onyx", colors: ["#050505", "#1c1c1c"], text: "#fafafa", accent: "#a3a3a3" },
  royal: { label: "Royal", colors: ["#1e1b4b", "#4338ca", "#6366f1"], text: "#ffffff", accent: "#fbbf24" },
  navyGold: { label: "Navy & gold", colors: ["#0b1d3a", "#16325c"], text: "#f8fafc", accent: "#d4a017" },
  ocean: { label: "Ocean", colors: ["#0c4a6e", "#0284c7", "#22d3ee"], text: "#ffffff", accent: "#e0f2fe" },
  sky: { label: "Sky", colors: ["#38bdf8", "#7c3aed"], text: "#ffffff", accent: "#fde68a" },
  emerald: { label: "Emerald", colors: ["#064e3b", "#047857", "#10b981"], text: "#ecfdf5", accent: "#fcd34d" },
  forest: { label: "Forest", colors: ["#14271c", "#2f5d3a"], text: "#f0fdf4", accent: "#c9a227" },
  mint: { label: "Mint", colors: ["#ccfbf1", "#5eead4"], text: "#134e4a", accent: "#0f766e" },
  teal: { label: "Clinic teal", colors: ["#0f766e", "#14b8a6"], text: "#ffffff", accent: "#ccfbf1" },
  sunset: { label: "Sunset", colors: ["#f97316", "#ec4899", "#7c3aed"], text: "#ffffff", accent: "#fef3c7" },
  ember: { label: "Ember", colors: ["#7f1d1d", "#dc2626", "#f97316"], text: "#fff7ed", accent: "#fde047" },
  crimson: { label: "Crimson", colors: ["#450a0a", "#991b1b"], text: "#fef2f2", accent: "#f87171" },
  rose: { label: "Rose", colors: ["#fda4af", "#e11d48"], text: "#ffffff", accent: "#fff1f2" },
  blush: { label: "Blush", colors: ["#fff1f2", "#fbcfe8"], text: "#831843", accent: "#db2777" },
  lavender: { label: "Lavender", colors: ["#ede9fe", "#c4b5fd"], text: "#3b0764", accent: "#7c3aed" },
  grape: { label: "Grape", colors: ["#3b0764", "#7e22ce", "#c026d3"], text: "#fdf4ff", accent: "#f0abfc" },
  neon: { label: "Neon", colors: ["#020617", "#0f172a"], text: "#e2e8f0", accent: "#22d3ee" },
  matrix: { label: "Matrix", colors: ["#03140a", "#052e16"], text: "#bbf7d0", accent: "#22c55e" },
  sand: { label: "Sand", colors: ["#fefce8", "#fde68a"], text: "#422006", accent: "#b45309" },
  coffee: { label: "Coffee", colors: ["#292524", "#57534e", "#78350f"], text: "#fafaf9", accent: "#f59e0b" },
  pearl: { label: "Pearl", colors: ["#ffffff", "#e5e7eb"], text: "#111827", accent: "#4f46e5" },
  silver: { label: "Silver", colors: ["#9ca3af", "#e5e7eb", "#6b7280"], text: "#111827", accent: "#1f2937" },
  gold: { label: "Gold foil", colors: ["#78350f", "#d4a017", "#fde68a"], text: "#1c1917", accent: "#451a03" },
  maroonGold: { label: "Maroon & gold", colors: ["#3f0d12", "#7f1d1d"], text: "#fef3c7", accent: "#eab308" },
  peach: { label: "Peach", colors: ["#fed7aa", "#fda4af"], text: "#7c2d12", accent: "#c2410c" },
  aurora: { label: "Aurora", colors: ["#0f172a", "#0d9488", "#a855f7"], text: "#ffffff", accent: "#5eead4" },
  slateBlue: { label: "Slate blue", colors: ["#1e293b", "#3b82f6"], text: "#ffffff", accent: "#bfdbfe" },
};

export const PALETTE_KEYS = Object.keys(PALETTES);

export const DEFAULT_DESIGN = {
  v: DESIGN_VERSION,
  colors: PALETTES.royal.colors,
  angle: 135,
  text: PALETTES.royal.text,
  accent: PALETTES.royal.accent,
  font: "modern",
  layout: "centered",
  pattern: "none",
  finish: "glossy",
};

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function cleanHex(value, fallback) {
  if (typeof value !== "string") return fallback;
  const v = value.trim();
  return HEX.test(v) ? v.toLowerCase() : fallback;
}

function pick(value, keys, fallback) {
  return keys.includes(value) ? value : fallback;
}

// Returns a complete, safe design object, or null when `raw` is not a design.
// Use it on every design that comes from a client, the database or the AI.
export function normalizeDesign(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const colors = (Array.isArray(raw.colors) ? raw.colors : [])
    .map((c) => cleanHex(c, null))
    .filter(Boolean)
    .slice(0, 3);
  const angle = Number(raw.angle);

  return {
    v: DESIGN_VERSION,
    colors: colors.length ? colors : DEFAULT_DESIGN.colors,
    angle: Number.isFinite(angle) ? Math.round(((angle % 360) + 360) % 360) : DEFAULT_DESIGN.angle,
    text: cleanHex(raw.text, DEFAULT_DESIGN.text),
    accent: cleanHex(raw.accent, DEFAULT_DESIGN.accent),
    font: pick(raw.font, FONT_KEYS, DEFAULT_DESIGN.font),
    layout: pick(raw.layout, LAYOUT_KEYS, DEFAULT_DESIGN.layout),
    pattern: pick(raw.pattern, PATTERN_KEYS, DEFAULT_DESIGN.pattern),
    finish: pick(raw.finish, FINISH_KEYS, DEFAULT_DESIGN.finish),
  };
}

export function designBackground(design) {
  const { colors, angle } = design;
  if (colors.length === 1) return colors[0];
  return `linear-gradient(${angle}deg, ${colors.join(", ")})`;
}

// Relative luminance of a hex colour, 0 (black) to 1 (white).
export function luminance(hex) {
  let h = String(hex || "").replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return 0;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// True when the card's text is dark, i.e. the card itself is light.
export function isLightDesign(design) {
  return !!design && luminance(design.text) < 0.4;
}

export function paletteDesign(paletteKey, overrides = {}) {
  const p = PALETTES[paletteKey] || PALETTES.royal;
  return normalizeDesign({
    ...DEFAULT_DESIGN,
    colors: p.colors,
    text: p.text,
    accent: p.accent,
    ...overrides,
  });
}

export const PRESET_CATEGORIES = [
  "Corporate",
  "Minimal",
  "Creative",
  "Dark",
  "Luxury",
  "Nature",
  "Tech",
  "Festive",
];

function preset(id, label, category, paletteKey, overrides) {
  return { id, label, category, design: paletteDesign(paletteKey, overrides) };
}

// Ready-made looks shown in the designer's template gallery.
export const DESIGN_PRESETS = [
  preset("exec-navy", "Executive Navy", "Corporate", "navyGold", { font: "classic", layout: "left", finish: "matte" }),
  preset("slate-pro", "Slate Pro", "Corporate", "slateBlue", { font: "modern", layout: "split", angle: 120 }),
  preset("royal-board", "Boardroom", "Corporate", "royal", { font: "geometric", layout: "left", pattern: "grid", finish: "matte" }),
  preset("pearl-clean", "Pearl Clean", "Corporate", "pearl", { font: "modern", layout: "split", finish: "matte", angle: 160 }),
  preset("silver-line", "Silver Line", "Corporate", "silver", { font: "geometric", layout: "left", finish: "metallic", angle: 115 }),

  preset("mono-minimal", "Mono Minimal", "Minimal", "onyx", { font: "geometric", layout: "minimal", finish: "matte" }),
  preset("paper-white", "Paper White", "Minimal", "pearl", { font: "geometric", layout: "minimal", finish: "matte", angle: 180 }),
  preset("sand-soft", "Soft Sand", "Minimal", "sand", { font: "modern", layout: "minimal", finish: "matte" }),
  preset("mint-air", "Mint Air", "Minimal", "mint", { font: "rounded", layout: "centered", finish: "frosted" }),

  preset("sunset-pop", "Sunset Pop", "Creative", "sunset", { font: "rounded", layout: "centered", pattern: "confetti" }),
  preset("grape-wave", "Grape Wave", "Creative", "grape", { font: "display", layout: "banner", pattern: "waves" }),
  preset("sky-dream", "Sky Dream", "Creative", "sky", { font: "rounded", layout: "centered", pattern: "rings", finish: "frosted" }),
  preset("peach-studio", "Peach Studio", "Creative", "peach", { font: "classic", layout: "left", pattern: "diagonal", finish: "matte" }),
  preset("ember-bold", "Ember Bold", "Creative", "ember", { font: "display", layout: "banner", pattern: "zigzag" }),

  preset("midnight", "Midnight", "Dark", "midnight", { font: "modern", layout: "centered", pattern: "dots" }),
  preset("onyx-split", "Onyx Split", "Dark", "onyx", { font: "modern", layout: "split", finish: "glossy", accent: "#f5f5f5" }),
  preset("crimson-night", "Crimson Night", "Dark", "crimson", { font: "display", layout: "left", pattern: "diagonal" }),
  preset("coffee-house", "Coffee House", "Dark", "coffee", { font: "classic", layout: "centered", pattern: "topo", finish: "matte" }),

  preset("gold-foil", "Gold Foil", "Luxury", "gold", { font: "classic", layout: "centered", finish: "metallic", angle: 110 }),
  preset("black-gold", "Black & Gold", "Luxury", "onyx", { font: "classic", layout: "banner", finish: "metallic", accent: "#d4a017" }),
  preset("royal-script", "Royal Script", "Luxury", "royal", { font: "script", layout: "centered", finish: "metallic", pattern: "rings" }),
  preset("navy-crest", "Navy Crest", "Luxury", "navyGold", { font: "script", layout: "centered", finish: "metallic" }),

  preset("emerald-leaf", "Emerald Leaf", "Nature", "emerald", { font: "classic", layout: "left", pattern: "waves" }),
  preset("forest-trail", "Forest Trail", "Nature", "forest", { font: "geometric", layout: "split", pattern: "topo", finish: "matte" }),
  preset("ocean-tide", "Ocean Tide", "Nature", "ocean", { font: "rounded", layout: "centered", pattern: "waves", finish: "frosted" }),
  preset("clinic", "Clinic Care", "Nature", "teal", { font: "modern", layout: "left", finish: "matte" }),

  preset("neon-dev", "Neon Dev", "Tech", "neon", { font: "tech", layout: "left", pattern: "plus" }),
  preset("matrix", "Terminal", "Tech", "matrix", { font: "tech", layout: "minimal", pattern: "grid", finish: "matte" }),
  preset("aurora-ai", "Aurora AI", "Tech", "aurora", { font: "geometric", layout: "split", pattern: "plus", angle: 150 }),

  preset("eid-glow", "Eid Glow", "Festive", "maroonGold", { font: "script", layout: "centered", pattern: "rings", finish: "metallic" }),
  preset("wedding-blush", "Wedding Blush", "Festive", "blush", { font: "script", layout: "centered", pattern: "confetti", finish: "frosted" }),
  preset("lavender-fest", "Lavender Fest", "Festive", "lavender", { font: "rounded", layout: "banner", pattern: "confetti", finish: "frosted" }),
];

export function designSummary(design) {
  if (!design) return "";
  return [
    CARD_FONTS[design.font]?.label,
    CARD_LAYOUTS[design.layout]?.label?.toLowerCase(),
    CARD_PATTERNS[design.pattern]?.label?.toLowerCase(),
    CARD_FINISHES[design.finish]?.label?.toLowerCase(),
  ]
    .filter(Boolean)
    .join(" · ");
}
