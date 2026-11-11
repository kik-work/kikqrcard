import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { ArrowRight, Menu } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "cards", label: "Designs" },
  { id: "feature", label: "Features" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" },
  { id: "blog", label: "About" },
];

export function SiteHeader({ sectionref }) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(null);

  // Glass background once the page leaves the top. Passive listener, state only changes on the edge.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active link: whichever section crosses the middle band of the viewport. No layout reads on scroll.
  useEffect(() => {
    if (!Array.isArray(sectionref) || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sectionref.forEach((ref) => ref?.current && io.observe(ref.current));
    return () => io.disconnect();
  }, [sectionref]);

  // On the landing page scroll to the section; elsewhere (FAQ, designs…) go to it on the landing page.
  const scrollToIndex = (index) => {
    setOpen(false);
    const target = sectionref?.[index]?.current;
    if (target) target.scrollIntoView({ behavior: "smooth" });
    else router.push(`/#${NAV_ITEMS[index].id}`);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,box-shadow,border-color] duration-300",
        "border-b",
        scrolled
          ? "border-border/70 bg-background/75 shadow-[0_8px_30px_-12px_rgb(14_11_36/0.12)] backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:h-[4.25rem] lg:px-8">
        <Link href="/" aria-label="KIK QRcard home" className="flex items-center rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <Logo size="sm" />
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-1 rounded-full border border-border/60 bg-background/60 p-1 backdrop-blur md:flex">
          {NAV_ITEMS.map((item, index) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-sm font-semibold outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50 lg:px-4",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-0 -z-0 rounded-full bg-primary shadow-[0_6px_16px_-6px_rgb(91_79_214/0.6)] transition-[opacity,transform] duration-300 ease-out-expo",
                    active ? "scale-100 opacity-100" : "scale-90 opacity-0",
                  )}
                />
                <span className="relative">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-5")}>
              Dashboard
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/authentication/login"
                className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "rounded-full px-4")}
              >
                Log in
              </Link>
              <Link
                href="/authentication/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group rounded-full px-5 shadow-[0_8px_20px_-8px_rgb(91_79_214/0.7)] hover:bg-primary hover:brightness-110",
                )}
              >
                Get started
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="rounded-full md:hidden" aria-label="Open menu" />}
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[19rem] p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex h-full flex-col">
              <div className="border-b border-border/60 px-5 py-4">
                <Logo size="sm" />
              </div>
              <nav aria-label="Sections" className="flex flex-col gap-1 p-3">
                {NAV_ITEMS.map((item, index) => {
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToIndex(index)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 text-left text-base font-semibold transition-colors",
                        active ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted",
                      )}
                    >
                      {item.label}
                      {active && <span className="size-1.5 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-border/60 p-4">
                {isAuthenticated ? (
                  <SheetClose render={<Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-full")} />}>
                    Dashboard
                  </SheetClose>
                ) : (
                  <>
                    <SheetClose
                      render={
                        <Link
                          href="/authentication/login"
                          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-full")}
                        />
                      }
                    >
                      Log in
                    </SheetClose>
                    <SheetClose
                      render={
                        <Link href="/authentication/signup" className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-full")} />
                      }
                    >
                      Get started free
                    </SheetClose>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export default SiteHeader;
