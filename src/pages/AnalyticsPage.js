import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../hooks/useAPI';

const AnalyticsPage = ({ sessionId, quizTitle, score, totalQuestions, onNavigate }) => {
  const { user } = useAuth();
  const { apiCall } = useAPI();
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);

  useEffect(() => {
    if (sessionId && user?.username) {
      (async () => {
        try {
          const url = `/sessions/${sessionId}/${user.username}/analytics`;
          const data = await apiCall(url, { method: 'GET' });
          setAnalytics(data || []);
        } catch (err) {
          setAnalytics([]);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [sessionId, user, apiCall]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600">No analytics data available.</div>
        <button
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
          onClick={() => onNavigate('dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const question = analytics[questionIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md mt-10 p-8 relative">
        <button
          className="absolute top-4 left-4 px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
          onClick={() => onNavigate('dashboard')}
        >
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between mb-4">
          {typeof score !== 'undefined' ? (
            <div className="text-lg font-bold text-indigo-700">
              {score} / {totalQuestions}
            </div>
          ) : (
            <div className="text-lg font-bold text-indigo-700">
              Host
            </div>
          )}
          <div className="text-xl font-semibold text-gray-900">{quizTitle}</div>
        </div>
        <div className="mb-6">
          <div className="font-semibold mb-2">
            Question {questionIndex + 1}: {question.text}
          </div>
          <div className="space-y-2">
            {question.options.map((opt, idx) => {
              const isCorrect = idx === question.correctAnswerIndex;
              const isUser = idx === question.userAnswerIndex;
              let optionClass =
                'border rounded px-4 py-2 flex items-center justify-between';
              if (isCorrect && isUser) optionClass += ' bg-green-100 border-green-500';
              else if (isCorrect) optionClass += ' bg-green-50 border-green-500';
              else if (isUser) optionClass += ' bg-red-100 border-red-500';
              else optionClass += ' bg-gray-50 border-gray-300';

              return (
                <div key={idx} className={optionClass}>
                  <span>{opt}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    Count: {question.optionCounts?.[idx] || 0}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            disabled={questionIndex === 0}
            onClick={() => setQuestionIndex((q) => q - 1)}
          >
            <ChevronLeft className="w-4 h-4 inline" /> Previous
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded"
            disabled={questionIndex === analytics.length - 1}
            onClick={() => setQuestionIndex((q) => q + 1)}
          >
            Next <ChevronRight className="w-4 h-4 inline" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;