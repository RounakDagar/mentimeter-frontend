// src/pages/Dashboard.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Plus,
  ChevronRight,
  LogOut,
  Menu,
  X,
  ListChecks,
  Trash2,
  Loader2,
  AlertTriangle,
  Pencil,
  Share2,
  BarChart2,
  Copy,
  CheckCircle,
  Search,
  XCircle,
  FileText,
  AlertOctagon, // For error notification
  CheckCheck,   // For success notification
  History,
  LayoutDashboard, // New icon
  ArrowDownUp, // New icon for Sort
  PlayCircle, // New icon
  ChevronDown, // New icon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../hooks/useAPI';
import { useTheme } from '../context/ThemeContext';
import CreateQuizModal from './CreateQuizModal';
import HostedQuizzesPage from './HostedQuizzesPage';
import ThemeToggle from './ThemeToggle';

// ##################################################################
// ## RE-STYLED REUSABLE COMPONENTS ##
// ##################################################################

// --- Skeleton Card ---
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
    <div className="animate-pulse flex flex-col h-full">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
      <div className="mt-auto h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
    </div>
  </div>
);

// --- Empty State ---
const EmptyState = ({ icon: Icon, title, message }) => (
  <div className="text-center p-12 bg-white dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-800 col-span-1 md:col-span-2 lg:col-span-3 mt-4">
    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800">
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">{message}</p>
  </div>
);

// --- Notification Pop-up (Replaces alert()) ---
const Notification = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isError = type === 'error';

  return (
    <div className="fixed top-5 right-5 z-[200] w-full max-w-sm">
      <div 
        className={`flex items-start p-4 rounded-xl shadow-2xl border ${
          isError 
            ? 'bg-red-50 dark:bg-gray-900 border-red-200 dark:border-red-700' 
            : 'bg-green-50 dark:bg-gray-900 border-green-200 dark:border-green-700'
        } backdrop-blur-lg animate-slide-in`}
      >
        <div className={`flex-shrink-0 p-1.5 rounded-full ${isError ? 'bg-red-100 dark:bg-red-800' : 'bg-green-100 dark:bg-green-800'}`}>
          {isError 
            ? <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-300" /> 
            : <CheckCheck className="w-5 h-5 text-green-600 dark:text-green-300" />}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-semibold ${isError ? 'text-red-900 dark:text-red-200' : 'text-green-900 dark:text-green-200'}`}>
            {isError ? 'Error' : 'Success'}
          </p>
          <p className={`text-sm ${isError ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'} mt-1`}>
            {message}
          </p>
        </div>
        <button 
          onClick={onClose} 
          className={`ml-2 p-1.5 rounded-full ${isError ? 'text-red-900/70 hover:bg-red-100 dark:text-red-300/70 dark:hover:bg-red-800' : 'text-green-900/70 hover:bg-green-100 dark:text-green-300/70 dark:hover:bg-green-800'}`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

// --- Confirmation Modal ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting, title, message }) => {
  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-[100] flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md text-center transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">{message}</p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            className="px-5 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Confirm'}
          </button>
        </div>
      </div>
      <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }`}</style>
    </div>
  );
};

// --- Share Modal ---
const ShareModal = ({ isOpen, onClose, shareCode, loading, quizTitle }) => {
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (isOpen) setCopied(false); }, [isOpen]);

  if (!isOpen) return null;

  const shareUrl = shareCode ? `${window.location.origin.replace(/\/$/, '')}/attempt/${shareCode}` : '';

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-[100] flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate pr-4">Share "{quizTitle || 'Quiz'}"</h3>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-24 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Generating link...
          </div>
        ) : shareCode ? (
          <div>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400 mb-3">
              Anyone with this link can attempt your quiz (requires login).
            </p>
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300 font-mono text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={copyToClipboard}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md transition-all duration-200 ${
                  copied
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 ring-1 ring-green-300 dark:ring-green-700'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label={copied ? 'Copied!' : 'Copy link'}
                title={copied ? 'Copied!' : 'Copy link'}
              >
                {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-red-600 dark:text-red-400 text-sm">
            <AlertTriangle className="w-5 h-5 mr-2" /> Could not generate share link. Please try again.
          </div>
        )}
        <button
          type="button"
          className="w-full mt-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }`}</style>
    </div>
  );
};

// --- Sort Pill Button ---
const SortButton = ({ label, value, activeSort, setSort }) => (
    <button
        onClick={() => setSort(value)}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            activeSort === value
            ? 'bg-indigo-600 text-white shadow-md'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
        }`}
    >
        {label}
    </button>
);


// --- Quiz Card (Major Redesign) ---
const QuizCard = ({ quiz, onStartClick, onDeleteClick, onEditClick, onShareClick, onViewAsyncAnalytics }) => (
  <div className="relative group overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
    {/* Card Content */}
    <div className="p-6 flex flex-col h-full">
        {/* Action Buttons (Top right) */}
        <div className="absolute top-4 right-4 z-10 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={(e) => { e.stopPropagation(); onShareClick(); }} className="p-2 rounded-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm text-gray-500 hover:bg-blue-100 hover:text-blue-700 dark:text-gray-400 dark:hover:bg-blue-900/50 dark:hover:text-blue-400 transition-colors border border-gray-200/50 dark:border-gray-700" aria-label="Share quiz" title="Share Quiz"><Share2 className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); onEditClick(); }} className="p-2 rounded-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm text-gray-500 hover:bg-indigo-100 hover:text-indigo-700 dark:text-gray-400 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400 transition-colors border border-gray-200/50 dark:border-gray-700" aria-label="Edit quiz" title="Edit Quiz"><Pencil className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); onDeleteClick(); }} className="p-2 rounded-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm text-gray-500 hover:bg-red-100 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-colors border border-gray-200/50 dark:border-gray-700" aria-label="Delete quiz" title="Delete Quiz"><Trash2 className="w-4 h-4" /></button>
        </div>

        <div className="flex-grow mb-6 pr-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate" title={quiz.title}>
                {quiz.title || 'Untitled Quiz'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 flex items-center text-sm">
                <ListChecks className="w-4 h-4 mr-1.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                {quiz.questionList?.length || 0} questions
            </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto space-y-3">
            {quiz.shared && (
                <button
                onClick={onViewAsyncAnalytics}
                className="w-full flex items-center justify-center space-x-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                <BarChart2 className="w-4 h-4" />
                <span>View Shared Results</span>
                </button>
            )}
            <button
                onClick={onStartClick}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 dark:shadow-none text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
                <PlayCircle className="w-5 h-5" />
                <span>Start Live Session</span>
            </button>
        </div>
    </div>
  </div>
);

// --- Attempted Quiz Card (Redesign) ---
const AttemptedQuizCard = ({ attempt, onClick, onDeleteClick }) => (
  <div
    className="relative group bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full"
    onClick={onClick}
  >
    <button
      onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
      className="absolute top-3 right-3 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 z-10"
      title="Delete this attempt record"
      aria-label="Delete attempt"
    >
      <Trash2 className="w-4 h-4" />
    </button>

    <div className="flex-grow mb-4 pr-8">
      <div className="flex justify-between items-start mb-3">
        <h3 className="flex-1 text-lg font-semibold text-gray-900 dark:text-gray-100 pr-2 truncate" title={attempt.quizTitle}>
          {attempt.quizTitle || 'Untitled Quiz'}
        </h3>
        <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            attempt.type === 'live'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
        }`}>
          {attempt.type === 'live' ? 'Live' : 'Async'}
        </span>
      </div>
      <div className="text-gray-500 dark:text-gray-400 text-sm space-y-1.5">
        <p>Score: <span className="font-medium text-gray-700 dark:text-gray-300">{attempt.score ?? 'N/A'} / {attempt.totalQuestions ?? 'N/A'}</span></p>
        <p>Attempted: <span className="font-medium text-gray-700 dark:text-gray-300">{attempt.attemptedAt ? new Date(attempt.attemptedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short'}) : 'Date N/A'}</span></p>
      </div>
    </div>
    
    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
            className="w-full text-indigo-600 dark:text-indigo-400 text-sm font-semibold flex items-center justify-center group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors"
        >
            View Results <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
        </button>
    </div>
  </div>
);


// ##################################################################
// ## MAIN DASHBOARD COMPONENT (MARKET REDESIGN) ##
// ##################################################################
const Dashboard = ({ onNavigate }) => {
  // --- Original State (Preserved) ---
  const [activeTab, setActiveTab] = useState('myQuizzes');
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loadingMyQuizzes, setLoadingMyQuizzes] = useState(true);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const [loadingAttempted, setLoadingAttempted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quizToDeleteId, setQuizToDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);
  const [shareModalState, setShareModalState] = useState({ isOpen: false, shareCode: null, loading: false, quizTitle: '' });
  const [attemptToDelete, setAttemptToDelete] = useState(null);
  const [isAttemptDeleteModalOpen, setIsAttemptDeleteModalOpen] = useState(false);
  const [isDeletingAttempt, setIsDeletingAttempt] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  
  // --- New State for Notifications (Replaces alert()) ---
  const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });

  // --- Original Hooks (Preserved) ---
  const { user, logout } = useAuth();
  const { apiCall } = useAPI();
  const { theme } = useTheme();

  // --- Original Callbacks (Preserved) ---
  const fetchMyQuizzes = useCallback(async () => {
    if (!user?.username) return;
    setLoadingMyQuizzes(true);
    try {
      const data = await apiCall(`/quiz/user/${user.username}`, { method: 'GET' });
      setMyQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch user's quizzes:", err);
      setMyQuizzes([]);
      setNotification({ show: true, message: 'Failed to fetch your quizzes.', type: 'error' });
    } finally {
      setLoadingMyQuizzes(false);
    }
  }, [user, apiCall]);

  const fetchAttemptedQuizzes = useCallback(async () => {
    if (!user?.username) return;
    setLoadingAttempted(true);
    try {
      const [liveAttemptsRes, asyncAttemptsRes] = await Promise.all([
        apiCall(`/quiz/${user.username}/AttemptedQuiz`, { method: 'GET' }),
        apiCall(`/share/my-async-attempts`, { method: 'GET' })
      ]);
      const liveAttempts = (Array.isArray(liveAttemptsRes) ? liveAttemptsRes : []).map(att => ({ ...att, type: 'live', navProps: { sessionId: att.sessionId, quizTitle: att.quizTitle, score: att.score, totalQuestions: att.totalQuestions, isHost: false } }));
      const asyncAttempts = (Array.isArray(asyncAttemptsRes) ? asyncAttemptsRes : []).map(att => ({ ...att, type: 'async', navProps: { quizId: att.quizId, quizTitle: att.quizTitle } }));
      const allAttempts = [...liveAttempts, ...asyncAttempts];
      allAttempts.sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));
      setAttemptedQuizzes(allAttempts);
    } catch (err) {
      console.error("Failed to fetch attempted quizzes:", err);
      setAttemptedQuizzes([]);
      setNotification({ show: true, message: 'Failed to fetch your attempts.', type: 'error' });
    } finally {
      setLoadingAttempted(false);
    }
  }, [user, apiCall]);

  // --- Original Effects (Preserved) ---
  useEffect(() => {
    fetchMyQuizzes();
  }, [fetchMyQuizzes]);

  useEffect(() => {
    if (activeTab === 'attempted') {
      fetchAttemptedQuizzes();
    }
  }, [activeTab, fetchAttemptedQuizzes]);

  // --- Original Memo (Preserved) ---
  const filteredAndSortedQuizzes = useMemo(() => {
    let quizzes = myQuizzes.filter(quiz =>
      quiz.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    switch (sortBy) {
      case 'title': quizzes.sort((a, b) => (a.title || '').localeCompare(b.title || '')); break;
      case 'questions': quizzes.sort((a, b) => (b.questionList?.length || 0) - (a.questionList?.length || 0)); break;
      case 'recent': 
      default: quizzes = [...quizzes].reverse(); break;
    }
    return quizzes;
  }, [myQuizzes, searchTerm, sortBy]);

  // --- Original Handlers (Preserved, with alert() replaced) ---
  const handleCreateQuiz = () => setShowCreateModal(true);
  const handleStartSession = async (quizId) => {
    try {
      const response = await apiCall('/sessions', { method: 'POST', body: JSON.stringify({ quizId }) });
      onNavigate('host', { joinCode: response.joinCode, quizId });
    } catch (err) {
      console.error('Failed to create session:', err);
      setNotification({ show: true, message: 'Failed to create session. Please try again.', type: 'error' });
    }
  };
  const handleEditQuiz = (quizId) => onNavigate('edit-quiz', { quizId });
  const openDeleteModal = (id) => { setQuizToDeleteId(id); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setQuizToDeleteId(null); };
  const handleDeleteQuiz = async () => {
    if (!quizToDeleteId) return;
    setIsDeletingQuiz(true);
    try {
      await apiCall(`/quiz/${quizToDeleteId}/deleteQuiz`, { method: "DELETE" });
      setMyQuizzes(current => current.filter(q => q.id !== quizToDeleteId));
      setNotification({ show: true, message: 'Quiz deleted successfully.', type: 'success' });
    } catch (err) {
      console.error("Failed to delete quiz:", err);
      const message = err.message?.includes("403") ? "Permission Denied." : "Error deleting quiz.";
      setNotification({ show: true, message, type: 'error' });
    } finally {
      setIsDeletingQuiz(false);
      closeDeleteModal();
    }
  };
  const openShareModal = async (quiz) => {
    setShareModalState({ isOpen: true, shareCode: null, loading: true, quizTitle: quiz.title });
    try {
      let code = quiz.shareCode;
      if (!quiz.shared || !code) {
        const response = await apiCall(`/share/quiz/${quiz.id}/enable`, { method: 'POST' });
        code = response.shareCode;
        await fetchMyQuizzes();
      }
      setShareModalState({ isOpen: true, shareCode: code, loading: false, quizTitle: quiz.title });
    } catch (err) {
      console.error("Failed to enable sharing:", err);
      setNotification({ show: true, message: 'Error: Could not get share link.', type: 'error' });
      setShareModalState({ isOpen: false, shareCode: null, loading: false, quizTitle: '' });
    }
  };
  const closeShareModal = () => setShareModalState({ isOpen: false, shareCode: null, loading: false, quizTitle: '' });
  const handleViewAsyncAnalytics = (quizId, quizTitle) => onNavigate('asyncAnalytics', { quizId, quizTitle });
  const handleViewAttempt = (attempt) => {
    if (attempt.type === 'live') {
      onNavigate('analytics', attempt.navProps);
    } else if (attempt.type === 'async') {
      onNavigate('asyncResult', attempt.navProps);
    }
  };
  const handleOpenDeleteAttemptModal = (attempt) => { setAttemptToDelete(attempt); setIsAttemptDeleteModalOpen(true); };
  const handleCloseDeleteAttemptModal = () => { setAttemptToDelete(null); setIsAttemptDeleteModalOpen(false); };
  const handleConfirmDeleteAttempt = async () => {
    if (!attemptToDelete) return;
    setIsDeletingAttempt(true);
    try {
      const deleteUrl = attemptToDelete.type === 'live'
        ? `/quiz/my-attempt/live/${attemptToDelete.sessionId}`
        : `/share/my-attempt/async/${attemptToDelete.quizId}`;
      await apiCall(deleteUrl, { method: 'DELETE' });
      await fetchAttemptedQuizzes();
      setNotification({ show: true, message: 'Attempt record deleted.', type: 'success' });
    } catch (err) {
      console.error("Failed to delete attempt:", err);
      setNotification({ show: true, message: 'Failed to delete attempt. Please try again.', type: 'error' });
    } finally {
      setIsDeletingAttempt(false);
      handleCloseDeleteAttemptModal();
    }
  };

  // --- Original Tab Content Fn (Preserved) ---
  const renderTabContent = () => {
    const isLoading = activeTab === 'myQuizzes' ? loadingMyQuizzes : loadingAttempted;
    const data = activeTab === 'myQuizzes' ? filteredAndSortedQuizzes : attemptedQuizzes;
    
    // Universal loading state
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    // Render content for "My Quizzes"
    if (activeTab === 'myQuizzes') {
        if (data.length === 0) {
            return <EmptyState icon={ListChecks} title="No quizzes found" message={searchTerm ? 'Try adjusting your search terms.' : 'Click "Create Quiz" to get started!'} />;
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {data.map(quiz => (
                    <QuizCard
                        key={quiz.id}
                        quiz={quiz}
                        onStartClick={() => handleStartSession(quiz.id)}
                        onDeleteClick={() => openDeleteModal(quiz.id)}
                        onEditClick={() => handleEditQuiz(quiz.id)}
                        onShareClick={() => openShareModal(quiz)}
                        onViewAsyncAnalytics={() => handleViewAsyncAnalytics(quiz.id, quiz.title)}
                    />
                ))}
            </div>
        );
    }

    // Render content for "My Attempts"
    if (activeTab === 'attempted') {
        if (data.length === 0) {
            return <EmptyState icon={FileText} title="No Attempts Yet" message="Your past live & async quiz attempts will appear here." />;
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {data.map(attempt => (
                    <AttemptedQuizCard
                        key={`${attempt.type}-${attempt.sessionId || attempt.quizId}-${attempt.attemptedAt}`}
                        attempt={attempt}
                        onClick={() => handleViewAttempt(attempt)}
                        onDeleteClick={() => handleOpenDeleteAttemptModal(attempt)}
                    />
                ))}
            </div>
        );
    }
    
    // Render content for "Hosted History"
    if (activeTab === 'hosted') {
        return <div className="mt-6"><HostedQuizzesPage user={user} onNavigate={onNavigate} /></div>;
    }

    return null;
  };

  // --- Sidebar Navigation Items ---
  const navItems = [
    { key: 'myQuizzes', label: 'My Quizzes', icon: LayoutDashboard },
    { key: 'hosted', label: 'Hosted History', icon: History },
    { key: 'attempted', label: 'My Attempts', icon: FileText },
  ];

  // --- Main Render (Re-styled) ---
  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100">
      
      {/* --- Sidebar (Desktop) --- */}
      <aside className={`hidden md:flex flex-col w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 sticky top-0 h-screen`}>
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3 px-6 h-20 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">MentiMeter</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ease-in-out group ${
                activeTab === item.key
                  ? 'bg-gray-100 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 font-medium'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer/User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    Signed in as <span className="font-semibold text-gray-700 dark:text-gray-300">{user?.username}</span>
                </p>
                <ThemeToggle />
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors dark:text-red-500 dark:hover:bg-red-900/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-black">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">MentiMeter</h1>
              </div>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu" className="p-2 -mr-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1 font-medium">Welcome, {user?.username}</p>
              <nav className="space-y-1">
                {navItems.map(item => (
                  <button
                    key={item.key}
                    onClick={() => { setActiveTab(item.key); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      activeTab === item.key
                        ? 'bg-gray-100 text-indigo-700 dark:bg-gray-800 dark:text-indigo-300 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
                <ThemeToggle />
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors dark:text-red-500 dark:hover:bg-red-900/50 text-sm font-medium"><LogOut className="w-4 h-4" /> <span>Logout</span></button>
              </div>
            </div>
          )}
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* Page Header & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    {navItems.find(item => item.key === activeTab)?.label || 'Dashboard'}
                </h2>
                <p className="text-gray-500 mt-1 dark:text-gray-400 text-sm">Manage your quizzes and view your activity.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto flex-shrink-0">
              <button
                onClick={() => onNavigate('join')}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 transition shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-black"
              >
                Join Quiz
              </button>
              <button
                onClick={handleCreateQuiz}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-black"
              >
                <Plus className="w-5 h-5 -ml-1" />
                <span>Create Quiz</span>
              </button>
            </div>
          </div>
          
          {/* --- Search & Filter Bar (Only for My Quizzes) --- */}
          {activeTab === 'myQuizzes' && (
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search Bar */}
                <div className="relative flex-grow">
                    <input
                    type="text"
                    placeholder="Search your quizzes..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition duration-150 ease-in-out placeholder-gray-400 dark:placeholder-gray-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                {/* Sort Pills */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden lg:block">Sort by:</span>
                    <SortButton label="Recent" value="recent" activeSort={sortBy} setSort={setSortBy} />
                    <SortButton label="Title" value="title" activeSort={sortBy} setSort={setSortBy} />
                    <SortButton label="Questions" value="questions" activeSort={sortBy} setSort={setSortBy} />
                </div>
            </div>
          )}

          {/* Tab Content Area */}
          <div>
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* --- Modals & Notifications --- */}
      {showCreateModal && <CreateQuizModal onClose={() => setShowCreateModal(false)} onSuccess={(newQuiz) => { fetchMyQuizzes(); setShowCreateModal(false); setNotification({ show: true, message: `Quiz "${newQuiz.title}" created!`, type: 'success' }); }} />}
      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleDeleteQuiz} isDeleting={isDeletingQuiz} title="Delete Quiz" message="Are you sure? This will permanently delete the quiz and its questions. This action cannot be undone." />
      <ShareModal isOpen={shareModalState.isOpen} onClose={closeShareModal} shareCode={shareModalState.shareCode} loading={shareModalState.loading} quizTitle={shareModalState.quizTitle} />
      <ConfirmationModal isOpen={isAttemptDeleteModalOpen} onClose={handleCloseDeleteAttemptModal} onConfirm={handleConfirmDeleteAttempt} isDeleting={isDeletingAttempt} title="Delete Attempt Record" message={`Permanently delete your record for "${attemptToDelete?.quizTitle}"? This cannot be undone.`} />

      {/* Notification Area */}
      {notification.show && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ show: false, message: '', type: 'error' })} 
        />
      )}

    </div>
  );
};

export default Dashboard;