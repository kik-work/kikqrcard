import { forwardRef } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "react-qr-code";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Globe,
  Mail,
  MessageCircle,
  Phone,
  CirclePlay,
  RefreshCw,
  ScanLine,
  Smartphone,
  UserPlus,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kikqrcard.netlify.app";

const PROOF_POINTS = [
  { icon: Check, label: "Free plan, forever" },
  { icon: RefreshCw, label: "Edit after printing" },
  { icon: Smartphone, label: "No app to scan" },
];

const INTEGRATIONS = [
  { src: "/whatsapp.svg", label: "WhatsApp" },
  { src: "/facebook.svg", label: "Facebook" },
  { src: "/linkedin.svg", label: "LinkedIn" },
  { src: "/instagram.svg", label: "Instagram" },
  { src: "/youtube.svg", label: "YouTube" },
  { src: "/maps.svg", label: "Google Maps" },
  { src: "/globe.svg", label: "Website" },
  { src: "/call.svg", label: "Phone" },
];

// Mini profile screen inside the phone: what a visitor sees after scanning.
function PhonePreview() {
  const rows = [
    { icon: MessageCircle, label: "WhatsApp", tint: "bg-[#25d366]" },
    { icon: Phone, label: "Call", tint: "bg-ios-blue" },
    { icon: Mail, label: "Email", tint: "bg-ios-orange" },
    { icon: Globe, label: "Website", tint: "bg-ios-teal" },
  ];
  return (
    <div className="relative h-[27rem] w-[13.5rem] rounded-[2.4rem] bg-ink p-2 shadow-float ring-1 ring-black/10 sm:h-[30rem] sm:w-[15rem]">
      <div className="absolute left-1/2 top-3.5 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-ink" />
      <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-[#f6f5fb]">
        <div className="relative h-28 shrink-0 bg-gradient-to-br from-brand-deep via-primary to-[#c084fc]">
          <div className="absolute inset-0 bg-grid-dark opacity-60" />
        </div>
        <div className="-mt-10 flex flex-col items-center px-4 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-white p-1 shadow-lg">
            <div className="flex size-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand-deep text-xl font-bold text-white">
              NR
            </div>
          </div>
          <p className="mt-2.5 flex items-center gap-1 text-[0.95rem] font-bold text-ink">
            Nadia Rahman
            <BadgeCheck className="size-4 fill-primary text-white" />
          </p>
          <p className="text-[0.7rem] text-ink/55">Brand Strategist · Dhaka</p>
        </div>
        <ul className="mt-4 flex flex-col gap-2 px-3.5">
          {rows.map(({ icon: Icon, label, tint }) => (
            <li key={label} className="flex items-center gap-2.5 rounded-xl bg-white px-2.5 py-2 shadow-[0_1px_2px_rgb(0_0_0/0.05)]">
              <span className={cn("flex size-7 items-center justify-center rounded-lg text-white", tint)}>
                <Icon className="size-3.5" />
              </span>
              <span className="text-xs font-semibold text-ink/80">{label}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto p-3.5">
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-ink py-2.5 text-xs font-semibold text-white">
            <UserPlus className="size-3.5" />
            Save contact
          </div>
        </div>
      </div>
    </div>
  );
}

// Physical card with a live QR and an animated scan line.
function CardPreview() {
  return (
    <div className="relative aspect-[1.586/1] w-[18rem] overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-ink-soft to-brand-deep p-4 text-white shadow-float ring-1 ring-white/10 sm:w-[20rem]">
      <div aria-hidden className="absolute inset-0 bg-grid-dark opacity-70" />
      <div aria-hidden className="absolute -right-10 -top-12 size-40 rounded-full bg-primary/40 blur-2xl" />
      <div className="relative flex h-full items-center gap-4">
        <div className="relative shrink-0 overflow-hidden rounded-xl bg-white p-2 [--scan-distance:88px]">
          <QRCode value={SITE_URL} size={88} className="size-[88px]" fgColor="#0e0b24" />
          <span
            aria-hidden
            className="absolute inset-x-1 top-1 h-0.5 animate-scan rounded-full bg-primary shadow-[0_0_12px_2px_rgb(143_135_241/0.8)]"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-1">
          <Logo size="xxs" variant="on-dark" />
          <div>
            <p className="text-base font-bold italic tracking-wide">Nadia Rahman</p>
            <p className="text-[0.65rem] text-white/60">Brand Strategist</p>
          </div>
          <p className="flex items-center gap-1.5 text-[0.65rem] text-white/70">
            <ScanLine className="size-3" />
            Scan to connect
          </p>
        </div>
      </div>
    </div>
  );
}

function Chip({ icon: Icon, title, subtitle, tone, className }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-2xl border border-white/60 bg-white/85 py-2 pl-2 pr-4 shadow-float backdrop-blur-md",
        className,
      )}
    >
      <span className={cn("flex size-8 items-center justify-center rounded-xl text-white", tone)}>
        <Icon className="size-4" />
      </span>
      <div className="leading-tight">
        <p className="text-xs font-bold text-ink">{title}</p>
        <p className="text-[0.65rem] text-ink/55">{subtitle}</p>
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto flex h-[29rem] w-full max-w-[34rem] items-center justify-center sm:h-[33rem]">
      <div aria-hidden className="absolute inset-8 rounded-full bg-gradient-to-tr from-primary/30 via-[#c084fc]/20 to-transparent blur-3xl" />

      <div className="relative animate-fade-up [animation-delay:150ms]">
        <div className="animate-float-slow">
          <PhonePreview />
        </div>
      </div>

      <div className="absolute bottom-6 left-0 animate-fade-up [animation-delay:350ms] sm:bottom-10 sm:-left-4">
        <div className="-rotate-6 animate-float [animation-delay:-2s]">
          <CardPreview />
        </div>
      </div>

      <div className="absolute right-0 top-10 animate-fade-up [animation-delay:550ms] sm:-right-2">
        <div className="animate-float [animation-delay:-4s]">
          <Chip icon={ScanLine} title="Card scanned" subtitle="just now · Dhaka" tone="bg-primary" />
        </div>
      </div>

      <div className="absolute bottom-24 right-0 hidden animate-fade-up [animation-delay:700ms] sm:block">
        <div className="animate-float-slow [animation-delay:-1s]">
          <Chip icon={UserPlus} title="Contact saved" subtitle="to phonebook" tone="bg-ios-green" />
        </div>
      </div>
    </div>
  );
}

const Home = forwardRef((props, ref) => {
  const { blogref } = props;

  return (
    <section
      ref={ref}
      id="home"
      className="relative isolate -mt-16 w-full overflow-hidden pt-16 lg:-mt-[4.25rem] lg:pt-[4.25rem]"
    >
      {/* backdrop: static layers only, nothing here repaints on scroll */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f3f1ff] via-background to-background" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid mask-radial" />
      <div aria-hidden className="absolute -top-48 left-1/2 -z-10 h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-primary/20 bg-white/70 py-1 pl-1.5 pr-3.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
            <span className="rounded-full bg-primary px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-primary-foreground">
              New
            </span>
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping-soft rounded-full bg-ios-green" />
              <span className="relative inline-flex size-2 rounded-full bg-ios-green" />
            </span>
            Dynamic QR that stays valid after printing
          </span>

          <h1 className="mt-6 animate-fade-up text-[2.6rem] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink [animation-delay:80ms] sm:text-6xl lg:text-[4.25rem]">
            Your network is
            <br className="hidden sm:block" /> your{" "}
            <span className="text-gradient animate-gradient-pan">net worth.</span>
          </h1>

          <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-muted-foreground [animation-delay:160ms] sm:text-xl">
            Smart QR business cards that share your phone, WhatsApp, socials and location in one
            scan — and update instantly whenever your details change.
          </p>

          <div className="mt-9 flex w-full animate-fade-up flex-col gap-3 [animation-delay:240ms] sm:w-auto sm:flex-row">
            <Link
              href="/authentication/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "group h-12 rounded-full px-7 text-base shadow-glow hover:bg-primary hover:brightness-110",
              )}
            >
              Create your free card
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <button
              type="button"
              onClick={() => blogref?.current?.scrollIntoView({ behavior: "smooth" })}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-full border-border/80 bg-white/70 px-6 text-base backdrop-blur hover:bg-white",
              )}
            >
              <CirclePlay className="size-[1.15rem] text-primary" />
              How it works
            </button>
          </div>

          <ul className="mt-9 flex animate-fade-up flex-wrap justify-center gap-x-6 gap-y-2 [animation-delay:320ms] lg:justify-start">
            {PROOF_POINTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-3" strokeWidth={3} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <HeroVisual />
      </div>

      {/* integrations marquee */}
      <div className="border-y border-border/60 bg-white/60 py-6 backdrop-blur">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          One card. Every channel you use.
        </p>
        <div className="group relative overflow-hidden mask-fade-edges">
          <ul className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
            {[...INTEGRATIONS, ...INTEGRATIONS].map((item, i) => (
              <li
                key={`${item.label}-${i}`}
                aria-hidden={i >= INTEGRATIONS.length || undefined}
                className="flex items-center gap-2.5 rounded-full border border-border/70 bg-background px-5 py-2.5 text-sm font-semibold text-foreground/75"
              >
                <Image src={item.src} alt="" width={20} height={20} className="size-5" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
});

Home.displayName = "Home";

export default Home;
