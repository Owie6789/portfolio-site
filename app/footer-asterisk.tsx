"use client";

/* Magnetic asterisk with a windmill loop.
 *
 * Two transforms on two elements, deliberately. The outer span carries the
 * magnetic translate, written per frame by a spring in JS. The inner svg
 * carries the endless rotation, a plain CSS animation so it runs off the main
 * thread and never fights the spring for the same transform property.
 *
 * The spring is integrated per frame rather than run through a CSS transition,
 * because a transition restarts from zero on every pointermove, which reads as
 * stutter. A spring carries its velocity across interruptions.
 */

import { useCallback, useEffect, useRef } from "react";

const PULL = 0.34; // fraction of the cursor's offset the glyph travels
const MAX = 26; // px cap, so it never leaves its corner
const STIFF = 62; // position: low and slow, so it drifts toward the cursor
const DAMP = 13;
const SCALE_STIFF = 170; // the hover swell stays quick
const SCALE_DAMP = 16;
const REST = 0.05;

type Axis = { value: number; target: number; velocity: number };

const axis = (start = 0): Axis => ({ value: start, target: start, velocity: 0 });

function step(a: Axis, dt: number, stiffness: number, damping: number) {
  const accel = (a.target - a.value) * stiffness - a.velocity * damping;
  a.velocity += accel * dt;
  a.value += a.velocity * dt;
  return Math.abs(a.target - a.value) > REST || Math.abs(a.velocity) > REST;
}

type Props = {
  path: string;
  className: string;
  magnetClassName: string;
  fieldClassName: string;
};

export default function FooterAsterisk({
  path,
  className,
  magnetClassName,
  fieldClassName,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useRef(axis());
  const y = useRef(axis());
  const scale = useRef(axis(1));
  const frame = useRef(0);
  const last = useRef(0);

  const tick = useCallback((now: number) => {
    const dt = Math.min((now - (last.current || now)) / 1000, 1 / 30);
    last.current = now;

    const moving = [
      step(x.current, dt, STIFF, DAMP),
      step(y.current, dt, STIFF, DAMP),
      step(scale.current, dt, SCALE_STIFF, SCALE_DAMP),
    ].some(Boolean);

    const el = ref.current;
    if (el) {
      el.style.transform = `translate3d(${x.current.value.toFixed(2)}px, ${y.current.value.toFixed(2)}px, 0) scale(${scale.current.value.toFixed(3)})`;
    }

    if (moving) {
      frame.current = requestAnimationFrame(tick);
    } else {
      frame.current = 0;
      last.current = 0;
    }
  }, []);

  const wake = useCallback(() => {
    if (!frame.current) {
      last.current = 0;
      frame.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const inert = (e: React.PointerEvent) =>
    e.pointerType === "touch" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLSpanElement>) => {
      if (inert(e)) return;
      const r = e.currentTarget.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * PULL;
      const dy = (e.clientY - (r.top + r.height / 2)) * PULL;
      x.current.target = Math.max(-MAX, Math.min(MAX, dx));
      y.current.target = Math.max(-MAX, Math.min(MAX, dy));
      wake();
    },
    [wake]
  );

  const onEnter = useCallback(
    (e: React.PointerEvent<HTMLSpanElement>) => {
      if (inert(e)) return;
      scale.current.target = 1.12;
      wake();
    },
    [wake]
  );

  const onLeave = useCallback(() => {
    x.current.target = 0;
    y.current.target = 0;
    scale.current.target = 1;
    wake();
  }, [wake]);

  return (
    <span
      className={fieldClassName}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden="true"
    >
      <span className={magnetClassName} ref={ref}>
        {/* Padded box: the outline touches 0 and 80 on every side, so a
            tight viewBox clips the tips as it turns. */}
        <svg className={className} viewBox="-8 -8 96 96">
          <path d={path} />
        </svg>
      </span>
    </span>
  );
}
