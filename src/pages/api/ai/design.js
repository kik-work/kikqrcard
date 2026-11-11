import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { requireUser } from "../../../../lib/userAuth";
import {
  CARD_FONTS,
  CARD_LAYOUTS,
  CARD_PATTERNS,
  CARD_FINISHES,
  FONT_KEYS,
  LAYOUT_KEYS,
  PATTERN_KEYS,
  FINISH_KEYS,
  normalizeDesign,
  designSummary,
} from "@/lib/cardDesign";
import { generateDesignFromPrompt } from "@/lib/aiDesignLocal";

// POST /api/ai/design  { prompt, variant? } -> { design, title, summary, source }
//
// source "claude": designed by Claude (only when ANTHROPIC_API_KEY is set).
// source "demo":   built by the free offline generator in src/lib/aiDesignLocal.js.
// Any Claude failure (no key, timeout, refusal, bad output) falls back to "demo",
// so the designer never breaks for the user.

const MAX_PROMPT = 300;
const LIMIT_PER_HOUR = 30;
const hits = new Map(); // email -> timestamps. Per server instance; fine for a demo.

function rateLimited(email) {
  const now = Date.now();
  const recent = (hits.get(email) || []).filter((t) => now - t < 60 * 60 * 1000);
  if (recent.length >= LIMIT_PER_HOUR) {
    hits.set(email, recent);
    return true;
  }
  recent.push(now);
  hits.set(email, recent);
  return false;
}

const DesignSchema = z.object({
  title: z.string(),
  summary: z.string(),
  colors: z.array(z.string()),
  angle: z.number(),
  text: z.string(),
  accent: z.string(),
  font: z.enum(FONT_KEYS),
  layout: z.enum(LAYOUT_KEYS),
  pattern: z.enum(PATTERN_KEYS),
  finish: z.enum(FINISH_KEYS),
});

const describe = (map) =>
  Object.entries(map)
    .map(([key, def]) => `${key} (${def.label})`)
    .join(", ");

const SYSTEM_PROMPT = `You design printed QR business cards (85.6 x 54 mm) for KIK QRcards.
Turn the customer's description into one card design.

Rules:
- colors: 2 or 3 background gradient stops as 6-digit hex codes, darkest first unless the card is light.
- angle: gradient angle in degrees (0-360).
- text: main text colour as hex. It must have strong contrast with every background stop, because the card is printed.
- accent: a hex colour for bars, bands and icons that suits the palette.
- font, layout, pattern, finish: pick one key from each list below.
- title: 2-4 word name for the design. summary: one short sentence explaining the choice.

Fonts: ${describe(CARD_FONTS)}
Layouts: ${describe(CARD_LAYOUTS)}
Patterns: ${describe(CARD_PATTERNS)}
Finishes: ${describe(CARD_FINISHES)}

Prefer restrained, professional results unless the customer asks for something playful.`;

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) {
    // Short timeout: Netlify functions stop after ~10s, and we have a free fallback.
    client = new Anthropic({ timeout: 8000, maxRetries: 0 });
  }
  return client;
}

async function designWithClaude(prompt, variant) {
  const anthropic = getClient();
  if (!anthropic) return null;

  const userText = variant
    ? `${prompt}\n\n(Variation #${variant}: give a clearly different take from the obvious one.)`
    : prompt;

  const response = await anthropic.messages.parse({
    model: process.env.ANTHROPIC_MODEL || "claude-opus-5-5",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userText }],
    output_config: {
      effort: "low",
      format: zodOutputFormat(DesignSchema),
    },
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) return null;

  const out = response.parsed_output;
  const design = normalizeDesign(out);
  if (!design) return null;

  return {
    design,
    title: out.title || "AI design",
    summary: out.summary || designSummary(design),
    source: "claude",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await requireUser(req, res);
  if (!session) return;

  const prompt = String(req.body?.prompt || "").trim().slice(0, MAX_PROMPT);
  const variant = Math.max(0, Math.min(99, parseInt(req.body?.variant, 10) || 0));

  if (prompt.length < 3) {
    return res.status(400).json({ error: "Describe the card you want in a few words." });
  }

  if (rateLimited(session.user.email)) {
    return res.status(429).json({ error: "Too many AI designs this hour. Please try again later." });
  }

  try {
    const result = await designWithClaude(prompt, variant);
    if (result) return res.status(200).json(result);
  } catch (err) {
    // Log and fall through to the free generator.
    console.error("Claude design error:", err?.status || "", err?.message || err);
  }

  return res.status(200).json(generateDesignFromPrompt(prompt, variant));
}
