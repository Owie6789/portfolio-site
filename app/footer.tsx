/* Footer: moon-white panel with a stamp-edge checker and a fitted headline.
 *
 * The only part of the page that is not a verbatim port. The generator swaps
 * the original <footer> for this, and drops the <hr> that sat directly above
 * it. The original markup is preserved at
 * tools/generated-footer-original.jsx.txt. All original content is carried
 * over, including the Cloudflare email markup byte-for-byte.
 *
 * The headline mixes two faces on one line: "Let’s" in Helvetica Now Display
 * Medium and "talk" in ITC Garamond Std Light Narrow, both from the user's
 * `footer fonts.zip` on main. It is drawn as SVG whose viewBox is assembled
 * from each word's real ink bounds, measured by tools/measure-headline.py and
 * recorded in app/headline-metrics.json, so the line fills the panel exactly
 * at any viewport.
 */
import FooterAsterisk from "./footer-asterisk";
import styles from "./footer.module.css";

// Ink bounds in font units (upm 1000), from app/headline-metrics.json.
const HELV = { text: "Let’s", x0: 62, x1: 2079, yTop: 712, yBottom: -13 };
const GARA = { text: "talk", x0: 17, x1: 1295, yTop: 707, yBottom: -12 };

/* Metrics follow the original's own numbers, in font units at upm 1000:
   letter-spacing -0.012em, and a word gap of the space advance (202) plus the
   0.046em the original adds with .word { padding-right }. */
const LETTER = -12;
const GAP = 202 + 46;
const SQUEEZE = 0.86; // horizontal condense applied to "talk"

/* "Let’s" is a touch bolder than the Medium it is set in. Only one weight was
   supplied, so the weight comes from a hairline stroke in the same colour,
   painted under the fill. 9 units at upm 1000 is roughly a third of a step. */
const BOLD = 9;
/* ...and nudged off the left edge. Negative moves it left. */
const SHIFT = 24;

const track = (w: { text: string; x0: number; x1: number }) =>
  w.x1 - w.x0 + LETTER * (w.text.length - 1);

const W1 = track(HELV) + BOLD + SHIFT;
const W2 = track(GARA) * SQUEEZE;
const BOX = {
  w: W1 + GAP + W2,
  h:
    Math.max(HELV.yTop + BOLD / 2, GARA.yTop) -
    Math.min(HELV.yBottom - BOLD / 2, GARA.yBottom),
};
const BASELINE = Math.max(HELV.yTop + BOLD / 2, GARA.yTop);
// The stroke grows the ink by half its width on every side, so the word starts
// half a stroke earlier than its outline bounds.
const HELV_X = -HELV.x0 + BOLD / 2 + SHIFT;
// Under scale(SQUEEZE, 1) the x coordinate is scaled too, so solve for the
// untransformed x that lands the ink exactly after the gap.
const GARA_X = (W1 + GAP) / SQUEEZE - GARA.x0;

// Asterisk supplied by the user, an 80x80 box.
const ASTERISK =
  "M0 32.2807C0 30.3314 0.792079 28.616 2.37624 27.1345C3.9604 25.653 5.88402 24.9123 8.1471 24.9123C11.4663 24.9123 15.4644 26.5887 20.1414 29.9415C24.6676 33.1384 30.4008 36.4133 37.3409 39.7661C36.8128 35.9454 36.0962 31.6959 35.1909 27.0175C34.2857 22.3392 33.8331 19.961 33.8331 19.883C32.777 14.269 32.2489 10.8382 32.2489 9.59064C32.2489 6.93957 32.9656 4.67836 34.3989 2.80702C35.9076 0.935673 37.8312 0 40.1697 0C42.4328 0 44.2433 0.935673 45.6011 2.80702C47.0344 4.67836 47.7511 6.93957 47.7511 9.59064C47.7511 10.6823 47.223 14.0351 46.1669 19.6491C44.7336 26.5107 43.5644 33.2164 42.6591 39.7661C50.1273 36.1014 55.9359 32.8265 60.0849 29.9415C64.7619 26.5887 68.6846 24.9123 71.8529 24.9123C74.116 24.9123 76.0396 25.653 77.6238 27.1345C79.2079 28.616 80 30.3314 80 32.2807C80 34.308 79.3588 36.0234 78.0764 37.4269C76.8694 38.8304 75.2475 39.8441 73.2107 40.4678C71.4757 40.9357 68.0811 41.4815 63.0269 42.1053C62.6497 42.1832 60.3112 42.4951 56.0113 43.0409C51.7115 43.5867 47.7133 44.1715 44.017 44.7953C50.1273 51.345 54.8421 56.1404 58.1612 59.1813C64.347 64.7953 67.4399 69.1618 67.4399 72.2807C67.4399 74.386 66.7987 76.2183 65.5163 77.7778C64.3093 79.2593 62.7251 80 60.7638 80C57.3692 80 54.8043 78.4795 53.0693 75.4386C51.9378 73.4893 50.0141 69.5517 47.2984 63.6257C44.5827 57.6998 42.1311 52.5536 39.9434 48.1871C37.9821 52.1637 35.6436 57.232 32.9279 63.3918C30.2876 69.4737 28.364 73.4893 27.157 75.4386C25.422 78.4795 22.8571 80 19.4625 80C17.4257 80 15.8039 79.3372 14.5969 78.0117C13.3899 76.6082 12.7864 74.8928 12.7864 72.8655C12.7864 70.9162 13.5031 68.9279 14.9364 66.9006C16.4451 64.7953 18.8213 62.2222 22.0651 59.1813C25.6106 55.9844 30.2499 51.1891 35.983 44.7953C28.8166 43.4698 22.4045 42.5731 16.7468 42.1053C10.7119 41.4035 7.24187 40.9357 6.33663 40.7018C4.45073 40.078 2.90429 39.0253 1.69731 37.5439C0.565771 36.0624 0 34.308 0 32.2807Z";

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
              magnetClassName={styles.asteriskMagnet}
              fieldClassName={styles.asteriskField}
            />
          </div>

          <h2 className={styles.headline}>
            <svg
              viewBox={`0 0 ${BOX.w} ${BOX.h}`}
              role="img"
              aria-label={`${HELV.text} ${GARA.text}`}
            >
              <text
                className={styles.wordHelv}
                x={HELV_X}
                y={BASELINE}
                fontSize={1000}
                letterSpacing={LETTER}
                strokeWidth={BOLD}
              >
                {HELV.text}
              </text>
              <text
                className={styles.wordGara}
                x={GARA_X}
                y={BASELINE}
                fontSize={1000}
                letterSpacing={LETTER}
                transform={`scale(${SQUEEZE}, 1)`}
              >
                {GARA.text}
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
