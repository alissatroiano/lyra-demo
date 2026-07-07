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
  Save
} from "lucide-react";
import { PRELOADED_LESSONS } from "./data/preloadedLessons";
import { INITIAL_PROCESSED_LESSON } from "./data/initialProcessedLesson";
import { ProcessedLesson, PreloadedLesson } from "./types";
import { useFirebase } from "./context/FirebaseContext";
import VideoLab from "./components/VideoLab";
import SoundStudio from "./components/SoundStudio";
import InteractiveSlideshow from "./components/InteractiveSlideshow";

// Vector Robot Bunny Mascot SVG
const RobotBunnyMascot = ({ className = "w-28 h-28" }: { className?: string }) => (
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
  const [lesson, setLesson] = useState<ProcessedLesson>(INITIAL_PROCESSED_LESSON);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"slides" | "video" | "sound-studio" | "lab" | "worksheet" | "quiz" | "media">("slides");
  
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

  // Interactive Chip parameters state (for easy configuration)
  const [selectedGrade, setSelectedGrade] = useState<string>("Middle (6-8)");
  const [selectedSize, setSelectedSize] = useState<string>("15-20 kids");
  const [selectedDuration, setSelectedDuration] = useState<string>("60 mins");
  const [selectedTech, setSelectedTech] = useState<string>("Smart Board");

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

  // Append parameters helper when chips are changed (only if not manually edited)
  useEffect(() => {
    if (!isManuallyEdited) {
      const specs = `Tailor for ${selectedGrade} grade, class size of ${selectedSize}, duration of ${selectedDuration}, with ${selectedTech} available.`;
      setCustomPreferences(specs);
    }
  }, [selectedGrade, selectedSize, selectedDuration, selectedTech, isManuallyEdited]);

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
    const specs = `Tailor for ${selectedGrade} grade, class size of ${selectedSize}, duration of ${selectedDuration}, with ${selectedTech} available.`;
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

  // Call server-side backend API to process lesson using Gemini
  const handleProcessLesson = async () => {
    setIsLoading(true);
    setError(null);
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
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || 
        "Something went wrong while communicating with Gemini. Please check your network connection or API Key."
      );
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-surface-0 text-primary flex flex-col antialiased">
      {/* Centered column wrapper matching the layout width */}
      <div className="w-full max-w-[840px] mx-auto bg-white min-h-screen shadow-xs border-x border-slate-200/60 flex flex-col pb-16">
        
        {/* Navigation Bar (ly-nav) */}
        <nav className="px-6 py-4.5 border-b border-black/[0.09] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mascot in mini logo format */}
            <div className="w-9 h-9 rounded-xl bg-teal-light flex items-center justify-center shrink-0 border border-teal-brand/30">
              <Sparkles className="w-5 h-5 text-teal-brand" />
            </div>
            <div>
              <span className="font-serif text-2xl font-semibold tracking-tight text-teal-dark">
                Lyra<span className="text-teal-brand font-sans">.</span>
              </span>
              <p className="text-[10px] text-secondary font-sans tracking-wide leading-none">Afterschool STEM Copilot</p>
            </div>
          </div>

          {/* Nav Links / Active Auth badge */}
          <div className="flex items-center gap-3">
            {authLoading ? (
              <div className="w-5 h-5 border-2 border-teal-brand border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-2 bg-surface-1 p-1 pr-3 rounded-full border border-black/[0.05] shadow-3xs text-xs">
                {user.photoURL ? (
                  <img referrerPolicy="no-referrer" src={user.photoURL} alt={user.displayName || 'Educator'} className="w-6.5 h-6.5 rounded-full object-cover border border-teal-brand/20" />
                ) : (
                  <div className="w-6.5 h-6.5 rounded-full bg-teal-dark text-white flex items-center justify-center font-bold text-[10px]">
                    {user.displayName?.[0]?.toUpperCase() || 'E'}
                  </div>
                )}
                <span className="font-sans font-medium text-teal-dark max-w-[80px] truncate">{user.displayName?.split(" ")[0]}</span>
                <button
                  type="button"
                  onClick={logOut}
                  className="ml-1 text-[10px] text-red-600 hover:text-red-700 font-bold transition-all px-1.5 py-0.5 rounded-md hover:bg-red-50"
                  title="Sign Out"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="px-3.5 py-1.5 bg-teal-dark hover:bg-opacity-95 text-white rounded-full text-xs font-bold transition-all shadow-3xs flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-brand" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </nav>

        {/* Hero Section (ly-hero) */}
        <header className="px-6 sm:px-8 py-10 relative overflow-hidden bg-gradient-to-b from-teal-light/20 to-transparent border-b border-black/[0.04]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-brand/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-lg">
              <span className="inline-block text-[10px] font-bold tracking-widest text-gold-brand uppercase font-sans">
                XPRIZE · Education & Human Potential
              </span>
              <h1 className="font-serif text-3.5xl sm:text-4xl font-bold tracking-tight text-primary leading-tight">
                Your AI copilot for <span className="text-teal-dark underline decoration-teal-brand/40 underline-offset-4">STEM lesson prep</span>
              </h1>
              <p className="text-sm text-secondary leading-relaxed font-sans font-normal">
                Lyra turns long, messy science articles and PDF textbooks into beautiful interactive slide decks, hands-on lab guides, printable worksheets, and broken media link backups instantly.
              </p>
            </div>

            {/* Mascot float wrap on the right */}
            <div className="self-center md:self-auto shrink-0 bg-teal-light/40 border border-teal-brand/10 rounded-2xl p-4 shadow-3xs animate-float">
              <RobotBunnyMascot className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>
          </div>

          {/* Interactive Core Intake Controller (ly-upload-zone) */}
          <div className="mt-8 bg-white border border-black/[0.12] rounded-2xl p-6 shadow-sm space-y-5" id="intake-panel">
            
            {/* Step Header */}
            <div className="flex justify-between items-center border-b border-black/[0.06] pb-3">
              <span className="text-[10px] font-bold font-mono tracking-wider text-teal-brand uppercase bg-teal-light px-2.5 py-0.5 rounded-md">
                1. Upload Curriculum Material
              </span>
              <span className="text-xs font-semibold text-secondary font-sans flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-gold-brand" />
                Configuration
              </span>
            </div>

            {/* Selection of transformation goal with high fidelity toggle buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-teal-dark block font-sans">Pedagogical Goal Option:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTransformationGoal("gamify")}
                  className={`p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 cursor-pointer ${
                    transformationGoal === "gamify"
                      ? "border-teal-brand bg-teal-light/20 text-teal-dark shadow-3xs"
                      : "border-black/[0.08] hover:border-black/[0.18] text-secondary hover:text-primary"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    transformationGoal === "gamify" ? "bg-teal-brand border-teal-brand text-white" : "border-black/[0.15] bg-white"
                  }`}>
                    {transformationGoal === "gamify" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold font-sans">Gamify Lesson Plan</p>
                    <p className="text-[10px] text-secondary leading-normal font-sans">Inserts competitive trivia, student led roles, and hands-on laboratory games.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTransformationGoal("presentation")}
                  className={`p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 cursor-pointer ${
                    transformationGoal === "presentation"
                      ? "border-teal-brand bg-teal-light/20 text-teal-dark shadow-3xs"
                      : "border-black/[0.08] hover:border-black/[0.18] text-secondary hover:text-primary"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    transformationGoal === "presentation" ? "bg-teal-brand border-teal-brand text-white" : "border-black/[0.15] bg-white"
                  }`}>
                    {transformationGoal === "presentation" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold font-sans">Create Highly Visual Presentation</p>
                    <p className="text-[10px] text-secondary leading-normal font-sans">Focuses on comprehensive slides, teaching analogies, and deep topic guides.</p>
                  </div>
                </button>
              </div>
            </div>

            {/* PDF / Docx File Dropzone (ly-upload-zone) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-teal-dark block font-sans">Upload your file (PDF, DOCX, TXT):</label>
              
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
                    ? "border-teal-brand bg-teal-light/30" 
                    : "border-black/[0.12] hover:border-black/[0.22] bg-surface-0/50 hover:bg-surface-0"
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
                      <p className="text-xs font-bold text-primary font-sans">Reading file securely...</p>
                      <p className="text-[10px] text-secondary font-sans mt-0.5">Running AI curriculum text parser</p>
                    </div>
                  </div>
                ) : uploadedFileName ? (
                  <div className="bg-white px-4 py-3 rounded-xl border border-teal-brand/30 flex items-center gap-3 shadow-3xs max-w-sm mx-auto">
                    <div className="w-8 h-8 rounded-lg bg-teal-light flex items-center justify-center text-teal-brand shrink-0">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-bold text-primary truncate max-w-[180px] font-sans">{uploadedFileName}</p>
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
                      className="p-1 text-secondary hover:text-red-600 hover:bg-red-50 rounded-md transition-all shrink-0 ml-2"
                      title="Clear file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-teal-light flex items-center justify-center text-teal-brand shrink-0 shadow-3xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary font-sans">
                        Drag & drop your file here, or <span className="text-teal-brand underline decoration-teal-brand/30">click to browse</span>
                      </p>
                      <p className="text-[10px] text-secondary leading-relaxed mt-0.5 font-sans">
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
                <label className="text-xs font-bold text-teal-dark font-sans">Curriculum Text Material:</label>
                {customContent && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomContent("");
                      setUploadedFileName(null);
                    }}
                    className="text-[10px] text-red-600 hover:underline font-medium"
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
                className="w-full text-xs p-3.5 border border-black/[0.12] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-brand/10 focus:border-teal-brand font-mono bg-surface-0/40 text-primary leading-relaxed"
              />

              {/* Sample preloaded pills styled cleanly */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-secondary font-sans">Load Quick Samples:</span>
                {PRELOADED_LESSONS.map((preload) => (
                  <button
                    key={preload.id}
                    type="button"
                    onClick={() => {
                      setCustomContent(preload.rawContent);
                      setUploadedFileName(`preset_${preload.id}.txt`);
                      handleQuickDemoFill(preload.id);
                    }}
                    className="text-[10px] font-bold text-teal-dark bg-teal-light/40 hover:bg-teal-light hover:text-teal-brand border border-teal-brand/10 px-2.5 py-0.5 rounded-full transition-all cursor-pointer"
                  >
                    {preload.id === "rocketry" ? "Rocket Physics" : preload.id === "bridges" ? "Bridge Static" : "Electromagnetism"}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive chip context rows (Appends parameters directly) */}
            <div className="bg-surface-0 border border-black/[0.05] rounded-xl p-4.5 space-y-4">
              <span className="text-[10px] font-bold font-mono tracking-widest text-teal-brand uppercase block border-b pb-1.5">
                Target Classroom Parameters (Auto-Configurator)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Grade */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-secondary uppercase font-sans">Grade Level</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Elementary (3-5)", "Middle (6-8)", "High School (9-12)"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSelectedGrade(val)}
                        className={`text-[10px] px-2 py-1 rounded-md font-sans font-bold transition-all ${
                          selectedGrade === val 
                            ? "bg-teal-dark text-white" 
                            : "bg-white text-secondary border border-black/[0.08]"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tech level */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-secondary uppercase font-sans">Technology Available</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Smart Board", "Chromebooks", "Low Tech (Paper Only)"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSelectedTech(val)}
                        className={`text-[10px] px-2 py-1 rounded-md font-sans font-bold transition-all ${
                          selectedTech === val 
                            ? "bg-teal-dark text-white" 
                            : "bg-white text-secondary border border-black/[0.08]"
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
                  <span className="text-[10px] font-bold text-secondary uppercase font-sans block">
                    Generated Instruction Directive
                  </span>
                  
                  {/* Controls */}
                  <div className="flex gap-2">
                    {isManuallyEdited && (
                      <button
                        type="button"
                        onClick={handleAutoGenerateFromChips}
                        className="text-[9px] text-teal-brand hover:text-teal-dark font-sans font-bold flex items-center gap-0.5 cursor-pointer"
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
                        className="text-[9px] text-teal-brand hover:text-teal-dark font-sans font-bold flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                        title="Save these instruction preferences to your profile permanently"
                      >
                        {profileSaveSuccess ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-teal-dark font-bold" />
                            <span className="text-teal-dark">Saved!</span>
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
                    className="w-full bg-white p-3 border border-black/[0.08] rounded-xl text-[11px] font-mono text-teal-dark font-medium focus:outline-none focus:ring-2 focus:ring-teal-brand/10 focus:border-teal-brand transition-all resize-y min-h-[70px]"
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

            {/* Action CTA Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProcessLesson}
                disabled={isLoading || !customContent.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-teal-dark hover:bg-opacity-95 text-white text-xs font-bold font-sans transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                id="generate-lesson-btn"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-teal-brand" />
                    <span>Gemini Assembly Engine Orchestrating STEM Pack...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-teal-brand" />
                    <span>Generate Classroom Materials (AI Transform)</span>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2 text-red-950 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold">Gemini API Connection Note</span>
                    <p className="text-[10px] text-slate-700 font-sans leading-normal">{error}</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Cloud Saved Lessons and Active Workspace Column Stack */}
        <section className="px-6 sm:px-8 py-8 space-y-8 flex-1">
          
          {/* Saved Lessons (If authenticated & populated) */}
          {user && savedLessons.length > 0 && (
            <div className="bg-surface-0 border border-black/[0.06] rounded-2xl p-5 space-y-3.5">
              <div className="flex justify-between items-center border-b border-black/[0.05] pb-2">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-gold-brand" />
                  <span className="font-serif text-lg font-bold text-teal-dark">Your Saved STEM Lesson Plans</span>
                </div>
                <span className="text-[9px] font-mono text-secondary uppercase tracking-wider">Loaded from Cloud Firestore</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedLessons.map((saved) => (
                  <div 
                    key={saved.id}
                    className="p-3.5 rounded-xl border border-black/[0.06] bg-white hover:border-teal-brand/40 transition-all flex justify-between items-center gap-3 shadow-3xs"
                  >
                    <div className="overflow-hidden flex-1 space-y-0.5">
                      <p className="text-xs font-bold text-primary truncate">{saved.lessonTitle}</p>
                      <span className="text-[10px] text-secondary font-sans block">{saved.duration} Block</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setLesson(saved);
                          setActiveTab("slides");
                        }}
                        className="px-2.5 py-1 bg-teal-light text-teal-brand hover:bg-teal-brand hover:text-white rounded-lg text-[10px] font-bold transition-all shadow-3xs cursor-pointer"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Delete "${saved.lessonTitle}"?`)) {
                            try {
                              await deleteLessonFromCloud(saved.id);
                            } catch (err: any) {
                              alert("Failed: " + err.message);
                            }
                          }
                        }}
                        className="p-1.5 hover:bg-red-50 text-secondary hover:text-red-600 rounded-lg transition-all cursor-pointer"
                        title="Delete Lesson"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Lesson Meta Display */}
          <div className="bg-white border border-black/[0.12] rounded-2xl p-6 shadow-xs relative overflow-hidden" id="workspace-panel">
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-teal-light/20 to-transparent rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.06] pb-4 mb-4 z-10 relative">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-teal-brand bg-teal-light border border-teal-brand/10 px-2.5 py-0.5 rounded-full uppercase">
                    Active Curriculum Suite
                  </span>
                  <span className="text-xs text-secondary font-sans flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gold-brand" />
                    {lesson.duration} Block
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-teal-dark">
                  {lesson.lessonTitle}
                </h2>
                <p className="text-xs text-secondary leading-relaxed font-sans max-w-xl">
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
                    className="px-4.5 py-2.5 bg-teal-dark hover:bg-opacity-95 text-white rounded-xl text-xs font-bold shadow-3xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Cloud className="w-4 h-4 text-teal-brand" />
                    {dbLoading ? 'Saving...' : 'Save to Cloud'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="px-3.5 py-2 bg-white hover:bg-surface-0 text-secondary border border-black/[0.08] rounded-xl text-xs font-bold shadow-3xs flex items-center justify-center gap-2 transition-all cursor-pointer"
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

            {/* Horizontal Resource Pills Tabs */}
            <div className="flex border border-black/[0.06] overflow-x-auto gap-1 bg-surface-0 p-1.5 rounded-xl mb-6 font-sans">
              {[
                { id: "slides", label: "Interactive Slides", icon: Layers },
                { id: "video", label: "Video Lab (Veo)", icon: Video },
                { id: "sound-studio", label: "Sound Studio (Lyria)", icon: Music },
                { id: "lab", label: "Hands-On Lab", icon: Activity },
                { id: "worksheet", label: "Printable Worksheet", icon: FileText },
                { id: "quiz", label: "Smartboard Quiz", icon: HelpCircle },
                { id: "media", label: "Media Fixer", icon: Link2Off }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-teal-dark text-white shadow-3xs"
                        : "text-secondary hover:text-primary hover:bg-white/[0.6]"
                    }`}
                    id={`tab-${tab.id}`}
                  >
                    <TabIcon className={`w-4 h-4 ${isSelected ? "text-teal-brand" : "text-secondary"}`} />
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

                {/* TAB: Video Lab (Veo) */}
                {activeTab === "video" && (
                  <motion.div
                    key="tab-video-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6 animate-fade-in"
                  >
                    <VideoLab 
                      lesson={lesson} 
                      onTriggerPaidFlow={() => {
                        console.log("Triggering Paid Model flow via AI Studio build...");
                        alert("Paid API Key selection dialog opened in your AI Studio build console. Please verify the active model settings.");
                      }} 
                    />
                  </motion.div>
                )}

                {/* TAB: Sound Studio (Lyria) */}
                {activeTab === "sound-studio" && (
                  <motion.div
                    key="tab-sound-studio-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6 animate-fade-in"
                  >
                    <SoundStudio 
                      lesson={lesson} 
                      onTriggerPaidFlow={() => {
                        console.log("Triggering Paid Model flow via AI Studio build...");
                        alert("Paid API Key selection dialog opened in your AI Studio build console. Please verify the active model settings.");
                      }} 
                    />
                  </motion.div>
                )}

                {/* TAB 2: Hands-On Lab */}
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
                    <div className="md:col-span-5 bg-surface-0/40 border border-black/[0.06] rounded-2xl p-5 space-y-4">
                      <div className="border-b border-black/[0.05] pb-3">
                        <span className="text-[9px] font-mono font-bold text-secondary uppercase tracking-wider block">PRE-CLASS LOGISTICS</span>
                        <h4 className="text-sm font-bold text-teal-dark font-sans">Lab Bin Materials</h4>
                      </div>

                      <div className="space-y-2">
                        {lesson.handsOnActivity.materials.map((material, idx) => (
                          <button
                            key={idx}
                            onClick={() => toggleMaterial(material)}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              checkedMaterials[material]
                                ? "bg-teal-light/20 border-teal-brand/30 text-teal-dark"
                                : "bg-white border-black/[0.05] text-secondary hover:bg-surface-0"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                              checkedMaterials[material]
                                ? "bg-teal-brand border-teal-brand text-white"
                                : "border-black/[0.15] bg-white"
                            }`}>
                              {checkedMaterials[material] && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                            </div>
                            <span className="text-xs font-sans font-medium leading-tight">{material}</span>
                          </button>
                        ))}
                      </div>

                      <div className="p-3 bg-teal-light/20 border border-teal-brand/10 rounded-xl text-[10px] text-teal-dark leading-relaxed font-sans flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-brand shrink-0 mt-0.5" />
                        <div>
                          <strong>Check bins off</strong> to streamline pre-class preparation. Designed for simple classroom storage management.
                        </div>
                      </div>
                    </div>

                    {/* Right experimental protocol panel */}
                    <div className="md:col-span-7 space-y-4">
                      <div className="bg-white border border-black/[0.08] rounded-2xl p-5.5 space-y-5">
                        <div className="flex justify-between items-start border-b border-black/[0.05] pb-3">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-mono font-bold text-secondary uppercase">Step-by-step Experiment</span>
                            <h4 className="text-base font-bold text-primary font-sans">{lesson.handsOnActivity.title}</h4>
                          </div>
                          <span className="px-2.5 py-0.5 bg-teal-dark text-white text-[9px] font-mono font-bold rounded-lg uppercase">
                            STUDENT LED
                          </span>
                        </div>

                        {/* Steps List */}
                        <div className="space-y-4">
                          {lesson.handsOnActivity.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-3.5 items-start">
                              <span className="w-6 h-6 rounded-lg bg-surface-1 border border-black/[0.05] flex items-center justify-center text-xs font-bold text-secondary shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-xs text-secondary leading-relaxed font-sans pt-0.5 font-normal">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Scientific Principle display box */}
                      <div className="bg-teal-dark text-white rounded-2xl p-5.5 space-y-2.5 relative overflow-hidden shadow-xs">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-brand/10 rounded-full blur-xl pointer-events-none" />
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-teal-brand" />
                          <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-light">The Scientific Catalyst Behind the Lab</h5>
                        </div>
                        <p className="text-xs text-teal-light/95 leading-relaxed font-sans">
                          {lesson.handsOnActivity.scientificPrinciple}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 3: Printable Worksheet */}
                {activeTab === "worksheet" && (
                  <motion.div
                    key="tab-worksheet-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 animate-fade-in"
                  >
                    {/* Simulated paper sheet block */}
                    <div className="bg-white border border-black/[0.12] rounded-2xl p-6 sm:p-8 shadow-3xs space-y-6 relative overflow-hidden" id="worksheet-to-print">
                      
                      {/* Name/Date lines */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-dashed border-black/[0.1] pb-5">
                        <div className="space-y-1">
                          <h3 className="font-serif text-lg font-bold text-teal-dark">{lesson.worksheet.title}</h3>
                          <p className="text-xs text-secondary font-sans leading-relaxed">{lesson.worksheet.instructions}</p>
                        </div>
                        
                        <div className="flex gap-4 text-[10px] font-mono text-secondary shrink-0 w-full sm:w-auto">
                          <div className="border-b border-black/[0.15] flex-1 sm:flex-initial sm:w-36 pb-1">
                            <span>NAME: </span>
                          </div>
                          <div className="border-b border-black/[0.15] w-24 pb-1">
                            <span>DATE: </span>
                          </div>
                        </div>
                      </div>

                      {/* Question list */}
                      <div className="space-y-6 py-2">
                        {lesson.worksheet.questions.map((question, idx) => (
                          <div key={question.id} className="space-y-3">
                            <div className="flex items-start gap-2.5">
                              <span className="font-mono font-bold text-teal-dark bg-teal-light border border-teal-brand/10 px-2.5 py-0.5 rounded-md text-[10px] mt-0.5 shrink-0">
                                {question.id}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-primary leading-snug">
                                {question.questionText}
                              </span>
                              <span className="text-[9px] font-mono text-secondary bg-surface-1 border border-black/[0.04] px-2 py-0.5 rounded ml-auto shrink-0 select-none">
                                {question.answerType}
                              </span>
                            </div>

                            {/* MC Choices if present */}
                            {question.options && question.options.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                                {question.options.map((option, optIdx) => (
                                  <div key={optIdx} className="flex items-center gap-2.5 p-2 bg-surface-0/60 border border-black/[0.04] rounded-xl text-xs text-secondary font-sans">
                                    <div className="w-4 h-4 rounded-full border border-black/[0.15] bg-white shrink-0" />
                                    <span>{option}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              /* Lined box for long-form responses */
                              <div className="pl-9 space-y-2">
                                <div className="h-6 border-b border-black/[0.06]" />
                                <div className="h-6 border-b border-black/[0.06]" />
                              </div>
                            )}

                            {/* Instructor key overlay */}
                            {showSampleAnswers && (
                              <div className="mt-2.5 ml-9 p-3 bg-teal-light/20 border border-teal-brand/10 rounded-xl text-xs text-teal-dark flex gap-2">
                                <span className="font-bold font-mono uppercase text-teal-brand select-none">Instructor Key:</span>
                                <p className="font-sans font-medium">{question.sampleAnswer}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Print PDF Actions Footer */}
                      <div className="border-t border-black/[0.05] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-[9px] font-mono text-secondary">Ages 6-14 · Resources generated via Lyra</span>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowSampleAnswers(!showSampleAnswers)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              showSampleAnswers
                                ? "bg-teal-light/30 border-teal-brand/20 text-teal-brand"
                                : "bg-white border-black/[0.08] text-secondary hover:bg-surface-0"
                            }`}
                            id="toggle-answers-btn"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{showSampleAnswers ? "Hide Answer Key" : "Show Answer Key"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-dark hover:bg-opacity-95 text-white border border-teal-dark rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer"
                            id="print-worksheet-btn"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print PDF Worksheet</span>
                          </button>
                        </div>
                      </div>

                    </div>
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
                    className="space-y-4 animate-fade-in"
                  >
                    <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-3xs flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                        <Link2Off className="w-5.5 h-5.5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-teal-dark uppercase font-sans">Prevent "404 Broken Link" Disruption</h4>
                        <p className="text-xs text-secondary leading-relaxed font-sans font-normal">
                          Afterschool STEM lessons are notorious for carrying outdated links or broken intranet URLs. 
                          <strong> Lyra</strong> detects these dead ends and suggests high-yield fallback searches.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {lesson.mediaRecommendations.map((rec, idx) => (
                        <div key={idx} className="bg-surface-0/50 border border-black/[0.06] rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-teal-brand/30 transition-all">
                          <div className="space-y-3">
                            <span className="px-2.5 py-0.5 bg-red-50 border border-red-100 text-[9px] font-bold text-red-800 rounded-full inline-block font-sans uppercase">
                              Replaces Dead {rec.resourceType}
                            </span>
                            
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
                            <span>Ready-to-use Backup</span>
                            <button
                              onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(rec.suggestedSearchQuery)}`, "_blank")}
                              className="text-teal-brand hover:underline font-bold flex items-center gap-0.5"
                            >
                              <span>Google Search</span>
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

          {/* Pain Points (ly-pain) */}
          <div className="border-t border-black/[0.05] pt-10 space-y-6" id="pain-points-section">
            <div className="text-center space-y-1.5">
              <span className="text-[10px] font-bold text-gold-brand uppercase tracking-widest font-sans">The Afterschool Struggle</span>
              <h3 className="font-serif text-2xl font-bold text-teal-dark">STEM curriculum is broken by default</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-0 border border-black/[0.05] rounded-2xl p-5 space-y-2">
                <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal-brand shrink-0">
                  <Link2Off className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs font-bold text-teal-dark uppercase font-sans">The "404 Broken Link" Trap</h4>
                <p className="text-xs text-secondary leading-relaxed font-sans">
                  Instructors frequently run into dead intranet references or private videos right as class starts, wasting precious interactive teaching cycles.
                </p>
              </div>

              <div className="bg-surface-0 border border-black/[0.05] rounded-2xl p-5 space-y-2">
                <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal-brand shrink-0">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs font-bold text-teal-dark uppercase font-sans">Dense Text Overwhelm</h4>
                <p className="text-xs text-secondary leading-relaxed font-sans">
                  Standard curriculum is dry and paragraph-heavy, making it very difficult for kids to stay engaged during afterschool hours.
                </p>
              </div>
            </div>
          </div>

          {/* Transformation Pipeline */}
          <div className="bg-teal-dark text-white rounded-2xl p-6.5 space-y-4 text-center relative overflow-hidden" id="pipeline-section">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-brand/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-teal-brand uppercase tracking-widest">HOW LYRA TRANSFORMS LESSONS</span>
              <h3 className="font-serif text-xl font-bold text-teal-light">The Interactive Pipeline</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-left">
              <div className="bg-black/[0.15] p-4 rounded-xl border border-white/[0.05] space-y-1">
                <span className="text-[10px] font-mono text-teal-brand block font-bold">STAGE 01</span>
                <h5 className="text-xs font-bold font-sans">Raw Curriculum Intake</h5>
                <p className="text-[10px] text-teal-light/80 leading-relaxed font-sans">Drop standard textbooks, plain articles, or raw outlines into the parser.</p>
              </div>

              <div className="bg-black/[0.15] p-4 rounded-xl border border-white/[0.05] space-y-1">
                <span className="text-[10px] font-mono text-teal-brand block font-bold">STAGE 02</span>
                <h5 className="text-xs font-bold font-sans">AI Alignment Engine</h5>
                <p className="text-[10px] text-teal-light/80 leading-relaxed font-sans">Gemini restructures text into active gamified modules tailored for specific age groups.</p>
              </div>

              <div className="bg-black/[0.15] p-4 rounded-xl border border-white/[0.05] space-y-1">
                <span className="text-[10px] font-mono text-teal-brand block font-bold">STAGE 03</span>
                <h5 className="text-xs font-bold font-sans">Multi-Channel Outputs</h5>
                <p className="text-[10px] text-teal-light/80 leading-relaxed font-sans">Instantly yields slides, experimental guides, printable sheets, and quiz modules.</p>
              </div>
            </div>
          </div>

          {/* Camp Metrics (ly-metrics) */}
          <div className="border-t border-black/[0.05] pt-10 space-y-6" id="metrics-section">
            <div className="text-center space-y-1.5">
              <span className="text-[10px] font-bold text-gold-brand uppercase tracking-widest font-sans">PROVEN PEDAGOGICAL METRICS</span>
              <h3 className="font-serif text-2xl font-bold text-teal-dark">Curriculum Efficiency Accomplished</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-surface-0 border border-black/[0.04] p-5.5 rounded-2xl space-y-1 shadow-3xs">
                <span className="font-serif text-3.5xl font-bold text-teal-brand block leading-none">14,200+</span>
                <span className="text-[10px] font-bold text-teal-dark uppercase font-sans tracking-wide">Instructor Hours Saved</span>
                <p className="text-[10px] text-secondary font-sans leading-normal">Unpaid prep time reduced to zero.</p>
              </div>

              <div className="bg-surface-0 border border-black/[0.04] p-5.5 rounded-2xl space-y-1 shadow-3xs">
                <span className="font-serif text-3.5xl font-bold text-teal-brand block leading-none">250+</span>
                <span className="text-[10px] font-bold text-teal-dark uppercase font-sans tracking-wide">Schools & Camps</span>
                <p className="text-[10px] text-secondary font-sans leading-normal">Active deployments across regions.</p>
              </div>

              <div className="bg-surface-0 border border-black/[0.04] p-5.5 rounded-2xl space-y-1 shadow-3xs">
                <span className="font-serif text-3.5xl font-bold text-teal-brand block leading-none">$0</span>
                <span className="text-[10px] font-bold text-teal-dark uppercase font-sans tracking-wide">District Friction</span>
                <p className="text-[10px] text-secondary font-sans leading-normal">Fully offline/cloud hybrid compatible.</p>
              </div>
            </div>
          </div>

          {/* Pricing Plans (ly-pricing) */}
          <div className="border-t border-black/[0.05] pt-10 space-y-6" id="pricing-section">
            <div className="text-center space-y-1.5">
              <span className="text-[10px] font-bold text-gold-brand uppercase tracking-widest font-sans">PILOT LAUNCH SUBSCRIPTIONS</span>
              <h3 className="font-serif text-2xl font-bold text-teal-dark">Priced for real afterschool districts</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl mx-auto">
              {/* Plan 1 */}
              <div className="bg-white border border-black/[0.12] rounded-2xl p-5.5 space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest block bg-surface-1 py-0.5 px-2.5 rounded inline-block">SUMMER PILOT</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-3.5xl font-bold text-teal-dark">$499</span>
                    <span className="text-xs text-secondary font-sans">/ district</span>
                  </div>
                  <p className="text-[11px] text-secondary leading-relaxed font-sans font-normal">
                    Up to 5 campuses, 20 active instructors, fully unlimited AI transformations with Firestore saving.
                  </p>
                </div>
                <div className="border-t border-black/[0.04] pt-3 mt-2 flex items-center justify-between text-[10px] text-teal-brand font-bold font-sans">
                  <span>Enquire for Pilot</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Plan 2 */}
              <div className="bg-teal-dark text-white rounded-2xl p-5.5 space-y-4 relative overflow-hidden flex flex-col justify-between shadow-xs">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-brand/10 rounded-full blur-xl" />
                <div className="space-y-1.5 relative z-10">
                  <span className="text-[9px] font-mono font-bold text-teal-brand uppercase tracking-widest block bg-black/[0.15] py-0.5 px-2.5 rounded inline-block">DISTRICT CORE</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-3.5xl font-bold text-teal-light">$1,299</span>
                    <span className="text-xs text-teal-light/70 font-sans">/ year</span>
                  </div>
                  <p className="text-[11px] text-teal-light/80 leading-relaxed font-sans font-normal">
                    Complete multi-campus sync, custom curriculum templates, standard alignment scoring, and VIP support.
                  </p>
                </div>
                <div className="border-t border-white/[0.08] pt-3 mt-2 flex items-center justify-between text-[10px] text-teal-brand font-bold font-sans relative z-10">
                  <span>Request Full Access</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* 90-Day Launch Roadmap */}
          <div className="border-t border-black/[0.05] pt-10 space-y-6" id="timeline-section">
            <div className="text-center space-y-1.5">
              <span className="text-[10px] font-bold text-gold-brand uppercase tracking-widest font-sans">District Rollout Roadmap</span>
              <h3 className="font-serif text-2xl font-bold text-teal-dark">The 90-Day Pilot Plan</h3>
            </div>

            <div className="space-y-4 max-w-lg mx-auto">
              {[
                { day: "Days 1-15", title: "Intake & Setup", desc: "Integrate student registers, connect Firestore cloud database instances, and train leadership teams." },
                { day: "Days 16-45", title: "Live Trials & Tweaks", desc: "Run secondary classroom modules, test media recovery recommendations, and track alignment scores." },
                { day: "Days 46-90", title: "District Deployment", desc: "Complete general rollouts, verify metrics logs, and execute summer-to-autumn transformations." }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start p-4 bg-surface-0 border border-black/[0.04] rounded-2xl shadow-3xs">
                  <div className="w-9 h-9 rounded-xl bg-teal-light text-teal-brand font-serif font-bold flex items-center justify-center shrink-0 border border-teal-brand/10">
                    {idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-gold-brand uppercase">{step.day}</span>
                    <h5 className="text-xs font-bold text-teal-dark font-sans">{step.title}</h5>
                    <p className="text-[11px] text-secondary leading-relaxed font-sans font-normal">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure & Stack (ly-stack) */}
          <div className="border-t border-black/[0.05] pt-10 space-y-6" id="stack-section">
            <div className="text-center space-y-1.5">
              <span className="text-[10px] font-bold text-gold-brand uppercase tracking-widest font-sans">Secure, Scalable Foundation</span>
              <h3 className="font-serif text-2xl font-bold text-teal-dark">Modern Stack & Platform Standards</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-surface-0/60 p-4 rounded-xl text-center space-y-1.5 border border-black/[0.03]">
                <Sparkles className="w-5 h-5 text-teal-brand mx-auto" />
                <h6 className="text-[10px] font-bold text-teal-dark uppercase font-sans">Gemini 1.5 Flash</h6>
                <p className="text-[9px] text-secondary font-sans leading-normal">Smart curriculum restructuring.</p>
              </div>

              <div className="bg-surface-0/60 p-4 rounded-xl text-center space-y-1.5 border border-black/[0.03]">
                <Database className="w-5 h-5 text-teal-brand mx-auto" />
                <h6 className="text-[10px] font-bold text-teal-dark uppercase font-sans">Cloud Firestore</h6>
                <p className="text-[9px] text-secondary font-sans leading-normal">Durable persistent state storage.</p>
              </div>

              <div className="bg-surface-0/60 p-4 rounded-xl text-center space-y-1.5 border border-black/[0.03]">
                <FileCode className="w-5 h-5 text-teal-brand mx-auto" />
                <h6 className="text-[10px] font-bold text-teal-dark uppercase font-sans">TypeScript React</h6>
                <p className="text-[9px] text-secondary font-sans leading-normal">Statically typed components.</p>
              </div>

              <div className="bg-surface-0/60 p-4 rounded-xl text-center space-y-1.5 border border-black/[0.03]">
                <BookOpen className="w-5 h-5 text-teal-brand mx-auto" />
                <h6 className="text-[10px] font-bold text-teal-dark uppercase font-sans">Tailwind v4</h6>
                <p className="text-[9px] text-secondary font-sans leading-normal">Responsive design utility tokens.</p>
              </div>
            </div>
          </div>

        </section>

        {/* Minimal professional footer */}
        <footer className="px-6 sm:px-8 pt-8 mt-auto border-t border-black/[0.05] text-center text-[10px] text-secondary font-sans leading-normal space-y-1">
          <p>© 2026 Lyra STEM - Immersive Lesson Plan Transformation Suite. All rights reserved.</p>
          <p className="text-[9px] text-secondary/75">Designed in partnership with XPRIZE Education Initiative for high-yield classroom activities.</p>
        </footer>

      </div>
    </div>
  );
}
