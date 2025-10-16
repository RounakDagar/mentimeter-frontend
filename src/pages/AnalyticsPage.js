import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle } from 'lucide-react';
import { useAPI } from '../hooks/useAPI';

const AnalyticsPage = ({ joinCode, onNavigate }) => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const { apiCall } = useAPI();
  
    useEffect(() => {
      const fetchAnalytics = async () => {
        try {
          const data = await apiCall(`/sessions/${joinCode}/analytics`);
          setAnalytics(data);
        } catch (err) {
          console.error('Failed to fetch analytics:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchAnalytics();
    }, [joinCode]);
  
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
                <p className="text-gray-600">Session: {joinCode}</p>
              </div>
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>
  
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {analytics.map((question, qIndex) => (
              <div key={qIndex} className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Question {qIndex + 1}: {question.text}
                </h3>
                <div className="space-y-3">
                  {question.options?.map((option, oIndex) => {
                    const count = question.optionCounts?.[oIndex] || 0;
                    const total = Object.values(question.optionCounts || {}).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    const isCorrect = oIndex === question.correctAnswerIndex;
  
                    return (
                      <div key={oIndex} className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-900 font-medium flex items-center">
                            {option}
                            {isCorrect && <CheckCircle className="w-4 h-4 text-green-600 ml-2" />}
                          </span>
                          <span className="text-gray-600 text-sm">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              isCorrect ? 'bg-green-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  
};

export default AnalyticsPage;