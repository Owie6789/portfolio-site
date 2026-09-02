"use client";

/* Magnetic asterisk.
 *
 * Three behaviours, all on the asterisk itself rather than the whole panel:
 *   - magnetic pull: it leans toward the cursor while the cursor is inside its
 *     field, at a fraction of the cursor's offset so it never chases.
 *   - half spin on hover, springy unwind on leave.
 *   - nothing at all for touch pointers or reduced-motion users.
 *
 * Transform is written directly on the element instead of through a CSS
 * variable, because a variable on a parent recalculates styles for every
 * child. During tracking the transition is short so motion stays glued to the
 * pointer; on release it switches to the long spring so it overshoots home.
 */

import { useCallback, useRef } from "react";

const PULL = 0.32; // fraction of cursor offset the asterisk travels
const MAX = 22; // px, cap so it never detaches from its corner
const TRACK = "transform 160ms cubic-bezier(0.22, 1, 0.36, 1)";
const SPRING = "transform 620ms cubic-bezier(0.34, 1.56, 0.64, 1)";

type Props = {
  path: string;
  className: string;
  fieldClassName: string;
};

export default function FooterAsterisk({ path, className, fieldClassName }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const spun = useRef(false);

  const reduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const apply = (x: number, y: number, deg: number, transition: string) => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = transition;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${deg}deg)`;
  };

  const onMove = useCallback((e: React.PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType === "touch" || reduced()) return;
    const field = e.currentTarget.getBoundingClientRect();
    const cx = field.left + field.width / 2;
    const cy = field.top + field.height / 2;
    const dx = Math.max(-MAX, Math.min(MAX, (e.clientX - cx) * PULL));
    const dy = Math.max(-MAX, Math.min(MAX, (e.clientY - cy) * PULL));
    apply(dx, dy, spun.current ? 180 : 0, TRACK);
  }, []);

  const onEnter = useCallback((e: React.PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType === "touch" || reduced()) return;
    spun.current = true;
    apply(0, 0, 180, SPRING);
  }, []);

  const onLeave = useCallback(() => {
    spun.current = false;
    apply(0, 0, 0, SPRING);
  }, []);

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
