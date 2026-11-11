import clientPromise from "/lib/mongodb/config";
import { requireUser } from "@/../lib/userAuth";

// GET: the signed-in user's own physical card orders, newest first.
// The email always comes from the session, never from the query string.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await requireUser(req, res);
  if (!session) return;

  try {
    const client = await clientPromise;
    const orders = await client
      .db("kikqrcard")
      .collection("orders")
      .find({ email: session.user.email }, { projection: { notifications: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({ orders });
  } catch (err) {
    console.error("Fetch order history error:", err);
    return res.status(500).json({ error: "Failed to fetch order history" });
  }
}
