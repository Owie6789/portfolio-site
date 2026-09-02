# skills/

Raw skill files, fetched verbatim from their source repos. Each folder keeps a
`SOURCE.txt` with the repo, the path inside it, the fetch date, and the
equivalent `npx skills use` command.

Re-fetch or add more with `node tools/fetch-skills.mjs`.

Folders are named after the `name:` in each skill's frontmatter, which does not
always match the folder name in the source repo. For example
`high-end-visual-design` lives at `skills/soft-skill` upstream.

`unslop` and `premium-web-design-psychology` were pasted by the user, not
fetched.

See ../AGENTS.md for the condensed version and when to use which.
