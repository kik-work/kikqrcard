import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  House,
  WalletCards,
  Star,
  Heart,
  Package,
  CreditCard,
  UserRound,
  LogOut,
  Plus,
  Menu,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Seo } from "@/components/seo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getInitials, useDashboardUser } from "@/components/dashboard-ui";
import { PLANS } from "@/../lib/bkash/plans";
import { cn } from "@/lib/utils";

// `match` lists extra routes that belong to an item (e.g. editing a card keeps "My Cards" lit).
const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Home", icon: House }],
  },
  {
    label: "Cards",
    items: [
      {
        href: "/cards/mycards",
        label: "My Cards",
        icon: WalletCards,
        match: ["/cards/createcard", "/cards/qrconfig"],
      },
      { href: "/cards/favourites", label: "Favourites", icon: Star },
      { href: "/cards/loved", label: "Loved", icon: Heart },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/payment/orders", label: "Orders", icon: Package },
      { href: "/payment/billings", label: "Plans & Billing", icon: CreditCard },
      { href: "/dashboard/editprofile", label: "Profile", icon: UserRound },
    ],
  },
];

// Bottom tab bar on phones: the five things people reach for most.
const TAB_ITEMS = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/cards/mycards", label: "Cards", icon: WalletCards, match: ["/cards/createcard", "/cards/qrconfig"] },
  { href: "/cards/createcard", label: "Create", icon: Plus, primary: true },
  { href: "/payment/orders", label: "Orders", icon: Package },
  { href: "/dashboard/editprofile", label: "Profile", icon: UserRound },
];

const isActive = (pathname, { href, match = [] }) =>
  pathname === href || match.includes(pathname);

const checkUrlExists = async (url, timeout = 3000) => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(id);
    return response.ok;
  } catch {
    return false;
  }
};

const handleLogout = async () => {
  await signOut({ redirect: false });
  const url1 = "https://kikqrcard.netlify.app/authentication/login";
  const url2 = "http://localhost:7000/authentication/login";
  const exists = await checkUrlExists(url1);
  window.location.href = exists ? url1 : url2;
};

function NavList({ pathname, onNavigate }) {
  const user = useDashboardUser();
  const plan = PLANS[user?.plan];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <Link
        href="/cards/createcard"
        onClick={onNavigate}
        className={cn(
          buttonVariants({ size: "lg" }),
          "group w-full shadow-[0_8px_20px_-8px_rgb(88_86_214/0.65)] hover:bg-primary hover:brightness-110",
        )}
      >
        <Plus className="size-4 transition-transform duration-300 ease-out-expo group-hover:rotate-90" />
        New card
      </Link>

      <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="flex flex-col gap-0.5">
            <p className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground/80">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/40",
                    active
                      ? "bg-primary/[0.09] text-foreground"
                      : "text-foreground/70 hover:bg-black/[0.045] hover:text-foreground",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-[opacity,transform] duration-300 ease-out-expo",
                      active ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0",
                    )}
                  />
                  <Icon
                    className={cn(
                      "size-[1.15rem] transition-transform duration-300 ease-out-expo group-hover:scale-110",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                    strokeWidth={active ? 2.25 : 2}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {user && !plan && (
        <Link
          href="/payment/billings"
          onClick={onNavigate}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-ios-indigo to-[#8f87f1] p-4 text-white shadow-[0_12px_28px_-14px_rgb(88_86_214/0.8)] outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <span aria-hidden className="absolute -right-6 -top-6 size-20 rounded-full bg-white/15 blur-xl transition-transform duration-500 ease-out-expo group-hover:scale-150" />
          <span className="relative flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4" />
            Upgrade your plan
            <ArrowUpRight className="ml-auto size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
          <span className="relative mt-1 block text-xs text-white/75">More cards and monthly printed orders.</span>
        </Link>
      )}

      <div className="space-y-1 border-t border-black/[0.07] pt-4">
        <Link
          href="/dashboard/editprofile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-2 py-2 outline-none transition-colors hover:bg-black/[0.045] focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <Avatar size="lg">
            <AvatarImage src={user?.profileImageBase64 || undefined} alt="" />
            <AvatarFallback className="bg-ios-indigo/15 text-sm font-semibold text-primary">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          {user ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{user.name || "Your account"}</p>
              <p className="truncate text-xs text-muted-foreground">{plan ? `${plan.name} plan` : "Free plan"}</p>
            </div>
          ) : (
            <div className="space-y-2" aria-hidden="true">
              <div className="h-3 w-24 animate-pulse rounded-full bg-black/[0.07]" />
              <div className="h-2.5 w-16 animate-pulse rounded-full bg-black/[0.07]" />
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-black/[0.045] hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

function TabBar({ pathname }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.07] bg-card/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl backdrop-saturate-150 md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pt-1.5 pb-1.5">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = !item.primary && isActive(pathname, item);
          return (
            <li key={item.href} className="flex justify-center">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className="group flex min-w-14 flex-col items-center gap-0.5 rounded-xl px-2 py-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                {item.primary ? (
                  <span className="flex size-11 -translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform duration-200 ease-apple group-active:scale-90">
                    <Icon className="size-5" strokeWidth={2.5} />
                  </span>
                ) : (
                  <>
                    <Icon
                      className={cn(
                        "size-6 transition-[color,transform] duration-300 ease-out-expo group-active:scale-90",
                        active ? "-translate-y-px text-primary" : "text-muted-foreground",
                      )}
                      strokeWidth={active ? 2.25 : 1.85}
                    />
                    <span
                      className={cn(
                        "text-[0.6875rem] font-medium",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function DashboardShell() {
  const pathname = usePathname();
  const user = useDashboardUser();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* phone: translucent top bar + bottom tab bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/[0.06] bg-background/80 px-4 backdrop-blur-xl backdrop-saturate-150 md:hidden">
        <Link href="/" aria-label="KIK QRcard home" className="flex items-center">
          <Logo size="xs" />
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" aria-label="Open menu" className="rounded-full" />}
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="bg-background p-5">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="mb-2 mt-1">
              <Logo size="sm" />
            </div>
            <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
      <TabBar pathname={pathname} />

      {/* desktop: frosted sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-sidebar-border bg-sidebar p-5 backdrop-blur-2xl backdrop-saturate-150 md:flex">
        <Link href="/" aria-label="KIK QRcard home" className="mb-7 flex items-center px-2 pt-1">
          <Logo size="sm" />
        </Link>
        <NavList pathname={pathname} />
      </aside>
    </>
  );
}

// Page frame shared by every dashboard screen: applies the dashboard theme, SEO, sidebar and content width.
export function DashboardLayout({ title, path, width = "max-w-6xl", children }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dashboard");
    return () => root.classList.remove("dashboard");
  }, []);

  return (
    <div className="dashboard min-h-screen bg-background text-foreground">
      {title && <Seo title={title} path={path} noIndex />}
      <DashboardShell />
      <main className="md:pl-72">
        <div className={cn("mx-auto w-full animate-page-in px-4 pb-32 pt-6 sm:px-6 md:pb-14 lg:px-10 lg:pt-10", width)}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardShell;
