/* Paste this into the browser console on the running site.
 *
 * It reports every grey block on the page: the 14 lazy-load skeletons and the
 * decorative squares, with their live position, so a misplaced one can be
 * identified by name instead of by guesswork.
 */
(() => {
  const rows = [];

  document.querySelectorAll("picture").forEach((p) => {
    const img = p.querySelector("img");
    const r = p.getBoundingClientRect();
    rows.push({
      what: "skeleton placeholder",
      el: p.className || "picture",
      file: (img?.getAttribute("data-src") || img?.getAttribute("src") || "").split("/").pop(),
      loaded: !!img?.complete && img.naturalWidth > 0,
      stillSkeleton: p.classList.contains("skeleton"),
      x: Math.round(r.x + scrollX),
      y: Math.round(r.y + scrollY),
      w: Math.round(r.width),
      h: Math.round(r.height),
    });
  });

  const decor = [
    [".sticky-grd .sticky", "grey square beside the portrait"],
    [".sticky-arrow .sticky", "grey square behind the ↓ arrow"],
    [".grd-cut span", "footer sparkle (grey square is its ::before)"],
    [".grd-fold-h h2", "Certifications heading (grey square is its ::before)"],
    [".magic-a", "sparkle — hero"],
    [".magic-b", "sparkle — beside portrait"],
    [".magic-c", "sparkle — threads"],
    [".magic-d", "sparkle — certifications"],
    [".magic-e", "sparkle — footer email"],
  ];

  decor.forEach(([sel, what]) => {
    document.querySelectorAll(sel).forEach((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      rows.push({
        what,
        el: sel,
        transform: cs.transform === "none" ? "NONE  <-- containing block lost" : "ok",
        x: Math.round(r.x + scrollX),
        y: Math.round(r.y + scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    });
  });

  console.table(rows);

  const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0);
  console.log(`broken images: ${broken.length}`);
  console.log(
    "email decoded:",
    !document.body.textContent.includes("[email"),
    "| GSAP loaded:",
    typeof window.gsap !== "undefined" || !!document.querySelector('[style*="translate"]')
  );
})();
