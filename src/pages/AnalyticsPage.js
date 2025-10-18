import React, { useEffect, useState } from 'react';
import { Check, X, ChevronLeft, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../hooks/useAPI';

// ## ScoreCircle Component ##
const ScoreCircle = ({ score, total }) => {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const radius = 60;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="transform -rotate-90" width={144} height={144}>
        <circle
          cx={72}
          cy={72}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="none"
          className="dark:stroke-slate-700" // Dark mode stroke
        />
        <circle
          cx={72}
          cy={72}
          r={radius}
          stroke="#4f46e5"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out dark:stroke-indigo-500" // Dark mode stroke
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-slate-800 dark:text-slate-100">{score}</span>
        <span className="text-lg text-slate-500 -mt-1 dark:text-slate-400">/ {total}</span>
      </div>
    </div>
  );
};

// ## HostIndicator Component ##
const HostIndicator = () => {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <div className="absolute w-full h-full rounded-full bg-slate-100 border-4 border-slate-200 flex items-center justify-center dark:bg-slate-700 dark:border-slate-600">
        <div className="text-center">
            <UserCircle className="w-12 h-12 mx-auto text-indigo-500 dark:text-indigo-400" />
            <p className="text-3xl font-bold text-slate-800 mt-1 dark:text-slate-100">Host</p>
        </div>
      </div>
    </div>
  );
};


// ## OptionBar Component ##
const OptionBar = ({ text, percent, count, isCorrect, isUser, isUserIncorrect }) => {
  let ringColor = 'ring-slate-200 dark:ring-slate-700';
  let bgBarColor = 'bg-slate-100 dark:bg-slate-700/50';
  let label = null;

  if (isCorrect) {
    ringColor = 'ring-green-500';
    bgBarColor = 'bg-green-100 dark:bg-green-900/50';
    label = (
      <span className="flex items-center text-xs font-semibold text-green-700 dark:text-green-400">
        <Check className="w-4 h-4 mr-1.5" />
        Correct Answer
      </span>
    );
  }

  if (isUser) {
    ringColor = 'ring-indigo-500 dark:ring-indigo-400 ring-2';
    label = (
      <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
        Your Answer
      </span>
    );
  }

  if (isUserIncorrect) {
    ringColor = 'ring-red-500 dark:ring-red-400 ring-2';
    bgBarColor = 'bg-red-100 dark:bg-red-900/50';
    label = (
      <span className="flex items-center text-xs font-semibold text-red-600 dark:text-red-400">
        <X className="w-4 h-4 mr-1.5" />
        Your Answer
      </span>
    );
  }
  
  if (isCorrect && isUser) {
    ringColor = 'ring-green-500 dark:ring-green-400 ring-2';
    label = (
       <span className="flex items-center text-xs font-semibold text-green-700 dark:text-green-400">
        <Check className="w-4 h-4 mr-1.5" />
        Correct (Your Answer)
      </span>
    )
  }

  return (
    <div className={`relative flex items-center justify-between w-full p-3 mb-2 rounded-lg ring-1 ${ringColor} overflow-hidden`}>
      <div
        className={`absolute top-0 left-0 h-full ${bgBarColor} transition-all duration-500 ease-out`}
        style={{ width: `${percent}%` }}
      />
      <div className="relative z-10 flex items-center">
        <span className="font-medium text-slate-800 dark:text-slate-100">{text}</span>
        <div className="ml-3">{label}</div>
      </div>
      <div className="relative z-10 font-mono text-sm font-medium text-slate-600 dark:text-slate-400">
        {percent}% <span className="text-xs text-slate-400 dark:text-slate-500">({count})</span>
      </div>
    </div>
  );
};

// ## QuestionCard Component ##
const QuestionCard = ({ q, idx, totalNumQuestions }) => {
  const totalVotes = Object.values(q.optionCounts).reduce((a, b) => a + b, 0);
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
      <div className="mb-5 flex flex-col">
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">QUESTION {idx + 1} OF {totalNumQuestions}</span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{q.text}</h3>
      </div>
      <div>
        {q.options.map((opt, i) => {
          const count = q.optionCounts[i] || 0;
          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isCorrect = i === q.correctAnswerIndex;
          const isUser = i === q.userAnswerIndex;
          const isUserIncorrect = isUser && !isCorrect;
          
          return (
            <OptionBar
              key={i}
              text={opt}
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

// ## Main AnalyticsPage Component ##
const AnalyticsPage = ({ sessionId, quizTitle, score, totalQuestions, onNavigate, isHost = false }) => {
  const { user } = useAuth();
  const { apiCall } = useAPI();
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId && user?.username) {
      (async () => {
        try {
          const url = `/sessions/${sessionId}/${user.username}/analytics`;
          const data = await apiCall(url, { method: 'GET' });
          setAnalytics(data || []);
        } catch (err) {
          console.error("Failed to fetch analytics:", err);
          setAnalytics([]);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [sessionId, user, apiCall]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center text-slate-600 dark:text-slate-400">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-6">
          <p className="text-slate-600 dark:text-slate-400">No analytics data available for this session.</p>
          <button
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            onClick={() => onNavigate('dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8 dark:bg-slate-800 dark:border-slate-700">
          <div className="text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">{quizTitle}</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {isHost ? "Here's the session's overall performance." : "Here's the breakdown of your results."}
            </p>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
              Session Code: <span className="font-mono font-bold text-slate-500 dark:text-slate-400">{sessionId}</span>
            </p>
          </div>
          <div className="flex-shrink-0">
            {isHost ? (
              <HostIndicator />
            ) : (
              <ScoreCircle score={score} total={totalQuestions} />
            )}
          </div>
        </div>

        <div>
          {analytics.map((q, idx) => (
            <QuestionCard key={idx} q={q} idx={idx} totalNumQuestions={analytics.length} />
          ))}
        </div>

        <div className="w-full flex justify-center mt-12">
          <button
            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-transform transform hover:scale-105 shadow-lg dark:bg-indigo-500 dark:hover:bg-indigo-600"
            onClick={() => onNavigate('dashboard')}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;