import clientPromise from "/lib/mongodb/config";
import { requireUser } from "@/../lib/userAuth";

// GET: the signed-in user's own plan payments, newest first.
// The email always comes from the session, never from the query string.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await requireUser(req, res);
  if (!session) return;

  try {
    const client = await clientPromise;
    const payments = await client
      .db("kikqrcard")
      .collection("payments")
      .find(
        { email: session.user.email },
        { projection: { executeResponse: 0, createResponse: 0, notifications: 0 } },
      )
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({ payments });
  } catch (err) {
    console.error("Fetch payment history error:", err);
    return res.status(500).json({ error: "Failed to fetch payment history" });
  }
}
