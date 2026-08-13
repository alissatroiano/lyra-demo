import React, { useCallback, useEffect, useRef, useState } from "react";
import { Timer as TimerIcon, Play, Pause, RotateCcw, X, Plus } from "lucide-react";
import { ProcessedLesson } from "../types";

interface ClassroomTimerProps {
  lesson: ProcessedLesson;
}

/**
 * A classroom clock, sized to be read from the back of a room.
 *
 * Instructors run a timer during every hands-on activity and currently open a
 * separate tab for it, next to whatever they are already projecting. The useful
 * part is not the countdown — it is that the presets are this lesson's own
 * segments, so "Build the windmill, 28 minutes" is one tap rather than something
 * to type in while twenty children wait.
 */
export default function ClassroomTimer({ lesson }: ClassroomTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState<string>("");

  const intervalRef = useRef<number | null>(null);

  // Presets come from the lesson's own time budget, falling back to round
  // numbers when a lesson was generated before scope planning existed.
  const segments = lesson?.lessonScope?.segments || [];
  const cleanupMinutes = lesson?.lessonScope?.cleanupMinutes;

  const presets: { name: string; minutes: number }[] = [
    ...segments.map((s) => ({ name: s.name, minutes: s.minutes })),
    ...(cleanupMinutes ? [{ name: "Cleanup", minutes: cleanupMinutes }] : []),
  ];
  const fallbacks = [5, 10, 15, 20];

  const beep = useCallback(() => {
    // Generated rather than loaded: an audio file is one more asset to ship and
    // one more thing to fail in a classroom with no network.
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      [0, 0.45, 0.9].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.001, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.32);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.34);
      });
    } catch {
      /* A silent timer is still a timer. */
    }
  }, []);

  useEffect(() => {
    if (!running) return;

    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false);
          beep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, beep]);

  const start = (minutes: number, name: string) => {
    const secs = Math.max(1, Math.round(minutes * 60));
    setTotalSeconds(secs);
    setRemaining(secs);
    setLabel(name);
    setRunning(true);
  };

  const addMinute = () => {
    setRemaining((r) => r + 60);
    setTotalSeconds((t) => t + 60);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const progress = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;
  const nearlyDone = remaining > 0 && remaining <= 60;
  const finished = totalSeconds > 0 && remaining === 0;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-black/[0.08] dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-brand transition-all cursor-pointer"
        title="Open the classroom timer"
      >
        <TimerIcon className="w-3.5 h-3.5 text-teal-brand" />
        <span>Timer</span>
        {running && <span className="font-mono text-teal-brand">{mm}:{ss}</span>}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/90 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-teal-brand/30 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-teal-brand">
            <TimerIcon className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-sans">Class Timer</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close timer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Read from the back of the room. */}
          <div className="text-center space-y-1">
            {label && (
              <p className="text-xs font-sans font-bold uppercase tracking-wider text-teal-brand">{label}</p>
            )}
            <p
              className={`font-mono font-black tabular-nums leading-none text-[clamp(4rem,22vw,9rem)] transition-colors ${
                finished
                  ? "text-amber-300 animate-pulse"
                  : nearlyDone
                  ? "text-amber-400"
                  : "text-white"
              }`}
              aria-live="off"
            >
              {mm}:{ss}
            </p>
            {finished && (
              <p className="text-sm font-bold text-amber-300 font-sans">Time — wrap up</p>
            )}
          </div>

          {totalSeconds > 0 && (
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  nearlyDone || finished ? "bg-amber-400" : "bg-teal-brand"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              disabled={totalSeconds === 0 || finished}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-brand text-slate-950 text-sm font-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-teal-300 transition-colors"
            >
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{running ? "Pause" : "Start"}</span>
            </button>

            <button
              type="button"
              onClick={addMinute}
              disabled={totalSeconds === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold hover:border-teal-brand/50 disabled:opacity-40 cursor-pointer transition-colors"
              title="They need one more minute. They always need one more minute."
            >
              <Plus className="w-3.5 h-3.5" />
              <span>1 min</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRunning(false);
                setRemaining(totalSeconds);
              }}
              disabled={totalSeconds === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold hover:border-teal-brand/50 disabled:opacity-40 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans pt-3">
              {presets.length > 0 ? "This lesson's segments" : "Quick start"}
            </p>
            <div className="flex flex-wrap gap-2">
              {(presets.length > 0 ? presets : fallbacks.map((m) => ({ name: `${m} minutes`, minutes: m }))).map(
                (preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => start(preset.minutes, preset.name)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:border-teal-brand hover:text-teal-brand transition-colors cursor-pointer font-sans"
                  >
                    {preset.name} · {preset.minutes}m
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
