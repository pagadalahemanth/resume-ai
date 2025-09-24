export interface ResumeSection {
  type: 'experience' | 'education' | 'skills' | 'projects' | 'summary' | 'achievements';
  content: string;
  metadata?: Record<string, any>;
}

export interface AnalysisResult {
  score: number;
  improvements: Improvement[];
  insights: Insight[];
  marketAlignment: MarketAlignmentData;
}

// Updated to match what Gemini API actually returns
export interface Improvement {
  area: string;           // Changed from 'section' to 'area'
  suggestion: string;     // This stays the same
  priority: 'high' | 'medium' | 'low';
  
  // Optional fields that might be added later
  section?: string;
  original?: string;
  reason?: string;
  category?: 'impact' | 'clarity' | 'skills' | 'achievement' | 'structure';
}

export interface Insight {
  type: 'strength' | 'weakness' | 'opportunity' | 'gap';
  description: string;
  actionItems: string[];
}

export interface MarketAlignmentData {
  roleAlignment: number;
  missingKeywords: string[];
  industryTrends: string[];
  recommendedSkills: string[];
}

export interface DetailedAnalysis {
  impactScore: number;
  clarityScore: number;
  achievementScore: number;
  skillsRelevance: number;
  overallScore: number;
  sectionScores: Record<string, number>;
}