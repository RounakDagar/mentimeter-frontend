// src/pages/HostedQuizAnalyticsPage.js
import { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft,
  ListChecks,
  RefreshCw,
  Loader2,
  Trophy,
  UserCircle,
  Search,
  XCircle,
  Eye,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useAPI } from "../hooks/useAPI";
// New Dependency for animated tabs
import { motion, AnimatePresence } from 'framer-motion';
// Recharts imports remain the same
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';


// ##################################################################
// ## RE-STYLED REUSABLE COMPONENTS (PREMIUM VERSION) ##
// ##################################################################

// --- Chart Colors ---
const COLORS_LIGHT = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const COLORS_DARK = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#F472B6'];

// --- UserListModal (Premium Styling) ---
const UserListModal = ({ isOpen, onClose, usernames, optionText }) => {
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => { if (isOpen) setSearchTerm(""); }, [isOpen]);

  // Use AnimatePresence for smooth entry/exit
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200/50 dark:border-gray-800/50"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start p-5 border-b border-gray-200 dark:border-gray-800/50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Users who chose:
                </h3>
                <p className="text-base text-indigo-600 dark:text-indigo-400 font-medium break-words">
                  "{optionText}"
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800/50">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${usernames.length} users...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            {/* User List */}
            <div className="p-4 max-h-72 overflow-y-auto">
              {usernames.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                <ul className="space-y-2">
                  {usernames
                    .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((name, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-2.5 p-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    >
                      <UserCircle className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium text-sm break-all">{name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                  {searchTerm ? `No users match "${searchTerm}".` : "No users to display."}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- HostIndicator (Premium Styling) ---
const HostIndicator = () => {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <div className="absolute w-full h-full rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-lg flex items-center justify-center">
        <div className="text-center">
            <UserCircle className="w-14 h-14 mx-auto text-indigo-500 dark:text-indigo-400" />
            <p className="text-3xl font-bold text-gray-900 mt-1 dark:text-gray-100">Host</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">View</p>
        </div>
      </div>
    </div>
  );
};

// --- OptionBar (Premium Styling) ---
const OptionBar = ({
  text, percent, count, isCorrect, usernames = [],
  isHost, onShowUsersClick, isSearchedUserAnswer
}) => {
  let stateClasses = 'bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700/50';
  let label = null;
  let textColor = 'text-gray-900 dark:text-gray-100';
  const safePercent = (isFinite(percent) && percent >= 0) ? percent : 0;

  if (isCorrect) {
    stateClasses = 'bg-green-50 dark:bg-green-900/40 ring-2 ring-green-500';
    textColor = 'text-green-800 dark:text-green-300 font-semibold';
    label = <span className="flex items-center text-xs font-semibold text-green-700 dark:text-green-400 ml-2 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Correct</span>;
  }
  if (isSearchedUserAnswer) {
     stateClasses = 'bg-purple-50 dark:bg-purple-900/40 ring-2 ring-purple-500';
     if (!isCorrect) textColor = 'text-purple-800 dark:text-purple-300 font-semibold';
     label = <>{label}<span className="flex items-center text-xs font-semibold text-purple-700 dark:text-purple-400 ml-2 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full"><Search className="w-3.5 h-3.5 mr-1" /> Searched</span></>;
  }

  return (
    <div className={`relative w-full rounded-xl ${stateClasses} overflow-hidden transition-all duration-150 ease-in-out`}>
      <motion.div
        className={`absolute top-0 left-0 h-full ${
            isCorrect ? 'bg-green-500' : (isSearchedUserAnswer ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-700')
        } opacity-20 dark:opacity-25`}
        initial={{ width: '0%' }}
        animate={{ width: `${safePercent}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <div className="relative z-10 p-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center min-w-0 flex-1">
                <span className={`text-base font-medium ${textColor} break-words pr-2`}>{text}</span>
                <div className="flex-shrink-0">{label}</div>
            </div>
            <div className="relative z-10 flex items-center flex-shrink-0 pl-3">
               {isHost && usernames.length > 0 && (
                 <button
                   onClick={onShowUsersClick}
                   className="p-2 mr-3 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                   title={`View ${usernames.length} users who chose this`}
                 >
                   <Eye className="w-5 h-5" />
                 </button>
               )}
              <div className="font-mono text-lg font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {safePercent}%
              </div>
              <div className="font-mono text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                  ({count})
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};


// --- QuestionCard (Premium Styling) ---
const QuestionCard = ({ q, idx, totalNumQuestions, isHost, highlightedUserAnswerIndex }) => {
  // elint-disable-line
  const validOptionCounts = useMemo(() => q.optionCounts || {}, [q.optionCounts]);
  const totalVotes = Object.values(validOptionCounts).reduce((a, b) => a + b, 0);
  const [modalState, setModalState] = useState({ isOpen: false, usernames: [], optionText: "" });
  const handleShowUsers = (usernames, optionText) => setModalState({ isOpen: true, usernames, optionText });
  const handleCloseModal = () => setModalState({ isOpen: false, usernames: [], optionText: "" });

  // Determine chart colors based on theme (assuming theme context is available or passed)
  // Replace with actual theme check if available: `const isDarkMode = theme === 'dark';`
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches; // Simple fallback
  const chartColors = isDarkMode ? COLORS_DARK : COLORS_LIGHT;

  const chartData = useMemo(() => {
     if (!q || !q.options || !validOptionCounts) return [];
     return q.options.map((opt, i) => ({
        name: opt || `Option ${i+1}`,
        count: validOptionCounts[i] || 0
     }));
  }, [q, validOptionCounts]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: idx * 0.05 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl mb-8 border border-gray-200/50 dark:border-gray-800/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:ring-2 hover:ring-indigo-500/10 dark:hover:ring-indigo-500/10"
      >
        {/* Card Header */}
        <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-gray-800/50">
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1.5 block uppercase tracking-wider">
            Question {idx + 1} / {totalNumQuestions}
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 break-words">{q.text}</h3>
        </div>
        {/* Card Body with Options and Charts */}
        <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Options Section */}
                <div className="space-y-3">
                     <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Responses</h4>
                     {Array.isArray(q.options) && q.options.map((opt, i) => {
                        const count = validOptionCounts[i] || 0;
                        const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        const isCorrect = typeof q.correctAnswerIndex === 'number' && i === q.correctAnswerIndex;
                        const usernamesForOption = (isHost && q.usernames && Array.isArray(q.usernames[i])) ? q.usernames[i] : [];
                        const isSearchedUserAnswer = (isHost && typeof highlightedUserAnswerIndex === 'number' && i === highlightedUserAnswerIndex);

                        return (
                        <OptionBar
                            key={i} text={opt} percent={percent} count={count}
                            isCorrect={isCorrect} isUser={false} isUserIncorrect={false}
                            usernames={usernamesForOption} isHost={isHost}
                            onShowUsersClick={() => handleShowUsers(usernamesForOption, opt)}
                            isSearchedUserAnswer={isSearchedUserAnswer}
                        />
                        );
                    })}
                </div>
                 {/* Charts Section */}
                <div className="space-y-6">
                    <div className="w-full h-64">
                         <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Distribution</h4>
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} fill="#8884d8" paddingAngle={3} labelLine={false} /*label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}*/>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} className="focus:outline-none" />
                                ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                     {/*<div className="w-full h-64">
                        <h4 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Counts</h4>
                         <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                                <XAxis type="number" stroke="#94A3B8" fontSize={10} />
                                <YAxis dataKey="name" type="category" interval={0} width={80} stroke="#94A3B8" fontSize={10} />
                                <Tooltip />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                ))}
                                </Bar>
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>*/}
                </div>
            </div>
        </div>
      </motion.div>

      <UserListModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        usernames={modalState.usernames}
        optionText={modalState.optionText}
      />
    </>
  );
};



// --- EmptyState (Premium Styling) ---
const EmptyState = ({ icon: Icon, title, message }) => (
  <div className="text-center py-16 bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-800 mt-6">
    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800">
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">{message}</p>
  </div>
);

// --- Leaderboard (Premium Styling) ---
const Leaderboard = ({ leaderboard }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-800/50">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
      <Trophy className="w-6 h-6 mr-3 text-amber-500" />
      Leaderboard
    </h2>
    {leaderboard.length === 0 ? (
       <p className="text-gray-500 dark:text-gray-400 text-center py-10">No participant data available for the leaderboard.</p>
    ) : (
      <ol className="space-y-4">
        {leaderboard.map((entry, index) => (
          <motion.li
            key={entry.name || index} // Use name as key if available
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`flex justify-between items-center p-4 rounded-lg ${
                index === 0 ? 'bg-gradient-to-r from-amber-100 to-yellow-50 dark:from-amber-900/50 dark:to-yellow-900/30 border-l-4 border-amber-400' :
                index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800/50 dark:to-gray-800/30 border-l-4 border-gray-400' :
                index === 2 ? 'bg-gradient-to-r from-orange-100 to-red-50 dark:from-orange-900/50 dark:to-red-900/30 border-l-4 border-orange-400' :
                'bg-gray-50 dark:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center space-x-4">
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-amber-400 text-white shadow-md' :
                    index === 1 ? 'bg-gray-400 text-white shadow-md' :
                    index === 2 ? 'bg-orange-400 text-white shadow-md' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                    {index + 1}
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px] sm:max-w-xs" title={entry.name}>
                    {entry.name || 'Anonymous'}
                </span>
            </div>
            <span className="font-semibold text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex-shrink-0 dark:bg-indigo-900/50 dark:text-indigo-400">
              {entry.score} pts
            </span>
          </motion.li>
        ))}
      </ol>
    )}
  </div>
);

// --- Full Page Loader ---
const FullPageLoader = () => (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-black p-4 font-sans">
        <div className="flex flex-col items-center text-gray-600 dark:text-gray-400">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
            <p className="text-lg font-medium">Loading Analytics...</p>
        </div>
    </div>
);

// --- Full Page Error ---
const FullPageError = ({ error, onNavigate }) => (
     <div className="min-h-screen w-full flex items-center justify-center bg-red-50 dark:bg-red-900/10 p-4 font-sans">
         <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-red-200 dark:border-red-700/50">
             <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">An Error Occurred</h2>
             <p className="text-gray-600 dark:text-gray-400 mb-8 text-base">{error}</p>
             <button
                 onClick={() => onNavigate('dashboard')}
                 className="flex items-center justify-center w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
             >
                 <ChevronLeft className="w-4 h-4 mr-1.5" />
                 Back to Dashboard
             </button>
         </div>
     </div>
);


// ##################################################################
// ## MAIN PAGE: HostedQuizAnalyticsPage (PREMIUM REDESIGN) ##
// ##################################################################
const HostedQuizAnalyticsPage = ({ quizId, quizTitle, joinCode, username, onNavigate }) => {
  // --- Original State and Logic (Preserved) ---
  const { apiCall } = useAPI();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hostingAgain, setHostingAgain] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [userSearchInput, setUserSearchInput] = useState("");
  const [searchedUser, setSearchedUser] = useState("");

  const allUserAnswersMap = useMemo(() => {
    if (!analytics || !analytics.questions || !analytics.questions.length) return {};
    const answerMap = {};
    analytics.questions.forEach((question, qIndex) => {
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
  }, [analytics]);

  const highlightedUserAnswerMap = allUserAnswersMap[searchedUser] || null;

  const handleUserSearch = (e) => {
    e.preventDefault();
    setSearchedUser(userSearchInput.toLowerCase().trim());
  };

  useEffect(() => {
    if (!joinCode || !username) {
      console.warn("Analytics: Missing joinCode or username. Skipping API call.");
      setLoading(false); return;
    }
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
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
    if (!quizId) return;
    setHostingAgain(true);
    try {
      const response = await apiCall('/sessions', { method: 'POST', body: JSON.stringify({ quizId }) });
      onNavigate('host', { joinCode: response.joinCode, quizId });
    } catch (err) { console.error("Failed to host again:", err); } finally { setHostingAgain(false); }
  };

  const noQuestionData = !analytics || !analytics.questions || analytics.questions.length === 0;
  const noLeaderboardData = !analytics || !analytics.leaderboard || analytics.leaderboard.length === 0;

  useEffect(() => {
    if (!loading) {
      if (activeTab === 'details' && noQuestionData && !noLeaderboardData) setActiveTab('leaderboard');
      else if (activeTab === 'leaderboard' && noLeaderboardData && !noQuestionData) setActiveTab('details');
    }
  }, [loading, activeTab, noQuestionData, noLeaderboardData]);
  // --- End of Original Logic ---


  // --- Loading State ---
  if (loading) return <FullPageLoader />;

  // --- Error State ---
  if (!analytics && !loading) return <FullPageError error="Failed to load analytics data." onNavigate={onNavigate} />;


  // --- Main Render (Premium Re-styled) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-black dark:to-gray-900 py-12 md:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-6xl mx-auto">

         {/* --- Back Button --- */}
         <div className="mb-6">
            <button type="button" onClick={() => onNavigate('dashboard')} disabled={hostingAgain} className="flex items-center px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors">
                <ChevronLeft className="w-5 h-5 mr-1" /> Dashboard
            </button>
        </div>

        {/* --- Header Card (Glassmorphism) --- */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 md:p-8 mb-10 border border-gray-200/50 dark:border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight tracking-tight">{quizTitle || 'Quiz Analytics'}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-base md:text-lg">
              Session Performance Overview
            </p>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Session Code: <span className="font-mono font-semibold text-gray-500 dark:text-gray-400">{joinCode}</span>
            </p>
             <button onClick={handleHostAgain} disabled={hostingAgain || loading} className="mt-5 inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/30 dark:shadow-none disabled:opacity-50 text-sm">
              {hostingAgain ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <RefreshCw className="w-5 h-5 mr-2" />}
              {hostingAgain ? 'Starting...' : 'Host Again'}
            </button>
          </div>
          <div className="flex-shrink-0"> <HostIndicator /> </div>
        </div>

        {/* --- Tabs (Animated Underline) --- */}
        <div className="flex justify-center mb-10 border-b border-gray-200 dark:border-gray-800">
            <div className="flex space-x-4">
                {['details', 'leaderboard'].map((tab) => {
                    const isDisabled = (tab === 'details' && noQuestionData) || (tab === 'leaderboard' && noLeaderboardData);
                    const isActive = activeTab === tab;
                    const Icon = tab === 'details' ? ListChecks : Trophy;
                    const label = tab === 'details' ? 'Breakdown' : 'Leaderboard';

                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            disabled={isDisabled}
                            className={`relative px-3 py-4 text-sm font-semibold transition-colors flex items-center space-x-2 ${
                                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? '' : ''}`} />
                            <span>{label}</span>
                            {isActive && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                                    layoutId="underline"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>


        {/* --- Content Area --- */}
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
                {activeTab === 'details' && (
                    <div>
                    {noQuestionData ? (
                        <EmptyState icon={ListChecks} title="No Question Data" message="No questions were answered in this session." />
                    ) : (
                        <>
                        <form onSubmit={handleUserSearch} className="mb-8 relative">
                            <input type="text" placeholder="Search by username to highlight answers..." className="w-full pl-12 pr-32 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none transition duration-150 ease-in-out" value={userSearchInput} onChange={e => setUserSearchInput(e.target.value)} />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20 dark:shadow-none transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                            Search
                            </button>
                        </form>

                        {searchedUser && (
                            <div className="mb-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 text-center flex items-center justify-between">
                            <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                                {highlightedUserAnswerMap ? <>Highlighting answers for <span className="font-bold">"{userSearchInput}"</span></> : <>No answers found for <span className="font-bold">"{userSearchInput}"</span></>}
                            </p>
                            <button onClick={() => { setSearchedUser(""); setUserSearchInput(""); }} className="flex-shrink-0 ml-4 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">(Clear)</button>
                            </div>
                        )}

                        {analytics.questions.map((q, idx) => (
                            <QuestionCard key={idx} q={q} idx={idx} totalNumQuestions={analytics.questions.length} isHost={true} highlightedUserAnswerIndex={highlightedUserAnswerMap ? highlightedUserAnswerMap[idx] : null} />
                        ))}
                        </>
                    )}
                    </div>
                )}

                {activeTab === 'leaderboard' && (
                    <div>
                    {noLeaderboardData ? (
                        <EmptyState icon={Trophy} title="No Leaderboard Data" message="No participant scores were recorded." />
                    ) : (
                        <Leaderboard leaderboard={analytics.leaderboard} />
                    )}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default HostedQuizAnalyticsPage;