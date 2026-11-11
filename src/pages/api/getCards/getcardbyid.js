import clientPromise from "../../../../lib/mongodb/config";
import { findLiveCard } from "../../../../lib/publicCard";

// Public: returns the live data behind a card's QR link.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const card = await findLiveCard(client.db("kikqrcard"), req.query.id);

    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ card });
  } catch (err) {
    console.error("Fetch card by id error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
