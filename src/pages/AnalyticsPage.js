// src/pages/AnalyticsPage.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  Check,
  X,
  ChevronLeft,
  UserCircle,
  // ListChecks, // Keep if used elsewhere
  Trophy,
  Loader2,
  AlertTriangle,
  Users,
  Search,
  XCircle,
  Eye,
  CheckCircle, // Now used as the primary Correct indicator
  BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../hooks/useAPI';
import Leaderboard from '../pages/Leaderboard';
import { motion, AnimatePresence } from 'framer-motion';

// ## UserListModal (Unchanged) ##
const UserListModal = ({ isOpen, onClose, usernames, optionText }) => {
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => { if (isOpen) setSearchTerm(""); }, [isOpen]);
  if (!isOpen) return null;
  const filteredUsers = usernames.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-start p-5 border-b border-slate-200 dark:border-slate-700/50">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Users who chose:</h3>
            <p className="text-base text-indigo-600 dark:text-indigo-400 font-medium break-words">"{optionText}"</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        {/* Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/50">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${usernames.length} users...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>
        {/* User List */}
        <div className="p-4 max-h-72 overflow-y-auto">
          {filteredUsers.length > 0 ? (
            <ul className="space-y-2">
              {filteredUsers.map((name, index) => (
                <li key={index} className="flex items-center space-x-2.5 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <UserCircle className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium text-sm break-all">{name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 text-sm py-8">
              {searchTerm ? `No users match "${searchTerm}".` : "No users to display."}
            </p>
          )}
        </div>
      </div>
       <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }`}</style>
    </div>
  );
};


// ## ScoreCircle (Fixed and Animated - Unchanged) ##
const ScoreCircle = ({ score, total }) => {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const radius = 55;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="transform -rotate-90" width={140} height={140} viewBox="0 0 140 140">
        <circle
          cx={70} cy={70} r={radius}
          strokeWidth={stroke} fill="none"
          className="stroke-slate-100 dark:stroke-slate-700/50"
        />
        <motion.circle
          cx={70} cy={70} r={radius}
          strokeWidth={stroke} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          strokeLinecap="round"
          className="stroke-indigo-600 dark:stroke-indigo-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-slate-900 dark:text-slate-100">{score}</span>
        <span className="text-lg text-slate-500 dark:text-slate-400 -mt-1">/ {total}</span>
      </div>
    </div>
  );
};

// ## HostIndicator (Unchanged) ##
const HostIndicator = () => {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <div className="absolute w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center">
        <div className="text-center">
            <UserCircle className="w-14 h-14 mx-auto text-indigo-500 dark:text-indigo-400" />
            <p className="text-3xl font-bold text-slate-800 mt-1 dark:text-slate-100">Host</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">View</p>
        </div>
      </div>
    </div>
  );
};


// ## --- FINAL LOGIC FIX: OptionBar --- ##
const OptionBar = ({
  text,
  percent,
  count,
  isCorrect,
  isUser,
  usernames = [],
  isHost,
  onShowUsersClick,
  isSearchedUserAnswer
}) => {

  let bgBarColor = 'bg-slate-200 dark:bg-slate-700'; // Default bar
  let isSpecial = false; // Flag for high-contrast text
  const derivedIsUserIncorrect = isUser && !isCorrect;

  // 1. Determine Bar Color (Prioritize Correctness)
  if (isCorrect) {
    bgBarColor = 'bg-green-500 dark:bg-green-500';
    isSpecial = true;
  } else if (derivedIsUserIncorrect) { // User chose this incorrect option
    bgBarColor = 'bg-red-500 dark:bg-red-400';
    isSpecial = true;
  } else if (isSearchedUserAnswer && !isCorrect) { // Searched user chose this incorrect option
     bgBarColor = 'bg-purple-500 dark:bg-purple-400';
     isSpecial = true;
  } else if (isUser && !isCorrect && !derivedIsUserIncorrect) { // Fallback for user choice if logic missed something
    bgBarColor = 'bg-indigo-500 dark:bg-indigo-400';
     isSpecial = true;
  }

  // 2. Determine Labels (Generated independently of bar color)
  let userLabel = isUser ? (
    <span className={`flex items-center text-xs font-semibold ml-2 px-2 py-0.5 rounded-full [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] bg-white/20 text-white`}>
      {/* Icon reflects correctness of user's choice */}
      {isCorrect ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
      Your Answer
    </span>
  ) : null;

  let searchedLabel = isSearchedUserAnswer ? (
    <span className="flex items-center text-xs font-semibold text-white ml-2 bg-white/20 px-2 py-0.5 rounded-full [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">
      <Search className="w-3.5 h-3.5 mr-1" /> Searched
    </span>
  ) : null;


  // 3. Determine Text Color based on whether the bar is 'special' (colored)
  const textColor = isSpecial ? 'text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]' : 'text-slate-700 dark:text-slate-200';
  const statsColor = isSpecial ? 'text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]' : 'text-slate-500 dark:text-slate-400';
  const hostButtonColor = isSpecial ? 'text-white/80 hover:bg-white/20' : 'text-slate-500 hover:bg-slate-300 dark:text-slate-400 dark:hover:bg-slate-600';

  return (
    // Base container
    <div className="relative w-full mb-3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700/50">
      {/* Animated Background fill */}
      <motion.div
        className={`absolute top-0 left-0 h-full ${bgBarColor}`}
        initial={{ width: '0%' }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Content (Overlaid) */}
      <div className="relative z-10 p-4">
          <div className="flex items-center justify-between w-full">
            {/* Left side: Icon, Text, and Labels */}
            <div className="flex items-center min-w-0 flex-1 flex-wrap">
                {/* --- NEW: Correct Answer Icon --- */}
                {isCorrect && (
                  <CheckCircle className={`w-5 h-5 mr-2 flex-shrink-0 ${isSpecial ? 'text-green-700' : 'text-green-600 dark:text-green-500'}`} />
                )}
                {/* --- END NEW --- */}
                <span className={`text-base font-semibold ${textColor} break-words pr-2 ${!isCorrect ? 'ml-7' : ''}`}>{text}</span> {/* Add margin if no icon */}
                {/* Display other labels */}
                <div className="flex flex-shrink-0 items-center">
                    {/* correctLabel is removed, icon serves the purpose */}
                    {userLabel}
                    {searchedLabel}
                </div>
            </div>

            {/* Right side: Host Button and Stats */}
            <div className="relative z-10 flex items-center flex-shrink-0 pl-3">
               {isHost && usernames.length > 0 && (
                 <button
                   onClick={onShowUsersClick}
                   className={`p-2 mr-3 rounded-full transition-colors ${hostButtonColor}`}
                   title={`View ${usernames.length} users who chose this`}
                 >
                   <Eye className="w-5 h-5" />
                 </button>
               )}
              <div className={`font-mono text-lg font-bold whitespace-nowrap ${textColor}`}>
                  {percent}%
              </div>
              <div className={`font-mono text-sm whitespace-nowrap ml-2 ${statsColor}`}>
                  ({count})
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};
// ## --- END OF OptionBar FIX --- ##


// ## QuestionCard (Unchanged - uses updated OptionBar) ##
const QuestionCard = ({
  q,
  idx,
  totalNumQuestions,
  isHost,
  highlightedUserAnswerIndex
}) => {
  const validOptionCounts = q.optionCounts || {};
  const totalVotes = Object.values(validOptionCounts).reduce((a, b) => a + b, 0);
  const [modalState, setModalState] = useState({ isOpen: false, usernames: [], optionText: "" });
  const handleShowUsers = (usernames, optionText) => setModalState({ isOpen: true, usernames, optionText });
  const handleCloseModal = () => setModalState({ isOpen: false, usernames: [], optionText: "" });

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl mb-6 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700/50">
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1.5 block uppercase tracking-wider">
            Question {idx + 1} / {totalNumQuestions}
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 break-words">{q.text}</h3>
        </div>
        <div className="p-5 sm:p-6">
          {Array.isArray(q.options) && q.options.map((opt, i) => {
            const count = validOptionCounts[i] || 0;
            const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isCorrect = typeof q.correctAnswerIndex === 'number' && i === q.correctAnswerIndex;
            const isUser = typeof q.userAnswerIndex === 'number' && i === q.userAnswerIndex;
            // isUserIncorrect is derived inside OptionBar now
            const usernamesForOption = (isHost && q.usernames && Array.isArray(q.usernames[i])) ? q.usernames[i] : [];
            const isSearchedUserAnswer = (isHost && typeof highlightedUserAnswerIndex === 'number' && i === highlightedUserAnswerIndex);

            return (
              <OptionBar
                key={i}
                text={opt}
                percent={percent}
                count={count}
                isCorrect={isCorrect}
                isUser={isUser}
                usernames={usernamesForOption}
                isHost={isHost}
                onShowUsersClick={() => handleShowUsers(usernamesForOption, opt)}
                isSearchedUserAnswer={isSearchedUserAnswer}
              />
            );
          })}
        </div>
      </div>
      <UserListModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        usernames={modalState.usernames}
        optionText={modalState.optionText}
      />
    </>
  );
};

// ## ContentSkeleton (Unchanged) ##
const ContentSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
             <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-200/50 dark:bg-slate-800 dark:border-slate-700/50">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700/50">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-3"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded-xl w-full"></div>
                    <div className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded-xl w-full"></div>
                    <div className="h-12 bg-slate-100 dark:bg-slate-700/50 rounded-xl w-full"></div>
                </div>
            </div>
        ))}
    </div>
);


// ## Main AnalyticsPage Component (Core logic unchanged) ##
const AnalyticsPage = ({ sessionId, quizTitle: initialQuizTitle, score: initialScore, totalQuestions: initialTotalQuestions, onNavigate, isHost = false }) => {
  // --- All original logic, state, and effects are 100% PRESERVED ---
  const { user } = useAuth();
  const { apiCall } = useAPI();
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  const [displayScore, setDisplayScore] = useState(initialScore);
  const [displayTotal, setDisplayTotal] = useState(initialTotalQuestions);
  const [displayTitle, setDisplayTitle] = useState(initialQuizTitle);

  const [userSearchInput, setUserSearchInput] = useState("");
  const [searchedUser, setSearchedUser] = useState("");

  const allUserAnswersMap = useMemo(() => {
    if (!isHost || !analytics || !analytics.length) return {};
    const answerMap = {};
    analytics.forEach((question, qIndex) => {
      const usernameMap = question.usernames || {};
      for (const optionIndex in usernameMap) {
        const users = usernameMap[optionIndex] || [];
        users.forEach(username => {
          const lowerUser = username.toLowerCase().trim();
          if (!lowerUser) return;
          const existingAnswers = answerMap[lowerUser] || {};
          answerMap[lowerUser] = { ...existingAnswers, [qIndex]: parseInt(optionIndex, 10) };
        });
      }
    });
    return answerMap;
  }, [isHost, analytics]);

  const highlightedUserAnswerMap = allUserAnswersMap[searchedUser.toLowerCase().trim()] || null;

  const handleUserSearch = (e) => { e.preventDefault(); setSearchedUser(userSearchInput); };

  useEffect(() => {
    if (!sessionId || !user?.username) {
      setError("Session ID or user information is missing.");
      setLoading(false);
      return;
    }
    const fetchAnalyticsData = async () => {
      setLoading(true); setError(null); setAnalytics(null); setLeaderboard(null);
      try {
        const analyticsUrl = `/sessions/${sessionId}/${user.username}/analytics`;
        const data = await apiCall(analyticsUrl, { method: 'GET' });
        if (!data || typeof data !== 'object') throw new Error("Invalid response structure.");
        data.questions = Array.isArray(data.questions) ? data.questions : [];
        data.leaderboard = Array.isArray(data.leaderboard) ? data.leaderboard : [];
        if (!data.questions && !data.leaderboard && !data.quizTitle) throw new Error("Essential data missing."); // Check quizTitle too if needed

        setAnalytics(data.questions); setLeaderboard(data.leaderboard);

        if (!isHost) {
          try {
              const attemptUrl = `/quiz/${user.username}/AttemptedQuiz/${sessionId}/quizAttempt`;
              const attemptData = await apiCall(attemptUrl, { method: 'GET' });
              if (attemptData && typeof attemptData.score === 'number' && typeof attemptData.totalQuestions === 'number') {
                  setDisplayScore(attemptData.score); setDisplayTotal(attemptData.totalQuestions); setDisplayTitle(attemptData.quizTitle || initialQuizTitle || "Quiz Results");
              } else { setDisplayScore(initialScore); setDisplayTotal(initialTotalQuestions); setDisplayTitle(initialQuizTitle || "Quiz Results"); }
          } catch (attemptErr) {
               console.warn("Could not fetch attempt details:", attemptErr);
               setDisplayScore(initialScore); setDisplayTotal(initialTotalQuestions); setDisplayTitle(initialQuizTitle || "Quiz Results");
          }
        } else {
             // Use quizTitle from analytics data if available, fallback to initial prop, then generic
             setDisplayTitle(data.quizTitle || initialQuizTitle || "Quiz Analytics");
             setDisplayScore(null);
             setDisplayTotal((data.questions && data.questions.length > 0) ? data.questions.length : (initialTotalQuestions || 0));
        }
      } catch (err) {
        console.error("Failed fetch:", err); setError(`Failed to load: ${err.message || 'Unknown'}.`); setAnalytics([]); setLeaderboard([]);
      } finally { setLoading(false); }
    };
    fetchAnalyticsData();
  }, [sessionId, user, apiCall, isHost, initialScore, initialTotalQuestions, initialQuizTitle]);
  // --- End of original logic ---

  // --- Loading State (Unchanged) ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <div className="flex flex-col items-center text-slate-600 dark:text-slate-400">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
              <p className="text-lg font-medium">Loading Analytics...</p>
          </div>
      </div>
    );
  }

  // --- Error State (Unchanged) ---
   if (error) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/10 p-4">
         <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md border border-red-200 dark:border-red-700/50">
           <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
           <h2 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-3">Loading Failed</h2>
           <p className="text-slate-600 dark:text-slate-400 mb-8 text-base">{error}</p>
           <button
             className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
             onClick={() => onNavigate('dashboard')}
           >
             Back to Dashboard
           </button>
         </div>
       </div>
     );
   }

  const noQuestionData = !analytics || analytics.length === 0;
  const noLeaderboardData = !leaderboard || leaderboard.length === 0;

  // --- Empty State (Unchanged) ---
  if (noQuestionData && noLeaderboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md border dark:border-slate-700/50">
           <BarChart2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">No Analytics Data</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-base">
            No participant data was recorded for session <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">{sessionId}</span>.
          </p>
          <button
            className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            onClick={() => onNavigate('dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 md:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-5xl mx-auto">

        {/* --- Dashboard Header Grid (Unchanged) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-700/50">
            <button
              className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold border border-slate-300 hover:bg-slate-200 transition-colors shadow-sm dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 mb-6"
              onClick={() => onNavigate('dashboard')}
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight tracking-tight">{displayTitle || 'Quiz Analytics'}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-base md:text-lg">
              {isHost ? "Session overall performance" : "Your results breakdown"}
            </p>
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
              Session Code: <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">{sessionId}</span>
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center">
            {isHost ? <HostIndicator /> : ((typeof displayScore === 'number' && typeof displayTotal === 'number' && displayTotal >= 0) ? <ScoreCircle score={displayScore} total={displayTotal} /> : <div className="text-center text-slate-500 dark:text-slate-400 p-4 h-40 w-40 flex items-center justify-center font-medium bg-slate-100 dark:bg-slate-800 rounded-full">Score N/A</div>)}
          </div>
        </div>

        {/* --- Tab Switcher (Unchanged) --- */}
        <div className="flex justify-center mb-10">
           <nav className="relative flex p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl max-w-sm w-full backdrop-blur-sm">
             <button onClick={() => setActiveTab('details')} disabled={noQuestionData} className={`relative z-10 w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 text-sm ${ activeTab === 'details' ? 'text-indigo-700 dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200' } ${noQuestionData ? 'opacity-50 cursor-not-allowed' : ''}`}>
               <BarChart2 className="w-5 h-5" /><span>Breakdown</span>
             </button>
             <button onClick={() => setActiveTab('leaderboard')} disabled={noLeaderboardData} className={`relative z-10 w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 text-sm ${ activeTab === 'leaderboard' ? 'text-indigo-700 dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200' } ${noLeaderboardData ? 'opacity-50 cursor-not-allowed' : ''}`}>
               <Trophy className="w-5 h-5" /><span>Leaderboard</span>
             </button>
             <motion.div layoutId="active-tab-pill" className="absolute inset-0 p-1.5" transition={{ type: "spring", stiffness: 380, damping: 30 }}>
               <div className={`w-1/2 h-full bg-white dark:bg-white rounded-lg shadow-md ${ activeTab === 'leaderboard' ? 'translate-x-full' : 'translate-x-0' } transition-transform duration-300 ease-in-out`}/>
             </motion.div>
           </nav>
        </div>

        {/* --- Content Area --- */}
        <div>
            {activeTab === 'details' && !noQuestionData && (
                <div>
                   {/* --- Host Search Bar (Unchanged) --- */}
                   {isHost && (
                    <form onSubmit={handleUserSearch} className="mb-8 relative">
                      <input
                        type="text"
                        placeholder="Search by username to highlight answers..."
                        className="w-full pl-12 pr-36 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition duration-150 ease-in-out shadow-sm"
                        value={userSearchInput}
                        onChange={e => setUserSearchInput(e.target.value)}
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <button
                        type="submit"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 dark:shadow-none transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                      >
                        Search
                      </button>
                    </form>
                   )}
                   {isHost && searchedUser && (
                    <div className="mb-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 text-center flex items-center justify-between">
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                        {highlightedUserAnswerMap
                          ? <>Highlighting answers for <span className="font-bold">"{searchedUser}"</span></>
                          : <>No answers found for <span className="font-bold">"{searchedUser}"</span></>
                        }
                      </p>
                       <button
                         onClick={() => { setSearchedUser(""); setUserSearchInput(""); }}
                         className="flex-shrink-0 ml-4 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                       >
                         (Clear)
                       </button>
                    </div>
                   )}

                   <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 sr-only">Question Breakdown</h2>
                    {loading ? <ContentSkeleton /> : analytics.map((q, idx) => (
                      <QuestionCard
                        key={idx}
                        q={q}
                        idx={idx}
                        totalNumQuestions={analytics.length}
                        isHost={isHost}
                        highlightedUserAnswerIndex={highlightedUserAnswerMap ? highlightedUserAnswerMap[idx] : null}
                      />
                    ))}
                </div>
            )}
            {activeTab === 'details' && noQuestionData && (
                 <div className="text-center text-slate-500 dark:text-slate-400 py-12 px-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md border dark:border-slate-700/50">
                    <BarChart2 className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" />
                    <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">Question breakdown is not available.</p>
                    <p className="mt-1">This may be because no questions were presented in this session.</p>
                 </div>
            )}

            {activeTab === 'leaderboard' && (
                <Leaderboard data={leaderboard} currentUser={isHost ? null : user?.username} />
            )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;