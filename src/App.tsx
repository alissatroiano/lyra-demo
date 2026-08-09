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
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Maximize2,
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
  AlertTriangle,
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
  Copy,
  Gamepad2
} from "lucide-react";
import { PRELOADED_LESSONS } from "./data/preloadedLessons";
import { INITIAL_PROCESSED_LESSON } from "./data/initialProcessedLesson";
import { CATEGORY_SUPPLIES } from "./data/categorySupplies";
import { ProcessedLesson, PreloadedLesson } from "./types";
import { useFirebase } from "./context/FirebaseContext";
import SubscriptionModal from "./components/SubscriptionModal";
import InteractiveSlideshow from "./components/InteractiveSlideshow";
import AICopilot from "./components/AICopilot";
import NanaBananaPro from "./components/NanaBananaPro";
import { LandingPage } from "./components/LandingPage";
import { LyraMark } from "./components/LyraMark";

// The bunny mascot is retired — LyraMark (the constellation) is the brand
// figure now. It also removes a /src/assets/... image path that only
// resolved through the Vite dev server and would have 404'd in production.

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
      let errMsg = err?.message || "Unknown error";
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed?.error) errMsg = parsed.error;
      } catch {}
      alert("Failed to save lesson: " + errMsg);
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
  const [showPlanConfirmationModal, setShowPlanConfirmationModal] = useState<boolean>(false);
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
    goal: string,
    tech?: string
  ): string => {
    // Primary content text scan (prioritize actual user content/filename over fallback supplies)
    const primaryText = ((content || "") + " " + (fileName || "")).toLowerCase();
    const fullText = (primaryText + " " + (tech || "")).toLowerCase();

    // Explicit Software Platform Checks (Scratch/ScratchJR primary over Minecraft)
    const isScratchJr = primaryText.includes("scratchjr") || primaryText.includes("scratch jr") || primaryText.includes("junior scratch") || (fullText.includes("scratchjr") && !primaryText.includes("minecraft"));
    const isScratch = (primaryText.includes("scratch") || primaryText.includes("sprite") || primaryText.includes("costume") || primaryText.includes("green flag") || primaryText.includes("backdrop")) && !isScratchJr;
    const isMinecraft = (primaryText.includes("minecraft") || primaryText.includes("command block") || primaryText.includes("redstone") || primaryText.includes("makecode agent")) && !isScratch && !isScratchJr;
    const isRoblox = primaryText.includes("roblox") || primaryText.includes("lua");
    const isEduBlocks = primaryText.includes("edublocks") || primaryText.includes("edu blocks");
    const isThunkable = primaryText.includes("thunkable") || primaryText.includes("app inventor");
    const isCodeOrg = primaryText.includes("code.org") || primaryText.includes("game lab") || primaryText.includes("sprite lab");
    const isMicroBit = primaryText.includes("micro:bit") || primaryText.includes("microbit");
    const isPython = primaryText.includes("python") && !isEduBlocks;
    const isRobotics = fullText.includes("lego") || fullText.includes("spike") || fullText.includes("ev3") || fullText.includes("robot") || fullText.includes("sensor");
    const isEngineering = fullText.includes("catapult") || fullText.includes("bridge") || fullText.includes("tower") || fullText.includes("physics") || fullText.includes("gravity") || fullText.includes("truss");
    const isScience = fullText.includes("chem") || fullText.includes("bio") || fullText.includes("cell") || fullText.includes("plant") || fullText.includes("eco");
    const isMath = fullText.includes("math") || fullText.includes("fraction") || fullText.includes("geometry") || fullText.includes("equation");
    const isGaming = fullText.includes("gaming") || fullText.includes("game design") || isScratch || isScratchJr || isMinecraft || isRoblox || isCodeOrg;

    if (step === 1) {
      if (isScratchJr) return "Parsing ScratchJR yellow trigger blocks, motion grids & story loops";
      if (isScratch) return "Parsing Scratch 3.0 sprite blocks, costumes, broadcasts & stage events";
      if (isMinecraft) return "Parsing Minecraft Education 3D world coordinates & MakeCode agent blocks";
      if (isRoblox) return "Parsing Roblox Studio Lua scripts, workspace parts & 3D physics";
      if (isEduBlocks) return "Parsing EduBlocks Python drag-and-drop workspace & block logic";
      if (isThunkable) return "Parsing Thunkable mobile app screens, buttons & event handlers";
      if (isCodeOrg) return "Parsing Code.org Game Lab sprites, draw loops & key controls";
      if (isMicroBit) return "Parsing Micro:bit LED matrix display, buttons & sensor blocks";
      if (isPython) return "Parsing Python code syntax, variable logic & function loops";
      if (isRobotics) return "Parsing Robotics sensor loops, motor actuators & hardware logic";
      if (isEngineering) return "Parsing physical engineering mechanics, forces & structural stress";
      if (isScience) return "Parsing biological structures, chemical reactions & lab safety";
      if (isMath) return "Parsing mathematical concepts, spatial geometry & equation logic";
      if (isGaming) return "Parsing game design mechanics, player controls & reward loops";
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
      if (isScratchJr) return "Linking ScratchJR tap/bump triggers, character motion & sound blocks";
      if (isScratch) return "Linking Scratch 2D motion loops, green flag triggers & variable backpacks";
      if (isMinecraft) return "Linking Minecraft redstone circuits, /tp command blocks & spatial routing";
      if (isRoblox) return "Linking Roblox player collision triggers, leaderstats & GUI events";
      if (isEduBlocks) return "Linking EduBlocks Python terminal outputs, loop blocks & functions";
      if (isThunkable) return "Linking Thunkable event handlers, sound triggers & cloud variables";
      if (isCodeOrg) return "Linking Code.org collision detection, variable scores & sound effects";
      if (isMicroBit) return "Linking Micro:bit radio signals, pin inputs & sensor loops";
      if (isPython) return "Linking Python conditional logic, list iterations & console scripts";
      if (isRobotics) return "Linking LEGO robotics motor speeds, ultrasonic sensors & gears";
      if (isEngineering) return "Linking catapult trajectory angles, tension physics & prototype build steps";
      if (isScience) return "Formulating hands-on lab experiments, molecular models & observation steps";
      if (isMath) return "Structuring interactive math manipulatives, visual proofs & puzzle steps";
      if (isGaming) return "Linking game sprite events, win/loss conditions & score tracking";
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
      if (isScratchJr) return "Synthesizing ScratchJR visual story cards, slide deck & smart quiz";
      if (isScratch) return "Synthesizing Scratch block-stack guide, slide deck & smart quiz";
      if (isMinecraft) return "Synthesizing Minecraft quest guide, slide deck & smart quiz";
      if (isRoblox) return "Synthesizing Roblox 3D game quest guide, slide deck & smart quiz";
      if (isEduBlocks) return "Synthesizing EduBlocks block-to-Python lab guide & smart quiz";
      if (isThunkable) return "Synthesizing Thunkable app development guide & smart quiz";
      if (isCodeOrg) return "Synthesizing Code.org interactive game lab guide & smart quiz";
      if (isMicroBit) return "Synthesizing Micro:bit hardware coding guide & smart quiz";
      if (isPython) return "Synthesizing Python coding challenge, slide deck & smart quiz";
      if (isRobotics) return "Synthesizing Robotics lab challenge, slide deck & smart quiz";
      if (isEngineering) return "Synthesizing hands-on engineering lab, slide deck & smart quiz";
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

  // Verify Stripe Checkout Session returning from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const sessionId = urlParams.get("session_id");

    if (paymentStatus === "success" && sessionId) {
      console.log("Verifying returning Stripe Checkout session:", sessionId);
      fetch(`/api/verify-checkout-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then(async (data) => {
          if (data.verified) {
            console.log("Stripe payment successfully verified!", data);
            await subscribeUser(data.plan || "Demo Incentive ($9.99 One-Time Fee)");
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch((err) => {
          console.error("Error verifying Stripe payment session:", err);
        });
    } else if (paymentStatus === "cancel") {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Worksheet simulated answers
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [showSampleAnswers, setShowSampleAnswers] = useState<boolean>(false);

  // Expandable Panel states
  const [isUploadExpanded, setIsUploadExpanded] = useState<boolean>(true);
  const [isVaultExpanded, setIsVaultExpanded] = useState<boolean>(false);
  const [isCurriculumSuiteExpanded, setIsCurriculumSuiteExpanded] = useState<boolean>(true);

  // Deleting lesson ID state
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  // Helper to format saved lesson dates
  const formatSavedDate = (createdAt: any) => {
    if (!createdAt) return "Recent";
    if (createdAt.seconds) {
      const d = new Date(createdAt.seconds * 1000);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
    }
    if (typeof createdAt === "string" || typeof createdAt === "number") {
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
    }
    return "Saved";
  };

  // Sorted saved lessons memo (sorted by date descending)
  const sortedSavedLessons = React.useMemo(() => {
    return [...savedLessons].sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return timeB - timeA;
    });
  }, [savedLessons]);

  // Interactive Chip parameters state (for easy configuration)
  const [selectedCategory, setSelectedCategory] = useState<string>("Science");
  const [selectedGrade, setSelectedGrade] = useState<string>("K-2nd");
  const [customGradeInput, setCustomGradeInput] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("15-20 kids");
  const [selectedDuration, setSelectedDuration] = useState<string>("60 mins");
  const [selectedSupplies, setSelectedSupplies] = useState<string[]>(["Smart Board"]);
  const [customSuppliesInput, setCustomSuppliesInput] = useState<string>("");

  // Helper to toggle supply selection
  const toggleSupply = (val: string) => {
    setSelectedSupplies(prev => {
      if (prev.includes(val)) {
        const next = prev.filter(item => item !== val);
        return next;
      } else {
        return [...prev, val];
      }
    });
  };

  // Curriculum Text Material fold state (Folded by default)
  const [isTextMaterialOpen, setIsTextMaterialOpen] = useState<boolean>(false);
  const textMaterialTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Briefly opens the text material dropdown upon upload/preset load to confirm success, then auto-closes
  const triggerTempTextMaterialOpen = React.useCallback(() => {
    setIsTextMaterialOpen(true);
    if (textMaterialTimerRef.current) clearTimeout(textMaterialTimerRef.current);
    textMaterialTimerRef.current = setTimeout(() => {
      setIsTextMaterialOpen(false);
    }, 2200);
  }, []);

  // Technology sub-category focus selection ("Hardware", "Software", "Circuitry")
  const [selectedTechSubTypes, setSelectedTechSubTypes] = useState<string[]>(["Hardware"]);

  const toggleTechSubType = (val: string) => {
    setSelectedTechSubTypes(prev => {
      if (prev.includes(val)) {
        const next = prev.filter(item => item !== val);
        return next.length > 0 ? next : [val];
      } else {
        return [...prev, val];
      }
    });
  };

  // Active supply category key based on selected category and sub-focus
  const activeSupplyCategoryKey = React.useMemo(() => {
    if (selectedCategory === "Gaming") return "Gaming";
    if (selectedCategory === "Circuitry") return "Circuitry";
    if (selectedCategory === "Software" || selectedCategory === "Coding") return "Software";
    if (selectedCategory === "Technology") {
      if (selectedTechSubTypes.includes("Circuitry")) return "Circuitry";
      if (selectedTechSubTypes.includes("Software")) return "Software";
      if (selectedTechSubTypes.includes("Hardware")) return "Hardware";
      return "Software";
    }
    if (selectedCategory === "Engineering") return "Engineering";
    if (selectedCategory === "Art") return "Art";
    if (selectedCategory === "Math") return "Math";
    return "Science";
  }, [selectedCategory, selectedTechSubTypes]);

  // Available options for current category domain
  const currentSupplyOptions = React.useMemo(() => {
    return CATEGORY_SUPPLIES[activeSupplyCategoryKey] || CATEGORY_SUPPLIES["Science"];
  }, [activeSupplyCategoryKey]);

  // When active category key changes, supply initial default choices if switching domains
  const prevCategoryKeyRef = React.useRef(activeSupplyCategoryKey);
  React.useEffect(() => {
    if (prevCategoryKeyRef.current !== activeSupplyCategoryKey) {
      prevCategoryKeyRef.current = activeSupplyCategoryKey;
      const available = CATEGORY_SUPPLIES[activeSupplyCategoryKey] || CATEGORY_SUPPLIES["Science"];
      const defaultInit = available.slice(0, 3).map(s => s.id);
      setSelectedSupplies(defaultInit);
    }
  }, [activeSupplyCategoryKey]);

  // Prototype Carousel & Zoom Modal States for Google Search Grounded build examples
  const [prototypeCarouselIndex, setPrototypeCarouselIndex] = useState<number>(0);
  const [labVisualMode, setLabVisualMode] = useState<"web" | "diagram">("web");
  const [zoomedPrototypeImage, setZoomedPrototypeImage] = useState<{ url: string; title: string; caption: string; searchUrl: string } | null>(null);

  // Helper to format supply selections into a clean comma-separated string
  const getFormattedSupplies = React.useCallback(() => {
    const list = selectedSupplies
      .map(s => s === "Other" ? (customSuppliesInput.trim() || "Custom Tools / Software") : s)
      .filter(Boolean);
    const domainLabel = ` [Category Domain: ${activeSupplyCategoryKey}]`;
    return (list.length > 0 ? list.join(", ") : "Standard Classroom Supplies") + domainLabel;
  }, [selectedSupplies, customSuppliesInput, activeSupplyCategoryKey]);

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
      "computer science", "app design", "minecraft", "roblox"
    ];

    return codingKeywords.some(kw => textToScan.includes(kw));
  }, [lesson]);

  // Detect if current lesson is a Gaming / Game Design curriculum
  const isGamingLesson = React.useMemo(() => {
    if (selectedCategory === "Gaming") return true;
    if (!lesson) return false;
    const textToScan = [
      lesson.lessonTitle,
      lesson.summary,
      ...(lesson.keyTakeaways || []),
      ...(lesson.handsOnActivity?.materials || []),
      ...(lesson.handsOnActivity?.steps || []),
      lesson.handsOnActivity?.title || '',
      lesson.handsOnActivity?.scientificPrinciple || '',
      (lesson.handsOnActivity as any)?.softwarePlatform || '',
      (lesson.feasibilityAudit as any)?.identifiedSoftwarePlatform || ''
    ].join(" ").toLowerCase();

    const gamingKeywords = [
      "scratch", "minecraft", "roblox", "game", "gaming", "sprite", "costume",
      "stage", "green flag", "agent", "redstone", "edublocks", "thunkable",
      "makecode", "arcade", "unity", "unreal", "godot", "tynker", "code.org"
    ];

    return gamingKeywords.some(kw => textToScan.includes(kw));
  }, [lesson, selectedCategory]);

  // Identify specific Software / Coding platform if lesson falls into software
  const identifiedSoftware = React.useMemo(() => {
    if (!lesson) return null;

    // Check explicit AI output fields FIRST
    const explicitField = (lesson.handsOnActivity as any)?.softwarePlatform || (lesson.feasibilityAudit as any)?.identifiedSoftwarePlatform;
    if (explicitField) {
      const lowerExplicit = String(explicitField).toLowerCase();
      if (lowerExplicit.includes("scratch jr") || lowerExplicit.includes("scratchjr") || lowerExplicit.includes("junior scratch")) return "Scratch JR";
      if (lowerExplicit.includes("scratch")) return "Scratch 3.0";
      if (lowerExplicit.includes("minecraft")) return "Minecraft Education";
      if (lowerExplicit.includes("roblox")) return "Roblox Studio";
      if (lowerExplicit.includes("edublocks")) return "EduBlocks";
      if (lowerExplicit.includes("thunkable")) return "Thunkable";
      if (lowerExplicit.includes("code.org") || lowerExplicit.includes("tynker")) return "Code.org / Tynker";
      if (lowerExplicit.includes("micro:bit") || lowerExplicit.includes("microbit")) return "Micro:bit / MakeCode";
      if (lowerExplicit.includes("python")) return "Python";
      if (lowerExplicit.includes("lego")) return "LEGO Spike / WeDo";
    }

    const textToScan = [
      lesson.lessonTitle || '',
      lesson.summary || '',
      ...(lesson.keyTakeaways || []),
      ...(lesson.handsOnActivity?.materials || []),
      ...(lesson.handsOnActivity?.steps || []),
      lesson.handsOnActivity?.title || '',
      lesson.handsOnActivity?.scientificPrinciple || '',
      customContent || '',
      uploadedFileName || ''
    ].join(" ").toLowerCase();

    // Check Scratch / Scratch JR FIRST before Minecraft to eliminate misidentification
    if (textToScan.includes("scratch jr") || textToScan.includes("scratchjr") || textToScan.includes("junior scratch")) {
      return "Scratch JR";
    }
    if (textToScan.includes("scratch") || textToScan.includes("sprite") || textToScan.includes("costume") || textToScan.includes("green flag") || textToScan.includes("backdrop")) {
      return "Scratch 3.0";
    }
    if (textToScan.includes("minecraft") || textToScan.includes("creeper") || textToScan.includes("redstone") || textToScan.includes("makecode agent")) {
      return "Minecraft Education";
    }
    if (textToScan.includes("roblox") || textToScan.includes("lua")) {
      return "Roblox Studio";
    }
    if (textToScan.includes("edublocks") || textToScan.includes("edu blocks")) {
      return "EduBlocks";
    }
    if (textToScan.includes("thunkable") || textToScan.includes("app inventor")) {
      return "Thunkable";
    }
    if (textToScan.includes("code.org") || textToScan.includes("code org") || textToScan.includes("tynker") || textToScan.includes("app lab") || textToScan.includes("sprite lab") || textToScan.includes("game lab")) {
      return "Code.org / Tynker";
    }
    if (textToScan.includes("micro:bit") || textToScan.includes("microbit") || textToScan.includes("makecode")) {
      return "Micro:bit / MakeCode";
    }
    if (textToScan.includes("python") || textToScan.includes("jupyter")) {
      return "Python";
    }
    if (textToScan.includes("lego") || textToScan.includes("spike prime") || textToScan.includes("wedo") || textToScan.includes("mindstorms")) {
      return "LEGO Spike / WeDo";
    }
    if (selectedCategory === "Gaming") {
      return "Scratch 3.0 Game Engine";
    }
    if (selectedCategory === "Technology" || selectedCategory === "Software" || selectedCategory === "Coding" || isCodingLesson) {
      return "Visual Block-Based Coding";
    }
    return null;
  }, [lesson, selectedCategory, isCodingLesson, customContent, uploadedFileName]);

  // Retrieve 4 Google Search Grounded build prototype examples for the active hands-on activity / software
  const groundedPrototypeImages = React.useMemo(() => {
    if (!lesson) return [];
    const title = lesson.handsOnActivity?.title || lesson.lessonTitle || "STEM Prototype Build";
    const lower = title.toLowerCase();

    let categoryTheme = "engineering";
    if (identifiedSoftware) {
      categoryTheme = identifiedSoftware;
    } else if (lower.includes("catapult") || lower.includes("launch") || lower.includes("projectile") || lower.includes("siege")) {
      categoryTheme = "catapult";
    } else if (lower.includes("magnet") || lower.includes("electric") || lower.includes("circuit") || lower.includes("wire") || lower.includes("voltage")) {
      categoryTheme = "circuitry";
    } else if (lower.includes("bridge") || lower.includes("truss") || lower.includes("structure") || lower.includes("arch")) {
      categoryTheme = "bridge";
    } else if (lower.includes("rocket") || lower.includes("space") || lower.includes("thrust") || lower.includes("balloon")) {
      categoryTheme = "rocket";
    } else if (lower.includes("scratch") || lower.includes("code") || lower.includes("python") || lower.includes("robot") || lower.includes("algorithm")) {
      categoryTheme = "robotics";
    }

    const baseSearchQuery = `${identifiedSoftware ? identifiedSoftware + " " : ""}${title} STEM student build prototype classroom example`;

    const imageSets: Record<string, Array<{ url: string; title: string; caption: string; tag: string }>> = {
      "Scratch JR": [
        {
          url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
          title: "ScratchJR Green Flag & Event Trigger Stack",
          caption: "Horizontal icon blocks snapping Green Flag, Start-on-Tap, and Message triggers for early learners (ages 5-7).",
          tag: "ScratchJR Triggers"
        },
        {
          url: "https://images.unsplash.com/photo-1580894732413-a704936a0422?auto=format&fit=crop&w=800&q=80",
          title: "ScratchJR Motion Grid & Hop Parameters",
          caption: "Horizontal motion arrows specifying grid steps (Move Right 4, Hop 2, Go Home) for sprite navigation.",
          tag: "ScratchJR Motion"
        },
        {
          url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
          title: "ScratchJR Character Paint & Voice Recorder",
          caption: "Customizing sprite characters in the paint editor, adding speech bubbles, and recording voice audio.",
          tag: "Paint & Voice"
        },
        {
          url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
          title: "ScratchJR Multi-Page Scene & Repeat Forever",
          caption: "Transitioning between story pages and repeating animation loops for interactive storybook projects.",
          tag: "Page Transitions"
        }
      ],
      "Minecraft Education": [
        {
          url: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=800&q=80",
          title: "Minecraft Code Builder Agent Wall Construction",
          caption: "Programming the Minecraft Agent using block code to place blocks, turn, and build 3D structures.",
          tag: "Agent Builder"
        },
        {
          url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
          title: "Minecraft Redstone Logic & Circuit Automation",
          caption: "Building AND/OR logic gates and automated repeaters using Redstone dust and torches.",
          tag: "Redstone Circuits"
        },
        {
          url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
          title: "Minecraft World Coordinates & Fill Commands",
          caption: "Utilizing relative world coordinates (~ ~ ~) and repeat loops to terraform environments instantly.",
          tag: "World Coordinates"
        },
        {
          url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
          title: "Minecraft Chemistry Lab & Element Constructor",
          caption: "Combining protons, neutrons, and electrons in Minecraft Education Chemistry to synthesize compounds.",
          tag: "Chemistry Lab"
        }
      ],
      "Scratch 3.0": [
        {
          url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
          title: "Scratch 3.0 Sprite Coordinate & Motion Logic",
          caption: "Vertical block scripts setting X/Y positions, point-in-direction angles, and smooth glides.",
          tag: "Sprite Motion"
        },
        {
          url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
          title: "Scratch Event Handlers & Variable Backpack",
          caption: "Managing broadcast messages, 'When Green Flag Clicked', and updating global variable counters.",
          tag: "Variables & Events"
        },
        {
          url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
          title: "Scratch Sensing & Collision Detection Loop",
          caption: "Forever loops checking 'if touching color or mouse pointer' to trigger game over or victory states.",
          tag: "Sensing Loops"
        },
        {
          url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
          title: "Scratch Stage Backdrop & Costume Animation",
          caption: "Switching backdrop scenes and looping through sprite costumes for smooth frame-by-frame animation.",
          tag: "Stage Animation"
        }
      ],
      "EduBlocks": [
        {
          url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
          title: "EduBlocks Python Drag-and-Drop Workspace",
          caption: "Bridging block coding to Python syntax with side-by-side block vs text code view.",
          tag: "Block-to-Text"
        },
        {
          url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
          title: "EduBlocks Terminal Console Output & Logic Stacks",
          caption: "Executing print statements, user inputs, and conditional branches in a simulated Python shell.",
          tag: "Python Console"
        },
        {
          url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
          title: "EduBlocks Micro:bit Pin & Hardware Control",
          caption: "Controlling digital read/write pins, servo motors, and sensor loops via EduBlocks Python blocks.",
          tag: "Hardware Pins"
        },
        {
          url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
          title: "EduBlocks Module Import & Function Definition",
          caption: "Importing Python libraries like random, math, and time inside drag-and-drop block definitions.",
          tag: "Python Modules"
        }
      ],
      "Thunkable": [
        {
          url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
          title: "Thunkable Mobile Canvas & UI Component Layout",
          caption: "Designing responsive phone app screens with buttons, labels, image pickers, and navigation bars.",
          tag: "Mobile UI"
        },
        {
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
          title: "Thunkable Event Logic & Sound Player Blocks",
          caption: "Connecting 'When Button Clicked' event block to 'Call Sound Play' action block.",
          tag: "Event Handlers"
        },
        {
          url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
          title: "Thunkable Cloud DB & Variable Storage",
          caption: "Saving student app data to cloud tables and reading stored app variables dynamically.",
          tag: "Cloud Storage"
        },
        {
          url: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?auto=format&fit=crop&w=800&q=80",
          title: "Thunkable Live Companion Tablet Testing",
          caption: "Testing mobile app prototypes live on tablets via QR code pairing for real-time iteration.",
          tag: "Live Testing"
        }
      ],
      "Code.org / Tynker": [
        {
          url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
          title: "Code.org Maze Navigation & Repeat Loops",
          caption: "Sequencing 'move forward' and 'turn' blocks with repeat loops to solve puzzle mazes.",
          tag: "Puzzle Loops"
        },
        {
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
          title: "Code.org App Lab Event Listeners & Screen Controls",
          caption: "Using onEvent('button1', 'click') blocks to change screen backgrounds and play audio clips.",
          tag: "App Lab UI"
        },
        {
          url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
          title: "Code.org Sprite Lab Interactive Behaviors",
          caption: "Assigning behaviors like 'spinning', 'wandering', and collision event handlers to custom sprites.",
          tag: "Sprite Lab"
        },
        {
          url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
          title: "Code.org Dance Party Audio Sync & Loops",
          caption: "Syncing character dance moves to musical measure triggers and beat event blocks.",
          tag: "Audio & Dance"
        }
      ],
      "Micro:bit / MakeCode": [
        {
          url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
          title: "Micro:bit 5x5 LED Grid Display & Icons",
          caption: "Plotting X/Y coordinates and displaying custom LED pattern animations in MakeCode.",
          tag: "LED Grid"
        },
        {
          url: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80",
          title: "Micro:bit Accelerometer & Gesture Inputs",
          caption: "Programming 'on shake' and 'on button A+B pressed' event triggers for interactive projects.",
          tag: "Gesture Sensors"
        },
        {
          url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
          title: "Micro:bit Radio Messaging & Sensor Logging",
          caption: "Sending radio signals between Micro:bit boards to transmit temperature and tilt sensor data.",
          tag: "Radio Mesh"
        },
        {
          url: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&w=800&q=80",
          title: "Micro:bit Motor Shield & Robot Servo Controls",
          caption: "Wiring pin output signals to micro servos for steering motorized robot chassis.",
          tag: "Servo Motors"
        }
      ],
      "Roblox Studio": [
        {
          url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
          title: "Roblox Studio 3D Part Builder & Terrain Grid",
          caption: "Constructing 3D geometry with anchored parts, custom materials, and spawn locations.",
          tag: "3D World"
        },
        {
          url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
          title: "Roblox Lua Scripting & Touched Event Handlers",
          caption: "Writing Lua scripts attached to parts with script.Parent.Touched connections for checkpoints.",
          tag: "Lua Events"
        },
        {
          url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
          title: "Roblox Leaderstats & GUI HUD Elements",
          caption: "Creating player leaderboard statistics and ScreenGui interfaces for score tracking.",
          tag: "Leaderstats"
        },
        {
          url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
          title: "Roblox Obby Obstacle Course Mechanics",
          caption: "Designing lava brick kill triggers, disappearing platforms, and level completion teleporters.",
          tag: "Obby Mechanics"
        }
      ],
      "Python": [
        {
          url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
          title: "Python Syntax & Control Flow Workspace",
          caption: "Writing clean Python code with indentation loops, functions, and conditional logic.",
          tag: "Python Syntax"
        },
        {
          url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
          title: "Python Turtle Graphics & Visual Math Loops",
          caption: "Using the Turtle library to draw geometric patterns and fractal spirals using nested loops.",
          tag: "Turtle Graphics"
        },
        {
          url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
          title: "Python Data Plotting & Matplotlib Charts",
          caption: "Generating line graphs, scatter plots, and histograms from CSV sensor datasets.",
          tag: "Data Science"
        },
        {
          url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
          title: "Python Terminal Console & Debugging Workstation",
          caption: "Running interactive Python scripts, handling exceptions, and debugging code line-by-line.",
          tag: "Debugging Console"
        }
      ],
      "Visual Block-Based Coding": [
        {
          url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
          title: "Visual Block Coding Stack & Logic Flow",
          caption: "Drag-and-drop block coding workspace demonstrating event triggers, loops, and conditions.",
          tag: "Block Logic"
        },
        {
          url: "https://images.unsplash.com/photo-1580894732413-a704936a0422?auto=format&fit=crop&w=800&q=80",
          title: "Interactive Sprite Canvas & Coordinate Mapping",
          caption: "Mapping X and Y screen coordinates to guide sprite movements and collision hitboxes.",
          tag: "Sprite Canvas"
        },
        {
          url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
          title: "Variable Counter & Game State Manager",
          caption: "Storing player score data, lives, and timer countdowns in block variable containers.",
          tag: "State Management"
        },
        {
          url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
          title: "Classroom Code Review & Debugging Station",
          caption: "Students testing block scripts, reviewing error logs, and refining software algorithms.",
          tag: "Code Review"
        }
      ],
      catapult: [
        {
          url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
          title: "Popsicle Stick & Rubber Band Lever Arm",
          caption: "Classic 3-tier tension fulcrum build with hot-glue pivot joints and spoon launcher.",
          tag: "Classic Build"
        },
        {
          url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
          title: "Recycled Cardboard Torsion Chassis",
          caption: "Reinforced corrugated cardboard base featuring double rubber band torque loops.",
          tag: "Recycled Materials"
        },
        {
          url: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80",
          title: "Binder Clip & Dowel Precision Rig",
          caption: "Adjustable trajectory model using wooden skewers and heavy binder clips.",
          tag: "Advanced Precision"
        },
        {
          url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
          title: "Classroom Trajectory Testing Setup",
          caption: "Calibrated target grid layout for recording angle vs distance metrics.",
          tag: "Classroom Testing"
        }
      ],
      circuitry: [
        {
          url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
          title: "Coiled Wire Electromagnet Pickup Rig",
          caption: "Enamel copper wire wrapped around iron core bolt connected to D-cell battery.",
          tag: "Core Prototype"
        },
        {
          url: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80",
          title: "Interactive Circuit Board Test Bench",
          caption: "Breadboard setup with LED indicators and momentary contact switch.",
          tag: "Breadboard Setup"
        },
        {
          url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
          title: "Paper Circuit Copper Tape Prototype",
          caption: "Conductive tape pathway with coin-cell battery for flexible lightweight projects.",
          tag: "Low-Tech Paper Circuit"
        },
        {
          url: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80",
          title: "Student Electromagnetic Crane Model",
          caption: "Cardboard crane arm with switch-operated electromagnet lifting paperclips.",
          tag: "Integrated Mechanics"
        }
      ],
      robotics: [
        {
          url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
          title: "Block Coding & Sprite Control Interface",
          caption: "Visual block script stack demonstrating event triggers and conditional loops.",
          tag: "Block Logic"
        },
        {
          url: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&w=800&q=80",
          title: "Micro-servo Motorized Chassis",
          caption: "Lightweight wheeled robot powered by Micro:bit / Arduino board.",
          tag: "Hardware Prototype"
        },
        {
          url: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=800&q=80",
          title: "Sensory Obstacle Avoidance Rig",
          caption: "Ultrasonic sensor rig mounted on front bumper for maze navigation.",
          tag: "Sensor Array"
        },
        {
          url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
          title: "Scratch Game Screen & Sprite Map",
          caption: "Interactive coordinate grid layout showing start zone, maze walls, and target goal.",
          tag: "Visual Workspace"
        }
      ],
      bridge: [
        {
          url: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80",
          title: "Warren Truss Balsa Wood Structure",
          caption: "Triangular lattice framework designed to evenly distribute compressive load.",
          tag: "Truss Design"
        },
        {
          url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
          title: "Popsicle Stick Beam Assembly",
          caption: "Multi-ply laminated beam deck clamped during wood glue curing phase.",
          tag: "Classroom Assembly"
        },
        {
          url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
          title: "Suspension Cable & Tower Mockup",
          caption: "Heavy twine cables anchored to wooden towers demonstrating tension dynamics.",
          tag: "Cable Stayed"
        },
        {
          url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
          title: "Bucket Load Testing Station",
          caption: "Suspended bucket fixture with sand weights measuring structural point of failure.",
          tag: "Load Test Station"
        }
      ],
      engineering: [
        {
          url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
          title: `${title} - Primary Physical Model`,
          caption: "Full assembly overview showing base structure, mechanical linkages, and pivot points.",
          tag: "Model Assembly"
        },
        {
          url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
          title: `${title} - Recycled Materials Prototype`,
          caption: "Cost-effective classroom build using cardboard, straws, rubber bands, and tape.",
          tag: "Budget Friendly"
        },
        {
          url: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80",
          title: `${title} - Modular Component Detail`,
          caption: "Close-up of trigger mechanism, joints, and reinforced load-bearing connections.",
          tag: "Component Detail"
        },
        {
          url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
          title: `${title} - Student Testing & Data Station`,
          caption: "Classroom workstation setup with measurement tape, stopwatch, and tally sheets.",
          tag: "Testing Station"
        }
      ]
    };

    const selectedSet = imageSets[categoryTheme] || imageSets.engineering;

    return selectedSet.map(item => ({
      ...item,
      softwarePlatform: identifiedSoftware,
      searchUrl: `https://www.google.com/search?q=${encodeURIComponent(item.title + " " + baseSearchQuery)}&tbm=isch&safe=active`
    }));
  }, [lesson, identifiedSoftware]);

  // Reorder Active Curriculum Suite tabs based on learned instructor memory & category focus
  const getInstructorDynamicTabs = React.useCallback(() => {
    const learnedNotes = (
      (profile?.instructorNotes || "") + " " + 
      (profile?.customPreferences || "") + " " + 
      (customPreferences || "") + " " + 
      (selectedCategory || "") + " " +
      (lesson?.lessonTitle || "")
    ).toLowerCase();

    const allTabs = [
      { id: "slides", label: "Interactive Slides", icon: Layers },
      { id: "lab", label: selectedCategory === "Software" ? "💻 Coding Blocks" : "Hands-On Lab", icon: selectedCategory === "Software" ? Terminal : Activity },
      { id: "quiz", label: "Smartboard Quiz", icon: HelpCircle },
      { id: "media", label: "Media Fixer", icon: Link2Off }
    ];

    const scores: Record<string, number> = {
      slides: 0,
      lab: 0,
      quiz: 0,
      media: 0
    };

    // Category base weight
    if (selectedCategory === "Gaming" || isGamingLesson) {
      scores.lab += 30;
      scores.slides += 10;
    } else if (selectedCategory === "Technology" || selectedCategory === "Engineering") {
      scores.lab += 20;
      scores.slides += 8;
    } else if (selectedCategory === "Art") {
      scores.lab += 15;
      scores.slides += 10;
    } else if (selectedCategory === "Math") {
      scores.quiz += 20;
      scores.slides += 8;
    } else {
      // Science
      scores.slides += 20;
      scores.lab += 10;
    }

    // Instructor Memory and Directives Boost
    if (learnedNotes.includes("gaming") || learnedNotes.includes("scratch") || learnedNotes.includes("minecraft") || learnedNotes.includes("coding") || learnedNotes.includes("lab") || learnedNotes.includes("hands-on") || learnedNotes.includes("experiment") || learnedNotes.includes("robot")) {
      scores.lab += 15;
    }
    if (learnedNotes.includes("quiz") || learnedNotes.includes("assessment") || learnedNotes.includes("jeopardy") || learnedNotes.includes("test") || learnedNotes.includes("question")) {
      scores.quiz += 15;
    }
    if (learnedNotes.includes("slide") || learnedNotes.includes("deck") || learnedNotes.includes("lecture") || learnedNotes.includes("presentation")) {
      scores.slides += 15;
    }

    return [...allTabs].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  }, [profile, customPreferences, selectedCategory, lesson?.lessonTitle, isCodingLesson, isGamingLesson]);

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
      const specs = `Category: ${selectedCategory}. Tailor for ${effectiveGrade} grade, class size of ${selectedSize}, duration of ${selectedDuration}, with ${getFormattedSupplies()} available.`;
      setCustomPreferences(specs);
    }
  }, [selectedCategory, selectedGrade, customGradeInput, selectedSize, selectedDuration, getFormattedSupplies, isManuallyEdited]);

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
      if (profile.tech) {
        const loaded = profile.tech.split(", ").map(t => t.trim()).filter(Boolean);
        if (loaded.length > 0) setSelectedSupplies(loaded);
      }
    }
  }, [profile]);

  const handleAutoGenerateFromChips = () => {
    const effectiveGrade = selectedGrade === "Custom" ? (customGradeInput.trim() || "Custom Age Range") : selectedGrade;
    const specs = `Category: ${selectedCategory}. Tailor for ${effectiveGrade} grade, class size of ${selectedSize}, duration of ${selectedDuration}, with ${getFormattedSupplies()} available.`;
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
        getFormattedSupplies()
      );
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save instructor preferences:", err);
    } finally {
      setProfileSaving(false);
    }
  };

  // Auto-detect age range / grade level and software platforms from uploaded curriculum & directives
  const autoDetectCurriculumSettings = (textToScan: string, fileNameToScan?: string | null, directiveToScan?: string) => {
    const combined = ((textToScan || "") + " " + (fileNameToScan || "") + " " + (directiveToScan || "")).toLowerCase();
    if (!combined.trim()) return;

    // 1. Grade / Age Range Auto-Selection
    if (
      combined.includes("scratch jr") || combined.includes("scratchjr") || combined.includes("junior scratch") ||
      combined.includes("k-2") || combined.includes("kindergarten") || combined.includes("1st grade") ||
      combined.includes("2nd grade") || combined.includes("ages 5-7") || combined.includes("ages 4-6") ||
      combined.includes("early childhood") || combined.includes("pre-k")
    ) {
      setSelectedGrade("K-2");
    } else if (
      combined.includes("3-5") || combined.includes("3rd grade") || combined.includes("4th grade") ||
      combined.includes("5th grade") || combined.includes("ages 8-10") || combined.includes("elementary") ||
      combined.includes("scratch 3") || combined.includes("scratch 3.0")
    ) {
      setSelectedGrade("3-5");
    } else if (
      combined.includes("6-8") || combined.includes("6th grade") || combined.includes("7th grade") ||
      combined.includes("8th grade") || combined.includes("ages 11-13") || combined.includes("middle school") ||
      combined.includes("minecraft") || combined.includes("roblox")
    ) {
      setSelectedGrade("6-8");
    } else if (
      combined.includes("9-12") || combined.includes("9th grade") || combined.includes("10th grade") ||
      combined.includes("11th grade") || combined.includes("12th grade") || combined.includes("ages 14-18") ||
      combined.includes("high school")
    ) {
      setSelectedGrade("9-12");
    }

    // 2. Domain Category & Software/Platform Auto-Selection
    const newSupplies: string[] = [];

    if (combined.includes("scratch jr") || combined.includes("scratchjr") || combined.includes("junior scratch")) {
      setSelectedCategory("Gaming");
      newSupplies.push("Scratch JR");
    } else if (combined.includes("scratch 3") || combined.includes("scratch 3.0") || combined.includes("scratch") || combined.includes("sprite") || combined.includes("costume")) {
      setSelectedCategory("Gaming");
      newSupplies.push("Scratch 3.0");
    } else if (combined.includes("minecraft") || combined.includes("redstone") || combined.includes("makecode agent") || combined.includes("creeper")) {
      setSelectedCategory("Gaming");
      newSupplies.push("Minecraft Education");
    } else if (combined.includes("roblox") || combined.includes("lua")) {
      setSelectedCategory("Gaming");
      newSupplies.push("Roblox Studio");
    } else if (combined.includes("edublocks") || combined.includes("edu blocks")) {
      setSelectedCategory("Software");
      newSupplies.push("EduBlocks");
    } else if (combined.includes("thunkable") || combined.includes("app inventor")) {
      setSelectedCategory("Software");
      newSupplies.push("Thunkable");
    } else if (combined.includes("code.org") || combined.includes("game lab") || combined.includes("sprite lab")) {
      setSelectedCategory("Gaming");
      newSupplies.push("Code.org Game Lab");
    } else if (combined.includes("micro:bit") || combined.includes("microbit")) {
      setSelectedCategory("Circuitry");
      newSupplies.push("Micro:bit / MakeCode");
    } else if (combined.includes("python")) {
      setSelectedCategory("Software");
      newSupplies.push("Python / IDE");
    } else if (combined.includes("lego") || combined.includes("spike prime") || combined.includes("wedo") || combined.includes("robot")) {
      setSelectedCategory("Engineering");
      newSupplies.push("LEGO Robotics");
    } else if (combined.includes("circuit") || combined.includes("led") || combined.includes("breadboard") || combined.includes("battery")) {
      setSelectedCategory("Circuitry");
      newSupplies.push("Snap Circuits");
      newSupplies.push("LEDs & Breadboard");
    }

    if (newSupplies.length > 0) {
      setSelectedSupplies(newSupplies);
    }

    // Auto-update generated instruction directive if not manually edited
    if (!isManuallyEdited) {
      const effectiveGrade = selectedGrade === "Custom" ? (customGradeInput.trim() || "Custom Age Range") : selectedGrade;
      const detectedPlatformText = newSupplies.length > 0 ? newSupplies.join(", ") : "Standard STEM Tools";
      const specs = `Auto-aligned for ${effectiveGrade} grade using ${detectedPlatformText}. Class size ${selectedSize}, duration ${selectedDuration}. Focus on interactive hands-on gamification.`;
      setCustomPreferences(specs);
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

          const responseText = await response.text();
          let data: any = {};
          try {
            data = JSON.parse(responseText);
          } catch {
            throw new Error(`Server returned non-JSON response (${response.status}). Please check document format.`);
          }

          if (!response.ok) {
            throw new Error(data.error || data.details || "Failed to extract text from document");
          }

          if (data.text && data.text.trim().length > 0) {
            setCustomContent(data.text);
            triggerTempTextMaterialOpen();
            autoDetectCurriculumSettings(data.text, file.name, customPreferences);
            setShowPlanConfirmationModal(true);
          } else {
            throw new Error("No readable text content could be extracted from this document.");
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
          triggerTempTextMaterialOpen();
          autoDetectCurriculumSettings(text, file.name, customPreferences);
          setShowPlanConfirmationModal(true);
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
  const handleProcessLesson = async (skipModal: boolean = false) => {
    // Show pop-up modal preview first unless confirmed
    if (!skipModal) {
      autoDetectCurriculumSettings(customContent, uploadedFileName, customPreferences);
      setShowPlanConfirmationModal(true);
      return;
    }

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
            getFormattedSupplies()
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
            getFormattedSupplies(),
            data.extractedStyleNotes
          );
        } catch (saveNotesErr) {
          console.error("Autosaving Lyrah's extracted style notes failed:", saveNotesErr);
        }
      }

      const reorderedTabs = getInstructorDynamicTabs();
      if (reorderedTabs.length > 0) {
        setActiveTab(reorderedTabs[0].id as any);
      } else {
        setActiveTab("slides");
      }
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
        <nav className={`px-3 sm:px-6 py-3 border-b flex flex-col gap-2 backdrop-blur-md sticky top-0 z-30 transition-all -mx-3 sm:-mx-6 lg:-mx-10 xl:-mx-12 px-3 sm:px-6 lg:px-10 xl:px-12 ${
          isDarkMode ? "border-slate-800/80 bg-slate-900/90 liquid-glass-dark" : "border-black/[0.09] bg-white/90 liquid-glass-light"
        }`}>
          {/* Top Row: Logo & Primary Actions */}
          <div className="flex items-center justify-between gap-2.5 sm:gap-4 w-full">
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
              onClick={() => setCurrentView("landing")}
            >
              {/* The constellation, not a mascot */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyber-bg flex items-center justify-center shrink-0 border border-teal-brand/50 group-hover:scale-105 group-hover:border-teal-brand transition-all micro-glow-teal">
                <LyraMark className="w-full h-full p-1 text-teal-brand" />
              </div>
              <div className="leading-none">
                <span className="brand-word block text-2xl sm:text-3xl">
                  Lyrah
                </span>
                <p className="text-[9px] sm:text-[10px] text-secondary dark:text-slate-400 font-sans tracking-[0.18em] uppercase leading-none mt-1 hidden xs:block">Afterschool STEM Copilot</p>
              </div>
            </div>

            {/* Nav Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Fixed Top Navbar Link: My Lessons Vault Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (currentView !== "studio") {
                    setCurrentView("studio");
                  }
                  setIsVaultExpanded(prev => !prev);
                }}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[38px] border ${
                  isVaultExpanded
                    ? "bg-teal-brand text-slate-950 border-teal-brand shadow-3xs"
                    : isDarkMode 
                      ? "bg-slate-800 text-teal-brand border-slate-700 hover:bg-slate-700 hover:border-teal-brand/40" 
                      : "bg-teal-light/60 text-teal-dark border-teal-brand/30 hover:bg-teal-light hover:border-teal-brand/50"
                }`}
                title="Toggle Firebase Cloud Storage Vault sticky-pad"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>My Lessons</span>
                {user && savedLessons.length > 0 && (
                  <span className={`px-1.5 py-0.2 font-mono text-[9px] font-extrabold rounded-full ${
                    isVaultExpanded ? "bg-slate-950 text-teal-brand" : "bg-teal-brand text-slate-950"
                  }`}>
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
          </div>

          {/* Row 2: Secondary Header Row directly below user's logged in name for Firebase Cloud Storage Vault */}
          <div className="w-full flex justify-end pt-1 border-t border-black/[0.05] dark:border-slate-800/80">
            <div className="w-full max-w-sm sm:max-w-md relative" id="my-lessons-vault">
              {/* Sticky-pad Bar Header */}
              <div
                onClick={() => setIsVaultExpanded(!isVaultExpanded)}
                className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 cursor-pointer select-none hover:bg-slate-850 hover:border-teal-brand/40 transition-all shadow-xs group"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold font-mono tracking-wider text-teal-brand uppercase bg-teal-brand/20 border border-teal-brand/30 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-teal-brand" />
                    Vault
                  </span>
                  <span className="text-xs font-bold font-sans text-slate-200 group-hover:text-teal-brand transition-colors">
                    Firebase Cloud Storage
                  </span>
                  <span className="px-2 py-0.2 bg-teal-brand/10 text-teal-brand text-[10px] font-mono font-extrabold rounded-full border border-teal-brand/20">
                    {savedLessons.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                    {isVaultExpanded ? "Close sticky-pad" : "Open sticky-pad"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsVaultExpanded(!isVaultExpanded);
                    }}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-all cursor-pointer"
                    aria-label={isVaultExpanded ? "Collapse Vault Section" : "Expand Vault Section"}
                  >
                    {isVaultExpanded ? <ChevronUp className="w-4 h-4 text-teal-brand" /> : <ChevronDown className="w-4 h-4 text-teal-brand" />}
                  </button>
                </div>
              </div>

              {/* Opened Sticky-Pad Dropdown Content */}
              <AnimatePresence>
                {isVaultExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-2 w-full bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-2xl text-slate-100 z-50 liquid-glass-dark"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold font-mono tracking-wider text-teal-brand uppercase bg-teal-brand/20 border border-teal-brand/30 px-2 py-0.5 rounded-md">
                          Cloud Storage Vault
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans">Sorted by Date</span>
                      </div>
                      {user && (
                        <span className="text-[9px] font-mono text-slate-400 truncate max-w-[130px]">
                          {user.email}
                        </span>
                      )}
                    </div>

                    {!user ? (
                      <div className="p-4 text-center space-y-2.5 bg-slate-800/60 rounded-xl border border-dashed border-slate-700">
                        <Cloud className="w-6 h-6 text-teal-brand mx-auto" />
                        <p className="text-xs font-bold text-slate-200">Sign in to access Cloud Storage Vault</p>
                        <button
                          type="button"
                          onClick={handleSignInAndRedirect}
                          className="px-3 py-1.5 bg-teal-brand text-slate-950 font-bold text-xs rounded-xl shadow-3xs cursor-pointer hover:bg-teal-400 transition-all"
                        >
                          Sign In with Google
                        </button>
                      </div>
                    ) : sortedSavedLessons.length === 0 ? (
                      <div className="p-4 text-center space-y-2 bg-slate-800/60 rounded-xl border border-dashed border-slate-700">
                        <Cloud className="w-6 h-6 text-teal-brand/60 mx-auto" />
                        <p className="text-xs font-bold text-slate-200">No saved lessons in cloud storage yet</p>
                        <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                          Click <strong className="text-teal-brand">"Save to Cloud"</strong> on any active lesson plan to store it here!
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {sortedSavedLessons.map((saved) => {
                          const isCurrentlyActive = lesson.id === saved.id;
                          return (
                            <div
                              key={saved.id}
                              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                                isCurrentlyActive
                                  ? "border-teal-brand bg-teal-brand/15"
                                  : "border-slate-800 bg-slate-800/80 hover:border-slate-700 hover:bg-slate-800"
                              }`}
                            >
                              <div className="overflow-hidden flex-1 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-bold text-slate-100 truncate">{saved.lessonTitle}</p>
                                  {isCurrentlyActive && (
                                    <span className="px-1.5 py-0.2 bg-teal-brand text-slate-950 text-[8px] font-mono font-extrabold rounded uppercase shrink-0">Active</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-sans">
                                  <span>{formatSavedDate(saved.createdAt)}</span>
                                  <span>•</span>
                                  <span>{saved.duration} Block</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLesson(saved);
                                    setActiveTab("slides");
                                  }}
                                  className="px-2.5 py-1 bg-teal-brand/20 hover:bg-teal-brand text-teal-brand hover:text-slate-950 rounded-lg text-[10px] font-bold transition-all cursor-pointer min-h-[30px]"
                                >
                                  Load
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingLessonId === saved.id}
                                  onClick={async () => {
                                    if (confirm(`Delete "${saved.lessonTitle}" from Firebase Cloud Storage?`)) {
                                      try {
                                        setDeletingLessonId(saved.id);
                                        await deleteLessonFromCloud(saved.id);
                                        setSaveStatus("Deleted from cloud");
                                        setTimeout(() => setSaveStatus(null), 3000);
                                      } catch (err: any) {
                                        alert("Failed to delete lesson: " + (err?.message || "Unknown error"));
                                      } finally {
                                        setDeletingLessonId(null);
                                      }
                                    }
                                  }}
                                  className="p-1.5 hover:bg-red-950/60 text-slate-400 hover:text-red-400 rounded-lg transition-all cursor-pointer min-h-[30px] disabled:opacity-50"
                                  title="Delete from cloud storage"
                                >
                                  {deletingLessonId === saved.id ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-400" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
              <span className="inline-block text-[10px] font-extrabold tracking-widest text-amber-700 dark:text-amber-400 uppercase font-sans">
                XPRIZE · Education & Human Potential
              </span>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                Your AI copilot for <span className="text-teal-800 dark:text-teal-brand underline decoration-teal-brand/40 underline-offset-4">STEM lesson prep</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans font-normal">
                Lyrah turns long, messy science articles and PDF textbooks into beautiful interactive slide decks, hands-on lab guides, printable worksheets, and broken media link backups instantly.
              </p>
            </div>

            {/* Lyra, plotted */}
            <div className="star-field self-center md:self-auto shrink-0 bg-cyber-bg border border-teal-brand/25 dark:border-teal-brand/30 rounded-2xl p-3 sm:p-4 shadow-3xs">
              <LyraMark className="w-20 h-20 sm:w-28 sm:h-28 text-teal-brand" />
            </div>
          </div>

          {/* Interactive Core Intake Controller (ly-upload-zone) */}
          <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all overflow-hidden" id="intake-panel">
            
            {/* Step Header (Clickable Expandable Toggle) */}
            <div 
              className="flex justify-between items-center p-4 sm:p-5 cursor-pointer select-none border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              onClick={() => setIsUploadExpanded(!isUploadExpanded)}
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[10px] font-bold font-mono tracking-wider text-teal-800 dark:text-teal-brand uppercase bg-teal-50 dark:bg-teal-brand/20 border border-teal-200 dark:border-teal-brand/20 px-2.5 py-0.5 rounded-md">
                  1. Upload Curriculum Material
                </span>
                {!isUploadExpanded && (uploadedFileName || customContent) && (
                  <span className="text-xs font-semibold text-teal-900 dark:text-teal-brand truncate max-w-[180px] sm:max-w-xs flex items-center gap-1.5 bg-teal-50 dark:bg-teal-brand/10 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-brand/20">
                    <Check className="w-3 h-3 text-teal-600 dark:text-teal-brand shrink-0" />
                    <span className="truncate">{uploadedFileName || lesson?.lessonTitle || "Curriculum Text Loaded"}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-sans flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-amber-600 dark:text-gold-brand" />
                  <span className="hidden sm:inline">Configuration</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUploadExpanded(!isUploadExpanded);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
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
                            Seamlessly transforms raw lesson plans into interactive slides, hands-on activities, prototype carousels, and smartboard quizzes.
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

            {/* Raw lesson plan box (Folded Accordion Dropdown by Default) */}
            <div className="border border-black/[0.08] dark:border-slate-800 rounded-xl overflow-hidden bg-surface-0/60 dark:bg-slate-900/60 transition-all">
              <button
                type="button"
                onClick={() => setIsTextMaterialOpen(!isTextMaterialOpen)}
                className="w-full px-4 py-3 flex items-center justify-between bg-surface-1/80 dark:bg-slate-800/80 hover:bg-teal-light/20 dark:hover:bg-slate-800 transition-all cursor-pointer border-b border-black/[0.05] dark:border-slate-800"
              >
                <div className="flex items-center gap-2 text-left flex-wrap">
                  <FileText className="w-4 h-4 text-teal-brand shrink-0" />
                  <span className="text-xs font-bold text-teal-dark dark:text-teal-brand font-sans">
                    Curriculum Text Material & Outline
                  </span>
                  {customContent ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold">
                      <Check className="w-3 h-3" />
                      {uploadedFileName ? uploadedFileName : `${customContent.length} chars loaded`}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      Folded (Optional)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                    {isTextMaterialOpen ? "Click to collapse" : "Click to expand"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-teal-brand transition-transform duration-200 ${isTextMaterialOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isTextMaterialOpen && (
                <div className="p-4 space-y-3 animate-fade-in border-t border-black/[0.05] dark:border-slate-800">
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
                    rows={4}
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
                          triggerTempTextMaterialOpen();
                        }}
                        className="text-[10px] font-bold text-teal-dark dark:text-teal-brand bg-teal-light/40 dark:bg-teal-brand/20 hover:bg-teal-light dark:hover:bg-teal-brand/30 hover:text-teal-brand border border-teal-brand/10 dark:border-teal-brand/30 px-2.5 py-0.5 rounded-full transition-all cursor-pointer"
                      >
                        {preload.id === "rocketry" ? "Rocket Physics" : preload.id === "bridges" ? "Bridge Static" : "Electromagnetism"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive chip context rows (Appends parameters directly) */}
            <div className="bg-surface-0 dark:bg-slate-950/80 border border-black/[0.05] dark:border-slate-800 rounded-xl p-4.5 space-y-4">
              <span className="text-[10px] font-bold font-mono tracking-widest text-teal-brand uppercase block border-b dark:border-slate-800 pb-1.5">
                Instructor Tool Bar
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection (Science, Technology, Engineering, Art, Math) */}
                <div className="space-y-2 sm:col-span-2 border-b border-black/[0.05] dark:border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-teal-dark dark:text-teal-brand uppercase font-sans flex items-center gap-1.5">
                      <span>Curriculum Category</span>
                      <span className="text-[9px] font-mono font-bold text-teal-brand bg-teal-light/50 dark:bg-teal-brand/20 px-1.5 py-0.2 rounded">
                        Required
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Select domain focus</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-center pt-0.5">
                    {[
                      { id: "Science", label: "Science", icon: "🔬" },
                      { id: "Technology", label: "Technology", icon: "💻" },
                      { id: "Circuitry", label: "Circuitry", icon: "⚡" },
                      { id: "Software", label: "Software & Coding", icon: "⚙️" },
                      { id: "Gaming", label: "Gaming", icon: "🎮" },
                      { id: "Engineering", label: "Engineering", icon: "🛠️" },
                      { id: "Art", label: "Art", icon: "🎨" },
                      { id: "Math", label: "Math", icon: "📐" }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-sans font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          selectedCategory === cat.id 
                            ? "bg-teal-dark dark:bg-teal-brand text-white dark:text-slate-950 border-teal-brand shadow-3xs micro-glow-teal scale-[1.02]" 
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-teal-dark dark:hover:text-white border-slate-200 dark:border-slate-700 hover:border-teal-brand/30"
                        }`}
                      >
                        <span className="text-sm">{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Technology Sub-Category Selection (Hardware, Software, Circuitry) */}
                  {selectedCategory === "Technology" && (
                    <div className="pt-2.5 mt-2 border-t border-dashed border-teal-brand/30 animate-fade-in space-y-1.5 bg-teal-light/20 dark:bg-slate-900/60 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-dark dark:text-teal-brand uppercase font-sans flex items-center gap-1.5">
                          <span>Technology Focus Areas</span>
                          <span className="text-[9px] font-mono text-teal-brand bg-white dark:bg-slate-800 px-1.5 py-0.2 rounded font-semibold border border-teal-brand/30">
                            Select Focus
                          </span>
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">Hardware • Software • Circuitry</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          { id: "Hardware", label: "Hardware & Robotics", icon: "💻", desc: "Robotics, microcontrollers, 3D printing" },
                          { id: "Software", label: "Software & Coding", icon: "⚙️", desc: "Scratch JR, Scratch, Minecraft, EduBlocks, Python" },
                          { id: "Circuitry", label: "Circuitry & Electronics", icon: "⚡", desc: "DC motors, LEDs, breadboards, conductive circuits" }
                        ].map((techType) => {
                          const isSelected = selectedTechSubTypes.includes(techType.id);
                          return (
                            <button
                              key={techType.id}
                              type="button"
                              onClick={() => toggleTechSubType(techType.id)}
                              className={`text-xs px-3 py-1.5 rounded-xl font-sans font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                                isSelected 
                                  ? "bg-teal-dark dark:bg-teal-brand text-white dark:text-slate-950 border-teal-brand shadow-3xs scale-[1.02]" 
                                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-brand/40"
                              }`}
                            >
                              <span>{techType.icon}</span>
                              <span>{techType.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

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

                {/* Available Supplies & Example Technologies (Dynamic based on Category & Focus) */}
                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-secondary dark:text-slate-300 uppercase font-sans">
                        {activeSupplyCategoryKey === "Software" ? "Available Software & Platforms" : "Available Supplies & Components"}
                      </span>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-teal-brand/20 text-teal-dark dark:text-teal-brand border border-teal-brand/30">
                        Domain: {activeSupplyCategoryKey}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">Select all that apply</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {currentSupplyOptions.map((opt) => {
                      const isSelected = selectedSupplies.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggleSupply(opt.id)}
                          title={opt.description || opt.label}
                          className={`text-xs px-2.5 py-1.5 rounded-xl font-sans font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                            isSelected 
                              ? "bg-teal-dark dark:bg-teal-brand text-white dark:text-slate-950 border-teal-brand shadow-3xs micro-glow-teal scale-[1.02]" 
                              : "bg-white dark:bg-slate-800 text-secondary dark:text-slate-300 border-black/[0.08] dark:border-slate-700 hover:border-teal-brand/30"
                          }`}
                        >
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                          {isSelected ? <Check className="w-3.5 h-3.5 text-teal-brand dark:text-slate-950 font-bold" /> : <span className="text-slate-400 text-[10px]">+</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Supply / Software Input if "Other" is selected */}
                  {selectedSupplies.includes("Other") && (
                    <div className="pt-2 space-y-2 animate-fade-in">
                      <input
                        type="text"
                        placeholder={
                          activeSupplyCategoryKey === "Software"
                            ? "Type custom software/platform (e.g., Godot, Scratch JR, Scratch 3.0, Roblox, App Inventor)"
                            : activeSupplyCategoryKey === "Circuitry"
                            ? "Type custom circuitry/components (e.g., 555 Timer, Solar Panel, Transistors, 9V Motor)"
                            : "Type custom tools/materials (e.g., 3D Printer, Lego Robotics, Clay, Water Pumps)"
                        }
                        value={customSuppliesInput}
                        onChange={(e) => setCustomSuppliesInput(e.target.value)}
                        className="text-xs px-3.5 py-2 border border-teal-brand/50 rounded-xl bg-white dark:bg-slate-800 w-full focus:outline-none focus:ring-2 focus:ring-teal-brand/30 focus:border-teal-brand font-sans text-teal-dark dark:text-teal-brand font-semibold shadow-3xs"
                      />

                      <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-300/40 dark:border-sky-800 rounded-xl text-[10px] text-sky-900 dark:text-sky-200 font-sans flex items-start gap-2">
                        <Search className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                        <p className="leading-snug">
                          <strong>🔍 Google Search Grounding Active:</strong> Lyrah will search Google using <em>"{activeSupplyCategoryKey}"</em> + your custom keywords from the lesson plan to create, research real data on, and perfect the most realistic solution with technical feasibility checks & alternatives.
                        </p>
                      </div>
                    </div>
                  )}
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

                {/* Lyrah's Memory Profile & AI Insights */}
                {user ? (
                  <div className="bg-teal-50/60 dark:bg-teal-brand/10 border border-teal-brand/20 dark:border-teal-brand/30 rounded-xl p-3 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-teal-700 dark:text-teal-brand animate-pulse" />
                      <span className="text-[9px] font-bold text-teal-900 dark:text-teal-brand uppercase tracking-wider font-sans">
                        Lyrah's Memory of You
                      </span>
                    </div>
                    {profile?.instructorNotes ? (
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-800 dark:text-slate-300 font-sans leading-relaxed">
                          "I've learned that you focus on: <span className="font-semibold text-teal-900 dark:text-teal-brand">{profile.instructorNotes}</span>"
                        </p>
                        <span className="text-[8px] text-teal-700 dark:text-teal-brand font-medium block">
                          💡 Lyrah automatically synthesizes these pedagogical preferences into new plans.
                        </span>
                      </div>
                    ) : (
                      <p className="text-[9px] text-slate-600 dark:text-slate-400 italic font-sans leading-normal">
                        Generate a lesson to activate. Lyrah will observe your input patterns and custom instructions to learn your style.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-2.5 text-[9px] text-amber-950 dark:text-amber-200 leading-normal font-sans font-medium">
                    🔒 <span className="font-bold">Sign In</span> to enable Lyrah's adaptive memory. Lyrah will save your instructions and learn your pedagogical style across sessions!
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
                          {getDynamicCompilationStepText(1, customContent, uploadedFileName, transformationGoal, getFormattedSupplies())}
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
                          {getDynamicCompilationStepText(2, customContent, uploadedFileName, transformationGoal, getFormattedSupplies())}
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
                          {getDynamicCompilationStepText(3, customContent, uploadedFileName, transformationGoal, getFormattedSupplies())}
                        </span>
                        {compilationStep >= 3 && <Check className="w-4 h-4 text-emerald-400 animate-pulse" />}
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center font-sans italic pt-1">
                      Targeting {selectedGrade === "Custom" ? customGradeInput || "Custom Age" : selectedGrade} • {getFormattedSupplies()} • {transformationGoal === "gamify" ? "Gamified Adventure" : "Presentation Deck"}...
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

        {/* Active Workspace Column Stack */}
        <section className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1 w-full max-w-7xl mx-auto">
          
          {/* Active Lesson Meta Display & Curriculum Suite */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all overflow-hidden w-full" id="workspace-panel">
            
            {/* Header Bar matching Upload Curriculum Material */}
            <div 
              className="flex justify-between items-center p-4 sm:p-5 cursor-pointer select-none border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              onClick={() => setIsCurriculumSuiteExpanded(!isCurriculumSuiteExpanded)}
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[10px] font-bold font-mono tracking-wider text-teal-800 dark:text-teal-brand uppercase bg-teal-50 dark:bg-teal-brand/20 border border-teal-200 dark:border-teal-brand/20 px-2.5 py-0.5 rounded-md">
                  2. Active Curriculum Suite
                </span>
                <span className="text-xs font-bold font-sans text-slate-800 dark:text-slate-100 truncate max-w-[180px] sm:max-w-md">
                  {lesson.lessonTitle}
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 hidden md:inline">
                  ({lesson.duration} Block)
                </span>
              </div>

              {/* Cloud Save Actions & Collapse Toggle */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {user ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveToCloud();
                    }}
                    disabled={dbLoading}
                    className="px-3.5 py-1.5 bg-teal-dark dark:bg-teal-brand dark:text-slate-950 hover:bg-opacity-95 text-white rounded-xl text-xs font-extrabold shadow-3xs flex items-center justify-center gap-1.5 transition-all cursor-pointer micro-glow-teal min-h-[36px]"
                  >
                    <Cloud className="w-3.5 h-3.5 text-teal-brand dark:text-slate-950" />
                    <span>{dbLoading ? 'Saving...' : 'Save to Cloud'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      signInWithGoogle();
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-surface-0 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold shadow-3xs flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[36px]"
                  >
                    <LogIn className="w-3.5 h-3.5 text-teal-brand" />
                    <span className="hidden sm:inline">Sign In to Save</span>
                  </button>
                )}
                {saveStatus && (
                  <span className="text-[10px] font-bold text-teal-brand font-sans hidden sm:flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {saveStatus}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCurriculumSuiteExpanded(!isCurriculumSuiteExpanded);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                  aria-label={isCurriculumSuiteExpanded ? "Collapse Active Curriculum Suite" : "Expand Active Curriculum Suite"}
                >
                  {isCurriculumSuiteExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isCurriculumSuiteExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 sm:p-6 space-y-6"
                >
                  {/* Lesson Overview Banner */}
                  <div className="space-y-1.5 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-secondary dark:text-slate-300 font-sans flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-gold-brand" />
                        {lesson.duration} Block
                      </span>
                      <span className="text-[10px] font-mono text-teal-brand bg-teal-light dark:bg-teal-brand/20 px-2 py-0.5 rounded font-bold">
                        {selectedCategory}
                      </span>
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-teal-dark dark:text-teal-brand">
                      {lesson.lessonTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-secondary dark:text-slate-300 leading-relaxed font-sans">
                      {lesson.summary}
                    </p>
                  </div>

            {/* Adaptive Reordering Indicator Banner */}
            <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-teal-50/80 dark:bg-teal-brand/10 border border-teal-brand/20 rounded-xl mb-3 text-xs text-teal-dark dark:text-teal-brand font-sans">
              <div className="flex items-center gap-2 font-semibold">
                <Brain className="w-4 h-4 text-teal-brand shrink-0" />
                <span>Suite tabs reordered based on learned instructor memory & <strong>{selectedCategory}</strong> category focus</span>
              </div>
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 bg-teal-brand/20 text-teal-brand rounded shrink-0">
                Adaptive Layout
              </span>
            </div>

            {/* Touch-Friendly Mobile Scrollable Resource Pills Tabs (Dynamic Order) */}
            <div className="flex border border-black/[0.06] dark:border-slate-800 overflow-x-auto no-scrollbar scroll-smooth gap-1.5 bg-surface-0 dark:bg-slate-950/80 p-1.5 rounded-2xl mb-6 font-sans w-full">
              {getInstructorDynamicTabs().map((tab) => {
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
                    {/* Software Platform & Goal Compatibility Audit Banner */}
                    {(isCodingLesson || isGamingLesson || identifiedSoftware) && (
                      <div className="md:col-span-12 p-4 bg-slate-900/95 text-slate-100 border border-teal-brand/30 rounded-2xl space-y-3 shadow-lg">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="p-2 bg-teal-brand/20 text-teal-brand rounded-xl border border-teal-brand/30">
                              <Laptop className="w-5 h-5 text-teal-brand" />
                            </span>
                            <div>
                              <span className="text-[9px] font-mono font-bold text-teal-brand uppercase tracking-wider block">
                                LYRAH SOFTWARE PLATFORM AUDIT
                              </span>
                              <h4 className="text-sm font-bold font-sans text-white flex items-center gap-2">
                                <span>Identified Platform:</span>
                                <span className="text-amber-300 font-extrabold px-2 py-0.5 bg-amber-400/20 rounded-md border border-amber-400/30">
                                  {identifiedSoftware || (lesson.feasibilityAudit as any)?.identifiedSoftwarePlatform || "Scratch 3.0"}
                                </span>
                              </h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold rounded-lg uppercase flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>Software Goals Aligned & Verified</span>
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 font-sans pt-1">
                          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-[9px] font-mono font-bold text-teal-brand uppercase block">GOAL COMPATIBILITY AUDIT</span>
                            <p className="leading-relaxed text-[11px] text-slate-200 font-medium">
                              {lesson.feasibilityAudit?.softwareGoalCompatibility || 
                                `Lyrah confirmed that all lesson goals natively align with ${identifiedSoftware || "Scratch 3.0"} block capabilities, sprite logic, and platform mechanics.`}
                            </p>
                          </div>
                          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase block">SOLUTION EVALUATION & ADAPTATION</span>
                            <p className="leading-relaxed text-[11px] text-slate-200 font-medium">
                              {lesson.feasibilityAudit?.originalSolutionEvaluation || 
                                `Software architecture evaluated. No goal conflicts found — full support for block-based coding and interactive sprite controls.`}
                            </p>
                          </div>
                        </div>

                        {/* If feasibility audit proposed alternative solution */}
                        {lesson.feasibilityAudit?.recommendedAlternatives && lesson.feasibilityAudit.recommendedAlternatives.length > 0 && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1.5">
                            <span className="text-[9px] font-mono font-bold text-amber-300 uppercase block">💡 LYRAH PLANNED ALTERNATIVE SOLUTION</span>
                            {lesson.feasibilityAudit.recommendedAlternatives.map((alt, aIdx) => (
                              <div key={aIdx} className="text-[11px] text-amber-100 font-sans">
                                <strong>{alt.title}:</strong> {alt.description} <span className="text-amber-300">({alt.whyItWorksBetter})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Left Panel: Grounded Build Examples / SVG Diagrams & Logistics Checklist */}
                    <div className="md:col-span-5 space-y-4">
                      
                      {/* Grounded Prototype Examples & Nana Banana Pro SVG Diagram Component (ON THE LEFT) */}
                      {groundedPrototypeImages.length > 0 && (
                        <div className="bg-surface-0/90 dark:bg-slate-900/90 border border-teal-brand/30 rounded-2xl p-4.5 space-y-3.5 shadow-xs relative overflow-hidden">
                          <div className="space-y-2 border-b border-black/[0.06] dark:border-slate-800 pb-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                                  <Search className="w-3.5 h-3.5" />
                                </div>
                                <h4 className="text-xs font-bold font-sans uppercase text-teal-dark dark:text-teal-brand flex items-center gap-1.5">
                                  <span>Visual Diagrams & Grounded Images</span>
                                </h4>
                              </div>
                              {identifiedSoftware && (
                                <span className="text-[9px] font-mono px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full font-extrabold flex items-center gap-1">
                                  <Terminal className="w-2.5 h-2.5 text-amber-500" /> {identifiedSoftware}
                                </span>
                              )}
                            </div>

                            {/* Mode Switcher: Web Images vs Nana Banana Pro Diagrams */}
                            <div className="grid grid-cols-2 gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                              <button
                                type="button"
                                onClick={() => setLabVisualMode("web")}
                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                  labVisualMode === "web"
                                    ? "bg-teal-brand text-slate-950 shadow-xs font-extrabold"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                <Search className="w-3 h-3" />
                                <span>🌐 Web Images</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setLabVisualMode("diagram")}
                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                  labVisualMode === "diagram"
                                    ? "bg-teal-brand text-slate-950 shadow-xs font-extrabold"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span>🎨 Nana Banana Pro SVG</span>
                              </button>
                            </div>
                          </div>

                          {/* MODE 1: Web Images Fetched */}
                          {labVisualMode === "web" && groundedPrototypeImages[prototypeCarouselIndex] && (
                            <div className="space-y-3">
                              {/* Main Image View */}
                              <div className="relative group rounded-xl overflow-hidden border border-black/[0.1] dark:border-slate-700 bg-slate-950 aspect-video flex items-center justify-center shadow-md">
                                <img
                                  src={groundedPrototypeImages[prototypeCarouselIndex].url}
                                  alt={groundedPrototypeImages[prototypeCarouselIndex].title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 text-white text-[9px] font-mono font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                                  <span>{groundedPrototypeImages[prototypeCarouselIndex].tag}</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setZoomedPrototypeImage(groundedPrototypeImages[prototypeCarouselIndex])}
                                  className="absolute bottom-2 right-2 bg-slate-950/80 hover:bg-slate-900 text-teal-brand px-2 py-1 rounded-lg border border-teal-brand/40 text-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer opacity-90 hover:opacity-100"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  <span>Zoom</span>
                                </button>
                              </div>

                              {/* Title & Caption */}
                              <div className="space-y-1">
                                <h5 className="text-xs font-bold text-teal-dark dark:text-slate-100 font-sans leading-tight">
                                  {groundedPrototypeImages[prototypeCarouselIndex].title}
                                </h5>
                                <p className="text-[10px] text-secondary dark:text-slate-300 font-sans leading-relaxed">
                                  {groundedPrototypeImages[prototypeCarouselIndex].caption}
                                </p>
                              </div>

                              {/* Google Search Link Button */}
                              <button
                                type="button"
                                onClick={() => window.open(groundedPrototypeImages[prototypeCarouselIndex].searchUrl, "_blank")}
                                className="w-full py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Search className="w-3 h-3" />
                                <span>Google Images Search</span>
                                <ExternalLink className="w-3 h-3 opacity-70" />
                              </button>

                              {/* Thumbnails Row */}
                              <div className="flex items-center justify-between gap-1 pt-1 border-t border-black/[0.05] dark:border-slate-800">
                                <div className="grid grid-cols-4 gap-1.5 w-full">
                                  {groundedPrototypeImages.map((img, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => setPrototypeCarouselIndex(idx)}
                                      className={`relative rounded-lg overflow-hidden border-2 aspect-video transition-all cursor-pointer ${
                                        prototypeCarouselIndex === idx
                                          ? "border-teal-brand ring-2 ring-teal-brand/30 scale-105"
                                          : "border-slate-300 dark:border-slate-700 opacity-60 hover:opacity-100"
                                      }`}
                                    >
                                      <img src={img.url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* MODE 2: Nana Banana Pro SVG Diagram Generator */}
                          {labVisualMode === "diagram" && (
                            <div className="space-y-3">
                              {/* Dynamic SVG Diagram for Software Block / STEM Lab */}
                              <div className="w-full bg-slate-950 p-3 rounded-xl border border-teal-brand/30 space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-mono text-teal-brand">
                                  <span className="font-bold flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    {identifiedSoftware ? `${identifiedSoftware} SVG Block Diagram` : "STEM Lab Vector Diagram"}
                                  </span>
                                  <span className="px-1.5 py-0.5 bg-amber-400/20 text-amber-300 rounded font-bold text-[9px]">Nana Banana SVG</span>
                                </div>

                                {/* Custom SVG Diagram rendering based on identified software */}
                                {(identifiedSoftware || "").toLowerCase().includes("scratch jr") || (identifiedSoftware || "").toLowerCase().includes("scratchjr") ? (
                                  <svg viewBox="0 0 520 120" className="w-full h-auto drop-shadow-md">
                                    <g transform="translate(10, 20)">
                                      <rect x="0" y="0" width="110" height="70" rx="12" fill="#EAB308" stroke="#CA8A04" strokeWidth="2" />
                                      <circle cx="35" cy="35" r="18" fill="#15803D" />
                                      <polygon points="30,25 30,45 45,35" fill="#FFFFFF" />
                                      <text x="62" y="40" fill="#FFFFFF" fontSize="11" fontWeight="bold">START</text>
                                    </g>
                                    <g transform="translate(130, 20)">
                                      <rect x="0" y="0" width="110" height="70" rx="12" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
                                      <path d="M 25 35 L 55 35 M 45 25 L 55 35 L 45 45" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                      <rect x="65" y="42" width="22" height="20" rx="4" fill="#FFFFFF" />
                                      <text x="72" y="56" fill="#0369A1" fontSize="12" fontWeight="bold" fontFamily="monospace">4</text>
                                    </g>
                                    <g transform="translate(250, 20)">
                                      <rect x="0" y="0" width="110" height="70" rx="12" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
                                      <path d="M 25 45 Q 40 15 55 45" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
                                      <polyline points="50,38 55,45 60,38" stroke="#FFFFFF" strokeWidth="3" fill="none" />
                                      <rect x="65" y="42" width="22" height="20" rx="4" fill="#FFFFFF" />
                                      <text x="72" y="56" fill="#15803D" fontSize="12" fontWeight="bold" fontFamily="monospace">2</text>
                                    </g>
                                    <g transform="translate(370, 20)">
                                      <rect x="0" y="0" width="130" height="70" rx="12" fill="#A855F7" stroke="#7E22CE" strokeWidth="2" />
                                      <path d="M 30 35 A 15 15 0 1 1 50 20" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />
                                      <polygon points="52,12 52,28 64,20" fill="#FFFFFF" />
                                      <text x="65" y="40" fill="#FFFFFF" fontSize="10" fontWeight="bold">REPEAT</text>
                                    </g>
                                  </svg>
                                ) : isCodingLesson ? (
                                  <svg viewBox="0 0 480 160" className="w-full h-auto drop-shadow-md">
                                    <path d="M 10 25 Q 50 10 90 25 L 260 25 C 270 25 275 30 275 35 L 275 55 C 275 60 270 65 260 65 L 40 65 C 35 65 30 70 30 75 L 10 75 Z" fill="#FFBF00" stroke="#D9A000" strokeWidth="1.5" />
                                    <text x="30" y="48" fill="#FFFFFF" fontSize="12" fontWeight="bold">when 🏁 clicked</text>
                                    
                                    <g transform="translate(10, 65)">
                                      <rect x="0" y="0" width="280" height="38" rx="6" fill="#4C97FF" stroke="#3373CC" strokeWidth="1.5" />
                                      <text x="15" y="24" fill="#FFFFFF" fontSize="12" fontWeight="bold">move</text>
                                      <rect x="60" y="9" width="30" height="20" rx="10" fill="#FFFFFF" />
                                      <text x="68" y="23" fill="#3373CC" fontSize="11" fontWeight="bold" fontFamily="monospace">10</text>
                                      <text x="100" y="24" fill="#FFFFFF" fontSize="12" fontWeight="bold">steps</text>
                                    </g>

                                    <g transform="translate(10, 108)">
                                      <rect x="0" y="0" width="280" height="38" rx="6" fill="#9966FF" stroke="#7742E6" strokeWidth="1.5" />
                                      <text x="15" y="24" fill="#FFFFFF" fontSize="12" fontWeight="bold">play sound</text>
                                      <rect x="95" y="9" width="80" height="20" rx="10" fill="#FFFFFF" />
                                      <text x="105" y="23" fill="#7742E6" fontSize="11" fontWeight="bold">"Pop" 🔊</text>
                                    </g>
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 480 150" className="w-full h-auto drop-shadow-md">
                                    <rect x="40" y="120" width="400" height="15" rx="4" fill="#334155" stroke="#475569" strokeWidth="2" />
                                    <polygon points="180,120 210,75 240,120" fill="#0D9488" stroke="#14B8A6" strokeWidth="2" />
                                    <rect x="80" y="90" width="300" height="10" rx="3" fill="#F59E0B" stroke="#D97706" strokeWidth="2" transform="rotate(-10, 210, 95)" />
                                    <rect x="75" y="55" width="30" height="30" rx="6" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
                                    <text x="81" y="74" fill="#FFFFFF" fontSize="9" fontWeight="bold">LOAD</text>
                                    <path d="M 370 30 L 370 70" stroke="#38BDF8" strokeWidth="3" strokeDasharray="4 2" />
                                    <polygon points="365,70 370,80 375,70" fill="#38BDF8" />
                                    <text x="330" y="22" fill="#38BDF8" fontSize="10" fontWeight="bold">FORCE</text>
                                  </svg>
                                )}
                              </div>

                              <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                                <strong>Nana Banana Pro Diagram:</strong> Clean, vector-scaled visual schematic customized for {lesson.handsOnActivity.title || lesson.lessonTitle}.
                              </p>

                              <button
                                type="button"
                                onClick={() => setActiveTab("nana-banana")}
                                className="w-full py-2 bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-600 hover:to-teal-600 text-slate-950 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                                <span>🎨 Generate AI Diagram with Nana Banana Pro</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Left Logistics & Checklist panel */}
                      <div className="bg-surface-0/40 dark:bg-slate-900/60 border border-black/[0.06] dark:border-slate-800 rounded-2xl p-5 space-y-4">
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

                      {/* Technical Feasibility Audit & Grounded Alternatives Section */}
                      {lesson.feasibilityAudit && (
                        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-5 space-y-4 shadow-xs relative overflow-hidden mt-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-800/80 pb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                                <ShieldAlert className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-xs font-bold font-sans uppercase text-amber-950 dark:text-amber-200 tracking-wide">
                                    Lyrah Technical Feasibility & Alternatives Audit
                                  </h4>
                                  <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 bg-amber-500/20 text-amber-900 dark:text-amber-300 rounded-full border border-amber-500/30">
                                    {lesson.feasibilityAudit.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 font-sans">
                                  Grounded evaluation of component limits, voltage/current requirements, software block logic, or physical failure risks
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Original Solution Evaluation */}
                          <div className="p-3 bg-white/80 dark:bg-slate-900/80 border border-amber-200/80 dark:border-amber-800/50 rounded-xl space-y-1">
                            <h5 className="text-[11px] font-bold font-sans text-amber-950 dark:text-amber-200 uppercase flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              Instructor Solution Evaluation
                            </h5>
                            <p className="text-xs text-amber-900 dark:text-amber-300/90 leading-relaxed font-sans">
                              {lesson.feasibilityAudit.originalSolutionEvaluation}
                            </p>
                          </div>

                          {/* Potential Failure Points */}
                          {lesson.feasibilityAudit.potentialFailurePoints && lesson.feasibilityAudit.potentialFailurePoints.length > 0 && (
                            <div className="space-y-1.5">
                              <h5 className="text-[11px] font-bold font-sans text-red-900 dark:text-red-300 uppercase flex items-center gap-1.5">
                                <span>⚠️ Potential Classroom Failure Points</span>
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {lesson.feasibilityAudit.potentialFailurePoints.map((point, pIdx) => (
                                  <div key={pIdx} className="p-2.5 bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-900 dark:text-red-200 font-sans flex items-start gap-1.5">
                                    <span className="text-red-500 font-bold shrink-0">•</span>
                                    <span className="leading-tight">{point}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommended Alternatives */}
                          {lesson.feasibilityAudit.recommendedAlternatives && lesson.feasibilityAudit.recommendedAlternatives.length > 0 && (
                            <div className="space-y-2 pt-1">
                              <h5 className="text-[11px] font-bold font-sans text-emerald-950 dark:text-emerald-300 uppercase flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                Recommended Realistic Alternatives (Grounded Solutions)
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {lesson.feasibilityAudit.recommendedAlternatives.map((alt, aIdx) => (
                                  <div key={aIdx} className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300/70 dark:border-emerald-800/60 rounded-xl space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 font-sans">{alt.title}</span>
                                      <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 rounded font-semibold">
                                        Tested Solution
                                      </span>
                                    </div>
                                    <p className="text-xs text-emerald-900 dark:text-emerald-300/90 leading-snug font-sans">
                                      {alt.description}
                                    </p>
                                    <div className="pt-1.5 text-[10px] text-emerald-800 dark:text-emerald-400 font-sans font-medium flex items-center gap-1 border-t border-emerald-200/60 dark:border-emerald-800/40 mt-1.5">
                                      <span className="font-bold uppercase text-[9px]">Why it works better:</span> {alt.whyItWorksBetter}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Safety and Troubleshooting Tips */}
                          {lesson.feasibilityAudit.safetyAndTroubleshootingTips && lesson.feasibilityAudit.safetyAndTroubleshootingTips.length > 0 && (
                            <div className="p-3 bg-slate-900/90 dark:bg-slate-950 text-slate-100 rounded-xl space-y-1.5">
                              <h5 className="text-[11px] font-bold font-sans text-teal-brand uppercase flex items-center gap-1.5">
                                <span>🛠️ Live Classroom Troubleshooting Checklist</span>
                              </h5>
                              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300 font-sans">
                                {lesson.feasibilityAudit.safetyAndTroubleshootingTips.map((tip, tIdx) => (
                                  <li key={tIdx} className="flex items-start gap-1.5 bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                                    <span className="text-teal-brand font-bold shrink-0">✓</span>
                                    <span className="leading-tight text-[11px]">{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

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
                    <NanaBananaPro 
                      lesson={lesson} 
                      onUpdateVisuals={(updatedVisuals) => {
                        setLesson(prev => ({
                          ...prev,
                          generatedVisuals: updatedVisuals
                        }));
                      }} 
                    />
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
                            <h4 className="text-xl font-display font-bold text-white">Outstanding, Team!</h4>
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
          </motion.div>
        )}
      </AnimatePresence>
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
                    <h4 className="font-display font-bold text-base text-white">Educator Pro Subscription Active</h4>
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
                    <h4 className="font-display font-bold text-base text-white">Unlock Full Educator Pro Access ($9.99/mo)</h4>
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
                  <span>{user ? 'Activate Pro Access ($9.99/mo)' : 'Sign In & Subscribe'}</span>
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
          <p>© 2026 Lyrah STEM - Immersive Lesson Plan Transformation Suite. All rights reserved.</p>
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

        {/* Lyrah Plan Preview & Confirmation Pop-Up Modal */}
        {showPlanConfirmationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl max-w-2xl w-full border border-teal-brand/40 dark:border-slate-800 overflow-hidden my-6 animate-fade-in">
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-dark via-slate-900 to-teal-dark p-6 text-white relative border-b border-teal-brand/30">
                <button
                  type="button"
                  onClick={() => setShowPlanConfirmationModal(false)}
                  className="absolute top-4 right-4 text-teal-200 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2.5 bg-teal-brand/20 border border-teal-brand/30 px-3 py-1 rounded-full text-xs font-bold text-teal-brand w-fit mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-gold-brand" />
                  <span>Lyrah AI Curriculum Alignment</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white">
                  Generation Plan & Confirmation
                </h3>
                <p className="text-xs text-teal-100/90 mt-1 font-sans leading-relaxed">
                  Lyrah analyzed your uploaded lesson plan and instructions. Review or adjust the detected age range, software platforms, and generation plan below before proceeding.
                </p>
              </div>

              <div className="p-6 space-y-5 font-sans max-h-[75vh] overflow-y-auto">
                {/* 1. Age Range / Grade Level Detection */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-dark dark:text-teal-brand uppercase tracking-wider block">
                      1. Auto-Selected Age Range / Grade Level
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-teal-brand/20 text-teal-dark dark:text-teal-brand px-2 py-0.5 rounded-md">
                      Selected: {selectedGrade === "Custom" ? (customGradeInput || "Custom") : selectedGrade}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {["K-2", "3-5", "6-8", "9-12", "Custom"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGrade(g)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedGrade === g
                            ? "bg-teal-dark dark:bg-teal-brand text-white dark:text-slate-950 border-teal-brand shadow-2xs"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-teal-brand"
                        }`}
                      >
                        {g === "K-2" ? "K-2 (Ages 5-7)" : g === "3-5" ? "3-5 (Ages 8-10)" : g === "6-8" ? "6-8 (Ages 11-13)" : g === "9-12" ? "9-12 (Ages 14-18)" : "Custom"}
                      </button>
                    ))}
                  </div>
                  {selectedGrade === "Custom" && (
                    <input
                      type="text"
                      placeholder="Specify custom age or grade (e.g., Pre-K, Adults)"
                      value={customGradeInput}
                      onChange={(e) => setCustomGradeInput(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-teal-brand/40 rounded-xl bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-brand"
                    />
                  )}
                </div>

                {/* 2. Software & Platform / Domain Category Selection */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-dark dark:text-teal-brand uppercase tracking-wider block">
                      2. Domain & Available Software / Platforms
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/30">
                      Domain: {selectedCategory}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {["Gaming", "Software", "Circuitry", "Technology", "Engineering", "Art", "Math", "Science"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? "bg-slate-900 text-white border-slate-700 shadow-2xs"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-brand"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Software options */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">Detected Software & Tools:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentSupplyOptions.map((opt) => {
                        const isSelected = selectedSupplies.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleSupply(opt.id)}
                            className={`text-xs px-2.5 py-1.5 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-teal-dark dark:bg-teal-brand text-white dark:text-slate-950 border-teal-brand"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-brand"
                            }`}
                          >
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-teal-brand dark:text-slate-950 font-bold" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Generated Instruction Directive */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-teal-dark dark:text-teal-brand uppercase tracking-wider block">
                    3. Generated Instruction Directive
                  </span>
                  <textarea
                    value={customPreferences}
                    onChange={(e) => {
                      setCustomPreferences(e.target.value);
                      setIsManuallyEdited(true);
                    }}
                    className="w-full bg-white dark:bg-slate-900 p-3 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-teal-dark dark:text-teal-brand font-medium focus:ring-2 focus:ring-teal-brand focus:outline-none min-h-[70px]"
                    placeholder="Edit instruction directives for Lyrah..."
                  />
                </div>

                {/* 4. Planned Deliverables Summary */}
                <div className="p-4 bg-teal-50/60 dark:bg-teal-brand/10 rounded-2xl border border-teal-brand/30 space-y-2">
                  <span className="text-xs font-bold text-teal-dark dark:text-teal-brand uppercase tracking-wider block">
                    4. Planned Lyrah Deliverables
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-200 font-sans">
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <Layers className="w-4 h-4 text-teal-brand shrink-0" />
                      <span>5 Interactive Teaching Slides</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <Terminal className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{selectedCategory === "Software" ? "Coding Blocks" : "Hands-On Lab"}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <HelpIcon className="w-4 h-4 text-sky-500 shrink-0" />
                      <span>Interactive Smartboard Quiz</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <Video className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Media & Resource Audit Fixer</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlanConfirmationModal(false);
                      handleProcessLesson(true);
                    }}
                    className="flex-1 py-3.5 px-5 bg-gradient-to-r from-teal-dark to-slate-900 hover:from-slate-900 hover:to-teal-dark text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-teal-brand/40 micro-glow-teal"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>🚀 Confirm & Generate Lesson Plan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPlanConfirmationModal(false)}
                    className="py-3.5 px-5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    ✏️ Adjust Inputs in Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Sparkle Icon for Lyrah AI Co-Teacher Popup */}
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
                  <div className="w-8 h-8 rounded-xl bg-teal-brand/20 border border-teal-brand/40 flex items-center justify-center p-0.5 shrink-0">
                    <LyraMark className="w-full h-full text-teal-brand" showLines={false} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-sans uppercase tracking-wide">Lyrah AI Co-Teacher</h3>
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
            <div className="w-6 h-6 rounded-full bg-teal-brand/20 border border-amber-300/60 shrink-0 p-0.5 flex items-center justify-center">
              <LyraMark className="w-full h-full text-teal-brand" showLines={false} />
            </div>
            <span className="font-sans font-bold text-xs pr-0.5">
              {copilotOpen ? "Close Lyrah AI" : "Ask Lyrah AI"}
            </span>
            {!copilotOpen && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
              </span>
            )}
          </button>
        </div>

        {/* Zoomed Lightbox Modal for Grounded Prototype Images */}
        {zoomedPrototypeImage && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-5 space-y-4 shadow-2xl relative">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-sky-400" />
                  <h4 className="text-sm font-bold text-white font-sans">{zoomedPrototypeImage.title}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setZoomedPrototypeImage(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center relative">
                <img
                  src={zoomedPrototypeImage.url}
                  alt={zoomedPrototypeImage.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{zoomedPrototypeImage.caption}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-2.5 py-1 rounded-full border border-sky-800">
                    Tag: {zoomedPrototypeImage.tag}
                  </span>
                  <button
                    type="button"
                    onClick={() => window.open(zoomedPrototypeImage.searchUrl, "_blank")}
                    className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Similar Build Examples on Google</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
