import { useCallback, useEffect, useRef } from "react";

// One IntersectionObserver shared by every <Reveal>, so a page with dozens of
// animated blocks still costs a single observer and zero scroll listeners.
let observer = null;

function getObserver() {
  if (observer || typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return observer;
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-revealed", "");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0 },
  );
  return observer;
}

/**
 * Fades and lifts its content in the first time it scrolls into view.
 * The hidden state lives in globals.css (`[data-reveal]`) and only applies when
 * scripting is on and the visitor has not asked for reduced motion.
 * Use it for below-the-fold content only; the hero uses plain CSS animations
 * so it never waits for hydration.
 */
export function Reveal({ as: Tag = "div", delay = 0, className, style, children, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = getObserver();
    if (!io) {
      el.setAttribute("data-revealed", "");
      return undefined;
    }
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={className}
      style={delay ? { ...style, "--reveal-delay": `${delay}ms` } : style}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Pointer handler for a grid of `.spotlight` cards: writes the cursor position
 * into the hovered card's --mx/--my, batched to one write per frame.
 */
export function useSpotlight() {
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return useCallback((event) => {
    const card = event.target.closest?.(".spotlight");
    if (!card) return;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${clientX - rect.left}px`);
      card.style.setProperty("--my", `${clientY - rect.top}px`);
    });
  }, []);
}

export default Reveal;
