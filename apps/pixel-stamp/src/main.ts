import { randomInt } from "@chriscode/random-kit";

const gridElement = document.querySelector<HTMLDivElement>("#grid");
const colorInput = document.querySelector<HTMLInputElement>("#color");
const randomizeButton = document.querySelector<HTMLButtonElement>("#randomize");
const clearButton = document.querySelector<HTMLButtonElement>("#clear");

if (!gridElement || !colorInput || !randomizeButton || !clearButton) {
  throw new Error("pixel stamp controls are missing");
}

const grid = gridElement;
const color = colorInput;

const pixels = Array.from({ length: 256 }, () => {
  const pixel = document.createElement("button");
  pixel.type = "button";
  pixel.className = "pixel";
  pixel.ariaLabel = "Paint pixel";
  pixel.addEventListener("click", () => {
    pixel.style.background = color.value;
  });
  grid.append(pixel);
  return pixel;
});

randomizeButton.addEventListener("click", () => {
  for (const pixel of pixels) {
    pixel.style.background = Math.random() > 0.64
      ? `hsl(${randomInt(0, 359)} 85% 58%)`
      : "#fff";
  }
});

clearButton.addEventListener("click", () => {
  for (const pixel of pixels) pixel.style.background = "#fff";
});
