import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  Palette,
  Receipt,
  RefreshCw,
  Users,
  Wallet,
  WalletCards,
} from "lucide-react";
import { AdminLayout } from "@/components/admin-shell";
import { CountUp, IconTile, PageHeader, SectionHeading, Surface } from "@/components/dashboard-ui";
import { Button } from "@/components/ui/button";
import { useRequireAdmin } from "@/lib/useRequireAdmin";
import { cn } from "@/lib/utils";

const formatBdt = (v) => `৳${Number(v).toLocaleString()}`;

const STAT_CARDS = [
  { key: "userCount", label: "Users", icon: Users, tone: "blue", href: "/admin/users" },
  { key: "cardCount", label: "Cards", icon: WalletCards, tone: "indigo", href: "/admin/cards" },
  { key: "paymentCount", label: "Payments", icon: Receipt, tone: "orange", href: "/admin/payments" },
  { key: "revenue", label: "Revenue (completed)", icon: Wallet, tone: "green", href: "/admin/payments", format: formatBdt },
];

const QUICK_LINKS = [
  { label: "Manage users", hint: "Roles, access and accounts", icon: Users, tone: "blue", href: "/admin/users" },
  { label: "Review cards", hint: "Every card across the platform", icon: WalletCards, tone: "indigo", href: "/admin/cards" },
  { label: "Card designs", hint: "Templates on the public site", icon: Palette, tone: "pink", href: "/admin/cardtemplates" },
  { label: "Payments", hint: "bKash plan transactions", icon: Receipt, tone: "orange", href: "/admin/payments" },
];

// Animated ring. stroke-dashoffset transition runs on the compositor-friendly SVG path only.
function Ring({ value, size = 132, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-black/[0.06]" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * shown) / 100}
        className="stroke-ios-green transition-[stroke-dashoffset] duration-1000 ease-out-expo"
      />
    </svg>
  );
}

function AdminOverview() {
  const { ready } = useRequireAdmin();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!ready) return undefined;
    const controller = new AbortController();
    setLoading(true);
    fetch("/api/admin/stats", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStats(data))
      .catch((err) => {
        if (err.name !== "AbortError") setStats(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [ready, refreshKey]);

  const completed = stats?.completedPaymentCount ?? 0;
  const total = stats?.paymentCount ?? 0;
  const completionPct = total ? Math.round((completed / total) * 100) : 0;
  const avgOrder = completed ? Math.round((stats?.revenue ?? 0) / completed) : 0;

  return (
    <AdminLayout title="Overview" ready={ready}>
      <div className="space-y-8 sm:space-y-10">
        <PageHeader
          title="Overview"
          description="Snapshot of users, cards and payments across the platform."
          actions={
            <Button variant="secondary" onClick={() => setRefreshKey((k) => k + 1)} disabled={loading}>
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              Refresh
            </Button>
          }
        />

        <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {STAT_CARDS.map(({ key, label, icon, tone, href, format }, i) => (
            <Link
              key={key}
              href={href}
              style={{ animationDelay: `${60 + i * 60}ms` }}
              className="group animate-fade-up rounded-[1.25rem] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Surface className="flex h-full flex-col gap-4 p-4 transition-[transform,box-shadow] duration-300 ease-apple group-hover:-translate-y-1 group-hover:shadow-lift sm:p-5">
                <div className="flex items-center justify-between">
                  <IconTile icon={icon} tone={tone} className="transition-transform duration-300 ease-out-expo group-hover:scale-110" />
                  <ArrowUpRight className="size-4 text-muted-foreground/50 transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <div>
                  {loading && !stats ? (
                    <div className="skeleton h-8 w-16 rounded-lg" />
                  ) : (
                    <p className="truncate text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
                      <CountUp value={stats?.[key] ?? 0} format={format} />
                    </p>
                  )}
                  <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
                </div>
              </Surface>
            </Link>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
          <Surface className="animate-fade-up p-5 [animation-delay:300ms] sm:p-6 lg:col-span-3">
            <SectionHeading title="Payment health" description="Share of plan payments that completed." />
            <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row">
              <div className="relative shrink-0">
                <Ring value={completionPct} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
                    <CountUp value={completionPct} format={(n) => `${n}%`} />
                  </span>
                  <span className="text-xs text-muted-foreground">completed</span>
                </div>
              </div>
              <dl className="grid w-full grid-cols-2 gap-3">
                {[
                  { label: "Completed", value: completed },
                  { label: "Not completed", value: Math.max(0, total - completed) },
                  { label: "Revenue", value: stats?.revenue ?? 0, format: formatBdt },
                  { label: "Avg. payment", value: avgOrder, format: formatBdt },
                ].map(({ label, value, format }) => (
                  <div key={label} className="rounded-2xl bg-black/[0.03] p-4">
                    <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                    <dd className="mt-1 text-lg font-semibold tracking-[-0.02em] text-foreground">
                      {loading && !stats ? <span className="skeleton block h-6 w-14 rounded-md" /> : <CountUp value={value} format={format} />}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Surface>

          <Surface className="animate-fade-up p-2 [animation-delay:380ms] lg:col-span-2">
            <p className="px-4 pb-1 pt-4 text-sm font-semibold text-foreground">Quick links</p>
            <ul className="divide-y divide-black/[0.05]">
              {QUICK_LINKS.map(({ label, hint, icon, tone, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 outline-none transition-colors hover:bg-black/[0.03] focus-visible:ring-3 focus-visible:ring-ring/40"
                  >
                    <IconTile icon={icon} tone={tone} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{hint}</span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground/50 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </Surface>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminOverview;
