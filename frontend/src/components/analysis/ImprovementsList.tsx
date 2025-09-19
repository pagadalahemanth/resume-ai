import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Improvement {
  section: string;
  original: string;
  suggestion: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category: 'impact' | 'clarity' | 'skills' | 'achievement' | 'structure';
}

interface ImprovementsListProps {
  improvements: Improvement[];
}

export const ImprovementsList: React.FC<ImprovementsListProps> = ({ improvements }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const categories = ['all', 'impact', 'clarity', 'skills', 'achievement', 'structure'];
  const priorities = ['all', 'high', 'medium', 'low'];

  const filteredImprovements = improvements.filter((improvement) => {
    const categoryMatch = selectedCategory === 'all' || improvement.category === selectedCategory;
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

  return (
    <div>
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
                  {improvement.section}
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
                <div className="rounded-md bg-green-50 p-4">
                  <p className="text-sm text-green-700">{improvement.suggestion}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">{improvement.reason}</p>
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
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};