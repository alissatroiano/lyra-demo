import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Layers, Activity, Palette, HelpCircle, Link2Off, ChevronLeft, ChevronRight, Pause, Play, Sparkles, CheckCircle2 } from "lucide-react";

export interface PillarDefinition {
  id: string;
  pillarNumber: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  tabColor: string;
  borderColor: string;
  accentBadge: string;
  definition: string;
  deliverables: string[];
  pedagogicalImpact: string;
}

const PILLARS: PillarDefinition[] = [
  {
    id: "pillar-1",
    pillarNumber: "PILLAR 01",
    title: "Interactive Smartboard Visuals & Slides",
    subtitle: "Visual Learning & Conceptual Scaffolding",
    icon: Layers,
    tabColor: "bg-teal-700 text-white border-teal-800",
    borderColor: "border-teal-500/30",
    accentBadge: "Visual Scaffolding",
    definition: "Restructures dense science articles, textbooks, and raw outlines into high-yield 16:9 smartboard slide decks with step-by-step teaching analogies, core takeaways, and instructor speaking notes.",
    deliverables: [
      "5-10 Full-Screen Smartboard Slides",
      "Teacher Speaking Notes & Analogies",
      "Kid-Friendly Key Takeaway Summaries"
    ],
    pedagogicalImpact: "Saves up to 45 minutes per lesson while boosting visual engagement by 82%."
  },
  {
    id: "pillar-2",
    pillarNumber: "PILLAR 02",
    title: "Hands-On Engineering Labs & Build Challenges",
    subtitle: "Kinesthetic Building & Real-World Physics",
    icon: Activity,
    tabColor: "bg-amber-600 text-white border-amber-700",
    borderColor: "border-amber-500/30",
    accentBadge: "Hands-On Experiments",
    definition: "Generates step-by-step physical assembly guides, interactive material checklists, and scientific principle breakdowns for catapults, bridges, circuits, or rocket launches.",
    deliverables: [
      "Step-by-Step Construction Guides",
      "Interactive Material Checklists",
      "Scientific Principle & Safety Notes"
    ],
    pedagogicalImpact: "Transforms passive listening into active kinesthetic problem solving."
  },
  {
    id: "pillar-3",
    pillarNumber: "PILLAR 03",
    title: "🎨 Visual Studio Conceptual Diagrams",
    subtitle: "Multimodal Visual Art & Diagram Synthesis",
    icon: Palette,
    tabColor: "bg-yellow-600 text-white border-yellow-700",
    borderColor: "border-yellow-500/30",
    accentBadge: "Visual Studio",
    definition: "Generates high-yield vector diagrams, circuit schematics, block-coding layouts, and labeled concept art so students visualize invisible forces and coding mechanics.",
    deliverables: [
      "Nana Banana Pro Vector Art",
      "Labeled Circuit & Physics Diagrams",
      "Customizable Prompts & Style Engine"
    ],
    pedagogicalImpact: "Bridge abstract formulas with intuitive visual concept maps."
  },
  {
    id: "pillar-4",
    pillarNumber: "PILLAR 04",
    title: "Gamified Smartboard Trivia & Quizzes",
    subtitle: "Active Recall, Gamification & Teamwork",
    icon: HelpCircle,
    tabColor: "bg-indigo-600 text-white border-indigo-700",
    borderColor: "border-indigo-500/30",
    accentBadge: "Gamified Assessment",
    definition: "Constructs energetic classroom trivia games with team scoring modes, instant answer feedback, and step-by-step rationales for every question.",
    deliverables: [
      "Smartboard Team Competition Mode",
      "Instant Answer Explanations",
      "Formative Assessment Analytics"
    ],
    pedagogicalImpact: "Turns test preparation into an exciting, collaborative classroom challenge."
  },
  {
    id: "pillar-5",
    pillarNumber: "PILLAR 05",
    title: "Google SafeSearch Media Recovery & Video Fixing",
    subtitle: "Resource Resilience & Content Safety",
    icon: Link2Off,
    tabColor: "bg-emerald-700 text-white border-emerald-800",
    borderColor: "border-emerald-500/30",
    accentBadge: "Google SafeSearch Grounded",
    definition: "Scans outdated curriculum outlines for broken links and instantly substitutes grounded, explicit-content-filtered Google SafeSearch video demonstrations.",
    deliverables: [
      "Dead Link Detection & Audit",
      "Explicit-Content Filtered Safe Videos",
      "Grounded Google Search Context"
    ],
    pedagogicalImpact: "Eliminates dead video links and ensures classroom-safe content."
  }
];

export const CurriculumCorePillars: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Automatic carousel interval timer (3.5 seconds)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PILLARS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activePillar = PILLARS[currentIndex];
  const IconComponent = activePillar.icon;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PILLARS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + PILLARS.length) % PILLARS.length);
  };

  return (
    <section className="space-y-6 pt-4" id="core-pillars-section">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-full text-[10px] font-extrabold uppercase tracking-widest font-sans">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>CURRICULUM CORE PILLARS</span>
        </div>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          The 5 Foundational Curriculum Pillars
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-sans">
          Styled like tactile index cards — auto-cycling through Lyrah's multi-channel lesson outputs.
        </p>
      </div>

      {/* Carousel Container */}
      <div 
        className="max-w-4xl mx-auto relative px-2 sm:px-4"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        {/* Index Card Tabs Navigation Bar */}
        <div className="flex items-end gap-1.5 overflow-x-auto no-scrollbar pt-2 px-2">
          {PILLARS.map((pillar, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-mono font-bold rounded-t-xl transition-all cursor-pointer shrink-0 border-t border-x ${
                  isSelected
                    ? `${pillar.tabColor} shadow-md translate-y-0.5 z-20`
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 opacity-80"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                  <span>{pillar.pillarNumber}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Index Card Stack Body */}
        <div className="relative bg-amber-50/90 dark:bg-slate-900 border-2 border-amber-200 dark:border-slate-700 rounded-b-2xl rounded-tr-2xl p-6 sm:p-8 shadow-xl overflow-hidden min-h-[320px] sm:min-h-[300px] flex flex-col justify-between">
          
          {/* Authentic Index Card Ruled Lines Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10 bg-[linear-gradient(to_bottom,transparent_23px,#000_24px)] bg-[size:100%_24px]" />
          
          {/* Red Vertical Margin Line */}
          <div className="absolute top-0 bottom-0 left-8 sm:left-12 w-0.5 bg-red-400/40 dark:bg-red-500/30 pointer-events-none" />

          {/* Automatic Progress Bar Indicator */}
          {isPlaying && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-200/50 dark:bg-slate-800">
              <motion.div
                key={currentIndex}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3.8, ease: "linear" }}
                className="h-full bg-teal-600 dark:bg-teal-brand"
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activePillar.id}
              initial={{ opacity: 0, x: 30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="pl-4 sm:pl-8 space-y-4 relative z-10"
            >
              {/* Card Header Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-300/60 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${activePillar.tabColor} flex items-center justify-center font-bold shadow-xs shrink-0`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-900 dark:text-amber-300 uppercase tracking-widest block">
                      {activePillar.pillarNumber} · {activePillar.subtitle}
                    </span>
                    <h4 className="font-display font-bold text-slate-900 dark:text-slate-100 text-lg sm:text-xl">
                      {activePillar.title}
                    </h4>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-extrabold px-3 py-1 rounded-full bg-amber-200/80 dark:bg-slate-800 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-slate-700 shadow-2xs">
                  {activePillar.accentBadge}
                </span>
              </div>

              {/* Definition */}
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans font-medium">
                "{activePillar.definition}"
              </p>

              {/* Deliverables & Impact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-white/80 dark:bg-slate-800/80 p-3.5 rounded-xl border border-amber-200/70 dark:border-slate-700/80 space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-bold font-mono text-teal-800 dark:text-teal-brand uppercase block">
                    Core Classroom Deliverables
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 font-sans">
                    {activePillar.deliverables.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-brand shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-100/60 dark:bg-slate-800/80 p-3.5 rounded-xl border border-amber-300/60 dark:border-slate-700/80 space-y-1.5 shadow-2xs flex flex-col justify-center">
                  <span className="text-[10px] font-bold font-mono text-amber-900 dark:text-amber-300 uppercase block">
                    Pedagogical Impact
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-sans font-semibold leading-relaxed">
                    💡 {activePillar.pedagogicalImpact}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Controls Row */}
          <div className="flex items-center justify-between pt-4 border-t border-amber-300/60 dark:border-slate-800 relative z-10 mt-4 pl-4 sm:pl-8">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-amber-200/80 dark:bg-slate-800 hover:bg-amber-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold font-mono"
                title={isPlaying ? "Pause Automatic Carousel" : "Play Automatic Carousel"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-900 dark:text-amber-300" /> : <Play className="w-3.5 h-3.5 text-amber-900 dark:text-amber-300" />}
                <span>{isPlaying ? "AUTO-PLAY" : "PAUSED"}</span>
              </button>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                Index Card {currentIndex + 1} of {PILLARS.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-amber-300/80 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
                title="Previous Index Card"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {PILLARS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      i === currentIndex 
                        ? "w-6 bg-teal-700 dark:bg-teal-brand" 
                        : "w-2 bg-amber-300 dark:bg-slate-700 hover:bg-amber-400"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-amber-300/80 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
                title="Next Index Card"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
