/**
 * Prove a published package is actually consumable from esm.sh.
 *
 *   bun run scripts/verify-esm.ts                      # every publishable workspace package
 *   bun run scripts/verify-esm.ts @chriscode/foo@1.2.3 # one explicit spec
 *
 * Four checks, because "npm publish said OK" proves none of them:
 *
 *   1. public-registry   the version is on registry.npmjs.org AND is dist-tag `latest`.
 *                        Catches the publish that silently went to npm.ch5.me instead
 *                        — the exact failure that pinned @chriscode/hush on esm.sh at
 *                        7.5.0 while the repo shipped 8.3.1.
 *   2. esm-build         esm.sh returns 200 and its x-esm-path names THAT version, not
 *                        an older one it still had cached.
 *   3. browser-safe      the built module imports no /node/*.mjs shims. esm.sh happily
 *                        serves a package that needs node builtins; it just won't run
 *                        in a browser. A 200 here means nothing on its own.
 *   4. types             x-typescript-types is present, so consumers get .d.ts.
 *
 * Exit 1 on any failure. No dependencies.
 */

const NPM = "https://registry.npmjs.org";
const ESM = "https://esm.sh";

type Check = { name: string; ok: boolean; detail: string };

function parseSpec(spec: string): { name: string; version: string } {
  const at = spec.lastIndexOf("@");
  if (at <= 0) throw new Error(`spec must be name@version, got: ${spec}`);
  return { name: spec.slice(0, at), version: spec.slice(at + 1) };
}

async function checkPublicRegistry(name: string, version: string): Promise<Check[]> {
  const res = await fetch(`${NPM}/${name}`);
  if (!res.ok) {
    return [{
      name: "public-registry",
      ok: false,
      detail: `${NPM}/${name} -> ${res.status}. Not on public npm; esm.sh can never see it.`,
    }];
  }
  const meta = (await res.json()) as {
    versions?: Record<string, unknown>;
    "dist-tags"?: Record<string, string>;
  };
  const has = Boolean(meta.versions?.[version]);
  const latest = meta["dist-tags"]?.latest ?? "(none)";
  return [
    {
      name: "public-registry",
      ok: has,
      detail: has
        ? `${name}@${version} present on registry.npmjs.org`
        : `${name}@${version} MISSING from public npm (latest there is ${latest}). ` +
          `Almost always publishConfig.registry or an .npmrc scope line pointing at npm.ch5.me.`,
    },
    {
      name: "latest-tag",
      ok: latest === version,
      detail: latest === version
        ? `dist-tag latest === ${version}`
        : `dist-tag latest is ${latest}, not ${version}. Bare esm.sh/${name} will serve ${latest}.`,
    },
  ];
}

// esm.sh sends `vary: User-Agent` and serves a DIFFERENT build per client: a bare
// fetch gets the node-target build, a browser gets the es2022 one. The node build
// does not list the /node/*.mjs shims, so checking it reports browser-safe for a
// package that cannot run in a browser at all. Verify the artifact the consumer
// actually receives: pin ?target= and send a browser UA.
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const TARGET = "es2022";

async function checkEsm(name: string, version: string): Promise<Check[]> {
  const url = `${ESM}/${name}@${version}?target=${TARGET}`;
  const res = await fetch(url, { headers: { "user-agent": BROWSER_UA } });
  if (!res.ok) {
    return [{ name: "esm-build", ok: false, detail: `${url} -> ${res.status}` }];
  }
  const body = await res.text();
  const esmPath = res.headers.get("x-esm-path") ?? "";
  const types = res.headers.get("x-typescript-types");
  const nodeShims = [
    ...[...body.matchAll(/["'](\/node\/[^"']+)["']/g)].map((m) => m[1]!),
    ...[...body.matchAll(/["'](node:[^"']+)["']/g)].map((m) => m[1]!),
  ];
  const servedNodeBuild = esmPath.includes(`/${TARGET}/`) === false;

  return [
    {
      name: "esm-build",
      ok: esmPath.includes(`@${version}`) && !servedNodeBuild,
      detail: !esmPath.includes(`@${version}`)
        ? `x-esm-path ${esmPath || "(absent)"} does not name @${version}`
        : servedNodeBuild
          ? `x-esm-path ${esmPath} is not a /${TARGET}/ build — measured the wrong artifact`
          : `x-esm-path ${esmPath}`,
    },
    {
      name: "browser-safe",
      ok: nodeShims.length === 0,
      detail: nodeShims.length === 0
        ? `no node builtin shims in the ${TARGET} build`
        : `imports ${nodeShims.length} node builtin(s): ${nodeShims.join(", ")} — will not run in a browser`,
    },
    {
      name: "types",
      ok: Boolean(types),
      detail: types ? `x-typescript-types ${types}` : "no x-typescript-types header; consumers get no .d.ts",
    },
  ];
}

async function verify(spec: string): Promise<boolean> {
  const { name, version } = parseSpec(spec);
  console.log(`\n${name}@${version}`);
  const checks = [
    ...(await checkPublicRegistry(name, version)),
    ...(await checkEsm(name, version)),
  ];
  for (const c of checks) {
    console.log(`  ${c.ok ? "PASS" : "FAIL"}  ${c.name.padEnd(16)} ${c.detail}`);
  }
  return checks.every((c) => c.ok);
}

async function workspaceSpecs(): Promise<string[]> {
  const { Glob } = await import("bun");
  const specs: string[] = [];
  for await (const file of new Glob("packages/*/package.json").scan(".")) {
    const pkg = (await Bun.file(file).json()) as {
      name: string;
      version: string;
      private?: boolean;
      publishConfig?: { registry?: string };
    };
    if (pkg.private) continue;
    if (pkg.publishConfig?.registry) {
      console.error(
        `\n${pkg.name}: publishConfig.registry is set to ${pkg.publishConfig.registry}.\n` +
          `Remove it. Packages here publish to public npm; a registry override sends them\n` +
          `somewhere esm.sh cannot read, and npm publish still reports success.`,
      );
      process.exit(1);
    }
    specs.push(`${pkg.name}@${pkg.version}`);
  }
  return specs;
}

const args = process.argv.slice(2);
const specs = args.length > 0 ? args : await workspaceSpecs();

if (specs.length === 0) {
  console.log("No publishable packages yet — nothing to verify.");
  process.exit(0);
}

const results = await Promise.all(specs.map(verify));
const failed = results.filter((ok) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} package(s) consumable from esm.sh`);
process.exit(failed > 0 ? 1 : 0);
