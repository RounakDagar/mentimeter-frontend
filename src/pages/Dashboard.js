import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Plus,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ListChecks,
  Trash2,
  Loader2,
  AlertTriangle,
  Pencil,
  Share2,
  BarChart2,
  Copy,
  CheckCircle, // Keeping CheckCircle for now, maybe use for something else later
  Filter,
  Search,
  XCircle,
  FileText // Icon for the combined 'My Attempts' tab
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAPI } from '../hooks/useAPI';
import { useTheme } from '../context/ThemeContext';
import CreateQuizModal from './CreateQuizModal';
import HostedQuizzesPage from './HostedQuizzesPage';
import ThemeToggle from './ThemeToggle'; // Assuming ThemeToggle is separate

// ## Component: SkeletonCard ## (Existing - No changes)
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 dark:bg-slate-700"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 dark:bg-slate-700"></div>
        <div className="h-10 bg-gray-200 rounded w-full mt-6 dark:bg-slate-700"></div>
      </div>
    </div>
  );

// ## Component: EmptyState ## (Existing - No changes)
const EmptyState = ({ icon: Icon, title, message }) => (
    <div className="text-center py-16 bg-white rounded-xl shadow-sm dark:bg-slate-800 border dark:border-slate-700 col-span-1 md:col-span-2 lg:col-span-3">
      <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-slate-600" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-slate-100">{title}</h3>
      <p className="text-gray-600 dark:text-slate-400">{message}</p>
    </div>
  );

// ## Component: ConfirmationModal ## (Existing - No changes)
const ConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting, title, message }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md text-center transform transition-all duration-200 scale-95 opacity-0 animate-scale-in">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{title}</h3>
          <p className="text-sm text-gray-500 mt-2 dark:text-slate-400">{message}</p>
          <div className="mt-6 flex justify-center gap-4">
            <button type="button" className="px-6 py-2 rounded-lg text-sm font-semibold bg-white dark:bg-slate-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors" onClick={onClose} disabled={isDeleting}>Cancel</button>
            <button type="button" className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center transition-colors" onClick={onConfirm} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isDeleting ? 'Deleting...' : 'Confirm'}
            </button>
          </div>
        </div>
        <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }`}</style>
      </div>
    );
  };

// ## Component: ShareModal ## (Existing - No changes)
const ShareModal = ({ isOpen, onClose, shareCode, loading }) => {
    const [copied, setCopied] = useState(false);
    useEffect(() => { if (isOpen) setCopied(false); }, [isOpen]);
    if (!isOpen) return null;
    const shareUrl = `${window.location.origin.replace(/\/$/, '')}/attempt/${shareCode}`;
    const copyToClipboard = () => { navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-200 scale-95 opacity-0 animate-scale-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Share Quiz</h3>
            <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"><XCircle className="w-6 h-6" /></button>
          </div>
          {loading ? ( <div className="flex justify-center items-center h-24"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div> )
          : shareCode ? ( <div> <p className="text-sm text-slate-500 mt-2 dark:text-slate-400 mb-3">Anyone with this link can attempt your quiz (requires login).</p> <div className="relative"> <input type="text" readOnly value={shareUrl} className="w-full p-3 border rounded-lg bg-slate-100 dark:bg-slate-700 dark:text-slate-200 font-mono text-sm pr-12" onFocus={(e) => e.target.select()} /> <button onClick={copyToClipboard} className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md transition-colors ${copied ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500'}`} aria-label={copied ? 'Copied!' : 'Copy link'}>{copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}</button> </div> </div> )
          : ( <div className="flex items-center justify-center h-24 text-red-600 dark:text-red-400"><AlertTriangle className="w-6 h-6 mr-2"/> Could not generate share link.</div> )}
          <button type="button" className="w-full mt-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={onClose}>Close</button>
        </div>
        <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }`}</style>
      </div>
    );
  };

// ## Component: QuizCard ## (Existing - No changes)
const QuizCard = ({ quiz, onStartClick, onDeleteClick, onEditClick, onShareClick, onViewAsyncAnalytics }) => (
    <div className="relative group bg-white rounded-2xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        <button onClick={(e) => { e.stopPropagation(); onShareClick(); }} className="p-2 rounded-full bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-blue-900/50 dark:hover:text-blue-400" aria-label="Share quiz" title="Share Quiz"><Share2 className="w-4 h-4" /></button>
        <button onClick={(e) => { e.stopPropagation(); onEditClick(); }} className="p-2 rounded-full bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-indigo-100 hover:text-indigo-700 transition-all dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400" aria-label="Edit quiz" title="Edit Quiz"><Pencil className="w-4 h-4" /></button>
        <button onClick={(e) => { e.stopPropagation(); onDeleteClick(); }} className="p-2 rounded-full bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-700 transition-all dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-red-900/50 dark:hover:text-red-400" aria-label="Delete quiz" title="Delete Quiz"><Trash2 className="w-4 h-4" /></button>
      </div>
      <div className="flex-grow mb-4">
          <h3 className="text-xl font-semibold text-slate-900 mb-2 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pr-16">{quiz.title}</h3>
          <p className="text-slate-600 dark:text-slate-400 flex items-center text-sm"><ListChecks className="w-4 h-4 mr-2 text-slate-400" />{quiz.questionList?.length || 0} questions</p>
      </div>
      <div className="mt-auto space-y-2">
          <button onClick={onStartClick} className="w-full flex items-center justify-center space-x-2 px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 dark:shadow-none text-sm"><span>Start Live Session</span><ChevronRight className="w-4 h-4" /></button>
          {quiz.shared && (
            <button onClick={onViewAsyncAnalytics} className="w-full flex items-center justify-center space-x-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium pt-1"><BarChart2 className="w-4 h-4" /><span>View Shared Results</span></button>
          )}
      </div>
    </div>
  );

// --- UPDATED Component: AttemptedQuizCard ---
// Added onDeleteClick prop and delete button
const AttemptedQuizCard = ({ attempt, onClick, onDeleteClick }) => (
    <div
      className="relative bg-white rounded-2xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors duration-200 group"
      onClick={onClick} // Main card click still navigates
    >
        {/* Delete Button (Top Right) */}
        <button
            onClick={(e) => {
                e.stopPropagation(); // Prevent card navigation click
                onDeleteClick();     // Call the delete handler
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/50 transition-opacity"
            title="Delete this attempt record"
        >
            <Trash2 className="w-4 h-4" />
        </button>

        {/* Existing Card Content */}
        <div className="flex justify-between items-start mb-2 pr-8"> {/* Added pr-8 for button space */}
            <h3 className="flex-1 text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 pr-2">
                {attempt.quizTitle || 'Untitled Quiz'}
            </h3>
            <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                attempt.type === 'live'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
            }`}>
                {attempt.type === 'live' ? 'Live Session' : 'Async'}
            </span>
        </div>
        <div className="text-slate-600 dark:text-slate-400 text-sm space-y-1">
            <p>Score: <span className="font-medium text-slate-800 dark:text-slate-200">{attempt.score ?? 'N/A'} / {attempt.totalQuestions ?? 'N/A'}</span></p>
            <p>Attempted: <span className="font-medium text-slate-800 dark:text-slate-200">{attempt.attemptedAt ? new Date(attempt.attemptedAt).toLocaleString() : 'Date N/A'}</span></p>
            {attempt.type === 'live' && attempt.sessionId && (
                <p className="text-xs">Session: <span className="font-mono text-slate-500 dark:text-slate-500">{attempt.sessionId}</span></p>
            )}
        </div>
    </div>
);
// --- END UPDATED Component ---


// ## Main Dashboard Component ##
const Dashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('myQuizzes');
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loadingMyQuizzes, setLoadingMyQuizzes] = useState(true);

  // --- UPDATED State: Combined attempts list and loading state ---
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]); // Combined list
  const [loadingAttempted, setLoadingAttempted] = useState(false); // Start false
  // --- END UPDATED State ---

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Existing states (Delete Quiz, Delete Session, Share) - No changes
  const [quizToDeleteId, setQuizToDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);
  const [sessionToDeleteCode, setSessionToDeleteCode] = useState(null);
  const [isSessionDeleteModalOpen, setIsSessionDeleteModalOpen] = useState(false);
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  const [shareModalState, setShareModalState] = useState({ isOpen: false, shareCode: null, loading: false });

  // --- ADDED State for deleting own attempt ---
  const [attemptToDelete, setAttemptToDelete] = useState(null); // Attempt object
  const [isAttemptDeleteModalOpen, setIsAttemptDeleteModalOpen] = useState(false);
  const [isDeletingAttempt, setIsDeletingAttempt] = useState(false);
  // --- END ADDED State ---

  // Filter/Sort state for "My Quizzes" (Existing - No changes)
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const { user, logout } = useAuth();
  const { apiCall } = useAPI();
  const { theme } = useTheme();

  // Fetch "My Quizzes" (Existing - No changes)
  const fetchMyQuizzes = useCallback(async () => {
    if (!user?.username) return;
    setLoadingMyQuizzes(true);
    try {
      const data = await apiCall(`/quiz/user/${user.username}`, { method: 'GET' });
      setMyQuizzes(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Failed to fetch user's quizzes:", err); setMyQuizzes([]); }
    finally { setLoadingMyQuizzes(false); }
  }, [user, apiCall]);

  // --- UPDATED Fetch Function: Gets both live and async attempts ---
  const fetchAttemptedQuizzes = useCallback(async () => {
    if (!user?.username) return;
    setLoadingAttempted(true); // Set loading before fetch
    try {
      // Fetch both in parallel
      const [liveAttemptsRes, asyncAttemptsRes] = await Promise.all([
        apiCall(`/quiz/${user.username}/AttemptedQuiz`, { method: 'GET' }),
        apiCall(`/share/my-async-attempts`, { method: 'GET' }) // New endpoint
      ]);

      const liveAttempts = Array.isArray(liveAttemptsRes) ? liveAttemptsRes : [];
      const asyncAttempts = Array.isArray(asyncAttemptsRes) ? asyncAttemptsRes : [];

      // Standardize
      const standardizedLive = liveAttempts.map(att => ({
        quizTitle: att.quizTitle || 'Untitled Live Quiz',
        score: typeof att.score === 'number' ? att.score : 0,
        totalQuestions: typeof att.totalQuestions === 'number' ? att.totalQuestions : 0,
        attemptedAt: att.attemptedAt || new Date().toISOString(),
        sessionId: att.sessionId, // Important for key and display
        type: 'live',
        navProps: {
            sessionId: att.sessionId, quizTitle: att.quizTitle, score: att.score,
            totalQuestions: att.totalQuestions, isHost: false
        }
      }));

      const standardizedAsync = asyncAttempts.map(att => ({
        quizTitle: att.quizTitle || 'Untitled Async Quiz',
        score: typeof att.score === 'number' ? att.score : 0,
        totalQuestions: typeof att.totalQuestions === 'number' ? att.totalQuestions : 0,
        attemptedAt: att.attemptedAt || new Date().toISOString(),
        quizId: att.quizId, // Important for key
        type: 'async',
        navProps: { quizId: att.quizId, quizTitle: att.quizTitle }
      }));

      // Merge and sort
      const allAttempts = [...standardizedLive, ...standardizedAsync];
      allAttempts.sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));

      setAttemptedQuizzes(allAttempts);
    } catch (err) {
      console.error("Failed to fetch attempted quizzes:", err);
      setAttemptedQuizzes([]); // Clear on error
    } finally {
      setLoadingAttempted(false); // Clear loading
    }
  }, [user, apiCall]);
  // --- END UPDATED Fetch ---

  // Existing useEffect for My Quizzes (No changes)
  useEffect(() => { fetchMyQuizzes(); }, [fetchMyQuizzes]);

  // --- UPDATED useEffect: Fetch combined attempts when tab is active ---
  useEffect(() => {
    if (activeTab === 'attempted') {
      fetchAttemptedQuizzes(); // Call the updated fetch function
    }
    // Hosted History logic remains unchanged
  }, [activeTab, fetchAttemptedQuizzes]);
  // --- END UPDATED useEffect ---

  // Filter and Sort Logic for My Quizzes (Existing - No changes)
  const filteredAndSortedQuizzes = useMemo(() => {
    let quizzes = myQuizzes.filter(quiz => quiz.title.toLowerCase().includes(searchTerm.toLowerCase()));
    switch (sortBy) {
        case 'title':
            quizzes.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'questions':
            quizzes.sort((a, b) => (b.questionList?.length || 0) - (a.questionList?.length || 0));
            break;
        case 'recent':
            quizzes.reverse(); // assuming fetched data is somewhat recent, reverse it
            break;
        default:
            break;
    }
    return quizzes;
  }, [myQuizzes, searchTerm, sortBy]);


  // --- Handlers ---
  // Existing Handlers (No changes needed for create, start, edit, delete quiz/session, share)
  const handleCreateQuiz = () => setShowCreateModal(true);
  const handleStartSession = async (quizId) => { try { const response = await apiCall('/sessions', { method: 'POST', body: JSON.stringify({ quizId }) }); onNavigate('host', { joinCode: response.joinCode, quizId }); } catch (err) { console.error('Failed to create session:', err); alert('Failed to create session. Please try again.'); } };
  const handleEditQuiz = (quizId) => { onNavigate('edit-quiz', { quizId }); };
  const handleDeleteQuiz = async () => { if (!quizToDeleteId) return; setIsDeletingQuiz(true); try { await apiCall(`/quiz/${quizToDeleteId}/deleteQuiz`, { method: "DELETE" }); setMyQuizzes(current => current.filter(q => q.id !== quizToDeleteId)); } catch (err) { console.error("Failed to delete quiz:", err); alert(err.message.includes("403") ? "Permission Denied." : "Error deleting quiz."); } finally { setIsDeletingQuiz(false); closeDeleteModal(); } };
  const openDeleteModal = (id) => { setQuizToDeleteId(id); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setIsDeleteModalOpen(false); setQuizToDeleteId(null); };
  const openSessionDeleteModal = (joinCode) => { setSessionToDeleteCode(joinCode); setIsSessionDeleteModalOpen(true); };
  const closeSessionDeleteModal = () => { setIsSessionDeleteModalOpen(false); setSessionToDeleteCode(null); };
  const handleDeleteSession = async (joinCode, callback) => { if (!joinCode) return; setIsDeletingSession(true); try { await apiCall(`/sessions/${joinCode}/deleteSession`, { method: 'DELETE' }); if (callback) callback(); } catch (err) { console.error("Failed to delete session:", err); alert(err.message.includes("403") ? "Permission Denied." : "Error deleting session."); } finally { setIsDeletingSession(false); closeSessionDeleteModal(); } };
  const openShareModal = async (quizId) => { setShareModalState({ isOpen: true, shareCode: null, loading: true }); try { const quiz = myQuizzes.find(q => q.id === quizId); let code = quiz?.shareCode; if (!quiz?.shared || !code) { const response = await apiCall(`/share/quiz/${quizId}/enable`, { method: 'POST' }); code = response.shareCode; await fetchMyQuizzes(); } setShareModalState({ isOpen: true, shareCode: code, loading: false }); } catch (err) { console.error("Failed to enable sharing:", err); alert("Error: Could not get share link."); setShareModalState({ isOpen: false, shareCode: null, loading: false }); } };
  const closeShareModal = () => { setShareModalState({ isOpen: false, shareCode: null, loading: false }); };
  const handleViewAsyncAnalytics = (quizId, quizTitle) => { onNavigate('asyncAnalytics', { quizId, quizTitle }); };
  
  // --- UPDATED Handler: Navigates based on attempt type ---
  const handleViewAttempt = (attempt) => {
    if (attempt.type === 'live') {
      onNavigate('analytics', attempt.navProps);
    } else if (attempt.type === 'async') {
      // Use 'asyncResult' as the page key you added in App.js
      onNavigate('asyncResult', attempt.navProps);
    }
  };
  // --- END UPDATED Handler ---

  // --- ADDED Handlers for Deleting Own Attempt ---
  const handleOpenDeleteAttemptModal = (attempt) => {
    setAttemptToDelete(attempt);
    setIsAttemptDeleteModalOpen(true);
  };

  const handleCloseDeleteAttemptModal = () => {
    setAttemptToDelete(null);
    setIsAttemptDeleteModalOpen(false);
  };

  const handleConfirmDeleteAttempt = async () => {
    if (!attemptToDelete) return;

    setIsDeletingAttempt(true);
    // Removed setError('') call as error state wasn't defined here
    try {
      let deleteUrl = '';
      if (attemptToDelete.type === 'live') {
        deleteUrl = `/quiz/my-attempt/live/${attemptToDelete.sessionId}`;
      } else if (attemptToDelete.type === 'async') {
        deleteUrl = `/share/my-attempt/async/${attemptToDelete.quizId}`;
      } else {
        throw new Error("Unknown attempt type");
      }

      await apiCall(deleteUrl, { method: 'DELETE' });

      // Refresh the list after successful deletion
      await fetchAttemptedQuizzes();
      handleCloseDeleteAttemptModal();

    } catch (err) {
      console.error("Failed to delete attempt:", err);
      alert('Failed to delete attempt. Please try again.');
    } finally {
      setIsDeletingAttempt(false);
    }
  };
  // --- END ADDED Handlers ---

  // --- Tab Rendering Logic ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'myQuizzes': // Existing - No Changes
        return (
          <>
            {/* Filter/Sort Controls */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <input type="text" placeholder="Search your quizzes..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
                <div className="relative flex-shrink-0">
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="recent">Sort by: Recent</option>
                    <option value="title">Sort by: Title (A-Z)</option>
                    <option value="questions">Sort by: Questions (High-Low)</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
            </div>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingMyQuizzes ? (
                [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
              ) : filteredAndSortedQuizzes.length === 0 ? (
                <EmptyState icon={ListChecks} title="No quizzes found" message={searchTerm ? 'Try adjusting your search.' : 'Click "Create Quiz" to make your first one!'} />
              ) : (
                filteredAndSortedQuizzes.map(quiz => (
                  <QuizCard key={quiz.id} quiz={quiz} onStartClick={() => handleStartSession(quiz.id)} onDeleteClick={() => openDeleteModal(quiz.id)} onEditClick={() => handleEditQuiz(quiz.id)} onShareClick={() => openShareModal(quiz.id)} onViewAsyncAnalytics={() => handleViewAsyncAnalytics(quiz.id, quiz.title)} />
                ))
              )}
            </div>
          </>
        );
      case 'hosted': // Existing - No Changes
        return <HostedQuizzesPage user={user} onNavigate={onNavigate} openDeleteModal={openSessionDeleteModal} />;

      // --- UPDATED 'attempted' case ---
      case 'attempted':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingAttempted ? (
              // Show skeletons while loading attempts
              [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
            ) : attemptedQuizzes.length === 0 ? (
               // Updated empty state message and icon
               <EmptyState icon={FileText} title="No Attempts Yet" message='Your past quiz attempts (live & async) will appear here.' />
            ) : (
              // Render combined attempts list using the new card and handler
              attemptedQuizzes.map(attempt => (
                <AttemptedQuizCard
                  // Use a more robust unique key
                  key={`${attempt.type}-${attempt.sessionId || attempt.quizId}-${attempt.attemptedAt}`}
                  attempt={attempt}
                  // Use the new universal click handler
                  onClick={() => handleViewAttempt(attempt)}
                  // Pass the delete handler
                  onDeleteClick={() => handleOpenDeleteAttemptModal(attempt)}
                />
              ))
            )}
          </div>
        );
      // --- END UPDATED 'attempted' case ---
      default:
        return null;
    }
  };

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r dark:border-slate-700 shadow-sm sticky top-0 h-screen">
        {/* Logo (Existing - No changes) */}
        <div className="flex items-center space-x-3 px-6 py-5 border-b dark:border-slate-700"> <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"><Users className="w-6 h-6 text-white" /></div> <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">MentiMeter</h1></div>
        
        {/* Nav --- (UPDATED Tab Name/Icon) --- */}
        <nav className="flex-grow p-4 space-y-2">
          {/* My Quizzes */}
          <button onClick={() => setActiveTab('myQuizzes')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'myQuizzes' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`}> <ListChecks className="w-5 h-5" /> <span>My Quizzes</span> </button>
          {/* Hosted History */}
          <button onClick={() => setActiveTab('hosted')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'hosted' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`}> <BarChart2 className="w-5 h-5" /> <span>Hosted History</span> </button>
          {/* My Attempts (UPDATED) */}
          <button onClick={() => setActiveTab('attempted')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'attempted' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
            <FileText className="w-5 h-5" /> <span>My Attempts</span> {/* <-- Updated Icon & Text */}
          </button>
        </nav>
        {/* Footer (Existing - No changes) */}
        <div className="p-4 border-t dark:border-slate-700"> <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Welcome, {user?.username}</p> <ThemeToggle /> <button onClick={logout} className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:text-red-500 dark:hover:bg-red-900/50 text-sm font-medium"><LogOut className="w-4 h-4" /><span>Logout</span></button></div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
          {/* Mobile Header --- (UPDATED Tab Name/Icon) --- */}
          <header className="md:hidden bg-white dark:bg-slate-800 border-b dark:border-slate-700 shadow-sm sticky top-0 z-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16"> <div className="flex items-center space-x-3"><div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 text-white" /></div><h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">MentiMeter</h1></div> <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu">{mobileMenuOpen ? <X className="w-6 h-6 text-slate-700 dark:text-slate-300"/> : <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300"/>}</button></div>
              </div>
              {/* Mobile Menu Dropdown */}
              {mobileMenuOpen && (
                 <div className="border-t dark:border-slate-700 p-4 space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 px-4 py-2 font-medium">Welcome, {user?.username}</p>
                    {/* My Quizzes */}
                    <button onClick={() => { setActiveTab('myQuizzes'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'myQuizzes' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}> <ListChecks className="w-5 h-5" /> <span>My Quizzes</span> </button>
                    {/* Hosted History */}
                    <button onClick={() => { setActiveTab('hosted'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'hosted' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}> <BarChart2 className="w-5 h-5" /> <span>Hosted History</span> </button>
                    {/* My Attempts (UPDATED) */}
                     <button onClick={() => { setActiveTab('attempted'); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'attempted' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}> <FileText className="w-5 h-5" /> <span>My Attempts</span> </button> {/* <-- Updated Icon & Text */}
                    {/* Theme/Logout (Existing - No changes) */}
                    <div className="pt-2 border-t dark:border-slate-700"> <ThemeToggle /> <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:text-red-500 dark:hover:bg-red-900/50 text-sm font-medium"><LogOut className="w-4 h-4" /> <span>Logout</span></button></div>
                 </div>
              )}
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
              {/* Page Header & Actions (Existing - No changes) */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"> <div><h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Dashboard</h2><p className="text-gray-600 mt-1 dark:text-slate-400">Manage your quizzes and history.</p></div> <div className="flex gap-3 w-full sm:w-auto flex-shrink-0"><button onClick={() => onNavigate('join')} className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition dark:bg-slate-800 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-slate-700 shadow-sm text-sm">Join Quiz</button><button onClick={handleCreateQuiz} className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-sm text-sm"><Plus className="w-5 h-5" /> <span>Create Quiz</span></button></div></div>

              {/* Tab Content */}
              {renderTabContent()}
          </main>
      </div>

      {/* --- RENDER MODALS --- */}
      {/* Existing Modals */}
      {showCreateModal && <CreateQuizModal onClose={() => setShowCreateModal(false)} onSuccess={(newQuiz) => { setMyQuizzes(current => [newQuiz, ...current]); fetchMyQuizzes(); setShowCreateModal(false); }} />}
      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleDeleteQuiz} isDeleting={isDeletingQuiz} title="Delete Quiz" message="Are you sure you want to permanently delete this quiz? All its questions will be removed. This action cannot be undone." />
      <ConfirmationModal isOpen={isSessionDeleteModalOpen} onClose={closeSessionDeleteModal} onConfirm={() => handleDeleteSession(sessionToDeleteCode, () => {})} isDeleting={isDeletingSession} title="Delete Session History" message={`Are you sure you want to delete the history for session ${sessionToDeleteCode}? This cannot be undone.`} />
      <ShareModal isOpen={shareModalState.isOpen} onClose={closeShareModal} shareCode={shareModalState.shareCode} loading={shareModalState.loading} />
      
      {/* --- ADDED Modal for deleting own attempts --- */}
      <ConfirmationModal
        isOpen={isAttemptDeleteModalOpen}
        onClose={handleCloseDeleteAttemptModal}
        onConfirm={handleConfirmDeleteAttempt}
        isDeleting={isDeletingAttempt}
        title="Delete Attempt Record"
        message={`Are you sure you want to permanently delete your attempt record for "${attemptToDelete?.quizTitle}"? This cannot be undone.`}
      />
      {/* --- END ADDED Modal --- */}
      
    </div>
  );
};

export default Dashboard;