// Offline "demo AI" card designer.
//
// Reads a free-text prompt ("dark navy and gold card for a lawyer") and builds a
// design from keyword rules: colours, moods and professions. It costs nothing and
// needs no API key, so the AI designer works on the free hosting tier. When
// ANTHROPIC_API_KEY is set, /api/ai/design asks Claude first and only falls back
// to this generator if that call fails.
//
// `variant` lets the user press "Regenerate" and get a different take on the
// same prompt; the result is deterministic for a given prompt + variant.

import {
  CARD_FONTS,
  CARD_LAYOUTS,
  CARD_PATTERNS,
  CARD_FINISHES,
  PALETTES,
  normalizeDesign,
  designSummary,
} from "./cardDesign";

// Base colour words -> [dark, light] stops plus readable text/accent.
const COLOR_WORDS = [
  { words: ["navy"], colors: ["#0b1d3a", "#1e3a8a"], text: "#f8fafc", accent: "#93c5fd" },
  { words: ["blue", "cobalt", "indigo"], colors: ["#1e3a8a", "#3b82f6"], text: "#ffffff", accent: "#bfdbfe" },
  { words: ["sky", "cyan", "aqua", "turquoise"], colors: ["#0891b2", "#38bdf8"], text: "#ffffff", accent: "#ecfeff" },
  { words: ["teal"], colors: ["#0f766e", "#14b8a6"], text: "#ffffff", accent: "#ccfbf1" },
  { words: ["mint"], colors: ["#ccfbf1", "#5eead4"], text: "#134e4a", accent: "#0f766e" },
  { words: ["green", "emerald", "olive", "sage"], colors: ["#064e3b", "#10b981"], text: "#ecfdf5", accent: "#fde68a" },
  { words: ["red", "scarlet"], colors: ["#7f1d1d", "#dc2626"], text: "#fff7ed", accent: "#fecaca" },
  { words: ["maroon", "burgundy", "wine"], colors: ["#3f0d12", "#7f1d1d"], text: "#fef3c7", accent: "#eab308" },
  { words: ["orange", "amber", "tangerine"], colors: ["#c2410c", "#f97316"], text: "#ffffff", accent: "#fef3c7" },
  { words: ["yellow", "lemon"], colors: ["#facc15", "#fde68a"], text: "#422006", accent: "#a16207" },
  { words: ["gold", "golden"], colors: ["#78350f", "#d4a017"], text: "#fffbeb", accent: "#fde68a" },
  { words: ["pink", "magenta", "fuchsia"], colors: ["#db2777", "#f472b6"], text: "#ffffff", accent: "#fdf2f8" },
  { words: ["rose", "blush", "pastel"], colors: ["#fff1f2", "#fbcfe8"], text: "#831843", accent: "#db2777" },
  { words: ["purple", "violet", "plum"], colors: ["#3b0764", "#7e22ce"], text: "#fdf4ff", accent: "#f0abfc" },
  { words: ["lavender", "lilac"], colors: ["#ede9fe", "#c4b5fd"], text: "#3b0764", accent: "#7c3aed" },
  { words: ["brown", "coffee", "chocolate", "wood"], colors: ["#292524", "#78350f"], text: "#fafaf9", accent: "#f59e0b" },
  { words: ["beige", "cream", "sand", "ivory"], colors: ["#fefce8", "#fde68a"], text: "#422006", accent: "#b45309" },
  { words: ["black", "dark", "night", "noir"], colors: ["#050505", "#262626"], text: "#fafafa", accent: "#d4d4d4" },
  { words: ["white", "light", "clean", "bright"], colors: ["#ffffff", "#e5e7eb"], text: "#111827", accent: "#4f46e5" },
  { words: ["gray", "grey", "silver", "steel"], colors: ["#9ca3af", "#e5e7eb"], text: "#111827", accent: "#1f2937" },
];

// Moods and professions -> design hints. Arrays give choices for `variant`.
const THEMES = [
  {
    words: ["minimal", "simple", "clean", "subtle", "modern"],
    font: ["geometric", "modern"], layout: ["minimal", "left"], pattern: ["none"], finish: ["matte"],
  },
  {
    words: ["luxury", "premium", "elegant", "classy", "vip", "royal", "high-end"],
    palette: ["navyGold", "gold", "onyx"], font: ["classic", "script"], layout: ["centered", "banner"],
    pattern: ["none", "rings"], finish: ["metallic"], accent: "#d4a017",
  },
  {
    words: ["playful", "fun", "colorful", "colourful", "vibrant", "kids", "party"],
    palette: ["sunset", "sky", "grape"], font: ["rounded"], layout: ["centered", "banner"],
    pattern: ["confetti", "dots"], finish: ["glossy", "frosted"],
  },
  {
    words: ["creative", "artist", "designer", "design", "studio", "photographer", "photography", "art"],
    palette: ["sunset", "grape", "peach"], font: ["display", "classic", "rounded"], layout: ["banner", "left"],
    pattern: ["diagonal", "waves", "zigzag"], finish: ["glossy"],
  },
  {
    words: ["corporate", "professional", "business", "consultant", "manager", "executive", "ceo", "company"],
    palette: ["slateBlue", "navyGold", "pearl"], font: ["modern", "geometric"], layout: ["left", "split"],
    pattern: ["none", "grid"], finish: ["matte"],
  },
  {
    words: ["tech", "developer", "programmer", "coder", "software", "engineer", "ai", "startup", "it", "cyber", "web"],
    palette: ["neon", "matrix", "aurora"], font: ["tech", "geometric"], layout: ["left", "minimal", "split"],
    pattern: ["plus", "grid"], finish: ["glossy", "matte"],
  },
  {
    words: ["nature", "eco", "organic", "green", "garden", "farm", "plant", "agro"],
    palette: ["emerald", "forest"], font: ["classic", "rounded"], layout: ["left", "centered"],
    pattern: ["waves", "topo"], finish: ["matte"],
  },
  {
    words: ["ocean", "sea", "beach", "travel", "tour", "marine"],
    palette: ["ocean", "sky"], font: ["rounded", "modern"], layout: ["centered"], pattern: ["waves"], finish: ["frosted"],
  },
  {
    words: ["sunset", "warm", "summer"],
    palette: ["sunset", "peach"], font: ["rounded", "classic"], layout: ["centered"], pattern: ["rings", "none"], finish: ["glossy"],
  },
  {
    words: ["bold", "strong", "power", "loud", "sport", "sports"],
    font: ["display"], layout: ["banner", "left"], pattern: ["diagonal", "zigzag"], finish: ["glossy"],
  },
  {
    words: ["retro", "vintage", "classic", "old"],
    palette: ["coffee", "sand"], font: ["classic"], layout: ["centered"], pattern: ["stripes", "topo"], finish: ["matte"],
  },
  {
    words: ["eid", "wedding", "festive", "festival", "celebration", "puja", "event"],
    palette: ["maroonGold", "blush", "gold"], font: ["script"], layout: ["centered"], pattern: ["rings", "confetti"], finish: ["metallic", "frosted"],
  },
  {
    words: ["doctor", "medical", "clinic", "dentist", "nurse", "health", "hospital", "pharma", "pharmacy"],
    palette: ["teal", "pearl", "mint"], font: ["modern"], layout: ["left", "split"], pattern: ["none"], finish: ["matte"],
  },
  {
    words: ["lawyer", "legal", "attorney", "advocate", "law", "finance", "bank", "banker", "accountant", "ca", "audit"],
    palette: ["navyGold", "midnight"], font: ["classic"], layout: ["left", "split"], pattern: ["none"], finish: ["matte", "metallic"],
  },
  {
    words: ["chef", "food", "restaurant", "cafe", "bakery", "cook", "catering"],
    palette: ["ember", "coffee", "peach"], font: ["classic", "rounded"], layout: ["centered", "banner"], pattern: ["dots", "stripes"], finish: ["matte"],
  },
  {
    words: ["teacher", "education", "tutor", "school", "student", "coach", "trainer"],
    palette: ["royal", "sky", "slateBlue"], font: ["rounded", "modern"], layout: ["left", "centered"], pattern: ["dots", "none"], finish: ["glossy"],
  },
  {
    words: ["real", "estate", "property", "realtor", "architect", "construction", "builder"],
    palette: ["forest", "midnight", "silver"], font: ["classic", "geometric"], layout: ["split", "left"], pattern: ["grid", "topo"], finish: ["matte", "metallic"],
  },
  {
    words: ["fitness", "gym", "workout", "athlete", "yoga"],
    palette: ["crimson", "onyx", "ember"], font: ["display"], layout: ["banner", "left"], pattern: ["diagonal", "zigzag"], finish: ["glossy"],
  },
  {
    words: ["beauty", "salon", "makeup", "fashion", "boutique", "spa", "bridal"],
    palette: ["blush", "rose", "lavender"], font: ["script", "classic"], layout: ["centered"], pattern: ["none", "confetti"], finish: ["frosted", "metallic"],
  },
  {
    words: ["marketing", "agency", "media", "influencer", "creator", "youtuber", "brand"],
    palette: ["grape", "sunset", "aurora"], font: ["geometric", "display"], layout: ["banner", "split"], pattern: ["waves", "dots"], finish: ["glossy"],
  },
];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function choose(list, seed, offset = 0) {
  if (!list || !list.length) return undefined;
  return list[(seed + offset) % list.length];
}

function tokenize(prompt) {
  return String(prompt || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function generateDesignFromPrompt(prompt, variant = 0) {
  const tokens = tokenize(prompt);
  const tokenSet = new Set(tokens);
  const seed = hash(tokens.join(" ")) + Number(variant || 0) * 7919;

  // Colour words in the order the user typed them.
  const colorHits = [];
  for (const token of tokens) {
    const hit = COLOR_WORDS.find((c) => c.words.includes(token));
    if (hit && !colorHits.includes(hit)) colorHits.push(hit);
  }

  const themeHits = THEMES.filter((t) => t.words.some((w) => tokenSet.has(w)));
  const theme = themeHits.reduce(
    (acc, t) => ({
      palette: acc.palette || t.palette,
      font: acc.font || t.font,
      layout: acc.layout || t.layout,
      pattern: acc.pattern || t.pattern,
      finish: acc.finish || t.finish,
      accent: acc.accent || t.accent,
    }),
    {},
  );

  let colors;
  let text;
  let accent;

  if (colorHits.length >= 2) {
    // "navy and gold": first colour is the card, second is the accent.
    const [main, second] = colorHits;
    colors = [main.colors[0], main.colors[1]];
    text = main.text;
    accent = second.colors[1];
  } else if (colorHits.length === 1) {
    const main = colorHits[0];
    colors = [...main.colors];
    text = main.text;
    accent = theme.accent || main.accent;
  } else {
    const paletteKey =
      choose(theme.palette, seed) ||
      choose(Object.keys(PALETTES), seed);
    const p = PALETTES[paletteKey];
    colors = [...p.colors];
    text = p.text;
    accent = theme.accent || p.accent;
  }

  const fonts = Object.keys(CARD_FONTS);
  const layouts = Object.keys(CARD_LAYOUTS);
  const patterns = Object.keys(CARD_PATTERNS);
  const finishes = Object.keys(CARD_FINISHES);

  const design = normalizeDesign({
    colors,
    angle: [135, 120, 160, 100, 45, 180][seed % 6],
    text,
    accent,
    font: choose(theme.font, seed, 1) || choose(fonts, seed, 1),
    layout: choose(theme.layout, seed, 2) || choose(layouts, seed, 2),
    pattern: choose(theme.pattern, seed, 3) || choose(patterns, seed, 3),
    finish: choose(theme.finish, seed, 4) || choose(finishes, seed, 4),
  });

  const matched = [
    ...colorHits.map((c) => c.words[0]),
    ...themeHits.map((t) => t.words[0]),
  ];

  return {
    design,
    title: matched.length ? `${matched.slice(0, 3).join(" + ")} design` : "Surprise design",
    summary: designSummary(design),
    source: "demo",
  };
}
