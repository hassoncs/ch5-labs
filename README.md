# ch5-labs

Tiny static TypeScript library experiments, published to **public npm** so they can be
imported straight from [esm.sh](https://esm.sh) with no build step:

```html
<script type="module">
  import { formatDuration } from "https://esm.sh/@chriscode/some-experiment@0.1.0";
</script>
```

Source lives on `git.ch5.me/ch5/ch5-labs` and is mirrored, read-only, to GitHub.

## Why public npm specifically

esm.sh is a transparent proxy over `registry.npmjs.org`. It builds a package on first
request (a couple of seconds) and edge-caches the result. There is nothing to register
and no list to join — publish, and the URL works.

It cannot authenticate to a private registry, so anything on `npm.ch5.me` is invisible
to it. That is why `@ch5me/*` packages can never be served this way, and why these
experiments use the public `@chriscode/*` scope.

## Adding an experiment

```bash
cp -R packages/template packages/<name>
# edit package.json: name, description; set "private": false when ready to publish
bun install
bun run build
```

Constraints every package here has to hold:

- **Browser-safe.** No node builtins. The repo has no `@types/node`, so `import "node:fs"`
  fails typecheck rather than turning into a `/node/fs.mjs` shim that only breaks at runtime.
- **ESM only**, `type: "module"`, `sideEffects: false`.
- **No `publishConfig.registry`.** See below.
- Ship `dist` only; types come from `tsc`.

## Publishing

```bash
bun run build
npm publish --access public --registry https://registry.npmjs.org/
bun run verify:esm
```

`verify:esm` is the gate that matters. It checks four things a successful `npm publish`
does not prove:

1. the version is on `registry.npmjs.org` and is dist-tag `latest`
2. esm.sh returns 200 and its `x-esm-path` names that exact version
3. the built module pulls in no `/node/*.mjs` shims — i.e. it really runs in a browser
4. `x-typescript-types` is present, so consumers get `.d.ts`

### The failure this repo is built to avoid

`npm publish` reports success when it sends your package to the wrong registry. That
already happened in `~/src/ch5/hush`: `hush-cli/package.json` sets
`publishConfig.registry: https://npm.ch5.me/` and `hush/.npmrc` maps
`@chriscode:registry` to the same host. So public npm still serves `@chriscode/hush@7.5.0`
while the repo ships `8.3.1`, and esm.sh has been pinned three majors back — with every
publish exiting 0.

Hence: no `registry` key in any `publishConfig` here, no `@chriscode` line in `.npmrc`,
and `verify:esm` refuses to run if either reappears.

You can watch the gate go red on a real package:

```bash
bun run scripts/verify-esm.ts @chriscode/hush@7.5.0
```

It fails `browser-safe` — hush needs `child_process`, `fs`, and `readline`, so esm.sh
serves it happily and no browser can run it.

### esm.sh serves a different build per client

esm.sh sends `vary: User-Agent`. A plain `fetch` gets the **node-target** build; a
browser gets the `es2022` one. Only the browser build lists the `/node/*.mjs` shims, so
checking the default response reports a CLI-only package as browser-safe. The first cut
of `verify-esm.ts` did exactly that and passed hush.

The fix, and the rule for anything else that inspects esm.sh output: pin `?target=` and
send a browser User-Agent, then assert `x-esm-path` really names that target. Measure the
artifact the consumer receives, not whatever the CDN hands a script.
