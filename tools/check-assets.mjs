// public/dist/ is excluded from the workspace snapshot layer, so those two
// files can vanish between sessions even though they are committed. Restore
// them from git before anything tries to serve or verify the site.
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

const REQUIRED = [
  "public/dist/main.css@v1.0.10.css",
  "public/dist/main.js@v1.0.2",
];

const missing = REQUIRED.filter((f) => !existsSync(f));
if (!missing.length) {
  console.log("assets ok");
  process.exit(0);
}

console.log(`restoring ${missing.length} missing asset(s) from git:`);
missing.forEach((f) => console.log(`  ${f}`));
execSync(`git checkout HEAD -- ${missing.map((f) => `'${f}'`).join(" ")}`, {
  stdio: "inherit",
});
const still = REQUIRED.filter((f) => !existsSync(f));
if (still.length) {
  console.error("could not restore:", still.join(", "));
  process.exit(1);
}
console.log("restored");
