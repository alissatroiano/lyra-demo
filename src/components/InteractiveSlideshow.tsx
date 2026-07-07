import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Eye, 
  HelpCircle, 
  Play, 
  Pause,
  Award,
  Layers,
  Presentation
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
  const [showNotes, setShowNotes] = useState(true);
  const [slideTimer, setSlideTimer] = useState<NodeJS.Timeout | null>(null);

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

  const togglePlay = () => {
    if (isPlaying) {
      if (slideTimer) {
        clearInterval(slideTimer);
        setSlideTimer(null);
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const timer = setInterval(() => {
        handleNext();
      }, 7000);
      setSlideTimer(timer);
    }
  };

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (slideTimer) clearInterval(slideTimer);
    };
  }, [slideTimer]);

  return (
    <div className="space-y-6" id="interactive-slides-container">
      {/* Upper header controls */}
      <div className="bg-surface-0 border border-black/[0.05] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-light flex items-center justify-center text-teal-brand border border-teal-brand/10 shrink-0">
            <Presentation className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-left">
            <h4 className="text-sm font-bold text-teal-dark font-sans flex items-center gap-1.5">
              <span>Smartboard Interactive Presentation</span>
              <span className="text-[10px] bg-teal-100 border border-teal-200 text-teal-800 font-bold px-2 py-0.5 rounded-full uppercase">
                Active
              </span>
            </h4>
            <p className="text-xs text-secondary font-sans leading-none">
              Slide {currentIndex + 1} of {slides.length} — Interactive whiteboard companion
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1.5 border cursor-pointer ${
              showNotes 
                ? "bg-teal-brand text-white border-teal-brand" 
                : "bg-white border-black/[0.08] text-secondary hover:bg-surface-0"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showNotes ? "Hide Teacher Notes" : "Show Teacher Notes"}</span>
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className={`p-2 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center border cursor-pointer ${
              isPlaying 
                ? "bg-teal-light text-teal-brand border-teal-brand/20" 
                : "bg-white border-black/[0.08] text-secondary hover:bg-surface-0"
            }`}
            title={isPlaying ? "Pause Slideshow" : "Auto-Play Slides (7s)"}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-teal-brand" /> : <Play className="w-4 h-4 text-secondary" />}
          </button>
        </div>
      </div>

      {/* Main Slideshow Stage */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-dark to-slate-950 border border-slate-800 rounded-3xl shadow-xl min-h-[380px] flex flex-col justify-between p-6 sm:p-8 text-white">
        
        {/* Subtle grid backing decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-30" />
        
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
              className="h-1 flex-1 rounded-full overflow-hidden bg-white/10 cursor-pointer transition-all hover:bg-white/20"
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
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-teal-brand flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-teal-brand" />
                  <span>SLIDE {currentIndex + 1} DIRECTIVE</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-sans text-white tracking-tight leading-tight">
                  {currentSlide.title}
                </h3>
              </div>

              {/* Main Content points */}
              <div className="space-y-3.5 max-w-2xl">
                {currentSlide.content.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-teal-brand/20 text-teal-brand flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-teal-brand/30">
                      {index + 1}
                    </span>
                    <p className="text-sm sm:text-base text-slate-200 font-sans leading-relaxed">
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

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Presenter Deck</span>
            <span className="text-xs font-sans text-teal-brand font-bold">
              {currentIndex + 1} / {slides.length}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Concept Block */}
      {currentSlide.visualConcept && (
        <div className="bg-slate-50 border border-black/[0.05] rounded-2xl p-5 space-y-3 shadow-3xs" id="visual-concept-card">
          <div className="flex items-center gap-2.5 text-teal-dark">
            <div className="w-7 h-7 rounded-lg bg-teal-light flex items-center justify-center text-teal-brand">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase font-sans tracking-tight">Smartboard Visual Concept</h5>
              <p className="text-[9px] text-secondary leading-none">Suggested live illustration or board sketch</p>
            </div>
          </div>
          <p className="text-xs text-secondary leading-relaxed font-sans bg-white border border-black/[0.04] p-3 rounded-xl italic">
            "{currentSlide.visualConcept}"
          </p>
        </div>
      )}

      {/* Facilitator Notes (Collapsible or toggleable) */}
      <AnimatePresence>
        {showNotes && currentSlide.instructorNotes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
            id="instructor-notes-card"
          >
            <div className="bg-amber-50/70 border border-amber-200/50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-900">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold uppercase font-sans tracking-tight">Facilitator Cues & Speaking Prompts</h5>
                  <p className="text-[9px] text-amber-800/80 leading-none">Pedagogical recommendations by Lyra</p>
                </div>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed font-sans bg-white/70 border border-amber-200/30 p-3 rounded-xl">
                {currentSlide.instructorNotes}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
