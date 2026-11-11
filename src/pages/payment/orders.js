import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  ChevronDown,
  CreditCard,
  History,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  Receipt as ReceiptIcon,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { DashboardLayout } from "@/components/dashboard-shell";
import {
  Banner,
  EmptyState,
  Field,
  FullscreenStatus,
  IconTile,
  ListSkeleton,
  PageHeader,
  Segmented,
  SectionHeading,
  StatusPill,
  Surface,
} from "@/components/dashboard-ui";
import BusinessCard from "@/components/business-card";
import { OrderHistory, OrderProgress } from "@/components/order-timeline";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  CARD_PRICE,
  VAT_RATE,
  DELIVERY_CHARGE_INSIDE_DHAKA as DELIVERY_INSIDE,
  DELIVERY_CHARGE_OUTSIDE_DHAKA as DELIVERY_OUTSIDE,
} from "@/../lib/bkash/plans";
import { COUNTED_STATUSES, ORDER_STATUSES, PAYMENT_STATUSES, normalizeOrderStatus } from "@/lib/orderStatus";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "—";

function OrderRow({ order }) {
  const [open, setOpen] = useState(false);
  const status = normalizeOrderStatus(order.status);
  return (
    <li className="px-4 py-3.5 sm:px-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left sm:gap-4"
      >
        <IconTile icon={Package} tone="muted" size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {order.card ? `${order.card.name} card` : `${order.address}, ${order.city}`}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {order.invoiceNumber} · {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-4">
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {order.total} {order.currency}
          </span>
          <StatusPill status={status} />
        </div>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="mt-4 space-y-5 rounded-2xl bg-black/[0.03] p-4">
          <OrderProgress status={order.status} />
          <p className="text-sm text-muted-foreground">{ORDER_STATUSES[status].description}</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Deliver to</dt>
            <dd className="text-foreground">
              {order.name}, {order.address}, {order.city}
            </dd>
            <dt className="text-muted-foreground">Payment</dt>
            <dd className="text-foreground">
              {PAYMENT_STATUSES[order.paymentStatus] || (order.total > 0 ? "Payment due" : "Free")}
            </dd>
            {order.trackingNumber && (
              <>
                <dt className="text-muted-foreground">Tracking</dt>
                <dd className="text-foreground">{order.trackingNumber}</dd>
              </>
            )}
          </dl>
          <OrderHistory history={order.statusHistory} />
        </div>
      )}
    </li>
  );
}

const Order = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", note: "" });
  const [insideDhaka, setInsideDhaka] = useState(true);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isFirstOrder, setIsFirstOrder] = useState(true);
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [cardId, setCardId] = useState("");
  const [placed, setPlaced] = useState(null); // { invoiceNumber, whatsappUrl }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/authentication/login");
    }
  }, [status]);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const { data } = await axios.get("/api/payment/orders/history");
      const list = data.orders || [];
      setOrders(list);
      setIsFirstOrder(!list.some((o) => COUNTED_STATUSES.includes(o.status)));
    } catch (err) {
      console.error("Error fetching order history:", err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;
    fetchHistory();

    // Only saved cards can be printed: they have a permanent, live QR link.
    axios
      .get(`/api/getCards/getsavedcard?email=${encodeURIComponent(email)}`)
      .then(({ data }) => {
        const list = data.savedCards || [];
        setCards(list);
        const wanted = typeof router.query.card === "string" ? router.query.card : "";
        setCardId(list.some((c) => c._id === wanted) ? wanted : list[0]?._id || "");
      })
      .catch((err) => console.error("Error fetching cards:", err.message))
      .finally(() => setLoadingCards(false));
  }, [session, fetchHistory, router.query.card]);

  const vat = Math.round(CARD_PRICE * VAT_RATE * 100) / 100;
  const deliveryCharge = insideDhaka ? DELIVERY_INSIDE : DELIVERY_OUTSIDE;
  const total = isFirstOrder ? 0 : CARD_PRICE + deliveryCharge + vat;
  const formComplete = !!(cardId && form.name && form.phone && form.address && form.city);
  const selectedCard = cards.find((c) => c._id === cardId);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!cardId) {
      toast.error("Choose which card to print.");
      return;
    }
    if (!formComplete) {
      toast.error("Please fill in all delivery details.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/api/payment/orders/create", {
        ...form,
        cardId,
        insideDhaka,
      });

      toast.success(`Order placed! Invoice: ${data.invoiceNumber}`);
      setPlaced({ invoiceNumber: data.invoiceNumber, whatsappUrl: data.whatsappUrl });
      setForm({ name: "", phone: "", address: "", city: "", note: "" });
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <FullscreenStatus title="Loading…" />;
  }

  const submitLabel = loading ? (
    <>
      <Loader2 className="size-4 animate-spin" /> Placing order…
    </>
  ) : (
    "Place order"
  );

  const summaryRows = [
    { label: "Card price", value: isFirstOrder ? "Free" : `৳${CARD_PRICE}` },
    { label: "Delivery", value: isFirstOrder ? "Free" : `৳${deliveryCharge}` },
    { label: "VAT (3%)", value: isFirstOrder ? "Free" : `৳${vat}` },
  ];

  return (
    <DashboardLayout title="Orders" path="/payment/orders" width="max-w-5xl">
      <div className="space-y-8 sm:space-y-10">
        <PageHeader
          title="Order a physical card"
          description="A printed QR card, delivered to your door. Its QR always opens your latest details."
        />

        {placed && (
          <Banner tone="success" icon={Truck}>
            <p>
              Order <span className="font-semibold">{placed.invoiceNumber}</span> placed. KIK QRcards has been
              notified and will contact you to confirm it.
            </p>
            {placed.whatsappUrl && (
              <a
                href={placed.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#25d366] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1ebe5b]"
              >
                <MessageCircle className="size-4" /> Also send it on WhatsApp
              </a>
            )}
          </Banner>
        )}

        {!loadingCards && cards.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Save a card first"
            message="Create and save your card, then come back to order the printed version. Only saved cards get a permanent QR link."
            action={
              <Link href="/cards/createcard" className={buttonVariants({ size: "lg" })}>
                Create a card
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            {/* card + delivery form */}
            <Surface className="space-y-8 p-5 sm:p-7 lg:col-span-3">
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <IconTile icon={CreditCard} tone="indigo" />
                  <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">Card to print</h2>
                </div>
                {loadingCards ? (
                  <ListSkeleton rows={1} />
                ) : (
                  <>
                    <select
                      aria-label="Card to print"
                      value={cardId}
                      onChange={(e) => setCardId(e.target.value)}
                      className="h-10 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {cards.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} — {c.profession}
                        </option>
                      ))}
                    </select>
                    {selectedCard && (
                      <BusinessCard
                        name={selectedCard.name}
                        profession={selectedCard.profession}
                        phone={selectedCard.phone}
                        quote={selectedCard.quote}
                        email={selectedCard.contactEmail}
                        website={selectedCard.website}
                        design={selectedCard.design}
                        bgGrad={selectedCard.bgGrad}
                        bgStyle={selectedCard.bgStyle}
                        pattern={selectedCard.pattern}
                        cardId={selectedCard._id}
                      />
                    )}
                  </>
                )}
              </section>

              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <IconTile icon={MapPin} tone="blue" />
                  <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">Delivery details</h2>
                </div>

                {isFirstOrder && !loadingHistory && (
                  <Banner tone="success" icon={Truck}>
                    Your first card is free — no payment needed for this order.
                  </Banner>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name" htmlFor="name">
                      <Input
                        id="name"
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Recipient name"
                      />
                    </Field>
                    <Field label="Phone" htmlFor="phone">
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="01XXXXXXXXX"
                      />
                    </Field>
                  </div>
                  <Field label="Address" htmlFor="address">
                    <Input
                      id="address"
                      autoComplete="street-address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="House, road, area"
                    />
                  </Field>
                  <Field label="City" htmlFor="city">
                    <Input
                      id="city"
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="City"
                    />
                  </Field>
                  <Field label="Note (optional)" htmlFor="note">
                    <Input
                      id="note"
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      placeholder="Anything we should know"
                    />
                  </Field>
                  <Field label="Delivery location">
                    <Segmented
                      label="Delivery location"
                      value={insideDhaka}
                      onChange={setInsideDhaka}
                      options={[
                        { value: true, label: `Inside Dhaka · ৳${DELIVERY_INSIDE}` },
                        { value: false, label: `Outside Dhaka · ৳${DELIVERY_OUTSIDE}` },
                      ]}
                    />
                  </Field>

                  <Button type="submit" size="lg" disabled={loading} className="w-full lg:hidden">
                    {submitLabel}
                  </Button>
                </form>
              </section>
            </Surface>

            {/* price summary */}
            <div className="lg:col-span-2 lg:sticky lg:top-10 lg:self-start">
              <Surface className="p-5 sm:p-7">
                <div className="mb-5 flex items-center gap-3">
                  <IconTile icon={ReceiptIcon} tone="muted" />
                  <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">Order summary</h2>
                </div>

                <dl className="space-y-3 text-sm">
                  {summaryRows.map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <dt className="text-muted-foreground">{row.label}</dt>
                      <dd className="font-medium tabular-nums text-foreground">{row.value}</dd>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between border-t border-black/[0.07] pt-4">
                    <dt className="text-base font-semibold text-foreground">Total</dt>
                    <dd className="text-2xl font-semibold tabular-nums tracking-[-0.025em] text-foreground">
                      ৳{total}
                    </dd>
                  </div>
                </dl>

                <Button
                  type="button"
                  size="lg"
                  disabled={loading || !formComplete}
                  onClick={handleSubmit}
                  className="mt-6 hidden w-full lg:flex"
                >
                  {submitLabel}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {formComplete
                    ? "No online payment. We will contact you on WhatsApp or phone to confirm and collect payment (bKash / Nagad / cash on delivery)."
                    : "Choose a card and fill in delivery details to continue."}
                </p>
              </Surface>
            </div>
          </div>
        )}

        {/* history */}
        <section className="space-y-4">
          <SectionHeading title="Order history" description="Tap an order to see its tracking timeline." />
          {loadingHistory ? (
            <Surface>
              <ListSkeleton />
            </Surface>
          ) : orders.length === 0 ? (
            <EmptyState icon={History} title="No orders yet" message="All your order history will display here." />
          ) : (
            <Surface className="overflow-hidden">
              <ul className="divide-y divide-black/[0.06]">
                {orders.map((o) => (
                  <OrderRow key={o._id} order={o} />
                ))}
              </ul>
            </Surface>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Order;
