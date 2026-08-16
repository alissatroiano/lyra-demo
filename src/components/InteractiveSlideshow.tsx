import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  HelpCircle,
  Play, 
  Pause,
  Layers,
  Presentation,
  Maximize2,
  Minimize2
} from "lucide-react";
import { ProcessedLesson } from "../types";

interface Slide {
  title: string;
  content: string[];
  visualConcept: string;
  instructorNotes: string;
}

interface InteractiveSlideshowProps {
  slides: Slide[];
}

export default function InteractiveSlideshow({ slides }: InteractiveSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideTimer, setSlideTimer] = useState<NodeJS.Timeout | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  if (!slides || slides.length === 0) {
    return (
      <div className="bg-surface-0 border border-black/[0.06] rounded-2xl p-8 text-center text-secondary font-sans">
        <p>No interactive slides available for this lesson.</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // The play control auto-advances the deck; there is no audio in the
  // slideshow and never was. On a seven second timer with no immediate
  // feedback, clicking it looked like nothing happened - so it now advances
  // once straight away, and the button is labelled for what it actually does.
  const togglePlay = () => {
    if (isPlaying) {
      if (slideTimer) {
        clearInterval(slideTimer);
        setSlideTimer(null);
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      handleNext();
      const timer = setInterval(() => {
        handleNext();
      }, 7000);
      setSlideTimer(timer);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (stageRef.current && stageRef.current.requestFullscreen) {
        stageRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Listen to standard fullscreen change
  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (slideTimer) clearInterval(slideTimer);
    };
  }, [slideTimer]);

  return (
    <div className="space-y-6" id="interactive-slides-container">
      {/* Upper header controls */}
      <div className="bg-surface-0 dark:bg-slate-900/90 border border-black/[0.05] dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 liquid-glass-light dark:liquid-glass-dark">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-light dark:bg-teal-brand/20 flex items-center justify-center text-teal-brand border border-teal-brand/20 shrink-0 micro-glow-teal">
            <Presentation className="w-5 h-5 text-teal-brand" />
          </div>
          <div className="space-y-0.5 text-left">
            <h4 className="text-sm font-bold text-teal-dark dark:text-teal-brand font-sans flex items-center gap-1.5">
              <span>Interactive Display Presentation</span>
              <span className="text-[10px] bg-teal-100 dark:bg-teal-brand/20 border border-teal-200 dark:border-teal-brand/40 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded-full uppercase">
                Active
              </span>
            </h4>
            <p className="text-xs text-secondary dark:text-slate-400 font-sans leading-none">
              Slide {currentIndex + 1} of {slides.length} — Interactive whiteboard companion
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-3xs cursor-pointer micro-glow-amber"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? "Exit Full Screen" : "Full Screen"}</span>
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className={`p-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center justify-center border cursor-pointer ${
              isPlaying 
                ? "bg-teal-light dark:bg-teal-brand/20 text-teal-brand border-teal-brand/30 micro-glow-teal" 
                : "bg-white dark:bg-slate-800 border-black/[0.08] dark:border-slate-700 text-secondary dark:text-slate-300 hover:bg-surface-0"
            }`}
            title={isPlaying ? "Stop advancing slides" : "Advance slides automatically every 7 seconds"}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-teal-brand animate-pulse" /> : <Play className="w-4 h-4 text-secondary dark:text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Main Slideshow Stage */}
      <div 
        ref={stageRef}
        className={`relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-teal-100 dark:from-slate-950 dark:via-teal-950 dark:to-slate-950 border border-teal-brand/30 dark:border-teal-brand/25 rounded-3xl shadow-xl flex flex-col justify-between text-slate-900 dark:text-white transition-all ${
          isFullscreen 
            ? "fixed inset-0 z-50 rounded-none border-none p-8 sm:p-14 bg-white dark:bg-slate-950" 
            : "min-h-[400px] p-6 sm:p-8"
        }`}
      >
        {/* Subtle grid backing decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-30" />
        
        {/* Top Header line inside stage */}
        <div className="relative z-10 flex items-center justify-between pb-2">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-teal-brand flex items-center gap-1.5 font-mono drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            <Sparkles className="w-3.5 h-3.5 text-teal-brand" />
            <span>SLIDE {currentIndex + 1} DIRECTIVE</span>
          </span>

          {isFullscreen && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              <Minimize2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Exit Full Screen</span>
            </button>
          )}
        </div>

        {/* Progress indicators */}
        <div className="absolute top-0 left-0 right-0 p-1 flex gap-1 z-10">
          {slides.map((_, idx) => (
            <div 
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                if (isPlaying && slideTimer) {
                  clearInterval(slideTimer);
                  const timer = setInterval(() => handleNext(), 7000);
                  setSlideTimer(timer);
                }
              }}
              className="h-1.5 flex-1 rounded-full overflow-hidden bg-white/20 cursor-pointer transition-all hover:bg-white/35"
            >
              <div 
                className={`h-full bg-teal-brand transition-all duration-300 ${
                  idx === currentIndex ? "w-full" : idx < currentIndex ? "w-full opacity-40" : "w-0"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Animated content frame */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 max-w-4xl mx-auto w-full"
            >
              <h3 className={`font-bold font-display text-slate-900 dark:text-white tracking-normal leading-[1.25] pb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] ${
                isFullscreen ? "text-3xl sm:text-5xl" : "text-xl sm:text-3xl"
              }`}>
                {currentSlide.title}
              </h3>

              {/* Main Content points */}
              <div className="space-y-3.5">
                {currentSlide.content.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3.5"
                  >
                    <span className={`rounded-full bg-teal-brand/15 dark:bg-slate-950/70 text-teal-dark dark:text-teal-brand flex items-center justify-center font-bold shrink-0 mt-0.5 border border-teal-brand/60 ${
                      isFullscreen ? "w-8 h-8 text-sm" : "w-6 h-6 text-xs"
                    }`}>
                      {index + 1}
                    </span>
                    <p className={`text-slate-700 dark:text-slate-50 font-sans leading-relaxed dark:drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)] ${
                      isFullscreen ? "text-xl sm:text-2xl" : "text-sm sm:text-base"
                    }`}>
                      {point}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Deck Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 mt-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Presenter Deck</span>
            <span className="text-xs font-sans text-teal-brand font-bold">
              {currentIndex + 1} / {slides.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
