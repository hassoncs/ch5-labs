import { hashSeed, pick, seededRandom } from "@chriscode/random-kit";

const answers = [
  "Yes, but only after lunch.",
  "No. You already know why.",
  "Try the weird option.",
  "Ask again after deleting one tab.",
  "The vibes say maybe.",
  "Do it badly once, then decide.",
] as const;

const formElement = document.querySelector<HTMLFormElement>("form");
const questionInput = document.querySelector<HTMLInputElement>("#question");
const answerOutput = document.querySelector<HTMLOutputElement>("#answer");

if (!formElement || !questionInput || !answerOutput) throw new Error("tiny oracle controls are missing");

formElement.addEventListener("submit", (event) => {
  event.preventDefault();
  const normalized = questionInput.value.trim().toLowerCase();
  answerOutput.textContent = pick(answers, seededRandom(hashSeed(normalized)));
});
