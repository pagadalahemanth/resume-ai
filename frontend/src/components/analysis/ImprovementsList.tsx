import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Improvement {
  area: string;           // Updated to match API response
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  
  // Optional fields for backward compatibility
  section?: string;
  original?: string;
  reason?: string;
  category?: 'impact' | 'clarity' | 'skills' | 'achievement' | 'structure';
}

interface ImprovementsListProps {
  improvements: Improvement[];
}

export const ImprovementsList: React.FC<ImprovementsListProps> = ({ improvements }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Get unique categories from improvements
  const categories = ['all', ...Array.from(new Set(
    improvements.map(imp => imp.category || 'general').filter(Boolean)
  ))];
  
  const priorities = ['all', 'high', 'medium', 'low'];

  const filteredImprovements = improvements.filter((improvement) => {
    const categoryMatch = selectedCategory === 'all' || 
      (improvement.category === selectedCategory) || 
      (selectedCategory === 'general' && !improvement.category);
    const priorityMatch = selectedPriority === 'all' || improvement.priority === selectedPriority;
    return categoryMatch && priorityMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!improvements || improvements.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Improvements Found</h3>
        <p className="text-gray-600">Your resume analysis didn't return any specific improvements.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Resume Improvements</h2>
      
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence>
        <motion.div className="space-y-6">
          {filteredImprovements.map((improvement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  {improvement.area || improvement.section || 'General'}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityColor(
                    improvement.priority
                  )}`}
                >
                  {improvement.priority}
                </span>
              </div>
              
              <div className="mt-4">
                {improvement.original && (
                  <>
                    <div className="rounded-md bg-gray-50 p-4">
                      <p className="text-sm text-gray-700">{improvement.original}</p>
                    </div>
                    <div className="mt-4 flex items-center">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  </>
                )}
                
                <div className="rounded-md bg-green-50 p-4">
                  <p className="text-sm text-green-700">{improvement.suggestion}</p>
                </div>
              </div>
              
              {improvement.reason && (
                <p className="mt-4 text-sm text-gray-600">{improvement.reason}</p>
              )}
              
              {improvement.category && (
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${
                      improvement.category === 'impact'
                        ? 'bg-purple-100 text-purple-800'
                        : improvement.category === 'clarity'
                        ? 'bg-blue-100 text-blue-800'
                        : improvement.category === 'skills'
                        ? 'bg-green-100 text-green-800'
                        : improvement.category === 'achievement'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {improvement.category}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredImprovements.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No improvements match the selected filters.</p>
        </div>
      )}
    </div>
  );
};