import { ObjectId } from "mongodb";
import clientPromise from "/lib/mongodb/config";
import { requireAdmin } from "/lib/adminAuth";

// GET:   list payments, optional ?status=
// PATCH: { id, action: "approve" | "reject", trxID?, note? } for manual (WhatsApp / bKash
//        personal) plan requests. Approving marks the payment completed and activates the plan.
export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const client = await clientPromise;
  const db = client.db("kikqrcard");
  const payments = db.collection("payments");

  if (req.method === "GET") {
    const { status = "" } = req.query;
    const filter = status ? { status } : {};
    try {
      const list = await payments
        .find(filter, { projection: { executeResponse: 0, createResponse: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
      return res.status(200).json({ payments: list });
    } catch (err) {
      console.error("Admin payments error:", err);
      return res.status(500).json({ error: "Failed to fetch payments" });
    }
  }

  if (req.method === "PATCH") {
    const { id, action } = req.body || {};
    if (!id || !ObjectId.isValid(id) || !["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "Valid id and action (approve | reject) are required" });
    }

    const payment = await payments.findOne({ _id: new ObjectId(id) });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status !== "pending") {
      return res.status(409).json({ error: `Payment is already ${payment.status}` });
    }

    const now = new Date();
    const trxID = String(req.body.trxID || "").trim().slice(0, 60);
    const note = String(req.body.note || "").trim().slice(0, 200);

    await payments.updateOne(
      { _id: payment._id, status: "pending" },
      {
        $set: {
          status: action === "approve" ? "completed" : "cancelled",
          trxID: trxID || payment.trxID || "",
          adminNote: note,
          reviewedBy: session.user.email,
          updatedAt: now,
        },
      },
    );

    if (action === "approve") {
      await db.collection("users").updateOne(
        { email: payment.email },
        { $set: { plan: payment.planId, planActivatedAt: now } },
      );
    }

    return res.status(200).json({ message: action === "approve" ? "Plan activated" : "Request rejected" });
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ error: "Method not allowed" });
}
