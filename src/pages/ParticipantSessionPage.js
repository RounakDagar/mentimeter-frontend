import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

const ParticipantSessionPage = ({ joinCode, name, onNavigate }) => {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const { connected, subscribe, send } = useWebSocket(joinCode);
    
    const hasJoined = useRef(false);

    // --- START OF FIX: Stale Closure Fix ---
    // Create a ref to hold the *latest* version of the onNavigate prop
    const onNavigateRef = useRef(onNavigate);

    // Keep the ref updated on every render
    useEffect(() => {
      onNavigateRef.current = onNavigate;
    }, [onNavigate]);
    // --- END OF FIX ---

    // EFFECT 1: Handles Joining the Session (Runs Once)
    useEffect(() => {
      if (connected && !hasJoined.current) {
        send(`/app/session/${joinCode}/join`, name);
        hasJoined.current = true;
      }
    }, [connected, joinCode, name, send]);

    // EFFECT 2: Handles Subscriptions
    useEffect(() => {
      if (!connected) return;

      

      // This function is defined inside the effect
      const handleSessionEnd = () => {
        console.log('Quiz ended signal received! Navigating to analytics...');
        // --- FIX: Use the ref's .current value ---
        // This guarantees we call the LATEST onNavigate function
        onNavigateRef.current('analytics', {
          sessionId: joinCode,
          isHost: false
        });
      };

      // 1. Subscribe to new question updates
      const unsubQuestion = subscribe(`/topic/session/${joinCode}/question`, (data) => {
        setCurrentQuestion(data);
        setSelectedAnswer(null);
        setHasAnswered(false);
      });
  
      // 2. Subscribe to the session end signal
      const unsubEnd = subscribe(
        `/topic/session/${joinCode}/ended`, 
        handleSessionEnd // Use the handler defined above
      );
  
      // 3. Cleanup
      return () => {
        if (unsubQuestion) unsubQuestion();
        if (unsubEnd) unsubEnd();
      };
      
    // We remove onNavigate from this array.
    // The ref handles it, so this effect won't re-run
    // just because onNavigate changes.
    }, [connected, joinCode, subscribe]); 
  
    // Handler for when the user clicks an answer
    const handleAnswer = (optionIndex) => {
      if (hasAnswered || !currentQuestion) return;
      
      setSelectedAnswer(optionIndex);
      send(`/app/session/${joinCode}/answer`, {
        questionIndex: currentQuestion.index, 
        optionIndex
      });
      setHasAnswered(true);
    };

    // --- Render JSX (No changes below) ---

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 dark:bg-slate-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-slate-100">Session: {joinCode}</h1>
            <p className="text-gray-600 dark:text-slate-400">Welcome, {name}!</p>
          </div>
  
          {/* Waiting Screen */}
          {!currentQuestion ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">Waiting for quiz to start...</h2>
              <p className="text-gray-600 dark:text-slate-400">Get ready!</p>
            </div>
          ) : (
            // Question Screen
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-slate-100">{currentQuestion.text}</h2>
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={hasAnswered}
                    className={`w-full p-4 text-left rounded-lg font-medium transition ${
                      selectedAnswer === index
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-500'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
                    } ${hasAnswered ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {/* Submitted Screen */}
              {hasAnswered && (
                <div className="mt-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2 dark:text-green-500" />
                  <p className="text-gray-900 font-semibold dark:text-slate-100">Answer submitted!</p>
                  <p className="text-gray-600 text-sm dark:text-slate-400">Waiting for next question...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  
};

export default ParticipantSessionPage;