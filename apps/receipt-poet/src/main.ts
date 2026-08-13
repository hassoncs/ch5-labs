import { pick } from "@chriscode/random-kit";

const formElement = document.querySelector<HTMLFormElement>("form");
const itemInput = document.querySelector<HTMLInputElement>("#item");
const priceInput = document.querySelector<HTMLInputElement>("#price");
const poemElement = document.querySelector<HTMLPreElement>("#poem");

if (!formElement || !itemInput || !priceInput || !poemElement) {
  throw new Error("receipt poet controls are missing");
}

const endings = [
  "the card reader approves\nwhat the heart cannot",
  "a small beep confirms\nwe briefly owned the world",
  "tax included\nwonder sold separately",
] as const;

formElement.addEventListener("submit", (event) => {
  event.preventDefault();
  const price = Number(priceInput.value);
  if (!Number.isFinite(price) || price < 0) {
    poemElement.textContent = "PRICE ERROR\ncapitalism requests a number";
    return;
  }
  poemElement.textContent = [
    itemInput.value.trim().toUpperCase(),
    `$${price.toFixed(2)}`,
    "",
    pick(endings),
  ].join("\n");
});
