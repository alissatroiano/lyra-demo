import React from "react";
import { Sparkles, ArrowRight, Layers, Activity, Palette, HelpCircle, Link2Off, Check, Database, FileCode, BookOpen, LogIn, Clock, Users, Briefcase, Play } from "lucide-react";

interface LandingPageProps {
  onLaunchStudio: () => void;
  onSelectPlan: () => void;
  user: any;
  onSignIn: () => void;
  onWatchDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchStudio,
  onSelectPlan,
  user,
  onSignIn,
  onWatchDemo,
}) => {
  return (
    <main className="px-6 sm:px-8 py-8 space-y-12 animate-fade-in flex-1 max-w-7xl mx-auto w-full">
      {/* Landing Hero Section */}
      <header className="py-10 px-6 sm:px-10 relative overflow-hidden bg-gradient-to-b from-teal-light/30 via-teal-light/10 to-transparent dark:from-slate-900/90 dark:via-slate-900/40 dark:to-transparent rounded-3xl border border-teal-brand/15 dark:border-slate-800 shadow-3xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-brand/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-xl">
            <h2 className="font-display text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              Say goodbye to <span className="text-teal-700 dark:text-teal-brand underline decoration-amber-400 dark:decoration-amber-500 underline-offset-6">long, wordy lesson plans</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-normal">
              Paste in the curriculum you already have. Get slides, a hands-on lab checklist, a printable
              worksheet with the answer key, and a review game — with the dead video links already flagged.
              Ready to teach, not ready to edit for two more hours.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={onLaunchStudio}
                  className="px-6 py-3.5 bg-teal-800 dark:bg-teal-600 hover:bg-slate-900 dark:hover:bg-teal-500 text-white rounded-2xl text-base sm:text-lg font-display font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 cursor-pointer border border-teal-brand/30 group"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>Enter Instructor Studio</span>
                  <ArrowRight className="w-4 h-4 text-teal-light group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 rounded-2xl text-base sm:text-lg font-display font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 cursor-pointer border border-amber-300/60 group"
                >
                  <LogIn className="w-4.5 h-4.5 text-slate-950" />
                  <span>Sign In / Create Account to Launch Studio</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {/* Watching Lyrah run once is a faster explanation than any amount
                  of landing copy, and it needs no sign-in. */}
              <button
                type="button"
                onClick={onWatchDemo}
                className="px-5 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl text-base sm:text-lg font-display font-medium transition-all border border-teal-brand/40 dark:border-teal-brand/30 shadow-3xs cursor-pointer flex items-center gap-2 group"
              >
                <Play className="w-4 h-4 text-amber-500" />
                <span>Watch a 30-second demo</span>
              </button>

              <button
                type="button"
                onClick={() => document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" })}
                className="px-5 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl text-base sm:text-lg font-display font-medium transition-all border border-slate-200 dark:border-slate-700 shadow-3xs cursor-pointer flex items-center gap-2"
              >
                <span>View Pricing Plans</span>
              </button>
            </div>

            {/* Instructors read "no password" as "no real account" and hesitate at
                checkout. Saying why there is no password turns it into a reason
                to trust the sign-in rather than a gap in it. */}
            {!user && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans pt-1">
                No new password to remember — sign in with the Google account you already use.
              </p>
            )}
          </div>

          {/* Lyra: the lyre. The constellation sailors steered by, and the
              instrument that makes separate strings sound like one piece. */}
          <div className="self-center md:self-auto shrink-0 relative animate-float">
            <div className="absolute inset-0 bg-teal-brand/20 blur-3xl rounded-full scale-90 pointer-events-none" />
            <img
              src="/assets/images/favicon.png"
              alt="The constellation Lyra"
              className="relative w-28 h-36 sm:w-32 sm:h-44 object-contain drop-shadow-[0_0_28px_rgba(45,212,191,0.35)]"
            />
            <div className="mt-3 text-center relative">
           
            </div>
          </div>
        </div>
      </header>

      {/* The problem, stated before the product. An instructor should recognise
          their own week in this block before being asked to care how it works. */}
      <section className="space-y-4" id="problem-section">
        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-[0.18em]">
          The problem Lyrah solves
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: Clock,
              title: "Hours of manual preparation",
              body: "Teachers spend an average of 10–15 hours a week outside class converting textbook chapters into slides and worksheets."
            },
            {
              icon: Link2Off,
              title: "Broken media links & references",
              body: "Shared curriculum templates often contain dead URLs and outdated video links that disrupt classrooms."
            },
            {
              icon: Users,
              title: "Catering to neurodiverse learning",
              body: "It's incredibly difficult to adapt a single standard lesson plan to dyslexic, ADHD, and tactile learners in the same class."
            },
            {
              icon: Briefcase,
              title: "Disorganized teacher notes",
              body: "Facilitator scripts and lesson modifications are often stored across separate emails, drives, and printouts."
            }
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex items-start gap-3.5 p-5 rounded-2xl bg-surface-1 dark:bg-cyber-card border border-black/[0.06] dark:border-slate-800"
            >
              <Icon className="w-5 h-5 text-teal-brand shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display leading-snug landing-snug">
                  {title}
                </h4>
                <p className="text-xs text-secondary dark:text-slate-400 font-sans leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How Lyrah works — five steps in the order they actually run, so the
          numbering carries real sequence rather than decoration. */}
      <section className="space-y-4" id="pipeline-section">
        <span className="text-[11px] font-mono font-bold text-amber-500  uppercase tracking-[0.18em]">
          How Lyrah works
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-display leading-snug text-lg">
          {[
            {
              icon: FileCode,
              tint: "text-teal-brand",
              title: "Material Ingestion",
              body: "Upload any textbook PDF, DOCX, or pasted lesson plan up to 50 pages long."
            },
            {
              icon: Check,
              tint: "text-teal-brand",
              title: "Invariant Extraction",
              body: "Our AI extractors safely parse and outline key STEM concepts and learning goals."
            },
            {
              icon: Palette,
              tint: "text-teal-brand",
              title: "Media Recommendation",
              body: "Generates high-yield safe search queries for animated videos and live science demos."
            },
            {
              icon: Layers,
              tint: "text-teal-brand",
              title: "Layout Generation",
              body: "Assembles beautifully structured slide decks, teaching scripts, and gamified quizzes."
            },
            {
              icon: Activity,
              tint: "text-teal-brand",
              title: "Student Adaptation",
              body: "Applies dyslexia-friendly bionic formatting and phonetic aids to the outputs."
            }
          ].map(({ icon: Icon, tint, title, body }, i) => (
            <div
              key={title}
              className="flex flex-col gap-3 p-5 rounded-2xl bg-surface-2 dark:bg-cyber-card border border-black/[0.06] dark:border-slate-800"
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tint}`}>
                <Icon className="w-5 h-5" />
              </span>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display leading-snug">
                {i + 1}. {title}
              </h4>
              <p className="text-xs text-secondary dark:text-slate-400 font-sans leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Complete Lesson Suite Showcase */}
      <div className="space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-[10px] font-bold text-gold-brand uppercase tracking-widest font-sans">ACTIVE CURRICULUM SUITE</span>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-teal-dark dark:text-teal-brand">Everything Needed For An Active STEM Classroom</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-3xs hover:border-teal-brand/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-light dark:bg-teal-brand/20 text-teal-brand flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-base">Interactive Smartboard Slides</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Visual classroom slide decks with step-by-step teaching analogies, full-screen expansion mode, core takeaways, and instructor speaking notes.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-3xs hover:border-teal-brand/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-base">Hands-On Engineering Labs</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Step-by-step physical build instructions, material checklists with interactive checkmarks, and scientific principle breakdowns.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-3xs hover:border-teal-brand/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-base">🎨 Visual Studio</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Generates rich visual conceptual diagrams for hands-on experiments and lessons with custom art styles and high-yield prompts.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-3xs hover:border-teal-brand/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-base">Smartboard Trivia Quizzes</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Gamified classroom quizzes with instant score tracking, correct answer explanations, and team participation modes.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-3xs hover:border-teal-brand/40 transition-all sm:col-span-2 lg:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 flex items-center justify-center font-bold">
              <Link2Off className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-100 text-base">Google SafeSearch Media Recovery</h4>
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
          <h3 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">Curriculum Efficiency Accomplished</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-1 shadow-3xs">
            <span className="font-display text-4xl font-bold text-teal-600 dark:text-teal-brand block leading-none">14,200+</span>
            <span className="text-[10px] font-bold text-teal-900 dark:text-teal-brand uppercase font-sans tracking-wide">Instructor Hours Saved</span>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-normal">Unpaid prep time reduced to zero.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-1 shadow-3xs">
            <span className="font-display text-4xl font-bold text-teal-600 dark:text-teal-brand block leading-none">250+</span>
            <span className="text-[10px] font-bold text-teal-900 dark:text-teal-brand uppercase font-sans tracking-wide">Schools & Camps</span>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-normal">Active deployments across regions.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-1 shadow-3xs">
            <span className="font-display text-4xl font-bold text-teal-600 dark:text-teal-brand block leading-none">$0</span>
            <span className="text-[10px] font-bold text-teal-900 dark:text-teal-brand uppercase font-sans tracking-wide">District Friction</span>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-normal">Fully offline/cloud hybrid compatible.</p>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="pt-4 space-y-8" id="pricing-section">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-200 uppercase tracking-widest font-sans bg-amber-100/60 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            INSTRUCTOR PLANS
          </span>
          <h3 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100">Simple, Transparent Pricing</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto font-sans">
            Built for the instructor preparing tomorrow’s class tonight. Pay once, or subscribe for the term.
          </p>
        </div>

        {/* Two plans only. Educator Pro and Educator Yearly are held back for a
            later launch and documented in docs/BUSINESS-MODEL.md; showing them
            now would bury the $12.99 offer instructors are actually being given. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Plan 1: Summer STEM Special - $12.99 ONE TIME (leads) */}
          <div className="bg-gradient-to-b from-teal-dark via-teal-900 to-slate-900 text-white rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-lg relative border-2 border-teal-brand/40 overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-3.5 py-1 rounded-bl-xl uppercase tracking-wider font-mono shadow-xs">
              SUMMER SPECIAL
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider bg-black/30 px-2.5 py-1 rounded-md border border-amber-400/30 inline-block">
                  ONE TIME CHARGE
                </span>
                <h4 className="font-display text-2xl font-bold text-white">Summer STEM Special</h4>
                <p className="text-xs text-teal-100/80 font-sans">Special summer offer for educators &amp; camps. Full access for a single low charge.</p>
                <p className="text-[10px] font-bold text-amber-300 font-sans uppercase tracking-wide">Ends 08/31/26</p>
              </div>

              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="font-display text-4xl font-bold text-amber-300">$12.99</span>
                <span className="text-xs text-teal-200 font-sans font-medium">one-time charge</span>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs text-teal-100 font-sans">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-300 shrink-0" />
                  <span><strong>Full access for one instructor</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Single $12.99 one-time payment (No subscription)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Unlimited AI lesson transformations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Summer curriculum &amp; camp templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Instant activation &amp; Stripe checkout</span>
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
              <span>Get Summer STEM Special ($12.99 One-Time)</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>

          {/* Plan 2: Instructor Monthly - $9.99/mo */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-sm hover:border-teal-brand transition-all relative">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-teal-900 dark:text-teal-brand uppercase tracking-wider bg-teal-50 dark:bg-teal-brand/20 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-brand/30 inline-block">
                  ONGOING ACCESS
                </span>
                <h4 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">Instructor Monthly</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">For instructors running new material every week through the school year.</p>
              </div>

              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="font-display text-4xl font-extrabold text-teal-900 dark:text-teal-brand">$9.99</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium">/ month</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">Recurring monthly. Cancel anytime from your dashboard.</p>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-sans">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span><strong>Everything in the Summer STEM Special</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span>Unlimited lessons every month, not a one-off</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span>Your lesson library carries across the whole term</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-brand shrink-0" />
                  <span>Cancel yourself, any time, no email required</span>
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
              <span>Get Instructor Monthly ($9.99/mo)</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Infrastructure & Stack - MOVED ALL THE WAY TO THE BOTTOM */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-10 space-y-6" id="stack-section">
        <div className="text-center space-y-1.5">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest font-sans">SECURE, SCALABLE FOUNDATION</span>
          <h3 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">Modern Stack & Platform Standards</h3>
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
