import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Send, Loader2 } from 'lucide-react'; // Added Loader2
import { useWebSocket } from '../hooks/useWebSocket';
import Leaderboard from '../pages/Leaderboard'; // Import Leaderboard
import { motion, AnimatePresence } from 'framer-motion';

const ParticipantSessionPage = ({ joinCode, name, onNavigate }) => {
    // --- All React logic is 100% UNCHANGED ---
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [sessionStatus, setSessionStatus] = useState('WAITING');
    const [leaderboard, setLeaderboard] = useState([]);

    const { connected, subscribe, send } = useWebSocket(joinCode);
    const hasJoined = useRef(false);
    const onNavigateRef = useRef(onNavigate);

    useEffect(() => {
      onNavigateRef.current = onNavigate;
    }, [onNavigate]);

    useEffect(() => {
      if (connected && !hasJoined.current) {
        send(`/app/session/${joinCode}/join`, name);
        hasJoined.current = true;
      }
    }, [connected, joinCode, name, send]);

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

      const unsubQuestion = subscribe(`/topic/session/${joinCode}/question`, (data) => {
        setCurrentQuestion(data);
        setSelectedAnswer(null);
        setHasAnswered(false);
        setSessionStatus('ACTIVE');
      });

      const unsubEnd = subscribe(`/topic/session/${joinCode}/ended`, handleSessionEnd);

      const unsubStatus = subscribe(`/topic/session/${joinCode}`, (data) => {
          if (data && data.eventType === 'STATUS_UPDATE') {
              console.log('Participant received status update:', data.status);
              const newStatus = data.status === 'ACTIVE' ? 'ACTIVE' : 'WAITING';
              setSessionStatus(newStatus);
          }
      });

      const unsubLeaderboard = subscribe(`/topic/session/${joinCode}/leaderboard`, (data) => {
        console.log("Participant received leaderboard:", data);
        setLeaderboard(Array.isArray(data) ? data : []);
      });

      return () => {
        if (unsubQuestion) unsubQuestion();
        if (unsubEnd) unsubEnd();
        if (unsubStatus) unsubStatus();
        if (unsubLeaderboard) unsubLeaderboard();
      };

    }, [connected, joinCode, subscribe]);

    const handleAnswer = (optionIndex) => {
      if (hasAnswered) return;
      setSelectedAnswer(optionIndex);
    };

    const handleSubmit = () => {
      if (selectedAnswer === null || !currentQuestion || hasAnswered) return;
      send(`/app/session/${joinCode}/answer`, {
          questionIndex: currentQuestion.questionIndex,
          optionIndex: selectedAnswer
      });
      setHasAnswered(true);
    };
    // --- End of Unchanged Logic ---


    // --- UI Logic (Unchanged) ---
    const isWaiting = !currentQuestion || sessionStatus === 'WAITING';
    const waitingText = !currentQuestion ? 'Waiting for quiz to start...' : 'Session is paused...';
    const controlsDisabled = hasAnswered;

    return (
      <>
        {/* Full-screen animated gradient background */}
        <div className="min-h-screen w-full flex items-start justify-center p-4 pt-10 md:pt-16 font-sans cohesive-gradient-bg">
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl"> {/* Increased max-width */}

              {/* Main Question/Waiting Panel */}
              <div className={`w-full ${isWaiting ? 'md:w-full max-w-2xl mx-auto' : 'md:w-2/3'}`}>
                {/* Use AnimatePresence to switch between states */}
                <AnimatePresence mode="wait">
                  {isWaiting ? (
                    // --- REDESIGNED WAITING STATE ---
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-black/20 backdrop-blur-2xl shadow-2xl border border-white/20 rounded-3xl p-8"
                    >
                      <div className="text-center py-12">
                        <Loader2 className="w-16 h-16 text-white/80 mx-auto mb-6 animate-spin" />
                        <h2 className="text-2xl font-semibold text-white mb-2">{waitingText}</h2>
                        <p className="text-white/60">Please wait for the host to continue.</p>
                      </div>
                    </motion.div>
                  ) : (
                    // --- REDESIGNED QUESTION STATE ---
                    <motion.div
                      key="question"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-black/20 backdrop-blur-2xl shadow-2xl border border-white/20 rounded-3xl p-6 md:p-8"
                    >
                      {/* Header */}
                      <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-1 [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]">
                          Session: {joinCode}
                        </h1>
                        <p className="text-white/70">Welcome, {name}!</p>
                      </div>

                      {/* Question Text */}
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center min-h-[6rem]">
                        {currentQuestion.text}
                      </h2>

                      {/* REDESIGNED Option Buttons */}
                      <div className="space-y-4">
                        {currentQuestion.options?.map((option, index) => {
                          const isSelected = selectedAnswer === index;
                          
                          // Improved styling logic for better feedback
                          let buttonClasses = 'bg-black/20 text-white/90 hover:bg-black/40 cursor-pointer'; // Default
                          if (controlsDisabled) {
                            if (isSelected) {
                              buttonClasses = 'bg-indigo-600/70 text-white/90 ring-2 ring-indigo-500/70 cursor-not-allowed'; // Selected but disabled
                            } else {
                              buttonClasses = 'bg-black/10 text-white/50 cursor-not-allowed opacity-50'; // Others disabled
                            }
                          } else if (isSelected) {
                            buttonClasses = 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-lg'; // Actively selected
                          }

                          return (
                            <button
                              key={index}
                              onClick={() => handleAnswer(index)}
                              disabled={controlsDisabled}
                              className={`w-full p-4 text-left rounded-xl font-medium transition-all duration-200 flex items-center space-x-4 ${buttonClasses}`}
                            >
                              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white/20 text-white rounded-full text-xs font-bold">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span>{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Submit Button / Submitted Message */}
                      <div className="mt-8">
                        {!hasAnswered ? (
                          <button
                            onClick={handleSubmit}
                            disabled={selectedAnswer === null} // Unchanged logic
                            className="w-full flex items-center justify-center space-x-2 p-4 rounded-lg bg-white text-indigo-700 font-semibold transition hover:bg-gray-100 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="w-5 h-5" />
                            <span>Submit Answer</span>
                          </button>
                        ) : (
                          // "Submitted" Message (Redesigned)
                          <div className="text-center p-4 bg-green-600/30 backdrop-blur-sm rounded-lg border border-green-500/50">
                            <div className="flex items-center justify-center text-white">
                              <CheckCircle className="w-6 h-6 mr-2" />
                              <p className="font-semibold">Answer submitted!</p>
                            </div>
                            <p className="text-sm text-white/70 mt-1">
                              Waiting for the host to continue...
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* --- Leaderboard Sidebar (Only shown when not waiting) --- */}
              { !isWaiting && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full md:w-1/3"
                  >
                      {/* This will render your redesigned "Podium" leaderboard */}
                      <Leaderboard data={leaderboard} currentUser={name} />
                  </motion.div>
              )}
              {/* -------------------------------------------------------- */}
          </div>
        </div>

        {/* This style tag contains the CSS for the animated gradient background */}
        <style>{`
          .cohesive-gradient-bg {
            background: linear-gradient(-45deg, #0A1931, #1A2E59, #3A4E8A, #2C3E50);
            background-size: 400% 400%;
            animation: gradient-move 20s ease infinite;
          }

          @keyframes gradient-move {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
      </>
    );
};

export default ParticipantSessionPage;