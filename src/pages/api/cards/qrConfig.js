import { ObjectId } from "mongodb";
import clientPromise from "../../../../lib/mongodb/config";
import { requireUser } from "../../../../lib/userAuth";
import { cleanQrLink, validateQrLinks } from "@/lib/qrConfigTypes";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await requireUser(req, res);
  if (!session) return;
  const email = session.user.email;

  const { id, links } = req.body;

  if (!id || !Array.isArray(links)) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid card id" });
  }

  const { index, error } = validateQrLinks(links);
  if (error) {
    return res.status(400).json({ error, index });
  }

  try {
    const client = await clientPromise;
    const db = client.db("kikqrcard");
    const cards = db.collection("myCard");

    const result = await cards.updateOne(
      { _id: new ObjectId(id), email },
      { $set: { qrConfig: { links: links.map(cleanQrLink) }, updatedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    return res.status(200).json({ message: "QR links updated successfully" });
  } catch (err) {
    console.error("QR config update error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
