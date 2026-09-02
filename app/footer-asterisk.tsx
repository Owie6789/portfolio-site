"use client";

/* Magnetic asterisk.
 *
 * Driven by a spring integrated on every frame, not by CSS transitions. A
 * transition restarts from zero each time the pointer moves, which is what
 * made the earlier version stutter. A spring carries its velocity across
 * interruptions, so redirecting mid-motion stays continuous, and the same
 * integrator handles the pull, the release and the half spin.
 *
 * The loop only runs while something is moving. Transform is written straight
 * onto the element, since a CSS variable on the parent would recalculate
 * styles for every child on every frame.
 */

import { useCallback, useEffect, useRef } from "react";

const PULL = 0.34; // fraction of the cursor's offset the glyph travels
const MAX = 26; // px cap, so it never leaves its corner
const STIFF = 170;
const DAMP = 16;
const SPIN_STIFF = 120;
const SPIN_DAMP = 14;
const REST = 0.05;

type Axis = { value: number; target: number; velocity: number };

const axis = (): Axis => ({ value: 0, target: 0, velocity: 0 });

function step(a: Axis, dt: number, stiffness: number, damping: number) {
  const accel = (a.target - a.value) * stiffness - a.velocity * damping;
  a.velocity += accel * dt;
  a.value += a.velocity * dt;
  return Math.abs(a.target - a.value) > REST || Math.abs(a.velocity) > REST;
}

type Props = {
  path: string;
  className: string;
  fieldClassName: string;
};

export default function FooterAsterisk({ path, className, fieldClassName }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const x = useRef(axis());
  const y = useRef(axis());
  const spin = useRef(axis());
  const frame = useRef(0);
  const last = useRef(0);

  const tick = useCallback((now: number) => {
    const dt = Math.min((now - (last.current || now)) / 1000, 1 / 30);
    last.current = now;

    const moving =
      [step(x.current, dt, STIFF, DAMP), step(y.current, dt, STIFF, DAMP), step(spin.current, dt, SPIN_STIFF, SPIN_DAMP)].some(
        Boolean
      );

    const el = ref.current;
    if (el) {
      el.style.transform = `translate3d(${x.current.value.toFixed(2)}px, ${y.current.value.toFixed(2)}px, 0) rotate(${spin.current.value.toFixed(2)}deg)`;
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
      spin.current.target = 180;
      wake();
    },
    [wake]
  );

  const onLeave = useCallback(() => {
    x.current.target = 0;
    y.current.target = 0;
    spin.current.target = 0;
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
      <svg ref={ref} className={className} viewBox="0 0 346 330">
        <path d={path} transform="translate(-30, 740) scale(1, -1)" />
      </svg>
    </span>
  );
}
