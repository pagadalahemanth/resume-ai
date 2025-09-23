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
        improvements,
        insights,
        marketAlignment
      };
    } catch (error) {
      console.error('Google Gemini resume analysis failed:', error);
      throw new Error('Failed to analyze resume: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async callGeminiAPI(prompt: string): Promise<any> {
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
          temperature: 0.7,
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
try {
  return JSON.parse(textContent);
} catch (parseError) {
  // Remove Markdown fences if present
  const jsonMatch = textContent.match(/```json\n?([\s\S]*?)\n?```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }

  // Try any JSON object in the string
  const objectMatch = textContent.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return JSON.parse(objectMatch[0]);
  }

  // Last fallback: trim and retry
  try {
    return JSON.parse(textContent.trim());
  } catch {
    throw new Error("Could not parse JSON from Gemini response: " + textContent);
  }
}

  }

  private async performDetailedAnalysis(resumeText: string): Promise<DetailedAnalysis> {
    const prompt = `Analyze this resume comprehensively and provide detailed scoring. Return ONLY a valid JSON object with these exact fields:

Resume:
${resumeText}

Return a JSON object with this structure:
{
  "impactScore": [number from 1-100],
  "clarityScore": [number from 1-100], 
  "achievementScore": [number from 1-100],
  "skillsRelevance": [number from 1-100],
  "overallScore": [number from 1-100],
  "sectionScores": {
    "summary": [number from 1-100],
    "experience": [number from 1-100],
    "education": [number from 1-100],
    "skills": [number from 1-100]
  }
}

Provide only the JSON object, no additional text or explanation.`;

    const result = await this.callGeminiAPI(prompt);
    
    if (!this.isValidDetailedAnalysis(result)) {
      throw new Error('Invalid analysis format received from Gemini API');
    }

    return result;
  }

private async generateImprovements(resumeText: string, analysis: DetailedAnalysis): Promise<{ improvements: Improvement[] }> {
  const prompt = `Analyze this resume and suggest improvements. 
Return ONLY a valid JSON object in this format:

{
  "improvements": [
    {
      "area": "string",
      "suggestion": "string",
      "priority": "low" | "medium" | "high"
    }
  ]
}

Resume:
${resumeText}

Analysis:
${JSON.stringify(analysis)}

Provide only the JSON object, no explanations or markdown.`;

  const raw = await this.callGeminiAPI(prompt);

  let parsed: any;
  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    throw new Error("Gemini returned non-JSON response");
  }

  if (Array.isArray(parsed)) {
    parsed = { improvements: parsed };
  }

  if (!parsed.improvements || !Array.isArray(parsed.improvements)) {
    console.error("Gemini response (invalid format):", parsed);
    throw new Error("Invalid improvements format received from Gemini API");
  }

  return parsed;
}



  private async generateInsights(resumeText: string, analysis: DetailedAnalysis): Promise<Insight[]> {
    const prompt = `Generate strategic insights for this resume. Return ONLY a valid JSON array:

Resume: ${resumeText}
Analysis: ${JSON.stringify(analysis)}

Return a JSON array of insights in this exact format:
[{
  "type": "strength" | "weakness" | "opportunity" | "gap",
  "description": "string",
  "actionItems": ["string", "string", "string"]
}]

Provide only the JSON array, no additional text or explanation.`;

    const result = await this.callGeminiAPI(prompt);
    
    if (!Array.isArray(result)) {
      throw new Error('Invalid insights format received from Gemini API');
    }

    return result;
  }

  private async analyzeMarketAlignment(resumeText: string): Promise<MarketAlignmentData> {
    const prompt = `Analyze market alignment for this resume. Return ONLY a valid JSON object:

${resumeText}

Return a JSON object in this exact format:
{
  "roleAlignment": [number from 0-100],
  "missingKeywords": ["string", "string", "string"],
  "industryTrends": ["string", "string", "string"],
  "recommendedSkills": ["string", "string", "string"]
}

Provide only the JSON object, no additional text or explanation.`;

    const result = await this.callGeminiAPI(prompt);
    
    if (!this.isValidMarketAlignment(result)) {
      throw new Error('Invalid market alignment format received from Gemini API');
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