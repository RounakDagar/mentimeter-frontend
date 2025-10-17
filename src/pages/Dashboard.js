import React, { useState, useEffect } from 'react';
import { Users, Plus, ChevronRight, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../hooks/useAPI';
import CreateQuizModal from './CreateQuizModal';

const Dashboard = ({ onNavigate }) => {
  const [tab, setTab] = useState('hosted'); // 'hosted' or 'attempted'
  const [quizzes, setQuizzes] = useState([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, logout } = useAuth();
  const { apiCall } = useAPI();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch hosted quizzes (existing logic)
  useEffect(() => {
    if (tab === 'hosted') {
      // ...fetch hosted quizzes logic here if you have it...
      // setQuizzes(...)
    }
  }, [tab]);

  // Fetch attempted quizzes
  useEffect(() => {
    if (tab === 'attempted' && user?.username) {
      (async () => {
        try {
          const url = `/quiz/${user.username}/AttemptedQuiz`;
          const data = await apiCall(url, { method: 'GET' });
          setAttemptedQuizzes(data || []);
        } catch (err) {
          setAttemptedQuizzes([]);
        }
      })();
    }
  }, [tab, user, apiCall]);

  const QuizCard = ({ quiz, onClick }) => (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6 cursor-pointer border-2 border-transparent hover:border-indigo-500"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{quiz.title}</h3>
      <p className="text-gray-600 mb-4">{quiz.questionList?.length || 0} questions</p>
      <button className="text-indigo-600 font-medium flex items-center">
        Start Session <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );

  const AttemptedQuizCard = ({ attempt }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent mb-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{attempt.quizTitle}</h3>
      <p className="text-gray-600 mb-1">Score: {attempt.score} / {attempt.totalQuestions}</p>
      <p className="text-gray-600 mb-1">Attempted At: {new Date(attempt.attemptedAt).toLocaleString()}</p>
      <p className="text-gray-600 mb-1">Session ID: {attempt.sessionId}</p>
      {/* You can add more details if needed */}
    </div>
  );

  const handleCreateQuiz = () => setShowCreateModal(true);

  const handleStartSession = async (quizId) => {
    try {
      const response = await apiCall('/sessions', {
        method: 'POST',
        body: JSON.stringify({ quizId })
      });
      onNavigate('host', { joinCode: response.joinCode, quizId });
    } catch (err) {
      alert('Failed to create session');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">MentiMeter</h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b p-4">
          <div className="space-y-2">
            <div className="text-gray-700 py-2">Welcome, {user?.username}</div>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex space-x-4 border-b mb-8">
          <button
            className={`px-4 py-2 font-semibold ${tab === 'hosted' ? 'border-b-4 border-indigo-600 text-indigo-700' : 'text-gray-600'}`}
            onClick={() => setTab('hosted')}
          >
            Hosted Quizzes
          </button>
          <button
            className={`px-4 py-2 font-semibold ${tab === 'attempted' ? 'border-b-4 border-indigo-600 text-indigo-700' : 'text-gray-600'}`}
            onClick={() => setTab('attempted')}
          >
            Attempted Quizzes
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'hosted' ? (
          <>
            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">My Quizzes</h2>
                <p className="text-gray-600 mt-1">Create and manage your interactive quizzes</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleCreateQuiz}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Quiz</span>
                </button>
                <button
                  onClick={() => onNavigate('join')}
                  className="flex-1 sm:flex-none px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition"
                >
                  Join Quiz
                </button>
              </div>
            </div>
            {/* Quiz Grid */}
            {quizzes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes yet</h3>
                <p className="text-gray-600 mb-6">Create your first quiz to get started</p>
                <button
                  onClick={handleCreateQuiz}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Quiz</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map(quiz => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onClick={() => handleStartSession(quiz.id)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {attemptedQuizzes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No attempted quizzes yet</h3>
                <p className="text-gray-600 mb-6">Try participating in a quiz!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attemptedQuizzes.map(attempt => (
                  <AttemptedQuizCard key={attempt.id} attempt={attempt} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <CreateQuizModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(quiz) => {
            setQuizzes([...quizzes, quiz]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;