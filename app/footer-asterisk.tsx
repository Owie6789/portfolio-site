"use client";

/* Magnetic asterisk with a windmill loop.
 *
 * Two transforms on two elements, deliberately. The outer span carries the
 * magnetic translate written per frame by the spring in ./magnetic; the inner
 * svg carries the endless rotation as a plain CSS animation, so it runs off
 * the main thread and never fights the spring for the same property.
 */

import { useMagnetic } from "./magnetic";

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
  const { ref, handlers } = useMagnetic<HTMLSpanElement>({
    pull: 0.26,
    max: 40,
    hoverScale: 1.12,
  });

  return (
    <span className={fieldClassName} {...handlers} aria-hidden="true">
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
