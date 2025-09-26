import type { AnalysisResult, DetailedAnalysis, Improvement, Insight, MarketAlignmentData } from './types.js';

export class ResumeAnalyzer {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeResume(resumeText: string): Promise<AnalysisResult> {
    try {
      console.log('Starting Google Gemini resume analysis...');
      
      const analysis = await this.performDetailedAnalysis(resumeText);
      console.log('Detailed analysis complete');
      
      const improvements = await this.generateImprovements(resumeText, analysis);
      console.log('Improvements generated');
      
      const insights = await this.generateInsights(resumeText, analysis);
      console.log('Insights generated');
      
      const marketAlignment = await this.analyzeMarketAlignment(resumeText);
      console.log('Market alignment analysis complete');

      return {
        score: analysis.overallScore,
        improvements: improvements.improvements || [],
        insights,
        marketAlignment
      };
    } catch (error) {
      console.error('Google Gemini resume analysis failed:', error);
      throw new Error('Failed to analyze resume: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async callGeminiAPI(prompt: string, retryCount = 0): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini API');
      }

      const textContent = data.candidates[0].content.parts[0].text;
      return this.parseGeminiResponse(textContent);
    } catch (error) {
      if (retryCount < 2) {
        console.log(`Retrying Gemini API call (attempt ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.callGeminiAPI(prompt, retryCount + 1);
      }
      throw error;
    }
  }

  private parseGeminiResponse(textContent: string): any {
    try {
      return JSON.parse(textContent);
    } catch {
      let cleanContent = textContent.replace(/```json\n?/g, '').replace(/\n?```/g, '');
      try {
        return JSON.parse(cleanContent);
      } catch {
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Could not parse JSON from Gemini response");
      }
    }
  }

  private async performDetailedAnalysis(resumeText: string): Promise<DetailedAnalysis> {
    const prompt = `Analyze this resume comprehensively and provide detailed scoring. You MUST respond with ONLY a valid JSON object with these exact fields:

Resume:
${resumeText}

Return ONLY this JSON structure (no additional text, explanation, or markdown):
{
  "impactScore": 75,
  "clarityScore": 80,
  "achievementScore": 70,
  "skillsRelevance": 85,
  "overallScore": 77,
  "sectionScores": {
    "summary": 80,
    "experience": 75,
    "education": 70,
    "skills": 85
  }
}`;

    const result = await this.callGeminiAPI(prompt);

    if (!this.isValidDetailedAnalysis(result)) {
      throw new Error("Gemini returned invalid detailed analysis format");
    }

    return result;
  }

  private async generateImprovements(resumeText: string, analysis: DetailedAnalysis): Promise<{ improvements: Improvement[] }> {
    const prompt = `Analyze this resume and suggest improvements. You MUST respond with ONLY a valid JSON object.

Resume:
${resumeText}

Analysis Scores:
${JSON.stringify(analysis)}

Return ONLY this JSON structure (no additional text or markdown):
{
  "improvements": [
    {
      "area": "Summary",
      "suggestion": "Add quantifiable achievements to your summary",
      "priority": "high"
    },
    {
      "area": "Experience", 
      "suggestion": "Use more action verbs to describe responsibilities",
      "priority": "medium"
    }
  ]
}`;

    const result = await this.callGeminiAPI(prompt);

    if (!result.improvements || !Array.isArray(result.improvements)) {
      throw new Error("Gemini returned invalid improvements format");
    }

    return result;
  }

  private async generateInsights(resumeText: string, analysis: DetailedAnalysis): Promise<Insight[]> {
    const prompt = `Generate strategic insights for this resume. You MUST respond with ONLY a valid JSON array.

Resume: ${resumeText}
Analysis: ${JSON.stringify(analysis)}

Return ONLY this JSON array structure (no additional text or markdown):
[
  {
    "type": "strength",
    "description": "Strong technical background in relevant technologies",
    "actionItems": ["Highlight specific projects", "Quantify impact", "Add certifications"]
  },
  {
    "type": "weakness",
    "description": "Limited quantifiable achievements",
    "actionItems": ["Add metrics to accomplishments", "Include ROI figures", "Specify team sizes managed"]
  }
]`;

    const result = await this.callGeminiAPI(prompt);

    if (!Array.isArray(result)) {
      throw new Error("Gemini returned invalid insights format");
    }

    return result;
  }

  private async analyzeMarketAlignment(resumeText: string): Promise<MarketAlignmentData> {
    const prompt = `Analyze market alignment for this resume. You MUST respond with ONLY a valid JSON object.

${resumeText}

Return ONLY this JSON structure (no additional text or markdown):
{
  "roleAlignment": 75,
  "missingKeywords": ["cloud computing", "agile methodology", "data analysis"],
  "industryTrends": ["Remote work capabilities", "Digital transformation", "AI integration"],
  "recommendedSkills": ["AWS", "Machine Learning"]
}`;

    const result = await this.callGeminiAPI(prompt);

    if (!this.isValidMarketAlignment(result)) {
      throw new Error("Gemini returned invalid market alignment format");
    }

    return result;
  }

  private isValidDetailedAnalysis(analysis: any): analysis is DetailedAnalysis {
    return (
      typeof analysis === 'object' &&
      typeof analysis.impactScore === 'number' &&
      typeof analysis.clarityScore === 'number' &&
      typeof analysis.achievementScore === 'number' &&
      typeof analysis.skillsRelevance === 'number' &&
      typeof analysis.overallScore === 'number' &&
      typeof analysis.sectionScores === 'object'
    );
  }

  private isValidMarketAlignment(alignment: any): alignment is MarketAlignmentData {
    return (
      typeof alignment === 'object' &&
      typeof alignment.roleAlignment === 'number' &&
      Array.isArray(alignment.missingKeywords) &&
      Array.isArray(alignment.industryTrends) &&
      Array.isArray(alignment.recommendedSkills)
    );
  }
}
