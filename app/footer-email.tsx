"use client";

/* The email address, with the same magnetic pull as the asterisk.
 *
 * Gentler numbers than the asterisk: this is a line of text sitting in a row
 * with other text, so it leans a few pixels rather than swinging.
 */

import { useMagnetic } from "./magnetic";

export default function FooterEmail({
  address,
  className,
}: {
  address: string;
  className?: string;
}) {
  const { ref, handlers } = useMagnetic<HTMLAnchorElement>({
    pull: 0.22,
    max: 10,
  });

  return (
    <a
      className={className}
      href={`mailto:${address}`}
      ref={ref}
      {...handlers}
    >
      {address}
    </a>
  );
}
