import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Palette,
  Receipt,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FullscreenStatus, getInitials } from "@/components/dashboard-ui";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Platform",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/cards", label: "Cards", icon: WalletCards },
      { href: "/admin/cardtemplates", label: "Card Designs", icon: Palette },
    ],
  },
  {
    label: "Billing",
    items: [
      { href: "/admin/orders", label: "Orders", icon: Package },
      { href: "/admin/payments", label: "Payments", icon: Receipt },
    ],
  },
];

function AdminBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white">
      <ShieldCheck className="size-3" />
      Admin
    </span>
  );
}

function NavList({ path, onNavigate }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/authentication/login");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <nav aria-label="Admin" className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="flex flex-col gap-0.5">
            <p className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground/80">{section.label}</p>
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = path === href;
              return (
                <Link
                  key={href}
                  href={href}
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
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-black/[0.07] pt-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-black/[0.045] hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <ExternalLink className="size-4" />
          User dashboard
        </Link>
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar size="lg">
            <AvatarImage src={user?.image || undefined} alt="" />
            <AvatarFallback className="bg-ios-indigo/15 text-sm font-semibold text-primary">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{user?.name || "Administrator"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
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

export function AdminShell() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* phone: translucent top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/[0.06] bg-background/80 px-4 backdrop-blur-xl backdrop-saturate-150 md:hidden">
        <Link href="/admin" aria-label="Admin overview" className="flex items-center gap-2">
          <Logo size="xs" />
          <AdminBadge />
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" className="rounded-full" />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="bg-background p-5">
            <SheetTitle className="sr-only">Admin menu</SheetTitle>
            <div className="mb-6 mt-1 flex items-center gap-2">
              <Logo size="sm" />
              <AdminBadge />
            </div>
            <NavList path={path} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* desktop: frosted sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-sidebar-border bg-sidebar p-5 backdrop-blur-2xl backdrop-saturate-150 md:flex">
        <Link href="/admin" aria-label="Admin overview" className="mb-7 flex items-center gap-2.5 px-2 pt-1">
          <Logo size="sm" />
          <AdminBadge />
        </Link>
        <NavList path={path} />
      </aside>
    </>
  );
}

// Page frame for every admin screen: dashboard theme, admin guard state, sidebar and content width.
export function AdminLayout({ title, ready, width = "max-w-7xl", children }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dashboard");
    return () => root.classList.remove("dashboard");
  }, []);

  if (!ready) return <FullscreenStatus title="Checking access…" />;

  return (
    <div className="dashboard min-h-screen bg-background text-foreground">
      {title && <Seo title={`${title} · Admin`} noIndex />}
      <AdminShell />
      <main className="md:pl-72">
        <div className={cn("mx-auto w-full animate-page-in px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-10", width)}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminShell;
