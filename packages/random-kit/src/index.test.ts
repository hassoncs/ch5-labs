import { describe, expect, test } from "bun:test";
import { hashSeed, pick, randomInt, seededRandom } from "./index";

describe("random-kit", () => {
  test("replays a seed", () => {
    const first = seededRandom(hashSeed("ch5"));
    const second = seededRandom(hashSeed("ch5"));
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  test("picks the expected edge", () => {
    expect(pick(["left", "right"], () => 0.999)).toBe("right");
  });

  test("includes both integer bounds", () => {
    expect(randomInt(2, 4, () => 0)).toBe(2);
    expect(randomInt(2, 4, () => 0.999)).toBe(4);
  });
});
