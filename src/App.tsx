import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  BookOpen, 
  Layers, 
  Activity, 
  FileText, 
  HelpCircle, 
  Link2Off, 
  FileCode, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  TrendingUp, 
  DollarSign, 
  Users,
  Search,
  ExternalLink,
  Printer,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sliders,
  Check,
  X,
  Play,
  Upload,
  Database,
  Cloud,
  LogIn,
  LogOut,
  Trash2,
  Bookmark,
  Briefcase,
  HelpCircle as HelpIcon,
  ShieldAlert,
  Terminal,
  Video,
  Music,
  Brain,
  Save,
  Crown,
  Palette,
  Sun,
  Moon,
  Code,
  Laptop,
  Cpu,
  Copy
} from "lucide-react";
import { PRELOADED_LESSONS } from "./data/preloadedLessons";
import { INITIAL_PROCESSED_LESSON } from "./data/initialProcessedLesson";
import { ProcessedLesson, PreloadedLesson } from "./types";
import { useFirebase } from "./context/FirebaseContext";
import SubscriptionModal from "./components/SubscriptionModal";
import InteractiveSlideshow from "./components/InteractiveSlideshow";
import AICopilot from "./components/AICopilot";
import NanaBananaPro from "./components/NanaBananaPro";
import { LandingPage } from "./components/LandingPage";

// Vector Robot Bunny Mascot SVG
export const RobotBunnyMascot = ({ className = "w-28 h-28" }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Ears */}
    <g transform="translate(0, -4)">
      {/* Left Ear */}
      <rect x="36" y="8" width="14" height="42" rx="7" fill="#1a4a45" />
      <rect x="40" y="14" width="6" height="30" rx="3" fill="#00C2B2" />
      {/* Right Ear */}
      <rect x="70" y="8" width="14" height="42" rx="7" fill="#1a4a45" />
      <rect x="74" y="14" width="6" height="30" rx="3" fill="#00C2B2" />
    </g>
    {/* Head / Body */}
    <rect x="30" y="44" width="60" height="52" rx="20" fill="#1a4a45" stroke="#00C2B2" strokeWidth="2.5" />
    {/* Face Screen */}
    <rect x="38" y="52" width="44" height="28" rx="10" fill="#0f1117" stroke="#2ec4b8" strokeWidth="1" />
    {/* Glowing Eyes */}
    <circle cx="50" cy="66" r="4.5" fill="#00C2B2" className="animate-pulse" />
    <circle cx="70" cy="66" r="4.5" fill="#00C2B2" className="animate-pulse" />
    {/* Cheek blush */}
    <circle cx="43" cy="72" r="2" fill="#2ec4b8" opacity="0.6" />
    <circle cx="77" cy="72" r="2" fill="#2ec4b8" opacity="0.6" />
    {/* Little happy mouth */}
    <path d="M57 73 Q60 76 63 73" stroke="#00C2B2" strokeWidth="1.5" strokeLinecap="round" />
    {/* Antenna */}
    <line x1="60" y1="44" x2="60" y2="34" stroke="#1a4a45" strokeWidth="3" />
    <circle cx="60" cy="32" r="4.5" fill="#00C2B2" />
    {/* Collar & Badge */}
    <path d="M46 96 L60 92 L74 96 L60 101 Z" fill="#C97D10" />
    {/* Sparkle badge on top right */}
    <path d="M102 32 L104 38 L110 40 L104 42 L102 48 L100 42 L94 40 L100 38 Z" fill="#00C2B2" />
    {/* Little yellow star sparkle on left */}
    <path d="M16 64 L17 68 L21 69 L17 70 L16 74 L15 70 L11 69 L15 68 Z" fill="#C97D10" />
  </svg>
);

export default function App() {
  const { 
    user, 
    profile,
    signInWithGoogle, 
    logOut, 
    savedLessons, 
    saveLessonToCloud, 
    deleteLessonFromCloud, 
    saveInstructorPreferences,
    subscribeUser,
    authLoading, 
    dbLoading 
  } = useFirebase();

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [isManuallyEdited, setIsManuallyEdited] = useState<boolean>(false);

  const handleSaveToCloud = async () => {
    try {
      await saveLessonToCloud(lesson);
      setSaveStatus("Saved successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      console.error("Failed to save lesson:", err);
      alert("Failed to save lesson: " + err.message);
    }
  };

  // Selection and Input states
  const [selectedPreload, setSelectedPreload] = useState<string>("rocketry");
  const [customContent, setCustomContent] = useState<string>(PRELOADED_LESSONS[0]?.rawContent || "");
  const [customPreferences, setCustomPreferences] = useState<string>("");
  const [transformationGoal, setTransformationGoal] = useState<"gamify" | "presentation">("gamify");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  
  // App states
  const [currentView, setCurrentView] = useState<"landing" | "studio">("landing");
  const [lesson, setLesson] = useState<ProcessedLesson>(INITIAL_PROCESSED_LESSON);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"slides" | "lab" | "nana-banana" | "quiz" | "media">("slides");
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState<string>("");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [generatedCount, setGeneratedCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('lyra_free_lessons_count') || '0');
    } catch {
      return 0;
    }
  });

  // 2026 Cyber STEM Lab Dark Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lyra_cyber_lab_dark') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lyra_cyber_lab_dark', isDarkMode.toString());
    } catch (e) {}
  }, [isDarkMode]);

  // 2026 Micro-delay Compilation & Block Simulation states
  const [compilationStep, setCompilationStep] = useState<number>(0);
  const [simulatingBlockStep, setSimulatingBlockStep] = useState<number>(-1);
  const [isSimulatingBlock, setIsSimulatingBlock] = useState<boolean>(false);

  // Helper to derive dynamic progress compilation messages per curriculum
  const getDynamicCompilationStepText = (
    step: number, 
    content: string, 
    fileName: string | null, 
    goal: string
  ): string => {
    const text = (content + " " + (fileName || "")).toLowerCase();

    if (step === 1) {
      if (fileName) {
        const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[_]/g, " ").replace(/[-]/g, " ");
        return `Parsing "${cleanName.length > 25 ? cleanName.slice(0, 25) + '...' : cleanName}" logic pathways`;
      }
      return "Parsing curriculum logic & learning objectives";
    }

    if (step === 2) {
      if (goal === "presentation") {
        return "Building visual slide concepts & teaching analogies";
      }
      if (text.includes("scratch") || text.includes("code") || text.includes("program") || text.includes("block") || text.includes("algorithm") || text.includes("variable")) {
        return "Linking Scratch & block-based code logic";
      }
      if (text.includes("chem") || text.includes("bio") || text.includes("eco") || text.includes("plant") || text.includes("animal") || text.includes("organ") || text.includes("cell")) {
        return "Formulating hands-on lab experiments & scientific models";
      }
      if (text.includes("rock") || text.includes("space") || text.includes("force") || text.includes("physics") || text.includes("bridge") || text.includes("eng") || text.includes("truss") || text.includes("gravity") || text.includes("motion")) {
        return "Linking hands-on engineering & physics models";
      }
      if (text.includes("math") || text.includes("geom") || text.includes("stat") || text.includes("fraction") || text.includes("number") || text.includes("equation")) {
        return "Structuring interactive math manipulatives & logic puzzles";
      }
      if (fileName) {
        const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[_]/g, " ").replace(/[-]/g, " ");
        return `Linking active STEM challenges for ${cleanName.length > 20 ? cleanName.slice(0, 20) + '...' : cleanName}`;
      }
      return "Linking active STEM challenges & interactive models";
    }

    if (step === 3) {
      if (goal === "presentation") {
        return "Synthesizing presentation slide deck & discussion points";
      }
      return "Synthesizing interactive slides, lab guide & smart quiz";
    }

    return "";
  };
  
  // Interactive Quiz states
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Lab material checking states
  const [checkedMaterials, setCheckedMaterials] = useState<Record<string, boolean>>({});

  // Worksheet simulated answers
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [showSampleAnswers, setShowSampleAnswers] = useState<boolean>(false);

  // Expandable Intake Panel state
  const [isUploadExpanded, setIsUploadExpanded] = useState<boolean>(true);

  // Deleting lesson ID state
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  // Interactive Chip parameters state (for easy configuration)
  const [selectedGrade, setSelectedGrade] = useState<string>("K-2nd");
  const [customGradeInput, setCustomGradeInput] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("15-20 kids");
  const [selectedDuration, setSelectedDuration] = useState<string>("60 mins");
  const [selectedTech, setSelectedTech] = useState<string>("Smart Board");

  // Redirect to studio whenever user logs in or creates account from landing
  useEffect(() => {
    if (user && currentView === "landing") {
      setCurrentView("studio");
    }
  }, [user, currentView]);

  const handleSignInAndRedirect = async () => {
    try {
      await signInWithGoogle();
      setCurrentView("studio");
    } catch (err: any) {
      console.error("Sign in failed:", err);
    }
  };

  // Sync selected preload into custom content textbox
  useEffect(() => {
    const found = PRELOADED_LESSONS.find(p => p.id === selectedPreload);
    if (found) {
      setCustomContent(found.rawContent);
    }
  }, [selectedPreload]);

  // Reset quiz state when lesson changes
  useEffect(() => {
    setCurrentQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setShowExplanation(false);
    
    // Clear material checkmarks
    const initialChecked: Record<string, boolean> = {};
    if (lesson?.handsOnActivity?.materials) {
      lesson.handsOnActivity.materials.forEach(m => {
        initialChecked[m] = false;
      });
    }
    setCheckedMaterials(initialChecked);
    setStudentAnswers({});
  }, [lesson]);

  // Detect if current lesson is a coding / computer science / Scratch / Python curriculum
  const isCodingLesson = React.useMemo(() => {
    if (!lesson) return false;
    const textToScan = [
      lesson.lessonTitle,
      lesson.summary,
      ...(lesson.keyTakeaways || []),
      ...(lesson.handsOnActivity?.materials || []),
      ...(lesson.handsOnActivity?.steps || []),
      lesson.handsOnActivity?.title || '',
      lesson.handsOnActivity?.scientificPrinciple || ''
    ].join(" ").toLowerCase();

    const codingKeywords = [
      "code", "coding", "scratch", "python", "block", "algorithm", "program",
      "programming", "variable", "loop", "conditional", "function", "syntax",
      "css", "html", "javascript", "js", "micro:bit", "microbit", "arduino",
      "robot", "robotics", "logic", "event", "sprite", "pseudocode", "debug",
      "computer science", "app design"
    ];

    return codingKeywords.some(kw => textToScan.includes(kw));
  }, [lesson]);

  const [codeCopied, setCodeCopied] = useState<boolean>(false);

  const handleCopyCodeBlocks = () => {
    if (!lesson?.handsOnActivity?.steps) return;
    const formattedBlocks = lesson.handsOnActivity.steps
      .map((step, i) => `// Block ${i + 1}\n${step}`)
      .join("\n\n");
    navigator.clipboard.writeText(formattedBlocks);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };
  useEffect(() => {
    if (!isManuallyEdited) {
      const effectiveGrade = selectedGrade === "Custom" ? (customGradeInput.trim() || "Custom Age Range") : selectedGrade;
      const specs = `Tailor for ${effectiveGrade} grade, class size of ${selectedSize}, duration of ${selectedDuration}, with ${selectedTech} available.`;
      setCustomPreferences(specs);
    }
  }, [selectedGrade, customGradeInput, selectedSize, selectedDuration, selectedTech, isManuallyEdited]);

  // Load preferences from Firebase Profile when logged in
  useEffect(() => {
    if (profile) {
      if (profile.customPreferences !== undefined && profile.customPreferences !== "") {
        setCustomPreferences(profile.customPreferences);
        setIsManuallyEdited(true);
      }
      if (profile.grade) setSelectedGrade(profile.grade);
      if (profile.classSize) setSelectedSize(profile.classSize);
      if (profile.duration) setSelectedDuration(profile.duration);
      if (profile.tech) setSelectedTech(profile.tech);
    }
  }, [profile]);

  const handleAutoGenerateFromChips = () => {
    const effectiveGrade = selectedGrade === "Custom" ? (customGradeInput.trim() || "Custom Age Range") : selectedGrade;
    const specs = `Tailor for ${effectiveGrade} grade, class size of ${selectedSize}, duration of ${selectedDuration}, with ${selectedTech} available.`;
    setCustomPreferences(specs);
    setIsManuallyEdited(false);
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setProfileSaving(true);
    try {
      await saveInstructorPreferences(
        customPreferences,
        selectedGrade,
        selectedSize,
        selectedDuration,
        selectedTech
      );
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save instructor preferences:", err);
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle uploaded files by reading them as text
  const handleFileUpload = (file: File) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setExtractionError(null);

    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (fileExt === "pdf" || fileExt === "docx") {
      setIsExtracting(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64String = e.target?.result as string;
          // strip data url prefix if exists (e.g. "data:application/pdf;base64,")
          const base64Data = base64String.split(",")[1] || base64String;

          const response = await fetch("/api/extract-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileBase64: base64Data,
              fileName: file.name
            })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to extract text from document");
          }

          const data = await response.json();
          if (data.text) {
            setCustomContent(data.text);
          } else {
            throw new Error("No text content could be extracted from this document.");
          }
        } catch (err: any) {
          console.error("Text extraction failed:", err);
          setExtractionError(err?.message || String(err));
          setUploadedFileName(null);
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          setCustomContent(text);
        }
      };
      reader.readAsText(file);
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Micro-delay simulation for Scratch block execution feedback
  const handleSimulateBlockRun = () => {
    if (isSimulatingBlock || !lesson.handsOnActivity.steps || lesson.handsOnActivity.steps.length === 0) return;
    setIsSimulatingBlock(true);
    setSimulatingBlockStep(0);

    const totalSteps = lesson.handsOnActivity.steps.length;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < totalSteps) {
        setSimulatingBlockStep(currentStep);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setSimulatingBlockStep(-1);
          setIsSimulatingBlock(false);
        }, 600);
      }
    }, 550); // 550ms micro-delay between STEM code step triggers
  };

  // Call server-side backend API to process lesson using Gemini
  const handleProcessLesson = async () => {
    // 1 Free Lesson enforcement
    if (!profile?.isSubscribed && generatedCount >= 1) {
      setShowSubscriptionModal(true);
      return;
    }

    setIsLoading(true);
    setCompilationStep(1);
    setError(null);

    // Purposeful micro-delay sequence for STEM haptic reassurance
    const t1 = setTimeout(() => setCompilationStep(2), 400);
    const t2 = setTimeout(() => setCompilationStep(3), 850);

    try {
      // Autosave custom preferences immediately before processing
      if (user) {
        try {
          await saveInstructorPreferences(
            customPreferences,
            selectedGrade,
            selectedSize,
            selectedDuration,
            selectedTech
          );
        } catch (saveErr) {
          console.error("Frictionless preferences autosave failed:", saveErr);
        }
      }

      const goalDirective = transformationGoal === "gamify" 
        ? "Objective: Gamify this lesson. Emphasize active gamification, gamified team-building exercises, interactive smart quizzes, and kid-friendly hands-on classroom experiments. Make it highly engaging, playful, and extremely interactive." 
        : "Objective: Create Presentation. Focus on building highly visual, conceptual slides with comprehensive step-by-step teaching guidelines, analogies, clear explanations, and structured classroom lecture summaries.";

      const response = await fetch("/api/process-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonContent: customContent,
          customPreferences: customPreferences 
            ? `${customPreferences}. ${goalDirective}` 
            : goalDirective
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      setLesson(data);

      // Increment 1 free lesson count
      const newCount = generatedCount + 1;
      setGeneratedCount(newCount);
      try {
        localStorage.setItem('lyra_free_lessons_count', newCount.toString());
      } catch (e) {
        console.error("Failed to store free lesson count:", e);
      }

      // Save extractedStyleNotes from Gemini into instructor's profile memory
      if (user && data.extractedStyleNotes) {
        try {
          await saveInstructorPreferences(
            customPreferences,
            selectedGrade,
            selectedSize,
            selectedDuration,
            selectedTech,
            data.extractedStyleNotes
          );
        } catch (saveNotesErr) {
          console.error("Autosaving Lyra's extracted style notes failed:", saveNotesErr);
        }
      }

      setActiveTab("slides");
      setIsUploadExpanded(false);
      setTimeout(() => {
        document.getElementById("workspace-panel")?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || 
        "Something went wrong while communicating with Gemini. Please check your network connection or API Key."
      );
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsLoading(false);
      setCompilationStep(0);
    }
  };

  // Quick helper to fill local mock preview
  const handleQuickDemoFill = (preloadId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      if (preloadId === "rocketry") {
        setLesson(INITIAL_PROCESSED_LESSON);
      } else if (preloadId === "bridges") {
        setLesson({
          lessonTitle: "Bridge Physics & The Power of Triangles",
          duration: "45-60 minutes",
          summary: "Learn how civil structures balance physical tension and compression using balsa wood. Explore bridge-building mechanics through active material testing and structural design!",
          keyTakeaways: [
            "Tension is a pulling force, while Compression is a squeezing force.",
            "Triangles are the strongest shape in structural engineering because they resist warping.",
            "Truss bridges distribute vertical weight loads sideways into solid abutments.",
            "Material testing helps civil engineers find exact load limits before collapsing."
          ],
          slides: [
            {
              title: "What is Structural Balance?",
              content: [
                "Bridges carry enormous weight without bending or collapsing.",
                "To do this, engineers balance two invisible opposite forces: Tension and Compression.",
                "Tension pulls and stretches materials, while Compression squeezes and crushes them."
              ],
              visualConcept: "A detailed 3D rendering of a simple beam bridge with a large red truck crossing it. Compression is illustrated with solid red downward arrows on the upper surface, while Tension is shown with blue pulling arrows on the bottom surface.",
              instructorNotes: "Ask kids to place their hands together flat and push as hard as they can. That's compression! Now have them clasp their fingers together and pull. That's tension!"
            },
            {
              title: "The Magic of Triangles",
              content: [
                "Square structures fold or buckle easily under heavy pressure.",
                "Triangles cannot be deformed without altering the length of their sides.",
                "A Truss Bridge uses interconnected triangular patterns to withstand enormous weight."
              ],
              visualConcept: "Side-by-side comparative animation. On the left: a wooden square frame leaning over, collapsing sideways under a weight. On the right: a triangular frame staying completely rigid under double the weight.",
              instructorNotes: "Show them a cardboard triangle and square. Let them push down on both to feel how easily the square collapses versus the absolute rigidness of the triangle."
            }
          ],
          handsOnActivity: {
            title: "Popsicle Stick Truss Challenge",
            materials: [
              "50 wooden craft popsicle sticks",
              "Quick-drying non-toxic school craft glue",
              "12-inch heavy ruler / guide template",
              "A small plastic bucket with handle",
              "Weights (dry sand, pebbles, or heavy metal coins)"
            ],
            steps: [
              "Design a simple 12-inch truss span using popsicle sticks forming triangular grids (Warrens truss style).",
              "Glue the sticks together overlapping securely and allow 10-15 minutes to dry partially.",
              "Set up a bridge testbed by placing your bridge span between two tables spaced exactly 10 inches apart.",
              "Hang the bucket S-hook from the exact center beam of your popsicle stick deck.",
              "Slowly add sand or pebbles cup-by-cup, recording the total weights on your data sheet.",
              "Observe structural behavior. Identify which joint starts cracking or twisting first!"
            ],
            scientificPrinciple: "The triangular design of the truss forces the vertical downward pull of the bucket to distribute evenly as tension (stretching) and compression (squeezing) through all popsicle sticks, directing the force safely to the two table edges!"
          },
          worksheet: {
            title: "Truss Strength Testing Report",
            instructions: "Conduct the load stress test on your popsicle bridge and answer these engineering questions.",
            questions: [
              {
                id: "Q1",
                questionText: "What is the total weight in grams or ounces your bridge supported before failure?",
                answerType: "Fill in the Blank",
                sampleAnswer: "Answers will vary (typically around 5 to 15 pounds of sand)."
              },
              {
                id: "Q2",
                questionText: "Which shape did you use repeatedly in your truss design, and why?",
                answerType: "Short Answer",
                sampleAnswer: "Triangles, because they distribute forces evenly and don't warp or slide under vertical pressure."
              }
            ]
          },
          quiz: [
            {
              question: "Which physical force pulls and stretches bridge materials?",
              options: [
                "Compression",
                "Tension",
                "Friction",
                "Gravity"
              ],
              correctAnswerIndex: 1,
              explanation: "Tension is the force that pulls or stretches materials apart."
            },
            {
              question: "Why are triangles considered the absolute strongest shape in engineering?",
              options: [
                "Because they are lightweight and aerodynamic.",
                "Because their three corners cannot deform without changing side lengths.",
                "Because they require the least amount of glue to build.",
                "Because they look modern and beautiful."
              ],
              correctAnswerIndex: 1,
              explanation: "A triangle is geometrically rigid; it cannot warp or collapse unless one of its sides physically snaps or compresses."
            }
          ],
          mediaRecommendations: [
            {
              resourceType: "Interactive Map & Video",
              suggestedSearchQuery: "Tacoma Narrows Bridge collapse structural resonance lesson",
              whyItHelps: "Perfect historical demonstration of what happens when torsional forces are not accounted for in structural designs, turning a giant bridge into waves!"
            }
          ]
        });
      } else {
        setLesson({
          lessonTitle: "The Invisible Force: Electromagnetism",
          duration: "45-60 minutes",
          summary: "Uncover how moving electrical current generates magnetic fields. Build a temporary electromagnet from an iron nail and wire, and test its capabilities in this electrifying lab!",
          keyTakeaways: [
            "Moving electrical charges (current) create corresponding magnetic fields.",
            "Wrapping wire into a coil (solenoid) concentrates and multiplies magnetic strength.",
            "Adding an iron core aligns magnetic domains, making the electromagnet super strong.",
            "Electromagnets are temporary—turning off the current instantly stops the magnetism."
          ],
          slides: [
            {
              title: "What is Electromagnetism?",
              content: [
                "Electricity and magnetism are two sides of the same fundamental force.",
                "Danish physicist Hans Christian Ørsted discovered this when a live wire moved his compass needle!",
                "Whenever electricity flows through a wire, it creates a circular magnetic field around it."
              ],
              visualConcept: "An illustration of a straight copper wire carrying yellow energy sparks. Around the wire are concentric circular green magnetic field rings, with a compass needle pointing parallel to the circular field lines.",
              instructorNotes: "Ask kids: 'Who has a magnet on their fridge? How is that different from a computer or phone?' Fridge magnets are permanent, but electromagnets can be switched ON and OFF with a button!"
            }
          ],
          handsOnActivity: {
            title: "Supercharged Solenoid Electromagnet",
            materials: [
              "3-inch heavy steel nail (ferromagnetic core)",
              "5 feet of insulated 24-gauge magnet wire",
              "Standard 1.5V D-cell battery",
              "A handful of steel paperclips (magnetic test targets)",
              "Sandpaper (to strip wire insulation)"
            ],
            steps: [
              "Leave 6 inches of wire loose, then wrap the copper wire tightly around the steel nail at least 40 times in one direction.",
              "Keep the coils closely packed together, like a spring.",
              "Use sandpaper to scrape off the colored plastic coating from both ends of the wire.",
              "Hold one stripped end to the battery's positive (+) side and the other to the negative (-) side (be careful, wires can get warm!).",
              "Touch the tip of the coiled nail to paperclips and see how many you can pick up!",
              "Disconnect one wire end and observe the paperclips instantly drop to the table."
            ],
            scientificPrinciple: "Electricity flowing through the copper coil creates a magnetic field. This field aligns all the micro-domains inside the iron nail, turning it into a temporary magnet. Unclamping the wire collapses the field, reverting the nail to normal metal!"
          },
          worksheet: {
            title: "Electromagnet Testing & Design Lab",
            instructions: "Count paperclips picked up under different designs and answer the questions.",
            questions: [
              {
                id: "Q1",
                questionText: "What happens to the number of paperclips picked up if you double the number of wire wraps from 40 to 80?",
                answerType: "Multiple Choice",
                options: [
                  "It picks up double the paperclips because more loops strengthen the magnetic field.",
                  "It picks up fewer because there is too much wire for the battery.",
                  "It does not change at all."
                ],
                sampleAnswer: "It picks up double the paperclips because more loops strengthen the magnetic field."
              }
            ]
          },
          quiz: [
            {
              question: "Who discovered that electrical currents deflect compass needles?",
              options: [
                "Isaac Newton",
                "Thomas Edison",
                "Hans Christian Ørsted",
                "Albert Einstein"
              ],
              correctAnswerIndex: 2,
              explanation: "Hans Christian Ørsted observed this deflection in 1820, proving that electricity creates magnetic fields!"
            }
          ],
          mediaRecommendations: [
            {
              resourceType: "Video Demonstration",
              suggestedSearchQuery: "Scrapyard giant electromagnet crane picking up cars",
              whyItHelps: "A spectacular visual example showing how a massive crane picks up heavy scrap cars, shifts them, and drops them simply by flipping an electrical switch!"
            }
          ]
        });
      }
      setIsLoading(false);
      setActiveTab("slides");
      setIsUploadExpanded(false);
      setTimeout(() => {
        document.getElementById("workspace-panel")?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }, 500);
  };

  // Toggle checklist materials
  const toggleMaterial = (material: string) => {
    setCheckedMaterials(prev => ({
      ...prev,
      [material]: !prev[material]
    }));
  };

  // Grade Quiz Selection
  const handleQuizOptionClick = (optionIndex: number) => {
    if (selectedQuizOption !== null) return;
    setSelectedQuizOption(optionIndex);
    setShowExplanation(true);
    
    const isCorrect = optionIndex === lesson.quiz[currentQuizIndex].correctAnswerIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
  };

  // Go to next quiz question
  const handleNextQuiz = () => {
    setSelectedQuizOption(null);
    setShowExplanation(false);
    if (currentQuizIndex < lesson.quiz.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  // Reset current quiz game
  const handleResetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setShowExplanation(false);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-[#0b0f19] text-slate-100" : "bg-surface-0 text-primary"} flex flex-col antialiased transition-colors duration-300 w-full`}>
      {/* Full Viewport Document Canvas Container */}
      <div className={`w-full ${isDarkMode ? "bg-[#0f172a] text-slate-100" : "bg-white text-primary"} min-h-screen flex flex-col pb-16 px-3 sm:px-6 lg:px-10 xl:px-12 transition-colors duration-300`}>
        
        {/* Navigation Bar (ly-nav) */}
        <nav className={`px-3 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between gap-2.5 sm:gap-4 backdrop-blur-md sticky top-0 z-30 transition-all -mx-3 sm:-mx-6 lg:-mx-10 xl:-mx-12 px-3 sm:px-6 lg:px-10 xl:px-12 ${
          isDarkMode ? "border-slate-800/80 bg-slate-900/85 liquid-glass-dark" : "border-black/[0.09] bg-white/85 liquid-glass-light"
        }`}>
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
            onClick={() => setCurrentView("landing")}
          >
            {/* Mascot in mini logo format */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-light dark:bg-teal-brand/20 flex items-center justify-center shrink-0 border border-teal-brand/30 group-hover:scale-105 transition-transform micro-glow-teal">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-teal-brand" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-teal-dark dark:text-teal-brand">
                Lyra<span className="text-teal-brand font-sans">.</span>
              </span>
              <p className="text-[9px] sm:text-[10px] text-secondary dark:text-slate-400 font-sans tracking-wide leading-none hidden xs:block">Afterschool STEM Copilot</p>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Fixed Top Navbar Link: My Lessons Vault */}
            <button
              type="button"
              onClick={() => {
                if (currentView !== "studio") {
                  setCurrentView("studio");
                }
                setTimeout(() => {
                  const el = document.getElementById("my-lessons-vault");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else if (!user) {
                    handleSignInAndRedirect();
                  }
                }, 100);
              }}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[38px] border ${
                isDarkMode 
                  ? "bg-slate-800 text-teal-brand border-slate-700 hover:bg-slate-700 hover:border-teal-brand/40" 
                  : "bg-teal-light/60 text-teal-dark border-teal-brand/30 hover:bg-teal-light hover:border-teal-brand/50"
              }`}
              title="View your saved lessons in Firebase Cloud Storage"
            >
              <Cloud className="w-3.5 h-3.5 text-teal-brand" />
              <span>My Lessons</span>
              {user && savedLessons.length > 0 && (
                <span className="px-1.5 py-0.2 bg-teal-brand text-slate-950 font-mono text-[9px] font-extrabold rounded-full">
                  {savedLessons.length}
                </span>
              )}
            </button>

            {/* 2026 Cyber STEM Lab Theme Switcher */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 min-h-[38px] ${
                isDarkMode 
                  ? "bg-slate-800 text-amber-300 border-slate-700 hover:border-amber-400 micro-glow-amber" 
                  : "bg-surface-1 text-teal-dark border-black/[0.08] hover:border-teal-brand/40"
              }`}
              title={isDarkMode ? "Switch to Studio Light Theme" : "Switch to 2026 Cyber Lab Dark Theme"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {profile?.isSubscribed ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-600/50 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-full shadow-3xs micro-glow-emerald">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Pro Member</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSubscriptionModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-full shadow-3xs hover:shadow-xs transition-all cursor-pointer border border-amber-300/60 micro-glow-amber min-h-[38px]"
              >
                <Crown className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span>Upgrade</span>
              </button>
            )}

            {authLoading ? (
              <div className="w-5 h-5 border-2 border-teal-brand border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className={`flex items-center gap-1.5 sm:gap-2 p-1 pr-2.5 sm:pr-3 rounded-full border shadow-3xs text-xs ${
                isDarkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-surface-1 border-black/[0.05]"
              }`}>
                {user.photoURL ? (
                  <img referrerPolicy="no-referrer" src={user.photoURL} alt={user.displayName || 'Educator'} className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full object-cover border border-teal-brand/20" />
                ) : (
                  <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full bg-teal-dark text-white flex items-center justify-center font-bold text-[10px]">
                    {user.displayName?.[0]?.toUpperCase() || 'E'}
                  </div>
                )}
                <span className="font-sans font-medium text-teal-dark dark:text-teal-brand max-w-[70px] sm:max-w-[100px] truncate hidden sm:inline">{user.displayName?.split(" ")[0]}</span>
                <button
                  type="button"
                  onClick={logOut}
                  className="ml-0.5 text-[10px] text-red-600 dark:text-red-400 hover:text-red-700 font-bold transition-all px-1.5 py-0.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                  title="Sign Out"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignInAndRedirect}
                className="px-3 sm:px-3.5 py-1.5 bg-teal-dark hover:bg-opacity-95 text-white rounded-full text-xs font-bold transition-all shadow-3xs flex items-center gap-1.5 cursor-pointer micro-glow-teal min-h-[38px]"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-brand" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </nav>

        {currentView === "landing" ? (
          <LandingPage 
            onLaunchStudio={() => setCurrentView("studio")} 
            onSelectPlan={() => setShowSubscriptionModal(true)}
            user={user}
            onSignIn={handleSignInAndRedirect}
          />
        ) : (
          <div className="flex-1 flex flex-col w-full">
            {/* Hero Section (ly-hero) */}
            <header className="px-3 sm:px-6 lg:px-8 py-6 sm:py-10 relative overflow-hidden bg-gradient-to-b from-teal-light/20 to-transparent border-b border-black/[0.04] dark:border-slate-800/80 -mx-3 sm:-mx-6 lg:-mx-10 xl:-mx-12 px-3 sm:px-6 lg:px-10 xl:px-12">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-brand/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2.5 sm:space-y-3 max-w-2xl">
              <span className="inline-block text-[10px] font-bold tracking-widest text-gold-brand uppercase font-sans">
                XPRIZE · Education & Human Potential
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-primary dark:text-slate-100 leading-tight">
                Your AI copilot for <span className="text-teal-dark dark:text-teal-brand underline decoration-teal-brand/40 underline-offset-4">STEM lesson prep</span>
              </h1>
              <p className="text-xs sm:text-sm text-secondary dark:text-slate-300 leading-relaxed font-sans font-normal">
                Lyra turns long, messy science articles and PDF textbooks into beautiful interactive slide decks, hands-on lab guides, printable worksheets, and broken media link backups instantly.
              </p>
            </div>

            {/* Mascot float wrap on the right */}
            <div className="self-center md:self-auto shrink-0 bg-teal-light/40 dark:bg-slate-800/60 border border-teal-brand/10 dark:border-teal-brand/30 rounded-2xl p-3 sm:p-4 shadow-3xs animate-float">
              <RobotBunnyMascot className="w-20 h-20 sm:w-28 sm:h-28" />
            </div>
          </div>

          {/* Interactive Core Intake Controller (ly-upload-zone) */}
          <div className="mt-8 bg-white dark:bg-slate-900/90 border border-black/[0.12] dark:border-slate-800 rounded-2xl shadow-sm transition-all overflow-hidden" id="intake-panel">
            
            {/* Step Header (Clickable Expandable Toggle) */}
            <div 
              className="flex justify-between items-center p-4 sm:p-5 cursor-pointer select-none border-b border-black/[0.06] dark:border-slate-800 hover:bg-black/[0.02] dark:hover:bg-slate-800/40 transition-colors"
              onClick={() => setIsUploadExpanded(!isUploadExpanded)}
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[10px] font-bold font-mono tracking-wider text-teal-brand uppercase bg-teal-light dark:bg-teal-brand/20 border border-teal-brand/20 px-2.5 py-0.5 rounded-md">
                  1. Upload Curriculum Material
                </span>
                {!isUploadExpanded && (uploadedFileName || customContent) && (
                  <span className="text-xs font-semibold text-teal-dark dark:text-teal-brand truncate max-w-[180px] sm:max-w-xs flex items-center gap-1.5 bg-teal-light/40 dark:bg-teal-brand/10 px-2.5 py-0.5 rounded-full border border-teal-brand/20">
                    <Check className="w-3 h-3 text-teal-brand shrink-0" />
                    <span className="truncate">{uploadedFileName || lesson?.lessonTitle || "Curriculum Text Loaded"}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-secondary dark:text-slate-400 font-sans flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-gold-brand" />
                  <span className="hidden sm:inline">Configuration</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUploadExpanded(!isUploadExpanded);
                  }}
                  className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-slate-800 text-secondary dark:text-slate-300 transition-all cursor-pointer"
                  aria-label={isUploadExpanded ? "Collapse Upload Section" : "Expand Upload Section"}
                >
                  {isUploadExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isUploadExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 sm:p-6 space-y-5"
                >
                  {/* Selection of transformation goal with high fidelity toggle buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-teal-dark dark:text-teal-brand block font-sans">Upload Option:</label>
                    <div className="p-4 rounded-xl border border-teal-brand bg-teal-light/20 dark:bg-teal-brand/10 text-teal-dark dark:text-teal-brand shadow-3xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-brand text-white flex items-center justify-center shrink-0 shadow-3xs">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold font-sans dark:text-slate-100">Upload & Generate</p>
                          <p className="text-[10px] text-secondary dark:text-slate-300 leading-normal font-sans">
                            Seamlessly transforms raw lesson plans into interactive slides, Visual Studio visual diagrams, hands-on activities, and smartboard quizzes.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-full bg-teal-brand text-white shrink-0 uppercase tracking-wide">
                        Active
                      </span>
                    </div>
                  </div>

            {/* PDF / Docx File Dropzone (ly-upload-zone) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-teal-dark dark:text-teal-brand block font-sans">Upload your file (PDF, DOCX, TXT):</label>
              
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => {
                  const el = document.getElementById("file-upload-input");
                  if (el) (el as HTMLInputElement).click();
                }}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                  dragActive 
                    ? "border-teal-brand bg-teal-light/30 dark:bg-teal-brand/20" 
                    : "border-black/[0.12] dark:border-slate-700 hover:border-black/[0.22] dark:hover:border-slate-600 bg-surface-0/50 dark:bg-slate-800/50 hover:bg-surface-0 dark:hover:bg-slate-800"
                }`}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".txt,.json,.md,.html,.pdf,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                {isExtracting ? (
                  <div className="space-y-2">
                    <RefreshCw className="w-8 h-8 text-teal-brand animate-spin mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-primary dark:text-slate-100 font-sans">Reading file securely...</p>
                      <p className="text-[10px] text-secondary dark:text-slate-300 font-sans mt-0.5">Running AI curriculum text parser</p>
                    </div>
                  </div>
                ) : uploadedFileName ? (
                  <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-teal-brand/30 flex items-center gap-3 shadow-3xs max-w-sm mx-auto">
                    <div className="w-8 h-8 rounded-lg bg-teal-light dark:bg-teal-brand/20 flex items-center justify-center text-teal-brand shrink-0">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-bold text-primary dark:text-slate-100 truncate max-w-[180px] font-sans">{uploadedFileName}</p>
                      <p className="text-[9px] text-teal-brand font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ready to parse
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFileName(null);
                        setCustomContent("");
                        const input = document.getElementById("file-upload-input") as HTMLInputElement;
                        if (input) input.value = "";
                      }}
                      className="p-1 text-secondary dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-all shrink-0 ml-2"
                      title="Clear file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-teal-light dark:bg-teal-brand/20 flex items-center justify-center text-teal-brand shrink-0 shadow-3xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary dark:text-slate-100 font-sans">
                        Drag & drop your file here, or <span className="text-teal-brand underline decoration-teal-brand/30">click to browse</span>
                      </p>
                      <p className="text-[10px] text-secondary dark:text-slate-300 leading-relaxed mt-0.5 font-sans">
                        PDF, DOCX, TXT, MD or Plain Text up to 10MB
                      </p>
                    </div>
                  </>
                )}
              </div>

              {extractionError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-950 flex gap-2 font-sans leading-normal">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold font-sans">Extraction Error:</span> {extractionError}
                  </div>
                </div>
              )}
            </div>

            {/* Raw lesson plan box (Optional paste) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-teal-dark dark:text-teal-brand font-sans">Curriculum Text Material:</label>
                {customContent && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomContent("");
                      setUploadedFileName(null);
                    }}
                    className="text-[10px] text-red-600 dark:text-red-400 hover:underline font-medium"
                  >
                    Clear Input
                  </button>
                )}
              </div>
              <textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                rows={5}
                placeholder="Paste textbook outlines, Wikipedia references, lecture notes, or standard curriculum text here..."
                className="w-full text-xs p-3.5 border border-black/[0.12] dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-brand/10 focus:border-teal-brand font-mono bg-surface-0/40 dark:bg-slate-800/80 text-primary dark:text-slate-100 leading-relaxed placeholder:text-slate-400"
              />

              {/* Sample preloaded pills styled cleanly */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-secondary dark:text-slate-300 font-sans">Load Quick Samples:</span>
                {PRELOADED_LESSONS.map((preload) => (
                  <button
                    key={preload.id}
                    type="button"
                    onClick={() => {
                      setCustomContent(preload.rawContent);
                      setUploadedFileName(`preset_${preload.id}.txt`);
                      handleQuickDemoFill(preload.id);
                    }}
                    className="text-[10px] font-bold text-teal-dark dark:text-teal-brand bg-teal-light/40 dark:bg-teal-brand/20 hover:bg-teal-light dark:hover:bg-teal-brand/30 hover:text-teal-brand border border-teal-brand/10 dark:border-teal-brand/30 px-2.5 py-0.5 rounded-full transition-all cursor-pointer"
                  >
                    {preload.id === "rocketry" ? "Rocket Physics" : preload.id === "bridges" ? "Bridge Static" : "Electromagnetism"}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive chip context rows (Appends parameters directly) */}
            <div className="bg-surface-0 dark:bg-slate-950/80 border border-black/[0.05] dark:border-slate-800 rounded-xl p-4.5 space-y-4">
              <span className="text-[10px] font-bold font-mono tracking-widest text-teal-brand uppercase block border-b dark:border-slate-800 pb-1.5">
                Target Classroom Parameters (Auto-Configurator)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Grade / Age Range */}
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-bold text-secondary dark:text-slate-300 uppercase font-sans">Age Range / Grade Level</span>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {["K-2nd", "Elementary (3-5)", "Middle (6-8)", "High School (9-12)", "Custom"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSelectedGrade(val)}
                        className={`text-[10px] px-2.5 py-1 rounded-md font-sans font-bold transition-all cursor-pointer ${
                          selectedGrade === val 
                            ? "bg-teal-dark dark:bg-teal-brand text-white dark:text-slate-950 shadow-3xs" 
                            : "bg-white dark:bg-slate-800 text-secondary dark:text-slate-300 hover:text-teal-dark dark:hover:text-white border border-black/[0.08] dark:border-slate-700"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  {selectedGrade === "Custom" && (
                    <div className="pt-1.5 animate-fade-in">
                      <input
                        type="text"
                        placeholder="Type custom age range (e.g. Pre-K, Ages 4-6, Adult Learners)"
                        value={customGradeInput}
                        onChange={(e) => setCustomGradeInput(e.target.value)}
                        className="text-xs px-3 py-1.5 border border-teal-brand/40 rounded-xl bg-white dark:bg-slate-800 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-teal-brand/20 focus:border-teal-brand font-sans text-teal-dark dark:text-teal-brand font-medium shadow-3xs"
                      />
                    </div>
                  )}
                </div>

                {/* Tech level */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-secondary dark:text-slate-300 uppercase font-sans">Technology Available</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Smart Board", "Chromebooks", "Tablets", "Low Tech (Paper Only)"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSelectedTech(val)}
                        className={`text-[10px] px-2 py-1 rounded-md font-sans font-bold transition-all ${
                          selectedTech === val 
                            ? "bg-teal-dark dark:bg-teal-brand text-white dark:text-slate-950" 
                            : "bg-white dark:bg-slate-800 text-secondary dark:text-slate-300 border border-black/[0.08] dark:border-slate-700"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preferences editable showcase with adaptive memory */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-secondary dark:text-slate-300 uppercase font-sans block">
                    Generated Instruction Directive
                  </span>
                  
                  {/* Controls */}
                  <div className="flex gap-2">
                    {isManuallyEdited && (
                      <button
                        type="button"
                        onClick={handleAutoGenerateFromChips}
                        className="text-[9px] text-teal-brand hover:text-teal-dark dark:hover:text-teal-light font-sans font-bold flex items-center gap-0.5 cursor-pointer"
                        title="Re-generate instruction text based on the selected chips above"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Reset to Chips</span>
                      </button>
                    )}
                    
                    {user && (
                      <button
                        type="button"
                        onClick={handleSavePreferences}
                        disabled={profileSaving}
                        className="text-[9px] text-teal-brand hover:text-teal-dark dark:hover:text-teal-light font-sans font-bold flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                        title="Save these instruction preferences to your profile permanently"
                      >
                        {profileSaveSuccess ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-teal-dark dark:text-teal-brand font-bold" />
                            <span className="text-teal-dark dark:text-teal-brand">Saved!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-2.5 h-2.5" />
                            <span>{profileSaving ? "Saving..." : "Save to Profile"}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  <textarea
                    value={customPreferences}
                    onChange={(e) => {
                      setCustomPreferences(e.target.value);
                      setIsManuallyEdited(true);
                    }}
                    className="w-full bg-white dark:bg-slate-800 p-3 border border-black/[0.08] dark:border-slate-700 rounded-xl text-[11px] font-mono text-teal-dark dark:text-teal-brand font-medium focus:outline-none focus:ring-2 focus:ring-teal-brand/10 focus:border-teal-brand transition-all resize-y min-h-[70px]"
                    placeholder="Describe specific class constraints, student behaviors, curriculum alignment, or custom styles..."
                  />
                  {isManuallyEdited && (
                    <div className="absolute right-2 bottom-2 text-[8px] text-teal-brand font-sans font-medium px-1.5 py-0.5 rounded-md bg-teal-light/50 border border-teal-brand/10 select-none">
                      Edited
                    </div>
                  )}
                </div>

                {/* Lyra's Memory Profile & AI Insights */}
                {user ? (
                  <div className="bg-teal-light/10 border border-teal-brand/15 rounded-xl p-3 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-teal-brand animate-pulse" />
                      <span className="text-[9px] font-bold text-teal-dark uppercase tracking-wider font-sans">
                        Lyra's Memory of You
                      </span>
                    </div>
                    {profile?.instructorNotes ? (
                      <div className="space-y-1">
                        <p className="text-[10px] text-secondary font-sans leading-relaxed">
                          "I've learned that you focus on: <span className="font-semibold text-teal-dark">{profile.instructorNotes}</span>"
                        </p>
                        <span className="text-[8px] text-teal-brand font-medium block">
                          💡 Lyra automatically synthesizes these pedagogical preferences into new plans.
                        </span>
                      </div>
                    ) : (
                      <p className="text-[9px] text-secondary/70 italic font-sans leading-normal">
                        Generate a lesson to activate. Lyra will observe your input patterns and custom instructions to learn your style.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50/40 border border-amber-200/50 rounded-xl p-2.5 text-[9px] text-amber-950 leading-normal font-sans">
                    🔒 <span className="font-bold">Sign In</span> to enable Lyra's adaptive memory. Lyra will save your instructions and learn your pedagogical style across sessions!
                  </div>
                )}
              </div>
            </div>

            {/* Action CTA Trigger Button with haptic styling */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProcessLesson}
                disabled={isLoading || !customContent.trim()}
                className="w-full py-4 px-5 rounded-2xl bg-teal-dark hover:bg-slate-900 text-white text-xs font-black font-sans transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg cursor-pointer border border-teal-brand/30 micro-glow-teal group"
                id="generate-lesson-btn"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-teal-brand" />
                    <span>Orchestrating 2026 STEM Logic Pathways...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5 text-amber-300 group-hover:rotate-12 transition-transform" />
                    <span>Generate Gamified STEM Pack (2026 AI Engine)</span>
                    <ArrowRight className="w-4 h-4 text-teal-brand group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* 2026 Purposeful Micro-delay Compilation HUD Overlay */}
              {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                  <div className="w-full max-w-md bg-slate-900 border border-teal-brand/40 rounded-3xl p-6 text-white shadow-[0_0_50px_rgba(0,194,178,0.25)] space-y-6 relative overflow-hidden">
                    
                    {/* Animated Scanline bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-brand to-transparent animate-scanline" />

                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                      <div className="w-10 h-10 rounded-2xl bg-teal-brand/20 border border-teal-brand/40 flex items-center justify-center text-teal-brand shrink-0 micro-glow-teal">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-teal-brand">2026 STEM Engine Execution</span>
                        <h3 className="text-sm font-bold font-sans text-slate-100">Compiling Gamified Curriculum...</h3>
                      </div>
                    </div>

                    {/* Purposeful Micro-delay Progress Pathways */}
                    <div className="space-y-2.5 font-mono text-xs">
                      <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
                        compilationStep >= 1 ? "bg-teal-brand/10 border-teal-brand/50 text-teal-light micro-glow-teal" : "bg-slate-800/40 border-slate-700/50 text-slate-400"
                      }`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${compilationStep >= 1 ? "bg-teal-brand text-slate-950" : "bg-slate-700 text-slate-400"}`}>
                          01
                        </span>
                        <span className="flex-1 font-sans">
                          {getDynamicCompilationStepText(1, customContent, uploadedFileName, transformationGoal)}
                        </span>
                        {compilationStep >= 1 && <Check className="w-4 h-4 text-teal-brand animate-pulse" />}
                      </div>

                      <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
                        compilationStep >= 2 ? "bg-amber-500/10 border-amber-400/50 text-amber-200 micro-glow-amber" : "bg-slate-800/40 border-slate-700/50 text-slate-400"
                      }`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${compilationStep >= 2 ? "bg-amber-400 text-slate-950" : "bg-slate-700 text-slate-400"}`}>
                          02
                        </span>
                        <span className="flex-1 font-sans">
                          {getDynamicCompilationStepText(2, customContent, uploadedFileName, transformationGoal)}
                        </span>
                        {compilationStep >= 2 && <Check className="w-4 h-4 text-amber-400 animate-pulse" />}
                      </div>

                      <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
                        compilationStep >= 3 ? "bg-emerald-500/10 border-emerald-400/50 text-emerald-200 micro-glow-emerald" : "bg-slate-800/40 border-slate-700/50 text-slate-400"
                      }`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${compilationStep >= 3 ? "bg-emerald-400 text-slate-950" : "bg-slate-700 text-slate-400"}`}>
                          03
                        </span>
                        <span className="flex-1 font-sans">
                          {getDynamicCompilationStepText(3, customContent, uploadedFileName, transformationGoal)}
                        </span>
                        {compilationStep >= 3 && <Check className="w-4 h-4 text-emerald-400 animate-pulse" />}
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center font-sans italic pt-1">
                      Targeting {selectedGrade === "Custom" ? customGradeInput || "Custom Age" : selectedGrade} • {selectedTech} • {transformationGoal === "gamify" ? "Gamified Adventure" : "Presentation Deck"}...
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 rounded-xl p-3 flex gap-2 text-red-950 dark:text-red-200 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold">Gemini API Connection Note</span>
                    <p className="text-[10px] text-slate-700 dark:text-slate-300 font-sans leading-normal">{error}</p>
                  </div>
                </div>
              )}
            </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </header>

        {/* Cloud Saved Lessons and Active Workspace Column Stack */}
        <section className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1 w-full">
          
          {/* Cloud Storage Saved Lessons Vault */}
          {user && (
            <div className="bg-surface-0 dark:bg-slate-900/90 border border-black/[0.06] dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 liquid-glass-light dark:liquid-glass-dark" id="my-lessons-vault">
              <div className="flex justify-between items-center border-b border-black/[0.05] dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4.5 h-4.5 text-teal-brand" />
                  <span className="font-serif text-base sm:text-lg font-bold text-teal-dark dark:text-teal-brand">Your Firebase Cloud Storage Vault</span>
                  <span className="px-2 py-0.5 bg-teal-brand/10 text-teal-brand text-[10px] font-mono font-bold rounded-full">
                    {savedLessons.length} {savedLessons.length === 1 ? 'Lesson' : 'Lessons'}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-secondary dark:text-slate-400 uppercase tracking-wider hidden sm:inline">
                  Connected: {user.email}
                </span>
              </div>

              {savedLessons.length === 0 ? (
                <div className="p-6 text-center space-y-2 bg-white/50 dark:bg-slate-800/40 rounded-xl border border-dashed border-black/[0.08] dark:border-slate-800">
                  <Cloud className="w-8 h-8 text-teal-brand/50 mx-auto" />
                  <p className="text-xs font-bold text-primary dark:text-slate-200">No saved lesson plans in cloud storage yet</p>
                  <p className="text-[11px] text-secondary dark:text-slate-400 max-w-md mx-auto font-sans">
                    Click <strong className="text-teal-brand">"Save to Cloud"</strong> on any active lesson plan to store it securely in your Firebase account and access it anytime!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {savedLessons.map((saved) => {
                    const isCurrentlyActive = lesson.id === saved.id;
                    return (
                      <div 
                        key={saved.id}
                        className={`p-3.5 rounded-xl border transition-all flex justify-between items-center gap-3 shadow-3xs ${
                          isCurrentlyActive
                            ? "border-teal-brand bg-teal-brand/5 dark:bg-teal-brand/10 dark:border-teal-brand/60"
                            : "border-black/[0.06] dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-teal-brand/40"
                        }`}
                      >
                        <div className="overflow-hidden flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-primary dark:text-slate-100 truncate">{saved.lessonTitle}</p>
                            {isCurrentlyActive && (
                              <span className="px-1.5 py-0.2 bg-teal-brand text-slate-950 text-[8px] font-mono font-extrabold rounded uppercase shrink-0">Active</span>
                            )}
                          </div>
                          <span className="text-[10px] text-secondary dark:text-slate-400 font-sans block truncate">
                            {saved.duration} Block
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setLesson(saved);
                              setActiveTab("slides");
                            }}
                            className="px-2.5 py-1.5 bg-teal-light dark:bg-teal-brand/20 text-teal-brand hover:bg-teal-brand hover:text-white dark:hover:text-slate-950 rounded-lg text-[10px] font-bold transition-all shadow-3xs cursor-pointer micro-glow-teal min-h-[34px]"
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            disabled={deletingLessonId === saved.id}
                            onClick={async () => {
                              if (confirm(`Permanently delete "${saved.lessonTitle}" from your Firebase Cloud Storage?`)) {
                                try {
                                  setDeletingLessonId(saved.id);
                                  await deleteLessonFromCloud(saved.id);
                                  setSaveStatus("Lesson deleted from cloud");
                                  setTimeout(() => setSaveStatus(null), 3000);
                                } catch (err: any) {
                                  alert("Failed to delete lesson: " + (err?.message || "Unknown error"));
                                } finally {
                                  setDeletingLessonId(null);
                                }
                              }
                            }}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950/60 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all cursor-pointer min-h-[34px] disabled:opacity-50"
                            title="Delete lesson from cloud storage"
                          >
                            {deletingLessonId === saved.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Active Lesson Meta Display */}
          <div className="bg-white dark:bg-slate-900/90 border border-black/[0.12] dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden liquid-glass-light dark:liquid-glass-dark" id="workspace-panel">
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-teal-light/20 to-transparent rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-slate-800 pb-4 mb-4 z-10 relative">
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-teal-brand bg-teal-light dark:bg-teal-brand/20 border border-teal-brand/20 px-2.5 py-0.5 rounded-full uppercase micro-glow-teal">
                    Active Curriculum Suite
                  </span>
                  <span className="text-xs text-secondary dark:text-slate-300 font-sans flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gold-brand" />
                    {lesson.duration} Block
                  </span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-teal-dark dark:text-teal-brand">
                  {lesson.lessonTitle}
                </h2>
                <p className="text-xs sm:text-sm text-secondary dark:text-slate-300 leading-relaxed font-sans">
                  {lesson.summary}
                </p>
              </div>

              {/* Cloud Save Actions */}
              <div className="shrink-0 flex flex-col items-stretch md:items-end gap-1 w-full md:w-auto">
                {user ? (
                  <button
                    type="button"
                    onClick={handleSaveToCloud}
                    disabled={dbLoading}
                    className="px-4.5 py-2.5 bg-teal-dark dark:bg-teal-brand dark:text-slate-950 hover:bg-opacity-95 text-white rounded-xl text-xs font-extrabold shadow-3xs flex items-center justify-center gap-2 transition-all cursor-pointer micro-glow-teal min-h-[42px]"
                  >
                    <Cloud className="w-4 h-4 text-teal-brand dark:text-slate-950" />
                    {dbLoading ? 'Saving...' : 'Save to Cloud'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-surface-0 text-secondary dark:text-slate-200 border border-black/[0.08] dark:border-slate-700 rounded-xl text-xs font-bold shadow-3xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[42px]"
                  >
                    <LogIn className="w-3.5 h-3.5 text-teal-brand" />
                    <span>Sign In to Save</span>
                  </button>
                )}
                {saveStatus && (
                  <span className="text-[10px] font-bold text-teal-brand text-right font-sans flex items-center justify-end gap-1 mt-0.5">
                    <Check className="w-3.5 h-3.5" /> {saveStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Touch-Friendly Mobile Scrollable Resource Pills Tabs */}
            <div className="flex border border-black/[0.06] dark:border-slate-800 overflow-x-auto no-scrollbar scroll-smooth gap-1.5 bg-surface-0 dark:bg-slate-950/80 p-1.5 rounded-2xl mb-6 font-sans w-full">
              {[
                { id: "slides", label: "Interactive Slides", icon: Layers },
                { id: "lab", label: isCodingLesson ? "💻 Coding Blocks & Lab" : "Hands-On Lab", icon: isCodingLesson ? Terminal : Activity },
                { id: "nana-banana", label: "🎨 Visual Studio", icon: Palette },
                { id: "quiz", label: "Smartboard Quiz", icon: HelpCircle },
                { id: "media", label: "Media Fixer", icon: Link2Off }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer min-h-[42px] ${
                      isSelected
                        ? "bg-teal-dark dark:bg-teal-brand text-white dark:text-slate-950 shadow-3xs micro-glow-teal"
                        : "text-secondary dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60"
                    }`}
                    id={`tab-${tab.id}`}
                  >
                    <TabIcon className={`w-4 h-4 ${isSelected ? "text-teal-brand dark:text-slate-950" : "text-secondary dark:text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Resource Stage Canvas */}
            <div className="min-h-[420px] relative z-10">
              <AnimatePresence mode="wait">
                
                {/* TAB: Interactive Slides */}
                {activeTab === "slides" && (
                  <motion.div
                    key="tab-slides-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6 animate-fade-in"
                  >
                    <InteractiveSlideshow slides={lesson.slides} />

                    {/* Scientific learning pillars */}
                    <div className="bg-surface-0/60 border border-black/[0.06] rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2.5 border-b border-black/[0.05] pb-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-light flex items-center justify-center text-teal-brand border border-teal-brand/10">
                          <CheckCircle2 className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-teal-dark uppercase font-sans">Curriculum Core Pillars</h4>
                          <p className="text-[10px] text-secondary font-sans leading-none">Key Student Knowledge Deliverables</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {lesson.keyTakeaways.map((takeaway, idx) => (
                          <div key={idx} className="flex gap-2.5 items-start p-3 bg-white rounded-xl border border-black/[0.04]">
                            <span className="w-5 h-5 rounded-full bg-teal-light flex items-center justify-center shrink-0 text-teal-brand font-bold text-[10px] mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-secondary leading-relaxed font-sans font-medium">{takeaway}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: Hands-On Lab / Coding Blocks */}
                {activeTab === "lab" && (
                  <motion.div
                    key="tab-lab-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in"
                  >
                    {/* Left Checklist panel */}
                    <div className="md:col-span-5 bg-surface-0/40 dark:bg-slate-900/60 border border-black/[0.06] dark:border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="border-b border-black/[0.05] dark:border-slate-800 pb-3 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-secondary dark:text-teal-brand uppercase tracking-wider block">
                            {isCodingLesson ? "SOFTWARE & PREREQUISITES" : "PRE-CLASS LOGISTICS"}
                          </span>
                          <h4 className="text-sm font-bold text-teal-dark dark:text-slate-100 font-sans flex items-center gap-1.5">
                            {isCodingLesson ? <Laptop className="w-4 h-4 text-teal-brand" /> : <Activity className="w-4 h-4 text-teal-brand" />}
                            <span>{isCodingLesson ? "Coding Software & Tools" : "Lab Bin Materials"}</span>
                          </h4>
                        </div>
                        {isCodingLesson && (
                          <span className="px-2 py-0.5 bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/30 text-[9px] font-mono font-extrabold rounded-lg uppercase">
                            CODING CURRICULUM
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {lesson.handsOnActivity.materials.map((material, idx) => (
                          <button
                            key={idx}
                            onClick={() => toggleMaterial(material)}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              checkedMaterials[material]
                                ? "bg-teal-light/20 border-teal-brand/30 text-teal-dark dark:text-teal-brand font-medium"
                                : "bg-white dark:bg-slate-800/80 border-black/[0.05] dark:border-slate-700 text-secondary dark:text-slate-300 hover:bg-surface-0 dark:hover:bg-slate-800"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                              checkedMaterials[material]
                                ? "bg-teal-brand border-teal-brand text-slate-950"
                                : "border-black/[0.15] dark:border-slate-600 bg-white dark:bg-slate-900"
                            }`}>
                              {checkedMaterials[material] && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                            </div>
                            <span className="text-xs font-sans font-medium leading-tight">{material}</span>
                          </button>
                        ))}
                      </div>

                      {/* Computational Thinking Checklist for Coding Lessons */}
                      {isCodingLesson && (
                        <div className="p-3.5 bg-slate-900/90 text-slate-200 border border-teal-brand/30 rounded-xl space-y-2 text-[11px] font-sans">
                          <span className="text-[9px] font-mono font-bold text-teal-brand uppercase tracking-wider block">COMPUTATIONAL CONCEPTS TESTED</span>
                          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                            <div className="flex items-center gap-1.5 text-amber-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Event Triggers</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sky-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              <span>Loop Iterations</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>IF Logic</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-purple-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span>State Variables</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-teal-light/20 border border-teal-brand/10 rounded-xl text-[10px] text-teal-dark dark:text-slate-300 leading-relaxed font-sans flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-brand shrink-0 mt-0.5" />
                        <div>
                          <strong>{isCodingLesson ? "Setup IDE & Devices" : "Check bins off"}</strong> to streamline pre-class preparation for {selectedGrade} grade.
                        </div>
                      </div>
                    </div>

                    {/* Right experimental/coding protocol panel */}
                    <div className="md:col-span-7 space-y-4">
                      
                      {/* Interactive Code Block Workspace or Experiment Protocol */}
                      <div className={`border rounded-2xl p-5.5 space-y-5 ${
                        isDarkMode ? "bg-slate-900/90 border-slate-800 text-slate-100 liquid-glass-dark" : "bg-white border-black/[0.08] text-primary"
                      }`}>
                        <div className="flex justify-between items-start border-b border-black/[0.05] dark:border-slate-800 pb-3">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono font-bold text-secondary dark:text-teal-brand uppercase flex items-center gap-1.5">
                              {isCodingLesson ? <Code className="w-3.5 h-3.5 text-teal-brand" /> : <Activity className="w-3.5 h-3.5 text-teal-brand" />}
                              <span>{isCodingLesson ? "Interactive Block Code & Algorithm Instructions" : "Step-by-step Experiment Protocol"}</span>
                            </span>
                            <h4 className="text-base font-bold font-sans text-teal-dark dark:text-slate-100">{lesson.handsOnActivity.title}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            {isCodingLesson && (
                              <button
                                type="button"
                                onClick={handleCopyCodeBlocks}
                                className="px-2.5 py-1 bg-surface-1 dark:bg-slate-800 hover:bg-surface-2 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-black/[0.08] dark:border-slate-700 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Copy pseudocode / blocks to clipboard"
                              >
                                {codeCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-teal-brand" />}
                                <span>{codeCopied ? "Copied!" : "Copy Code"}</span>
                              </button>
                            )}

                            <span className="px-2.5 py-0.5 bg-teal-dark dark:bg-teal-brand dark:text-slate-950 text-white text-[9px] font-mono font-bold rounded-lg uppercase">
                              {isCodingLesson ? "CODING LAB" : "STUDENT LED"}
                            </span>
                          </div>
                        </div>

                        {/* Steps or Code Blocks */}
                        <div className="space-y-3">
                          {lesson.handsOnActivity.steps.map((step, idx) => {
                            const isHighlighted = simulatingBlockStep === idx;

                            if (isCodingLesson) {
                              // Render colorful Scratch/Python block shapes for coding lessons
                              const blockColors = [
                                { bg: "bg-amber-500/10 dark:bg-amber-500/20", border: "border-amber-500/50", text: "text-amber-800 dark:text-amber-300", badge: "🟨 EVENT HAT BLOCK", type: "WHEN [EVENT] RUNS" },
                                { bg: "bg-sky-500/10 dark:bg-sky-500/20", border: "border-sky-500/50", text: "text-sky-800 dark:text-sky-300", badge: "🟦 ACTION / MOTION", type: "EXECUTE COMMAND" },
                                { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", border: "border-emerald-500/50", text: "text-emerald-800 dark:text-emerald-300", badge: "🟩 CONTROL / IF-THEN", type: "LOGIC DECISION" },
                                { bg: "bg-purple-500/10 dark:bg-purple-500/20", border: "border-purple-500/50", text: "text-purple-800 dark:text-purple-300", badge: "🟪 VARIABLE / OUTPUT", type: "STATE UPDATE" },
                              ];
                              const colorStyle = blockColors[idx % blockColors.length];

                              return (
                                <div
                                  key={idx}
                                  className={`p-3.5 rounded-xl border-2 transition-all duration-300 space-y-1.5 ${
                                    isHighlighted
                                      ? "bg-teal-brand/30 border-teal-brand text-teal-brand font-bold micro-glow-teal scale-[1.01] translate-x-1"
                                      : `${colorStyle.bg} ${colorStyle.border}`
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 text-slate-800 dark:text-slate-200">
                                      {colorStyle.badge} — Step {idx + 1}
                                    </span>
                                    {isHighlighted && (
                                      <span className="text-[10px] font-mono text-teal-brand font-extrabold animate-pulse flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
                                        EXECUTING BLOCK...
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-mono text-xs font-semibold leading-snug flex items-start gap-2">
                                    <span className="text-teal-brand font-extrabold">▶</span>
                                    <p className={`${isHighlighted ? "text-slate-900 dark:text-white" : colorStyle.text}`}>
                                      {step}
                                    </p>
                                  </div>
                                </div>
                              );
                            }

                            // Standard Science Lab Step Rendering
                            return (
                              <div 
                                key={idx} 
                                className={`flex gap-3.5 items-start p-2.5 rounded-xl transition-all duration-300 ${
                                  isHighlighted 
                                    ? "bg-teal-brand/20 border border-teal-brand text-teal-brand font-bold micro-glow-teal scale-[1.01] translate-x-1" 
                                    : "bg-transparent"
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                  isHighlighted
                                    ? "bg-teal-brand text-slate-950"
                                    : isDarkMode
                                    ? "bg-slate-800 border border-slate-700 text-slate-300"
                                    : "bg-surface-1 border border-black/[0.05] text-secondary"
                                }`}>
                                  {idx + 1}
                                </span>
                                <p className={`text-xs leading-relaxed font-sans pt-0.5 font-normal ${
                                  isDarkMode ? "text-slate-300" : "text-secondary"
                                }`}>
                                  {step}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Interactive Code Simulator Bar */}
                      <div className={`p-5 rounded-2xl border transition-all ${
                        isDarkMode ? "bg-slate-900/90 border-teal-brand/30 liquid-glass-dark" : "bg-white border-teal-brand/20 liquid-glass-light"
                      }`}>
                        <div className="flex items-center justify-between border-b pb-3 mb-4 border-teal-brand/20">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-teal-brand/20 text-teal-brand border border-teal-brand/30 flex items-center justify-center micro-glow-teal">
                              <Terminal className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold font-sans uppercase text-teal-dark dark:text-teal-brand flex items-center gap-2">
                                <span>{isCodingLesson ? "Interactive Code Block Execution Engine" : "Scratch & Circuit Block Architect"}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-teal-light dark:bg-teal-brand/20 text-teal-brand rounded uppercase">2026 Interactive</span>
                              </h4>
                              <p className="text-[10px] text-secondary dark:text-slate-400 font-sans">
                                Test active logic pathways with micro-delay execution feedback
                              </p>
                            </div>
                          </div>

                          {/* Haptic Simulate Run Button */}
                          <button
                            type="button"
                            onClick={handleSimulateBlockRun}
                            disabled={isSimulatingBlock}
                            className="px-3.5 py-1.5 bg-teal-brand hover:bg-teal-mid text-slate-950 font-black text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-3xs micro-glow-teal disabled:opacity-50"
                          >
                            <Play className={`w-3.5 h-3.5 ${isSimulatingBlock ? "animate-spin" : ""}`} />
                            <span>{isSimulatingBlock ? "Running..." : "Test Block Run"}</span>
                          </button>
                        </div>

                        {/* Interactive Block Chain */}
                        <div className="space-y-2 font-mono text-xs">
                          {lesson.handsOnActivity.steps.map((stepText, idx) => {
                            const isActive = simulatingBlockStep === idx;
                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                                  isActive
                                    ? "bg-teal-brand/20 border-teal-brand text-teal-brand font-bold micro-glow-teal scale-[1.01] translate-x-1"
                                    : isDarkMode
                                    ? "bg-slate-800/60 border-slate-700/60 text-slate-200"
                                    : "bg-surface-0/80 border-black/[0.06] text-slate-700"
                                }`}
                              >
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                  isActive 
                                    ? "bg-teal-brand text-slate-950" 
                                    : "bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/30"
                                }`}>
                                  Block [{idx + 1}]
                                </span>
                                <span className="flex-1 font-sans text-xs truncate">{stepText}</span>
                                {isActive ? (
                                  <span className="text-[10px] font-mono text-teal-brand animate-pulse uppercase font-extrabold flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
                                    ▶ Signal Active
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                                    Ready
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Scientific / Computational Principle display box */}
                      <div className="bg-teal-dark dark:bg-slate-900 dark:border dark:border-teal-brand/30 text-white rounded-2xl p-5.5 space-y-2.5 relative overflow-hidden shadow-xs micro-glow-teal">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-brand/10 rounded-full blur-xl pointer-events-none" />
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-teal-brand" />
                          <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-light">
                            {isCodingLesson ? "Core Computational Logic & Algorithm Principle" : "The Scientific Catalyst Behind the Lab"}
                          </h5>
                        </div>
                        <p className="text-xs text-teal-light/95 dark:text-slate-300 leading-relaxed font-sans">
                          {lesson.handsOnActivity.scientificPrinciple}
                        </p>
                      </div>

                      {/* Nana Banana Pro Visual Trigger Banner */}
                      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-yellow-500/10 border border-amber-400/40 rounded-2xl p-4.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                            🍌
                          </div>
                          <div className="space-y-0.5">
                            <h5 className="text-xs font-bold text-slate-900 font-sans flex items-center gap-1.5">
                              <span>Nana Banana Pro Visual Illustrator</span>
                              <span className="text-[9px] bg-slate-900 text-amber-300 font-mono font-extrabold px-1.5 py-0.2 rounded">Pro Feature</span>
                            </h5>
                            <p className="text-[11px] text-slate-600 font-sans">
                              Generate a step-by-step visual diagram or {isCodingLesson ? "coding flow infographic" : "lab setup poster"} for "{lesson.handsOnActivity.title}".
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("nana-banana")}
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-3xs"
                        >
                          Generate Visual
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* TAB: Nana Banana Pro Visuals */}
                {activeTab === "nana-banana" && (
                  <motion.div
                    key="tab-nana-banana-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6 animate-fade-in"
                  >
                    <NanaBananaPro lesson={lesson} />
                  </motion.div>
                )}

                {/* TAB 4: Jeopardy Game Quiz */}
                {activeTab === "quiz" && (
                  <motion.div
                    key="tab-quiz-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 animate-fade-in"
                  >
                    <div className="bg-teal-dark text-white border border-teal-brand/10 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[420px] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-brand/5 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-brand/5 rounded-full blur-3xl pointer-events-none" />

                      {/* Header */}
                      <div className="flex justify-between items-center border-b border-white/[0.08] pb-4 mb-4 z-10">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-teal-brand uppercase tracking-widest block">CLASSROOM JEOPARDY STANDARD</span>
                          <h4 className="text-sm font-bold text-teal-light font-sans">Smart Board Group Quiz</h4>
                        </div>
                        <div className="flex items-center gap-3.5">
                          <span className="text-xs font-mono text-teal-light">Score: <strong className="text-teal-brand">{quizScore}</strong> / {lesson.quiz.length}</span>
                          <button
                            onClick={handleResetQuiz}
                            className="text-[10px] font-mono text-teal-light hover:text-white border border-white/[0.12] hover:border-white/[0.22] px-2.5 py-1 rounded-lg transition-all"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* Body Stage */}
                      <div className="flex-1 flex flex-col justify-center z-10 my-4">
                        {quizCompleted ? (
                          /* Finish Screen */
                          <div className="text-center space-y-4 max-w-sm mx-auto py-8">
                            <div className="w-16 h-16 rounded-full bg-teal-brand/10 border border-teal-brand/30 flex items-center justify-center text-teal-brand mx-auto shadow-sm">
                              <Award className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-serif font-bold text-white">Outstanding, Team!</h4>
                            <p className="text-xs text-teal-light/80 leading-relaxed font-sans">
                              Your classroom finished the interactive module. You scored <strong>{quizScore} out of {lesson.quiz.length}</strong> correct answers!
                            </p>
                            <div className="pt-2">
                              <button
                                onClick={handleResetQuiz}
                                className="px-5 py-2.5 bg-teal-brand hover:bg-teal-mid text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                              >
                                Play Again
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Question Block */
                          <div className="space-y-6">
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-mono font-bold text-teal-brand uppercase">Question {currentQuizIndex + 1} of {lesson.quiz.length}</span>
                              <h4 className="text-base sm:text-lg font-bold tracking-tight text-white leading-relaxed font-sans">
                                {lesson.quiz[currentQuizIndex].question}
                              </h4>
                            </div>

                            {/* Option list */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              {lesson.quiz[currentQuizIndex].options.map((option, idx) => {
                                const isSelected = selectedQuizOption === idx;
                                const isCorrectAnswer = idx === lesson.quiz[currentQuizIndex].correctAnswerIndex;
                                
                                let borderClass = "border-white/[0.08] hover:border-white/[0.18] bg-black/[0.15]";
                                let textClass = "text-teal-light";
                                let statusIcon = null;

                                if (selectedQuizOption !== null) {
                                  if (isCorrectAnswer) {
                                    borderClass = "border-teal-brand bg-teal-brand/20";
                                    textClass = "text-white font-bold";
                                    statusIcon = <Check className="w-4 h-4 text-teal-brand" />;
                                  } else if (isSelected) {
                                    borderClass = "border-red-500 bg-red-950/20";
                                    textClass = "text-red-200";
                                    statusIcon = <X className="w-4 h-4 text-red-500" />;
                                  } else {
                                    borderClass = "border-white/[0.04] bg-transparent opacity-35";
                                  }
                                }

                                return (
                                  <button
                                    key={idx}
                                    onClick={() => handleQuizOptionClick(idx)}
                                    disabled={selectedQuizOption !== null}
                                    className={`p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${borderClass}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-6 h-6 rounded-lg bg-black/[0.25] border border-white/[0.08] text-teal-light flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                                        {String.fromCharCode(65 + idx)}
                                      </div>
                                      <span className={`${textClass} font-sans`}>{option}</span>
                                    </div>
                                    {statusIcon}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Detailed explanation overlay */}
                            {showExplanation && (
                              <div className="bg-black/[0.2] border border-white/[0.06] rounded-xl p-4 text-xs text-teal-light/90 leading-relaxed font-sans">
                                <span className="font-bold text-teal-brand block mb-1">🎯 Instructor Insight:</span>
                                {lesson.quiz[currentQuizIndex].explanation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Controls Footer */}
                      {!quizCompleted && (
                        <div className="border-t border-white/[0.08] pt-4 flex justify-between items-center z-10">
                          <span className="text-[9px] text-teal-brand uppercase tracking-wider font-mono">Team Interactive Mode</span>
                          
                          <button
                            onClick={handleNextQuiz}
                            disabled={selectedQuizOption === null}
                            className="px-4.5 py-2.5 bg-white text-teal-dark text-xs font-bold rounded-xl hover:bg-teal-light transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <span>{currentQuizIndex === lesson.quiz.length - 1 ? "End Module" : "Next Question"}</span>
                            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      )}

                    </div>
                  </motion.div>
                )}

                {/* TAB 5: Broken Media Link Fixer */}
                {activeTab === "media" && (
                  <motion.div
                    key="tab-media-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5 animate-fade-in"
                  >
                    <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                          <Link2Off className="w-5.5 h-5.5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-teal-dark uppercase font-sans">Prevent "404 Broken Link" Disruption</h4>
                          <p className="text-xs text-secondary leading-relaxed font-sans font-normal">
                            Detects dead ends in lesson plans and provides grounded, filtered (no explicit content) Google SafeSearch alternatives.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold rounded-full shrink-0">
                        <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Google SafeSearch Active</span>
                      </div>
                    </div>

                    {/* Google SafeSearch Bar */}
                    <div className="bg-gradient-to-r from-teal-50/80 via-white to-amber-50/60 border border-teal-brand/20 rounded-2xl p-4 sm:p-5 space-y-3 shadow-3xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-teal-dark uppercase tracking-wide flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-teal-brand" />
                          <span>Google Search Assistant (Safe Content Filtered)</span>
                        </span>
                        <span className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-100/70 border border-emerald-300/60 px-2 py-0.5 rounded-full">
                          Explicit Content Blocked
                        </span>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const query = mediaSearchQuery.trim() || lesson.lessonTitle;
                          window.open(`https://www.google.com/search?q=${encodeURIComponent(query + " K-12 STEM classroom demonstration")}&safe=active`, "_blank");
                        }}
                        className="flex flex-col sm:flex-row gap-2"
                      >
                        <input
                          type="text"
                          value={mediaSearchQuery}
                          onChange={(e) => setMediaSearchQuery(e.target.value)}
                          placeholder={`Search safe Google resources for "${lesson.lessonTitle}"...`}
                          className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-brand/30 font-sans"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-teal-dark hover:bg-slate-900 text-amber-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>Google SafeSearch</span>
                        </button>
                      </form>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {lesson.mediaRecommendations.map((rec, idx) => (
                        <div key={idx} className="bg-surface-0/50 border border-black/[0.06] rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-teal-brand/30 transition-all">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center gap-2">
                              <span className="px-2.5 py-0.5 bg-red-50 border border-red-100 text-[9px] font-bold text-red-800 rounded-full inline-block font-sans uppercase">
                                Replaces Dead {rec.resourceType}
                              </span>
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Kid-Safe Filtered
                              </span>
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[10px] text-secondary font-sans font-bold uppercase block">Verified YouTube Search Query:</span>
                              <div className="bg-white border border-black/[0.06] p-3 rounded-xl flex items-center justify-between gap-3 text-teal-dark">
                                <span className="text-xs font-mono font-bold truncate">{rec.suggestedSearchQuery}</span>
                                <button
                                  onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(rec.suggestedSearchQuery)}`, "_blank")}
                                  className="p-1.5 hover:bg-teal-light rounded-lg text-teal-brand transition-all shrink-0"
                                  title="YouTube search"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="pt-1">
                              <span className="text-[10px] text-secondary font-sans font-bold uppercase block mb-0.5">Pedagogical Value:</span>
                              <p className="text-xs text-secondary leading-relaxed font-sans font-normal">
                                {rec.whyItHelps}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-black/[0.04] flex justify-between items-center text-[10px] text-secondary font-sans">
                            <span className="font-medium">Ready-to-use Backup</span>
                            <button
                              onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(rec.suggestedSearchQuery)}&safe=active`, "_blank")}
                              className="text-teal-brand hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              <Search className="w-3 h-3" />
                              <span>Google SafeSearch</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

          {/* Pro Educator Subscription Access Status Card */}
          <div className="border-t border-black/[0.08] pt-8 mt-6">
            {profile?.isSubscribed ? (
              <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-white">Educator Pro Subscription Active</h4>
                    <p className="text-xs text-emerald-100/80 font-sans">You have full unlocked access to AI lesson transformations, Cloud Firestore storage, Nana Banana Pro visual generator, and export channels.</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="px-3.5 py-1.5 bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-full inline-block uppercase tracking-wider font-mono">
                    PRO UNLOCKED
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-teal-dark via-teal-900 to-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border border-teal-brand/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-300/30">
                    <Crown className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-white">Unlock Full Educator Pro Access ($19.99/mo)</h4>
                    <p className="text-xs text-teal-100/80 font-sans">Register and subscribe to access unlimited AI transformations, persistent Cloud Firestore lesson saving, and full curriculum suite tools.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      signInWithGoogle();
                    } else {
                      setShowSubscriptionModal(true);
                    }
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer shrink-0 flex items-center gap-2"
                >
                  <span>{user ? 'Activate Pro Access ($19.99/mo)' : 'Sign In & Subscribe'}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            )}
          </div>

        </section>
          </div>
        )}

        {/* Minimal professional footer */}
        <footer className="px-6 sm:px-8 pt-8 mt-auto border-t border-black/[0.05] text-center text-[10px] text-secondary font-sans leading-normal space-y-1">
          <p>© 2026 Lyra STEM - Immersive Lesson Plan Transformation Suite. All rights reserved.</p>
          <p className="text-[9px] text-secondary/75">Designed in partnership with XPRIZE Education Initiative for high-yield classroom activities.</p>
        </footer>

        {showSubscriptionModal && !profile?.isSubscribed && (
          <SubscriptionModal
            user={user}
            signInWithGoogle={signInWithGoogle}
            onSubscribe={async (plan) => {
              await subscribeUser(plan);
              setShowSubscriptionModal(false);
            }}
            onClose={() => setShowSubscriptionModal(false)}
            authLoading={authLoading}
          />
        )}

        {/* Floating Sparkle Icon for Lyra AI Co-Teacher Popup */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {copilotOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-[92vw] sm:w-[520px] max-h-[85vh] bg-white rounded-3xl border border-teal-brand/30 shadow-2xl overflow-hidden flex flex-col mb-2"
            >
              {/* Modal Header */}
              <div className="bg-teal-dark px-5 py-4 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-brand/20 border border-teal-brand/40 flex items-center justify-center text-teal-brand">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-sans uppercase tracking-wide">Lyra AI Co-Teacher</h3>
                    <p className="text-[10px] text-teal-light/80 font-sans">Active Lesson Partner & Adaptations Assistant</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCopilotOpen(false)}
                  className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center text-teal-light hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 overflow-y-auto flex-1 bg-surface-0/30">
                <AICopilot 
                  lesson={lesson} 
                  onTriggerPaidFlow={() => {
                    console.log("Triggering Paid Model flow via AI Studio build...");
                    alert("Paid API Key selection dialog opened in your AI Studio build console. Please verify the active model settings.");
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Floating Action Button */}
          <button
            type="button"
            onClick={() => setCopilotOpen(!copilotOpen)}
            className={`group relative px-4 py-3.5 rounded-full font-bold text-xs shadow-xl transition-all duration-300 flex items-center gap-2.5 cursor-pointer border ${
              copilotOpen
                ? "bg-slate-900 text-white border-slate-700 hover:bg-slate-800"
                : "bg-teal-dark text-white border-teal-brand/40 hover:bg-teal-brand hover:scale-105"
            }`}
            id="lyra-copilot-sparkle-trigger"
          >
            <Sparkles className={`w-5 h-5 text-amber-300 ${copilotOpen ? "" : "animate-spin-slow"}`} />
            <span className="font-sans font-bold text-xs pr-0.5">
              {copilotOpen ? "Close Lyra AI" : "Ask Lyra AI"}
            </span>
            {!copilotOpen && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
