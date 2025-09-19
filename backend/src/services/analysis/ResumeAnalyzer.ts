import OpenAI from 'openai';
import type { AnalysisResult, DetailedAnalysis, Improvement, Insight, MarketAlignmentData } from './types.js';

export class ResumeAnalyzer {
  private openai: OpenAI;
  
  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyzeResume(resumeText: string): Promise<AnalysisResult> {
    try {
      console.log('Starting resume analysis...');
      
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
      console.error('Resume analysis failed:', error);
      throw new Error('Failed to analyze resume: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async performDetailedAnalysis(resumeText: string): Promise<DetailedAnalysis> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        response_format: { type: "json_object" },
        messages: [{
          role: 'system',
          content: 'You are a professional resume analyzer. Provide detailed scoring and analysis in JSON format.'
        }, {
          role: 'user',
          content: `Analyze this resume comprehensively and provide detailed scoring:

Resume:
${resumeText}

Provide a detailed analysis with these exact fields:
{
  "impactScore": number (1-100),
  "clarityScore": number (1-100),
  "achievementScore": number (1-100),
  "skillsRelevance": number (1-100),
  "overallScore": number (1-100),
  "sectionScores": {
    "summary": number,
    "experience": number,
    "education": number,
    "skills": number
  }
}`
        }],
        temperature: 0.7
      });

      // gpt-4-turbo-preview returns JSON in response.choices[0].message.content or response.choices[0].message.function_call.arguments
      let result;
      const content = completion.choices[0]?.message?.content;
      if (content) {
        try {
          result = JSON.parse(content);
        } catch (e) {
          // Try to extract JSON substring if content is not pure JSON
          const match = content.match(/\{[\s\S]*\}/);
          result = match ? JSON.parse(match[0]) : {};
        }
      } else if (completion.choices[0]?.message?.function_call?.arguments) {
        result = JSON.parse(completion.choices[0].message.function_call.arguments);
      } else {
        result = {};
      }

      // Validate response format
      if (!this.isValidDetailedAnalysis(result)) {
        throw new Error('Invalid analysis format received from OpenAI');
      }

      return result;
    } catch (error) {
      console.error('Detailed analysis failed:', error);
      throw error;
    }
  }

  private async generateImprovements(resumeText: string, analysis: DetailedAnalysis): Promise<Improvement[]> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        response_format: { type: "json_object" },
        messages: [{
          role: 'system',
          content: 'Generate specific improvements for the resume in JSON array format.'
        }, {
          role: 'user',
          content: `Based on this resume and analysis scores, provide improvements:

Resume: ${resumeText}
Analysis: ${JSON.stringify(analysis)}

Return an array of improvements in this exact format:
[{
  "section": string,
  "original": string,
  "suggestion": string,
  "reason": string,
  "priority": "high" | "medium" | "low",
  "category": "impact" | "clarity" | "skills" | "achievement" | "structure"
}]`
        }],
        temperature: 0.7
      });

      let improvements;
      const content = completion.choices[0]?.message?.content;
      if (content) {
        try {
          improvements = JSON.parse(content);
        } catch (e) {
          // Try to extract JSON array
          const match = content.match(/\[.*\]/s);
          improvements = match ? JSON.parse(match[0]) : [];
        }
      } else if (completion.choices[0]?.message?.function_call?.arguments) {
        improvements = JSON.parse(completion.choices[0].message.function_call.arguments);
      } else {
        improvements = [];
      }

      if (!Array.isArray(improvements)) {
        throw new Error('Invalid improvements format received from OpenAI');
      }

      return improvements;
    } catch (error) {
      console.error('Improvements generation failed:', error);
      throw error;
    }
  }

  private async generateInsights(resumeText: string, analysis: DetailedAnalysis): Promise<Insight[]> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        response_format: { type: "json_object" },
        messages: [{
          role: 'system',
          content: 'Generate strategic insights for the resume in JSON array format.'
        }, {
          role: 'user',
          content: `Generate strategic insights for this resume:

Resume: ${resumeText}
Analysis: ${JSON.stringify(analysis)}

Return an array of insights in this exact format:
[{
  "type": "strength" | "weakness" | "opportunity" | "gap",
  "description": string,
  "actionItems": string[]
}]`
        }],
        temperature: 0.7
      });

      let insights;
      const content = completion.choices[0]?.message?.content;
      if (content) {
        try {
          insights = JSON.parse(content);
        } catch (e) {
          // Try to extract JSON array
          const match = content.match(/\[.*\]/s);
          insights = match ? JSON.parse(match[0]) : [];
        }
      } else if (completion.choices[0]?.message?.function_call?.arguments) {
        insights = JSON.parse(completion.choices[0].message.function_call.arguments);
      } else {
        insights = [];
      }

      if (!Array.isArray(insights)) {
        throw new Error('Invalid insights format received from OpenAI');
      }

      return insights;
    } catch (error) {
      console.error('Insights generation failed:', error);
      throw error;
    }
  }

  private async analyzeMarketAlignment(resumeText: string): Promise<MarketAlignmentData> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        response_format: { type: "json_object" },
        messages: [{
          role: 'system',
          content: 'Analyze market alignment of the resume and provide results in JSON format.'
        }, {
          role: 'user',
          content: `Analyze market alignment for this resume:

${resumeText}

Return the analysis in this exact format:
{
  "roleAlignment": number (0-100),
  "missingKeywords": string[],
  "industryTrends": string[],
  "recommendedSkills": string[]
}`
        }],
        temperature: 0.7
      });

      let marketAlignment;
      const content = completion.choices[0]?.message?.content;
      if (content) {
        try {
          marketAlignment = JSON.parse(content);
        } catch (e) {
          // Try to extract JSON object
          const match = content.match(/\{[\s\S]*\}/);
          marketAlignment = match ? JSON.parse(match[0]) : {};
        }
      } else if (completion.choices[0]?.message?.function_call?.arguments) {
        marketAlignment = JSON.parse(completion.choices[0].message.function_call.arguments);
      } else {
        marketAlignment = {};
      }

      if (!this.isValidMarketAlignment(marketAlignment)) {
        throw new Error('Invalid market alignment format received from OpenAI');
      }

      return marketAlignment;
    } catch (error) {
      console.error('Market alignment analysis failed:', error);
      throw error;
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