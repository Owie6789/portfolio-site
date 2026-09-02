"use client";

/* Copyright year.
 *
 * The page is statically prerendered, so a year rendered on the server freezes
 * at build time. This re-reads the clock after mount, which keeps it correct
 * on a build that outlives new year's eve. suppressHydrationWarning because
 * the two can legitimately differ by exactly that.
 */

import { useEffect, useState } from "react";

export default function FooterYear({ initial }: { initial: number }) {
  const [year, setYear] = useState(initial);

  useEffect(() => {
    const now = new Date().getFullYear();
    if (now !== initial) setYear(now);
  }, [initial]);

  return <span suppressHydrationWarning>{year}</span>;
}
