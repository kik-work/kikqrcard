import { forwardRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Palette, ShoppingBag } from "lucide-react";
import BusinessCard from "@/components/business-card";
import { Reveal } from "@/components/reveal";
import { SectionIntro } from "@/components/sections/section-intro";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ShowcaseSkeleton() {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-4 sm:p-5" aria-hidden="true">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="skeleton aspect-[1.586/1] w-full rounded-[6%]" />
        <div className="skeleton aspect-[1.586/1] w-full rounded-[6%]" />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-9 w-28 rounded-full" />
      </div>
    </div>
  );
}

const Showcase = forwardRef((props, ref) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/cardtemplates/public", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { templates: [] }))
      .then((data) => setTemplates((data.templates || []).slice(0, 6)))
      .catch((err) => {
        if (err.name !== "AbortError") setTemplates([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <section ref={ref} id="cards" className="relative w-full scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionIntro
            align="left"
            eyebrow="Card designs"
            title="Designs that make the first impression for you."
            description="Start from a ready-made design or build your own. Every card ships with a smart QR on the back."
          />
          <Reveal delay={100}>
            <Link
              href="/cards/allcards"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "group h-11 rounded-full px-5")}
            >
              Browse all designs
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {loading ? (
            <>
              <ShowcaseSkeleton />
              <ShowcaseSkeleton />
            </>
          ) : templates.length ? (
            templates.map((t, i) => (
              <Reveal key={t._id} delay={(i % 2) * 120}>
                <article className="group rounded-3xl border border-border/60 bg-card p-4 transition-[box-shadow,border-color,transform] duration-500 ease-out-expo hover:-translate-y-1 hover:border-primary/30 hover:shadow-float sm:p-5">
                  <div className="rounded-2xl bg-gradient-to-b from-muted/60 to-transparent p-2 sm:p-3">
                    <BusinessCard
                      name={t.name}
                      profession={t.profession}
                      phone={t.phone}
                      quote={t.quote}
                      bgGrad={t.bgGrad}
                      bgStyle={t.bgStyle}
                      pattern={t.pattern}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4 px-1">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Printed card
                      </p>
                      <p className="text-xl font-extrabold tabular-nums tracking-tight text-ink">
                        ৳{Number(t.price || 0).toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href="/cards/createcard"
                      className={cn(buttonVariants({ size: "lg" }), "h-10 rounded-full px-5")}
                    >
                      <ShoppingBag className="size-4" />
                      Order now
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))
          ) : (
            <Reveal className="col-span-full flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Palette className="size-6" />
              </span>
              <p className="font-semibold text-foreground">New designs are on the way</p>
              <p className="text-sm text-muted-foreground">Meanwhile, design your own card in the editor.</p>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
});

Showcase.displayName = "Showcase";

export default Showcase;
