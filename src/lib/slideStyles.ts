export interface SlideStyle {
  id: string;
  label: string;
  desc: string;
  fontClass: string;
  fontFamily: string;
  bgClass: string;
  headerColor: string;
  pointColor: string;
  bulletClass: string;
  borderClass: string;
  badgeClass: string;
  previewDots: string[];
}

export const SLIDE_STYLES: SlideStyle[] = [
  {
    id: "Modern STEM",
    label: "Modern STEM",
    desc: "Clean Slate & Teal Gradient (Jost)",
    fontClass: "font-['Jost']",
    fontFamily: "'Jost', sans-serif",
    bgClass: "bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white border-slate-800",
    headerColor: "text-teal-300 font-bold",
    pointColor: "text-slate-100",
    bulletClass: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    borderClass: "border-slate-800",
    badgeClass: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    previewDots: ["#0f766e", "#14b8a6", "#0284c7"]
  },
  {
    id: "Playful Storybook",
    label: "Playful Storybook",
    desc: "Handwritten Classroom (Edu VIC WA NT Hand)",
    fontClass: "font-['Edu_VIC_WA_NT_Hand']",
    fontFamily: "'Edu VIC WA NT Hand', cursive, sans-serif",
    bgClass: "bg-[#fefaf3] text-[#2c221e] border-[#f3e3d3] shadow-md",
    headerColor: "text-[#d97706] font-bold text-2xl sm:text-3xl",
    pointColor: "text-[#3b2d28] font-semibold text-lg",
    bulletClass: "bg-amber-500 text-white border-amber-600/20 shadow-xs font-bold",
    borderClass: "border-[#f0e0d0]",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    previewDots: ["#f59e0b", "#f97316", "#10b981"]
  },
  {
    id: "Creative Doodle",
    label: "Creative Doodle",
    desc: "Whimsical & Fun (Barriecito & Sue Ellen)",
    fontClass: "font-['Barriecito']",
    fontFamily: "'Barriecito', 'Sue Ellen Francisco', cursive, sans-serif",
    bgClass: "bg-[#fffdf0] text-[#1e1b4b] border-[#fef08a] shadow-lg",
    headerColor: "text-[#4338ca] font-extrabold tracking-wide",
    pointColor: "text-[#1e1b4b] font-medium text-base",
    bulletClass: "bg-[#818cf8] text-white border-[#6366f1] font-bold",
    borderClass: "border-[#fef08a]",
    badgeClass: "bg-[#e0e7ff] text-[#3730a3] border-[#a5b4fc]",
    previewDots: ["#4338ca", "#818cf8", "#facc15"]
  },
  {
    id: "Editorial Clean",
    label: "Editorial Clean",
    desc: "Crisp & Accessible (Open Sans)",
    fontClass: "font-['Open_Sans']",
    fontFamily: "'Open Sans', sans-serif",
    bgClass: "bg-white text-slate-900 border-slate-200 shadow-sm",
    headerColor: "text-slate-900 font-extrabold",
    pointColor: "text-slate-800 font-normal leading-relaxed",
    bulletClass: "bg-slate-900 text-white border-slate-800 font-bold",
    borderClass: "border-slate-200",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
    previewDots: ["#0f172a", "#334155", "#0284c7"]
  },
  {
    id: "Space Cyber",
    label: "Space Cyber",
    desc: "Midnight Dark & Neon Cyan",
    fontClass: "font-['Space_Grotesk']",
    fontFamily: "'Space Grotesk', sans-serif",
    bgClass: "bg-[#080b18] text-cyan-50 border-purple-900/60 shadow-[0_0_25px_rgba(168,85,247,0.15)]",
    headerColor: "text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] font-bold",
    pointColor: "text-slate-100",
    bulletClass: "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]",
    borderClass: "border-purple-900/40",
    badgeClass: "bg-purple-950/80 text-cyan-300 border-cyan-500/40",
    previewDots: ["#080b18", "#22d3ee", "#a855f7"]
  },
  {
    id: "Technical Blueprint",
    label: "Technical Blueprint",
    desc: "Engineering Navy & Grid",
    fontClass: "font-mono",
    fontFamily: "'Fira Code', monospace",
    bgClass: "bg-[#0a192f] text-sky-100 border-sky-800/60 [background-image:linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] [background-size:20px_20px]",
    headerColor: "text-sky-300 uppercase font-bold tracking-wider",
    pointColor: "text-slate-100",
    bulletClass: "bg-orange-500 text-slate-950 border-orange-400 font-bold",
    borderClass: "border-sky-800/50",
    badgeClass: "bg-sky-950/90 text-orange-400 border-orange-500/40",
    previewDots: ["#0a192f", "#38bdf8", "#f97316"]
  }
];

