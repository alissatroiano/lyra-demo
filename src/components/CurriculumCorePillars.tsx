import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Layers, 
  Activity, 
  Palette, 
  HelpCircle, 
  Link2Off, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  Maximize2, 
  X, 
  ChevronDown,
  Layers3
} from "lucide-react";

export interface PillarDefinition {
  id: string;
  pillarNumber: string;
  shortWord: string;
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

export const PILLARS: PillarDefinition[] = [
  {
    id: "pillar-1",
    pillarNumber: "PILLAR 01",
    shortWord: "Smartboard Visuals & Slides",
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
    shortWord: "Engineering Labs",
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
    shortWord: "Visual Studio",
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
    pedagogicalImpact: "Bridges abstract formulas with intuitive visual concept maps."
  },
  {
    id: "pillar-4",
    pillarNumber: "PILLAR 04",
    shortWord: "Gamified Quizzes",
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
    shortWord: "SafeSearch Media",
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
  const [expandedId, setExpandedId] = useState<string>("pillar-1");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isCornerWidgetOpen, setIsCornerWidgetOpen] = useState<boolean>(true);

  // Auto-cycle through pillars every 4 seconds if playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setExpandedId((prevId) => {
        const currIndex = PILLARS.findIndex((p) => p.id === prevId);
        const nextIndex = (currIndex + 1) % PILLARS.length;
        return PILLARS[nextIndex].id;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Keyboard shortcut: Esc to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  const activePillarIndex = PILLARS.findIndex((p) => p.id === expandedId);
  const activePillar = PILLARS[activePillarIndex] || PILLARS[0];

  const handleNext = () => {
    const nextIdx = (activePillarIndex + 1) % PILLARS.length;
    setExpandedId(PILLARS[nextIdx].id);
  };

  const handlePrev = () => {
    const prevIdx = (activePillarIndex - 1 + PILLARS.length) % PILLARS.length;
    setExpandedId(PILLARS[prevIdx].id);
  };

  return (
    <>
      {/* MAIN CONTAINER SECTION */}
      <section className="space-y-6 pt-4 relative" id="core-pillars-section">
        {/* Section Header */}
        <div className="text-center space-y-2 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-full text-[10px] font-extrabold uppercase tracking-widest font-sans shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>CURRICULUM CORE PILLARS</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              The 5 Foundational Curriculum Pillars
            </h3>

            <button
              type="button"
              onClick={() => setIsFullScreen(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-dark hover:bg-teal-900 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md hover:scale-105 cursor-pointer shrink-0"
              title="Launch Full Screen View"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Full Screen Interactive</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-sans">
            Click any pillar card below to expand its full definition, key deliverables, and pedagogical impact.
          </p>
        </div>

        {/* 3D STACKED INTERACTIVE FLIPCARD CONTAINER */}
        <div 
          className="max-w-4xl mx-auto relative px-2 sm:px-4"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          {/* Card Navigation Tabs */}
          <div className="flex items-end gap-1.5 overflow-x-auto no-scrollbar pt-2 px-2">
            {PILLARS.map((pillar) => {
              const isSelected = pillar.id === expandedId;
              const IconComp = pillar.icon;
              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setExpandedId(pillar.id)}
                  className={`relative px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-mono font-bold rounded-t-xl transition-all cursor-pointer shrink-0 border-t border-x ${
                    isSelected
                      ? `${pillar.tabColor} shadow-md translate-y-0.5 z-20`
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 opacity-80"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <IconComp className="w-3.5 h-3.5 opacity-80" />
                    <span>{pillar.shortWord}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Stack Deck */}
          <div className="bg-amber-50/90 dark:bg-slate-900 border-2 border-amber-200 dark:border-slate-700 rounded-b-2xl rounded-tr-2xl p-4 sm:p-6 shadow-xl space-y-3 relative overflow-hidden">
            {/* Auto-Play Progress Bar */}
            {isPlaying && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-200/50 dark:bg-slate-800">
                <motion.div
                  key={expandedId}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4.0, ease: "linear" }}
                  className="h-full bg-teal-600 dark:bg-teal-brand"
                />
              </div>
            )}

            {/* STACKED CARDS LIST WITH ACCORDION FLIPCARD TRANSITION */}
            <div className="space-y-2.5 [perspective:1000px]">
              {PILLARS.map((pillar, idx) => {
                const isOpen = pillar.id === expandedId;
                const IconComp = pillar.icon;

                return (
                  <motion.div
                    key={pillar.id}
                    layout
                    onClick={() => setExpandedId(pillar.id)}
                    initial={false}
                    animate={{
                      rotateX: isOpen ? 0 : -6,
                      scale: isOpen ? 1 : 0.98,
                      y: isOpen ? 0 : (idx - activePillarIndex) * 2,
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                      isOpen
                        ? "bg-white dark:bg-slate-800 border-teal-500/50 dark:border-teal-brand/40 shadow-lg ring-2 ring-teal-500/20"
                        : "bg-amber-100/70 dark:bg-slate-800/60 border-amber-300/60 dark:border-slate-700 hover:bg-amber-100 dark:hover:bg-slate-800 hover:border-amber-400"
                    }`}
                  >
                    {/* CLOSED HEADER BAR - Always Visible */}
                    <div className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${pillar.tabColor} flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-extrabold text-teal-800 dark:text-teal-brand uppercase tracking-wider">
                              {pillar.pillarNumber}
                            </span>
                            <span className="text-xs font-bold font-sans text-slate-900 dark:text-slate-100">
                              {pillar.shortWord}
                            </span>
                          </div>
                          {!isOpen && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans line-clamp-1">
                              {pillar.title}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                          isOpen 
                            ? "bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/80 dark:text-teal-200 dark:border-teal-800 font-bold" 
                            : "bg-amber-200/60 text-amber-900 border-amber-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                        }`}>
                          {isOpen ? "EXPANDED" : "CLICK TO EXPAND"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-teal-600" : ""}`} />
                      </div>
                    </div>

                    {/* EXPANDED CONTENT BODY - Flips Open when Selected */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="px-4 pb-4 pt-1 border-t border-amber-200 dark:border-slate-700/80 space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <h4 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                              {pillar.title}
                            </h4>
                            <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-slate-600">
                              {pillar.accentBadge}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans font-medium bg-amber-50/50 dark:bg-slate-900/50 p-3 rounded-lg border border-amber-200/60 dark:border-slate-700/60">
                            &quot;{pillar.definition}&quot;
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5">
                              <span className="text-[10px] font-bold font-mono text-teal-700 dark:text-teal-brand uppercase block">
                                Core Classroom Deliverables
                              </span>
                              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 font-sans">
                                {pillar.deliverables.map((item, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-brand shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-amber-50 dark:bg-slate-900/80 p-3 rounded-lg border border-amber-200 dark:border-slate-700 space-y-1.5 flex flex-col justify-center">
                              <span className="text-[10px] font-bold font-mono text-amber-900 dark:text-amber-300 uppercase block">
                                Pedagogical Impact
                              </span>
                              <p className="text-xs text-slate-800 dark:text-slate-200 font-sans font-semibold leading-relaxed">
                                💡 {pillar.pedagogicalImpact}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between pt-3 border-t border-amber-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-2.5 py-1 rounded-lg bg-amber-200/80 dark:bg-slate-800 hover:bg-amber-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 font-bold font-mono text-[10px]"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-900 dark:text-amber-300" /> : <Play className="w-3.5 h-3.5 text-amber-900 dark:text-amber-300" />}
                  <span>{isPlaying ? "AUTO-PLAY" : "PAUSED"}</span>
                </button>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Pillar {activePillarIndex + 1} of {PILLARS.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-amber-300 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
                  title="Previous Pillar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-amber-300 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
                  title="Next Pillar"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING BOTTOM-RIGHT CORNER STACKED INTERACTIVES SLIDESHOW WIDGET */}
      <div className="fixed bottom-4 right-4 z-40 max-w-sm w-full sm:w-80 pointer-events-auto">
        <AnimatePresence>
          {isCornerWidgetOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              className="bg-slate-950 text-white border-2 border-teal-500/50 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
                    <Layers3 className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                      Core Pillars Stack
                    </h5>
                    <p className="text-[9px] text-teal-300/80 font-mono">Interactives Slideshow</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsFullScreen(true)}
                    className="p-1 text-slate-400 hover:text-amber-300 transition-colors"
                    title="Expand Full Screen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCornerWidgetOpen(false)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="Minimize Corner Stack"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Stack Mini Cards */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar pr-1 [perspective:600px]">
                {PILLARS.map((pillar) => {
                  const isOpen = pillar.id === expandedId;
                  const IconComp = pillar.icon;
                  return (
                    <div
                      key={`mini-${pillar.id}`}
                      onClick={() => setExpandedId(pillar.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isOpen
                          ? "bg-teal-950/80 border-teal-400 text-white shadow-md translate-x-1"
                          : "bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <IconComp className={`w-3.5 h-3.5 ${isOpen ? "text-teal-400" : "text-slate-400"}`} />
                          <span className="text-xs font-bold font-sans">{pillar.shortWord}</span>
                        </div>
                        <span className="text-[9px] font-mono opacity-60">{pillar.pillarNumber}</span>
                      </div>

                      {isOpen && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[10px] text-slate-300 pt-1.5 leading-tight font-sans line-clamp-3 border-t border-teal-800/60 mt-1.5"
                        >
                          &quot;{pillar.definition}&quot;
                        </motion.p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:text-teal-300 font-bold"
                >
                  {isPlaying ? "⏸ PAUSE AUTO" : "▶ PLAY AUTO"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullScreen(true)}
                  className="text-amber-300 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Full Screen View</span>
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCornerWidgetOpen(true)}
              className="px-3.5 py-2.5 rounded-full bg-slate-950 text-white border-2 border-teal-500/80 shadow-2xl flex items-center gap-2 hover:scale-105 transition-all cursor-pointer micro-glow-teal"
            >
              <Layers3 className="w-4 h-4 text-teal-400 animate-pulse" />
              <span className="text-xs font-bold font-sans uppercase tracking-wider text-teal-200">
                Pillars Stack
              </span>
              <span className="w-2 h-2 rounded-full bg-teal-400" />
            </button>
          )}
        </AnimatePresence>
      </div>

      {/* FULL SCREEN MODAL VIEW */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl text-slate-100 flex flex-col p-4 sm:p-8 overflow-y-auto"
          >
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800 max-w-6xl mx-auto w-full shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                    Curriculum Core Pillars — Full Screen Interactive
                  </h2>
                  <p className="text-xs text-teal-300 font-sans">
                    Click any card in the stack to expand its definition and deliverables
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700 flex items-center gap-2 text-xs font-bold"
              >
                <span>Close Full Screen</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Interactive Stack Body in Full Screen */}
            <div className="max-w-5xl mx-auto w-full my-auto py-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Detail Inspector for Active Card */}
                <div className="lg:col-span-7 bg-slate-900/90 border-2 border-teal-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      {React.createElement(activePillar.icon, { className: "w-6 h-6 text-teal-400" })}
                      <div>
                        <span className="text-xs font-mono font-extrabold text-amber-400 uppercase tracking-widest block">
                          {activePillar.pillarNumber}
                        </span>
                        <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                          {activePillar.title}
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-800 font-bold">
                      {activePillar.accentBadge}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                      DEFINITION & SCOPE
                    </span>
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                      &quot;{activePillar.definition}&quot;
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-[10px] font-mono text-teal-400 uppercase font-bold block">
                        DELIVERABLES
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                        {activePillar.deliverables.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-950/30 p-4 rounded-2xl border border-amber-800/50 space-y-2 flex flex-col justify-center">
                      <span className="text-[10px] font-mono text-amber-300 uppercase font-bold block">
                        PEDAGOGICAL IMPACT
                      </span>
                      <p className="text-xs text-amber-100 font-sans font-medium leading-relaxed">
                        💡 {activePillar.pedagogicalImpact}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Stacked Interactive Selector */}
                <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
                    <span className="font-bold uppercase tracking-wider text-teal-400">Interactive Stack</span>
                    <span>Click to Expand</span>
                  </div>

                  <div className="space-y-2.5 [perspective:600px]">
                    {PILLARS.map((pillar) => {
                      const isOpen = pillar.id === expandedId;
                      const IconComp = pillar.icon;
                      return (
                        <div
                          key={`fs-${pillar.id}`}
                          onClick={() => setExpandedId(pillar.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            isOpen
                              ? "bg-teal-900/90 border-teal-400 text-white ring-2 ring-teal-400/30 scale-102"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg ${pillar.tabColor} flex items-center justify-center shrink-0`}>
                                <IconComp className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold font-sans text-white">
                                {pillar.shortWord}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold opacity-70">
                              {pillar.pillarNumber}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                    >
                      {isPlaying ? "⏸ PAUSE AUTO SLIDESHOW" : "▶ START AUTO SLIDESHOW"}
                    </button>
                    <span className="text-slate-500">5 Active Pillars</span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

