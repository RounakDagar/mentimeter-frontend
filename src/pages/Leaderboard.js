import React from 'react';
import { Trophy, Award, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A reusable sub-component for the 1st, 2nd, and 3rd place podium.
 * This is kept inside the Leaderboard file as it's only used here.
 */
const PodiumCard = ({ entry, currentUser, rank, order }) => {
  const isCurrentUser = currentUser === entry.name;

  const rankStyles = [
    // 1st Place (Gold)
    {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      border: 'border-yellow-400 dark:border-yellow-700',
      shadow: 'shadow-2xl shadow-yellow-500/30 dark:shadow-yellow-900/40',
      icon: <Trophy className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />,
      nameColor: 'text-yellow-900 dark:text-yellow-200',
      scoreColor: 'text-yellow-900 dark:text-yellow-100',
    },
    // 2nd Place (Silver)
    {
      bg: 'bg-gray-50 dark:bg-gray-800/40',
      border: 'border-gray-300 dark:border-gray-600',
      shadow: 'shadow-xl shadow-gray-500/20 dark:shadow-gray-900/30',
      icon: <Award className="w-8 h-8 text-gray-500 dark:text-gray-400" />,
      nameColor: 'text-gray-800 dark:text-gray-200',
      scoreColor: 'text-gray-900 dark:text-gray-100',
    },
    // 3rd Place (Bronze)
    {
      bg: 'bg-orange-50 dark:bg-orange-900/30',
      border: 'border-orange-400 dark:border-orange-700',
      shadow: 'shadow-xl shadow-orange-500/20 dark:shadow-orange-900/30',
      icon: <Award className="w-8 h-8 text-orange-600 dark:text-orange-500" />,
      nameColor: 'text-orange-900 dark:text-orange-200',
      scoreColor: 'text-orange-900 dark:text-orange-100',
    },
  ];

  const style = rankStyles[rank - 1]; // rank is 1, 2, or 3

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: rank === 1 ? 0.2 : (rank === 2 ? 0.3 : 0.4),
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className={`${order} ${style.bg} ${style.border} ${style.shadow} ${isCurrentUser ? 'ring-4 ring-indigo-500 dark:ring-indigo-600 scale-105' : ''} p-4 rounded-xl flex flex-col items-center text-center transition-all duration-300`}
    >
      <div className="relative">
        {style.icon}
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-gray-900 text-xs font-bold ${style.nameColor}">
          {rank}
        </span>
      </div>
      <span 
        className={`font-semibold text-base sm:text-lg ${style.nameColor} mt-3 truncate w-full`} 
        title={entry.name}
      >
        {entry.name}
      </span>
      <span className={`font-bold text-xl sm:text-2xl ${style.scoreColor} mt-1`}>
        {entry.score} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">pts</span>
      </span>
      {isCurrentUser && <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1.5">(You)</span>}
    </motion.div>
  );
};

// Leaderboard component expects an array of { name: string, score: number, rank: number } objects
// and optionally the username of the current user to highlight
const Leaderboard = ({ data = [], currentUser = null }) => {
  // --- Empty State (Unchanged, already clean) ---
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">
          Leaderboard is Empty
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Scores will appear here as participants answer.
        </p>
      </div>
    );
  }

  // --- Medal Colors (For ranks 4+ list) ---
  const medalColors = [
    'text-yellow-500 dark:text-yellow-400', // Gold (Rank 1)
    'text-gray-400 dark:text-gray-300', // Silver (Rank 2)
    'text-orange-600 dark:text-orange-500', // Bronze (Rank 3)
  ];

  // --- Helper function (LOGIC UNCHANGED) ---
  // This is now only used for ranks 4+ in the list below the podium
  const getRankIndicator = (rank, isCurrentUser) => {
    if (rank >= 1 && rank <= 3) {
      const Icon = rank === 1 ? Trophy : Award;
      return <Icon className={`w-5 h-5 ${medalColors[rank - 1]} ${isCurrentUser ? 'animate-pulse' : ''}`} title={`Rank ${rank}`} />;
    }
    return <span className={`w-5 text-center font-mono text-sm font-semibold ${isCurrentUser ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>{rank}</span>;
  };

  // --- Split data for Podium vs. List ---
  const topThree = data.slice(0, 3);
  const restOfPlayers = data.slice(3);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <Trophy className="w-6 h-6 mr-3 text-indigo-500 dark:text-indigo-400"/>
          Leaderboard
        </h3>
      </div>

      {/* --- NEW PODIUM SECTION --- */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 p-5 sm:p-6 items-end">
        {/* 2nd Place (Order 2) */}
        {topThree[1] && (
          <PodiumCard 
            entry={topThree[1]} 
            currentUser={currentUser} 
            rank={2} 
            order="order-2" 
          />
        )}
        
        {/* 1st Place (Order 1, elevated) */}
        {topThree[0] && (
          <PodiumCard 
            entry={topThree[0]} 
            currentUser={currentUser} 
            rank={1} 
            order="order-1 -mt-6 sm:-mt-10 z-10" 
          />
        )}

        {/* 3rd Place (Order 3) */}
        {topThree[2] && (
          <PodiumCard 
            entry={topThree[2]} 
            currentUser={currentUser} 
            rank={3} 
            order="order-3" 
          />
        )}
      </div>

      {/* --- "Best of the Rest" List --- */}
      {restOfPlayers.length > 0 && (
        <div className="p-5 sm:p-6 pt-0">
          <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            All Participants
          </h4>
          <div className="max-h-[40vh] overflow-y-auto custom-scrollbar -mr-2 pr-2">
            <div className="space-y-1">
              <AnimatePresence>
                {restOfPlayers.map((entry, index) => {
                  const isCurrentUser = currentUser === entry.name;
                  return (
                    <motion.div
                      key={entry.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ease-in-out ${
                        isCurrentUser
                          ? 'bg-indigo-50 dark:bg-indigo-950/50' // Highlight style
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/60' // Default style
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                          {getRankIndicator(entry.rank, isCurrentUser)}
                        </span>
                        <span
                          className={`font-medium text-sm truncate ${isCurrentUser ? 'text-indigo-800 dark:text-indigo-200' : 'text-gray-800 dark:text-gray-100'}`}
                          title={entry.name}
                        >
                          {entry.name} {isCurrentUser && (
                            <span className="ml-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">(You)</span>
                          )}
                        </span>
                      </div>
                      
                      <span className="flex-shrink-0 pl-4 text-right">
                        <span className={`font-semibold text-sm ${isCurrentUser ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>
                          {entry.score}
                        </span>
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                          pts
                        </span>
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom scrollbar styles (UNCHANGED) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; } /* slate-300 */
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #475569; } /* slate-600 */
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; } /* slate-400 */
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #64748b; } /* slate-500 */
      `}</style>
    </div>
  );
};

export default Leaderboard;