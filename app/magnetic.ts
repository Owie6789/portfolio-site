"use client";

/* Magnetic pointer attraction, shared by the asterisk and the email link.
 *
 * A spring integrated per frame, not a CSS transition: a transition restarts
 * from zero on every pointermove, which reads as stutter, while a spring
 * carries its velocity across interruptions.
 *
 * Two regimes. While the pointer is inside the element it is soft and slow, so
 * the target drifts after the cursor. On release it stiffens to roughly
 * critical damping (damping ≈ 2·√stiffness) so a quick in-and-out settles
 * straight home instead of wobbling around it.
 *
 * The loop sleeps when everything is at rest. Transform is written directly on
 * the node, since a CSS variable on a parent would recalculate styles for
 * every child on every frame.
 */

import { useCallback, useEffect, useRef } from "react";

const TRACK_STIFF = 62;
const TRACK_DAMP = 16;
const RETURN_STIFF = 130;
const RETURN_DAMP = 23;
const SCALE_STIFF = 200;
const SCALE_DAMP = 28;
const REST = 0.05;

type Axis = { value: number; target: number; velocity: number };
const axis = (start = 0): Axis => ({ value: start, target: start, velocity: 0 });

function step(a: Axis, dt: number, stiffness: number, damping: number) {
  a.velocity += ((a.target - a.value) * stiffness - a.velocity * damping) * dt;
  a.value += a.velocity * dt;
  return Math.abs(a.target - a.value) > REST || Math.abs(a.velocity) > REST;
}

export function useMagnetic<T extends HTMLElement | SVGElement>({
  pull = 0.26,
  max = 40,
  hoverScale = 1,
}: { pull?: number; max?: number; hoverScale?: number } = {}) {
  const ref = useRef<T>(null);
  const x = useRef(axis());
  const y = useRef(axis());
  const scale = useRef(axis(1));
  const homing = useRef(false);
  const frame = useRef(0);
  const last = useRef(0);

  const tick = useCallback((now: number) => {
    const dt = Math.min((now - (last.current || now)) / 1000, 1 / 30);
    last.current = now;

    const stiff = homing.current ? RETURN_STIFF : TRACK_STIFF;
    const damp = homing.current ? RETURN_DAMP : TRACK_DAMP;
    const moving = [
      step(x.current, dt, stiff, damp),
      step(y.current, dt, stiff, damp),
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

  const onPointerEnter = useCallback(
    (e: React.PointerEvent) => {
      if (inert(e)) return;
      scale.current.target = hoverScale;
      wake();
    },
    [hoverScale, wake]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (inert(e)) return;
      const r = e.currentTarget.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * pull;
      const dy = (e.clientY - (r.top + r.height / 2)) * pull;
      homing.current = false;
      x.current.target = Math.max(-max, Math.min(max, dx));
      y.current.target = Math.max(-max, Math.min(max, dy));
      wake();
    },
    [max, pull, wake]
  );

  const onPointerLeave = useCallback(() => {
    homing.current = true;
    x.current.target = 0;
    y.current.target = 0;
    scale.current.target = 1;
    wake();
  }, [wake]);

  return { ref, handlers: { onPointerEnter, onPointerMove, onPointerLeave } };
}
