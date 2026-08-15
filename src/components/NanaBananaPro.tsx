import React, { useState, useEffect, useRef } from "react";
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
  // Built from the lesson's own materials and steps. A prompt written only from
  // the title produces a picture of something plausible rather than a picture of
  // what the children are actually going to build — a water wheel made of spoons
  // for a lesson about paper cups, straws and washers.
  const materials = (lesson?.handsOnActivity?.materials || []).slice(0, 8).join(", ");
  const steps = (lesson?.handsOnActivity?.steps || []).slice(0, 4).join(" Then: ");

  const defaultPrompt =
    suggestion?.prompt?.trim() ||
    [
      `A clear, friendly instructional illustration for a children's STEM class.`,
      `Show the finished build from this activity: "${lesson?.handsOnActivity?.title || lesson?.lessonTitle || "this lesson"}".`,
      materials && `It is made ONLY from these materials, and every one should be recognisable: ${materials}.`,
      steps && `It is assembled like this: ${steps}`,
      `Draw exactly those materials — do not substitute similar-looking objects or add materials that are not listed.`,
      `Clean, simple, brightly lit, plain background, no text or labels.`,
    ]
      .filter(Boolean)
      .join(" ");

  const [prompt, setPrompt] = useState<string>(defaultPrompt);
  const [image, setImage] = useState<string | null>(lesson?.generatedVisuals?.[0]?.url || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoRan = useRef(false);

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

  // Auto-draw when Lyrah has decided this lesson needs a picture. An instructor
  // opening the tab wants to see the diagram, not be handed a prompt box and
  // asked to operate an image model.
  useEffect(() => {
    if (recommended && !image && !isLoading && !error && !autoRan.current) {
      autoRan.current = true;
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommended]);

  return (
    <div className="max-w-3xl space-y-4">
      {/* Why this picture exists, in the instructor's terms. */}
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
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
              {recommended ? "Here's what the build looks like" : "This lesson doesn't need a picture"}
            </p>
            <p className="text-xs text-secondary dark:text-slate-400 font-sans leading-relaxed">
              {suggestion.reason}
            </p>
          </div>
        </div>
      )}

      {/* The picture itself, or the fact that it is being drawn. */}
      {isLoading && (
        <div className="w-full aspect-video rounded-2xl border border-black/[0.08] dark:border-slate-700 bg-surface-1 dark:bg-slate-900 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 text-teal-brand animate-spin" />
          <p className="text-xs text-secondary dark:text-slate-400 font-sans">Drawing the build…</p>
        </div>
      )}

      {image && !isLoading && (
        <img
          src={image}
          alt={`Illustration for ${lesson?.lessonTitle || "this lesson"}`}
          className="w-full rounded-2xl border border-black/[0.08] dark:border-slate-700"
        />
      )}

      {error && !isLoading && (
        <p className="text-xs text-red-600 dark:text-red-400 font-sans" role="alert">
          {error}
        </p>
      )}

      {/* Two plain actions. No prompt box: the wording that drives the image is
          written from the lesson's own materials and is not something an
          instructor should have to read, let alone edit, mid-preparation. */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={isLoading}
          className="px-4 py-2.5 bg-teal-dark hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer font-sans"
        >
          <ImageIcon className="w-4 h-4 text-teal-brand" />
          <span>{image ? "Draw it differently" : "Draw the build"}</span>
        </button>

        {image && (
          <a
            href={image}
            download={`lyrah_${(lesson?.lessonTitle || "lesson").replace(/[^a-z0-9]+/gi, "_").toLowerCase()}.png`}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-black/[0.08] dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-sm font-bold transition-all flex items-center gap-2 font-sans"
          >
            <Download className="w-4 h-4" />
            <span>Print / save</span>
          </a>
        )}
      </div>
    </div>
  );
}
