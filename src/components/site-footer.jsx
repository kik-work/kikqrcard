import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { Reveal } from "@/components/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#blog" },
      { label: "Card designs", href: "/#cards" },
      { label: "Features", href: "/#feature" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/#contact" },
      { label: "FAQ", href: "/about/faq" },
      { label: "Terms and Conditions", href: "/about/t&c" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Sign up", href: "/authentication/signup" },
      { label: "Log in", href: "/authentication/login" },
    ],
  },
];

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/profile.php?id=61578126735116", icon: "/facebook.svg", label: "Facebook" },
  { href: "https://wa.me/8801923089370", icon: "/wp.svg", label: "WhatsApp" },
  { href: "https://rb.gy/6t2at1", icon: "/linkedin.svg", label: "LinkedIn" },
];

// Closing call to action shown above the footer on public pages.
function CtaBand() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-center text-white shadow-float sm:px-12 sm:py-20">
          <div aria-hidden className="absolute inset-0 bg-grid-dark mask-radial" />
          <div aria-hidden className="absolute -left-24 -top-24 size-80 rounded-full bg-primary/50 blur-3xl" />
          <div aria-hidden className="absolute -bottom-32 -right-16 size-96 rounded-full bg-[#c084fc]/30 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-balance text-3xl font-extrabold tracking-[-0.03em] sm:text-5xl">
              Make every introduction count.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-white/65">
              Create your digital card for free today. Your first printed card is on us.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/authentication/signup"
                className={cn(buttonVariants({ size: "lg" }), "group h-12 rounded-full bg-white px-7 text-base text-ink hover:bg-white/90")}
              >
                Create your free card
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/#pricing"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 rounded-full border-white/20 bg-white/5 px-7 text-base text-white hover:bg-white/10 hover:text-white",
                )}
              >
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export function SiteFooter({ showCta = true }) {
  return (
    <footer className="w-full bg-background pt-8">
      {showCta && <CtaBand />}
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 flex flex-col gap-5 lg:col-span-1">
            <Link href="/" aria-label="KIK QRcard home" className="inline-flex w-fit">
              <Logo size="sm" />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Smart QR business cards for people who want to network smarter. Made in Dhaka.
            </p>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-10 items-center justify-center rounded-full border border-border/80 transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/50"
                >
                  <Image src={social.icon} width={18} height={18} className="size-[18px]" alt="" />
                </a>
              ))}
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-foreground">{col.title}</h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-border/70 pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} KIK QRcards. All rights reserved.</p>
          <p>Digital QR business cards · Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
