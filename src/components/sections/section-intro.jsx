import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

// Eyebrow + headline + lede used at the top of every landing section.
export function SectionIntro({ eyebrow, title, description, align = "center", tone = "light", className, children }) {
  const dark = tone === "dark";
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-2xl items-center text-center" : "max-w-xl items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]",
            dark ? "bg-white/10 text-white/80 ring-1 ring-white/15" : "bg-primary/10 text-primary",
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "text-balance text-3xl font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[2.75rem]",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("text-pretty text-lg leading-relaxed", dark ? "text-white/65" : "text-muted-foreground")}>
          {description}
        </p>
      )}
      {children}
    </Reveal>
  );
}

export default SectionIntro;
