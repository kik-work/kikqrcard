import { ObjectId } from "mongodb";
import clientPromise from "/lib/mongodb/config";
import { requireUser } from "@/../lib/userAuth";
import { getPlan, calculateOrderPrice } from "@/../lib/bkash/plans";
import { notifyOwner, orderRows, orderText } from "@/../lib/notify";
import { ownerWhatsAppLink, siteOrigin } from "@/../lib/owner";
import { normalizeDesign } from "@/lib/cardDesign";
import { COUNTED_STATUSES } from "@/lib/orderStatus";

const clean = (v, max) => String(v ?? "").trim().slice(0, max);

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await requireUser(req, res);
  if (!session) return;
  const email = session.user.email;

  const { cardId, insideDhaka } = req.body;
  const name = clean(req.body.name, 80);
  const phone = clean(req.body.phone, 20);
  const address = clean(req.body.address, 200);
  const city = clean(req.body.city, 60);
  const note = clean(req.body.note, 300);

  if (!name || !phone || !address || !city) {
    return res.status(400).json({ error: "Missing delivery details" });
  }
  if (!/^\+?\d[\d\s-]{6,18}$/.test(phone)) {
    return res.status(400).json({ error: "Enter a valid phone number" });
  }
  if (!cardId || !ObjectId.isValid(cardId)) {
    return res.status(400).json({ error: "Choose which saved card to print" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("kikqrcard");
    const orders = db.collection("orders");
    const users = db.collection("users");

    // Only a saved card has a permanent QR link, so only saved cards can be printed.
    const card = await db.collection("myCard").findOne({ _id: new ObjectId(cardId), email });
    if (!card) {
      return res.status(404).json({ error: "Card not found. Save the card first, then order it." });
    }

    const priorOrderCount = await orders.countDocuments({
      email,
      status: { $in: COUNTED_STATUSES },
    });
    const isFirstOrder = priorOrderCount === 0;

    if (!isFirstOrder) {
      const user = await users.findOne({ email });
      const plan = getPlan(user?.plan);
      if (!plan) {
        return res.status(403).json({
          error: "You must purchase a plan before ordering additional cards.",
        });
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const ordersThisMonth = await orders.countDocuments({
        email,
        status: { $in: COUNTED_STATUSES },
        createdAt: { $gte: startOfMonth },
      });

      if (ordersThisMonth >= plan.cardOrderQuota) {
        return res.status(403).json({
          error: `You have reached your monthly order limit of ${plan.cardOrderQuota} cards for the ${plan.name} plan.`,
        });
      }
    }

    const origin = siteOrigin(req);
    const pricing = calculateOrderPrice({ insideDhaka: !!insideDhaka, isFirstOrder });
    const invoiceNumber = `KIK-ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date();

    const orderDoc = {
      invoiceNumber,
      email,
      name,
      phone,
      address,
      city,
      note,
      insideDhaka: !!insideDhaka,
      isFirstOrder,
      // Snapshot of what to print. The QR itself always points at the live card.
      card: {
        id: card._id.toString(),
        cardName: card.cardName,
        name: card.name,
        profession: card.profession,
        phone: card.phone,
        design: normalizeDesign(card.design),
        bgGrad: card.bgGrad || "",
        bgStyle: card.bgStyle || "",
        pattern: card.pattern || "none",
        publicUrl: origin ? `${origin}/c/${card._id}` : `/c/${card._id}`,
      },
      cardPrice: pricing.cardPrice,
      deliveryCharge: pricing.deliveryCharge,
      vat: pricing.vat,
      total: pricing.total,
      currency: "BDT",
      status: "placed",
      paymentStatus: pricing.total > 0 ? "unpaid" : "free",
      statusHistory: [{ status: "placed", at: now, note: "Order placed by customer" }],
      createdAt: now,
      updatedAt: now,
    };

    const result = await orders.insertOne(orderDoc);

    // The order is already saved; notification problems are recorded, not fatal.
    const adminUrl = origin ? `${origin}/admin/orders` : "";
    const notifications = await notifyOwner({
      subject: `New card order ${invoiceNumber} - ${name}`,
      rows: orderRows(orderDoc),
      text: orderText(orderDoc, adminUrl),
      replyTo: email,
    });
    await orders.updateOne({ _id: result.insertedId }, { $set: { notifications } });

    return res.status(200).json({
      orderId: result.insertedId,
      invoiceNumber,
      pricing,
      // Lets the customer also send the order to the owner on WhatsApp in one tap.
      whatsappUrl: ownerWhatsAppLink(orderText(orderDoc)),
    });
  } catch (error) {
    console.error("Order create error:", error.message);
    return res.status(500).json({ error: "Failed to create order" });
  }
};

export default handler;
