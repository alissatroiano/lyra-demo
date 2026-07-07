import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Video, 
  RefreshCw, 
  AlertCircle, 
  Sliders, 
  Monitor, 
  Smartphone, 
  Download, 
  Check, 
  Play, 
  Clock,
  ChevronRight,
  Database,
  Key
} from "lucide-react";
import { ProcessedLesson } from "../types";

interface VideoLabProps {
  lesson: ProcessedLesson;
  onTriggerPaidFlow: () => void;
}

interface GeneratedVideoItem {
  id: string;
  prompt: string;
  mode: string;
  aspectRatio: "16:9" | "9:16";
  videoUrl: string;
  timestamp: string;
}

export default function VideoLab({ lesson, onTriggerPaidFlow }: VideoLabProps) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"3d_animation" | "cut_scene" | "cartoon" | "instructors_choice">("3d_animation");
  const [customStylePrompt, setCustomStylePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [resolution, setResolution] = useState<"720p" | "1080p">("720p");
  
  const [status, setStatus] = useState<"idle" | "generating" | "polling" | "downloading" | "completed" | "error">("idle");
  const [progressMsg, setProgressMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [operationName, setOperationName] = useState("");
  
  const [videosHistory, setVideosHistory] = useState<GeneratedVideoItem[]>([]);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Poll interval reference
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set default prompt based on current lesson
  useEffect(() => {
    if (lesson) {
      setPrompt(`A visual explanation of ${lesson.lessonTitle}. Focusing on: ${lesson.summary}`);
    }
  }, [lesson]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const startVideoGeneration = async () => {
    if (!prompt.trim()) return;
    
    setStatus("generating");
    setProgressMsg("Sending request to Veo 3 Engine...");
    setErrorMsg("");
    setOperationName("");

    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          resolution,
          mode,
          customStyle: mode === "instructors_choice" ? customStylePrompt.trim() : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to start video generation.");
      }

      const opName = data.operationName;
      setOperationName(opName);
      setStatus("polling");
      setProgressMsg("Veo 3.1 is rendering your frames... (queued/processing)");

      // Start Polling every 5 seconds
      pollOperation(opName);

    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || String(err));
    }
  };

  const pollOperation = (opName: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    let attempts = 0;
    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const response = await fetch("/api/video-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operationName: opName })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Status check failed.");
        }

        if (data.done) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          
          if (data.error) {
            setStatus("error");
            setErrorMsg(data.error.message || "Veo 3.1 reported a rendering failure.");
          } else {
            // Video is done! Trigger download
            downloadVideo(opName);
          }
        } else {
          // Still running
          setProgressMsg(`Rendering educational video frames (Attempt ${attempts})...`);
        }
      } catch (err: any) {
        console.error(err);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setStatus("error");
        setErrorMsg(err.message || "Failed to poll video status.");
      }
    }, 5000);
  };

  const downloadVideo = async (opName: string) => {
    setStatus("downloading");
    setProgressMsg("Assembling video stream into playable format...");

    try {
      const response = await fetch("/api/video-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationName: opName })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to retrieve the compiled video.");
      }

      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);
      
      const newVideoItem: GeneratedVideoItem = {
        id: opName || String(Date.now()),
        prompt: prompt.trim(),
        mode: mode,
        aspectRatio: aspectRatio,
        videoUrl: videoUrl,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setVideosHistory(prev => [newVideoItem, ...prev]);
      setActiveVideoUrl(videoUrl);
      setStatus("completed");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Failed to download the generated video.");
    }
  };

  return (
    <div className="space-y-6" id="video-lab-panel">
      {/* Upper header note */}
      <div className="bg-surface-0 border border-black/[0.05] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-teal-light flex items-center justify-center text-teal-brand shrink-0">
            <Video className="w-5.5 h-5.5" />
          </div>
          <div className="space-y-0.5 text-left">
            <h4 className="text-sm font-bold text-teal-dark font-sans flex items-center gap-1.5">
              <span>Veo 3.1 High-Fidelity Video Lab</span>
              <span className="text-[10px] bg-amber-100 border border-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                Premium
              </span>
            </h4>
            <p className="text-xs text-secondary font-sans leading-normal">
              Bring abstract scientific concepts to life with professional video simulations, custom visual adventures, and classroom presentation backgrounds.
            </p>
          </div>
        </div>
        
        {/* Paid key flow triggers */}
        <button
          type="button"
          onClick={onTriggerPaidFlow}
          className="px-3.5 py-1.5 border border-amber-200 hover:bg-amber-50 text-amber-900 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-3xs cursor-pointer bg-amber-50/40 shrink-0"
        >
          <Key className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Select Paid API Key</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Settings Form Column */}
        <div className="md:col-span-5 bg-surface-0/40 border border-black/[0.06] rounded-2xl p-5 space-y-5">
          <div className="border-b border-black/[0.05] pb-3">
            <span className="text-[9px] font-mono font-bold text-secondary uppercase tracking-wider block">PARAMETER CONTROL</span>
            <h4 className="text-xs font-bold text-teal-dark font-sans">Video Configurations</h4>
          </div>

          {/* Mode Option Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-secondary uppercase tracking-wider block font-sans">
              Video Category Style
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "3d_animation", label: "3D Animation" },
                { id: "cut_scene", label: "Cut Scene (Game Style)" },
                { id: "cartoon", label: "Cartoon" },
                { id: "instructors_choice", label: "Instructor's Choice" }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id as any)}
                  className={`py-2 px-2.5 rounded-lg text-[10px] font-bold font-sans text-center transition-all cursor-pointer ${
                    mode === m.id 
                      ? "bg-teal-dark text-white shadow-3xs" 
                      : "bg-white border border-black/[0.08] text-secondary hover:bg-surface-0"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Custom presentation style for Instructor's Choice */}
            {mode === "instructors_choice" && (
              <div className="space-y-1.5 pt-1.5 animate-fadeIn">
                <label className="text-[10px] font-bold text-teal-brand uppercase tracking-wider block font-sans">
                  Custom Style Definition
                </label>
                <input
                  type="text"
                  value={customStylePrompt}
                  onChange={(e) => setCustomStylePrompt(e.target.value)}
                  placeholder="e.g. Stop-motion claymation, pencil sketch, puppet show..."
                  className="w-full text-xs p-2.5 border border-teal-brand/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-brand/10 focus:border-teal-brand font-sans bg-white text-primary"
                />
              </div>
            )}
          </div>

          {/* Prompt description */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider block font-sans">
                Visual Prompt Instructions
              </label>
              <button
                type="button"
                onClick={() => setPrompt(`A dynamic 3D simulation of ${lesson.lessonTitle} demonstrating core scientific mechanics in action.`)}
                className="text-[9px] text-teal-brand hover:underline font-bold"
              >
                Reset Default
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe what visual animation should play (e.g. A detailed particle simulation of electrical currents flowing in copper loops...)"
              className="w-full text-xs p-3 border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-brand/10 focus:border-teal-brand font-sans bg-white text-primary leading-normal"
            />
          </div>

          {/* Aspect Ratio and Resolution row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block font-sans">Aspect Ratio</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio("16:9")}
                  className={`flex-1 py-2 rounded-lg border text-center font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    aspectRatio === "16:9"
                      ? "bg-teal-dark text-white border-teal-dark"
                      : "bg-white text-secondary border-black/[0.08] hover:bg-surface-0"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>16:9 (Wide)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio("9:16")}
                  className={`flex-1 py-2 rounded-lg border text-center font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    aspectRatio === "9:16"
                      ? "bg-teal-dark text-white border-teal-dark"
                      : "bg-white text-secondary border-black/[0.08] hover:bg-surface-0"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>9:16 (Tall)</span>
                </button>
              </div>
            </div>

            {/* Resolution */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block font-sans">Resolution</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setResolution("720p")}
                  className={`flex-1 py-2 rounded-lg border text-center font-bold text-[10px] transition-all cursor-pointer ${
                    resolution === "720p"
                      ? "bg-teal-dark text-white border-teal-dark"
                      : "bg-white text-secondary border-black/[0.08] hover:bg-surface-0"
                  }`}
                >
                  720p (Fast)
                </button>
                <button
                  type="button"
                  onClick={() => setResolution("1080p")}
                  className={`flex-1 py-2 rounded-lg border text-center font-bold text-[10px] transition-all cursor-pointer ${
                    resolution === "1080p"
                      ? "bg-teal-dark text-white border-teal-dark"
                      : "bg-white text-secondary border-black/[0.08] hover:bg-surface-0"
                  }`}
                >
                  1080p
                </button>
              </div>
            </div>
          </div>

          {/* Trigger action CTA */}
          <button
            type="button"
            onClick={startVideoGeneration}
            disabled={status === "generating" || status === "polling" || status === "downloading" || !prompt.trim()}
            className="w-full py-3 px-4 bg-teal-dark hover:bg-opacity-95 text-white rounded-xl text-xs font-bold transition-all shadow-3xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {status === "generating" || status === "polling" || status === "downloading" ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-teal-brand" />
                <span>Generating Video...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal-brand" />
                <span>Render Immersive Video (Veo 3.1)</span>
              </>
            )}
          </button>
        </div>

        {/* Video Player Display / Polling Stage */}
        <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5.5 flex-1 flex flex-col justify-center items-center min-h-[350px] relative overflow-hidden">
            {/* Status router */}
            {status === "idle" && !activeVideoUrl && (
              <div className="text-center space-y-4 max-w-sm py-8">
                <div className="w-16 h-16 rounded-full bg-teal-light border border-teal-brand/10 flex items-center justify-center text-teal-brand mx-auto shadow-3xs">
                  <Video className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-primary font-sans">Awaiting Video Command</h4>
                  <p className="text-xs text-secondary leading-relaxed font-sans font-normal">
                    Select a mode, customize your prompt parameters on the left, and start the render engine. Your generated MP4 will stream directly here.
                  </p>
                </div>
              </div>
            )}

            {/* Loader & Progress status */}
            {(status === "generating" || status === "polling" || status === "downloading") && (
              <div className="text-center space-y-5 max-w-sm py-8 z-10">
                <div className="relative">
                  {/* Radar ripple rings */}
                  <div className="absolute inset-0 rounded-full bg-teal-brand/10 animate-ping" />
                  <div className="w-16 h-16 rounded-full bg-teal-dark border border-teal-brand text-teal-brand flex items-center justify-center mx-auto shadow-sm relative z-10">
                    <RefreshCw className="w-7 h-7 animate-spin" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-teal-dark uppercase tracking-wider font-mono">Veo Rendering Engine Pipeline</h5>
                  <p className="text-sm font-semibold text-primary font-sans leading-relaxed">
                    {progressMsg}
                  </p>
                  <p className="text-[10px] text-secondary font-sans font-medium">
                    This is a multi-step background operation (Start → Poll → Assemble). Usually completes in under a minute!
                  </p>
                </div>
              </div>
            )}

            {/* Completed Output screen */}
            {activeVideoUrl && (status === "completed" || status === "idle") && (
              <div className="w-full h-full flex flex-col justify-between items-center space-y-4">
                <div className="w-full flex items-center justify-between border-b pb-2 mb-1">
                  <span className="text-[10px] font-mono font-bold text-teal-brand uppercase tracking-widest flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Video Compiled Successfully
                  </span>
                  <a
                    href={activeVideoUrl}
                    download={`lyra_stem_${Date.now()}.mp4`}
                    className="text-[10px] font-bold text-teal-dark hover:text-teal-brand flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download file</span>
                  </a>
                </div>

                {/* Styled HTML5 player based on aspect ratio */}
                <div className={`w-full flex justify-center items-center bg-black rounded-xl overflow-hidden shadow-sm relative group ${
                  aspectRatio === "9:16" ? "max-h-[380px] aspect-[9/16]" : "aspect-[16/9]"
                }`}>
                  <video
                    src={activeVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Error screen */}
            {status === "error" && (
              <div className="text-center space-y-4 max-w-sm py-8 z-10">
                <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mx-auto shadow-sm">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-red-950 font-sans">Veo Rendering Interrupted</h4>
                  <p className="text-xs text-red-900/80 leading-relaxed font-sans bg-red-50 p-3 rounded-xl border border-red-100 font-mono text-left max-h-[140px] overflow-y-auto">
                    {errorMsg}
                  </p>
                  <p className="text-[10px] text-secondary font-sans font-medium pt-1">
                    Please ensure your API Key is verified for Paid Generation. You can retry with a different prompt parameter!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startVideoGeneration}
                  className="px-4 py-2 bg-teal-dark text-white text-xs font-bold rounded-lg hover:bg-opacity-95 transition-all"
                >
                  Retry Render
                </button>
              </div>
            )}
          </div>

          {/* Video generation history panel */}
          {videosHistory.length > 0 && (
            <div className="bg-surface-0 border border-black/[0.05] rounded-2xl p-4.5 space-y-3">
              <div className="border-b pb-2">
                <span className="text-[10px] font-bold text-teal-dark uppercase tracking-wider block font-sans">
                  Video Render Session History ({videosHistory.length})
                </span>
              </div>
              <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
                {videosHistory.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => {
                      setActiveVideoUrl(video.videoUrl);
                      setPrompt(video.prompt);
                      setMode(video.mode as any);
                      setAspectRatio(video.aspectRatio);
                      setStatus("idle");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex justify-between items-center gap-3 transition-all cursor-pointer ${
                      activeVideoUrl === video.videoUrl
                        ? "bg-white border-teal-brand text-teal-dark shadow-3xs"
                        : "bg-white border-black/[0.04] text-secondary hover:bg-surface-0"
                    }`}
                  >
                    <div className="overflow-hidden flex-1">
                      <p className="text-[11px] font-bold truncate text-primary">"{video.prompt}"</p>
                      <span className="text-[9px] font-mono font-medium text-secondary flex items-center gap-2">
                        <span>Mode: <strong className="text-teal-dark uppercase">{video.mode}</strong></span>
                        <span>•</span>
                        <span>Ratio: {video.aspectRatio}</span>
                        <span>•</span>
                        <span>{video.timestamp}</span>
                      </span>
                    </div>
                    <Play className="w-3.5 h-3.5 text-teal-brand shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
