// Owner contact details for order / plan notifications.
// Override with env vars on the host; the defaults are the owner's own contacts.

// WhatsApp number in international format, digits only (Bangladesh: 880 + number without the leading 0).
export const OWNER_WHATSAPP = (process.env.OWNER_WHATSAPP || "8801923089370").replace(/\D/g, "");

// Inbox that receives every new order and plan request.
export const OWNER_EMAIL = process.env.ORDER_NOTIFY_EMAIL || "kakon.aiubcse@gmail.com";

// Public site origin used in links inside notifications.
export function siteOrigin(req) {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  const host = req?.headers?.["x-forwarded-host"] || req?.headers?.host;
  if (!host) return "";
  const proto = req.headers["x-forwarded-proto"] || (/^localhost|^127\./.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}

// wa.me link that opens WhatsApp with `text` pre-filled to the owner.
export function ownerWhatsAppLink(text) {
  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(text)}`;
}
