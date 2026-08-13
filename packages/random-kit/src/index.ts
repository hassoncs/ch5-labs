export function hashSeed(value: string): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(items: readonly T[], random: () => number = Math.random): T {
  if (items.length === 0) throw new RangeError("cannot pick from an empty list");
  return items[Math.floor(random() * items.length)] as T;
}

export function randomInt(min: number, max: number, random: () => number = Math.random): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
    throw new RangeError(`expected integer bounds with max >= min, got ${min}..${max}`);
  }
  return Math.floor(random() * (max - min + 1)) + min;
}
