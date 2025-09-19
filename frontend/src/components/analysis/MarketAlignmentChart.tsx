import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface MarketAlignmentData {
  roleAlignment: number;
  missingKeywords: string[];
  industryTrends: string[];
  recommendedSkills: string[];
}

interface MarketAlignmentChartProps {
  data: MarketAlignmentData;
}

export const MarketAlignmentChart: React.FC<MarketAlignmentChartProps> = ({
  data
}) => {
  const chartData = [
    {
      name: 'Role Alignment',
      value: data.roleAlignment,
      fill: '#3B82F6'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Missing Keywords</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.missingKeywords.map((keyword, index) => (
              <span
                key={index}
                className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Recommended Skills</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.recommendedSkills.map((skill, index) => (
              <span
                key={index}
                className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Industry Trends</h3>
        <ul className="mt-4 space-y-3">
          {data.industryTrends.map((trend, index) => (
            <li key={index} className="flex items-start">
              <svg
                className="mr-2 h-5 w-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="text-gray-600">{trend}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};