"use client";

/* Smooth scrolling.
 *
 * Why not GSAP's own ScrollSmoother: it is a Club GreenSock plugin, not part
 * of the free distribution, and it is not in the site's bundled
 * dist/main.js@v1.0.2. That bundle also keeps gsap and ScrollTrigger private,
 * nothing is exposed on window, so a smoother could not be handed the same
 * gsap instance even if the file were available.
 *
 * Lenis is used instead. It drives the real window scroll position rather than
 * transforming a wrapper, which matters here: every ScrollTrigger in the
 * original bundle keeps reading scroll the way it always did, so the existing
 * pinning and scrubbed animations carry on working untouched.
 *
 * Native scrolling is left alone for touch and for anyone who asks for reduced
 * motion.
 */

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      // easeOutExpo: fast off the wheel, long settle, no bounce at the end.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
      autoRaf: false,
    });

    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
