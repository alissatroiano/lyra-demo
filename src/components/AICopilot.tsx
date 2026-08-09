import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Search, 
  RefreshCw, 
  Download, 
  Check, 
  Plus, 
  Trash2, 
  Cpu, 
  Upload, 
  HelpCircle, 
  ChevronRight, 
  ArrowRight,
  AlertCircle,
  Phone,
  PhoneOff
} from "lucide-react";
import { ProcessedLesson } from "../types";

interface AICopilotProps {
  lesson: ProcessedLesson;
  onTriggerPaidFlow: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isGrounded?: boolean;
  citations?: string[];
}

export default function AICopilot({ lesson, onTriggerPaidFlow }: AICopilotProps) {
  // Main Tab within AI Workspace
  const [activeSubTab, setActiveSubTab] = useState<"chat" | "images" | "video" | "voice">("chat");

  // ==========================================
  // STATE: 💬 CLASSROOM CHAT COPILOT
  // ==========================================
  const [chatModel, setChatModel] = useState<"gemini-3.1-flash-lite" | "gemini-3.5-flash" | "gemini-3.1-pro-preview">("gemini-3.5-flash");
  const [chatRole, setChatRole] = useState<string>("Pedagogical Advisor");
  const [useSearch, setUseSearch] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const ROLES_SYSTEM_INSTRUCTIONS: Record<string, string> = {
    "Pedagogical Advisor": "You are Lyrah, an expert Pedagogical Advisor. Help instructors structure, pace, and scaffold their STEM/STEAM lessons. Advise on classroom management and physical engagement. SVG Diagram Rule: Only create or output raw inline SVG diagrams (<svg>...</svg>) if the demo path or user prompt visibly depends on text-generated vector visuals. Otherwise, answer using clear, structured text and Markdown.",
    "Science Explainer": "You are Lyrah, a Science Explainer. Explain complex scientific or technical topics using extremely clear, simple analogies and visual metaphors suitable for children ages 6-14. SVG Diagram Rule: Only create or output raw inline SVG diagrams if the demo path visibly depends on generated text.",
    "Scratch Block Translator": "You are Lyrah, a Scratch Block Translator. Deconstruct digital or block-based concepts (like Scratch, ScratchJr, or Code.org) into simple physical movements, text workflows, and engaging household metaphors (e.g., Scratch 'triggering blocks' are like 'magic start buttons'). SVG Diagram Rule: Only create SVG diagrams if explicitly requested or if the demo path visibly depends on text-generated vector visuals.",
    "Gamification Designer": "You are Lyrah, a Gamification Designer. Suggest narrative quests, rewards, and gameplay elements to turn engineering and coding activities into interactive team missions. SVG Diagram Rule: Only create SVG diagrams if the demo path visibly depends on generated text."
  };

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0 && lesson) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hi! I'm **Lyrah**, your AI teaching copilot! 🌟\n\nI'm fully grounded in your lesson: **${lesson.lessonTitle}** (${lesson.duration}).\n\nHow can I help you co-teach today? Choose a preset helper prompt below or type your own question!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, [lesson, messages]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendChatMessage = async (textToSend?: string) => {
    const promptText = textToSend || chatInput;
    if (!promptText.trim() || isChatLoading) return;

    if (!textToSend) {
      setChatInput("");
    }

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);
    setChatError("");

    try {
      const systemInstruction = `${ROLES_SYSTEM_INSTRUCTIONS[chatRole]}\n\nActive Lesson Context:\n- Title: ${lesson.lessonTitle}\n- Summary: ${lesson.summary}\n- Takeaways: ${lesson.keyTakeaways.join(", ")}`;

      const chatHistoryForAPI = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      // If user selected pro model, trigger paid flow indicator (in our mock flow, it alerts or suggests key config)
      if (chatModel === "gemini-3.1-pro-preview") {
        console.log("Using premium model gemini-3.1-pro-preview");
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistoryForAPI,
          model: chatModel,
          systemInstruction,
          useSearch,
          thinkingLevel: chatModel === "gemini-3.1-pro-preview" ? "HIGH" : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to get response from Lyrah.");
      }

      let citations: string[] = [];
      if (data.groundingMetadata?.groundingChunks) {
        citations = data.groundingMetadata.groundingChunks.map((chunk: any) => chunk.web?.uri || chunk.web?.title).filter(Boolean);
      }

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: data.reply || "I didn't receive any reply. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isGrounded: useSearch,
        citations: citations.length > 0 ? citations : undefined
      };

      setMessages(prev => [...prev, assistantMsg]);

    } catch (err: any) {
      console.error(err);
      setChatError(err.message || String(err));
    } finally {
      setIsChatLoading(false);
    }
  };

  // ==========================================
  // STATE: 🎨 VISUAL ASSET STUDIO (IMAGE CREATOR)
  // ==========================================
  const [imagePrompt, setImagePrompt] = useState<string>("");
  const [imageAspectRatio, setImageAspectRatio] = useState<string>("1:1");
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isEditingImage, setIsEditingImage] = useState<boolean>(false);

  // Set default image prompt
  useEffect(() => {
    if (lesson) {
      setImagePrompt(`A fun, child-friendly colorful STEM whiteboard diagram demonstrating the core science of ${lesson.lessonTitle}. Vector art, white background.`);
    }
  }, [lesson]);

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isImageLoading) return;

    setIsImageLoading(true);
    setImageError("");

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          aspectRatio: imageAspectRatio,
          base64Image: isEditingImage && generatedImage ? generatedImage : undefined,
          mimeType: "image/png"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to render image.");
      }

      setGeneratedImage(data.image);
      setIsEditingImage(false); // Reset edit state once applied
    } catch (err: any) {
      console.error(err);
      setImageError(err.message || String(err));
    } finally {
      setIsImageLoading(false);
    }
  };

  // ==========================================
  // STATE: 🎬 VIDEO CONTENT ANALYZER
  // ==========================================
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState<string>("Perform an educational breakdown of this video. What are the key mechanics shown, and how can an instructor teach them in a 15-minute hands-on challenge?");
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string>("");
  const [videoAnalysis, setVideoAnalysis] = useState<string>("");

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        setVideoError("Video file size is too large. Please select a clip under 12MB.");
        return;
      }
      setVideoFile(file);
      setVideoError("");
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleAnalyzeVideo = async () => {
    if (!videoFile || isVideoLoading) return;

    setIsVideoLoading(true);
    setVideoError("");
    setVideoAnalysis("");

    try {
      // Read file to Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Extract base64 part
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });

      reader.readAsDataURL(videoFile);
      const base64Data = await base64Promise;

      const response = await fetch("/api/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoBase64: base64Data,
          mimeType: videoFile.type,
          prompt: videoPrompt.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to analyze video content.");
      }

      setVideoAnalysis(data.analysis || "No analysis returned from Gemini Pro Video.");
    } catch (err: any) {
      console.error(err);
      setVideoError(err.message || String(err));
    } finally {
      setIsVideoLoading(false);
    }
  };

  // ==========================================
  // STATE: 🎙️ LIVE VOICE CLASSROOM COMPANION
  // ==========================================
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "dialing" | "connected" | "error">("idle");
  const [voiceError, setVoiceError] = useState<string>("");
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Helper: Float32 to 16-bit PCM Buffer
  const floatTo16BitPCM = (input: Float32Array) => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  };

  // Helper: ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Helper: Playback 24kHz Base64 Chunk
  const playAudioChunk = (base64: string) => {
    if (!outputAudioCtxRef.current) return;
    try {
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = outputAudioCtxRef.current.createBuffer(1, float32Array.length, 24000);
      audioBuffer.copyToChannel(float32Array, 0);

      const source = outputAudioCtxRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputAudioCtxRef.current.destination);
      source.start(0);
    } catch (err) {
      console.error("Error playing audio chunk:", err);
    }
  };

  const handleStartVoiceCall = async () => {
    setVoiceStatus("dialing");
    setVoiceError("");

    try {
      // Connect WS
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/live-ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log("WebSocket connected to Gemini Live API bridge!");
        setVoiceStatus("connected");

        // Initialize Audio contexts
        inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        // Capture mic
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const source = inputAudioCtxRef.current.createMediaStreamSource(stream);
        const processor = inputAudioCtxRef.current.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(inputAudioCtxRef.current.destination);

        processor.onaudioprocess = (e) => {
          if (isVoiceMuted || ws.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmBuffer = floatTo16BitPCM(inputData);
          const base64Audio = arrayBufferToBase64(pcmBuffer);
          
          ws.send(JSON.stringify({ audio: base64Audio }));
        };
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.audio) {
            playAudioChunk(parsed.audio);
          }
          if (parsed.error) {
            setVoiceStatus("error");
            setVoiceError(parsed.error);
          }
        } catch (err) {
          console.error("Error parsing WS message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setVoiceStatus("error");
        setVoiceError("WebSocket connection lost or failed to connect.");
      };

      ws.onclose = () => {
        console.log("WebSocket bridge closed.");
        handleStopVoiceCall();
      };

    } catch (err: any) {
      console.error(err);
      setVoiceStatus("error");
      setVoiceError(err.message || "Failed to initialize media devices or websocket.");
    }
  };

  const handleStopVoiceCall = () => {
    setVoiceStatus("idle");

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="ai-copilot-container">
      {/* LEFT NAVIGATION SUBTABS COLUMN */}
      <div className="xl:col-span-3 flex flex-row xl:flex-col gap-2.5 bg-surface-0 border border-black/[0.05] rounded-2xl p-4 xl:p-4.5 overflow-x-auto shrink-0">
        {/* Lyrah herself. The constellation is the logo; the mascot is the
            character you talk to, so she lives with the copilot. She is holding
            a lyre, which is the constellation. */}
        <div className="hidden xl:flex items-center gap-3 border-b border-black/[0.05] pb-3 mb-2.5">
          <div className="w-12 h-12 rounded-2xl bg-cyber-bg border border-teal-brand/40 flex items-center justify-center shrink-0 p-1 micro-glow-teal">
            <img
              src="/lyrah_logo.jpg"
              alt="Lyrah, the AI co-teacher"
              className="w-full h-full object-contain rounded-xl mix-blend-lighten"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold text-teal-brand uppercase tracking-wider font-mono">Lyrah Copilot Hub</span>
            <h4 className="text-xs font-bold text-teal-dark dark:text-slate-100 font-sans">AI Assistant Suite</h4>
          </div>
        </div>

        {[
          { id: "chat", label: "Co-Teacher Chat", desc: "Multi-turn lesson copilot", icon: MessageSquare },
          { id: "images", label: "Visual Asset Studio", desc: "Text-to-Image (Flash Image)", icon: ImageIcon },
          { id: "voice", label: "Voice Classroom Line", desc: "Real-time Live Audio call", icon: Mic },
          { id: "video", label: "Video Content Analyzer", desc: "Analyze videos with Pro", icon: VideoIcon }
        ].map((subTab) => {
          const Icon = subTab.icon;
          const isSelected = activeSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id as any)}
              className={`flex items-center xl:items-start gap-3 px-3.5 py-3 rounded-xl transition-all text-left whitespace-nowrap xl:whitespace-normal cursor-pointer w-full shrink-0 ${
                isSelected 
                  ? "bg-teal-dark text-white shadow-3xs" 
                  : "bg-white border border-black/[0.04] text-secondary hover:bg-surface-0 hover:text-primary"
              }`}
            >
              <div className={`p-2 rounded-lg ${isSelected ? "bg-teal-brand/20 text-teal-brand" : "bg-teal-light text-teal-brand"}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="hidden xl:flex flex-col text-left space-y-0.5">
                <span className="text-xs font-bold leading-tight font-sans">{subTab.label}</span>
                <span className={`text-[9px] font-sans ${isSelected ? "text-teal-light" : "text-secondary"}`}>{subTab.desc}</span>
              </div>
              <span className="xl:hidden text-xs font-bold font-sans">{subTab.label}</span>
            </button>
          );
        })}
      </div>

      {/* RIGHT WORKSPACE AREA */}
      <div className="xl:col-span-9 bg-white border border-black/[0.06] rounded-2xl p-5.5 min-h-[500px] flex flex-col">
        
        {/* ======================================================== */}
        {/* SUBTAB: 💬 CO-TEACHER CHAT */}
        {/* ======================================================== */}
        {activeSubTab === "chat" && (
          <div className="flex-1 flex flex-col justify-between space-y-4" id="chat-subpanel">
            {/* Top Toolbar Controls */}
            <div className="flex flex-wrap gap-3 items-center justify-between border-b border-black/[0.05] pb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-teal-brand" />
                <div>
                  <h4 className="text-sm font-bold text-primary font-sans leading-none">Classroom Chat Copilot</h4>
                  <p className="text-[10px] text-secondary font-sans mt-1">Multi-turn planning and analogies</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Model Selector */}
                <div className="flex items-center gap-1.5 bg-surface-0 border border-black/[0.05] px-2.5 py-1.5 rounded-xl">
                  <span className="text-[9px] font-bold text-secondary font-sans uppercase">Model:</span>
                  <select
                    value={chatModel}
                    onChange={(e) => setChatModel(e.target.value as any)}
                    className="text-[10px] font-bold text-primary bg-transparent focus:outline-none cursor-pointer font-sans"
                    disabled={useSearch}
                  >
                    <option value="gemini-3.1-flash-lite">Fast Helper (gemini-3.1-flash-lite)</option>
                    <option value="gemini-3.5-flash">General Assistant (gemini-3.5-flash)</option>
                    <option value="gemini-3.1-pro-preview">Expert Pedagogue (gemini-3.1-pro-preview + High Thinking)</option>
                  </select>
                </div>

                {/* Role/Persona Selector */}
                <div className="flex items-center gap-1.5 bg-surface-0 border border-black/[0.05] px-2.5 py-1.5 rounded-xl">
                  <span className="text-[9px] font-bold text-secondary font-sans uppercase">Role:</span>
                  <select
                    value={chatRole}
                    onChange={(e) => setChatRole(e.target.value)}
                    className="text-[10px] font-bold text-primary bg-transparent focus:outline-none cursor-pointer font-sans"
                  >
                    <option value="Pedagogical Advisor">Pedagogical Advisor</option>
                    <option value="Science Explainer">Science Explainer</option>
                    <option value="Scratch Block Translator">Scratch Translator</option>
                    <option value="Gamification Designer">Gamification Expert</option>
                  </select>
                </div>

                {/* Google Search Grounding Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setUseSearch(!useSearch);
                    if (!useSearch) {
                      setChatModel("gemini-3.5-flash"); // search is grounded on 3.5-flash
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold font-sans transition-all cursor-pointer ${
                    useSearch 
                      ? "bg-sky-500 text-white shadow-3xs" 
                      : "bg-surface-0 border border-black/[0.05] text-secondary hover:bg-neutral-100"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Google Search Grounding</span>
                </button>
              </div>
            </div>

            {/* Active Gemini Intelligence Feature Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50/60 border border-teal-500/10 rounded-xl text-[10px] font-medium text-teal-dark font-sans">
              {chatModel === "gemini-3.1-pro-preview" && (
                <span className="flex items-center gap-1.5 text-purple-700 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  High Thinking Mode Active: gemini-3.1-pro-preview (ThinkingLevel.HIGH for deep reasoning)
                </span>
              )}
              {useSearch && (
                <span className="flex items-center gap-1.5 text-sky-700 font-bold">
                  <Search className="w-3.5 h-3.5 text-sky-600" />
                  Google Search Grounding Active: gemini-3.5-flash with real-time web citations
                </span>
              )}
              {!useSearch && chatModel === "gemini-3.5-flash" && (
                <span className="flex items-center gap-1.5 text-teal-800 font-medium">
                  <Cpu className="w-3.5 h-3.5 text-teal-600" />
                  General Assistant: gemini-3.5-flash handling general teaching tasks
                </span>
              )}
              {!useSearch && chatModel === "gemini-3.1-flash-lite" && (
                <span className="flex items-center gap-1.5 text-amber-800 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Fast Helper: gemini-3.1-flash-lite for instant, low-latency co-teaching responses
                </span>
              )}
            </div>

            {/* Chat Messages Thread */}
            <div className="flex-1 overflow-y-auto max-h-[350px] space-y-4 pr-1.5 scrollbar-thin">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role !== "user" && (
                    <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal-brand shrink-0 font-bold text-xs select-none border border-teal-brand/10">
                      Ly
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl p-4 text-xs font-sans leading-relaxed ${
                    m.role === "user"
                      ? "bg-teal-dark text-white rounded-tr-none"
                      : "bg-surface-0 border border-black/[0.04] text-primary rounded-tl-none"
                  }`}>
                    <p className="whitespace-pre-line font-medium">{m.content}</p>

                    {m.isGrounded && (
                      <div className="mt-2.5 pt-2 border-t border-black/[0.05] flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-sky-600 flex items-center gap-1 uppercase">
                          <Check className="w-3 h-3 stroke-[3]" /> Grounded in Google Search
                        </span>
                        {m.citations && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {m.citations.slice(0, 3).map((cite, i) => (
                              <a
                                key={i}
                                href={cite.startsWith("http") ? cite : `https://google.com/search?q=${encodeURIComponent(cite)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[9px] text-sky-500 hover:underline max-w-[200px] truncate block"
                              >
                                [{i + 1}] {cite.replace(/^https?:\/\/(www\.)?/, "")}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <span className="text-[9px] opacity-60 block text-right mt-1.5 font-mono">{m.timestamp}</span>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal-brand shrink-0 font-bold text-xs animate-pulse">
                    ...
                  </div>
                  <span className="text-[11px] text-secondary font-mono animate-pulse">Lyrah is thinking...</span>
                </div>
              )}
              {chatError && (
                <div className="flex gap-2 p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-xs font-sans">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{chatError}</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Presets row */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-secondary uppercase font-mono">Suggested Copilot Prompts:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Deconstruct Scratch code block loops",
                  "Give me 3 scientific analogies",
                  "Suggest a team game mission",
                  "Analyze student common errors"
                ].map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (preset === "Deconstruct Scratch code block loops") {
                        setChatRole("Scratch Block Translator");
                        handleSendChatMessage("Can you deconstruct Scratch loop logic into simple physical movements or real world child-friendly metaphors?");
                      } else if (preset === "Give me 3 scientific analogies") {
                        setChatRole("Science Explainer");
                        handleSendChatMessage(`Give me 3 easy-to-understand real world analogies to explain the science topic: ${lesson.lessonTitle}`);
                      } else if (preset === "Suggest a team game mission") {
                        setChatRole("Gamification Designer");
                        handleSendChatMessage("How can I gamify this classroom activity into an exciting competitive team quest or mission?");
                      } else {
                        setChatRole("Pedagogical Advisor");
                        handleSendChatMessage("What are the most common misconceptions or errors students make on this topic and how do I address them?");
                      }
                    }}
                    className="text-[10px] bg-white border border-black/[0.06] hover:bg-teal-light text-secondary hover:text-teal-brand font-sans font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all shrink-0"
                  >
                    {preset} &rarr;
                  </button>
                ))}
              </div>
            </div>

            {/* TextInput chat field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Ask Lyrah in her role as "${chatRole}"...`}
                className="flex-1 text-xs p-3.5 border border-black/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-brand/15 focus:border-teal-brand bg-surface-0 font-sans text-primary leading-normal"
                disabled={isChatLoading}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="px-4.5 bg-teal-dark hover:bg-opacity-95 disabled:opacity-50 text-white rounded-xl flex items-center justify-center cursor-pointer transition-all"
              >
                <Send className="w-4.5 h-4.5 text-teal-brand" />
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUBTAB: 🎨 VISUAL ASSET STUDIO */}
        {/* ======================================================== */}
        {activeSubTab === "images" && (
          <div className="flex-1 flex flex-col justify-between space-y-6 animate-fade-in" id="image-subpanel">
            <div className="border-b border-black/[0.05] pb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-teal-brand" />
              <div>
                <h4 className="text-sm font-bold text-teal-dark font-sans leading-none">Visual Asset Studio</h4>
                <p className="text-[10px] text-secondary font-sans mt-1">Render custom STEAM board diagrams using gemini-3.1-flash-image</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
              {/* Image Input Prompter Column */}
              <div className="md:col-span-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondary uppercase font-sans">Prompt Studio</label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={4}
                    placeholder="Describe the illustration to generate (e.g., A clean diagram showing water cycle mechanics, whiteboard vector style...)"
                    className="w-full text-xs p-3 border border-black/[0.08] rounded-xl bg-surface-0 font-sans text-primary leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-brand/10 focus:border-teal-brand"
                  />
                </div>

                {/* Aspect ratio */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondary uppercase font-sans">Aspect Ratio</label>
                  <div className="flex gap-2">
                    {["1:1", "4:3", "16:9", "9:16"].map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setImageAspectRatio(ratio)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                          imageAspectRatio === ratio 
                            ? "bg-teal-dark border-teal-dark text-white shadow-3xs" 
                            : "bg-white border-black/[0.08] text-secondary hover:bg-neutral-50"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Edit Mode Toggle */}
                {generatedImage && (
                  <button
                    type="button"
                    onClick={() => setIsEditingImage(!isEditingImage)}
                    className={`w-full py-2 px-3 border rounded-xl text-[10px] font-bold font-sans flex items-center justify-center gap-1.5 cursor-pointer ${
                      isEditingImage 
                        ? "bg-teal-light text-teal-brand border-teal-brand/20" 
                        : "bg-white border-black/[0.08] text-secondary"
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isEditingImage ? 'animate-spin' : ''}`} />
                    <span>{isEditingImage ? "Editing Mode: ACTIVE" : "Iterate / Edit generated image"}</span>
                  </button>
                )}

                {/* Render Button */}
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={!imagePrompt.trim() || isImageLoading}
                  className="w-full py-2.5 bg-teal-dark hover:bg-opacity-95 text-white font-sans font-bold text-xs rounded-xl shadow-3xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImageLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-teal-brand" />
                      <span>Rendering visual assets...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-teal-brand" />
                      <span>{isEditingImage ? "Apply Edit Prompt" : "Create Visual Diagram (Flash)"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Image Preview Column */}
              <div className="md:col-span-7 bg-surface-0 border border-black/[0.04] rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
                {generatedImage ? (
                  <div className="w-full flex flex-col items-center gap-3">
                    <div className="flex justify-between items-center w-full border-b border-black/[0.05] pb-2">
                      <span className="text-[10px] font-mono font-bold text-teal-brand uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Asset Rendered
                      </span>
                      <a
                        href={`data:image/png;base64,${generatedImage}`}
                        download={`lyra_asset_${Date.now()}.png`}
                        className="text-[10px] font-bold text-secondary hover:text-teal-dark flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download file</span>
                      </a>
                    </div>

                    <div className="bg-black/5 p-1 rounded-xl overflow-hidden max-h-[320px] max-w-full">
                      <img
                        src={`data:image/png;base64,${generatedImage}`}
                        alt="AI generated STEAM asset"
                        className="max-h-[300px] object-contain rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3 max-w-sm">
                    <div className="w-12 h-12 rounded-full bg-teal-light flex items-center justify-center text-teal-brand mx-auto">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <h5 className="text-xs font-bold text-primary font-sans">Awaiting Drawing Command</h5>
                    <p className="text-[11px] text-secondary leading-relaxed font-sans font-normal">
                      Write an illustration description, choose your aspect ratio, and click Create. The rendered diagram or visual aid will render here.
                    </p>
                  </div>
                )}

                {imageError && (
                  <div className="absolute bottom-4 left-4 right-4 p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-xs font-sans flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{imageError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUBTAB: 🎙️ LIVE VOICE CLASSROOM LINE */}
        {/* ======================================================== */}
        {activeSubTab === "voice" && (
          <div className="flex-1 flex flex-col justify-between space-y-6 animate-fade-in" id="voice-subpanel">
            <div className="border-b border-black/[0.05] pb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-teal-brand" />
              <div>
                <h4 className="text-sm font-bold text-teal-dark font-sans leading-none">Voice Classroom Line</h4>
                <p className="text-[10px] text-secondary font-sans mt-1">Talk out loud with Lyrah in real-time over our Gemini Live API bridge</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center py-8">
              <div className="max-w-md text-center space-y-8">
                {/* Visual Radar Pulse indicator */}
                <div className="relative flex justify-center items-center">
                  {voiceStatus === "connected" && (
                    <>
                      <div className="absolute w-36 h-36 rounded-full bg-teal-brand/10 animate-ping" />
                      <div className="absolute w-48 h-48 rounded-full bg-teal-brand/5 animate-pulse" />
                    </>
                  )}
                  {voiceStatus === "dialing" && (
                    <div className="absolute w-32 h-32 rounded-full border-2 border-dashed border-teal-brand animate-spin" />
                  )}

                  <button
                    type="button"
                    onClick={voiceStatus === "idle" ? handleStartVoiceCall : handleStopVoiceCall}
                    className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 shadow-sm transition-all relative z-10 cursor-pointer ${
                      voiceStatus === "connected"
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : voiceStatus === "dialing"
                        ? "bg-amber-500 text-white"
                        : "bg-teal-brand hover:bg-teal-dark text-white hover:scale-105"
                    }`}
                  >
                    {voiceStatus === "connected" ? (
                      <>
                        <PhoneOff className="w-8 h-8 animate-pulse" />
                        <span className="text-[9px] font-mono font-bold uppercase">Hang Up</span>
                      </>
                    ) : voiceStatus === "dialing" ? (
                      <>
                        <RefreshCw className="w-8 h-8 animate-spin" />
                        <span className="text-[9px] font-mono font-bold uppercase">Dialing...</span>
                      </>
                    ) : (
                      <>
                        <Phone className="w-8 h-8" />
                        <span className="text-[9px] font-mono font-bold uppercase">Call Lyrah</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-primary font-sans uppercase tracking-wider font-mono">
                    {voiceStatus === "connected" ? "🎙️ Lyrah is Listening..." : voiceStatus === "dialing" ? "📡 Connecting to Gemini..." : "📞 Line Available"}
                  </h4>
                  <p className="text-xs text-secondary leading-relaxed font-sans font-normal">
                    {voiceStatus === "connected" 
                      ? "Say anything! Your microphone streams at 16kHz to Lyrah, and she replies instantly with her sweet Zephyr voice. Give it 2-3 seconds to load." 
                      : "Need quick scaffolding on-the-fly? Start a phone conversation with Lyrah. No typing required."}
                  </p>
                </div>

                {/* Microphone / Mute toggle */}
                {voiceStatus === "connected" && (
                  <div className="flex gap-4 justify-center items-center">
                    <button
                      type="button"
                      onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                      className={`p-3 rounded-full border transition-all cursor-pointer ${
                        isVoiceMuted 
                          ? "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200" 
                          : "bg-white border-black/[0.08] text-secondary hover:bg-neutral-50"
                      }`}
                    >
                      {isVoiceMuted ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                )}

                {voiceError && (
                  <div className="p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-xs font-sans flex gap-2 justify-center">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{voiceError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUBTAB: 🎬 VIDEO CONTENT ANALYZER */}
        {/* ======================================================== */}
        {activeSubTab === "video" && (
          <div className="flex-1 flex flex-col justify-between space-y-6 animate-fade-in" id="video-analyzer-subpanel">
            <div className="border-b border-black/[0.05] pb-4 flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-teal-brand" />
              <div>
                <h4 className="text-sm font-bold text-teal-dark font-sans leading-none">Video Content Analyzer</h4>
                <p className="text-[10px] text-secondary font-sans mt-1">Upload a video clip and let Gemini Pro breakdown its scientific and coding concepts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
              {/* Left Settings/Prompt Column */}
              <div className="md:col-span-5 space-y-4">
                {/* File Upload Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondary uppercase font-sans">Upload Video File</label>
                  <div className="border-2 border-dashed border-black/[0.08] hover:border-teal-brand/40 bg-surface-0 rounded-2xl p-5 text-center cursor-pointer transition-all relative">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2">
                      <Upload className="w-6 h-6 text-teal-brand mx-auto" />
                      <div className="text-xs text-primary font-bold font-sans">
                        {videoFile ? videoFile.name : "Select Video Clip (mp4/webm)"}
                      </div>
                      <p className="text-[9px] text-secondary font-sans">Max size: 12MB</p>
                    </div>
                  </div>
                </div>

                {/* Analysis Prompt Instructions */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-secondary uppercase font-sans">Analysis Instruction Prompt</label>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    rows={4}
                    placeholder="E.g., Summarize this scientific demonstration, identify key safety risks, and explain how I can structure this into a classroom lab."
                    className="w-full text-xs p-3 border border-black/[0.08] rounded-xl bg-surface-0 font-sans text-primary leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-brand/10 focus:border-teal-brand"
                  />
                </div>

                {/* Call To Action button */}
                <button
                  type="button"
                  onClick={handleAnalyzeVideo}
                  disabled={!videoFile || isVideoLoading}
                  className="w-full py-2.5 bg-teal-dark hover:bg-opacity-95 text-white font-sans font-bold text-xs rounded-xl shadow-3xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVideoLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-teal-brand" />
                      <span>Gemini is scanning frames...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-teal-brand" />
                      <span>Analyze Video (Pro Engine)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Output Analysis Review screen */}
              <div className="md:col-span-7 bg-surface-0 border border-black/[0.04] rounded-2xl p-4 flex flex-col justify-between min-h-[350px] relative overflow-hidden">
                <div className="flex-1 flex flex-col space-y-4">
                  {/* HTML5 Video preview */}
                  {videoPreview && (
                    <div className="w-full max-h-[160px] aspect-video bg-black rounded-lg overflow-hidden border border-black/10 flex items-center justify-center">
                      <video
                        src={videoPreview}
                        controls
                        className="h-full object-contain"
                      />
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto max-h-[220px] scrollbar-thin">
                    {videoAnalysis ? (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold text-teal-brand uppercase tracking-wider block">Pedagogical Analysis Report</span>
                        <div className="text-xs text-primary leading-relaxed font-sans whitespace-pre-line bg-white border border-black/[0.03] p-4 rounded-xl shadow-3xs">
                          {videoAnalysis}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-6">
                        <div className="w-12 h-12 rounded-full bg-teal-light flex items-center justify-center text-teal-brand mx-auto">
                          <VideoIcon className="w-5 h-5" />
                        </div>
                        <h5 className="text-xs font-bold text-primary font-sans">Awaiting Video Analysis</h5>
                        <p className="text-[11px] text-secondary leading-relaxed font-sans font-normal max-w-xs">
                          Upload your lesson video clip, choose your instructional objective, and tap Analyze to generate a comprehensive lesson guide.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {videoError && (
                  <div className="p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-xs font-sans flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{videoError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
