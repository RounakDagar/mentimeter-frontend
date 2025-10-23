import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, Send } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import Leaderboard from '../pages/Leaderboard'; // Import Leaderboard

const ParticipantSessionPage = ({ joinCode, name, onNavigate }) => {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [sessionStatus, setSessionStatus] = useState('WAITING');
    const [leaderboard, setLeaderboard] = useState([]); // State for leaderboard

    const { connected, subscribe, send } = useWebSocket(joinCode);
    const hasJoined = useRef(false);
    const onNavigateRef = useRef(onNavigate);

    useEffect(() => {
      onNavigateRef.current = onNavigate;
    }, [onNavigate]);

    // Effect 1: Handles Joining
    useEffect(() => {
      if (connected && !hasJoined.current) {
        send(`/app/session/${joinCode}/join`, name);
        hasJoined.current = true;
      }
    }, [connected, joinCode, name, send]);

    // Effect 2: Handles Subscriptions
    useEffect(() => {
      if (!connected) return;

      // Handle Session End
      const handleSessionEnd = () => {
        console.log('Quiz ended signal received! Navigating to analytics...');
        setSessionStatus('ENDED');
        onNavigateRef.current('analytics', {
          sessionId: joinCode,
          isHost: false
          // Score/Total etc. will be fetched within AnalyticsPage now
        });
      };

      // Subscribe to New Questions
      const unsubQuestion = subscribe(`/topic/session/${joinCode}/question`, (data) => {
        setCurrentQuestion(data);
        setSelectedAnswer(null); // Reset selection
        setHasAnswered(false);   // Reset submitted status
        setSessionStatus('ACTIVE'); // Assume active when question arrives
        // Timer logic removed
      });

      // Subscribe to Session End Signal
      const unsubEnd = subscribe(`/topic/session/${joinCode}/ended`, handleSessionEnd);

      // Subscribe to Status Updates (Pause/Resume)
      const unsubStatus = subscribe(`/topic/session/${joinCode}`, (data) => {
          if (data && data.eventType === 'STATUS_UPDATE') {
              console.log('Participant received status update:', data.status);
              // Treat WAITING as PAUSED from host's perspective
              const newStatus = data.status === 'ACTIVE' ? 'ACTIVE' : 'WAITING';
              setSessionStatus(newStatus);
              // Timer pausing logic removed
          }
      });

      // Subscribe to Leaderboard updates
      const unsubLeaderboard = subscribe(`/topic/session/${joinCode}/leaderboard`, (data) => {
        console.log("Participant received leaderboard:", data);
        setLeaderboard(Array.isArray(data) ? data : []);
      });


      // Cleanup all subscriptions
      return () => {
        if (unsubQuestion) unsubQuestion();
        if (unsubEnd) unsubEnd();
        if (unsubStatus) unsubStatus();
        if (unsubLeaderboard) unsubLeaderboard(); // Cleanup leaderboard
      };

    }, [connected, joinCode, subscribe]); // Removed timer dependencies

    // Handle selecting an answer
    const handleAnswer = (optionIndex) => {
      // Don't allow changing answer after submitting
      if (hasAnswered) return;
      setSelectedAnswer(optionIndex);
    };

    // Handle submitting the selected answer
    const handleSubmit = () => {
      // Guard against submitting nothing or after already answering
      if (selectedAnswer === null || !currentQuestion || hasAnswered) return;

      send(`/app/session/${joinCode}/answer`, {
          questionIndex: currentQuestion.questionIndex, // Use index from DTO
          optionIndex: selectedAnswer
      });
      setHasAnswered(true); // Lock the answer choice
    };

    // --- UI Logic ---
    const isWaiting = !currentQuestion || sessionStatus === 'WAITING';
    const waitingText = !currentQuestion ? 'Waiting for quiz to start...' : 'Session is paused...';
    // Controls are disabled only if an answer has been submitted for the current question
    const controlsDisabled = hasAnswered;

    return (
      // Adjusted layout for potential leaderboard sidebar
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-start justify-center p-4 pt-10 md:pt-16 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950">
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl"> {/* Increased max-width */}

            {/* Main Question/Waiting Panel */}
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${isWaiting ? 'md:w-full max-w-md mx-auto' : 'md:w-2/3'} p-6 md:p-8 dark:bg-slate-800`}>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-slate-100">Session: {joinCode}</h1>
                <p className="text-gray-600 dark:text-slate-400">Welcome, {name}!</p>
                {/* Timer Display Removed */}
              </div>

              {isWaiting ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse dark:text-indigo-400" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">{waitingText}</h2>
                  <p className="text-gray-600 dark:text-slate-400">Please wait for the host to continue.</p>
                </div>
              ) : (
                // --- Question Display ---
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 dark:text-slate-100">
                    {currentQuestion.text}
                  </h2>

                  {/* Option Buttons */}
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={controlsDisabled}
                        className={`w-full p-4 text-left rounded-lg font-medium transition ${
                          selectedAnswer === index
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-500 dark:ring-indigo-400' // Selected style
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600' // Default style
                        } ${controlsDisabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`} // Disabled style
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {/* Submit Button / Submitted Message */}
                  <div className="mt-8">
                    {!hasAnswered ? (
                      <button
                        onClick={handleSubmit}
                        disabled={selectedAnswer === null} // Disabled if nothing is selected
                        className="w-full flex items-center justify-center space-x-2 p-4 rounded-lg bg-indigo-600 text-white font-semibold transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
                      >
                        <Send className="w-5 h-5" />
                        <span>Submit Answer</span>
                      </button>
                    ) : (
                      // "Submitted" Message
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

            {/* --- Leaderboard Sidebar (Only shown when not waiting) --- */}
            { !isWaiting && (
                <div className="w-full md:w-1/3">
                    <Leaderboard data={leaderboard} />
                </div>
            )}
            {/* -------------------------------------------------------- */}
        </div>
      </div>
    );
};

export default ParticipantSessionPage;