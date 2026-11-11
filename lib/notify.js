// Owner notifications for new orders and plan requests.
//
// Two channels, both free:
//   1. Email via Gmail SMTP (lib/mailer.js) to OWNER_EMAIL.
//   2. WhatsApp via CallMeBot (https://www.callmebot.com/blog/free-api-whatsapp-messages/)
//      to OWNER_WHATSAPP. One-time setup: from the owner's WhatsApp, send
//      "I allow callmebot to send me messages" to the CallMeBot number shown on
//      that page, then put the API key it replies with in CALLMEBOT_API_KEY.
//
// Channels that are not configured are skipped. Results are returned so the
// caller can store them; a failed notification never loses an order, because
// every order is saved in the database and listed on the admin Orders page.
import axios from "axios";
import { sendOwnerEmail } from "./mailer";
import { OWNER_WHATSAPP } from "./owner";

export async function sendOwnerWhatsApp(text) {
  const apikey = process.env.CALLMEBOT_API_KEY;
  if (!apikey) return { sent: false, skipped: "CALLMEBOT_API_KEY not set" };

  await axios.get("https://api.callmebot.com/whatsapp.php", {
    params: { phone: OWNER_WHATSAPP, text, apikey },
    timeout: 8000,
  });
  return { sent: true };
}

// rows: [label, value][] shown in the email; text: plain message for WhatsApp.
export async function notifyOwner({ subject, rows, text, replyTo }) {
  const [email, whatsapp] = await Promise.allSettled([
    sendOwnerEmail({ subject, rows, replyTo }),
    sendOwnerWhatsApp(text),
  ]);

  const result = (r) =>
    r.status === "fulfilled"
      ? { sent: r.value?.sent !== false, ...(r.value?.skipped ? { skipped: r.value.skipped } : {}) }
      : { sent: false, error: String(r.reason?.message || r.reason).slice(0, 200) };

  const out = { email: result(email), whatsapp: result(whatsapp), at: new Date() };
  if (!out.email.sent) console.error("Owner email not sent:", out.email);
  if (!out.whatsapp.sent && !out.whatsapp.skipped) console.error("Owner WhatsApp not sent:", out.whatsapp);
  return out;
}

const bdt = (n) => `${Number(n || 0).toLocaleString("en-US")} BDT`;

export function orderRows(order) {
  return [
    ["Invoice", order.invoiceNumber],
    ["Customer account", order.email],
    ["Card", order.card ? `${order.card.name} - ${order.card.profession}` : "-"],
    ["Card link (QR)", order.card?.publicUrl || "-"],
    ["Quantity", order.quantity || 1],
    ["Recipient name", order.name],
    ["Phone", order.phone],
    ["Address", order.address],
    ["City", order.city],
    ["Delivery zone", order.insideDhaka ? "Inside Dhaka" : "Outside Dhaka"],
    ["Order type", order.isFirstOrder ? "First order (free)" : "Paid order"],
    ["Card price", bdt(order.cardPrice)],
    ["Delivery charge", bdt(order.deliveryCharge)],
    ["VAT", bdt(order.vat)],
    ["Total due", bdt(order.total)],
    ["Placed at", new Date(order.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })],
  ];
}

export function orderText(order, adminUrl) {
  return [
    `New KIK QR card order ${order.invoiceNumber}`,
    `Card: ${order.card ? `${order.card.name} (${order.card.profession})` : "-"}`,
    `Qty: ${order.quantity || 1}`,
    `Customer: ${order.name}, ${order.phone}`,
    `Address: ${order.address}, ${order.city} (${order.insideDhaka ? "inside" : "outside"} Dhaka)`,
    `Total: ${bdt(order.total)}${order.isFirstOrder ? " (first order free)" : ""}`,
    order.card?.publicUrl ? `Card link: ${order.card.publicUrl}` : "",
    adminUrl ? `Manage: ${adminUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
