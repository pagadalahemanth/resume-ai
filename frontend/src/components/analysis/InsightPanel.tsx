import React from 'react';

interface Insight {
  type: 'strength' | 'weakness' | 'opportunity' | 'gap';
  description: string;
  actionItems: string[];
}

interface InsightPanelProps {
  insights: Insight[];
}

export const InsightPanel: React.FC<InsightPanelProps> = ({ insights }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return (
          <svg
            className="h-6 w-6 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'weakness':
        return (
          <svg
            className="h-6 w-6 text-red-500"
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
        );
      case 'opportunity':
        return (
          <svg
            className="h-6 w-6 text-blue-500"
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
        );
      default:
        return (
          <svg
            className="h-6 w-6 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-green-50 border-green-200';
      case 'weakness':
        return 'bg-red-50 border-red-200';
      case 'opportunity':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      {insights.map((insight, index) => (
        <div
          key={index}
          className={`rounded-lg border p-6 ${getTypeColor(insight.type)}`}
        >
          <div className="flex items-start space-x-4">
            {getTypeIcon(insight.type)}
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
              </h3>
              <p className="mt-2 text-gray-600">{insight.description}</p>
              <div className="mt-4">
                <h4 className="font-medium text-gray-900">Action Items:</h4>
                <ul className="mt-2 list-inside list-disc space-y-2">
                  {insight.actionItems.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-600">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};