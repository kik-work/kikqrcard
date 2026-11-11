import { forwardRef } from "react";
import {
  Briefcase,
  Camera,
  GraduationCap,
  Leaf,
  Lock,
  PenLine,
  QrCode,
  RefreshCw,
  Share2,
  Smartphone,
  Sparkles,
  Store,
  Target,
  Telescope,
  UserRound,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionIntro } from "@/components/sections/section-intro";

const STEPS = [
  { icon: PenLine, title: "Create your card", desc: "Add your contact details, links and branding, then pick a design." },
  { icon: QrCode, title: "Get your smart QR", desc: "We generate a unique QR that always points to your latest profile." },
  { icon: Share2, title: "Share anywhere", desc: "Print it, show it on your phone or send the link. People save you in one tap." },
];

const WHY_CHOOSE = [
  { icon: RefreshCw, title: "Easy to update", desc: "Edit your info anytime; the change is live instantly." },
  { icon: Zap, title: "Instant sharing", desc: "Just scan and connect. No app required." },
  { icon: Leaf, title: "Eco-friendly", desc: "One card replaces boxes of paper ones." },
  { icon: Sparkles, title: "Professional design", desc: "Sleek layouts made for business." },
  { icon: Lock, title: "You're in control", desc: "Choose exactly what others can see." },
  { icon: Smartphone, title: "Mobile ready", desc: "Looks great on every screen." },
];

const AUDIENCE = [
  { icon: Briefcase, label: "Professionals" },
  { icon: Store, label: "Business owners" },
  { icon: UserRound, label: "Freelancers" },
  { icon: Camera, label: "Creators" },
  { icon: GraduationCap, label: "Students" },
];

const Blog = forwardRef((props, ref) => {
  return (
    <section ref={ref} id="blog" className="relative w-full py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          eyebrow="How it works"
          title="From sign-up to first scan in under a minute."
          description="KIK QRcard links a dynamic QR code to your customizable profile, so you share your contact, portfolio and business instantly — no apps or paper needed."
        />

        {/* steps */}
        <div className="relative mt-16">
        <div aria-hidden className="absolute left-[16.6%] right-[16.6%] top-9 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
        <ol className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <Reveal as="li" key={title} delay={i * 120} className="relative flex flex-col items-center text-center">
              <div className="relative flex size-[4.5rem] items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-brand-deep text-white shadow-glow">
                <Icon className="size-7" />
                <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-white text-xs font-extrabold text-primary shadow-md ring-1 ring-primary/15">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-bold tracking-tight text-ink">{title}</h3>
              <p className="mt-2 max-w-xs text-[0.95rem] leading-relaxed text-muted-foreground">{desc}</p>
            </Reveal>
          ))}
        </ol>
        </div>

        {/* why + who */}
        <div className="mt-24 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="h-full rounded-[1.75rem] border border-border/70 bg-card p-7 shadow-card sm:p-9">
              <h3 className="text-2xl font-bold tracking-tight text-ink">Why choose KIK QRcard?</h3>
              <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                {WHY_CHOOSE.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="flex h-full flex-col rounded-[1.75rem] bg-gradient-to-br from-primary to-brand-deep p-7 text-white shadow-glow sm:p-9">
              <h3 className="text-2xl font-bold tracking-tight">Who is it for?</h3>
              <p className="mt-2 text-white/75">Anyone who wants to network smarter and faster.</p>
              <ul className="mt-7 flex flex-wrap gap-2">
                {AUDIENCE.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-2 text-sm font-semibold ring-1 ring-white/20 backdrop-blur">
                    <Icon className="size-4" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* mission + vision */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            { icon: Target, title: "Our mission", text: "To simplify how people connect and share information through innovative digital tools." },
            { icon: Telescope, title: "Our vision", text: "To become the go-to digital card platform for professionals around the world." },
          ].map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div className="flex h-full gap-5 rounded-[1.75rem] border border-border/70 bg-card p-7 shadow-card">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-white">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-ink">{title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
});

Blog.displayName = "Blog";

export default Blog;
