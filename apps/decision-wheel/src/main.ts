import { hsl, readableText } from "@chriscode/color-kit";
import { pick, randomInt } from "@chriscode/random-kit";

const wheelElement = document.querySelector<HTMLDivElement>("#wheel");
const spinButton = document.querySelector<HTMLButtonElement>("#spin");
if (!wheelElement || !spinButton) throw new Error("decision wheel controls are missing");

const choices = [
  "Tea",
  "Coffee",
  "Walk first",
  "One more tab",
  "Ship the weird version",
  "Take a nap",
] as const;

let rotation = 0;
spinButton.addEventListener("click", () => {
  const lightness = randomInt(42, 78);
  rotation += randomInt(540, 1080);
  wheelElement.style.transform = `rotate(${rotation}deg)`;
  wheelElement.style.background = hsl(randomInt(0, 359), 82, lightness);
  wheelElement.style.color = readableText(lightness);
  wheelElement.textContent = pick(choices);
});
