import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, ChevronRight, LogOut, Menu, X, Sun, Moon, ListChecks, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../hooks/useAPI';
import { useTheme } from '../context/ThemeContext';
import CreateQuizModal from './CreateQuizModal';
import HostedQuizzesPage from './HostedQuizzesPage';

// ## Component: SkeletonCard ## (No changes)
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent dark:bg-slate-800">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 dark:bg-slate-700"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 dark:bg-slate-700"></div>
      <div className="h-5 bg-gray-200 rounded w-1/4 mt-4 dark:bg-slate-700"></div>
    </div>
  </div>
);

// ## NEW Component: ConfirmationModal ##
const ConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md text-center">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mt-4 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            className="px-6 py-2 rounded-lg text-sm font-semibold bg-white dark:bg-slate-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ onNavigate }) => {
  const [tab, setTab] = useState('hosted');
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loadingMyQuizzes, setLoadingMyQuizzes] = useState(true);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, logout } = useAuth();
  const { apiCall } = useAPI();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  // --- NEW: State for "My Quizzes" delete functionality ---
  const [quizToDeleteId, setQuizToDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);


  useEffect(() => {
    if (user?.username) {
      (async () => {
        setLoadingMyQuizzes(true);
        try {
          const url = `/quiz/user/${user.username}`;
          const data = await apiCall(url, { method: 'GET' });
          setMyQuizzes(data || []);
        } catch (err) {
          console.error("Failed to fetch user's quizzes:", err);
          setMyQuizzes([]);
        } finally {
          setLoadingMyQuizzes(false);
        }
      })();
    }
  }, [user, apiCall]);

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


  // ## MODIFIED QuizCard to include delete button ##
  const QuizCard = ({ quiz, onStartClick, onDeleteClick }) => (
    <div 
      className="relative group bg-white rounded-xl shadow-md p-6 border-2 border-transparent dark:bg-slate-800"
    >
        {/* --- NEW: Delete Button --- */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-700 transition-all dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900"
          aria-label="Delete quiz"
        >
          <Trash2 className="w-4 h-4" />
        </button>

      <div onClick={onStartClick} className="cursor-pointer">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{quiz.title}</h3>
        <p className="text-gray-600 mb-4 dark:text-slate-400 flex items-center">
          <ListChecks className="w-4 h-4 mr-2" />
          {quiz.questionList?.length || 0} questions
        </p>
        <div className="text-indigo-600 font-medium flex items-center dark:text-indigo-400 group-hover:underline">
          Start Session <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
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

  // --- NEW: Delete handlers for "My Quizzes" ---
  const handleDeleteQuiz = async () => {
    if (!quizToDeleteId) return;
    setIsDeletingQuiz(true);
    try {
      await apiCall(`/quiz/${quizToDeleteId}/deleteQuiz`, { method: "DELETE" });
      setMyQuizzes(currentQuizzes => currentQuizzes.filter(q => q.id !== quizToDeleteId));
    } catch (err) {
      console.error("Failed to delete quiz:", err);
      if (err.message && err.message.includes("403")) {
        alert("Permission Denied: You do not have permission to delete this quiz.");
      } else {
        alert("Error: Could not delete the quiz.");
      }
    } finally {
      setIsDeletingQuiz(false);
      closeDeleteModal();
    }
  };

  const openDeleteModal = (id) => {
    setQuizToDeleteId(id);
    setIsDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setQuizToDeleteId(null);
  };

  const handleViewAnalytics = (attempt) => {
    const isHost = attempt.hostUsername === user.username;
    onNavigate('analytics', {
      sessionId: attempt.sessionId,
      quizTitle: attempt.quizTitle,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      isHost
    });
  };

  const AttemptedQuizCard = ({ attempt }) => (
    <div
      className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent mb-4 cursor-pointer hover:border-indigo-500 dark:bg-slate-800 dark:hover:border-indigo-500"
      onClick={() => handleViewAnalytics(attempt)}
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">{attempt.quizTitle}</h3>
      <p className="text-gray-600 mb-1 dark:text-slate-400">Score: {attempt.score} / {attempt.totalQuestions}</p>
      <p className="text-gray-600 mb-1 dark:text-slate-400">Attempted At: {new Date(attempt.attemptedAt).toLocaleString()}</p>
      <p className="text-gray-600 mb-1 dark:text-slate-400">Session ID: {attempt.sessionId}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b dark:bg-slate-800 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">MentiMeter</h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-gray-700 dark:text-slate-300">Welcome, {user?.username}</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                {theme === 'light' ? <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:text-red-500 dark:hover:bg-red-900/50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b p-4 dark:bg-slate-800 dark:border-slate-700">
          <div className="space-y-2">
            <div className="text-gray-700 py-2 dark:text-slate-300">Welcome, {user?.username}</div>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-500 dark:hover:bg-red-900/50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Header & Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">My Dashboard</h2>
            <p className="text-gray-600 mt-1 dark:text-slate-400">Create, host, and join quizzes all from here.</p>
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
              className="flex-1 sm:flex-none px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition dark:bg-slate-800 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-slate-700"
            >
              Join Quiz
            </button>
          </div>
        </div>

        {/* ## "My Quizzes" SECTION MODIFIED ## */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">My Quizzes (Ready to Host)</h3>
          {loadingMyQuizzes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : myQuizzes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm dark:bg-slate-800 border dark:border-slate-700">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-slate-600" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">No quizzes created yet</h3>
              <p className="text-gray-600 mb-6 dark:text-slate-400">Click "Create Quiz" to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myQuizzes.map(quiz => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onStartClick={() => handleStartSession(quiz.id)}
                  onDeleteClick={() => openDeleteModal(quiz.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b mb-8 dark:border-slate-700">
          <button
            className={`px-4 py-2 font-semibold ${tab === 'hosted' ? 'border-b-4 border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:text-indigo-400' : 'text-gray-600 dark:text-slate-400'}`}
            onClick={() => setTab('hosted')}
          >
            Hosted History
          </button>
          <button
            className={`px-4 py-2 font-semibold ${tab === 'attempted' ? 'border-b-4 border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:text-indigo-400' : 'text-gray-600 dark:text-slate-400'}`}
            onClick={() => setTab('attempted')}
          >
            Attempted Quizzes
          </button>
        </div>
      </div>

      {/* Main Content (Tabs) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {tab === 'hosted' ? (
          <HostedQuizzesPage user={user} onNavigate={onNavigate} />
        ) : (
          <>
            {attemptedQuizzes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm dark:bg-slate-800">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-slate-600" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">No attempted quizzes yet</h3>
                <p className="text-gray-600 mb-6 dark:text-slate-400">Try participating in a quiz!</p>
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
            setMyQuizzes([...myQuizzes, quiz]); 
            setShowCreateModal(false);
          }}
        />
      )}
      
      {/* --- NEW: Delete confirmation modal for "My Quizzes" --- */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteQuiz}
        isDeleting={isDeletingQuiz}
        title="Delete Quiz"
        message="Are you sure you want to permanently delete this quiz? All of its questions will be removed. This action cannot be undone."
      />

    </div>
  );
};

export default Dashboard;
