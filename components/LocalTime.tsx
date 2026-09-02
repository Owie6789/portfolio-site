"use client";

import { useEffect, useState } from "react";

export default function LocalTime({
  timezone,
  label,
}: {
  timezone: string;
  label: string;
}) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: timezone,
        }).format(new Date())
      );
    tick();
    const id = setInterval(tick, 1000 * 20);
    return () => clearInterval(id);
  }, [timezone]);

  return (
    <span suppressHydrationWarning>
      {label} {time ?? "--:--"}
    </span>
  );
}
