import React from "react";
import { Sparkles, ArrowRight, Layers, Activity, Palette, HelpCircle, Link2Off, Check, Database, FileCode, BookOpen, LogIn } from "lucide-react";
import { RobotBunnyMascot } from "../App";

interface LandingPageProps {
  onLaunchStudio: () => void;
  onSelectPlan: () => void;
  user: any;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchStudio,
  onSelectPlan,
  user,
  onSignIn,
}) => {
  return (
    <main className="px-6 sm:px-8 py-8 space-y-12 animate-fade-in flex-1 max-w-7xl mx-auto w-full">
      {/* Landing Hero Section */}
      <header className="py-10 px-6 sm:px-10 relative overflow-hidden bg-gradient-to-b from-teal-light/30 via-teal-light/10 to-transparent dark:from-slate-900/90 dark:via-slate-900/40 dark:to-transparent rounded-3xl border border-teal-brand/15 dark:border-slate-800 shadow-3xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-brand/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wider font-sans">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>XPRIZE · Education & Human Potential</span>
            </div>

            <h1 className="font-serif text-3.5xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              Transform Plain STEM Lessons into <span className="text-teal-700 dark:text-teal-brand underline decoration-amber-400 dark:decoration-amber-500 underline-offset-6">Interactive Visual Adventures</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-normal">
              Pyxias automatically restructures dense science articles, raw textbooks, and outline PDFs into classroom-ready smartboard slides, hands-on engineering labs, Nana Banana Pro visual diagrams, and interactive quizzes.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={onLaunchStudio}
                  className="px-6 py-3.5 bg-teal-800 dark:bg-teal-600 hover:bg-slate-900 dark:hover:bg-teal-500 text-white rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 cursor-pointer border border-teal-brand/30 group"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>Enter Instructor Studio</span>
                  <ArrowRight className="w-4 h-4 text-teal-light group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 cursor-pointer border border-amber-300/60 group"
                >
                  <LogIn className="w-4.5 h-4.5 text-slate-950" />
                  <span>Sign In / Create Account to Launch Studio</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <button
                type="button"
                onClick={() => document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" })}
                className="px-5 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl text-xs sm:text-sm font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-3xs cursor-pointer flex items-center gap-2"
              >
                <span>View Pricing Plans</span>
              </button>
            </div>
          </div>

          {/* Mascot Illustration */}
          <div className="self-center md:self-auto shrink-0 bg-white/80 dark:bg-slate-900/90 border border-teal-brand/20 dark:border-slate-800 rounded-3xl p-6 shadow-md animate-float relative">
            <RobotBunnyMascot className="w-32 h-32 sm:w-36 sm:h-36" />
            <div className="mt-3 text-center">
              <span className="text-[10px] font-extrabold font-mono text-teal-900 dark:text-teal-brand bg-teal-light/60 dark:bg-teal-brand/20 px-2.5 py-1 rounded-full uppercase tracking-wide">
                Pyxias AI Co-Teacher
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Pipeline: How Pyxias Transforms Lessons */}
      <div className="bg-teal-dark text-white rounded-3xl p-8 space-y-6 shadow-sm relative overflow-hidden" id="pipeline-section">
        <div className="text-center space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-teal-brand uppercase tracking-widest">HOW PYXIAS TRANSFORMS LESSONS</span>
          <h3 className="font-serif text-2xl font-bold text-teal-light">The Interactive Pipeline</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2 text-left">
          <div className="bg-black/[0.2] p-5 rounded-2xl border border-white/[0.08] space-y-2">
            <span className="text-[10px] font-mono text-teal-brand block font-bold">STAGE 01</span>
            <h5 className="text-sm font-bold font-sans">Raw Curriculum Intake</h5>
            <p className="text-xs text-teal-light/80 leading-relaxed font-sans">Drop standard textbooks, plain articles, or raw outlines into the parser.</p>
          </div>

          <div className="bg-black/[0.2] p-5 rounded-2xl border border-white/[0.08] space-y-2">
            <span className="text-[10px] font-mono text-teal-brand block font-bold">STAGE 02</span>
            <h5 className="text-sm font-bold font-sans">AI Alignment Engine</h5>
            <p className="text-xs text-teal-light/80 leading-relaxed font-sans">Gemini restructures text into active gamified modules tailored for specific age groups.</p>
          </div>

          <div className="bg-black/[0.2] p-5 rounded-2xl border border-white/[0.08] space-y-2">
            <span className="text-[10px] font-mono text-teal-brand block font-bold">STAGE 03</span>
            <h5 className="text-sm font-bold font-sans">Multi-Channel Outputs</h5>
            <p className="text-xs text-teal-light/80 leading-relaxed font-sans">Instantly yields slides, experimental guides, Visual Studio diagrams, and quiz modules.</p>
          </div>
        </div>
      </div>

      {/* Complete Lesson Suite Showcase */}
      <div className="space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-[10px] font-bold text-gold-brand uppercase tracking-widest font-sans">ACTIVE CURRICULUM SUITE</span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-teal-dark dark:text-teal-brand">Everything Needed For An Active STEM Classroom</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-3xs hover:border-teal-brand/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-light dark:bg-teal-brand/20 text-teal-brand flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-base">Interactive Smartboard Slides</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Visual classroom slide decks with step-by-step teaching analogies, full-screen expansion mode, core takeaways, and instructor speaking notes.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-3xs hover:border-teal-brand/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-base">Hands-On Engineering Labs</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Step-by-step physical build instructions, material checklists with interactive checkmarks, and scientific principle breakdowns.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-3xs hover:border-teal-brand/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-base">🎨 Visual Studio</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Generates rich visual conceptual diagrams for hands-on experiments and lessons with custom art styles and high-yield prompts.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-3xs hover:border-teal-brand/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-base">Smartboard Trivia Quizzes</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Gamified classroom quizzes with instant score tracking, correct answer explanations, and team participation modes.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-3xs hover:border-teal-brand/40 transition-all sm:col-span-2 lg:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 flex items-center justify-center font-bold">
              <Link2Off className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-base">Google SafeSearch Media Recovery</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Detects dead links in outdated lesson plans and instantly provides grounded, explicit-content-filtered Google SafeSearch video demonstrations.
            </p>
          </div>
        </div>
      </div>

      {/* Proven Pedagogical Metrics */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-6" id="metrics-section">
        <div className="text-center space-y-1.5">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest font-sans">PROVEN PEDAGOGICAL METRICS</span>
          <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">Curriculum Efficiency Accomplished</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-1 shadow-3xs">
            <span className="font-serif text-4xl font-bold text-teal-600 dark:text-teal-brand block leading-none">14,200+</span>
            <span className="text-[10px] font-bold text-teal-900 dark:text-teal-brand uppercase font-sans tracking-wide">Instructor Hours Saved</span>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-normal">Unpaid prep time reduced to zero.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-1 shadow-3xs">
            <span className="font-serif text-4xl font-bold text-teal-600 dark:text-teal-brand block leading-none">250+</span>
            <span className="text-[10px] font-bold text-teal-900 dark:text-teal-brand uppercase font-sans tracking-wide">Schools & Camps</span>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-normal">Active deployments across regions.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-1 shadow-3xs">
            <span className="font-serif text-4xl font-bold text-teal-600 dark:text-teal-brand block leading-none">$0</span>
            <span className="text-[10px] font-bold text-teal-900 dark:text-teal-brand uppercase font-sans tracking-wide">District Friction</span>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-normal">Fully offline/cloud hybrid compatible.</p>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="pt-4 space-y-8" id="pricing-section">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-200 uppercase tracking-widest font-sans bg-amber-100/60 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            STEM & STEAM EDUCATOR PLANS
          </span>
          <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">Simple, Transparent Pricing</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto font-sans">
            Transparent plans built for teachers, camps, and afterschool directors. Upgrade or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Plan 1: STEM Educator Pro - $12.99 slashed out -> $9.99/mo */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-sm hover:border-teal-brand transition-all relative">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-teal-900 dark:text-teal-brand uppercase tracking-wider bg-teal-50 dark:bg-teal-brand/20 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-brand/30 inline-block">
                  INDIVIDUAL TEACHER
                </span>
                <h4 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">Educator Pro</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Designed for single STEM/STEAM classroom teachers & lab instructors.</p>
              </div>

              <div className="flex items-baseline gap-2 pt-2">
                <span className="line-through text-slate-400 dark:text-slate-500 font-serif text-2xl font-normal">$12.99</span>
                <span className="font-serif text-4xl font-extrabold text-teal-900 dark:text-teal-brand">$9.99</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium">/ month</span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-sans">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span>Unlimited AI lesson transformations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span>Interactive smartboard slide decks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span>Hands-on lab guides & checklists</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span>🍌 Nana Banana Pro visual diagrams</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span>Gamified smartboard trivia quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span>Google SafeSearch media recovery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span>Cloud Firestore persistent saving</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!user) {
                  onSignIn();
                } else {
                  onSelectPlan();
                }
              }}
              className="w-full py-3 bg-teal-800 dark:bg-teal-600 hover:bg-slate-900 dark:hover:bg-teal-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Educator Pro ($9.99/mo)</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>

          {/* Plan 2: Educator Yearly - $99.00 */}
          <div className="bg-white dark:bg-slate-900 border-2 border-teal-brand/60 rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-md hover:border-teal-brand transition-all relative">
            <div className="absolute -top-3 right-4 bg-teal-brand text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider font-mono shadow-xs">
              BEST VALUE
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-teal-900 dark:text-teal-brand uppercase tracking-wider bg-teal-50 dark:bg-teal-brand/20 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-brand/30 inline-block">
                  ANNUAL PASS
                </span>
                <h4 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">Educator Yearly</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Full annual access to all Pyxias STEM AI co-teacher tools ($8.25/mo).</p>
              </div>

              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="font-serif text-4xl font-extrabold text-teal-900 dark:text-teal-brand">$99.00</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium">/ year</span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-sans">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span><strong>Everything in Educator Pro</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span>Save over 17% compared to monthly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span>Priority access to new AI model updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span>Dedicated educator support channel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span>Full year of persistent cloud storage</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!user) {
                  onSignIn();
                } else {
                  onSelectPlan();
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-teal-dark to-teal-800 dark:from-teal-600 dark:to-teal-500 hover:from-teal-900 hover:to-teal-950 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Educator Yearly ($99.00/yr)</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>

          {/* Plan 3: STEM Camp Director - $49.99 */}
          <div className="bg-gradient-to-b from-teal-dark via-teal-900 to-slate-900 text-white rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-lg relative border-2 border-teal-brand/40 overflow-hidden">
            <div className="absolute top-0 right-0 bg-gold-brand text-slate-950 text-[10px] font-extrabold px-3.5 py-1 rounded-bl-xl uppercase tracking-wider font-mono shadow-xs">
              DIRECTORS & CAMPS
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider bg-black/30 px-2.5 py-1 rounded-md border border-amber-400/30 inline-block">
                  CAMP & AFTERSCHOOL
                </span>
                <h4 className="font-serif text-2xl font-bold text-white">STEM Camp Director</h4>
                <p className="text-xs text-teal-100/80 font-sans">Built for multi-instructor STEM camps, summer programs & directors.</p>
              </div>

              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="font-serif text-4xl font-bold text-amber-300">$49.99</span>
                <span className="text-xs text-teal-200 font-sans font-medium">/ month</span>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs text-teal-100 font-sans">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-300 shrink-0" />
                  <span><strong>Everything in Educator Pro</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Multi-instructor team workspace & sharing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Custom camp curriculum alignment templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Priority AI generation speed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Dedicated camp onboarding & setup support</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!user) {
                  onSignIn();
                } else {
                  onSelectPlan();
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Choose Camp Director ($49.99/mo)</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      </div>

      {/* Infrastructure & Stack - MOVED ALL THE WAY TO THE BOTTOM */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-10 space-y-6" id="stack-section">
        <div className="text-center space-y-1.5">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest font-sans">SECURE, SCALABLE FOUNDATION</span>
          <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">Modern Stack & Platform Standards</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl text-center space-y-1.5 border border-slate-200 dark:border-slate-800 shadow-3xs">
            <Sparkles className="w-5 h-5 text-teal-brand mx-auto" />
            <h6 className="text-[10px] font-bold text-teal-900 dark:text-teal-brand uppercase font-sans">Gemini 1.5 Flash</h6>
            <p className="text-[9px] text-slate-600 dark:text-slate-300 font-sans leading-normal">Smart curriculum restructuring.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl text-center space-y-1.5 border border-slate-200 dark:border-slate-800 shadow-3xs">
            <Database className="w-5 h-5 text-teal-brand mx-auto" />
            <h6 className="text-[10px] font-bold text-teal-900 dark:text-teal-brand uppercase font-sans">Cloud Firestore</h6>
            <p className="text-[9px] text-slate-600 dark:text-slate-300 font-sans leading-normal">Durable persistent state storage.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl text-center space-y-1.5 border border-slate-200 dark:border-slate-800 shadow-3xs">
            <FileCode className="w-5 h-5 text-teal-brand mx-auto" />
            <h6 className="text-[10px] font-bold text-teal-900 dark:text-teal-brand uppercase font-sans">TypeScript React</h6>
            <p className="text-[9px] text-slate-600 dark:text-slate-300 font-sans leading-normal">Statically typed components.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl text-center space-y-1.5 border border-slate-200 dark:border-slate-800 shadow-3xs">
            <BookOpen className="w-5 h-5 text-teal-brand mx-auto" />
            <h6 className="text-[10px] font-bold text-teal-900 dark:text-teal-brand uppercase font-sans">Tailwind v4</h6>
            <p className="text-[9px] text-slate-600 dark:text-slate-300 font-sans leading-normal">Responsive design utility tokens.</p>
          </div>
        </div>
      </div>
    </main>
  );
};
