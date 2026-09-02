"use client";

/* Link label that shuffles into place on hover.
 *
 * Each character locks in from the left over the duration while the ones after
 * it keep cycling through a glyph pool, so "About" resolves rather than fades.
 * The animation is purely visual: the anchor carries the real label in
 * aria-label, and the shuffling span is hidden from assistive tech, so nothing
 * reads a stream of nonsense.
 *
 * Skipped entirely for touch pointers and reduced-motion users.
 */

import { useCallback, useEffect, useRef, useState } from "react";

const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DURATION = 420; // ms for the whole word to settle
const FRAME = 45; // ms between glyph swaps, slow enough to read as shuffling

export default function FooterShuffle({ label }: { label: string }) {
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
      setText(
        label
          .split("")
          .map((ch, i) => {
            if (i < settled || ch === " ") return ch;
            const roll = POOL[Math.floor(Math.random() * POOL.length)];
            return ch === ch.toLowerCase() ? roll.toLowerCase() : roll;
          })
          .join("")
      );
    }, FRAME);
  }, [label, stop]);

  return (
    <span
      aria-hidden="true"
      onPointerEnter={(e) => e.pointerType !== "touch" && run()}
      onFocus={run}
    >
      {text}
    </span>
  );
}
