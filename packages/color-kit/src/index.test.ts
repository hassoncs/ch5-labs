import { describe, expect, test } from "bun:test";
import { hsl, readableText } from "./index";

describe("color-kit", () => {
  test("normalizes and clamps hsl", () => {
    expect(hsl(-30, 120, -4)).toBe("hsl(330 100% 0%)");
  });

  test("chooses readable text", () => {
    expect(readableText(59)).toBe("#ffffff");
    expect(readableText(60)).toBe("#111111");
  });
});
