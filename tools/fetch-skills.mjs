#!/usr/bin/env node
// Downloads skill directories verbatim from their source repos into skills/.
// Uses `gh api` (already authenticated) so no unauthenticated rate limits.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const TARGETS = [
  ["buildgreatproducts/builder-os", "design-better"],
  ["better-auth/better-icons", "better-icons"],
  ["neeeophytee/finding-unknowns-skills", "interview-me"],
  ["emilkowalski/skills", "emil-design-eng"],
  ["leonxlnx/taste-skill", "high-end-visual-design"],
  ["leonxlnx/taste-skill", "design-taste-frontend-v1"],
  ["addyosmani/agent-skills", "code-review-and-quality"],
  ["mattpocock/skills", "code-review"],
  ["mattpocock/skills", "implement"],
  ["mattpocock/skills", "grill-me"],
  ["2dmurali/review-loop-skill", "review-loop"],
  ["nextlevelbuilder/ui-ux-pro-max-skill", "ui-ux-pro-max"],
  ["vercel-labs/skills", "find-skills"],
  ["shadcn/improve", "improve"],
  ["affaan-m/ecc", "make-interfaces-feel-better"],
  ["google-labs-code/stitch-skills", "shadcn-ui"],
  ["jakubkrehel/skills", "better-ui"],
  ["pbakaus/impeccable", "*"], // whole set
];

const gh = (args) =>
  execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const treeCache = new Map();
function tree(repo) {
  if (!treeCache.has(repo)) {
    const out = gh(["api", `repos/${repo}/git/trees/HEAD?recursive=1`]);
    treeCache.set(repo, JSON.parse(out).tree ?? []);
  }
  return treeCache.get(repo);
}

function download(repo, path) {
  return gh([
    "api",
    `repos/${repo}/contents/${encodeURI(path)}`,
    "-H",
    "Accept: application/vnd.github.raw",
  ]);
}

const report = [];

for (const [repo, skill] of TARGETS) {
  let entries;
  try {
    entries = tree(repo);
  } catch (e) {
    report.push({ repo, skill, status: "REPO FETCH FAILED", files: 0 });
    continue;
  }

  // Find the directory that holds this skill's SKILL.md.
  const skillMds = entries.filter(
    (e) => e.type === "blob" && /(^|\/)SKILL\.md$/i.test(e.path)
  );

  let dirs;
  if (skill === "*") {
    dirs = skillMds.map((e) => dirname(e.path));
  } else {
    dirs = skillMds
      .map((e) => dirname(e.path))
      .filter((d) => d.split("/").pop() === skill);
    if (!dirs.length) {
      // fall back: a repo whose single skill sits at the root
      dirs = skillMds.map((e) => dirname(e.path));
    }
  }
  dirs = [...new Set(dirs)];

  if (!dirs.length) {
    report.push({ repo, skill, status: "NO SKILL.md FOUND", files: 0 });
    continue;
  }

  for (const dir of dirs) {
    const name = dir === "." ? repo.split("/")[1] : dir.split("/").pop();
    const outDir = join("skills", name);
    const files = entries.filter(
      (e) => e.type === "blob" && (dir === "." ? true : e.path.startsWith(dir + "/"))
    );
    let written = 0;
    for (const f of files) {
      const rel = dir === "." ? f.path : f.path.slice(dir.length + 1);
      if (rel.startsWith(".git")) continue;
      const dest = join(outDir, rel);
      if (existsSync(dest)) continue;
      try {
        const content = download(repo, f.path);
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, content);
        written++;
      } catch {
        /* binary or unreadable; skip */
      }
    }
    // provenance
    mkdirSync(outDir, { recursive: true });
    writeFileSync(
      join(outDir, "SOURCE.txt"),
      `source: https://github.com/${repo}\npath:   ${dir}\nfetched: ${new Date().toISOString()}\ncommand: npx skills use "https://github.com/${repo}" --skill "${name}"\n`
    );
    report.push({ repo, skill: name, status: "ok", files: written });
  }
}

console.table(report);
