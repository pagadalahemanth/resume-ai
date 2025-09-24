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
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3, // Lower temperature for more consistent output
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Invalid Gemini API response structure:', data);
        throw new Error('Invalid response format from Gemini API');
      }

      const textContent = data.candidates[0].content.parts[0].text;
      console.log('Raw Gemini response:', textContent.substring(0, 200) + '...');
      
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
      // First try direct parsing
      return JSON.parse(textContent);
    } catch (parseError) {
      // Remove markdown code blocks
      let cleanContent = textContent.replace(/```json\n?/g, '').replace(/\n?```/g, '');
      
      try {
        return JSON.parse(cleanContent);
      } catch (error) {
        // Extract JSON object from text
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (error) {
            console.error('Failed to parse extracted JSON:', jsonMatch[0]);
          }
        }
        
        console.error('Could not parse JSON from Gemini response:', textContent);
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
      console.error('Invalid detailed analysis format:', result);
      // Return fallback data
      return {
        impactScore: 70,
        clarityScore: 75,
        achievementScore: 70,
        skillsRelevance: 80,
        overallScore: 74,
        sectionScores: {
          summary: 75,
          experience: 70,
          education: 75,
          skills: 80
        }
      };
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

    try {
      const result = await this.callGeminiAPI(prompt);
      
      // Handle different response formats
      if (Array.isArray(result)) {
        return { improvements: result };
      }
      
      if (result.improvements && Array.isArray(result.improvements)) {
        return result;
      }
      
      console.error('Invalid improvements format:', result);
      return { improvements: [] };
    } catch (error) {
      console.error('Error generating improvements:', error);
      return { improvements: [] };
    }
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

    try {
      const result = await this.callGeminiAPI(prompt);
      
      if (Array.isArray(result)) {
        return result;
      }
      
      console.error('Invalid insights format:', result);
      return [];
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }

  private async analyzeMarketAlignment(resumeText: string): Promise<MarketAlignmentData> {
    const prompt = `Analyze market alignment for this resume. You MUST respond with ONLY a valid JSON object.

${resumeText}

Return ONLY this JSON structure (no additional text or markdown):
{
  "roleAlignment": 75,
  "missingKeywords": ["cloud computing", "agile methodology", "data analysis"],
  "industryTrends": ["Remote work capabilities", "Digital transformation", "AI integration"],
  "recommendedSkills": ["Python", "AWS", "Machine Learning"]
}`;

    try {
      const result = await this.callGeminiAPI(prompt);
      
      if (!this.isValidMarketAlignment(result)) {
        console.error('Invalid market alignment format:', result);
        // Return fallback data
        return {
          roleAlignment: 70,
          missingKeywords: ["leadership", "project management", "communication"],
          industryTrends: ["Digital transformation", "Remote collaboration", "Automation"],
          recommendedSkills: ["Data analysis", "Communication", "Problem solving"]
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error analyzing market alignment:', error);
      // Return fallback data
      return {
        roleAlignment: 70,
        missingKeywords: ["leadership", "project management", "communication"],
        industryTrends: ["Digital transformation", "Remote collaboration", "Automation"],
        recommendedSkills: ["Data analysis", "Communication", "Problem solving"]
      };
    }
  }

  private isValidDetailedAnalysis(analysis: any): analysis is DetailedAnalysis {
    return (
      typeof analysis === 'object' &&
      typeof analysis.impactScore === 'number' &&
      typeof analysis.clarityScore === 'number' &&
      typeof analysis.achievementScore === 'number' &&
      typeof analysis.skillsRelevance === 'number' &&
      typeof analysis.overallScore === 'number' &&
      typeof analysis.sectionScores === 'object' &&
      analysis.sectionScores !== null
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