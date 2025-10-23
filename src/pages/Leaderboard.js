import React from 'react';
import { Trophy, Award, Users } from 'lucide-react'; // Added Users icon for empty state

// Leaderboard component expects an array of { name: string, score: number, rank: number } objects
// and optionally the username of the current user to highlight
const Leaderboard = ({ data = [], currentUser = null }) => {
  // --- Empty State ---
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-slate-500 dark:text-slate-400 py-10 px-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border dark:border-slate-700">
        <Users className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" />
        <p className="font-semibold">Leaderboard data is not available.</p>
        <p className="text-sm mt-1">Scores will appear here once participants answer correctly.</p>
      </div>
    );
  }

  // Define medal colors using Tailwind classes for consistency
  const medalColors = [
    'text-yellow-500 dark:text-yellow-400', // Gold (Rank 1)
    'text-gray-400 dark:text-gray-300',    // Silver (Rank 2)
    'text-yellow-700 dark:text-yellow-600', // Bronze (Rank 3) - Using a darker yellow/orange for bronze
  ];

  // Helper function to render rank indicator (medal or number)
  const getRankIndicator = (rank, isCurrentUser) => {
    // Ranks are 1-based from the backend
    if (rank >= 1 && rank <= 3) {
      const Icon = rank === 1 ? Trophy : Award;
      // Index into medalColors is rank - 1
      return <Icon className={`w-5 h-5 ${medalColors[rank - 1]} ${isCurrentUser ? 'animate-pulse' : ''}`} title={`Rank ${rank}`} />;
    }
    // Return the rank number itself for others, styled consistently
    return <span className={`w-5 text-center font-mono text-xs font-semibold ${isCurrentUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>{rank}</span>;
  };

  return (
    // Card styling with subtle gradient and shadow
    <div className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 rounded-xl shadow-lg p-6 border dark:border-slate-700">
      <h3 className="text-xl font-bold text-slate-900 mb-5 dark:text-slate-100 flex items-center">
        <Trophy className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400"/>
        Leaderboard
      </h3>
      {/* Scrollable list container */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {data.map((entry) => {
          // Check if the current entry belongs to the viewing user
          const isCurrentUser = currentUser === entry.name;
          return (
            <div
              key={entry.name} // Use name as key (ensure uniqueness in backend if needed)
              // Apply conditional styling for highlighting the current user
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-150 ease-in-out ${
                isCurrentUser
                  ? 'bg-indigo-50 dark:bg-indigo-900/50 ring-2 ring-indigo-500 dark:ring-indigo-400 scale-[1.01]' // Highlight style
                  : 'bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700' // Default style
              }`}
            >
              {/* Left side: Rank and Name */}
              <div className="flex items-center space-x-3 min-w-0"> {/* min-w-0 prevents overflow issues */}
                {/* Rank Indicator */}
                <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-center w-5 flex-shrink-0">
                  {getRankIndicator(entry.rank, isCurrentUser)}
                </span>
                {/* User Name (truncated with tooltip) */}
                <span
                  className={`font-medium truncate ${isCurrentUser ? 'text-indigo-800 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-100'}`}
                  title={entry.name} // Show full name on hover if truncated
                >
                  {entry.name} {isCurrentUser && <span className="text-xs font-normal">(You)</span>}
                </span>
              </div>
              {/* Right side: Score */}
              <span className={`font-bold text-sm whitespace-nowrap pl-2 ${isCurrentUser ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>
                {entry.score} pts
              </span>
            </div>
          );
        })}
      </div>
      {/* Optional: Add custom scrollbar styles (can be moved to a global CSS file) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; margin-top: 5px; margin-bottom: 5px; } /* Added margin */
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; } /* slate-300 */
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #475569; } /* slate-600 */
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; } /* slate-400 */
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #64748b; } /* slate-500 */
      `}</style>
    </div>
  );
};

export default Leaderboard;

