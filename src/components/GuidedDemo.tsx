import React, { useEffect, useRef, useState } from "react";
import { MousePointer2, X } from "lucide-react";

interface GuidedDemoProps {
  /** Called as the sample lesson is "typed" into the input. */
  onType: (text: string) => void;
  /** Called when the demo cursor presses Generate. */
  onGenerate: () => void;
  /** Called when the demo ends or is skipped. */
  onFinish: () => void;
  /** The lesson text the demo pastes in. */
  sampleText: string;
}

type Step = {
  /** Element the cursor travels to. */
  target: string;
  caption: string;
  /** Time the caption stays up before the next step. */
  hold: number;
  action?: "type" | "click";
};

const STEPS: Step[] = [
  {
    target: "#demo-upload-option",
    caption: "Two ways in. Upload the file you were handed — PDF, Word, whatever it came as.",
    hold: 2200,
  },
  {
    target: "#demo-lesson-input",
    caption: "Or just paste the text straight in. Either works.",
    hold: 1800,
  },
  {
    target: "#demo-lesson-input",
    caption: "No reformatting needed. Wordy is fine — that's the point.",
    hold: 900,
    action: "type",
  },
  {
    target: "#generate-lesson-btn",
    caption: "Then Lyrah does the conversion work.",
    hold: 1500,
  },
  {
    target: "#generate-lesson-btn",
    caption: "Slides, a lab checklist, a worksheet with answers, and a quiz.",
    hold: 1200,
    action: "click",
  },
];

/**
 * A cursor-led walkthrough of the one thing Lyrah does.
 *
 * Someone landing on the studio for the first time sees an empty text box and
 * has to guess what belongs in it. This drives the real controls rather than a
 * video of them, so the run ends with an actual generated lesson on screen.
 */
export default function GuidedDemo({ onType, onGenerate, onFinish, sampleText }: GuidedDemoProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [pressed, setPressed] = useState(false);
  const cancelled = useRef(false);

  // The script runs from an effect that fires once, so it would otherwise hold
  // the first render's callbacks forever — and onGenerate closes over the lesson
  // text, which is empty at that point. Calling through a ref means the click at
  // the end of the demo sees the text the demo just typed.
  const handlers = useRef({ onType, onGenerate, onFinish });
  handlers.current = { onType, onGenerate, onFinish };

  // Everything the demo schedules is tracked so skipping stops it dead rather
  // than leaving timers firing against an unmounted overlay.
  const timers = useRef<number[]>([]);
  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      timers.current.push(window.setTimeout(resolve, ms));
    });

  const stop = () => {
    cancelled.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    handlers.current.onFinish();
  };

  useEffect(() => {
    // Cleared on every run: React re-invokes effects (cleanup then setup) on the
    // same instance in development, and the cleanup's cancel flag would
    // otherwise stop the second run before it started.
    cancelled.current = false;

    const waitForTarget = async (selector: string) => {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const found = document.querySelector(selector) as HTMLElement | null;
        if (found) return found;
        if (cancelled.current) return null;
        await wait(100);
      }
      return null;
    };

    const run = async () => {
      // Let the studio paint before measuring anything.
      await wait(700);

      for (let i = 0; i < STEPS.length; i += 1) {
        if (cancelled.current) return;
        const step = STEPS[i];
        setStepIndex(i);

        // The panels holding these controls animate open, so a target can be
        // a few frames behind the demo starting. Skipping a missing element
        // outright meant one collapsed panel silently collapsed the whole
        // run, so wait for it before giving up on the step.
        const el = await waitForTarget(step.target);
        if (cancelled.current) return;
        if (!el) continue;

        el.scrollIntoView({ behavior: "smooth", block: "center" });
        await wait(500);
        if (cancelled.current) return;

        const rect = el.getBoundingClientRect();
        setCursor({ x: rect.left + Math.min(rect.width / 2, 260), y: rect.top + rect.height / 2 });
        await wait(750);
        if (cancelled.current) return;

        if (step.action === "type") {
          // Typed in chunks: character-at-a-time re-renders the whole studio on
          // every keystroke, which stutters on a long lesson.
          const visible = sampleText.slice(0, 260);
          for (let c = 0; c <= visible.length; c += 6) {
            if (cancelled.current) return;
            handlers.current.onType(visible.slice(0, c));
            await wait(18);
          }
          handlers.current.onType(sampleText);
          await wait(400);
        }

        if (step.action === "click") {
          setPressed(true);
          await wait(220);
          setPressed(false);
          if (cancelled.current) return;
          handlers.current.onGenerate();
          await wait(600);
          stop();
          return;
        }

        await wait(step.hold);
      }

      stop();
    };

    run();
    return () => {
      cancelled.current = true;
      timers.current.forEach(clearTimeout);
    };
    // Intentionally run once: the script is fixed and re-running it mid-flight
    // would fight the cursor animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = STEPS[stepIndex];

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none" aria-hidden="true">
      {/* Skip is the only thing here that takes clicks. */}
      <button
        type="button"
        onClick={stop}
        className="pointer-events-auto absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-[11px] font-bold border border-white/20 hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
        <span>Skip demo</span>
      </button>

      {cursor && (
        <div
          className="absolute transition-all duration-700 ease-in-out"
          style={{ left: cursor.x, top: cursor.y, transform: pressed ? "scale(0.85)" : "scale(1)" }}
        >
          <MousePointer2 className="w-6 h-6 text-teal-brand drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] fill-teal-brand/30" />

          {step && (
            <div className="mt-2 max-w-[260px] px-3 py-2 rounded-xl bg-slate-900/95 text-white text-[11px] font-sans leading-relaxed border border-teal-brand/40 shadow-xl">
              {step.caption}
            </div>
          )}

          {pressed && (
            <span className="absolute -left-2 -top-2 w-10 h-10 rounded-full border-2 border-teal-brand animate-ping" />
          )}
        </div>
      )}
    </div>
  );
}
