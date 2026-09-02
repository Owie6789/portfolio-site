"use client";

/* Signature that writes itself as the footer comes into view.
 *
 * The word is outlines from Ms Madi, so nothing is fetched at runtime. It is
 * revealed through a mask: a single thick stroke running the length of the
 * word, its dash offset tied to scroll. As the stroke draws, it uncovers the
 * letters in writing order, which reads as handwriting rather than a wipe.
 * Scrolling back up runs it in reverse, because the offset is derived from
 * position rather than accumulated.
 *
 * mix-blend-mode: difference paints it as the inverse of whatever it crosses,
 * so it comes out black over the moon panel and white over the ink checker
 * with no second colour anywhere.
 *
 * Path length is measured from the DOM rather than guessed, the value eases
 * toward its target so a flicked scroll stays smooth, the loop sleeps when it
 * arrives, and reduced motion leaves the signature fully drawn.
 */

import { useEffect, useId, useRef } from "react";
import data from "./signature-path.json";

const EASE = 0.1;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function Signature({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const maskId = `sig-${id}`;
  const wrap = useRef<HTMLDivElement>(null);
  const pen = useRef<SVGPathElement>(null);

  useEffect(() => {
    const box = wrap.current;
    const stroke = pen.current;
    if (!box || !stroke) return;

    const length = stroke.getTotalLength();
    stroke.style.strokeDasharray = `${length}`;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stroke.style.strokeDashoffset = "0";
      return;
    }

    let frame = 0;
    let current = 0; // 0 = undrawn, 1 = fully written
    let target = 0;

    const measure = () => {
      const r = box.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Starts as the block clears the bottom of the viewport, finishes once
      // it has travelled two thirds of the way up.
      target = clamp01((vh - r.top) / (vh * 0.66));
    };

    const paint = (t: number) => {
      stroke.style.strokeDashoffset = `${length * (1 - t)}`;
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
    <div className={className} ref={wrap} aria-hidden="true">
      <svg viewBox={data.viewBox} role="presentation">
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <path
              ref={pen}
              d={data.pen}
              fill="none"
              stroke="#fff"
              strokeWidth={data.penWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </mask>
        </defs>
        <g mask={`url(#${maskId})`}>
          {data.paths.map((d, i) => (
            <path key={i} d={d} fill="#fff" />
          ))}
        </g>
      </svg>
    </div>
  );
}
