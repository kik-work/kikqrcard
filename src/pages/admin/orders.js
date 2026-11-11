import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, MessageCircle, Search } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin-shell";
import BusinessCard from "@/components/business-card";
import { OrderHistory, OrderProgress } from "@/components/order-timeline";
import { StatusPill } from "@/components/dashboard-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRequireAdmin } from "@/lib/useRequireAdmin";
import { ADMIN_STATUS_OPTIONS, ORDER_STATUSES, PAYMENT_STATUSES, normalizeOrderStatus } from "@/lib/orderStatus";

const TABS = ["all", ...ADMIN_STATUS_OPTIONS];
const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

// Bangladeshi local number (01XXXXXXXXX) -> wa.me format (8801XXXXXXXXX).
const waNumber = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.startsWith("0") ? `88${digits}` : digits;
};

function OrderDetail({ order, onSaved }) {
  const [status, setStatus] = useState(normalizeOrderStatus(order.status));
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus || (order.total > 0 ? "unpaid" : "free"));
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await axios.patch("/api/admin/orders", { id: order._id, status, paymentStatus, trackingNumber, note });
      toast.success("Order updated");
      setNote("");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const customerMessage = `Hello ${order.name}, your KIK QR card order ${order.invoiceNumber} is now: ${ORDER_STATUSES[status].label}.${
    trackingNumber ? ` Tracking: ${trackingNumber}.` : ""
  }`;

  return (
    <div className="space-y-6 overflow-y-auto px-4 pb-8">
      <OrderProgress status={order.status} />

      {order.card ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Card to print</p>
          <BusinessCard
            name={order.card.name}
            profession={order.card.profession}
            phone={order.card.phone}
            design={order.card.design}
            bgGrad={order.card.bgGrad}
            bgStyle={order.card.bgStyle}
            pattern={order.card.pattern}
            cardId={order.card.id}
          />
          <a
            href={`/c/${order.card.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Open live card page <ExternalLink className="size-3" />
          </a>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Older order: no card was attached.</p>
      )}

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        {[
          ["Invoice", order.invoiceNumber],
          ["Account", order.email],
          ["Recipient", order.name],
          ["Phone", order.phone],
          ["Address", `${order.address}, ${order.city}`],
          ["Zone", order.insideDhaka ? "Inside Dhaka" : "Outside Dhaka"],
          ["Total", `৳${order.total}${order.isFirstOrder ? " (first order free)" : ""}`],
          ["Placed", fmtDate(order.createdAt)],
          ["Note", order.note || "—"],
          [
            "Owner alerts",
            order.notifications
              ? `Email ${order.notifications.email?.sent ? "sent" : "not sent"} · WhatsApp ${
                  order.notifications.whatsapp?.sent ? "sent" : order.notifications.whatsapp?.skipped ? "off" : "not sent"
                }`
              : "—",
          ],
        ].map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="break-words font-medium text-foreground">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-3 rounded-2xl bg-black/[0.03] p-4">
        <p className="text-sm font-semibold text-foreground">Update order</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs text-muted-foreground">
            Status
            <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
              {ADMIN_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUSES[s].label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            Payment
            <select className={selectClass} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              {Object.entries(PAYMENT_STATUSES).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-1 text-xs text-muted-foreground">
          Tracking number / courier
          <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. Pathao 12345" />
        </label>
        <label className="block space-y-1 text-xs text-muted-foreground">
          Note for the customer timeline (optional)
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Paid via bKash, TrxID 8N7..." />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />} Save changes
          </Button>
          <a
            href={`https://wa.me/${waNumber(order.phone)}?text=${encodeURIComponent(customerMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-accent"
          >
            <MessageCircle className="size-4" /> Message customer
          </a>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">History</p>
        <OrderHistory history={order.statusHistory} />
      </div>
    </div>
  );
}

function AdminOrders() {
  const { ready } = useRequireAdmin();
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/orders", { params: { status: tab, q: query } });
      setOrders(data.orders || []);
      setCounts(data.counts || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [tab, query]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(fetchOrders, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [ready, fetchOrders, query]);

  const countFor = useMemo(() => {
    const map = {};
    for (const c of counts) map[normalizeOrderStatus(c._id)] = (map[normalizeOrderStatus(c._id)] || 0) + c.n;
    return map;
  }, [counts]);
  const totalOrders = counts.reduce((s, c) => s + c.n, 0);
  const selected = orders.find((o) => o._id === selectedId) || null;

  return (
    <AdminLayout title="Orders" ready={ready}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-[2.125rem]">
            Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalOrders} order{totalOrders === 1 ? "" : "s"} · {countFor.placed || 0} waiting for confirmation
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Invoice, phone, name, email"
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="flex h-auto flex-wrap">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t === "all" ? "All" : ORDER_STATUSES[t].label}
              {t !== "all" && countFor[t] ? <span className="ml-1 text-muted-foreground">({countFor[t]})</span> : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-4 overflow-x-auto rounded-[1.25rem] bg-card shadow-card [&_tbody_tr]:transition-colors [&_td]:px-4 [&_td]:py-3 [&_th]:h-11 [&_th]:px-4 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground [&_thead]:bg-black/[0.025]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Card</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  <Loader2 className="mx-auto size-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o._id} className="cursor-pointer hover:bg-black/[0.02]" onClick={() => setSelectedId(o._id)}>
                  <TableCell className="font-mono text-xs">{o.invoiceNumber}</TableCell>
                  <TableCell>
                    <p className="font-medium">{o.name}</p>
                    <p className="text-xs text-muted-foreground">{o.phone} · {o.city}</p>
                  </TableCell>
                  <TableCell className="text-sm">{o.card ? o.card.name : "—"}</TableCell>
                  <TableCell>৳{Number(o.total).toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{PAYMENT_STATUSES[o.paymentStatus] || (o.total > 0 ? "Payment due" : "Free")}</TableCell>
                  <TableCell>
                    <StatusPill status={normalizeOrderStatus(o.status)} />
                  </TableCell>
                  <TableCell className="text-xs">{fmtDate(o.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Order {selected?.invoiceNumber}</SheetTitle>
          </SheetHeader>
          {selected && <OrderDetail key={selected._id + (selected.updatedAt || "")} order={selected} onSaved={fetchOrders} />}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}

export default AdminOrders;
