"use client";

/* The hero wordmark thins as the page scrolls.
 *
 * The mark ships as outlines so it paints immediately with no font request.
 * Outlines cannot change weight, so this swaps in live text set on a variable
 * cut of Inter (1.7 KB, four glyphs, weight axis intact) once that font is
 * ready, then drives 'wght' from scroll position. If the font never arrives,
 * or the visitor asked for reduced motion, the outlines simply stay.
 *
 * The advance is pinned with textLength, so thinning changes stroke weight
 * without the mark changing width. Weight is eased toward its target each
 * frame rather than written raw, which keeps a flicked scroll smooth and
 * reverses naturally on the way back up. Work happens in one rAF, and the
 * scroll listener is passive.
 */

import { useEffect } from "react";

const HEAVY = 700;
const THIN = 100;
const EASE = 0.12; // per-frame approach to the target weight
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function WordmarkWeight() {
  useEffect(() => {
    const mark = document.querySelector<SVGSVGElement>(".logomark svg");
    const text = mark?.querySelector<SVGTextElement>(".wordmark-live");
    if (!mark || !text) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let current = HEAVY;
    let target = HEAVY;
    let live = false;

    const measure = () => {
      const r = mark.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 while the mark sits at the bottom of the viewport, 1 once it has
      // scrolled off the top.
      target = HEAVY + (THIN - HEAVY) * clamp01((vh - r.bottom) / vh);
    };

    const tick = () => {
      current += (target - current) * EASE;
      text.style.fontVariationSettings = `"wght" ${current.toFixed(1)}`;
      if (Math.abs(target - current) > 0.5) {
        frame = requestAnimationFrame(tick);
      } else {
        text.style.fontVariationSettings = `"wght" ${target.toFixed(1)}`;
        frame = 0;
      }
    };

    const onScroll = () => {
      if (!live) return;
      measure();
      if (!frame) frame = requestAnimationFrame(tick);
    };

    let cancelled = false;
    document.fonts
      .load('700 100px "Inter Wordmark"')
      .then(() => {
        if (cancelled) return;
        live = true;
        mark.classList.add("is-live");
        measure();
        current = target;
        tick();
      })
      .catch(() => {
        /* keep the outlines */
      });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
