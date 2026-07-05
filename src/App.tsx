import { useState, useEffect } from "react";
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
  Trash2
} from "lucide-react";
import { PRELOADED_LESSONS } from "./data/preloadedLessons";
import { INITIAL_PROCESSED_LESSON } from "./data/initialProcessedLesson";
import { ProcessedLesson, PreloadedLesson } from "./types";
import InteractiveSlideshow from "./components/InteractiveSlideshow";
import { useFirebase } from "./context/FirebaseContext";

export default function App() {
  const { 
    user, 
    signInWithGoogle, 
    logOut, 
    savedLessons, 
    saveLessonToCloud, 
    deleteLessonFromCloud, 
    authLoading, 
    dbLoading 
  } = useFirebase();

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveToCloud = async () => {
    try {
      await saveLessonToCloud(lesson);
      setSaveStatus("Saved to Cloud!");
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
  const [activeTab, setActiveTab] = useState<"slides" | "lab" | "worksheet" | "quiz" | "media">("slides");
  
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

  // Call server-side backend API to process lesson using Gemini
  const handleProcessLesson = async () => {
    setIsLoading(true);
    setError(null);
    try {
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

  // Quick helper to fill local mock preview (in case of server-side offline/errors/demo quick test)
  const handleQuickDemoFill = (preloadId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      // Find matching preload and map to custom fallback data structures to show instantaneous offline response
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
              "Glue the sticks together overlapping securely and allow 10-15 minutes to dry partially (fully cures overnight).",
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
              whyItHelps: "Perfect historical demonstration of what happens when torsional forces (wind-twisting) are not accounted for in structural designs, turning a giant bridge into a wave!"
            }
          ]
        });
      } else {
        // electromagnetism
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
    }, 700);
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
    if (selectedQuizOption !== null) return; // Prevent double selecting
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      {/* Top Professional Header Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Lyra</h1>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">v1.2.0-beta</span>
            </div>
            <p className="text-xs text-slate-500 font-sans">AI Immersive STEM Lesson Plan & Demonstration Engine</p>
          </div>
        </div>

        {/* Educator badges & Authentication */}
        <div className="flex items-center gap-3.5 flex-wrap justify-end">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-slate-700 text-[11px] font-medium shadow-2xs font-sans">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>STEM Classroom Suite</span>
          </div>
          <div className="hidden lg:flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full text-emerald-800 text-[10px] font-semibold font-mono">
            <span>Powered by Gemini 3.5 Flash</span>
          </div>

          {/* Firebase Authentication Area */}
          {authLoading ? (
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
          ) : user ? (
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 p-1.5 pr-3.5 rounded-xl shadow-2xs shrink-0">
              {user.photoURL ? (
                <img referrerPolicy="no-referrer" src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-lg border border-emerald-200 object-cover shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                  {user.displayName?.[0]?.toUpperCase() || 'E'}
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-[10px] font-bold text-slate-800 leading-tight truncate max-w-28">{user.displayName || 'Educator'}</p>
                <p className="text-[8px] text-slate-400 font-mono leading-tight truncate max-w-28">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={logOut}
                className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-all shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-950 rounded-xl text-[11px] font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7.5xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: Intake & Configuration Sidebar (5 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Welcome & Story Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
            <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2.5">
              <BookOpen className="w-4 h-4 text-emerald-600" /> Instructor Pain Point
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              As a STEM afterschool instructor, lesson plans are often dense, text-heavy, and plagued with 
              <strong> broken media links</strong>. Instructors spend hours of unpaid time finding replacement videos and organizing slides. 
              <strong> Lyra</strong> converts raw documents instantly into interactive slides, smart quizzes, worksheets, and media backup queries.
            </p>
          </div>

          {/* Transformation Controls */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-sans">
                <Sliders className="w-4.5 h-4.5 text-emerald-600" />
                Lesson Plan Intake
              </h3>
              <span className="text-[10px] font-semibold text-slate-400 font-mono">STEP 1</span>
            </div>

            {/* Transformation Goal Choices */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block font-sans">Choose Transformation Objective:</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setTransformationGoal("gamify")}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    transformationGoal === "gamify"
                      ? "bg-white text-emerald-950 shadow-sm border border-slate-200/40"
                      : "text-slate-500 hover:text-slate-800 bg-transparent border border-transparent"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Gamify This Lesson
                </button>
                <button
                  type="button"
                  onClick={() => setTransformationGoal("presentation")}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    transformationGoal === "presentation"
                      ? "bg-white text-indigo-950 shadow-sm border border-slate-200/40"
                      : "text-slate-500 hover:text-slate-800 bg-transparent border border-transparent"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Create Presentation
                </button>
              </div>
            </div>

            {/* File Upload Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block font-sans">Upload Lesson Plan File:</label>
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
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
                  <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-lg animate-pulse">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800">Reading document...</p>
                      <p className="text-[9px] text-emerald-600 font-semibold">Extracting curriculum text using AI parser</p>
                    </div>
                  </div>
                ) : uploadedFileName ? (
                  <div className="flex items-center justify-between gap-3 bg-white border border-emerald-100 p-2.5 rounded-lg">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1.5 bg-emerald-50 rounded text-emerald-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 truncate">{uploadedFileName}</p>
                        <p className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> File loaded successfully
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFileName(null);
                        setCustomContent("");
                        const input = document.getElementById("file-upload-input") as HTMLInputElement;
                        if (input) input.value = "";
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all shrink-0"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("file-upload-input");
                        if (input) (input as HTMLInputElement).click();
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs hover:shadow-sm rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      Choose File...
                    </button>
                    <p className="text-[10px] text-slate-400 leading-tight text-center sm:text-left font-medium">
                      Supports <strong>.pdf, .docx, .txt, .md, .json, .html</strong> (Max 5MB)
                    </p>
                  </div>
                )}

                {extractionError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg text-[11px] leading-relaxed flex gap-2 items-start font-sans">
                    <span className="font-bold text-rose-600 shrink-0 select-none">⚠️</span>
                    <div>
                      <span className="font-bold block text-rose-900 font-sans">Extraction Error</span>
                      <p className="text-slate-600 font-sans mt-0.5">{extractionError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customizable raw content text area */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 font-sans">Or Paste Lesson Plan Text:</label>
                <button 
                  type="button"
                  onClick={() => {
                    setCustomContent("");
                    setUploadedFileName(null);
                  }}
                  className="text-[10px] text-slate-400 hover:text-slate-600 underline font-mono"
                >
                  Clear Box
                </button>
              </div>
              <textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                rows={6}
                placeholder="Paste any wordy textbook chapter, PDF text, web article, or outline here..."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono bg-slate-50/50"
              />
              
              {/* Preset quick loader link-pills for fast evaluation */}
              <div className="text-[10px] text-slate-500 leading-normal font-sans pt-0.5 flex flex-wrap gap-x-1.5 gap-y-1 items-center">
                <span className="font-medium text-slate-400">Load sample:</span>
                {PRELOADED_LESSONS.map((preload) => (
                  <button
                    key={preload.id}
                    type="button"
                    onClick={() => {
                      setCustomContent(preload.rawContent);
                      setUploadedFileName(`sample_${preload.id}.txt`);
                      handleQuickDemoFill(preload.id);
                    }}
                    className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100/50 transition-all bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100"
                  >
                    {preload.title.split(" ")[0] || preload.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Teacher Preferences */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block font-sans">Teacher's Custom Request (Optional):</label>
              <input
                type="text"
                value={customPreferences}
                onChange={(e) => setCustomPreferences(e.target.value)}
                placeholder="e.g. Make it simple for 8-year-olds; emphasize space travel..."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                onClick={handleProcessLesson}
                disabled={isLoading || !customContent.trim()}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold font-sans hover:bg-slate-800 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                id="generate-lesson-btn"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Gemini Processing Lesson Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400 group-hover:animate-pulse" />
                    <span>Transform Lesson Plan with AI</span>
                  </>
                )}
              </button>
              
              {/* Note on environment variables */}
              <div className="mt-2.5 flex items-start gap-1.5 bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-normal font-sans">
                  The button uses your workspace’s <strong>GEMINI_API_KEY</strong> secret to generate a custom formatted plan. If no key is set, you can explore the loaded preloaded lessons instantly!
                </p>
              </div>
            </div>

            {/* Display error message if API fails */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2 text-red-900 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1 font-sans">
                  <span className="font-bold">Gemini API Connection Note</span>
                  <p className="text-[11px] text-red-800 leading-normal">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Active Learning Pedagogical Best Practices for Educators */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase">Classroom Strategy</h3>
                <h4 className="text-sm font-bold text-white font-sans">Active STEM Best Practices</h4>
              </div>
              <BookOpen className="w-4.5 h-4.5 text-emerald-400" />
            </div>

            <div className="space-y-3">
              <div className="flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-200">Active Before Abstract</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Always introduce hands-on experiments or physical objects <em>before</em> explaining complex formulas or lectures.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-200">Peer Collaboration</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Group students into teams of 3 to 4. Cooperative challenges trigger higher logical recall and active problem-solving.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-200">Formative Retrieval</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Use the "Smartboard Game Quiz" as an interactive team exit-ticket game to solidify core topics before class wraps.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 font-sans">
                💡 Check out the <strong>README.md</strong> file for the XPRIZE Business Model details.
              </p>
            </div>
          </div>

          {/* Cloud Sync & Saved Lessons panel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-sans">
                <Database className="w-4.5 h-4.5 text-emerald-600" />
                My Saved Lessons
              </h3>
              <span className="text-[10px] font-semibold text-slate-400 font-mono">CLOUDSYNC</span>
            </div>

            {authLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : user ? (
              <div className="space-y-2.5">
                {savedLessons.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <Cloud className="w-7 h-7 text-slate-300 mx-auto mb-1.5 animate-pulse" />
                    <p className="text-xs font-semibold text-slate-600">No lessons saved yet</p>
                    <p className="text-[10px] text-slate-400 leading-normal max-w-44 mx-auto mt-0.5 font-sans">
                      Generate a lesson with AI and click "Save Current Lesson" to persist it in the cloud.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
                    {savedLessons.map((saved) => (
                      <div 
                        key={saved.id}
                        className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex justify-between items-center gap-3 group"
                      >
                        <div className="overflow-hidden flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate leading-snug">{saved.lessonTitle}</p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-300" /> {saved.duration} Block
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setLesson(saved);
                              setActiveTab("slides");
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-lg text-[10px] font-bold transition-all shadow-3xs cursor-pointer"
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete "${saved.lessonTitle}"?`)) {
                                try {
                                  await deleteLessonFromCloud(saved.id);
                                } catch (err: any) {
                                  alert("Failed to delete lesson: " + err.message);
                                }
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-transparent hover:border-red-100 rounded-lg transition-all cursor-pointer"
                            title="Delete Lesson"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center space-y-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-3xs">
                  <Cloud className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Classroom Cloud Saves</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-1 max-w-[190px] mx-auto font-sans">
                    Sign in with your Google account to save custom plans, build histories, and load saved assets on any device.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sign In with Google</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Hand: Active Lesson Workspace & Demo Preview (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Active Lesson Meta Header */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-1 z-10 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100/80 px-2.5 py-0.5 rounded-full uppercase">
                  ACTIVE AI GENERATED PLAN
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-300" />
                  {lesson.duration} Teaching Block
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                {lesson.lessonTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans max-w-2xl">
                {lesson.summary}
              </p>
            </div>

            {/* Cloud Save / Sign In CTA */}
            <div className="shrink-0 z-10 flex flex-col items-stretch sm:items-end gap-2 w-full md:w-auto">
              {user ? (
                <button
                  type="button"
                  onClick={handleSaveToCloud}
                  disabled={dbLoading}
                  className="px-4.5 py-2.5 bg-gradient-to-tr from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Cloud className="w-4 h-4 text-emerald-200" />
                  {dbLoading ? 'Saving...' : 'Save Current Lesson'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-emerald-500" />
                  Sign In to Save Lesson
                </button>
              )}
              {saveStatus && (
                <span className="text-[10px] font-medium text-emerald-600 text-center sm:text-right font-sans flex items-center justify-center sm:justify-end gap-1">
                  <Check className="w-3.5 h-3.5" /> {saveStatus}
                </span>
              )}
            </div>
          </div>

          {/* Core Navigation Tabs for Interactive STEM Resources */}
          <div className="flex border-b border-slate-200/60 overflow-x-auto gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
            <button
              onClick={() => setActiveTab("slides")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeTab === "slides"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
              id="tab-slides"
            >
              <Layers className="w-4 h-4" />
              <span>Smart Slideshow</span>
            </button>
            <button
              onClick={() => setActiveTab("lab")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeTab === "lab"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
              id="tab-lab"
            >
              <Activity className="w-4 h-4" />
              <span>Hands-On Lab</span>
            </button>
            <button
              onClick={() => setActiveTab("worksheet")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeTab === "worksheet"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
              id="tab-worksheet"
            >
              <FileText className="w-4 h-4" />
              <span>Printable Worksheet</span>
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeTab === "quiz"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
              id="tab-quiz"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Smartboard Game Quiz</span>
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeTab === "media"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
              id="tab-media"
            >
              <Link2Off className="w-4 h-4" />
              <span>Media Link Fixer</span>
            </button>
          </div>

          {/* Active Tab Workspace Canvas */}
          <div className="min-h-[460px]">
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Smart Slideshow */}
              {activeTab === "slides" && (
                <motion.div
                  key="tab-slides-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <InteractiveSlideshow slides={lesson.slides} />

                  {/* Core Scientific Takeaways Panel */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                        <CheckCircle2 className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 font-sans">Core Scientific Takeaways</h3>
                        <p className="text-[10px] font-mono text-slate-400 uppercase">Key Classroom Learning Pillars</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {lesson.keyTakeaways.map((takeaway, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-700 leading-normal font-sans font-medium">{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Hands-On Lab */}
              {activeTab === "lab" && (
                <motion.div
                  key="tab-lab-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6"
                >
                  {/* Left panel: Materials checklist */}
                  <div className="md:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Preparation Checklist</span>
                      <h3 className="text-sm font-bold text-slate-900 font-sans">Lab Materials</h3>
                    </div>

                    <div className="space-y-2">
                      {lesson.handsOnActivity.materials.map((material, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleMaterial(material)}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl border text-left transition-all ${
                            checkedMaterials[material]
                              ? "bg-emerald-50/40 border-emerald-200 text-emerald-950"
                              : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                            checkedMaterials[material]
                              ? "bg-emerald-500 border-emerald-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}>
                            {checkedMaterials[material] && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-sans leading-tight">{material}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <div className="p-3 bg-emerald-50 border border-emerald-100/80 rounded-xl flex items-start gap-2 text-[11px] text-emerald-800 font-sans">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Check materials off</strong> as you prepare the bins before class! Simple and reusable.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right panel: Steps and science principle */}
                  <div className="md:col-span-8 space-y-6">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Step-by-step Experiment</span>
                          <h3 className="text-base font-bold text-slate-900 font-sans">{lesson.handsOnActivity.title}</h3>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-mono font-bold rounded-lg uppercase">
                          STUDENT LED LAB
                        </span>
                      </div>

                      {/* steps list */}
                      <div className="space-y-4">
                        {lesson.handsOnActivity.steps.map((step, idx) => (
                          <div key={idx} className="flex gap-4 items-start group">
                            <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                              {idx + 1}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans pt-0.5">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scientific Principle Box */}
                    <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-emerald-200" />
                        <h4 className="text-sm font-bold tracking-tight uppercase font-mono text-emerald-100">The Magic Behind the Science</h4>
                      </div>
                      <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-sans">
                        {lesson.handsOnActivity.scientificPrinciple}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Printable Worksheet */}
              {activeTab === "worksheet" && (
                <motion.div
                  key="tab-worksheet-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 font-sans relative overflow-hidden" id="worksheet-to-print">
                    
                    {/* Simulated student name line */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-dashed border-slate-200 pb-5">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900">{lesson.worksheet.title}</h3>
                        <p className="text-xs text-slate-500">{lesson.worksheet.instructions}</p>
                      </div>
                      
                      <div className="flex gap-4 text-xs font-mono text-slate-500 shrink-0 w-full sm:w-auto">
                        <div className="border-b border-slate-300 flex-1 sm:flex-initial sm:w-40 pb-1">
                          <span>NAME: </span>
                        </div>
                        <div className="border-b border-slate-300 w-24 pb-1">
                          <span>DATE: </span>
                        </div>
                      </div>
                    </div>

                    {/* Worksheet questions */}
                    <div className="space-y-8 py-2">
                      {lesson.worksheet.questions.map((question, idx) => (
                        <div key={question.id} className="space-y-3">
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-md text-xs mt-0.5">
                              {question.id}
                            </span>
                            <span className="text-sm font-semibold text-slate-800 leading-normal">
                              {question.questionText}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase mt-1 shrink-0 ml-auto bg-slate-50 border px-1.5 py-0.5 rounded">
                              {question.answerType}
                            </span>
                          </div>

                          {/* Options if Multiple Choice */}
                          {question.options && question.options.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                              {question.options.map((option, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-700">
                                  <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />
                                  <span>{option}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Else lined box for open-ended */
                            <div className="pl-9 space-y-2">
                              <div className="h-6 border-b border-slate-200" />
                              <div className="h-6 border-b border-slate-200" />
                            </div>
                          )}

                          {/* Instructor Answer Key Overlay */}
                          {showSampleAnswers && (
                            <div className="mt-2.5 ml-9 p-3 bg-emerald-50 border border-emerald-100/80 rounded-xl text-xs text-emerald-950 flex gap-2">
                              <span className="font-bold font-mono text-emerald-700 uppercase">Answer Key:</span>
                              <p className="font-medium">{question.sampleAnswer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Footer notice */}
                    <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <span className="text-[10px] font-mono text-slate-400">Classroom Resource generated by Lyra Engine</span>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setShowSampleAnswers(!showSampleAnswers)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all ${
                            showSampleAnswers
                              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                          id="toggle-answers-btn"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{showSampleAnswers ? "Hide Answer Key" : "Show Answer Key"}</span>
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-all"
                          id="print-worksheet-btn"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print PDF</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* Tab 4: Smart-Board Game Quiz */}
              {activeTab === "quiz" && (
                <motion.div
                  key="tab-quiz-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[440px]">
                    <div className="absolute top-0 right-0 w-84 h-84 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-84 h-84 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                    {/* Game Quiz Header */}
                    <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4 z-10">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">Classroom Jeopardy Style</span>
                        <h3 className="text-sm sm:text-base font-bold text-white font-sans">Smart Board Group Quiz</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400">Score: <strong className="text-emerald-400">{quizScore}</strong> / {lesson.quiz.length}</span>
                        <button
                          onClick={handleResetQuiz}
                          className="text-[10px] font-mono text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg"
                        >
                          Reset Game
                        </button>
                      </div>
                    </div>

                    {/* Game Stage Content */}
                    <div className="flex-1 flex flex-col justify-center z-10 my-4">
                      {quizCompleted ? (
                        /* Quiz Finish Screen */
                        <div className="text-center space-y-4 max-w-md mx-auto py-8">
                          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/5">
                            <Award className="w-8 h-8" />
                          </div>
                          <h4 className="text-xl font-bold text-white font-sans">Congratulations, STEM Explorers!</h4>
                          <p className="text-xs text-slate-400 font-sans leading-relaxed">
                            You have completed the interactive class check. The class scored <strong>{quizScore} out of {lesson.quiz.length}</strong> correct!
                          </p>
                          <div className="pt-4">
                            <button
                              onClick={handleResetQuiz}
                              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all"
                            >
                              Play Again
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Current Active Question */
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Question {currentQuizIndex + 1} of {lesson.quiz.length}</span>
                            <h4 className="text-base sm:text-lg font-bold tracking-tight text-white leading-normal font-sans">
                              {lesson.quiz[currentQuizIndex].question}
                            </h4>
                          </div>

                          {/* Options grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {lesson.quiz[currentQuizIndex].options.map((option, idx) => {
                              const isSelected = selectedQuizOption === idx;
                              const isCorrectAnswer = idx === lesson.quiz[currentQuizIndex].correctAnswerIndex;
                              
                              let borderClass = "border-slate-800 hover:border-slate-700 bg-slate-950/60";
                              let textClass = "text-slate-300";
                              let statusIcon = null;

                              if (selectedQuizOption !== null) {
                                if (isCorrectAnswer) {
                                  borderClass = "border-emerald-500 bg-emerald-950/40";
                                  textClass = "text-emerald-100 font-semibold";
                                  statusIcon = <Check className="w-4 h-4 text-emerald-400" />;
                                } else if (isSelected) {
                                  borderClass = "border-red-500 bg-red-950/40";
                                  textClass = "text-red-100";
                                  statusIcon = <X className="w-4 h-4 text-red-400" />;
                                } else {
                                  borderClass = "border-slate-850 bg-slate-950/20 opacity-30";
                                }
                              }

                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleQuizOptionClick(idx)}
                                  disabled={selectedQuizOption !== null}
                                  className={`p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${borderClass}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center text-xs font-mono font-bold">
                                      {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className={`${textClass} font-sans`}>{option}</span>
                                  </div>
                                  {statusIcon}
                                </button>
                              );
                            })}
                          </div>

                          {/* Smartboard Explanation Overlay */}
                          <AnimatePresence>
                            {showExplanation && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-4 text-xs text-slate-300 leading-relaxed font-sans"
                              >
                                <span className="font-bold text-emerald-400 block mb-1">🎯 Explain to the Class:</span>
                                {lesson.quiz[currentQuizIndex].explanation}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Quiz Controls Footer */}
                    {!quizCompleted && (
                      <div className="border-t border-slate-850 pt-4 flex justify-between items-center z-10">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Interactive Smartboard Mode</span>
                        
                        <button
                          onClick={handleNextQuiz}
                          disabled={selectedQuizOption === null}
                          className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span>{currentQuizIndex === lesson.quiz.length - 1 ? "Complete Quiz" : "Next Question"}</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    )}

                  </div>
                </motion.div>
              )}

              {/* Tab 5: Media Link Fixer */}
              {activeTab === "media" && (
                <motion.div
                  key="tab-media-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Explanation card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                      <Link2Off className="w-5.5 h-5.5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-900 font-sans">The "404 Broken Link" Classroom Disruptor</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-sans">
                        Afterschool lesson plans commonly link to deprecated videos or private intranet repositories that return errors. 
                        <strong> Lyra</strong> analyzes what the missing media is and suggests high-yield replacement queries you can instantly lookup.
                      </p>
                    </div>
                  </div>

                  {/* Recommendation list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lesson.mediaRecommendations.map((rec, idx) => (
                      <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <span className="px-2.5 py-0.5 bg-red-50 border border-red-100 text-[10px] font-semibold text-red-800 rounded-full inline-block font-sans uppercase">
                            Replaces Broken {rec.resourceType}
                          </span>
                          
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">Optimal Classroom Search:</span>
                            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-3 text-slate-800">
                              <span className="text-xs font-mono font-bold truncate">{rec.suggestedSearchQuery}</span>
                              <button
                                onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(rec.suggestedSearchQuery)}`, "_blank")}
                                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-all shrink-0"
                                title="Open search in new tab"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="pt-2">
                            <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase mb-0.5">Why it works:</span>
                            <p className="text-xs text-slate-600 leading-relaxed font-sans">
                              {rec.whyItHelps}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400 font-sans">
                          <span>Verified Search Backup</span>
                          <button
                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(rec.suggestedSearchQuery)}`, "_blank")}
                            className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
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
      </main>

      {/* Modern minimal footer */}
      <footer className="bg-white border-t border-slate-200/80 px-4 sm:px-8 py-5 text-center text-xs text-slate-400 font-sans mt-auto">
        <p>© 2026 Lyra STEM - Professional Lesson Plan & Classroom Resource Engine. All rights reserved.</p>
      </footer>
    </div>
  );
}
