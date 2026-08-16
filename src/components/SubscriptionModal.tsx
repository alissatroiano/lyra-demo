import React, { useState } from "react";
import { Lock, CreditCard, CheckCircle2, ShieldCheck, Sparkles, LogIn, X } from "lucide-react";

interface SubscriptionModalProps {
  user: any;
  signInWithGoogle: () => void;
  onSubscribe: (plan: string, cardDetails: any) => Promise<void>;
  onClose?: () => void;
  authLoading: boolean;
}

export const STRIPE_PUBLIC_KEY = "pk_live_51NcyntHSk9zSqYTt2S2OH75n7DKrXoTpkPTeGqZ9ndOrSAOOqGZEiLbNNKk449JQ0c2vFmWiZNeIm0o1HcdIs2qf00WRqNovyW";

export default function SubscriptionModal({
  user,
  signInWithGoogle,
  onSubscribe,
  onClose,
  authLoading
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"intro" | "summer">("summer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    const priceId = selectedPlan === "summer"
      ? "price_1U2YXoKExpIuZ5d51zCqxK1f"
      : "price_1U2OwBKExpIuZ5d5bmfH68py";

    try {
      // 1. First try creating real Stripe Checkout session
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          plan: selectedPlan === "summer" ? "summer_1299" : "intro_999",
          priceId
        })
      });

      const data = await res.json();

      if (res.ok && data.url) {
        // Redirect user to official secure Stripe Checkout page to process live payment!
        window.location.href = data.url;
        return;
      }

      // Checkout is the only way to pay. There is deliberately no fallback that
      // grants access without a completed Stripe payment.
      throw new Error(data.details || data.error || "Could not start Stripe checkout. Please try again.");
    } catch (err: any) {
      console.error("Subscription payment error:", err);
      setError(err.message || "An error occurred while processing your payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
      {/* Anchored to the top of the viewport rather than centered: a centered
          modal taller than the screen opens with its header already scrolled
          above the fold, which is what was cutting off "Unlock Full Access"
          and the pay button. Capped to the viewport height with its own
          scrollbar so both ends stay reachable regardless of content length. */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl max-w-xl w-full border border-teal-brand/30 dark:border-slate-800 overflow-y-auto max-h-[calc(100vh-2rem)] sm:max-h-[85vh] my-4 sm:my-8 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-dark via-teal-800 to-teal-dark p-6 sm:p-8 text-white relative">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-teal-200 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center justify-between mb-3 pr-8">
            <div className="flex items-center gap-2.5 bg-teal-brand/20 border border-teal-brand/30 px-3 py-1 rounded-full text-xs font-bold text-teal-brand">
              <Sparkles className="w-3.5 h-3.5 text-gold-brand" />
              <span>Lyrah Pro Membership</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-teal-200 bg-black/20 px-2.5 py-1 rounded-md font-mono">
              <Lock className="w-3 h-3 text-teal-brand" />
              <span>Stripe Encrypted</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Unlock Full Access to Lyrah
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-2 font-sans leading-relaxed">
            Please sign in and activate your educator subscription to build interactive STEM lesson decks, worksheets, interactive display quizzes, and AI co-teacher tools.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6 font-sans">
          {/* Step 1: Login Check */}
          {!user ? (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center justify-center mx-auto">
                <LogIn className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-amber-950 dark:text-amber-200 text-lg">Step 1: Sign In First</h3>
                <p className="text-xs text-amber-900/90 dark:text-amber-300 mt-1 max-w-md mx-auto">
                  Signing in links your purchase to your account, so your lessons are waiting for you next time.
                </p>
              </div>
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={authLoading}
                className="px-6 py-3 bg-teal-dark hover:bg-teal-900 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-teal-brand" />
                <span>{authLoading ? "Connecting..." : "Sign In with Google"}</span>
              </button>
              {/* Instructors read "no password" as "no real account", and hesitate
                  to pay. Naming the choice turns an absence into a reason. */}
              <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 max-w-sm mx-auto leading-relaxed">
                No new password to remember — your Google account signs you in and keeps your lessons secure.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Authenticated user indicator */}
              <div className="flex items-center justify-between bg-teal-50/80 dark:bg-slate-800 border border-teal-brand/20 dark:border-slate-700 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-teal-brand/30" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-teal-dark text-white font-bold flex items-center justify-center text-xs">
                      {user.displayName?.[0] || user.email?.[0] || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-teal-950 dark:text-slate-100">{user.displayName || "Logged In Educator"}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{user.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-teal-900 dark:text-teal-brand bg-teal-200/60 dark:bg-teal-brand/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-teal-700 dark:text-teal-brand" /> Signed In
                </span>
              </div>

              {/* Plan Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">Choose Plan</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Summer Special leads: it spans the full row so it reads as
                      the intended choice, not one option among equals. */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("summer")}
                    className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                      selectedPlan === "summer"
                        ? "border-amber-500 dark:border-amber-400 bg-amber-50/80 dark:bg-amber-950/30 shadow-sm ring-2 ring-amber-500/30"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <span className="absolute -top-2.5 left-2 bg-amber-500 text-slate-950 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                      Summer Special
                    </span>
                    <div className="flex justify-between items-start mt-1">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">Summer STEM Special</span>
                      <input type="radio" checked={selectedPlan === "summer"} onChange={() => {}} className="accent-amber-600" />
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <p className="text-lg font-serif font-extrabold text-amber-900 dark:text-amber-300">$12.99<span className="text-[9px] font-sans font-normal text-slate-600 dark:text-slate-400"> one-time</span></p>
                    </div>
                    <p className="text-[9px] text-slate-600 dark:text-slate-400 mt-1 leading-tight">One-time charge (no subscription)</p>
                    <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400 mt-1 leading-tight">Ends 08/31/26</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan("intro")}
                    className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                      selectedPlan === "intro"
                        ? "border-teal-600 dark:border-teal-brand bg-teal-50 dark:bg-teal-brand/10 shadow-sm ring-2 ring-teal-500/30"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <span className="absolute -top-2.5 left-2 bg-teal-dark text-teal-brand text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs border border-teal-brand/40">
                      Monthly
                    </span>
                    <div className="flex justify-between items-start mt-1">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">Instructor Monthly</span>
                      <input type="radio" checked={selectedPlan === "intro"} onChange={() => {}} className="accent-teal-700" />
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <p className="text-lg font-serif font-extrabold text-teal-900 dark:text-teal-brand">$9.99<span className="text-[9px] font-sans font-normal text-slate-600 dark:text-slate-400"> / month</span></p>
                    </div>
                    <p className="text-[9px] text-slate-600 dark:text-slate-400 mt-1 leading-tight">Unlimited lessons, every month.</p>
                  </button>

                </div>
              </div>

              {/* Card details are collected by Stripe Checkout on Stripe's own
                  domain. Lyrah never sees or transmits a card number, which is
                  what keeps it out of PCI scope. */}
              <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl">
                <ShieldCheck className="w-4 h-4 text-teal-800 dark:text-teal-brand shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">You'll finish payment on Stripe</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Continuing takes you to Stripe's secure checkout to enter your card
                    and any promotion code. Lyrah never receives your card details.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs rounded-xl">
                  {error}
                </div>
              )}

              {/* Ties the charge to a named account. Someone unsure whether they
                  "really have an account" is being asked for money — showing whose
                  purchase this is answers that at the moment it matters. */}
              <p className="text-center text-[11px] text-slate-600 dark:text-slate-400">
                Purchasing as <span className="font-bold text-slate-800 dark:text-slate-200">{user.email}</span>
              </p>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-teal-dark to-teal-800 hover:from-teal-800 hover:to-teal-dark text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-teal-brand" />
                <span>{loading ? "Processing Stripe Payment..." : `Pay ${selectedPlan === "summer" ? "$12.99" : "$9.99"} & Activate`}</span>
              </button>

              <div className="text-center text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                <span>Secure SSL Payment</span>
                <span>•</span>
                <span>Powered by Stripe API</span>
                <span>•</span>
                <span>Cancel Anytime</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
