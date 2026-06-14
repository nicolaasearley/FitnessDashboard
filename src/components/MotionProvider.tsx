"use client";

import { useEffect } from "react";

/**
 * Wires scroll-reveal for any element carrying the `.reveal` class.
 *
 * The document is marked `reveal-ready` before paint (see layout) only when
 * motion is allowed, so content is visible by default with no JS or reduced
 * motion. This observer simply promotes elements to `is-visible` as they enter
 * the viewport, with a safety sweep so nothing can stay hidden (important for
 * headless capture and tall viewports).
 */
export function MotionProvider() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("reveal-ready")) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (els.length === 0) return;

    const reveal = (el: Element) => el.classList.add("is-visible");

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            obs.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.01 },
    );

    els.forEach((el) => io.observe(el));

    // Safety: nothing remains hidden after this, regardless of scroll state.
    const safety = window.setTimeout(() => els.forEach(reveal), 1600);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return null;
}
