export { ScoreCard } from './ScoreCard';
export { ImprovementsList } from './ImprovementsList';
export { InsightPanel } from './InsightPanel';
export { MarketAlignmentChart } from './MarketAlignmentChart';

export const CircularProgress: React.FC = () => (
  <div className="flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
  </div>
);

export const ActionableSteps: React.FC<{
  improvements: any[];
  insights: any[];
}> = ({ improvements, insights }) => {
  const highPriorityImprovements = improvements.filter(
    (imp) => imp.priority === 'high'
  );
  const keyInsights = insights.filter((insight) => insight.type === 'opportunity');

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900">Next Steps</h3>
      <div className="mt-4 space-y-4">
        {highPriorityImprovements.map((improvement, index) => (
          <div
            key={`imp-${index}`}
            className="flex items-start rounded-lg bg-orange-50 p-4"
          >
            <svg
              className="mr-3 h-5 w-5 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-medium text-orange-800">
                High Priority: {improvement.section}
              </p>
              <p className="mt-1 text-sm text-orange-600">{improvement.reason}</p>
            </div>
          </div>
        ))}

        {keyInsights.map((insight, index) => (
          <div
            key={`insight-${index}`}
            className="flex items-start rounded-lg bg-blue-50 p-4"
          >
            <svg
              className="mr-3 h-5 w-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <div>
              <p className="font-medium text-blue-800">Opportunity</p>
              <p className="mt-1 text-sm text-blue-600">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};