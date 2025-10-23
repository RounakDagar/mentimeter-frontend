import React, { useEffect, useState, useMemo } from 'react';
import { 
  Check, 
  X, 
  ChevronLeft, 
  UserCircle, 
  ListChecks, 
  Trophy, 
  Loader2, 
  AlertTriangle, 
  Users, // Kept for new features
  Search, // NEW: Added for search
  XCircle // NEW: Added for modal close
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../hooks/useAPI';
import Leaderboard from '../pages/Leaderboard'; // Ensure this path is correct

// ## NEW Component: UserListModal ##
// A modal to display a searchable list of usernames
const UserListModal = ({ isOpen, onClose, usernames, optionText }) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredUsers = usernames.filter(name =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Backdrop
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()} // Prevent click from closing modal
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Users who chose:
            </h3>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">"{optionText}"</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b dark:border-slate-700">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${usernames.length} users...`}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* User List */}
        <div className="p-4 max-h-64 overflow-y-auto">
          {filteredUsers.length > 0 ? (
            <ul className="space-y-2">
              {filteredUsers.map((name, index) => (
                <li 
                  key={index}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-md text-slate-700 dark:text-slate-300 font-medium text-sm"
                >
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 text-sm py-4">
              No users match "{searchTerm}".
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


// ## ScoreCircle Component ## (No changes)
const ScoreCircle = ({ score, total }) => {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const radius = 55;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="transform -rotate-90" width={130} height={130}>
        <circle
          cx={65} cy={65} r={radius}
          stroke="#e5e7eb" strokeWidth={stroke} fill="none"
          className="dark:stroke-slate-700"
        />
        <circle
          cx={65} cy={65} r={radius}
          stroke="#4f46e5" strokeWidth={stroke} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-stroke-offset duration-1000 ease-out dark:stroke-indigo-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{score}</span>
        <span className="text-md text-slate-500 dark:text-slate-400">/ {total}</span>
      </div>
    </div>
  );
};

// ## HostIndicator Component ## (No changes)
const HostIndicator = () => {
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <div className="absolute w-full h-full rounded-full bg-slate-100 border-4 border-slate-200 flex items-center justify-center dark:bg-slate-700 dark:border-slate-600">
        <div className="text-center">
            <UserCircle className="w-10 h-10 mx-auto text-indigo-500 dark:text-indigo-400" />
            <p className="text-2xl font-bold text-slate-800 mt-1 dark:text-slate-100">Host</p>
        </div>
      </div>
    </div>
  );
};


// ## MODIFIED: OptionBar Component ##
const OptionBar = ({ 
  text, 
  percent, 
  count, 
  isCorrect, 
  isUser, 
  isUserIncorrect, 
  usernames = [], // Keep usernames prop for the modal
  isHost, // NEW: To know when to show user list icon
  onShowUsersClick, // NEW: Handler to open modal
  isSearchedUserAnswer // NEW: To show host search result
}) => {
  let ringColor = 'ring-slate-200 dark:ring-slate-700';
  let bgBarColor = 'bg-slate-100 dark:bg-slate-700/50';
  let label = null;
  let textColor = 'text-slate-800 dark:text-slate-100';

  // --- Correct Answer Styling ---
  if (isCorrect) {
    ringColor = 'ring-green-500 dark:ring-green-400';
    bgBarColor = 'bg-green-100 dark:bg-green-900/50';
    textColor = 'text-green-800 dark:text-green-300 font-semibold';
    label = (
      <span className="flex items-center text-xs font-semibold text-green-700 dark:text-green-400 ml-2 bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded-full">
        <Check className="w-3 h-3 mr-1" /> Correct
      </span>
    );
  }

  // --- Participant's Answer Styling ---
  if (isUser) {
    ringColor = 'ring-indigo-500 dark:ring-indigo-400 ring-2';
    if (!isCorrect) {
         bgBarColor = 'bg-indigo-50 dark:bg-indigo-900/40';
         textColor = 'text-indigo-800 dark:text-indigo-300 font-semibold';
    }
    label = (
      <span className={`flex items-center text-xs font-semibold ml-2 px-1.5 py-0.5 rounded-full ${
          isCorrect
            ? 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/50'
            : 'text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50'
        }`}>
        {isCorrect ? <Check className="w-3 h-3 mr-1" /> : <UserCircle className="w-3 h-3 mr-1" />}
        Your Answer
      </span>
    );
  }

  // --- Participant's Incorrect Answer Styling ---
  if (isUserIncorrect) {
    ringColor = 'ring-red-500 dark:ring-red-400 ring-2';
    bgBarColor = 'bg-red-50 dark:bg-red-900/40';
    textColor = 'text-red-800 dark:text-red-300 font-semibold';
    label = (
       <span className="flex items-center text-xs font-semibold text-red-700 dark:text-red-400 ml-2 bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded-full">
        <X className="w-3 h-3 mr-1" /> Your Answer
      </span>
    );
  }

  // --- NEW: Host Searched User's Answer Styling ---
  // This overrides other labels if present, except for "Correct"
  if (isSearchedUserAnswer) {
     ringColor = 'ring-purple-500 dark:ring-purple-400 ring-2';
     if (!isCorrect) {
       bgBarColor = 'bg-purple-50 dark:bg-purple-900/40';
       textColor = 'text-purple-800 dark:text-purple-300 font-semibold';
     }
     // Combine with "Correct" label if also correct
     label = (
      <>
        {label} 
        <span className="flex items-center text-xs font-semibold text-purple-700 dark:text-purple-400 ml-2 bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 rounded-full">
          <Search className="w-3 h-3 mr-1" /> Searched User's Answer
        </span>
      </>
     );
  }


  return (
    <div className={`relative w-full mb-2.5 rounded-lg ring-1 ${ringColor} overflow-hidden transition-all duration-150 ease-in-out`}>
      {/* Background fill */}
      <div
        className={`absolute top-0 left-0 h-full ${bgBarColor} transition-all duration-500 ease-out`}
        style={{ width: `${percent}%` }}
      />
      {/* Content */}
      <div className="relative z-10 p-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center min-w-0"> {/* Allow label truncation */}
                <span className={`font-medium ${textColor} truncate pr-2`}>{text}</span>
                {label}
            </div>
            <div className="relative z-10 flex items-center">
               {/* NEW: Show Users Icon/Button for Host */}
               {isHost && usernames.length > 0 && (
                 <button 
                   onClick={onShowUsersClick}
                   className="p-1.5 mr-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                   title={`View ${usernames.length} users who chose this`}
                 >
                   <Users className="w-4 h-4" />
                 </button>
               )}
              <div className="font-mono text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap pl-2">
                  {percent}% <span className="text-xs text-slate-400 dark:text-slate-500">({count})</span>
              </div>
            </div>
          </div>
          
          {/* REMOVED: The old username pills display is gone */}
      </div>
    </div>
  );
};


// ## MODIFIED: QuestionCard Component ##
const QuestionCard = ({ 
  q, 
  idx, 
  totalNumQuestions, 
  isHost, 
  highlightedUserAnswerIndex // NEW: The answer index for the searched user
}) => {
  const validOptionCounts = q.optionCounts || {};
  const totalVotes = Object.values(validOptionCounts).reduce((a, b) => a + b, 0);

  // --- NEW: State for the UserListModal ---
  const [modalState, setModalState] = useState({
    isOpen: false,
    usernames: [],
    optionText: ""
  });

  const handleShowUsers = (usernames, optionText) => {
    setModalState({ isOpen: true, usernames, optionText });
  };
  
  const handleCloseModal = () => {
    setModalState({ isOpen: false, usernames: [], optionText: "" });
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 transition-shadow hover:shadow-xl">
        <div className="mb-5 flex flex-col">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">Question {idx + 1} / {totalNumQuestions}</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{q.text}</h3>
        </div>
        <div>
          {Array.isArray(q.options) && q.options.map((opt, i) => {
            const count = validOptionCounts[i] || 0;
            const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isCorrect = typeof q.correctAnswerIndex === 'number' && i === q.correctAnswerIndex;
            const isUser = typeof q.userAnswerIndex === 'number' && i === q.userAnswerIndex;
            const isUserIncorrect = isUser && !isCorrect;
            const usernamesForOption = (isHost && q.usernames && Array.isArray(q.usernames[i])) ? q.usernames[i] : [];

            // NEW: Check if this option is the one the searched user chose
            const isSearchedUserAnswer = (isHost && typeof highlightedUserAnswerIndex === 'number' && i === highlightedUserAnswerIndex);

            return (
              <OptionBar
                key={i}
                text={opt}
                percent={percent}
                count={count}
                isCorrect={isCorrect}
                isUser={isUser}
                isUserIncorrect={isUserIncorrect}
                usernames={usernamesForOption}
                isHost={isHost} // Pass isHost
                onShowUsersClick={() => handleShowUsers(usernamesForOption, opt)} // Pass handler
                isSearchedUserAnswer={isSearchedUserAnswer} // Pass search highlight prop
              />
            );
          })}
        </div>
      </div>
      
      {/* NEW: Render the modal */}
      <UserListModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        usernames={modalState.usernames}
        optionText={modalState.optionText}
      />
    </>
  );
};

// ## Skeleton Loader for Content Area ## (No changes)
const ContentSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
             <div key={i} className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-6"></div>
                <div className="space-y-3">
                    <div className="h-10 bg-slate-100 dark:bg-slate-700/50 rounded w-full"></div>
                    <div className="h-10 bg-slate-100 dark:bg-slate-700/50 rounded w-full"></div>
                    <div className="h-10 bg-slate-100 dark:bg-slate-700/50 rounded w-full"></div>
                </div>
            </div>
        ))}
    </div>
);


// ## MODIFIED: Main AnalyticsPage Component ##
const AnalyticsPage = ({ sessionId, quizTitle: initialQuizTitle, score: initialScore, totalQuestions: initialTotalQuestions, onNavigate, isHost = false }) => {
  const { user } = useAuth();
  const { apiCall } = useAPI();
  const [analytics, setAnalytics] = useState(null); // Question breakdown data
  const [leaderboard, setLeaderboard] = useState(null); // Leaderboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'leaderboard'

  // State for potentially fetched data (if participant)
  const [displayScore, setDisplayScore] = useState(initialScore);
  const [displayTotal, setDisplayTotal] = useState(initialTotalQuestions);
  const [displayTitle, setDisplayTitle] = useState(initialQuizTitle);

  // --- NEW: State for Host Search ---
  const [userSearchInput, setUserSearchInput] = useState(""); // Controlled input
  const [searchedUser, setSearchedUser] = useState("");    // The user being searched for

  // --- NEW: Memoized map of all user answers ---
    // --- FIX: This logic is updated to correctly build the answer map ---
  const allUserAnswersMap = useMemo(() => {
    if (!isHost || !analytics || !analytics.length) {
      return {};
    }

    const answerMap = {};
    
    analytics.forEach((question, qIndex) => {
      // q.usernames is { "0": ["userA"], "1": ["userB", "userC"] }
      const usernameMap = question.usernames || {}; 
      
      for (const optionIndex in usernameMap) {
        const users = usernameMap[optionIndex] || [];
        users.forEach(username => {
          // Use trim() to remove hidden spaces
          const lowerUser = username.toLowerCase().trim(); 
          if (!lowerUser) return; // Skip empty usernames

          // Get the existing answers for this user, or a new empty object
          const existingAnswers = answerMap[lowerUser] || {}; 
          
          // Add this new answer to the user's map
          answerMap[lowerUser] = {
            ...existingAnswers, 
            [qIndex]: parseInt(optionIndex, 10)
          };
        });
      }
    });
    return answerMap;
  }, [isHost, analytics]); // Keep 'isHost' and 'analytics' as dependencies

  // Find the answers for the currently searched user
  // Also .trim() the search term here
  const highlightedUserAnswerMap = allUserAnswersMap[searchedUser.toLowerCase().trim()] || null;

  // Handler for the search bar
  const handleUserSearch = (e) => {
    e.preventDefault();
    setSearchedUser(userSearchInput); // Store the raw input
  };

  useEffect(() => {
    if (!sessionId || !user?.username) {
      setError("Session ID or user information is missing.");
      setLoading(false);
      return;
    }

    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      setAnalytics(null);
      setLeaderboard(null);

      try {
        const analyticsUrl = `/sessions/${sessionId}/${user.username}/analytics`;
        const data = await apiCall(analyticsUrl, { method: 'GET' });

        if (!data || typeof data !== 'object') {
             throw new Error("Invalid response structure received from server.");
        }
        if (data.questions !== undefined && !Array.isArray(data.questions)) {
             data.questions = [];
        }
         if (data.leaderboard !== undefined && !Array.isArray(data.leaderboard)) {
             data.leaderboard = [];
         }
         if (!data.questions && !data.leaderboard) {
             throw new Error("Invalid analytics data: Both 'questions' and 'leaderboard' arrays are missing.");
         }

        setAnalytics(data.questions || []);
        setLeaderboard(data.leaderboard || []);

        if (!isHost) {
          try {
              const attemptUrl = `/quiz/${user.username}/AttemptedQuiz/${sessionId}/quizAttempt`;
              const attemptData = await apiCall(attemptUrl, { method: 'GET' });
              if (attemptData && typeof attemptData.score === 'number' && typeof attemptData.totalQuestions === 'number') {
                  setDisplayScore(attemptData.score);
                  setDisplayTotal(attemptData.totalQuestions);
                  setDisplayTitle(attemptData.quizTitle || initialQuizTitle || "Quiz Results");
              } else {
                   setDisplayScore(initialScore);
                   setDisplayTotal(initialTotalQuestions);
                   setDisplayTitle(initialQuizTitle || "Quiz Results");
              }
          } catch (attemptErr) {
               console.warn("Could not fetch specific quiz attempt details, using initial props:", attemptErr);
               setDisplayScore(initialScore);
               setDisplayTotal(initialTotalQuestions);
               setDisplayTitle(initialQuizTitle || "Quiz Results");
          }
        } else {
             setDisplayTitle(initialQuizTitle || data.quizTitle || "Quiz Analytics");
             setDisplayScore(null);
             setDisplayTotal((data.questions && data.questions.length > 0) ? data.questions.length : (initialTotalQuestions || 0));
        }

      } catch (err) {
        console.error("Failed to fetch analytics data:", err);
        setError(`Failed to load analytics: ${err.message || 'Unknown error'}. Please try again later.`);
        setAnalytics([]);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [sessionId, user, apiCall, isHost, initialScore, initialTotalQuestions, initialQuizTitle]);


  // --- Loading State --- (No changes)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 p-4">
          <div className="flex flex-col items-center text-slate-600 dark:text-slate-400">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
              <p className="text-lg font-medium">Loading Analytics...</p>
          </div>
      </div>
    );
  }

  // --- Error State --- (No changes)
   if (error) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/20 p-4">
         <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md max-w-md border border-red-200 dark:border-red-700/50">
           <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
           <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Loading Failed</h2>
           <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
           <button
             className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
             onClick={() => onNavigate('dashboard')}
           >
             Back to Dashboard
           </button>
         </div>
       </div>
     );
   }

  // Determine if there's any data to show
  const noQuestionData = !analytics || analytics.length === 0;
  const noLeaderboardData = !leaderboard || leaderboard.length === 0;

  // --- Empty State (if fetch succeeded but both data arrays are empty) --- (No changes)
  if (noQuestionData && noLeaderboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md max-w-md border dark:border-slate-700">
           <ListChecks className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Analytics Data</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">There is no analytics data available for this session ({sessionId}). It might be that no participants answered.</p>
          <button
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">

       
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-10 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">{displayTitle || 'Quiz Analytics'}</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm md:text-base">
              {isHost ? "Session overall performance" : "Your results breakdown"}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Session Code: <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">{sessionId}</span>
            </p>
          </div>
          <div className="flex-shrink-0">
            {isHost ? (
              <HostIndicator />
            ) : (
               (typeof displayScore === 'number' && typeof displayTotal === 'number' && displayTotal >= 0) ? (
                  <ScoreCircle score={displayScore} total={displayTotal} />
                ) : (
                  <div className="text-center text-slate-500 dark:text-slate-400 p-4 h-36 flex items-center justify-center font-medium">Score N/A</div>
                )
            )}
          </div>
        </div>

        
        <div className="mb-8 flex items-center justify-center space-x-2 md:space-x-4 border-b border-slate-300 dark:border-slate-700 pb-3">
           <button
             onClick={() => setActiveTab('details')}
             disabled={noQuestionData}
             className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg font-semibold transition-colors duration-150 ease-in-out ${
               activeTab === 'details'
                 ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                 : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
             } ${noQuestionData ? 'opacity-50 cursor-not-allowed' : ''}`}
           >
             <ListChecks className="w-5 h-5" />
             <span>Breakdown</span>
           </button>
           <button
             onClick={() => setActiveTab('leaderboard')}
             disabled={noLeaderboardData}
             className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg font-semibold transition-colors duration-150 ease-in-out ${
               activeTab === 'leaderboard'
                 ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                 : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
             } ${noLeaderboardData ? 'opacity-50 cursor-not-allowed' : ''}`}
           >
             <Trophy className="w-5 h-5" />
             <span>Leaderboard</span>
           </button>
        </div>


        {/* --- Content Area (Conditional Rendering) --- */}
        <div className="transition-opacity duration-300 ease-in-out">
            {activeTab === 'details' && !noQuestionData && (
                <div>
                   {/* --- NEW: Host Search Bar --- */}
                   {isHost && (
                    <form onSubmit={handleUserSearch} className="mb-6 relative">
                      <input
                        type="text"
                        placeholder="Search by username to highlight answers..."
                        className="w-full pl-10 pr-28 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={userSearchInput}
                        onChange={e => setUserSearchInput(e.target.value)}
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <button 
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Search
                      </button>
                    </form>
                   )}
                   {/* Info box for searched user */}
                   {isHost && searchedUser && (
                    <div className="mb-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 text-center">
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                        {highlightedUserAnswerMap 
                          ? `Highlighting answers for "${searchedUser}"`
                          : `No answers found for "${searchedUser}"`
                        }
                         <button 
                           onClick={() => { setSearchedUser(""); setUserSearchInput(""); }}
                           className="ml-2 text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                         >
                           (Clear)
                         </button>
                      </p>
                    </div>
                   )}

                   <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 sr-only">Question Breakdown</h2>
                    {analytics.map((q, idx) => (
                      <QuestionCard
                        key={idx}
                        q={q}
                        idx={idx}
                        totalNumQuestions={analytics.length}
                        isHost={isHost}
                        // NEW: Pass the searched user's answer index for this question
                        highlightedUserAnswerIndex={highlightedUserAnswerMap ? highlightedUserAnswerMap[idx] : null}
                      />
                    ))}
                </div>
            )}
             {/* Show message if tab selected but no data */}
            {activeTab === 'details' && noQuestionData && (
                 <div className="text-center text-slate-500 dark:text-slate-400 py-10 px-6 bg-white dark:bg-slate-800 rounded-xl shadow-md border dark:border-slate-700">
                    <ListChecks className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" />
                    <p className="font-semibold">Question breakdown data is not available for this session.</p>
                 </div>
            )}

            {activeTab === 'leaderboard' && (
                <Leaderboard data={leaderboard} currentUser={isHost ? null : user?.username} />
                // Leaderboard component handles its own internal empty state message if data is empty array
            )}
        </div>


        {/* --- Back Button --- */}
        <div className="w-full flex justify-center mt-12">
          <button
            className="flex items-center px-6 py-2.5 bg-white text-slate-700 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"
            onClick={() => onNavigate('dashboard')}
          >
            <ChevronLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;