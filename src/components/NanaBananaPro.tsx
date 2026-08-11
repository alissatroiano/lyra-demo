import React, { useState } from "react";
import { ImageIcon, Download, RefreshCw, Sparkles, Check } from "lucide-react";
import { ProcessedLesson, SavedVisual } from "../types";

interface NanaBananaProProps {
  lesson: ProcessedLesson;
  onUpdateVisuals: (visuals: SavedVisual[]) => void;
}

/**
 * Visual Studio — one lesson, one image, one button.
 *
 * This deliberately does very little. Lyrah saves instructors preparation
 * time; an illustration is a supporting detail, not the product. Lyrah also
 * decides during lesson generation whether an image is warranted at all
 * (`lesson.visualSuggestion`), so most lessons open on "no image needed"
 * rather than on a studio full of controls.
 */
export default function NanaBananaPro({ lesson, onUpdateVisuals }: NanaBananaProProps) {
  const suggestion = lesson?.visualSuggestion;
  const recommended = suggestion?.needed === true;

  // Lyrah's own prompt when she asked for an image; otherwise a plain fallback
  // built from the lesson so the manual path still works.
  const defaultPrompt =
    suggestion?.prompt?.trim() ||
    `A clear, child-friendly illustration for a STEM lesson titled "${lesson?.lessonTitle || "this lesson"}". ` +
      `Show the setup described here: ${lesson?.handsOnActivity?.title || lesson?.summary || ""}. ` +
      `Simple, uncluttered, no text labels.`;

  const [prompt, setPrompt] = useState<string>(defaultPrompt);
  const [image, setImage] = useState<string | null>(lesson?.generatedVisuals?.[0]?.url || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "16:9" }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || data.details || "Could not generate the image.");
      }

      const url = data.image
        ? `data:${data.mimeType || "image/png"};base64,${data.image}`
        : data.imageUrl;

      if (!url) throw new Error("The image service returned no image.");

      setImage(url);
      onUpdateVisuals([
        {
          id: String(Date.now()),
          url,
          prompt,
          style: "lesson-illustration",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Lyrah's call on whether this lesson needs a picture at all */}
      {suggestion && (
        <div
          className={`flex items-start gap-3 p-4 rounded-2xl border ${
            recommended
              ? "bg-teal-light/40 dark:bg-teal-brand/10 border-teal-brand/30"
              : "bg-surface-1 dark:bg-slate-900 border-black/[0.06] dark:border-slate-800"
          }`}
        >
          {recommended ? (
            <Sparkles className="w-4 h-4 text-teal-brand shrink-0 mt-0.5" />
          ) : (
            <Check className="w-4 h-4 text-secondary dark:text-slate-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 font-sans">
              {recommended ? "An illustration would help here" : "No illustration needed"}
            </p>
            <p className="text-xs text-secondary dark:text-slate-400 font-sans leading-relaxed">
              {suggestion.reason}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="visual-prompt"
          className="text-[10px] font-bold text-secondary dark:text-slate-300 uppercase tracking-wider font-sans block"
        >
          What should the picture show?
        </label>
        <textarea
          id="visual-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="w-full text-xs font-sans p-3 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-slate-700 text-slate-900 dark:text-slate-100 resize-y focus-visible:outline-2 focus-visible:outline-teal-brand"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={isLoading || !prompt.trim()}
          className="px-4 py-2.5 bg-teal-dark hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5 text-teal-brand" />
          )}
          <span>{isLoading ? "Generating…" : image ? "Generate again" : "Generate illustration"}</span>
        </button>

        {image && (
          <a
            href={image}
            download={`lyrah_${(lesson?.lessonTitle || "lesson").replace(/[^a-z0-9]+/gi, "_").toLowerCase()}.png`}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-black/[0.08] dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 font-sans" role="alert">
          {error}
        </p>
      )}

      {image && (
        <img
          src={image}
          alt={`Illustration for ${lesson?.lessonTitle || "this lesson"}`}
          className="w-full rounded-2xl border border-black/[0.08] dark:border-slate-700"
        />
      )}
    </div>
  );
}
