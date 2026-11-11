import { ObjectId } from "mongodb";
import clientPromise from "/lib/mongodb/config";
import { requireAdmin } from "/lib/adminAuth";
import { ADMIN_STATUS_OPTIONS, PAYMENT_STATUSES } from "@/lib/orderStatus";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET:   list orders. ?status=<status> ?q=<invoice | phone | name | email>
// PATCH: { id, status?, paymentStatus?, trackingNumber?, note? } — every change is
//        appended to the order's statusHistory, which the customer sees as a timeline.
export default async function handler(req, res) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const client = await clientPromise;
  const orders = client.db("kikqrcard").collection("orders");

  if (req.method === "GET") {
    const status = String(req.query.status || "");
    const q = String(req.query.q || "").trim().slice(0, 80);
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ invoiceNumber: rx }, { phone: rx }, { name: rx }, { email: rx }, { city: rx }];
    }

    try {
      const [list, counts] = await Promise.all([
        orders.find(filter).sort({ createdAt: -1 }).limit(300).toArray(),
        orders.aggregate([{ $group: { _id: "$status", n: { $sum: 1 }, total: { $sum: "$total" } } }]).toArray(),
      ]);
      return res.status(200).json({ orders: list, counts });
    } catch (err) {
      console.error("Admin orders error:", err);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
  }

  if (req.method === "PATCH") {
    const { id } = req.body || {};
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Valid order id is required" });
    }

    const status = req.body.status ? String(req.body.status) : null;
    const paymentStatus = req.body.paymentStatus ? String(req.body.paymentStatus) : null;
    if (status && !ADMIN_STATUS_OPTIONS.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    if (paymentStatus && !PAYMENT_STATUSES[paymentStatus]) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    const order = await orders.findOne({ _id: new ObjectId(id) });
    if (!order) return res.status(404).json({ error: "Order not found" });

    const now = new Date();
    const note = String(req.body.note || "").trim().slice(0, 300);
    const set = { updatedAt: now };
    if (status) set.status = status;
    if (paymentStatus) set.paymentStatus = paymentStatus;
    if (typeof req.body.trackingNumber === "string") {
      set.trackingNumber = req.body.trackingNumber.trim().slice(0, 80);
    }

    const changed = (status && status !== order.status) || (paymentStatus && paymentStatus !== order.paymentStatus);
    const update = { $set: set };
    if (changed || note) {
      update.$push = {
        statusHistory: {
          status: status || order.status,
          ...(paymentStatus ? { paymentStatus } : {}),
          at: now,
          note,
          by: "admin",
        },
      };
    }

    await orders.updateOne({ _id: order._id }, update);
    return res.status(200).json({ message: "Order updated" });
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ error: "Method not allowed" });
}
