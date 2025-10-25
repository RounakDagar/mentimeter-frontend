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
    Filter // Added Filter icon for sort dropdown
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Bar,
    BarChart,
    XAxis,
    YAxis,
    Tooltip,
    Legend
} from 'recharts';

// Reusable color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF00FF'];

// --- COMPONENT 1: AttemptDetailModal ---
const AttemptDetailModal = ({ attempt, quizData, onClose }) => {
    if (!attempt || !quizData) return null;

    const { username, score, totalQuestions, answers } = attempt;
    const { questionList } = quizData;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{username}</h3>
                        <p className="text-slate-600 dark:text-slate-400">Score: {score} / {totalQuestions}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-4">
                    {questionList && questionList.map((question, qIndex) => {
                        const userAnswerIndex = answers[qIndex];
                        const isAnswered = userAnswerIndex !== undefined;
                        const correctAnswerIndex = question.correctAnswerIndex;

                        const userAnswerText = isAnswered ? (question.options[userAnswerIndex] || "Invalid Answer") : "No Answer";
                        const isCorrect = isAnswered && userAnswerIndex === correctAnswerIndex;

                        return (
                            <div key={qIndex} className="p-4 rounded-md border dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{qIndex + 1}. {question.text}</p>

                                {/* User's Answer */}
                                {isAnswered ? (
                                    <div className={`flex items-center p-3 rounded border ${
                                        isCorrect
                                        ? 'bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700'
                                        : 'bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700'
                                    }`}>
                                        {isCorrect ? <Check className="w-5 h-5 text-green-600 mr-2" /> : <X className="w-5 h-5 text-red-600 mr-2" />}
                                        <span className={isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
                                            {userAnswerText}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center p-3 rounded bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 border">
                                        <span className="text-slate-500 italic">No answer submitted</span>
                                    </div>
                                )}

                                {/* Correct Answer (if user was wrong) */}
                                {!isCorrect && (
                                     <div className="flex items-center p-3 rounded bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 border mt-2">
                                         <Check className="w-5 h-5 text-green-600 mr-2" />
                                         <span className="text-green-800 dark:text-green-300">
                                             Correct Answer: {question.options[correctAnswerIndex]}
                                         </span>
                                     </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT 2: ConfirmationModal ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 text-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{message}</p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-6 py-2 rounded-lg font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-6 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 flex items-center justify-center disabled:opacity-50"
                    >
                        {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT 3: SkeletonLoader ---
const SkeletonLoader = () => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border dark:border-slate-700 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
    </div>
);

// --- COMPONENT 4: AnalyticsCard ---
const AnalyticsCard = ({ title, value }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border dark:border-slate-700 p-6">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{title}</h3>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
);

// --- MAIN COMPONENT ---
const AsyncAnalyticsPage = ({ quizId, quizTitle, onNavigate }) => {
    const { apiCall } = useAPI();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for all data
    const [attempts, setAttempts] = useState([]); // Holds ParticipantAttemptDTO objects
    const [quizData, setQuizData] = useState(null); // Holds the full Quiz object

    // State for UI controls
    const [selectedAttempt, setSelectedAttempt] = useState(null); // For view modal
    const [attemptToDelete, setAttemptToDelete] = useState(null); // For delete modal
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [searchTerm, setSearchTerm] = useState('');
    const [participantSortBy, setParticipantSortBy] = useState('name-asc'); // Added State for sorting


    // This function fetches all data and can be called to refresh
    const fetchAllData = useCallback(async () => {
        setError('');
        try {
            // Fetch analytics (which now includes attempts)
            const analyticsData = await apiCall(`/share/quiz/${quizId}/async-analytics`);
            console.log("Async Analytics Data:", analyticsData);
            setAnalytics(analyticsData);
            setAttempts(Array.isArray(analyticsData.attempts) ? analyticsData.attempts : []);

            // Fetch the quiz data (for question/option text)
            const quizData = await apiCall(`/quiz/${quizId}`);
            console.log("Quiz Data:", quizData);
            setQuizData(quizData);

        } catch (err) {
            console.error("Failed to fetch all data:", err);
            setError('Failed to load analytics data.');
        } finally {
            setLoading(false);
        }
    }, [quizId, apiCall]); // Use useCallback for this function

    useEffect(() => {
        if (quizId) {
            setLoading(true); // Set loading only on initial load
            fetchAllData();
        } else {
            setError("No Quiz ID provided.");
            setLoading(false);
        }
    }, [quizId, fetchAllData]); // Run effect when fetchAllData (and its dependencies) changes

    // Memoized search AND sort results for attempts list
    const filteredAndSortedAttempts = useMemo(() => {
        if (!Array.isArray(attempts)) return [];

        // 1. Filter first
        let filtered = attempts.filter(attempt =>
            attempt.username.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // 2. Then Sort
        switch (participantSortBy) {
            case 'name-asc':
                filtered.sort((a, b) => a.username.localeCompare(b.username));
                break;
            case 'name-desc':
                filtered.sort((a, b) => b.username.localeCompare(a.username));
                break;
            case 'score-desc': // High to Low
                filtered.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
                break;
            case 'score-asc': // Low to High
                filtered.sort((a, b) => (a.score ?? -1) - (b.score ?? -1));
                break;
            default:
                // Default to name-asc if sort key is unknown
                filtered.sort((a, b) => a.username.localeCompare(b.username));
        }

        return filtered;
    }, [attempts, searchTerm, participantSortBy]); // <-- Added participantSortBy dependency

    // --- Delete Handlers ---
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
            // Call the backend endpoint to delete the creator's record of the attempt
            await apiCall(`/share/attempt/delete?quizId=${quizId}&userId=${attemptToDelete.username}`, {
                method: 'DELETE'
            });

            // On success, refresh all page data
            await fetchAllData();
            handleCloseDeleteModal();

        } catch (err) {
            console.error("Failed to delete attempt:", err);
            alert("Failed to delete the attempt. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Helper function to prepare data for charts ---
    const prepareChartData = (optionCounts, question) => {
        if (!optionCounts || typeof optionCounts !== 'object' || !question || !question.options) {
            return [];
        }
        return Object.keys(optionCounts).map((optIndex) => ({
            name: question.options[optIndex] || `Option ${parseInt(optIndex) + 1}`,
            count: optionCounts[optIndex] || 0
        }));
    };


    // --- Loading State ---
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header Skeleton */}
                    <div className="flex justify-between items-center mb-6 animate-pulse">
                        <div>
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-2"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
                        </div>
                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-36"></div>
                    </div>
                    {/* Card Skeletons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <SkeletonLoader />
                        <SkeletonLoader />
                        <SkeletonLoader />
                    </div>
                    {/* Content Skeleton */}
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border dark:border-slate-700 p-6 animate-pulse">
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
                        <div className="h-64 bg-slate-100 dark:bg-slate-700/50 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Error State ---
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/20 p-4">
                <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md max-w-md border border-red-200 dark:border-red-700/50">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Loading Failed</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                    <button
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
                        onClick={() => onNavigate('dashboard')}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // --- No Data State ---
    // This check is CRITICAL: It waits for BOTH API calls to succeed.
    if (!analytics || !quizData) {
         return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md max-w-md border dark:border-slate-700">
                    <BarChart2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Analytics Data</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">No analytics have been generated for this quiz yet. Check back after participants have made attempts.</p>
                    <button
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* --- Header --- */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{quizData.title || quizTitle || 'Quiz Analytics'}</h1>
                        <p className="text-slate-500 dark:text-slate-400">Asynchronous quiz results</p>
                    </div>
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="flex items-center px-4 py-2 bg-white text-slate-700 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Back to Dashboard
                    </button>
                </div>

                {/* --- Stat Cards --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <AnalyticsCard title="Total Attempts" value={analytics.totalAttempts} />
                    <AnalyticsCard title="Average Score" value={`${analytics.averageScore.toFixed(1)} / ${numQuestions}`} />
                    <AnalyticsCard title="Unique Participants" value={attempts.length} />
                </div>

                {/* --- TABS --- */}
                <div className="mb-6 border-b border-slate-300 dark:border-slate-700">
                    <nav className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex items-center space-x-2 px-1 py-3 font-semibold border-b-2 ${
                                activeTab === 'details'
                                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            <BarChart2 className="w-5 h-5" />
                            <span>Breakdown</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('participants')}
                            className={`flex items-center space-x-2 px-1 py-3 font-semibold border-b-2 ${
                                activeTab === 'participants'
                                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            <span>Participants ({attempts.length})</span>
                        </button>
                    </nav>
                </div>

                {/* --- TAB CONTENT --- */}
                <div>
                    {/* --- Details Tab --- */}
                    {activeTab === 'details' && (
                        <div className="space-y-8">
                            {questionKeys.length > 0 && quizData.questionList ? (
                                questionKeys.map((qIndex) => {
                                    const questionCounts = analytics.questionOptionCounts[qIndex];
                                    const question = quizData.questionList[qIndex];

                                    // Guard against missing question data
                                    if (!question || !questionCounts) return null;

                                    const chartData = prepareChartData(questionCounts, question); // Pass question for options text

                                    return (
                                        <div key={qIndex} className="bg-white dark:bg-slate-800 rounded-lg shadow border dark:border-slate-700 p-6">
                                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                                                {parseInt(qIndex) + 1}. {question.text}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                                <div>
                                                    <h4 className="text-center font-medium text-slate-600 dark:text-slate-300 mb-2">Vote Distribution</h4>
                                                    <ResponsiveContainer width="100%" height={250}>
                                                        <PieChart>
                                                            <Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                                                                {chartData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div>
                                                    <h4 className="text-center font-medium text-slate-600 dark:text-slate-300 mb-2">Vote Counts</h4>
                                                    <ResponsiveContainer width="100%" height={250}>
                                                        <BarChart data={chartData} layout="vertical" margin={{ left: 50 }}>
                                                            <XAxis type="number" />
                                                            <YAxis dataKey="name" type="category" interval={0} width={100} />
                                                            <Tooltip />
                                                            <Bar dataKey="count" fill="#8884d8" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400">No question breakdown data available.</p>
                            )}
                        </div>
                    )}

                    {/* --- Participants Tab --- */}
                    {activeTab === 'participants' && (
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow border dark:border-slate-700 p-6">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                                Unique Participants ({attempts.length})
                            </h3>

                            {/* --- Search and Sort Controls --- */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                {/* Search Bar */}
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        placeholder="Search participants..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                </div>
                                {/* Sort Dropdown */}
                                <div className="relative flex-shrink-0">
                                    <select
                                        value={participantSortBy}
                                        onChange={e => setParticipantSortBy(e.target.value)}
                                        className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="name-asc">Sort: Name (A-Z)</option>
                                        <option value="name-desc">Sort: Name (Z-A)</option>
                                        <option value="score-desc">Sort: Score (High-Low)</option>
                                        <option value="score-asc">Sort: Score (Low-High)</option>
                                    </select>
                                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            {/* --- END Search and Sort Controls --- */}

                            {/* Participant List (Uses filteredAndSortedAttempts) */}
                            {filteredAndSortedAttempts.length > 0 ? (
                                <ul className="max-h-96 overflow-y-auto space-y-2">
                                    {filteredAndSortedAttempts.map((attempt) => (
                                        <li
                                            key={attempt.username}
                                            className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-md"
                                        >
                                            {/* Clickable user info */}
                                            <div onClick={() => setSelectedAttempt(attempt)} className="flex-1 cursor-pointer truncate">
                                                <span className="font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">{attempt.username}</span>
                                                <span className="ml-4 text-sm text-slate-500 dark:text-slate-400">Score: {attempt.score} / {attempt.totalQuestions}</span>
                                            </div>
                                            {/* Delete Button */}
                                            <button onClick={() => handleOpenDeleteModal(attempt)} className="p-2 ml-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50" title={`Delete ${attempt.username}'s attempt`} disabled={isDeleting}>
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                                    {attempts.length > 0 ? 'No participants match your search.' : 'No participants have attempted this quiz yet.'}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* --- RENDER THE MODALS --- */}
                {selectedAttempt && (
                    <AttemptDetailModal
                        attempt={selectedAttempt}
                        quizData={quizData} // Pass the full quiz data
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
