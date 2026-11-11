// Physical card order lifecycle, shared by the user Orders page, the admin
// Orders page and the order APIs.
//
//   placed -> confirmed -> printing -> shipped -> delivered
//   (any step before delivered) -> cancelled
//
// "initiated" / "completed" are legacy statuses from the old bKash order flow.

export const ORDER_STEPS = ["placed", "confirmed", "printing", "shipped", "delivered"];

export const ORDER_STATUSES = {
  placed: { label: "Placed", description: "We received your order and will contact you to confirm it." },
  confirmed: { label: "Confirmed", description: "Order and payment confirmed by KIK QRcards." },
  printing: { label: "Printing", description: "Your card is being printed." },
  shipped: { label: "Shipped", description: "Your card is on the way." },
  delivered: { label: "Delivered", description: "Delivered. Enjoy your smart card!" },
  cancelled: { label: "Cancelled", description: "This order was cancelled." },
};

export const ADMIN_STATUS_OPTIONS = [...ORDER_STEPS, "cancelled"];

export const PAYMENT_STATUSES = {
  free: "Free",
  unpaid: "Payment due",
  paid: "Paid",
};

// Orders that count toward the free first order and the monthly quota.
export const COUNTED_STATUSES = [...ORDER_STEPS, "initiated", "completed"];

export function normalizeOrderStatus(status) {
  if (status === "completed") return "delivered";
  if (status === "initiated") return "placed";
  return ORDER_STATUSES[status] ? status : "placed";
}

export function statusLabel(status) {
  return ORDER_STATUSES[normalizeOrderStatus(status)].label;
}

// Index in ORDER_STEPS, or -1 for cancelled.
export function stepIndex(status) {
  const s = normalizeOrderStatus(status);
  return s === "cancelled" ? -1 : ORDER_STEPS.indexOf(s);
}
