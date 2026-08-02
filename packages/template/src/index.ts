/**
 * Replace this with the experiment.
 *
 * Rules that keep the package servable from esm.sh:
 *   - no node builtins (no `node:fs`, `process`, `child_process`, …)
 *   - no top-level side effects — `sideEffects: false` is a promise to bundlers
 *   - ESM only, named exports, `.d.ts` emitted by tsc
 */

export type Millis = number;

/** Format a duration for display. Deliberately trivial: this file exists to prove the build path. */
export function formatDuration(ms: Millis): string {
  if (!Number.isFinite(ms) || ms < 0) throw new RangeError(`expected a non-negative duration, got ${ms}`);
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${Math.round(seconds % 60)}s`;
}
