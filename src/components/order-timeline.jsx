import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES, ORDER_STEPS, normalizeOrderStatus, stepIndex } from "@/lib/orderStatus";

const fmt = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

// Step tracker: placed -> confirmed -> printing -> shipped -> delivered.
export function OrderProgress({ status, className }) {
  const current = stepIndex(status);
  const cancelled = normalizeOrderStatus(status) === "cancelled";

  if (cancelled) {
    return (
      <div className={cn("flex items-center gap-2 text-sm font-medium text-destructive", className)}>
        <X className="size-4" /> Order cancelled
      </div>
    );
  }

  return (
    <ol className={cn("grid grid-cols-5 gap-1", className)}>
      {ORDER_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="flex flex-col items-center gap-1.5 text-center">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-[10px] font-semibold",
                done ? "bg-primary text-primary-foreground" : "bg-black/[0.07] text-muted-foreground",
                i === current && "ring-4 ring-primary/20",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("text-[10px] sm:text-xs", done ? "text-foreground" : "text-muted-foreground")}>
              {ORDER_STATUSES[step].label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// Every recorded change, newest first.
export function OrderHistory({ history = [], className }) {
  const items = [...history].sort((a, b) => new Date(b.at) - new Date(a.at));
  if (!items.length) return null;
  return (
    <ul className={cn("space-y-3 border-l border-black/[0.08] pl-4", className)}>
      {items.map((h, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[1.3rem] top-1.5 size-2 rounded-full bg-primary" />
          <p className="text-sm font-medium text-foreground">
            {ORDER_STATUSES[normalizeOrderStatus(h.status)].label}
            {h.paymentStatus === "paid" && <span className="ml-2 text-xs text-success">· payment received</span>}
          </p>
          <p className="text-xs text-muted-foreground">
            {fmt(h.at)}
            {h.note ? ` · ${h.note}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
