// src/pages/AsyncResultPage.js
import React, { useEffect, useState } from 'react';
import { 
  Check, 
  X, 
  ChevronLeft, 
  UserCircle, 
  ListChecks, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../hooks/useAPI';

// ## ScoreCircle Component ## (FIXED)
const ScoreCircle = ({ score, total }) => {
  // Safeguard: Ensure score and total are valid numbers. Default to 0.
  const numScore = Number(score) || 0;
  const numTotal = Number(total) || 0;

  const percent = (numTotal > 0 && isFinite(numTotal)) 
                  ? Math.round((numScore / numTotal) * 100) 
                  : 0;
                  
  const radius = 55;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  
  // Safeguard: Ensure offset is a real number
  let offset = circumference - (percent / 100) * circumference;
  if (!isFinite(offset)) {
    offset = circumference;
  }

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
          strokeDashoffset={offset} // This value is now guaranteed to be a number
          strokeLinecap="round"
          className="transition-stroke-offset duration-1000 ease-out dark:stroke-indigo-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{numScore}</span>
        <span className="text-md text-slate-500 dark:text-slate-400">/ {numTotal}</span>
      </div>
    </div>
  );
};

// ## OptionBar Component ## (FIXED)
const OptionBar = ({ text, percent, count, isCorrect, isUser, isUserIncorrect }) => {
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
  
  // Safeguard: Ensure percent is a valid, finite number for the CSS style
  const safePercent = (isFinite(percent) && percent >= 0) ? percent : 0;

  return (
    <div className={`relative w-full mb-2.5 rounded-lg ring-1 ${ringColor} overflow-hidden transition-all duration-150 ease-in-out`}>
      {/* Background fill */}
      <div
        className={`absolute top-0 left-0 h-full ${bgBarColor} transition-all duration-500 ease-out`}
        style={{ width: `${safePercent}%` }} // This is now guaranteed to be a valid string
      />
      {/* Content */}
      <div className="relative z-10 p-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center min-w-0"> {/* Allow label truncation */}
                <span className={`font-medium ${textColor} truncate pr-2`}>{text}</span>
                {label}
            </div>
            <div className="relative z-10 flex items-center">
              <div className="font-mono text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap pl-2">
                  {safePercent}% <span className="text-xs text-slate-400 dark:text-slate-500">({count})</span>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};


// ## QuestionCard Component ## (FIXED)
const QuestionCard = ({ q, idx, totalNumQuestions }) => {
  const validOptionCounts = q.optionCounts || {};
  
  // Safeguard: Ensure all values in the vote count are numbers before reducing
  const numericVotes = Object.values(validOptionCounts)
                            .map(val => Number(val) || 0) // Coerce to number, default to 0
                            .filter(isFinite); // Remove any potential NaN/Infinity
                            
  const totalVotes = numericVotes.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 transition-shadow hover:shadow-xl">
      <div className="mb-5 flex flex-col">
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-wider">Question {idx + 1} / {totalNumQuestions}</span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {typeof q.text === 'string' ? q.text : 'Error: Invalid question text'}
        </h3>
      </div>
      <div>
        {Array.isArray(q.options) && q.options.map((opt, i) => {
          // Safeguard: Ensure count is a number
          const count = Number(validOptionCounts[i]) || 0;
          
          // Safeguard: Ensure percent is a number
          const percent = (totalVotes > 0 && isFinite(totalVotes)) 
                          ? Math.round((count / totalVotes) * 100) 
                          : 0;

          // Data now comes from our new DTO
          const isCorrect = typeof q.correctAnswerIndex === 'number' && i === q.correctAnswerIndex;
          const isUser = typeof q.userAnswerIndex === 'number' && i === q.userAnswerIndex;
          const isUserIncorrect = isUser && !isCorrect;

          return (
            <OptionBar
              key={i}
              text={typeof opt === 'string' ? opt : `Option ${i+1}`}
              percent={percent} // This is now guaranteed to be a valid number
              count={count}     // This is now guaranteed to be a valid number
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

// ## Skeleton Loader for Content Area ##
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


// ## Main AsyncResultPage Component ## (FIXED)
const AsyncResultPage = ({ quizId, quizTitle, onNavigate }) => {
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
        
        // Add console log to inspect the data when it arrives
        console.log("API Data Received for Async Result:", data);

        if (!data || !data.questions) {
             throw new Error("Invalid response structure received from server.");
        }
        
        setAnalytics(data.questions || []);
        // Safeguard: Ensure data from API is a number before setting
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


  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 p-4">
          <div className="flex flex-col items-center text-slate-600 dark:text-slate-400">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
              <p className="text-lg font-medium">Loading Your Results...</p>
          </div>
      </div>
    );
  }

  // --- Error State ---
   if (error) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/20 p-4">
         <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md max-w-md border border-red-200 dark:border-red-700/50">
           <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
           <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Loading Failed</h2>
           <p className="text-slate-600 dark:text-slate-400 mb-6">
             {String(error)}
           </p>
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

  // --- Empty State (if fetch succeeded but no data) ---
  if (noQuestionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md max-w-md border dark:border-slate-700">
           <ListChecks className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Analytics Data</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">There is no question breakdown data available for your attempt.</p>
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

        {/* --- Header Card (FIXED) --- */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-10 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {typeof displayTitle === 'string' ? displayTitle : 'Quiz Results'}
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm md:text-base">
              Your results breakdown
            </p>
          </div>
          <div className="flex-shrink-0">
            {/* This component is now fully safeguarded.
              It uses the local displayScore/displayTotal, which are
              guaranteed to be numbers from the useEffect.
            */}
            <ScoreCircle score={displayScore} total={displayTotal} />
          </div>
        </div>
        
        {/* --- Content Area --- */}
        <div className="transition-opacity duration-300 ease-in-out">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Question Breakdown</h2>
            
            {/* 'analytics' is guaranteed to be a non-empty array here. */}
            {analytics.map((q, idx) => (
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

export default AsyncResultPage;