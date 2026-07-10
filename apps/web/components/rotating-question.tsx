"use client";

import { useEffect, useState } from "react";

const QUESTIONS = [
  "Have a decision that's expensive to get wrong?",
  "Not sure your AI-built prototype will hold up under real users?",
  "About to acquire a company and need to know what's actually in the codebase?",
  "Buried in manual work that should have been automated months ago?",
  "Rolling out AI tooling without a plan for how it should be used?",
  "Sitting on a codebase no one on the team fully understands anymore?",
];

const INTERVAL_MS = 5000;
const FLIP_MS = 450;

type Phase = "resting" | "leaving" | "entering";

export function RotatingQuestion() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("resting");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let midTimeout: ReturnType<typeof setTimeout>;
    let frame: number;

    const interval = setInterval(() => {
      setPhase("leaving");
      midTimeout = setTimeout(() => {
        setIndex((i) => (i + 1) % QUESTIONS.length);
        setPhase("entering");
        frame = requestAnimationFrame(() => setPhase("resting"));
      }, FLIP_MS);
    }, INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(midTimeout);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="min-h-[4rem] sm:min-h-[5rem]" style={{ perspective: "600px" }}>
      <h2
        className="text-2xl font-semibold text-blueprint-navy sm:text-3xl"
        style={{
          transformOrigin: "50% 50%",
          backfaceVisibility: "hidden",
          transform: `rotateX(${phase === "leaving" ? "-90deg" : phase === "entering" ? "90deg" : "0deg"})`,
          opacity: phase === "resting" ? 1 : 0,
          transition:
            phase === "entering" ? "none" : `transform ${FLIP_MS}ms ease-in, opacity ${FLIP_MS}ms ease-in`,
        }}
      >
        {QUESTIONS[index]}
      </h2>
    </div>
  );
}
