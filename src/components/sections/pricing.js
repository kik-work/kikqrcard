import { forwardRef } from "react";
import Link from "next/link";
import { ArrowRight, Check, Minus, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionIntro } from "@/components/sections/section-intro";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FREE_TIER, PLANS } from "@/../lib/bkash/plans";

const formatBdt = (amount) => `৳${Number(amount).toLocaleString("en-US")}`;
const CYCLE_LABEL = { monthly: "/month", yearly: "/year" };
const { personal, business } = PLANS;

const TIERS = [
  {
    name: "Discover",
    price: "Free",
    cadence: "forever",
    description: "Try a digital QR card with no cost and no time limit.",
    featured: false,
    features: [
      { label: `${FREE_TIER.virtualCardLimit} virtual card`, included: true },
      { label: "QR contact sharing", included: true },
      { label: "Basic QR config", included: true },
      { label: "First physical card free", included: true },
      { label: "Monthly physical card orders", included: false },
      { label: "Priority support", included: false },
    ],
    cta: { label: "Start for free", href: "/authentication/signup" },
  },
  {
    name: personal.name,
    price: formatBdt(personal.amount),
    cadence: CYCLE_LABEL[personal.billingCycle],
    description: "For individuals building their network.",
    featured: true,
    features: [
      { label: `Up to ${personal.virtualCardLimit} virtual cards`, included: true },
      { label: "QR contact sharing", included: true },
      { label: "Custom QR config", included: true },
      { label: "First physical card free", included: true },
      { label: `${personal.cardOrderQuota} physical card orders / month`, included: true },
      { label: "Priority support", included: false },
    ],
    cta: { label: `Get ${personal.name}`, href: "/payment/billings?plan=personal" },
  },
  {
    name: business.name,
    price: formatBdt(business.amount),
    cadence: CYCLE_LABEL[business.billingCycle],
    description: "For teams issuing cards at scale.",
    featured: false,
    features: [
      { label: `Up to ${business.virtualCardLimit} virtual cards`, included: true },
      { label: "QR contact sharing", included: true },
      { label: "Custom QR config per card", included: true },
      { label: "First physical card free", included: true },
      { label: `10–${business.cardOrderQuota} physical card orders / month`, included: true },
      { label: "Priority support", included: true },
    ],
    cta: { label: `Get ${business.name}`, href: "/payment/billings?plan=business" },
  },
];

function PricingCard({ tier }) {
  const dark = tier.featured;

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-[1.75rem] p-7 transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-1.5 sm:p-8",
        dark
          ? "bg-ink text-white shadow-[0_30px_80px_-24px_rgb(91_79_214/0.55)] ring-1 ring-white/10"
          : "border border-border/70 bg-card shadow-card hover:shadow-float",
      )}
    >
      {dark && (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
            <div className="absolute inset-0 bg-grid-dark opacity-70" />
            <div className="absolute -right-24 -top-24 size-72 rounded-full bg-primary/45 blur-3xl" />
          </div>
          <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-[#c084fc] px-3.5 py-1 text-xs font-bold text-white shadow-glow">
            <Sparkles className="size-3.5" />
            Most popular
          </span>
        </>
      )}

      <div className="relative flex flex-1 flex-col">
        <h3 className={cn("text-sm font-bold uppercase tracking-[0.16em]", dark ? "text-primary" : "text-muted-foreground")}>
          {tier.name}
        </h3>
        <div className="mt-4 flex items-baseline gap-1.5">
          <span className={cn("text-5xl font-extrabold tracking-[-0.04em] tabular-nums", dark ? "text-white" : "text-ink")}>
            {tier.price}
          </span>
          <span className={cn("text-sm font-medium", dark ? "text-white/55" : "text-muted-foreground")}>{tier.cadence}</span>
        </div>
        <p className={cn("mt-3 text-[0.95rem]", dark ? "text-white/65" : "text-muted-foreground")}>{tier.description}</p>

        <Link
          href={tier.cta.href}
          className={cn(
            buttonVariants({ size: "lg" }),
            "group mt-7 h-12 w-full rounded-full text-[0.95rem]",
            dark
              ? "bg-white text-ink hover:bg-white/90"
              : "bg-ink text-white hover:bg-ink/85",
          )}
        >
          {tier.cta.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <div className={cn("my-7 h-px", dark ? "bg-white/10" : "bg-border")} />

        <ul className="flex flex-col gap-3.5">
          {tier.features.map((feature) => (
            <li key={feature.label} className="flex items-start gap-3 text-sm">
              {feature.included ? (
                <span
                  className={cn(
                    "mt-px flex size-5 shrink-0 items-center justify-center rounded-full",
                    dark ? "bg-primary text-white" : "bg-primary/10 text-primary",
                  )}
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
              ) : (
                <span className={cn("mt-px flex size-5 shrink-0 items-center justify-center rounded-full", dark ? "bg-white/10 text-white/40" : "bg-muted text-muted-foreground/60")}>
                  <Minus className="size-3" strokeWidth={3} />
                </span>
              )}
              <span
                className={cn(
                  feature.included
                    ? dark
                      ? "text-white/90"
                      : "text-foreground"
                    : dark
                      ? "text-white/40"
                      : "text-muted-foreground/70",
                )}
              >
                {feature.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

const Pricing = forwardRef((props, ref) => {
  return (
    <section ref={ref} id="pricing" className="relative w-full py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Pricing"
          title="Simple plans in BDT. Start free."
          description="Upgrade only when you need more cards or monthly printed orders. No hidden fees."
        />

        <div className="mt-16 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:gap-8">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 100} className={cn(tier.featured && "md:-my-4")}>
              <PricingCard tier={tier} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-success" />
            No setup fees
          </span>
          <span className="flex items-center gap-2">
            <Check className="size-4 text-success" />
            Your first physical card is free
          </span>
        </Reveal>
      </div>
    </section>
  );
});

Pricing.displayName = "Pricing";

export default Pricing;
