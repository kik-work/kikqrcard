import clientPromise from "../../../../lib/mongodb/config";
import { requireUser } from "../../../../lib/userAuth";
import { getPlan, FREE_TIER } from "../../../../lib/bkash/plans";
import { parseCardBody, duplicateQuery } from "../../../../lib/cardFields";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await requireUser(req, res);
  if (!session) return;
  const email = session.user.email;

  const { card, error } = parseCardBody(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const client = await clientPromise;
    const db = client.db("kikqrcard");
    const cards = db.collection("myCard");
    const users = db.collection("users");

    if (await cards.findOne(duplicateQuery(email, card))) {
      return res.status(409).json({ error: "Card already exists" });
    }

    const user = await users.findOne({ email });
    const plan = getPlan(user?.plan);
    const virtualCardLimit = plan ? plan.virtualCardLimit : FREE_TIER.virtualCardLimit;

    const currentCardCount = await cards.countDocuments({ email });
    if (currentCardCount >= virtualCardLimit) {
      return res.status(403).json({
        error: `You have reached your virtual card limit of ${virtualCardLimit}. Upgrade your plan to create more cards.`,
      });
    }

    const now = new Date();
    const result = await cards.insertOne({
      email,
      ...card,
      savedCard: true,
      createdAt: now,
      updatedAt: now,
    });

    return res.status(201).json({
      message: "Card saved successfully",
      id: result.insertedId.toString(),
    });
  } catch (err) {
    console.error("Card save error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
