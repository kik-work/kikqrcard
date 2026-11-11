import { forwardRef } from "react";
import {
  Images,
  Link2,
  MapPin,
  MessageCircle,
  MonitorPlay,
  Palette,
  RefreshCw,
  Share2,
  Smartphone,
  Zap,
} from "lucide-react";
import { Reveal, useSpotlight } from "@/components/reveal";
import { SectionIntro } from "@/components/sections/section-intro";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: Share2, title: "All your socials, one tap", description: "Facebook, LinkedIn, Instagram, YouTube and more — every profile in one digital card.", tone: "from-primary to-brand-deep" },
  { icon: MessageCircle, title: "WhatsApp built in", description: "Let people start a chat with you instantly. Turn it on or off whenever you like.", tone: "from-[#25d366] to-[#128c7e]" },
  { icon: Images, title: "Photo gallery", description: "Show products, projects or your shop. Visitors see your work before they call.", tone: "from-ios-orange to-ios-pink" },
  { icon: MonitorPlay, title: "YouTube integration", description: "Link your channel or a showreel right from your card.", tone: "from-ios-red to-ios-pink" },
  { icon: MapPin, title: "Google Maps", description: "Pin your shop or office so visitors find you in one tap.", tone: "from-ios-teal to-ios-blue" },
  { icon: Palette, title: "Designer themes", description: "Gradients, patterns and admin-curated templates that look sharp in print and on screen.", tone: "from-[#c084fc] to-primary" },
  { icon: Zap, title: "Loads in a blink", description: "A lightweight page built for mobile data, so your card opens before they lose interest.", tone: "from-ios-orange to-[#f59e0b]" },
  { icon: Link2, title: "Your own link", description: "A unique link for your name or business to share anywhere.", tone: "from-ios-blue to-ios-indigo" },
];

// The two headline features get wide cards with a small illustration.
function DynamicQrIllustration() {
  return (
    <div aria-hidden className="relative mt-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4">
      <div className="grid size-14 shrink-0 grid-cols-5 gap-0.5 rounded-lg bg-white p-1.5 shadow-sm">
        {Array.from({ length: 25 }).map((_, i) => (
          <span key={i} className={cn("rounded-[1px]", [0, 1, 3, 4, 5, 9, 12, 15, 19, 20, 21, 23, 24, 7, 17].includes(i) ? "bg-ink" : "bg-transparent")} />
        ))}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">Phone number</span>
          <span className="rounded-full bg-ios-green/15 px-2 py-0.5 font-semibold text-success">Updated</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-full origin-left animate-[grow_2.4s_var(--ease-out-expo)_infinite] rounded-full bg-gradient-to-r from-primary to-brand-deep" />
        </div>
        <p className="text-[0.7rem] text-muted-foreground">Printed QR still points to your latest details.</p>
      </div>
    </div>
  );
}

const Feature = forwardRef((props, ref) => {
  const onPointerMove = useSpotlight();

  return (
    <section ref={ref} id="feature" className="relative w-full overflow-hidden bg-[#f7f6fc] py-24 sm:py-32">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-60 mask-radial" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="Features"
          title="Everything a modern business card should do."
          description="Built for how people actually connect today — on their phones, in a second, without installing anything."
        />

        <div onPointerMove={onPointerMove} className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {/* hero tiles */}
          <Reveal className="sm:col-span-2">
            <article className="spotlight h-full rounded-3xl border border-border/70 bg-card p-7 shadow-card transition-shadow duration-500 hover:shadow-float">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-brand-deep text-white shadow-glow">
                <RefreshCw className="size-5" />
              </span>
              <h3 className="mt-5 text-xl font-bold tracking-tight text-ink">Dynamic QR — edit after printing</h3>
              <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
                Changed your number or job? Update your card online and every printed QR shows the new
                details. No reprints, no dead links.
              </p>
              <DynamicQrIllustration />
            </article>
          </Reveal>
          <Reveal className="sm:col-span-2" delay={100}>
            <article className="spotlight relative h-full overflow-hidden rounded-3xl bg-ink p-7 text-white shadow-float">
              <div aria-hidden className="absolute inset-0 bg-grid-dark" />
              <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/40 blur-3xl" />
              <div className="relative">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                  <Smartphone className="size-5" />
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight">Works with any phone camera</h3>
                <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-white/65">
                  No app for you or the people you meet. Point the camera, tap the link, save the
                  contact — it takes about three seconds.
                </p>
                <ol className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                  {["Scan", "Open", "Save"].map((step, i) => (
                    <li key={step} className="rounded-2xl bg-white/[0.07] px-2 py-3 ring-1 ring-white/10">
                      <span className="mx-auto mb-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-[0.7rem]">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </article>
          </Reveal>

          {FEATURES.map(({ icon: Icon, title, description, tone }, i) => (
            <Reveal key={title} delay={(i % 4) * 70}>
              <article className="spotlight group h-full rounded-3xl border border-border/70 bg-card p-6 shadow-card transition-[box-shadow,transform] duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-float">
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm transition-transform duration-500 ease-out-expo group-hover:scale-110 group-hover:-rotate-6",
                    tone,
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-base font-bold tracking-tight text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
});

Feature.displayName = "Feature";

export default Feature;
