import clientPromise from "/lib/mongodb/config";
import { requireUser } from "@/../lib/userAuth";
import { getPlan } from "@/../lib/bkash/plans";
import { notifyOwner } from "@/../lib/notify";
import { ownerWhatsAppLink, siteOrigin } from "@/../lib/owner";

// POST { planId }: request a plan without online payment (no merchant account yet).
//
// Saves a "pending" manual payment, alerts the owner on email + WhatsApp and
// returns a wa.me link so the customer can message the owner to pay by
// bKash / Nagad. The owner then approves it on the admin Payments page, which
// activates the plan.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await requireUser(req, res);
  if (!session) return;
  const email = session.user.email;

  const planId = String(req.body?.planId || "");
  const plan = getPlan(planId);
  if (!plan) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  try {
    const client = await clientPromise;
    const payments = client.db("kikqrcard").collection("payments");

    const pendingText = (p) =>
      [
        `KIK QRcards plan request ${p.invoiceNumber}`,
        `Plan: ${plan.name} (${plan.amount} BDT / ${plan.billingCycle})`,
        `Account: ${email}`,
        "I would like to pay and activate this plan.",
      ].join("\n");

    // One open request per plan: return the existing one instead of a duplicate.
    const existing = await payments.findOne({ email, planId, method: "manual", status: "pending" });
    if (existing) {
      return res.status(200).json({
        invoiceNumber: existing.invoiceNumber,
        alreadyPending: true,
        whatsappUrl: ownerWhatsAppLink(pendingText(existing)),
      });
    }

    const now = new Date();
    const doc = {
      invoiceNumber: `KIK-PLAN-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      email,
      planId,
      planName: plan.name,
      amount: plan.amount,
      currency: "BDT",
      method: "manual",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    const result = await payments.insertOne(doc);

    const origin = siteOrigin(req);
    const notifications = await notifyOwner({
      subject: `Plan request ${doc.invoiceNumber} - ${plan.name}`,
      rows: [
        ["Invoice", doc.invoiceNumber],
        ["Account", email],
        ["Plan", `${plan.name} (${plan.billingCycle})`],
        ["Amount", `${plan.amount} BDT`],
        ["Requested at", now.toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })],
        ["Approve at", origin ? `${origin}/admin/payments` : "/admin/payments"],
      ],
      text: `${pendingText(doc)}${origin ? `\nApprove: ${origin}/admin/payments` : ""}`,
      replyTo: email,
    });
    await payments.updateOne({ _id: result.insertedId }, { $set: { notifications } });

    return res.status(200).json({
      invoiceNumber: doc.invoiceNumber,
      whatsappUrl: ownerWhatsAppLink(pendingText(doc)),
    });
  } catch (err) {
    console.error("Plan request error:", err);
    return res.status(500).json({ error: "Failed to request plan" });
  }
}
