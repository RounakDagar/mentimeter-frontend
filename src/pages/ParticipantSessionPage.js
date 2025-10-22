import React, { useState, useEffect, useRef } from 'react';
// 1. Removed 'Undo2' icon
import { Clock, CheckCircle, Send } from 'lucide-react'; 
import { useWebSocket } from '../hooks/useWebSocket';

const ParticipantSessionPage = ({ joinCode, name, onNavigate }) => {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [sessionStatus, setSessionStatus] = useState('WAITING');

    const { connected, subscribe, send } = useWebSocket(joinCode);
    const hasJoined = useRef(false);
    const onNavigateRef = useRef(onNavigate);

    useEffect(() => {
      onNavigateRef.current = onNavigate;
    }, [onNavigate]);

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

      const handleSessionEnd = () => {
        console.log('Quiz ended signal received! Navigating to analytics...');
        setSessionStatus('ENDED');
        onNavigateRef.current('analytics', {
          sessionId: joinCode,
          isHost: false
        });
      };

      // Subscribe to new question updates
      const unsubQuestion = subscribe(`/topic/session/${joinCode}/question`, (data) => {
        setCurrentQuestion(data);
        setSelectedAnswer(null); // Reset selection for new question
        setHasAnswered(false);   // Reset submitted status
        setSessionStatus('ACTIVE');
      });
  
      // Subscribe to the session end signal
      const unsubEnd = subscribe(
        `/topic/session/${joinCode}/ended`, 
        handleSessionEnd
      );

      // Subscribe to pause/resume status updates
      const unsubStatus = subscribe(`/topic/session/${joinCode}`, (data) => {
          if (data && data.eventType === 'STATUS_UPDATE') {
              console.log('Session status updated:', data.status);
              setSessionStatus(data.status);
          }
      });
  
      // Cleanup all subscriptions
      return () => {
        if (unsubQuestion) unsubQuestion();
        if (unsubEnd) unsubEnd();
        if (unsubStatus) unsubStatus();
      };
      
    }, [connected, joinCode, subscribe]); 
  
    // This function now ONLY sets the selected answer.
    const handleAnswer = (optionIndex) => {
      if (hasAnswered) return; // Don't allow changing answer after submitting
      setSelectedAnswer(optionIndex);
    };

    // This function is called by the "Submit" button.
    const handleSubmit = () => {
        // Guard against submitting nothing
        if (selectedAnswer === null || !currentQuestion) return;

        send(`/app/session/${joinCode}/answer`, {
            questionIndex: currentQuestion.questionIndex, // Use questionIndex from DTO
            optionIndex: selectedAnswer
        });
        setHasAnswered(true); // Lock the answer
    };

    // 2. --- REMOVED 'handleWithdraw' FUNCTION ---

    // --- UI Logic ---
    const isWaiting = !currentQuestion || sessionStatus === 'WAITING';
    const waitingText = !currentQuestion ? 'Waiting for quiz to start...' : 'Session is paused...';

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 dark:bg-slate-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-slate-100">Session: {joinCode}</h1>
            <p className="text-gray-600 dark:text-slate-400">Welcome, {name}!</p>
          </div>
  
          {isWaiting ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">{waitingText}</h2>
              <p className="text-gray-600 dark:text-slate-400">Please wait for the host to continue.</p>
            </div>
          ) : (
            // --- UPDATED QUESTION SCREEN ---
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-slate-100">
                {currentQuestion.text}
              </h2>
              
              {/* Option Buttons */}
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={hasAnswered} // Disable buttons AFTER submitting
                    className={`w-full p-4 text-left rounded-lg font-medium transition ${
                      selectedAnswer === index
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-500' // Selected style
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600' // Default style
                    } ${hasAnswered ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`} // Disabled style
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              {/* 3. --- UPDATED CONDITIONAL BUTTONS SECTION --- */}
              <div className="mt-8">
                {!hasAnswered ? (
                  // --- SUBMIT BUTTON ---
                  <button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null} // Disabled if nothing is selected
                    className="w-full flex items-center justify-center space-x-2 p-4 rounded-lg bg-indigo-600 text-white font-semibold transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    <Send className="w-5 h-5" />
                    <span>Submit Answer</span>
                  </button>
                ) : (
                  // --- "Submitted" Message ---
                  // The "Withdraw" button has been removed from here
                  <div className="text-center p-4 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <div className="flex items-center justify-center text-green-700 dark:text-green-400">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      <p className="font-semibold">Answer submitted!</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      Waiting for the host to continue...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  
};

export default ParticipantSessionPage;