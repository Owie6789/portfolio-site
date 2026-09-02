/* Footer: moon-white panel with a stamp-edge checker and a fitted headline.
 *
 * The only part of the page that is not a verbatim port. The generator swaps
 * the original <footer> for this, and drops the <hr> that sat directly above
 * it. The original markup is preserved at
 * tools/generated-footer-original.jsx.txt. All original content is carried
 * over, including the Cloudflare email markup byte-for-byte.
 *
 * The headline mixes two faces on one line: "Let’s" in Geist SemiBold and
 * "talk" in Instrument Sans pinned to its narrowest width. It is drawn as SVG
 * whose viewBox is assembled from each word's real ink bounds, measured by
 * tools/measure-headline.py and recorded in app/headline-metrics.json, so the
 * line fills the panel exactly at any viewport and neither word is stretched.
 */
import FooterAsterisk from "./footer-asterisk";
import styles from "./footer.module.css";

// Ink bounds in font units (upm 1000), from app/headline-metrics.json.
const GEIST = { text: "Let’s", x0: 80, x1: 2350, yTop: 710, yBottom: -12 };
const COND = { text: "talk", x0: 10, x1: 1386, yTop: 720, yBottom: -10 };

const LETTER = 34; // tracking inside each word
const GAP = 190; // space between the two words

const track = (w: { text: string; x0: number; x1: number }) =>
  w.x1 - w.x0 + LETTER * (w.text.length - 1);

const W1 = track(GEIST);
const W2 = track(COND);
const BOX = {
  w: W1 + GAP + W2,
  h: Math.max(GEIST.yTop, COND.yTop) - Math.min(GEIST.yBottom, COND.yBottom),
};
const BASELINE = Math.max(GEIST.yTop, COND.yTop);

// The condensed face's own asterisk outline, so the shape matches "talk" and
// rotation happens around the true centre of the ink.
const ASTERISK =
  "M144 410 170 518 89 441 30 544 137 575 30 606 89 709 170 632 144 740H262L236 632L317 709L376 606L269 575L376 544L317 441L236 518L262 410Z";

const SOCIALS = [
  { label: "X", href: "https://twitter.com/nitishkmrk" },
  { label: "Behance", href: "https://www.behance.net/nitishkmrk" },
  { label: "Dribbble", href: "https://dribbble.com/nitishkmrk/" },
  { label: "Medium", href: "https://medium.com/@nitishkmrk" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/nitishkmrk/" },
  { label: "Instagram", href: "https://www.instagram.com/nitishkmrk/" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.panel}>
        {/* Stamp edge: solid band, then square teeth biting into the panel. */}
        <div className={styles.edge} aria-hidden="true">
          <span className={styles.edgeBand} />
          <span className={styles.edgeTeeth} />
        </div>

        <div className={styles.body}>
          <div className={styles.top}>
            <FooterAsterisk
              path={ASTERISK}
              className={styles.asterisk}
              fieldClassName={styles.asteriskField}
            />
          </div>

          <h2 className={styles.headline}>
            <svg
              viewBox={`0 0 ${BOX.w} ${BOX.h}`}
              role="img"
              aria-label={`${GEIST.text} ${COND.text}`}
            >
              <text
                className={styles.wordGeist}
                x={-GEIST.x0}
                y={BASELINE}
                fontSize={1000}
                letterSpacing={LETTER}
              >
                {GEIST.text}
              </text>
              <text
                className={styles.wordCond}
                x={W1 + GAP - COND.x0}
                y={BASELINE}
                fontSize={1000}
                letterSpacing={LETTER}
              >
                {COND.text}
              </text>
            </svg>
          </h2>

          <div className={styles.meta}>
            <div className={styles.metaLeft}>
              <a
                className={styles.email}
                href="https://khagwal.com/cdn-cgi/l/email-protection#f69e938fb69d9e979181979ad895999b"
                target="_blank"
                rel="noopenner"
              >
                <span
                  className="__cf_email__"
                  data-cfemail="95fdf0ecd5fefdf4f2e2f4f9bbf6faf8"
                >
                  [email&#160;protected]
                </span>
              </a>
              <p className={styles.copy}>© 2025 Nitish Khagwal</p>
            </div>

            <ul className={styles.links}>
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopenner">
                    <span className={styles.linkLabel}>{s.label}</span>
                    <span className={styles.arrow} aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
