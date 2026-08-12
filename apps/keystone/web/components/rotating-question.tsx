"use client";

import { useEffect, useState } from "react";

const QUESTIONS = [
  "Building something you don't want to redo in a year?",
  "Not sure your AI prototype will hold up?",
  "Need to know what you're buying before you close?",
  "Drowning in manual work that should be automated?",
  "Not sure your team's using AI coding tools well?",
  "Scaling up and worried your codebase can't keep up?",
];

const INTERVAL_MS = 7000;
const SLIDE_MS = 550;

type Phase = "resting" | "sliding";

export function RotatingQuestion() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("resting");

  const nextIndex = (index + 1) % QUESTIONS.length;
  const sliding = phase === "sliding";

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let slideTimeout: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setPhase("sliding");
      slideTimeout = setTimeout(() => {
        setIndex((i) => (i + 1) % QUESTIONS.length);
        setPhase("resting");
      }, SLIDE_MS);
    }, INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(slideTimeout);
    };
  }, []);

  const transition = sliding ? `transform ${SLIDE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)` : "none";

  return (
    <div className="relative grid overflow-hidden">
      <h2
        className="col-start-1 row-start-1 flex items-center justify-center text-center text-2xl font-semibold text-blueprint-navy sm:text-3xl"
        style={{ transform: `translateY(${sliding ? "-100%" : "0%"})`, transition }}
      >
        {QUESTIONS[index]}
      </h2>
      <h2
        className="col-start-1 row-start-1 flex items-center justify-center text-center text-2xl font-semibold text-blueprint-navy sm:text-3xl"
        style={{ transform: `translateY(${sliding ? "0%" : "100%"})`, transition }}
      >
        {QUESTIONS[nextIndex]}
      </h2>
    </div>
  );
}
