# ch5-labs

Tiny static TypeScript library experiments for CH5/Firefly, published to **public npm**
(`@chriscode/*`) so esm.sh can serve them as no-build ESM URLs.

Read `README.md` first — it carries the publish flow and the registry trap.

## Non-negotiables

- **Public npm, not HQ.** These packages must resolve from `registry.npmjs.org`. Never add
  a `registry` key to a `publishConfig` here and never add a `@chriscode` line to `.npmrc`.
  Both send the package to `npm.ch5.me`, where esm.sh cannot read it, and `npm publish`
  still exits 0. That is a live bug in `~/src/ch5/hush` today.
- **Browser-safe or it does not belong here.** No node builtins, no top-level `process`,
  ESM only. The repo intentionally has no `@types/node` so violations fail typecheck.
- **`bun run verify:esm` is the completion gate for a publish**, not `npm publish`'s exit
  code. Publishing without it is not a finished task.
- This repo ships by committing directly to `main`. No pull requests.

## Repo shape

```
packages/template/   copy to start an experiment; private until it is ready
packages/*/          one experiment each, published independently
scripts/verify-esm.ts
```

## Remotes

- `origin` — `https://git.ch5.me/ch5/ch5-labs.git` (authoritative, private, work happens here)
- `github` — `https://github.com/hassoncs/ch5-labs.git`, public, **read-only mirror**. Do not
  develop there; PRs opened against it get closed with a pointer back here.

The mirror is **pushed by hand today**:

```bash
git push origin main && git push github main
```

It is not a Forgejo push-mirror yet, because that stores a GitHub PAT inside Forgejo and
the only token on hand carries `repo` scope over every one of Chris's repos. Wiring it
automatically needs a fine-grained PAT scoped to `hassoncs/ch5-labs` alone. Until that
exists, assume the mirror is stale unless you just pushed it — do not cite the GitHub
copy as proof of anything.

## Commands

```bash
bun install
bun run build
bun run typecheck
bun run verify:esm                                  # all publishable packages
bun run scripts/verify-esm.ts @chriscode/hush@7.5.0 # watch the gate fail on purpose
```
