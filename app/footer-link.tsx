"use client";

/* Footer link whose label shuffles into place on hover.
 *
 * The handlers sit on the anchor, not on the inner span. That is what was
 * broken before: the anchor's ::before hit area is positioned, so it paints
 * over the label and takes every pointer event, and pointerenter never reached
 * the span underneath. Pseudo-elements belong to their host, so listening on
 * the anchor catches them.
 *
 * Characters lock in from the left while the rest keep cycling, so the word
 * resolves rather than fades. The cycling glyphs are the word's own remaining
 * letters reordered, never foreign ones, so it reads as the label reassembling
 * itself. Visual only: the anchor carries the real label in aria-label and the
 * animated span is hidden from assistive tech.
 */

import { useCallback, useEffect, useRef, useState } from "react";

const DURATION = 460; // ms for the whole word to settle
const FRAME = 45; // ms between glyph swaps, slow enough to read as shuffling

/* Fisher-Yates on a copy. */
function shuffled<T>(items: T[]) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function FooterLink({
  label,
  href,
  className,
  slotClassName,
  ghostClassName,
}: {
  label: string;
  href: string;
  className?: string;
  slotClassName?: string;
  ghostClassName?: string;
}) {
  const [text, setText] = useState(label);
  const timer = useRef(0);
  const start = useRef(0);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = 0;
    }
    setText(label);
  }, [label]);

  useEffect(() => stop, [stop]);

  const run = useCallback(() => {
    if (
      timer.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    start.current = performance.now();
    timer.current = window.setInterval(() => {
      const progress = (performance.now() - start.current) / DURATION;
      if (progress >= 1) {
        stop();
        return;
      }
      const settled = Math.floor(progress * label.length);
      const locked = label.slice(0, settled);
      const rest = shuffled(label.slice(settled).split(""));
      setText(locked + rest.join(""));
    }, FRAME);
  }, [label, stop]);

  return (
    <a
      className={className}
      href={href}
      aria-label={label}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") run();
      }}
      onFocus={run}
      onPointerLeave={stop}
      onBlur={stop}
    >
      {/* The real label sizes the box, hidden but laid out; the shuffling copy
          sits on top of it. Same width throughout, so neither the row nor the
          underline moves while glyphs swap. */}
      <span className={slotClassName} aria-hidden="true">
        <span className={ghostClassName}>{label}</span>
        <span>{text}</span>
      </span>
    </a>
  );
}
