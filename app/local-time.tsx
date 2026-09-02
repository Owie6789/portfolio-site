"use client";

/* Local time in the .timestamp element.
 *
 * The original bundle hardcodes IST: it captures `.timestamp` once, adds 330
 * minutes to UTC, and rewrites innerHTML on every animation frame. Writing WAT
 * into the same node would just lose a race sixty times a second, and the
 * bundle is a verbatim copy so the 330 cannot be edited.
 *
 * Instead the node is handed over. Once the bundle has written to it at least
 * once, proving it has already captured its reference, the element is swapped
 * for a clone. The bundle keeps updating the original, now detached and
 * invisible, and this owns the copy that is actually on the page.
 *
 * The handover waits for that first write rather than firing on a timer,
 * because next/script loads the bundle after hydration and the order is not
 * guaranteed. If nothing writes within two seconds, the bundle failed to load
 * and this takes over anyway.
 */

import { useEffect } from "react";

const ZONE = "Africa/Lagos"; // WAT, no DST

const now = () =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date())
    .toLowerCase()
    .replace(/\s/g, " ");

export default function LocalTime() {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".timestamp");
    if (!el) return;

    let timer = 0;
    let observer: MutationObserver | undefined;
    let done = false;

    const takeOver = () => {
      if (done) return;
      done = true;
      observer?.disconnect();
      window.clearTimeout(fallback);

      // Detach the node the bundle is holding; keep a live twin in its place.
      const mine = el.cloneNode(false) as HTMLElement;
      el.replaceWith(mine);

      const tick = () => {
        mine.textContent = now();
      };
      tick();
      timer = window.setInterval(tick, 1000);
    };

    observer = new MutationObserver(takeOver);
    observer.observe(el, { childList: true, characterData: true, subtree: true });
    const fallback = window.setTimeout(takeOver, 2000);

    return () => {
      observer?.disconnect();
      window.clearTimeout(fallback);
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
