"use client";

/* Signature that draws itself letter by letter as the page scrolls.
 *
 * Set in Graflo Italic, the user's own face, converted to outlines by
 * tools/make-signature.py so nothing is fetched at runtime.
 *
 * Set as a lowercase e leading a run of small caps. The e is scaled so its ink
 * matches cap height, and spacing is set from ink rather than advances, so the
 * clear space between every pair of letters is identical. Both are done in the
 * generator rather than faked with CSS.
 *
 * Each letter is stroked with its own dash offset and they run in sequence
 * across the scroll range, so the word is drawn continuously left to right.
 * The whole word also scales up as it writes, opening against the wordmark
 * behind it, which is shrinking over the same range.
 * The fill of each letter comes up as that letter finishes, which is what
 * makes it read as ink landing rather than a shape appearing. Scrolling back
 * up unwrites it, because progress is derived from scroll position rather than
 * accumulated.
 *
 * Progress is measured from scrollY, not from the element's box, so at the top
 * of the page it is exactly zero and nothing has been drawn. It only starts
 * once the page actually moves.
 *
 * mix-blend-mode: difference is applied by the wrapper, so the ink carries no
 * colour of its own and inverts against whatever it crosses.
 */

import { useEffect, useRef } from "react";
import data from "./signature-graflo.json";

const EASE = 0.12;
const RANGE = 0.7; // fraction of a viewport of scrolling to write the word
const OVERLAP = 0.35; // how much each letter's stroke overlaps the next
const SCALE_FROM = 0.86;
const SCALE_TO = 1.14;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function Signature({ className }: { className?: string }) {
  const group = useRef<SVGGElement>(null);
  const strokes = useRef<(SVGPathElement | null)[]>([]);
  const fills = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const strokeEls = strokes.current.filter(Boolean) as SVGPathElement[];
    const fillEls = fills.current.filter(Boolean) as SVGPathElement[];
    if (!strokeEls.length) return;

    const lengths = strokeEls.map((el) => el.getTotalLength());
    strokeEls.forEach((el, i) => {
      el.style.strokeDasharray = `${lengths[i]}`;
      el.style.strokeDashoffset = `${lengths[i]}`;
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      strokeEls.forEach((el) => (el.style.strokeDashoffset = "0"));
      fillEls.forEach((el) => (el.style.opacity = "1"));
      if (group.current) group.current.style.transform = `scale(${SCALE_TO})`;
      return;
    }

    let frame = 0;
    let current = 0;
    let target = 0;

    // Letter i occupies its own slice of the range, with a little overlap so
    // the pen never appears to stop between letters.
    const n = strokeEls.length;
    const span = 1 / (n - (n - 1) * OVERLAP);
    const startOf = (i: number) => i * span * (1 - OVERLAP);

    const paint = (p: number) => {
      for (let i = 0; i < n; i++) {
        const local = clamp01((p - startOf(i)) / span);
        strokeEls[i].style.strokeDashoffset = `${lengths[i] * (1 - local)}`;
        const fill = fillEls[i];
        if (fill) fill.style.opacity = `${clamp01((local - 0.7) / 0.3)}`;
      }
      if (group.current) {
        const s = SCALE_FROM + (SCALE_TO - SCALE_FROM) * p;
        group.current.style.transform = `scale(${s.toFixed(4)})`;
      }
    };

    const measure = () => {
      const vh = window.innerHeight || 1;
      // From the top of the document: zero until the page moves.
      target = clamp01(window.scrollY / (vh * RANGE));
    };

    const tick = () => {
      current += (target - current) * EASE;
      const done = Math.abs(target - current) < 0.001;
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

  return (
    <div className={className} aria-hidden="true">
      <svg viewBox={data.viewBox} role="presentation">
        <g ref={group} className="signature-scale">
          {/* Fills sit under the strokes and come up as each letter lands. */}
          {data.paths.map((d, i) => (
            <path
              key={`fill-${i}`}
              ref={(el) => {
                fills.current[i] = el;
              }}
              d={d}
              fill="#fff"
              opacity={0}
            />
          ))}
          {data.paths.map((d, i) => (
            <path
              key={`stroke-${i}`}
              ref={(el) => {
                strokes.current[i] = el;
              }}
              d={d}
              fill="none"
              stroke="#fff"
              strokeWidth={data.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
