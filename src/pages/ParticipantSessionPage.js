import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

const ParticipantSessionPage = ({ joinCode, name, onNavigate }) => {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [status, setStatus] = useState('WAITING');
    const { connected, subscribe, send } = useWebSocket(joinCode);
  
    useEffect(() => {
      if (!connected) return;
  
      // Join the session
      send(`/app/session/${joinCode}/join`, name);
  
      // Subscribe to question updates
      const unsubQuestion = subscribe(`/topic/session/${joinCode}/question`, (data) => {
        setCurrentQuestion(data);
        setSelectedAnswer(null);
        setHasAnswered(false);
      });
  
      // Subscribe to session end
      const unsubEnd = subscribe(`/topic/session/${joinCode}/ended`, (data) => {
        handleSessionEnd(data.score, data.totalQuestions, data.quizTitle);
      });
  
      return () => {
        if (unsubQuestion) unsubQuestion();
        if (unsubEnd) unsubEnd();
      };
    }, [connected, joinCode, name]);
  
    const handleAnswer = (optionIndex) => {
      if (hasAnswered) return;
      
      setSelectedAnswer(optionIndex);
      send(`/app/session/${joinCode}/answer`, {
        questionIndex: 0,
        optionIndex
      });
      setHasAnswered(true);
    };
  
    const handleSessionEnd = (finalScore, totalQuestions, quizTitle) => {
      onNavigate('analytics', {
        sessionId: joinCode,
        quizTitle,
        score: finalScore,
        totalQuestions
      });
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Session: {joinCode}</h1>
            <p className="text-gray-600">Welcome, {name}!</p>
          </div>
  
          {!currentQuestion ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Waiting for quiz to start...</h2>
              <p className="text-gray-600">Get ready!</p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">{currentQuestion.text}</h2>
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={hasAnswered}
                    className={`w-full p-4 text-left rounded-lg font-medium transition ${
                      selectedAnswer === index
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    } ${hasAnswered ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {hasAnswered && (
                <div className="mt-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-gray-900 font-semibold">Answer submitted!</p>
                  <p className="text-gray-600 text-sm">Waiting for next question...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  
};

export default ParticipantSessionPage;