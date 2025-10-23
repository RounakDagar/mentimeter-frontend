import React, { useEffect, useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  Check, 
  BarChart3, 
  Users, 
  ListChecks, 
  RefreshCw, 
  Loader2,
  Trophy,
  X,
  UserCircle,
  Search, // NEW: Added for search
  XCircle // NEW: Added for modal close
} from "lucide-react";
import { useAPI } from "../hooks/useAPI";

// ## NEW Component: UserListModal ##
const UserListModal = ({ isOpen, onClose, usernames, optionText }) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredUsers = usernames.filter(name =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
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


// ## NEW Component: HostIndicator ## (From AnalyticsPage.jsx)
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

// ## MODIFIED Component: OptionBar ##
const OptionBar = ({ 
  text, 
  percent, 
  count, 
  isCorrect, 
  isUser, 
  isUserIncorrect, 
  usernames = [],
  isHost, // NEW
  onShowUsersClick, // NEW
  isSearchedUserAnswer // NEW
}) => {
  let ringColor = 'ring-slate-200 dark:ring-slate-700';
  let bgBarColor = 'bg-slate-100 dark:bg-slate-700/50';
  let label = null;
  let textColor = 'text-slate-800 dark:text-slate-100';

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

  // (These are kept for component consistency, but will be false)
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
  if (isSearchedUserAnswer) {
     ringColor = 'ring-purple-500 dark:ring-purple-400 ring-2';
     if (!isCorrect) {
       bgBarColor = 'bg-purple-50 dark:bg-purple-900/40';
       textColor = 'text-purple-800 dark:text-purple-300 font-semibold';
     }
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
      <div
        className={`absolute top-0 left-0 h-full ${bgBarColor} transition-all duration-500 ease-out`}
        style={{ width: `${percent}%` }}
      />
      <div className="relative z-10 p-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center min-w-0">
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
          {/* Usernames pills are removed from here */}
      </div>
    </div>
  );
};


// ## MODIFIED Component: QuestionCard ##
const QuestionCard = ({ q, idx, totalNumQuestions, isHost, highlightedUserAnswerIndex }) => {
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
            
            // isUser and isUserIncorrect are false because this is the host view
            const isUser = false;
            const isUserIncorrect = false; 
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
                isHost={isHost}
                onShowUsersClick={() => handleShowUsers(usernamesForOption, opt)}
                isSearchedUserAnswer={isSearchedUserAnswer}
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

// ## NEW Component: ContentSkeleton ## (From AnalyticsPage.jsx)
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

// ## Component: EmptyState ## (No changes)
const EmptyState = ({ title, message }) => (
  <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-slate-600" />
    <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
      {title || "No Analytics Available"}
    </h3>
    <p className="text-gray-600 dark:text-slate-400">
      {message || "There is no analytics data to display for this session."}
    </p>
  </div>
);

// ## MODIFIED Component: Leaderboard ##
// FIX: Changed entry.username to entry.name
const Leaderboard = ({ leaderboard }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
    <h2 className="text-2xl font-semibold mb-5 flex items-center text-slate-900 dark:text-slate-100">
      <Trophy className="w-6 h-6 mr-2 text-amber-500" />
      Leaderboard
    </h2>
    {leaderboard.length === 0 ? (
       <p className="text-gray-500 dark:text-slate-400 text-sm">No participant data available for the leaderboard.</p>
    ) : (
      <ol className="list-decimal list-inside space-y-3">
        {leaderboard.map((entry, index) => (
          <li key={index} className="flex justify-between items-center text-gray-700 dark:text-slate-300">
            <span className="font-medium text-slate-900 dark:text-slate-100 truncate" title={entry.name}>
              {index + 1}. {entry.name}
            </span>
            <span className="font-semibold text-sm bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex-shrink-0 dark:bg-amber-900/50 dark:text-amber-400">
              {entry.score} points
            </span>
          </li>
        ))}
      </ol>
    )}
  </div>
);


// ## MODIFIED Page: HostedQuizAnalyticsPage ##
const HostedQuizAnalyticsPage = ({ quizId, quizTitle, joinCode, username , onNavigate}) => { 
  // FIX: Destructure props from pageProps
  

  const { apiCall } = useAPI();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hostingAgain, setHostingAgain] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // --- NEW: State for Host Search ---
  const [userSearchInput, setUserSearchInput] = useState(""); // Controlled input
  const [searchedUser, setSearchedUser] = useState("");    // The user being searched for

  // --- NEW: Memoized map of all user answers ---
  const allUserAnswersMap = useMemo(() => {
    // This component is always host, so no isHost check needed
    if (!analytics || !analytics.questions || !analytics.questions.length) {
      return {};
    }
    const answerMap = {};
    analytics.questions.forEach((question, qIndex) => {
      const usernameMap = question.usernames || {}; 
      for (const optionIndex in usernameMap) {
        const users = usernameMap[optionIndex] || [];
        users.forEach(username => {
          if (!answerMap[username]) {
            answerMap[username] = {};
          }
          // Use .toLowerCase() for case-insensitive matching
          answerMap[username.toLowerCase()] = { ...answerMap[username.toLowerCase()], [qIndex]: parseInt(optionIndex, 10) };
        });
      }
    });
    return answerMap;
  }, [analytics]);

  // Find the answers for the currently searched user
  const highlightedUserAnswerMap = allUserAnswersMap[searchedUser] || null;

  // Handler for the search bar
  const handleUserSearch = (e) => {
    e.preventDefault();
    setSearchedUser(userSearchInput.toLowerCase());
  };


  useEffect(() => {
    if (!joinCode || !username) {
      console.warn("Analytics: Missing joinCode or username. Skipping API call.");
      setLoading(false); 
      return; 
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // FIX: Corrected API endpoint
        const data = await apiCall(`/sessions/${joinCode}/${username}/analytics`, { method: "GET" });
        setAnalytics(data); 
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setAnalytics(null); 
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [joinCode, username, apiCall]);

  
  const handleHostAgain = async () => {
    if (!quizId) {
      alert('Error: Quiz ID is missing.');
      return;
    }
    setHostingAgain(true);
    try {
      const response = await apiCall('/sessions', {
        method: 'POST',
        body: JSON.stringify({ quizId })
      });
      onNavigate('host', { joinCode: response.joinCode, quizId });
    } catch (err) {
      alert('Failed to create a new session for this quiz.');
      console.error("Failed to host again:", err);
    } finally {
      setHostingAgain(false);
    }
  };

  const noQuestionData = !analytics || !analytics.questions || analytics.questions.length === 0;
  const noLeaderboardData = !analytics || !analytics.leaderboard || analytics.leaderboard.length === 0;

  useEffect(() => {
    if (!loading) {
      if (!noQuestionData) {
        setActiveTab('details');
      } else if (!noLeaderboardData) {
        setActiveTab('leaderboard');
      }
    }
  }, [loading, noQuestionData, noLeaderboardData]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">

        {/* --- Top Summary Card --- */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-10 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">{quizTitle || 'Quiz Analytics'}</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm md:text-base">
              Session overall performance
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Session Code: <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">{joinCode}</span>
            </p>
            <button
              onClick={handleHostAgain}
              disabled={hostingAgain || loading}
              className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
            >
              {hostingAgain ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 mr-2" />
              )}
              {hostingAgain ? 'Starting...' : 'Host Again'}
            </button>
          </div>
          <div className="flex-shrink-0">
            <HostIndicator />
          </div>
        </div>

        {/* --- Tabs --- */}
        <div className="mb-8 flex items-center justify-center space-x-2 md:space-x-4 border-b border-slate-300 dark:border-slate-700 pb-3">
           <button
             onClick={() => setActiveTab('details')}
             disabled={loading || noQuestionData}
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
             disabled={loading || noLeaderboardData}
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

        {/* --- Content Area --- */}
        <div className="transition-opacity duration-300 ease-in-out">
            {loading ? (
              <ContentSkeleton />
            ) : (
              <>
                {activeTab === 'details' && (
                  <div>
                    {noQuestionData ? (
                      <EmptyState title="No Question Data" message="No questions were answered in this session." />
                    ) : (
                      <>
                        {/* --- NEW: Host Search Bar --- */}
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

                        {/* Info box for searched user */}
                        {searchedUser && (
                          <div className="mb-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 text-center">
                            <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                              {highlightedUserAnswerMap 
                                ? `Highlighting answers for "${userSearchInput}"` // Show the input term for casing
                                : `No answers found for "${userSearchInput}"`
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
                      
                        {/* Map over questions */}
                        {analytics.questions.map((q, idx) => (
                          <QuestionCard
                            key={idx}
                            q={q}
                            idx={idx}
                            totalNumQuestions={analytics.questions.length}
                            isHost={true} // Always true for this page
                            highlightedUserAnswerIndex={highlightedUserAnswerMap ? highlightedUserAnswerMap[idx] : null}
                          />
                        ))}
                      </>
                    )}
                  </div>
                )}
                
                {activeTab === 'leaderboard' && (
                  <div>
                    {noLeaderboardData ? (
                      <EmptyState title="No Leaderboard Data" message="No participant scores were recorded." />
                    ) : (
                      <Leaderboard leaderboard={analytics.leaderboard} />
                    )}
                  </div>
                )}
              </>
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

export default HostedQuizAnalyticsPage;