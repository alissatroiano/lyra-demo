import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
  retrying: boolean;
}

/**
 * Catches render errors so the app degrades to a message instead of a blank page.
 *
 * React unmounts the whole tree when a render throws and nothing catches it,
 * which is why instructors were returning to a Lyrah tab and finding white.
 * There is no recovery from that on the user's side — no error, no button,
 * nothing to click — and it reads as a dead product.
 *
 * A stale cached bundle is the most likely cause after a deploy: the browser
 * holds an index.html referencing chunks that no longer exist, the dynamic
 * import rejects, and the tree comes down. That case is worth handling
 * specifically, because a plain reload can serve the same stale file again.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  // @types/react is not a dependency of this project, so React.Component carries
  // no generics and the compiler cannot see these on the instance. Declaring
  // them keeps the boundary type-checked without pulling in React's types four
  // days before a deadline, which would newly type-check the whole app.
  declare props: Props;
  declare state: State;
  declare setState: (next: Partial<State>) => void;

  constructor(props: Props) {
    super(props);
    this.state = { error: null, retrying: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Lyrah render error:", error, info.componentStack);
  }

  /** A chunk that no longer exists on the server, i.e. the build moved on. */
  private isStaleBundle() {
    const message = `${this.state.error?.name || ""} ${this.state.error?.message || ""}`;
    return /ChunkLoadError|Loading chunk|dynamically imported module|Importing a module script failed/i.test(
      message
    );
  }

  private hardReload = async () => {
    this.setState({ retrying: true });

    // Clear any caches a service worker or the browser is holding, so the
    // reload fetches the current build rather than the one that just failed.
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      /* best effort */
    }

    // Cache-busted so an intermediary cannot hand back the same stale index.
    window.location.replace(`${window.location.pathname}?fresh=${Date.now()}`);
  };

  private startOver = () => {
    // Only view state is cleared. Nothing here touches the signed-in session or
    // anything saved to the cloud.
    try {
      localStorage.removeItem("lyra_free_lessons_count");
    } catch {
      /* ignore */
    }
    window.location.replace("/");
  };

  render() {
    if (!this.state.error) return this.props.children;

    const stale = this.isStaleBundle();

    return (
      <div className="min-h-screen bg-[#05070f] text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full space-y-5 text-center">
          <img
            src="/assets/images/favicon.png"
            alt=""
            className="w-16 h-20 object-contain mx-auto opacity-80"
          />

          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold text-teal-brand">
              {stale ? "Lyrah has been updated" : "Something went wrong"}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {stale
                ? "This tab is running an older version. Reloading will pick up the current one — your saved lessons are untouched."
                : "This page hit an error and stopped. Your saved lessons are safe in the cloud; nothing has been lost."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-1">
            <button
              type="button"
              onClick={this.hardReload}
              disabled={this.state.retrying}
              className="px-5 py-2.5 rounded-xl bg-teal-brand text-slate-950 font-display font-bold text-base disabled:opacity-60 cursor-pointer hover:bg-teal-300 transition-colors"
            >
              {this.state.retrying ? "Reloading…" : "Reload Lyrah"}
            </button>
            <button
              type="button"
              onClick={this.startOver}
              className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-display font-medium text-base cursor-pointer hover:border-teal-brand/50 transition-colors"
            >
              Back to the start
            </button>
          </div>

          {this.state.error?.message && (
            <details className="text-left pt-2">
              <summary className="text-[11px] text-slate-500 cursor-pointer hover:text-slate-400">
                Technical detail
              </summary>
              <pre className="mt-2 text-[10px] text-slate-500 whitespace-pre-wrap break-words bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
