import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Music, 
  RefreshCw, 
  AlertCircle, 
  Play, 
  Pause, 
  Download, 
  Volume2, 
  VolumeX, 
  Key,
  BookOpen,
  Compass,
  Check
} from "lucide-react";
import { ProcessedLesson } from "../types";

interface SoundStudioProps {
  lesson: ProcessedLesson;
  onTriggerPaidFlow: () => void;
}

interface GeneratedSongItem {
  id: string;
  prompt: string;
  genre: string;
  length: "clip" | "pro";
  audioUrl: string;
  lyrics: string;
  timestamp: string;
}

const PRESET_STYLES = [
  { id: "catchy", label: "Catchy (6th - 8th grade)", promptAdd: "catchy, energetic rhythm with a modern pop/hip-hop beat and high engagement educational rhymes" },
  { id: "funny", label: "Funny (3rd - 5th grade)", promptAdd: "funny, humorous, lighthearted acoustic and playful rhythm with goofy sound effects and funny teaching vocals" },
  { id: "silly", label: "Super Silly Mode (K-2nd)", promptAdd: "extremely silly comical cartoon style rhythm, toy instruments, funny voice tones, and boing sounds for early childhood learning" }
];

export default function SoundStudio({ lesson, onTriggerPaidFlow }: SoundStudioProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("catchy");
  const [songLength, setSongLength] = useState<"clip" | "pro">("clip");
  
  const [status, setStatus] = useState<"idle" | "generating" | "completed" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [activeSong, setActiveSong] = useState<GeneratedSongItem | null>(null);
  const [songsHistory, setSongsHistory] = useState<GeneratedSongItem[]>([]);
  
  // Custom audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Set default prompt based on current lesson
  useEffect(() => {
    if (lesson) {
      setPrompt(`Write a catchy, highly educational classroom song explaining "${lesson.lessonTitle}". Incorporating core vocabulary like: ${lesson.keyTakeaways.slice(0, 2).join(", ")}. Perfect for middle school STEM students.`);
    }
  }, [lesson]);

  // Audio handlers
  useEffect(() => {
    if (activeSong) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      if (audioRef.current) {
        audioRef.current.load();
      }
    }
  }, [activeSong]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio playback failed:", err);
      });
    }
  };

  const handleMuteToggle = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const generateMusic = async () => {
    if (!prompt.trim()) return;

    setStatus("generating");
    setErrorMsg("");

    try {
      const genreObj = PRESET_STYLES.find(g => g.id === selectedGenre);
      const styleInstruction = genreObj ? genreObj.promptAdd : "";
      
      const fullPrompt = `${prompt.trim()}. Style: ${styleInstruction}. The song must be extremely catchy, professional, and contain educational rhymes for classroom memory enhancement.`;

      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          length: songLength
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to generate music.");
      }

      // Convert Base64 back to Blob URL
      const binary = atob(data.audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType || "audio/wav" });
      const audioUrl = URL.createObjectURL(blob);

      // Create new song item
      const newSong: GeneratedSongItem = {
        id: String(Date.now()),
        prompt: prompt.trim(),
        genre: PRESET_STYLES.find(g => g.id === selectedGenre)?.label || "Custom",
        length: songLength,
        audioUrl: audioUrl,
        lyrics: data.lyrics || "Sing along with the classroom!\n\n(No lyrics returned, listen and sing your heart out!)",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setSongsHistory(prev => [newSong, ...prev]);
      setActiveSong(newSong);
      setStatus("completed");

    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Failed to generate your classroom sound track.");
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="space-y-6" id="sound-studio-panel">
      {/* Upper header note */}
      <div className="bg-surface-0 border border-black/[0.05] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-teal-light flex items-center justify-center text-teal-brand shrink-0">
            <Music className="w-5.5 h-5.5" />
          </div>
          <div className="space-y-0.5 text-left">
            <h4 className="text-sm font-bold text-teal-dark font-sans flex items-center gap-1.5">
              <span>Lyria 3.0 Sound Studio</span>
              <span className="text-[10px] bg-amber-100 border border-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                Premium
              </span>
            </h4>
            <p className="text-xs text-secondary font-sans leading-normal">
              Create catchy educational songs, rhythmic mnemonic jingles, and classroom rhythmic tracks to make difficult science terms unforgettable.
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
        {/* Configuration settings */}
        <div className="md:col-span-5 bg-surface-0/40 border border-black/[0.06] rounded-2xl p-5 space-y-5">
          <div className="border-b border-black/[0.05] pb-3">
            <span className="text-[9px] font-mono font-bold text-secondary uppercase tracking-wider block">STUDIO TRACK CONTROL</span>
            <h4 className="text-xs font-bold text-teal-dark font-sans">Sound Studio Configurations</h4>
          </div>

          {/* Model selection */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block font-sans">Track Duration Tier</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSongLength("clip")}
                className={`flex-1 py-2 rounded-lg border text-center font-bold text-[10px] transition-all cursor-pointer ${
                  songLength === "clip"
                    ? "bg-teal-dark text-white border-teal-dark"
                    : "bg-white text-secondary border-black/[0.08] hover:bg-surface-0"
                }`}
              >
                Mnemonic Clip (up to 30s)
              </button>
              <button
                type="button"
                onClick={() => setSongLength("pro")}
                className={`flex-1 py-2 rounded-lg border text-center font-bold text-[10px] transition-all cursor-pointer ${
                  songLength === "pro"
                    ? "bg-teal-dark text-white border-teal-dark"
                    : "bg-white text-secondary border-black/[0.08] hover:bg-surface-0"
                }`}
              >
                Full Song (3 mins)
              </button>
            </div>
          </div>

          {/* Preset Styles */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block font-sans">Musical Style Preset</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedGenre(style.id)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-lg font-sans font-bold border transition-all cursor-pointer ${
                    selectedGenre === style.id
                      ? "bg-teal-dark border-teal-dark text-white shadow-3xs"
                      : "bg-white border-black/[0.06] text-secondary hover:border-black/[0.15]"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lyrics / Inspiration Instructions */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider block font-sans">
                Lyrical & Concept Guidance
              </label>
              <button
                type="button"
                onClick={() => setPrompt(`Write a catchy, highly educational classroom song explaining "${lesson.lessonTitle}". Incorporating core vocabulary like: ${lesson.keyTakeaways.slice(0, 2).join(", ")}. Perfect for middle school STEM students.`)}
                className="text-[9px] text-teal-brand hover:underline font-bold"
              >
                Reset Default
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="Write custom lyric ideas or vocabulary terms to enforce (e.g. Generate a fun classroom song about gravity pulling things down towards the center of Earth!)"
              className="w-full text-xs p-3 border border-black/[0.1] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-brand/10 focus:border-teal-brand font-sans bg-white text-primary leading-normal"
            />
          </div>

          {/* Launch studio trigger */}
          <button
            type="button"
            onClick={generateMusic}
            disabled={status === "generating" || !prompt.trim()}
            className="w-full py-3 px-4 bg-teal-dark hover:bg-opacity-95 text-white rounded-xl text-xs font-bold transition-all shadow-3xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {status === "generating" ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-teal-brand" />
                <span>Mixing Audio Tracks...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal-brand" />
                <span>Generate Studio Track (Lyria 3.0)</span>
              </>
            )}
          </button>
        </div>

        {/* Audio Player and Lyrics Sheet */}
        <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5.5 flex-1 flex flex-col justify-center items-center min-h-[350px] relative overflow-hidden">
            
            {status === "idle" && !activeSong && (
              <div className="text-center space-y-4 max-w-sm py-8">
                <div className="w-16 h-16 rounded-full bg-teal-light border border-teal-brand/10 flex items-center justify-center text-teal-brand mx-auto shadow-3xs">
                  <Music className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-primary font-sans">Awaiting Studio Directive</h4>
                  <p className="text-xs text-secondary leading-relaxed font-sans font-normal">
                    Describe your lyric goals, pick a style profile (such as Retro Synthwave or Acoustic Guitar), and let Lyria 3 generate professional high-fidelity stems and transcriptions.
                  </p>
                </div>
              </div>
            )}

            {/* Mixing / Generating Loader */}
            {status === "generating" && (
              <div className="text-center space-y-6 max-w-sm py-8 z-10">
                <div className="relative flex justify-center">
                  {/* Cassette/CD spinning simulation */}
                  <div className="w-20 h-20 bg-teal-dark rounded-full border-4 border-teal-brand flex items-center justify-center animate-spin relative shadow-sm">
                    {/* Inner hole */}
                    <div className="w-6 h-6 bg-white rounded-full border-2 border-teal-dark" />
                    {/* Retro details */}
                    <div className="absolute top-2 w-1.5 h-4 bg-teal-brand/30 rounded" />
                    <div className="absolute bottom-2 w-1.5 h-4 bg-teal-brand/30 rounded" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-teal-dark uppercase tracking-wider font-mono">Lyria Synthesis Stream</h5>
                  <p className="text-sm font-semibold text-primary font-sans leading-relaxed">
                    Stitching instrumentals, writing rhymes, and compiling raw PCM audio layers...
                  </p>
                  <p className="text-[10px] text-secondary font-sans">
                    This takes up to 45 seconds to synthesize and export high-quality base64 wav files. Sing along soon!
                  </p>
                </div>
              </div>
            )}

            {/* Finished completed player */}
            {activeSong && (status === "completed" || status === "idle") && (
              <div className="w-full h-full flex flex-col justify-between items-stretch space-y-4">
                
                {/* Embedded hidden audio tag */}
                <audio
                  ref={audioRef}
                  src={activeSong.audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleAudioEnded}
                  className="hidden"
                />

                {/* Styled Professional player card */}
                <div className="bg-gradient-to-br from-teal-dark to-slate-900 text-white rounded-xl p-4.5 space-y-4 relative overflow-hidden shadow-xs">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-brand/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center gap-4">
                    {/* Rotating disk badge when playing */}
                    <div className={`w-12 h-12 rounded-full bg-black/40 border border-teal-brand/30 flex items-center justify-center shrink-0 ${isPlaying ? "animate-spin" : ""}`}>
                      <Music className="w-5 h-5 text-teal-brand" />
                    </div>

                    <div className="overflow-hidden flex-1 text-left">
                      <span className="text-[9px] font-mono font-bold text-teal-brand uppercase tracking-wider block">LYRIA HIGH-FIDELITY ACTIVE CUT</span>
                      <p className="text-xs font-bold text-white truncate max-w-[200px]">"{activeSong.prompt}"</p>
                      <span className="text-[9px] text-teal-light/80 block mt-0.5">Style: <strong>{activeSong.genre}</strong></span>
                    </div>

                    {/* Download */}
                    <a
                      href={activeSong.audioUrl}
                      download={`lyra_sound_${Date.now()}.wav`}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all shrink-0 ml-auto"
                      title="Download Song"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Sliders and times */}
                  <div className="space-y-1.5 pt-1">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSliderChange}
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-teal-brand"
                    />
                    <div className="flex justify-between items-center text-[10px] font-mono text-teal-light/80">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Main controls row */}
                  <div className="flex justify-center items-center gap-4 border-t border-white/[0.08] pt-2">
                    <button
                      type="button"
                      onClick={handleMuteToggle}
                      className="p-1.5 hover:bg-white/10 rounded-md transition-all text-teal-light hover:text-white"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={handlePlayPause}
                      className="w-9 h-9 rounded-full bg-teal-brand text-teal-dark flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-all shadow-sm"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current stroke-[2.5]" /> : <Play className="w-4 h-4 fill-current ml-0.5 stroke-[2.5]" />}
                    </button>

                    <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded text-teal-brand">
                      {activeSong.length === "clip" ? "CLIP" : "FULL"}
                    </span>
                  </div>
                </div>

                {/* Lyric booklet area */}
                <div className="bg-surface-0 border border-black/[0.04] rounded-xl p-4 flex-1 text-left flex flex-col justify-between max-h-[180px]">
                  <div className="flex items-center gap-1.5 border-b pb-2 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-teal-brand" />
                    <span className="text-[10px] font-bold text-teal-dark uppercase tracking-wider font-sans">Lyrical Lyrics Transcription Booklet</span>
                  </div>
                  <div className="overflow-y-auto flex-1 font-mono text-[11px] text-secondary leading-relaxed whitespace-pre-line pr-2">
                    {activeSong.lyrics}
                  </div>
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
                  <h4 className="text-sm font-bold text-red-950 font-sans">Lyria Synthesis Interrupted</h4>
                  <p className="text-xs text-red-900/80 leading-relaxed font-sans bg-red-50 p-3 rounded-xl border border-red-100 font-mono text-left max-h-[140px] overflow-y-auto">
                    {errorMsg}
                  </p>
                  <p className="text-[10px] text-secondary font-sans font-medium pt-1">
                    Please ensure your API Key is verified for Paid Generation. You can retry with a different lyric cue or presets!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateMusic}
                  className="px-4 py-2 bg-teal-dark text-white text-xs font-bold rounded-lg hover:bg-opacity-95 transition-all"
                >
                  Retry Studio Mix
                </button>
              </div>
            )}
          </div>

          {/* Songs History */}
          {songsHistory.length > 0 && (
            <div className="bg-surface-0 border border-black/[0.05] rounded-2xl p-4.5 space-y-3">
              <div className="border-b pb-2">
                <span className="text-[10px] font-bold text-teal-dark uppercase tracking-wider block font-sans">
                  Song Render Session History ({songsHistory.length})
                </span>
              </div>
              <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
                {songsHistory.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => {
                      setActiveSong(song);
                      setPrompt(song.prompt);
                      setSongLength(song.length);
                      setStatus("idle");
                    }}
                    className={`p-2.5 rounded-xl border text-left flex justify-between items-center gap-3 transition-all cursor-pointer ${
                      activeSong?.id === song.id
                        ? "bg-white border-teal-brand text-teal-dark shadow-3xs"
                        : "bg-white border-black/[0.04] text-secondary hover:bg-surface-0"
                    }`}
                  >
                    <div className="overflow-hidden flex-1">
                      <p className="text-[11px] font-bold truncate text-primary">"{song.prompt}"</p>
                      <span className="text-[9px] font-mono font-medium text-secondary flex items-center gap-2">
                        <span>Genre: <strong className="text-teal-dark">{song.genre}</strong></span>
                        <span>•</span>
                        <span>Tier: <strong className="uppercase">{song.length}</strong></span>
                        <span>•</span>
                        <span>{song.timestamp}</span>
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
