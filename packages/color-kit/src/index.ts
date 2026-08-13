export function hsl(hue: number, saturation: number, lightness: number): string {
  if (![hue, saturation, lightness].every(Number.isFinite)) {
    throw new TypeError("hsl values must be finite numbers");
  }
  return `hsl(${normalizeHue(hue)} ${clamp(saturation)}% ${clamp(lightness)}%)`;
}

export function readableText(lightness: number): "#111111" | "#ffffff" {
  if (!Number.isFinite(lightness)) throw new TypeError("lightness must be finite");
  return lightness >= 60 ? "#111111" : "#ffffff";
}

function normalizeHue(value: number): number {
  return Math.round(((value % 360) + 360) % 360);
}

function clamp(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)));
}
