export interface Slide {
  title: string;
  content: string[];
  visualConcept: string;
  instructorNotes: string;
}

export interface HandsOnActivity {
  title: string;
  materials: string[];
  steps: string[];
  scientificPrinciple: string;
}

export interface WorksheetQuestion {
  id: string;
  questionText: string;
  answerType: string;
  options?: string[];
  sampleAnswer: string;
}

export interface Worksheet {
  title: string;
  instructions: string;
  questions: WorksheetQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface MediaRecommendation {
  resourceType: string;
  suggestedSearchQuery: string;
  whyItHelps: string;
}

export interface FeasibilityAlternative {
  title: string;
  description: string;
  whyItWorksBetter: string;
}

export interface FeasibilityAudit {
  status: string;
  identifiedSoftwarePlatform?: string;
  softwareGoalCompatibility?: string;
  originalSolutionEvaluation: string;
  potentialFailurePoints: string[];
  recommendedAlternatives: FeasibilityAlternative[];
  safetyAndTroubleshootingTips: string[];
}

export interface SavedVisual {
  id: string;
  url: string;
  prompt: string;
  style: string;
  timestamp: string;
}

export interface ProcessedLesson {
  id?: string;
  lessonTitle: string;
  duration: string;
  summary: string;
  keyTakeaways: string[];
  slides: Slide[];
  handsOnActivity: HandsOnActivity;
  worksheet: Worksheet;
  quiz: QuizQuestion[];
  mediaRecommendations: MediaRecommendation[];
  extractedStyleNotes?: string;
  generatedVisuals?: SavedVisual[];
  feasibilityAudit?: FeasibilityAudit;
  /** Lyrah's own call on whether this lesson needs an illustration at all. */
  visualSuggestion?: {
    needed: boolean;
    reason: string;
    prompt?: string;
  };
}

export interface PreloadedLesson {
  id: string;
  title: string;
  topic: string;
  description: string;
  rawContent: string;
}
