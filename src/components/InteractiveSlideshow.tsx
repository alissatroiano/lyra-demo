import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Play, Presentation, FileText, Sparkles, BookOpen, HelpCircle } from "lucide-react";
import { Slide } from "../types";

interface InteractiveSlideshowProps {
  slides: Slide[];
}

export default function InteractiveSlideshow({ slides }: InteractiveSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(true);

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Keyboard navigation for teachers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, slides]);

  const currentSlide = slides[currentIndex];

  if (!currentSlide) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500">
        <Presentation className="w-16 h-16 stroke-1 mb-3 text-gray-400" />
        <p>No slides generated for this lesson.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="slideshow-root">
      {/* Slide Deck Stage (9 columns or full width) */}
      <div className={`col-span-12 ${showNotes ? "lg:col-span-8" : "lg:col-span-12"} transition-all duration-300`}>
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl aspect-[16/10] shadow-2xl flex flex-col justify-between p-8 sm:p-12 text-white">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Slide Header */}
          <div className="flex justify-between items-center z-10">
            <span className="text-xs font-mono tracking-widest text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-800/60 px-3 py-1 rounded-full uppercase">
              Slide {currentIndex + 1} of {slides.length}
            </span>
            <div className="flex gap-1.5">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? "w-8 bg-emerald-400" : "w-1.5 bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Slide Content Layout */}
          <div className="my-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10">
            
            {/* Left/Main Column - Key text statements */}
            <div className="md:col-span-7 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`slide-text-${currentIndex}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h3 className="text-2xl sm:text-3.5xl font-sans font-bold tracking-tight text-white leading-tight">
                    {currentSlide.title}
                  </h3>
                  <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full" />
                  
                  <ul className="space-y-4 pt-2">
                    {currentSlide.content.map((bullet, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 text-slate-300 text-sm sm:text-base leading-relaxed"
                      >
                        <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        <span>{bullet}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column - Visual Prompt / Simulated Smartboard Graphic */}
            <div className="md:col-span-5 bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 aspect-square flex flex-col justify-between text-xs font-mono relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
              
              <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-900 pb-2 mb-2">
                <span className="flex items-center gap-1">
                  <Presentation className="w-3.5 h-3.5 text-blue-400" />
                  SMART BOARD CANVAS
                </span>
                <span className="text-emerald-500/80">● ACTIVE VISUAL</span>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center text-center px-2 py-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`slide-visual-${currentIndex}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3"
                  >
                    <div className="mx-auto w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/10 mb-2">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Concept Blueprint</h4>
                    <p className="text-slate-400 leading-relaxed text-[11px] font-sans">
                      {currentSlide.visualConcept}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-2 text-[9px] text-slate-500 border-t border-slate-900 pt-2 flex items-center justify-between font-sans">
                <span>Illustration Guideline for Smart Board</span>
                <span className="font-mono text-emerald-400">Lyra Engine</span>
              </div>
            </div>

          </div>

          {/* Slide Navigation Controls */}
          <div className="flex items-center justify-between border-t border-slate-800/60 pt-6 mt-6 z-10">
            <div className="flex gap-2">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  showNotes
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                    : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-300 hover:bg-slate-800"
                }`}
                id="toggle-teacher-notes-btn"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{showNotes ? "Hide Instructor Guide" : "Show Instructor Guide"}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800/60 disabled:cursor-not-allowed transition-all"
                aria-label="Previous Slide"
                id="prev-slide-btn"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-xs font-mono text-slate-400">
                {currentIndex + 1} / {slides.length}
              </span>

              <button
                onClick={nextSlide}
                disabled={currentIndex === slides.length - 1}
                className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800/60 disabled:cursor-not-allowed transition-all"
                aria-label="Next Slide"
                id="next-slide-btn"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
        <p className="text-[11px] text-slate-500 font-mono mt-3 text-right">
          💡 Pro-tip: Use your keyboard <kbd className="bg-slate-100 border px-1 rounded shadow-xs text-[10px] font-semibold font-sans">←</kbd> and <kbd className="bg-slate-100 border px-1 rounded shadow-xs text-[10px] font-semibold font-sans">→</kbd> arrow keys to navigate slides smoothly.
        </p>
      </div>

      {/* Instructor Guide Panel (4 columns or hidden) */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, x: 20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: 20, width: 0 }}
            className="col-span-12 lg:col-span-4 lg:w-auto"
          >
            <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-2xl p-6 h-full flex flex-col justify-between text-emerald-950 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
                  <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight text-emerald-900">INSTRUCTOR GUIDE</h4>
                    <p className="text-[10px] font-mono text-emerald-600/80 uppercase">Interactive Teaching Prompts</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase block font-mono">
                      How to Explain Playfully:
                    </span>
                    <div className="bg-white/80 border border-emerald-100/50 rounded-xl p-3 text-xs text-slate-700 leading-relaxed shadow-2xs font-sans">
                      {currentSlide.instructorNotes}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase block font-mono flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-emerald-500" /> Suggested Class Discussion:
                    </span>
                    <div className="space-y-2">
                      <div className="text-xs text-slate-700 font-sans border-l-2 border-emerald-200 pl-2.5">
                        "If you were an astronaut, would you prefer a heavy metal rocket or a light-weight fiberglass rocket? Why?"
                      </div>
                      <div className="text-[11px] text-emerald-800 bg-emerald-100/30 px-2 py-1 rounded-md font-sans">
                        🎯 Lead them to think about how **Mass** affects **Thrust & Acceleration** (Newton's 2nd law)!
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-emerald-100 mt-4 text-[11px] text-emerald-700 flex items-center justify-between font-sans">
                <span>Designed for rapid, wordy-free teaching</span>
                <span className="font-semibold text-emerald-800">Ages 6-14</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
