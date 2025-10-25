// src/pages/AsyncAnalyticsPage.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAPI } from '../hooks/useAPI';
import {
    Loader2,
    ArrowLeft,
    BarChart2,
    Users,
    Search,
    AlertTriangle,
    Check,
    X,
    Trash2,
    Filter,
    CheckCircle, // New: For "Correct" badges
    XCircle,    // New: For "Incorrect" badges
    Eye,        // New: For "View" button
    FileText,   // New: For "Attempts" card
    Calendar,   // New: For participant list
    PieChart as PieChartIcon // New: For "Average" card
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Bar,
    BarChart as RechartsBarChart, // Renamed to avoid conflict
    XAxis,
    YAxis,
    Tooltip,
    Legend
} from 'recharts';

// --- Reusable color palette for charts ---
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
// Tailwind CSS 700 series colors for better contrast
const CHART_COLORS_DARK = ['#1D4ED8', '#057A55', '#B45309', '#B91C1C', '#6D28D9', '#BE185D'];


// --- COMPONENT 1: Re-styled AttemptDetailModal ---
const AttemptDetailModal = ({ attempt, quizData, onClose }) => {
    if (!attempt || !quizData) return null;

    const { username, score, totalQuestions, answers } = attempt;
    const { questionList } = quizData;

    return (
        <div 
            className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start p-5 border-b border-slate-200 dark:border-slate-700/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{username}</h3>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Final Score: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{score} / {totalQuestions}</span>
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>
                {/* Body */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
                    {questionList && questionList.map((question, qIndex) => {
                        const userAnswerIndex = answers[qIndex];
                        const isAnswered = userAnswerIndex !== null && userAnswerIndex !== undefined;
                        const correctAnswerIndex = question.correctAnswerIndex;

                        return (
                            <div key={qIndex} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50">
                                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-3">{qIndex + 1}. {question.text}</p>
                                <div className="space-y-2">
                                    {question.options.map((optionText, i) => {
                                        const isUserAnswer = isAnswered && userAnswerIndex === i;
                                        const isCorrectAnswer = correctAnswerIndex === i;

                                        let stateStyles = "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300";
                                        let Icon = null;

                                        if (isCorrectAnswer) {
                                            stateStyles = "bg-green-50 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 font-medium";
                                            Icon = <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" />;
                                        }

                                        if (isUserAnswer && !isCorrectAnswer) {
                                            stateStyles = "bg-red-50 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 font-medium";
                                            Icon = <XCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0" />;
                                        }

                                        return (
                                            <div key={i} className={`flex items-start space-x-2.5 p-3 rounded-lg border ${stateStyles}`}>
                                                {Icon ? Icon : <span className="w-5 h-5"></span>}
                                                <span className="flex-1 break-words">{optionText}</span>
                                            </div>
                                        );
                                    })}
                                    {!isAnswered && (
                                        <div className="flex items-center space-x-2.5 p-3 rounded-lg border bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700">
                                            <span className="w-5 h-5"></span>
                                            <span className="text-slate-500 dark:text-slate-400 italic">No answer submitted</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Simple scale-in animation */}
            <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }`}</style>
        </div>
    );
};

// --- COMPONENT 2: Re-styled ConfirmationModal ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting, title, message }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 text-center transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-5 py-2 rounded-lg text-sm font-medium bg-white dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 flex items-center justify-center disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    >
                        {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
            {/* Simple scale-in animation */}
            <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }`}</style>
        </div>
    );
};

// --- COMPONENT 3: SkeletonLoaders ---
const CardSkeleton = () => (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 animate-pulse border border-slate-200/50 dark:border-slate-700/50">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
    </div>
);
const ChartSkeleton = () => (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg p-6 animate-pulse border border-slate-200/50 dark:border-slate-700/50">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-slate-100 dark:bg-slate-700/50 rounded-lg"></div>
    </div>
);
const FullPageLoader = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-8 animate-pulse">
                <div>
                    <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded w-72 mb-3"></div>
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
                </div>
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-36"></div>
            </div>
            {/* Card Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
            {/* Content Skeleton */}
            <ChartSkeleton />
        </div>
    </div>
);

// --- COMPONENT 4: Re-styled AnalyticsCard ---
const AnalyticsCard = ({ title, value, icon: Icon }) => (
    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200/50 dark:border-slate-700 backdrop-blur-lg transition-all duration-300 hover:shadow-2xl">
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
            {Icon && (
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                    <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
            )}
        </div>
    </div>
);

// --- MAIN COMPONENT ---
const AsyncAnalyticsPage = ({ quizId, quizTitle, onNavigate }) => {
    // --- All original logic, state, and effects are preserved ---
    const { apiCall } = useAPI();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState([]);
    const [quizData, setQuizData] = useState(null);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [attemptToDelete, setAttemptToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [searchTerm, setSearchTerm] = useState('');
    const [participantSortBy, setParticipantSortBy] = useState('name-asc');

    const fetchAllData = useCallback(async () => {
        setError('');
        try {
            const [analyticsData, quizDetails] = await Promise.all([
                apiCall(`/share/quiz/${quizId}/async-analytics`),
                apiCall(`/quiz/${quizId}`)
            ]);
            
            console.log("Async Analytics Data:", analyticsData);
            setAnalytics(analyticsData);
            setAttempts(Array.isArray(analyticsData.attempts) ? analyticsData.attempts : []);
            
            console.log("Quiz Data:", quizDetails);
            setQuizData(quizDetails);

        } catch (err) {
            console.error("Failed to fetch all data:", err);
            setError('Failed to load analytics data.');
        } finally {
            setLoading(false);
        }
    }, [quizId, apiCall]);

    useEffect(() => {
        if (quizId) {
            setLoading(true);
            fetchAllData();
        } else {
            setError("No Quiz ID provided.");
            setLoading(false);
        }
    }, [quizId, fetchAllData]);

    const filteredAndSortedAttempts = useMemo(() => {
        if (!Array.isArray(attempts)) return [];
        let filtered = attempts.filter(attempt =>
            attempt.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
        switch (participantSortBy) {
            case 'name-asc':
                filtered.sort((a, b) => a.username.localeCompare(b.username));
                break;
            case 'name-desc':
                filtered.sort((a, b) => b.username.localeCompare(a.username));
                break;
            case 'score-desc':
                filtered.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
                break;
            case 'score-asc':
                filtered.sort((a, b) => (a.score ?? -1) - (b.score ?? -1));
                break;
            default:
                filtered.sort((a, b) => a.username.localeCompare(b.username));
        }
        return filtered;
    }, [attempts, searchTerm, participantSortBy]);

    const handleOpenDeleteModal = (attempt) => {
        setAttemptToDelete(attempt);
    };
    const handleCloseDeleteModal = () => {
        setAttemptToDelete(null);
    };
    const handleConfirmDelete = async () => {
        if (!attemptToDelete) return;
        setIsDeleting(true);
        try {
            await apiCall(`/share/attempt/delete?quizId=${quizId}&userId=${attemptToDelete.username}`, {
                method: 'DELETE'
            });
            await fetchAllData();
            handleCloseDeleteModal();
        } catch (err) {
            console.error("Failed to delete attempt:", err);
            alert("Failed to delete the attempt. Please try again."); // Or a better modal
        } finally {
            setIsDeleting(false);
        }
    };
    const prepareChartData = (optionCounts, question) => {
        if (!optionCounts || typeof optionCounts !== 'object' || !question || !question.options) {
            return [];
        }
        return Object.keys(optionCounts).map((optIndex) => ({
            name: question.options[optIndex] || `Option ${parseInt(optIndex) + 1}`,
            count: optionCounts[optIndex] || 0
        }));
    };
    // --- End of original logic ---


    // --- Loading State ---
    if (loading) {
        return <FullPageLoader />;
    }

    // --- Error State ---
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/10 p-4 font-sans">
                <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md border border-red-200 dark:border-red-700/50">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-3">Loading Failed</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 text-base">{error}</p>
                    <button
                        className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                        onClick={() => onNavigate('dashboard')}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // --- No Data State ---
    if (!analytics || !quizData) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
                <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md border dark:border-slate-700/50">
                    <BarChart2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">No Analytics Data</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 text-base">No analytics have been generated yet. Check back after participants have made attempts.</p>
                    <button
                        className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                        onClick={() => onNavigate('dashboard')}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
         );
    }

    // --- Main Render ---
    const questionKeys = analytics.questionOptionCounts ? Object.keys(analytics.questionOptionCounts) : [];
    const numQuestions = quizData.questionList ? quizData.questionList.length : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* --- Header --- */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{quizData.title || quizTitle || 'Quiz Analytics'}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Asynchronous quiz results</p>
                    </div>
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="flex-shrink-0 flex items-center px-4 py-2 bg-white text-slate-700 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Back to Dashboard
                    </button>
                </div>

                {/* --- Stat Cards --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <AnalyticsCard title="Total Attempts" value={analytics.totalAttempts} icon={FileText} />
                    <AnalyticsCard title="Average Score" value={`${analytics.averageScore.toFixed(1)} / ${numQuestions}`} icon={PieChartIcon} />
                    <AnalyticsCard title="Unique Participants" value={attempts.length} icon={Users} />
                </div>

                {/* --- TABS --- */}
                <nav className="flex justify-center p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl max-w-sm mx-auto mb-10 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm ${
                            activeTab === 'details'
                            ? 'text-indigo-700 dark:text-slate-100 bg-white dark:bg-indigo-600 shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        <BarChart2 className="w-5 h-5" />
                        <span>Breakdown</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('participants')}
                        className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm ${
                            activeTab === 'participants'
                            ? 'text-indigo-700 dark:text-slate-100 bg-white dark:bg-indigo-600 shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        <Users className="w-5 h-5" />
                        <span>Participants ({attempts.length})</span>
                    </button>
                </nav>

                {/* --- TAB CONTENT --- */}
                <div>
                    {/* --- Details Tab --- */}
                    {activeTab === 'details' && (
                        <div className="space-y-8">
                            {questionKeys.length > 0 && quizData.questionList ? (
                                questionKeys.map((qIndex) => {
                                    const questionCounts = analytics.questionOptionCounts[qIndex];
                                    const question = quizData.questionList[qIndex];
                                    if (!question || !questionCounts) return null;

                                    const chartData = prepareChartData(questionCounts, question);
                                    const correctAnswerText = question.options[question.correctAnswerIndex];

                                    return (
                                        <div key={qIndex} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                                            {/* Card Header */}
                                            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700/50">
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                                    {parseInt(qIndex) + 1}. {question.text}
                                                </h3>
                                                <div className="flex items-center space-x-2 p-2 px-3 bg-green-50 dark:bg-green-900/40 rounded-lg border border-green-200 dark:border-green-700/50 w-fit">
                                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
                                                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                                        Correct Answer: <span className="font-semibold">{correctAnswerText}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Card Body */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center p-5 sm:p-6">
                                                <div className="w-full h-64 md:h-80">
                                                    <h4 className="text-center font-semibold text-slate-600 dark:text-slate-300 mb-2">Vote Distribution</h4>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={3}>
                                                                {chartData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="w-full h-64 md:h-80">
                                                    <h4 className="text-center font-semibold text-slate-600 dark:text-slate-300 mb-2">Vote Counts</h4>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RechartsBarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                                                            <XAxis type="number" stroke="#94A3B8" />
                                                            <YAxis dataKey="name" type="category" interval={0} width={100} stroke="#94A3B8" />
                                                            <Tooltip />
                                                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                                                 {chartData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Bar>
                                                        </RechartsBarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-slate-500 dark:text-slate-400 py-12 px-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md border dark:border-slate-700/50">
                                    <BarChart2 className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" />
                                    <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">No question data available.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- Participants Tab --- */}
                    {activeTab === 'participants' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                            <div className="p-5 sm:p-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                    Unique Participants ({attempts.length})
                                </h3>

                                {/* --- Search and Sort Controls --- */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-5">
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            placeholder="Search participants..."
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="relative flex-shrink-0">
                                        <select
                                            value={participantSortBy}
                                            onChange={e => setParticipantSortBy(e.target.value)}
                                            className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        >
                                            <option value="name-asc">Sort: Name (A-Z)</option>
                                            <option value="name-desc">Sort: Name (Z-A)</option>
                                            <option value="score-desc">Sort: Score (High-Low)</option>
                                            <option value="score-asc">Sort: Score (Low-High)</option>
                                        </select>
                                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* --- Participant Table --- */}
                            <div className="overflow-x-auto">
                                {filteredAndSortedAttempts.length > 0 ? (
                                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Participant</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submitted</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                            {filteredAndSortedAttempts.map((attempt) => (
                                                <tr key={attempt.username} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{attempt.username}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{attempt.score}</span>
                                                        <span className="text-sm text-slate-500 dark:text-slate-400"> / {attempt.totalQuestions}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-1.5" />
                                                            {attempt.attemptedAt ? new Date(attempt.attemptedAt).toLocaleString() : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                        <button 
                                                            onClick={() => setSelectedAttempt(attempt)} 
                                                            className="p-2 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50" 
                                                            title={`View ${attempt.username}'s answers`}
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleOpenDeleteModal(attempt)} 
                                                            className="p-2 rounded-full text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" 
                                                            title={`Delete ${attempt.username}'s attempt`} 
                                                            disabled={isDeleting}
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-center text-slate-500 dark:text-slate-400 py-10">
                                        {attempts.length > 0 ? 'No participants match your search.' : 'No participants have attempted this quiz yet.'}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- RENDER THE MODALS --- */}
                {selectedAttempt && (
                    <AttemptDetailModal
                        attempt={selectedAttempt}
                        quizData={quizData}
                        onClose={() => setSelectedAttempt(null)}
                    />
                )}

                <ConfirmationModal
                    isOpen={!!attemptToDelete}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                    title="Delete Attempt"
                    message={`Are you sure you want to permanently delete the attempt for "${attemptToDelete?.username}"? This action cannot be undone.`}
                />
            </div>
        </div>
    );
};

export default AsyncAnalyticsPage;