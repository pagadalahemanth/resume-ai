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

export interface Improvement {
  section: string;
  original: string;
  suggestion: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category: 'impact' | 'clarity' | 'skills' | 'achievement' | 'structure';
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