import { ObjectId } from "mongodb";
import clientPromise from "../../../../lib/mongodb/config";
import { requireUser } from "../../../../lib/userAuth";
import { parseCardBody } from "../../../../lib/cardFields";

// PUT: edit a saved card in place. The card keeps its _id, so its QR link
// (/c/<id>) stays the same and immediately shows the new details.
export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await requireUser(req, res);
  if (!session) return;
  const email = session.user.email;

  const { id } = req.body;
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid card id" });
  }

  const { card, error } = parseCardBody(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const client = await clientPromise;
    const cards = client.db("kikqrcard").collection("myCard");

    const result = await cards.updateOne(
      { _id: new ObjectId(id), email },
      { $set: { ...card, updatedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    return res.status(200).json({ message: "Card updated successfully" });
  } catch (err) {
    console.error("Card update error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
