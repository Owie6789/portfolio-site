"use client";

/* The hero wordmark thins as the page scrolls, and thickens on the way back.
 *
 * The mark is four SVG outlines. An outline has no weight axis, so the two
 * ends of the animation are shipped as two outline sets, weight 700 in `d` and
 * weight 100 in `data-thin`. Both are instances of the same variable font, so
 * their point structure is identical and blending them is a number-for-number
 * interpolation. That deliberately avoids loading a font at runtime: an
 * earlier version swapped in live text on a variable cut and depended on
 * document.fonts resolving, which is one more thing to fail.
 *
 * Each path is parsed once into static string chunks and two number arrays, so
 * a frame is arithmetic and a join, no regex. Weight eases toward its target
 * rather than tracking raw scroll, which keeps a flicked scroll smooth. The
 * loop stops when it arrives, the scroll listener is passive, and reduced
 * motion leaves the heavy outlines alone.
 */

import { useEffect } from "react";

const EASE = 0.12;
const NUM = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type Letter = {
  el: SVGPathElement;
  chunks: string[]; // literal text between the numbers
  heavy: number[];
  thin: number[];
};

function parse(el: SVGPathElement): Letter | null {
  const heavyD = el.getAttribute("d");
  const thinD = el.getAttribute("data-thin");
  if (!heavyD || !thinD) return null;

  const chunks: string[] = [];
  const heavy: number[] = [];
  let last = 0;
  for (const m of heavyD.matchAll(NUM)) {
    chunks.push(heavyD.slice(last, m.index));
    heavy.push(parseFloat(m[0]));
    last = m.index + m[0].length;
  }
  chunks.push(heavyD.slice(last));

  const thin = Array.from(thinD.matchAll(NUM), (m) => parseFloat(m[0]));
  if (thin.length !== heavy.length) return null; // structures diverged

  return { el, chunks, heavy, thin };
}

export default function WordmarkWeight() {
  useEffect(() => {
    const mark = document.querySelector<SVGSVGElement>(".logomark svg");
    if (!mark) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const letters = Array.from(
      mark.querySelectorAll<SVGPathElement>(".wordmark-letter")
    )
      .map(parse)
      .filter((l): l is Letter => l !== null);
    if (!letters.length) return;

    let frame = 0;
    let current = 0; // 0 = heavy, 1 = thin
    let target = 0;

    const paint = (t: number) => {
      for (const { el, chunks, heavy, thin } of letters) {
        let d = "";
        for (let i = 0; i < heavy.length; i++) {
          d += chunks[i] + (heavy[i] + (thin[i] - heavy[i]) * t).toFixed(2);
        }
        el.setAttribute("d", d + chunks[chunks.length - 1]);
      }
    };

    const measure = () => {
      const r = mark.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 while the mark sits at the bottom of the viewport, 1 once it has
      // scrolled off the top.
      target = clamp01((vh - r.bottom) / vh);
    };

    const tick = () => {
      current += (target - current) * EASE;
      const done = Math.abs(target - current) < 0.002;
      if (done) current = target;
      paint(current);
      frame = done ? 0 : requestAnimationFrame(tick);
    };

    const onScroll = () => {
      measure();
      if (!frame) frame = requestAnimationFrame(tick);
    };

    measure();
    current = target;
    paint(current);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
