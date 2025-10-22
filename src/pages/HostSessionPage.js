import React, { useEffect, useState, useRef } from 'react';
import { 
  Users, 
  Play, 
  Pause, 
  ChevronRight, 
  StopCircle, 
  CheckCircle, 
  ArrowLeft // 1. Import ArrowLeft
} from 'lucide-react';
import { useAPI } from '../hooks/useAPI';
import { useWebSocket } from '../hooks/useWebSocket';

// ## A new component for the live answer bars ##
const LiveAnswerBar = ({ option, count, total }) => {
  const percent = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{option}</span>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{count}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-4 dark:bg-slate-700">
        <div 
          className="bg-indigo-600 h-4 rounded-full transition-all duration-500 ease-out dark:bg-indigo-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};


const HostSessionPage = ({ joinCode, quizId, onNavigate }) => {
    const [quiz, setQuiz] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [status, setStatus] = useState('WAITING'); 
    const [answeredUsers, setAnsweredUsers] = useState(new Set());
    
    const [optionCounts, setOptionCounts] = useState({});
    
    const { apiCall } = useAPI();
    const { connected, subscribe, send } = useWebSocket(joinCode);

    const onNavigateRef = useRef(onNavigate);
    useEffect(() => { onNavigateRef.current = onNavigate; }, [onNavigate]);

    const quizRef = useRef(quiz);
    useEffect(() => { quizRef.current = quiz; }, [quiz]);
  
    useEffect(() => {
      const fetchQuiz = async () => {
        try {
          const data = await apiCall(`/quiz/${quizId}`);
          setQuiz(data);
        } catch (err) {
          console.error('Failed to fetch quiz:', err);
        }
      };
      fetchQuiz();
    }, [quizId, apiCall]);
  
    useEffect(() => {
      if (!connected) return;
  
      const unsubParticipants = subscribe(`/topic/session/${joinCode}/participants`, (data) => {
        setParticipants(Array.isArray(data) ? data : []);
      });
  
      const unsubHost = subscribe(`/topic/session/${joinCode}/host`, (data) => {
        if (data.eventType === 'USER_ANSWERED') {
          setAnsweredUsers(prev => new Set([...prev, data.name]));
          const { optionIndex } = data;
          setOptionCounts(prevCounts => ({
            ...prevCounts,
            [optionIndex]: (prevCounts[optionIndex] || 0) + 1
          }));
        }
      });

      const unsubQuestion = subscribe(`/topic/session/${joinCode}/question`, (data) => {
        setCurrentQuestion(data);
        setOptionCounts({});
        setAnsweredUsers(new Set());
      });

      const handleEndSignal = () => {
        console.log('Host received session end signal. Navigating...');
        const currentQuiz = quizRef.current;
        onNavigateRef.current('analytics', {
          sessionId: joinCode,
          quizTitle: currentQuiz?.title || '',
          totalQuestions: currentQuiz?.questionList?.length || 0,
          isHost: true
        });
      };

      const unsubEnded = subscribe(`/topic/session/${joinCode}/ended`, handleEndSignal);
  
      return () => {
        if (unsubParticipants) unsubParticipants();
        if (unsubHost) unsubHost();
        if (unsubEnded) unsubEnded();
        if (unsubQuestion) unsubQuestion();
      };
    }, [connected, joinCode, subscribe]);
  
    const handleStart = () => {
      send(`/app/session/${joinCode}/start`, {});
      setStatus('ACTIVE');
      setAnsweredUsers(new Set());
      setOptionCounts({});
    };
  
    const handleNext = () => {
      send(`/app/session/${joinCode}/next`, {});
      setAnsweredUsers(new Set());
      setOptionCounts({});
    };
  
    const handlePause = async () => {
      try {
        await apiCall(`/sessions/${joinCode}/pause`, { method: 'PUT' });
        setStatus('PAUSED'); 
      } catch (err) {
        console.error('Failed to pause:', err);
      }
    };
  
    const handleResume = async () => {
      try {
        await apiCall(`/sessions/${joinCode}/resume`, { method: 'PUT' });
        setStatus('ACTIVE');
      } catch (err) {
        console.error('Failed to resume:', err);
      }
    };
  
    const handleEnd = async () => {
      try {
        await apiCall(`/sessions/${joinCode}/end`, { method: 'PUT' });
      } catch (err) {
        console.error('Failed to end session:', err);
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* 2. --- MODERN HEADER --- */}
        <header className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-700 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            
            {/* 3. --- BUTTON MOVED INTO THIS FLEX CONTAINER --- */}
            <div className="flex justify-between items-center">
              <div>
                {/* 4. --- UPDATED TYPOGRAPHY --- */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">{quiz?.title || 'Quiz Session'}</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Join Code: <span className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400">{joinCode}</span></p>
              </div>
              
              {/* 5. --- UPDATED BUTTON GROUP --- */}
              <div className="flex items-center space-x-3">
                
                {/* 6. --- NEW BUTTON LOCATION & STYLE --- */}
                <button 
                    onClick={() => onNavigate('dashboard')} 
                    className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-600"
                    aria-label="Back to Dashboard"
                >
                    <ArrowLeft className="w-5 h-5" /> 
                    <span>Back</span>
                </button>

                {/* --- Original Control Buttons --- */}
                {status === 'WAITING' && (
                  <button onClick={handleStart} disabled={participants.length === 0} className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Play className="w-5 h-5" /> <span>Start</span>
                  </button>
                )}
                {status === 'PAUSED' && (
                  <button onClick={handleResume} className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                    <Play className="w-5 h-5" /> <span>Resume</span>
                  </button>
                )}
                {status === 'ACTIVE' && (
                  <>
                    <button onClick={handlePause} className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600">
                      <Pause className="w-5 h-5" /> <span>Pause</span>
                    </button>
                    <button onClick={handleNext} className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                      <ChevronRight className="w-5 h-5" /> <span>Next</span>
                    </button>
                  </>
                )}
                {status !== 'WAITING' && (
                    <button onClick={handleEnd} className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
                        <StopCircle className="w-5 h-5" /> <span>End</span>
                    </button>
                )}
              </div>
            </div>
          </div>
        </header>
  
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Show waiting message */}
              {status === 'WAITING' || status === 'PAUSED' ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center dark:bg-slate-800">
                  <Users className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-slate-100">
                    {status === 'PAUSED' ? 'Session Paused' : 'Waiting for participants...'}
                  </h2>
                  <p className="text-gray-600 dark:text-slate-400">
                    {status === 'PAUSED' ? 'Click resume to continue.' : 'Share the join code with participants to get started'}
                  </p>
                </div>
              ) : (
                // This now renders the live poll
                <div className="bg-white rounded-xl shadow-md p-8 dark:bg-slate-800">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                        {currentQuestion ? `Question ${currentQuestion.questionIndex + 1} / ${quiz?.questionList?.length || '?'}` : 'Loading...'}
                      </h2>
                      <span className="text-sm font-semibold text-gray-600 dark:text-slate-400">
                        {answeredUsers.size} / {participants.length} Answered
                      </span>
                    </div>
                    <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                        {currentQuestion ? currentQuestion.text : '...'}
                    </p>
                  </div>
                  
                  {currentQuestion ? (
                    <div>
                      {currentQuestion.options.map((option, index) => {
                        const count = optionCounts[index] || 0;
                        const totalVotes = answeredUsers.size;
                        return (
                          <LiveAnswerBar 
                            key={index}
                            option={option}
                            count={count}
                            total={totalVotes}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-slate-400">Loading question...</p>
                  )}
                </div>
              )}
            </div>
  
            {/* Participant list */}
            <div className="bg-white rounded-xl shadow-md p-6 dark:bg-slate-800">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center dark:text-slate-100">
                <Users className="w-5 h-5 mr-2" />
                Participants ({participants.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {participants.map((name, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-slate-700/50">
                    <span className="text-gray-900 dark:text-slate-100">{name}</span>
                    {answeredUsers.has(name) && (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
                    )}
                  </div>
                ))}
                {participants.length === 0 && (
                  <p className="text-gray-500 text-center py-4 dark:text-slate-400">No participants yet</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
};

export default HostSessionPage;