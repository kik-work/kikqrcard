import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Surfaces & layout                                                   */
/* ------------------------------------------------------------------ */

export function Surface({ className, ...props }) {
  return (
    <div
      className={cn("rounded-[1.25rem] bg-card shadow-card", className)}
      {...props}
    />
  );
}

export function PageHeader({ title, description, actions, backHref, className }) {
  const router = useRouter();
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {backHref && (
          <Button
            variant="secondary"
            size="icon"
            className="mt-1 shrink-0"
            onClick={() => router.push(backHref)}
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-[2.125rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-[0.9375rem] text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionHeading({ title, description, action, className }) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message, action, className }) {
  return (
    <Surface
      className={cn(
        "flex animate-page-in flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <IconTile icon={Icon} tone="muted" size="lg" />
      )}
      <div className="max-w-sm">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
      </div>
      {action}
    </Surface>
  );
}

export function FullscreenStatus({ icon: Icon = Loader2, spin = true, title, message }) {
  return (
    <div className="dashboard flex min-h-screen animate-page-in flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <span className="relative flex size-14 items-center justify-center rounded-2xl bg-card shadow-card">
        {spin && <span aria-hidden className="absolute inset-0 animate-ping-soft rounded-2xl bg-primary/15" />}
        <Icon className={cn("relative size-6 text-primary", spin && "animate-spin")} />
      </span>
      <div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const TILE_TONES = {
  indigo: "bg-ios-indigo text-white",
  blue: "bg-ios-blue text-white",
  green: "bg-ios-green text-white",
  orange: "bg-ios-orange text-white",
  pink: "bg-ios-pink text-white",
  teal: "bg-ios-teal text-white",
  muted: "bg-muted text-muted-foreground",
};

const TILE_SIZES = {
  sm: "size-8 rounded-[0.5rem] [&_svg]:size-4",
  md: "size-10 rounded-[0.65rem] [&_svg]:size-5",
  lg: "size-14 rounded-[1rem] [&_svg]:size-7",
};

// Squircle app-icon style tile, like Settings rows on iOS.
export function IconTile({ icon: Icon, tone = "indigo", size = "md", className }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center shadow-[inset_0_1px_0_rgb(255_255_255/0.28)]",
        TILE_TONES[tone],
        TILE_SIZES[size],
        tone === "muted" && "shadow-none",
        className,
      )}
    >
      <Icon aria-hidden="true" />
    </span>
  );
}

// Thin usage bar. Turns orange at 80% and red when full so limits are noticed before they bite.
export function Meter({ value, label, className }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-black/[0.07]", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-apple",
          pct >= 100 ? "bg-ios-red" : pct >= 80 ? "bg-ios-orange" : "bg-primary",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const STATUS_STYLES = {
  placed: { label: "Placed", icon: Clock, className: "bg-ios-blue/12 text-ios-blue" },
  pending: { label: "Awaiting payment", icon: Clock, className: "bg-ios-orange/15 text-warning" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, className: "bg-ios-blue/12 text-ios-blue" },
  printing: { label: "Printing", icon: Loader2, className: "bg-ios-orange/15 text-warning", spin: true },
  shipped: { label: "Shipped", icon: CheckCircle2, className: "bg-primary/12 text-primary" },
  delivered: { label: "Delivered", icon: CheckCircle2, className: "bg-ios-green/15 text-success" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-ios-green/15 text-success" },
  initiated: { label: "Processing", icon: Loader2, className: "bg-ios-orange/15 text-warning", spin: true },
  failed: { label: "Failed", icon: XCircle, className: "bg-ios-red/12 text-destructive" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-black/[0.06] text-muted-foreground" },
};

export function StatusPill({ status }) {
  const meta = STATUS_STYLES[status] || {
    label: status || "Unknown",
    icon: Clock,
    className: "bg-black/[0.06] text-muted-foreground",
  };
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        meta.className,
      )}
    >
      <Icon className={cn("size-3", meta.spin && "animate-spin")} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

const BANNER_TONES = {
  success: { className: "bg-ios-green/12 text-success", icon: CheckCircle2 },
  danger: { className: "bg-ios-red/10 text-destructive", icon: XCircle },
  warning: { className: "bg-ios-orange/12 text-warning", icon: AlertTriangle },
  neutral: { className: "bg-black/[0.05] text-muted-foreground", icon: Info },
};

export function Banner({ tone = "neutral", icon, children, className }) {
  const meta = BANNER_TONES[tone];
  const Icon = icon || meta.icon;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium",
        meta.className,
        className,
      )}
    >
      <Icon className="mt-0.5 size-[1.125rem] shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Field({ label, htmlFor, error, hint, required, className, children }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

// iOS-style segmented control (single choice).
export function Segmented({ value, onChange, options, label, className }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-black/[0.06] p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ease-apple outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "bg-card text-foreground shadow-[0_1px_3px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.04)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// Wallet-style transaction row used by order and billing history.
export function HistoryRow({ icon, tone = "muted", title, subtitle, amount, status }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5">
      <IconTile icon={icon} tone={tone} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-4">
        <span className="text-sm font-semibold tabular-nums text-foreground">{amount}</span>
        <StatusPill status={status} />
      </div>
    </li>
  );
}

export function HistoryList({ children }) {
  return <ul className="divide-y divide-black/[0.06]">{children}</ul>;
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="divide-y divide-black/[0.06]" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="skeleton size-10 rounded-[0.65rem]" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-1/3 rounded-full" />
            <div className="skeleton h-2.5 w-1/2 rounded-full" />
          </div>
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// Animates a number from its previous value to `value` (ease-out, ~0.8s). Text only, no layout work.
export function CountUp({ value = 0, format = (n) => n.toLocaleString(), duration = 800 }) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(target);
  const from = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const start = from.current;
    from.current = target;
    if (reduce || start === target) {
      setDisplay(target);
      return undefined;
    }
    let frame;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (target - start) * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return <span className="tabular-nums">{format(display)}</span>;
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const userCache = new Map();

export function invalidateDashboardUser(email) {
  if (email) userCache.delete(email.toLowerCase());
  else userCache.clear();
}

// Current user's profile, fetched once per session and shared by the shell and pages.
export function useDashboardUser() {
  const { data: session } = useSession();
  const email = session?.user?.email?.toLowerCase();
  const [user, setUser] = useState(() => (email ? userCache.get(email) || null : null));

  useEffect(() => {
    if (!email) return;
    const cached = userCache.get(email);
    if (cached) {
      setUser(cached);
      return;
    }

    let cancelled = false;
    fetch("/api/userdata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        if (cancelled) return;
        // an empty object means the lookup failed: render with defaults instead of loading forever
        if (data?.email) userCache.set(email, data);
        setUser(data || {});
      })
      .catch((err) => {
        console.error("Fetch user error:", err);
        if (!cancelled) setUser({});
      });

    return () => {
      cancelled = true;
    };
  }, [email]);

  return user;
}

export function getInitials(name) {
  if (!name) return "U";
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return letters || "U";
}
