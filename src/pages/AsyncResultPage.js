// src/pages/AsyncResultPage.js
import React, { useEffect, useState } from 'react';
import { 
  ChevronLeft, 
  UserCircle, 
  Loader2, 
  AlertTriangle,
  CheckCircle, // New
  XCircle,    // New
  BarChart2,  // New
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../hooks/useAPI';

// ## Re-styled ScoreCircle Component ##
const ScoreCircle = ({ score, total }) => {
  // Safeguards from original file (preserved)
  const numScore = Number(score) || 0;
  const numTotal = Number(total) || 0;
  const percent = (numTotal > 0 && isFinite(numTotal)) ? Math.round((numScore / numTotal) * 100) : 0;
                  
  const radius = 55;
  const stroke = 12; // Made stroke thicker
  const circumference = 2 * Math.PI * radius;
  
  let offset = circumference - (percent / 100) * circumference;
  if (!isFinite(offset)) {
    offset = circumference;
  }

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="transform -rotate-90" width={140} height={140}>
        {/* Background track */}
        <circle
          cx={70} cy={70} r={radius}
          stroke="#e5e7eb" strokeWidth={stroke} fill="none"
          className="text-slate-100 dark:text-slate-800"
        />
        {/* Foreground fill */}
        <circle
          cx={70} cy={70} r={radius}
          stroke="#4f46e5" strokeWidth={stroke} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-slate-900 dark:text-slate-100">{numScore}</span>
        <span className="text-lg text-slate-500 dark:text-slate-400 -mt-1">/ {numTotal}</span>
      </div>
    </div>
  );
};

// ## Re-styled OptionBar Component ##
const OptionBar = ({ text, percent, count, isCorrect, isUser, isUserIncorrect }) => {
  // Base styles
  let borderClasses = 'border-2 border-slate-200 dark:border-slate-700/80';
  let bgBarColor = 'bg-slate-200 dark:bg-slate-700';
  let label = null;
  let textColor = 'text-slate-900 dark:text-slate-100';

  // Safeguard from original file (preserved)
  const safePercent = (isFinite(percent) && percent >= 0) ? percent : 0;

  // --- Correct Answer Styling ---
  if (isCorrect) {
    borderClasses = 'border-2 border-green-500 dark:border-green-500';
    bgBarColor = 'bg-green-500 dark:bg-green-500';
    textColor = 'text-green-800 dark:text-green-300 font-semibold';
    label = (
      <span className="flex items-center text-xs font-semibold text-green-700 dark:text-green-400 ml-2 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full">
        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Correct
      </span>
    );
  }

  // --- Participant's Answer Styling ---
  if (isUser) {
    borderClasses = 'border-2 border-indigo-500 dark:border-indigo-400';
    if (!isCorrect) {
         bgBarColor = 'bg-indigo-500 dark:bg-indigo-400';
         textColor = 'text-indigo-800 dark:text-indigo-300 font-semibold';
    }
    label = (
      <span className={`flex items-center text-xs font-semibold ml-2 px-2 py-0.5 rounded-full ${
          isCorrect
            ? 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/50'
            : 'text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50'
        }`}>
        {isCorrect ? <CheckCircle className="w-3.5 h-3.5 mr-1" /> : <UserCircle className="w-3.5 h-3.5 mr-1" />}
        Your Answer
      </span>
    );
  }

  // --- Participant's Incorrect Answer Styling ---
  if (isUserIncorrect) {
    borderClasses = 'border-2 border-red-500 dark:border-red-400';
    bgBarColor = 'bg-red-500 dark:bg-red-400';
    textColor = 'text-red-800 dark:text-red-300 font-semibold';
    label = (
       <span className="flex items-center text-xs font-semibold text-red-700 dark:text-red-400 ml-2 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded-full">
        <XCircle className="w-3.5 h-3.5 mr-1" /> Your Answer
      </span>
    );
  }

  return (
    <div className={`relative w-full mb-3 rounded-xl ${borderClasses} overflow-hidden transition-all duration-150 ease-in-out`}>
      {/* Background fill */}
      <div
        className={`absolute top-0 left-0 h-full ${bgBarColor} transition-all duration-500 ease-out opacity-20 dark:opacity-25`}
        style={{ width: `${safePercent}%` }}
      />
      {/* Content */}
      <div className="relative z-10 p-4">
          <div className="flex items-center justify-between w-full">
            {/* Left side: Text and Labels */}
            <div className="flex items-center min-w-0 flex-1">
                <span className={`text-base font-medium ${textColor} break-words pr-2`}>{text}</span>
                <div className="flex-shrink-0">{label}</div>
            </div>
            {/* Right side: Stats */}
            <div className="relative z-10 flex items-center flex-shrink-0 pl-3">
              <div className="font-mono text-lg font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {safePercent}%
              </div>
              <div className="font-mono text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap ml-2">
                  ({count})
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};


// ## Re-styled QuestionCard Component ##
const QuestionCard = ({ q, idx, totalNumQuestions }) => {
  // Safeguards from original file (preserved)
  const validOptionCounts = q.optionCounts || {};
  const numericVotes = Object.values(validOptionCounts)
                            .map(val => Number(val) || 0)
                            .filter(isFinite);
  const totalVotes = numericVotes.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg mb-6 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        {/* Card Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700/50">
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1.5 block uppercase tracking-wider">
            Question {idx + 1} / {totalNumQuestions}
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 break-words">
            {typeof q.text === 'string' ? q.text : 'Error: Invalid question text'}
          </h3>
        </div>
        {/* Card Body with Options */}
        <div className="p-5 sm:p-6 space-y-3">
            {Array.isArray(q.options) && q.options.map((opt, i) => {
            // Safeguards from original file (preserved)
            const count = Number(validOptionCounts[i]) || 0;
            const percent = (totalVotes > 0 && isFinite(totalVotes)) ? Math.round((count / totalVotes) * 100) : 0;

            const isCorrect = typeof q.correctAnswerIndex === 'number' && i === q.correctAnswerIndex;
            const isUser = typeof q.userAnswerIndex === 'number' && i === q.userAnswerIndex;
            const isUserIncorrect = isUser && !isCorrect;

            return (
                <OptionBar
                key={i}
                text={typeof opt === 'string' ? opt : `Option ${i+1}`}
                percent={percent}
                count={count}
                isCorrect={isCorrect}
                isUser={isUser}
                isUserIncorrect={isUserIncorrect}
                />
            );
            })}
        </div>
    </div>
  );
};

// ## Re-styled Skeleton Loader ##
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

// ## Re-styled Loading State ##
const LoadingState = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
        <div className="flex flex-col items-center text-slate-600 dark:text-slate-400">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
            <p className="text-lg font-medium">Loading Your Results...</p>
        </div>
    </div>
);

// ## Re-styled Error State ##
const ErrorState = ({ error, onNavigate }) => (
    <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/10 p-4 font-sans">
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md border border-red-200 dark:border-red-700/50">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-3">Loading Failed</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-base">
          {String(error)}
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

// ## Re-styled Empty State ##
const EmptyState = ({ onNavigate }) => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md border dark:border-slate-700/50">
         <BarChart2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">No Results Data</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-base">There is no question breakdown data available for your attempt.</p>
        <button
          className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          onClick={() => onNavigate('dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
);


// ## Main AsyncResultPage Component ##
const AsyncResultPage = ({ quizId, quizTitle, onNavigate }) => {
  // --- All original logic, state, and effects are preserved ---
  const { user } = useAuth();
  const { apiCall } = useAPI();
  const [analytics, setAnalytics] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [displayScore, setDisplayScore] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [displayTitle, setDisplayTitle] = useState(quizTitle || "Quiz Result");

  useEffect(() => {
    if (!quizId || !user?.username) {
      setError("Quiz ID or user information is missing.");
      setLoading(false);
      return;
    }

    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      setAnalytics(null);

      try {
        const analyticsUrl = `/share/attempt/my-result/${quizId}`;
        const data = await apiCall(analyticsUrl, { method: 'GET' });
        
        console.log("API Data Received for Async Result:", data);

        if (!data || !data.questions) {
             throw new Error("Invalid response structure received from server.");
        }
        
        setAnalytics(data.questions || []);
        setDisplayScore(Number(data.score) || 0);
        setDisplayTotal(Number(data.totalQuestions) || 0);
        setDisplayTitle(data.quizTitle || "Quiz Result");
        
      } catch (err) {
        console.error("Failed to fetch async result data:", err);
        setError(`Failed to load results: ${err.message || 'Unknown error'}. Please try again later.`);
        setAnalytics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [quizId, user, apiCall]); 
  // --- End of original logic ---


  // --- Loading State ---
  if (loading) {
    return <LoadingState />;
  }

  // --- Error State ---
   if (error) {
     return <ErrorState error={error} onNavigate={onNavigate} />;
   }

  // Determine if there's any data to show
  const noQuestionData = !analytics || analytics.length === 0;

  // --- Empty State ---
  if (noQuestionData) {
    return <EmptyState onNavigate={onNavigate} />;
  }

  // --- Main Render (Re-styled) ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 md:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">

        {/* --- Header Card --- */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-xl p-6 md:p-8 mb-10 border border-slate-200/50 dark:border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-lg">
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
              {typeof displayTitle === 'string' ? displayTitle : 'Quiz Results'}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-base md:text-lg">
              Here's your results breakdown.
            </p>
          </div>
          <div className="flex-shrink-0">
            <ScoreCircle score={displayScore} total={displayTotal} />
          </div>
        </div>
        
        {/* --- Content Area --- */}
        <div className="transition-opacity duration-300 ease-in-out">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Question Breakdown</h2>
            
            {loading ? <ContentSkeleton /> : analytics.map((q, idx) => (
                <QuestionCard
                    key={idx}
                    q={q} // q is a ParticipantQuestionResultDTO item
                    idx={idx}
                    totalNumQuestions={analytics.length}
                />
            ))}
        </div>


        {/* --- Back Button --- */}
        <div className="w-full flex justify-center mt-12">
          <button
            className="flex items-center px-6 py-2.5 bg-white text-slate-700 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
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

export default AsyncResultPage;