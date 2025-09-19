import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  CircularProgress,
  ScoreCard,
  ImprovementsList,
  InsightPanel,
  MarketAlignmentChart,
  ActionableSteps,
} from '../components/analysis';

interface AnalysisData {
  score: number;
  improvements: Array<{
    section: string;
    original: string;
    suggestion: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    category: 'impact' | 'clarity' | 'skills' | 'achievement' | 'structure';
  }>;
  insights: Array<{
    type: 'strength' | 'weakness' | 'opportunity' | 'gap';
    description: string;
    actionItems: string[];
  }>;
  marketAlignment: {
    roleAlignment: number;
    missingKeywords: string[];
    industryTrends: string[];
    recommendedSkills: string[];
  };
}

const AnalysisPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!resumeId) {
      setError('No resume ID provided');
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        console.log('Fetching analysis for resume:', resumeId);
        setLoading(true);
        setError(null);
        console.log('Fetching analysis for resume:', resumeId);
        
        setLoading(true);
        setError(null);
        console.log('Making API call to:', `${import.meta.env.VITE_API_URL}/analysis/resume/${resumeId}`);
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/analysis/resume/${resumeId}`,
          { 
            timeout: 30000,
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (response.data.success) {
          setAnalysis(response.data.data);
          setLoading(false);
          setError(null);
        } else {
          // If analysis is not ready, retry after 5 seconds
          if (retryCount < 6) { // Max 30 seconds of retrying
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 5000);
          } else {
            throw new Error('Analysis timed out. Please try again.');
          }
        }
        setAnalysis(response.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [resumeId, retryCount]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center flex-col space-y-4">
        <CircularProgress />
        <p className="text-gray-600">Analyzing your resume...</p>
        <p className="text-sm text-gray-500">This may take a few moments</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2">{error || 'Analysis not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          {/* Left Column - Overview and Navigation */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <ScoreCard score={analysis.score} />
              <nav className="mt-8">
                <button
                  onClick={() => setActiveSection('overview')}
                  className={`w-full rounded-lg p-3 text-left ${
                    activeSection === 'overview'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveSection('improvements')}
                  className={`w-full rounded-lg p-3 text-left ${
                    activeSection === 'improvements'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Improvements
                </button>
                <button
                  onClick={() => setActiveSection('insights')}
                  className={`w-full rounded-lg p-3 text-left ${
                    activeSection === 'insights'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Career Insights
                </button>
                <button
                  onClick={() => setActiveSection('market')}
                  className={`w-full rounded-lg p-3 text-left ${
                    activeSection === 'market'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Market Alignment
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-lg bg-white p-6 shadow-lg"
            >
              {activeSection === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold">Resume Analysis Overview</h2>
                  <div className="mt-6 grid gap-6">
                    <MarketAlignmentChart data={analysis.marketAlignment} />
                    <ActionableSteps
                      improvements={analysis.improvements}
                      insights={analysis.insights}
                    />
                  </div>
                </div>
              )}

              {activeSection === 'improvements' && (
                <ImprovementsList improvements={analysis.improvements} />
              )}

              {activeSection === 'insights' && (
                <InsightPanel insights={analysis.insights} />
              )}

              {activeSection === 'market' && (
                <div>
                  <h2 className="text-2xl font-bold">Market Alignment</h2>
                  <div className="mt-6">
                    <MarketAlignmentChart data={analysis.marketAlignment} />
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold">Recommended Skills</h3>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {analysis.marketAlignment.recommendedSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-blue-100 px-4 py-1 text-sm text-blue-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold">Industry Trends</h3>
                      <ul className="mt-4 space-y-2">
                        {analysis.marketAlignment.industryTrends.map((trend, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2 text-blue-500">→</span>
                            {trend}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalysisPage;