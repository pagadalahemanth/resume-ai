import React from 'react';

interface ScoreCardProps {
  score: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-700">Resume Score</h2>
      <div className={`mt-4 text-5xl font-bold ${getScoreColor(score)}`}>
        {score}
      </div>
      <div className="mt-2 text-sm text-gray-500">
        {score >= 90 && 'Exceptional'}
        {score >= 75 && score < 90 && 'Strong'}
        {score >= 60 && score < 75 && 'Good'}
        {score < 60 && 'Needs Improvement'}
      </div>
    </div>
  );
};