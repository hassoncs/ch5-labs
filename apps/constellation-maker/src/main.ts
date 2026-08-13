import { pick, randomInt } from "@chriscode/random-kit";

const canvasElement = document.querySelector<HTMLCanvasElement>("#sky");
const constellationNameElement = document.querySelector<HTMLHeadingElement>("#name");
const regenerateButton = document.querySelector<HTMLButtonElement>("#regenerate");

if (!canvasElement || !constellationNameElement || !regenerateButton) {
  throw new Error("constellation maker controls are missing");
}

const canvas = canvasElement;
const canvasContext = canvas.getContext("2d");
if (!canvasContext) throw new Error("2d canvas is unavailable");
const context = canvasContext;
const nameElement = constellationNameElement;

const adjectives = ["Quiet", "Electric", "Lost", "Velvet", "Tiny", "Patient"] as const;
const nouns = ["Ladder", "Moth", "Teacup", "Signal", "Shoe", "Comet"] as const;

function draw(): void {
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.round(innerWidth * scale);
  canvas.height = Math.round(innerHeight * scale);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.fillStyle = "#040713";
  context.fillRect(0, 0, innerWidth, innerHeight);

  const stars = Array.from({ length: randomInt(12, 22) }, () => ({
    x: randomInt(40, Math.max(40, innerWidth - 40)),
    y: randomInt(40, Math.max(40, innerHeight - 40)),
  }));
  context.strokeStyle = "rgb(174 190 255 / 42%)";
  context.lineWidth = 1;
  context.beginPath();
  stars.forEach((star, index) => {
    if (index === 0) context.moveTo(star.x, star.y);
    else context.lineTo(star.x, star.y);
  });
  context.stroke();

  for (const star of stars) {
    context.fillStyle = "#f7f3c6";
    context.beginPath();
    context.arc(star.x, star.y, randomInt(1, 4), 0, Math.PI * 2);
    context.fill();
  }
  nameElement.textContent = `The ${pick(adjectives)} ${pick(nouns)}`;
}

regenerateButton.addEventListener("click", draw);
window.addEventListener("resize", draw);
draw();
