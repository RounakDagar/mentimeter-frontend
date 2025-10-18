import React, { useEffect, useState } from "react";
import { ChevronLeft, Check, BarChart3, Users, ListChecks } from "lucide-react"; // Added icons
import { useAPI } from "../hooks/useAPI";

// ## Component: SkeletonQuestionCard ##
const SkeletonQuestionCard = () => (
  <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
    <div className="animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-6 dark:bg-slate-700"></div>
      <div className="space-y-3">
        <div className="h-10 bg-gray-200 rounded w-full dark:bg-slate-700"></div>
        <div className="h-10 bg-gray-200 rounded w-full dark:bg-slate-700"></div>
        <div className="h-10 bg-gray-200 rounded w-full dark:bg-slate-700"></div>
      </div>
    </div>
  </div>
);

// ## Component: EmptyState ##
const EmptyState = () => (
  <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-slate-600" />
    <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-white">
      No Analytics Available
    </h3>
    <p className="text-gray-600 dark:text-slate-400">
      There is no analytics data to display for this session.
    </p>
  </div>
);

// ## ENHANCED Component: OptionBar ##
// This now renders usernames as pills for a much cleaner UI.
const OptionBar = ({ text, percent, count, usernames, isCorrect }) => {
  let ringColor = 'ring-slate-200 dark:ring-slate-700';
  let bgBarColor = 'bg-slate-100 dark:bg-slate-700/50';
  let textLabelColor = 'text-slate-800 dark:text-slate-100';

  if (isCorrect) {
    ringColor = 'ring-2 ring-green-500 dark:ring-green-400';
    bgBarColor = 'bg-green-100 dark:bg-green-900/50';
    textLabelColor = 'text-green-700 dark:text-green-300 font-semibold';
  }

  return (
    <div className={`relative w-full mb-3 rounded-lg ring-1 ${ringColor} overflow-hidden transition-all`}>
      {/* Background Bar */}
      <div
        className={`absolute top-0 left-0 h-full ${bgBarColor} transition-all duration-500 ease-out`}
        style={{ width: `${percent}%` }}
      />
      
      {/* Content Layer */}
      <div className="relative z-10 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`font-medium ${textLabelColor}`}>{text}</span>
            {isCorrect && (
              <span className="ml-2 flex items-center text-xs font-semibold text-green-700 bg-green-200/70 px-2 py-0.5 rounded-full dark:text-green-300 dark:bg-green-500/30">
                <Check className="w-3 h-3 mr-1" />
                Correct
              </span>
            )}
          </div>
          <div className="font-mono text-sm font-medium text-slate-600 dark:text-slate-400">
            {percent}% 
            <span className="text-xs text-slate-400 ml-1 dark:text-slate-500">({count} votes)</span>
          </div>
        </div>
        
        {/* ENHANCED: Participant "Pills" */}
        {usernames && usernames.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {usernames.map((name, index) => (
              <span 
                key={index} 
                className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full dark:bg-slate-700 dark:text-slate-300"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// ## ENHANCED Component: QuestionCard ##
// Now calculates difficulty on the frontend.
const QuestionCard = ({ q, idx }) => {
  const totalVotes = Object.values(q.optionCounts || {}).reduce((a, b) => a + b, 0);
  
  // Frontend calculation for difficulty
  const correctVotes = q.optionCounts?.[q.correctAnswerIndex] || 0;
  const percentCorrect = totalVotes > 0 ? (correctVotes / totalVotes) * 100 : 0;
  
  let difficulty, difficultyColor;
  if (percentCorrect >= 75) {
      difficulty = 'Easy';
      difficultyColor = 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400';
  } else if (percentCorrect >= 30) {
      difficulty = 'Medium';
      difficultyColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400';
  } else {
      difficulty = 'Hard';
      difficultyColor = 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400';
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 transition-all hover:shadow-xl">
      {/* Header with Difficulty */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            QUESTION {idx + 1}
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{q.text}</h3>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 mt-2 sm:mt-0">
          <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${difficultyColor}`}>
              {difficulty}
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
            {totalVotes} Total Votes
          </span>
        </div>
      </div>
      
      {/* Option Bars */}
      <div>
        {q.options.map((opt, i) => {
          const count = q.optionCounts?.[i] || 0;
          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          
          return (
            <OptionBar
              key={i}
              text={opt}
              percent={percent}
              count={count}
              isCorrect={i === q.correctAnswerIndex}
              usernames={q.usernames?.[i]} // Pass usernames to the bar
            />
          );
        })}
      </div>
    </div>
  );
};

// ## Improved Page: HostedQuizAnalyticsPage ##
const HostedQuizAnalyticsPage = ({ quizTitle, joinCode, username, onNavigate }) => {
  const { apiCall } = useAPI();
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiCall(`/sessions/${joinCode}/${username}/analytics`, { method: "GET" });
        setAnalytics(data || []);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setAnalytics([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [joinCode, username, apiCall]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 py-8">
      {/* Page Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center pb-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Session Analytics
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-1">
              Reviewing results for session: <span className="font-mono text-indigo-500 dark:text-indigo-400">{joinCode}</span>
            </p>
          </div>
          <button
            className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
            onClick={() => onNavigate("dashboard")}
          >
            <ChevronLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        {/* Summary Card */}
        <div className="w-full bg-white rounded-2xl shadow-xl p-6 mb-10 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{quizTitle}</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              You are viewing this report as the <span className="font-semibold text-slate-700 dark:text-slate-300">Host</span>.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-left bg-indigo-50 text-indigo-700 p-4 rounded-lg dark:bg-indigo-900/50 dark:text-indigo-400 flex items-center gap-3">
              <Users className="w-6 h-6" />
              <div>
                <span className="text-xs uppercase font-semibold">Role</span>
                <p className="text-2xl font-bold">Host</p>
              </div>
            </div>
            {!loading && (
              <div className="text-left bg-slate-50 text-slate-700 p-4 rounded-lg dark:bg-slate-700/50 dark:text-slate-300 flex items-center gap-3">
                <ListChecks className="w-6 h-6" />
                <div>
                  <span className="text-xs uppercase font-semibold">Questions</span>
                  <p className="text-2xl font-bold">{analytics.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Section */}
        {loading ? (
          <div className="space-y-6">
            <SkeletonQuestionCard />
            <SkeletonQuestionCard />
          </div>
        ) : analytics.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Question Breakdown
            </h2>
            {analytics.map((q, idx) => (
              <QuestionCard key={idx} q={q} idx={idx} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HostedQuizAnalyticsPage;