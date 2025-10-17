import React, { useState, useEffect } from 'react';
import { Users, Play, Pause, ChevronRight, StopCircle, CheckCircle } from 'lucide-react';
import { useAPI } from '../hooks/useAPI';
import { useWebSocket } from '../hooks/useWebSocket';

const HostSessionPage = ({ joinCode, quizId, onNavigate }) => {
    const [session, setSession] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [status, setStatus] = useState('WAITING');
    const [answeredUsers, setAnsweredUsers] = useState(new Set());
    const { apiCall } = useAPI();
    const { connected, subscribe, send } = useWebSocket(joinCode);
  
    useEffect(() => {
      // Fetch quiz details
      const fetchQuiz = async () => {
        try {
          const data = await apiCall(`/quiz/${quizId}`);
          setQuiz(data);
        } catch (err) {
          console.error('Failed to fetch quiz:', err);
        }
      };
      fetchQuiz();
    }, [quizId]);
  
    useEffect(() => {
      if (!connected) return;
  
      // Subscribe to participants updates
      const unsubParticipants = subscribe(`/topic/session/${joinCode}/participants`, (data) => {
        setParticipants(Array.isArray(data) ? data : []);
      });
  
      // Subscribe to host notifications
      const unsubHost = subscribe(`/topic/session/${joinCode}/host`, (data) => {
        if (data.eventType === 'USER_ANSWERED') {
          setAnsweredUsers(prev => new Set([...prev, data.name]));
        }
      });
  
      return () => {
        if (unsubParticipants) unsubParticipants();
        if (unsubHost) unsubHost();
      };
    }, [connected, joinCode]);
  
    const handleStart = () => {
      send(`/app/session/${joinCode}/start`, {});
      setStatus('ACTIVE');
      setAnsweredUsers(new Set());
    };
  
    const handleNext = () => {
      send(`/app/session/${joinCode}/next`, {});
      setAnsweredUsers(new Set());
    };
  
    const handlePause = async () => {
      try {
        await apiCall(`/sessions/${joinCode}/pause`, { method: 'PUT' });
        setStatus('WAITING');
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
        onNavigate('analytics', {
          sessionId: joinCode,           // Pass joinCode as sessionId
          quizTitle: quiz?.title || '',  // Pass quiz title
          totalQuestions: quiz?.questionList?.length || 0 // Pass total questions
          // Do NOT pass score
        });
      } catch (err) {
        console.error('Failed to end session:', err);
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{quiz?.title || 'Quiz Session'}</h1>
                <p className="text-gray-600">Join Code: <span className="font-mono font-bold text-indigo-600">{joinCode}</span></p>
              </div>
              <div className="flex space-x-3">
                {status === 'WAITING' && (
                  <button
                    onClick={handleStart}
                    disabled={participants.length === 0}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start</span>
                  </button>
                )}
                {status === 'ACTIVE' && (
                  <>
                    <button
                      onClick={handlePause}
                      className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700"
                    >
                      <Pause className="w-5 h-5" />
                      <span>Pause</span>
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                    >
                      <ChevronRight className="w-5 h-5" />
                      <span>Next</span>
                    </button>
                  </>
                )}
                <button
                  onClick={handleEnd}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                >
                  <StopCircle className="w-5 h-5" />
                  <span>End</span>
                </button>
              </div>
            </div>
          </div>
        </header>
  
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {status === 'WAITING' ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <Users className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for participants...</h2>
                  <p className="text-gray-600">Share the join code with participants to get started</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Current Question</h2>
                      <span className="text-sm text-gray-600">
                        {answeredUsers.size} / {participants.length} answered
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${participants.length ? (answeredUsers.size / participants.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-gray-600">Question will appear here when started</p>
                </div>
              )}
            </div>
  
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Participants ({participants.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {participants.map((name, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{name}</span>
                    {answeredUsers.has(name) && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                ))}
                {participants.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No participants yet</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
};

export default HostSessionPage;