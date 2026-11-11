// Shared parsing for card create/update/copy API routes.
import { ObjectId } from "mongodb";
import clientPromise from "./mongodb/config";
import { requireUser } from "./userAuth";
import { normalizeDesign } from "../src/lib/cardDesign";

const str = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Reads card fields from a request body.
// A card needs a v2 `design` object, or the legacy `bgGrad` + `bgStyle` class strings.
// Returns { card } or { error }.
export function parseCardBody(body = {}) {
  const card = {
    cardName: str(body.cardName, 80).toLowerCase(),
    name: str(body.name, 60),
    profession: str(body.profession, 60),
    phone: str(body.phone, 30),
    quote: str(body.quote, 120),
    contactEmail: str(body.contactEmail, 120),
    website: str(body.website, 200),
    address: str(body.address, 120),
    bgGrad: str(body.bgGrad, 60),
    bgStyle: str(body.bgStyle, 120),
    pattern: str(body.pattern, 30) || "none",
    design: normalizeDesign(body.design),
  };

  if (!card.cardName || !card.name || !card.profession || !card.phone || !card.quote) {
    return { error: "Missing required card fields" };
  }
  if (!card.design && (!card.bgGrad || !card.bgStyle)) {
    return { error: "Missing card design" };
  }

  card.designKey = card.design
    ? JSON.stringify(card.design)
    : `${card.bgGrad}|${card.bgStyle}|${card.pattern}`;

  return { card };
}

// Same name + same look counts as a duplicate. Older rows have no designKey,
// so legacy cards keep matching on their class strings.
export function duplicateQuery(email, card) {
  return card.design
    ? { email, cardName: card.cardName, designKey: card.designKey }
    : { email, cardName: card.cardName, bgGrad: card.bgGrad, bgStyle: card.bgStyle };
}

export function cleanSourceId(value) {
  return typeof value === "string" && ObjectId.isValid(value) ? value : null;
}

// POST handler for the "copy" collections (loved / favourite / highlighted / public).
// `flag` is the boolean field the client sends for that collection, if any.
export function createCardCopyHandler({ collection, flag }) {
  return async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const session = await requireUser(req, res);
    if (!session) return;
    const email = session.user.email;

    const { card, error } = parseCardBody(req.body);
    if (error) return res.status(400).json({ error });

    try {
      const client = await clientPromise;
      const cards = client.db("kikqrcard").collection(collection);

      if (await cards.findOne(duplicateQuery(email, card))) {
        return res.status(409).json({ error: "Card already exists" });
      }

      const doc = {
        email,
        ...card,
        // Points at the live card in myCard so a copy's QR shows current data.
        sourceCardId: cleanSourceId(req.body.sourceCardId),
        createdAt: new Date(),
      };
      if (flag) doc[flag] = req.body[flag] !== false;

      const result = await cards.insertOne(doc);
      return res.status(201).json({ message: "Card saved successfully", id: result.insertedId.toString() });
    } catch (err) {
      console.error(`Card copy (${collection}) error:`, err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
}
