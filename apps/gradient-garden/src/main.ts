import { randomInt } from "@chriscode/random-kit";

const recipeElement = document.querySelector<HTMLParagraphElement>("#recipe");
const growButton = document.querySelector<HTMLButtonElement>("#grow");

if (!recipeElement || !growButton) throw new Error("gradient garden controls are missing");

const recipe = recipeElement;
const grow = growButton;

function plant(): void {
  const angle = randomInt(0, 359);
  const colors = Array.from({ length: 4 }, () => {
    const hue = randomInt(0, 359);
    return `hsl(${hue} 88% 62%)`;
  });
  const gradient = `linear-gradient(${angle}deg, ${colors.join(", ")})`;
  document.body.style.background = gradient;
  recipe.textContent = gradient;
}

grow.addEventListener("click", plant);
plant();
