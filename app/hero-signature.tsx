"use client";

/* Mounts the signature into the hero, over the wordmark.
 *
 * The hero belongs to the generated page, so rather than inject markup into it
 * from the converter, the overlay is portalled into .logomark at runtime. That
 * keeps the ported DOM untouched: verify still sees the original tree, and
 * nothing here depends on the generator.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Signature from "./signature";

export default function HeroSignature() {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const mark = document.querySelector<HTMLElement>(".logomark");
    if (!mark) return;

    const slot = document.createElement("div");
    slot.className = "hero-signature";
    mark.appendChild(slot);
    setHost(slot);

    return () => {
      slot.remove();
    };
  }, []);

  return host ? createPortal(<Signature />, host) : null;
}
