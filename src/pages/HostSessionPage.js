// src/pages/HostSessionPage.js
import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
    Users, Play, Pause, ChevronRight, StopCircle, CheckCircle, ArrowLeft,
    Loader2, BarChart3, X, Check, Eye, Copy, UserCircle,
    AlertTriangle, ChevronLeft
} from 'lucide-react';
import { useAPI } from '../hooks/useAPI';
import { useWebSocket } from '../hooks/useWebSocket'; // Using your hook signature
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

// ##################################################################
// ## REUSABLE COMPONENTS (PREMIUM STYLING - Using Original Logic) ##
// ##################################################################

// --- Chart Colors ---
const COLORS_LIGHT = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const COLORS_DARK = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#F472B6'];

// --- Notification Pop-up ---
const Notification = ({ message, type = 'error', onClose }) => {
    useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
    const isError = type === 'error';
    return (
        <div className="fixed top-5 right-5 z-[200] w-full max-w-sm">
           <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className={`flex items-start p-4 rounded-xl shadow-2xl border ${ isError ? 'bg-red-50 dark:bg-gray-900 border-red-200 dark:border-red-700' : 'bg-green-50 dark:bg-gray-900 border-green-200 dark:border-green-700'} backdrop-blur-lg`}>
             <div className={`flex-shrink-0 p-1.5 rounded-full ${isError ? 'bg-red-100 dark:bg-red-800' : 'bg-green-100 dark:bg-green-800'}`}> {isError ? <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-300"/> : <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-300"/>} </div>
             <div className="ml-3 flex-1"> <p className={`text-sm font-semibold ${isError ? 'text-red-900 dark:text-red-200' : 'text-green-900 dark:text-green-200'}`}>{isError ? 'Error' : 'Success'}</p> <p className={`text-sm ${isError ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'} mt-1`}>{message}</p> </div>
             <button onClick={onClose} className="ml-auto -mr-1 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16} /></button>
           </motion.div>
        </div>
    );
};

// --- Custom Tooltip for Charts ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) { return ( <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"> <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{`${label}`}</p> <p className="text-sm text-indigo-600 dark:text-indigo-400">{`Votes: ${payload[0].value}`}</p> </div> ); } return null;
};

// --- Participant Item ---
const ParticipantItem = ({ name, hasAnswered }) => (
    <motion.div layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center space-x-2 overflow-hidden">
            <UserCircle className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{name}</span>
        </div>
        {hasAnswered && (
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" title={`${name} has answered`} />
            </motion.div>
        )}
    </motion.div>
);

// --- Question Display ---
const QuestionDisplay = ({ question, totalQuestions, answeredCount, participantCount }) => {
     if (!question) return null;
    const index = question.questionIndex;
    return (
    <motion.div key={index} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200 dark:border-gray-800 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-full flex justify-between items-center mb-4">
             <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider"> Q {index + 1} / {totalQuestions} </span>
             <span className="text-sm font-semibold text-gray-600 dark:text-gray-400"> {answeredCount} / {participantCount} Answered </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 break-words max-w-3xl"> {question?.text ?? 'Loading question...'} </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
            {question?.options?.map((option, idx) => (
                <div key={idx} className="flex items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold ring-1 ring-indigo-200 dark:ring-indigo-700">{String.fromCharCode(65 + idx)}</span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium break-words text-left">{option}</span>
                </div>
            ))}
        </div>
    </motion.div>
)};

// --- Results Display ---
const ResultsDisplay = ({ question, totalQuestions, optionCounts }) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const chartColors = isDarkMode ? COLORS_DARK : COLORS_LIGHT;
    const totalVotes = useMemo(() => Object.values(optionCounts || {}).reduce((sum, count) => sum + (count || 0), 0), [optionCounts]);
    const index = question?.questionIndex ?? -1;
    const chartData = useMemo(() => {
        if (!question || !question.options) return [];
        return question.options.map((option, idx) => ({ name: option || `Option ${idx + 1}`, votes: optionCounts?.[idx] || 0 }));
    }, [question, optionCounts]);

    if (!question) return <div className="text-center text-gray-500 dark:text-gray-400">Loading results...</div>;

    return (
        <motion.div key={`${index}-results`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
             <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 block uppercase tracking-wider"> Results for Question {index + 1} </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 break-words">{question?.text ?? '...'}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
                <div className="lg:col-span-2 space-y-3">
                    {question?.options?.map((option, idx) => {
                       const votes = optionCounts?.[idx] || 0;
                       const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(0) : 0;
                       const isCorrect = false; // Original ref code didn't handle correctness here
                       return (
                           <div key={idx} className={`relative p-3.5 rounded-lg overflow-hidden border-2 shadow-sm ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/40' : 'border-transparent bg-gray-100 dark:bg-gray-800'}`}>
                                <motion.div className={`absolute inset-y-0 left-0 ${isCorrect ? 'bg-green-500' : 'bg-indigo-500'} opacity-20 dark:opacity-30`} initial={{ width: '0%' }} animate={{ width: `${percentage}%`}} transition={{ duration: 0.5, ease: 'easeOut' }} />
                               <div className="relative z-10 flex justify-between items-center space-x-2">
                                    <span className={`text-sm font-medium break-words ${isCorrect ? 'text-green-800 dark:text-green-300 font-semibold' : 'text-gray-800 dark:text-gray-200'}`}> {option} {isCorrect && <Check className="inline w-4 h-4 ml-1 text-green-600"/>} </span>
                                    <span className="flex-shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/30 px-1.5 py-0.5 rounded"> {percentage}% ({votes}) </span>
                               </div>
                           </div> ); })}
                </div>
                <div className="lg:col-span-3 h-72 md:h-80 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                            <XAxis type="number" stroke={isDarkMode ? "#4B5563" : "#9CA3AF"} fontSize={10} allowDecimals={false} axisLine={false} tickLine={false}/>
                            <YAxis dataKey="name" type="category" width={100} stroke={isDarkMode ? "#4B5563" : "#9CA3AF"} fontSize={10} interval={0} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }} />
                            <Bar dataKey="votes" radius={[0, 6, 6, 0]} barSize={25}> {chartData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} /> ))} </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div> );
};

// --- Waiting/Paused/Ended Display ---
const SessionStatusDisplay = ({ status, onNavigate, quizId, quizTitle, joinCode }) => {
    // --- Logic from JoinInfoSidebar moved here ---
    const [copied, setCopied] = useState(false);
    const joinUrl = `${window.location.origin}/join`;
    const isDarkMode = document.documentElement.classList.contains('dark');
    const qrFgColor = isDarkMode ? '#FFFFFF' : '#111827';
    const copyCode = () => { navigator.clipboard.writeText(joinCode).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
    // --- End of moved logic ---

    return (
     <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 md:p-10 text-center border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center min-h-[400px]">
        {status === 'WAITING' || status === 'PAUSED' ? (
             <>
                 {/* --- Show QR for WAITING, icon for PAUSED --- */}
                 {status === 'WAITING' ? (
                    <div className="text-center space-y-4 flex flex-col items-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Waiting for Participants...</h2>
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg inline-block shadow-sm border border-gray-200 dark:border-gray-600">
                            <QRCodeSVG value={joinCode || 'WAITING'} size={140} level="H" fgColor={qrFgColor} bgColor="transparent" includeMargin={false} />
                        </div>
                        <div className="relative w-full max-w-xs">
                            <span className="block text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 select-all">{joinCode}</span>
                            <button onClick={copyCode} className={`absolute top-0 right-0 p-2 rounded-md transition-all ${copied ? 'text-green-500' : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`} title={copied ? "Copied!" : "Copy Code"}>
                                {copied ? <CheckCircle className="w-5 h-5"/> : <Copy className="w-5 h-5"/>}
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Go to: {joinUrl}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 pt-4">Click 'Start Quiz' in the sidebar when ready.</p>
                    </div>
                 ) : ( // PAUSED state
                    <>
                        <div className="relative mb-6"> <Loader2 className={`w-16 h-16 text-indigo-500`} /> <Users className="w-6 h-6 text-indigo-700 dark:text-indigo-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/> </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Session Paused</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Click Resume to continue.</p>
                    </>
                 )}
             </>
         ) : ( // Assume final state (ended by WS signal)
             <>
                 <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Session Ended</h2>
                 <p className="text-gray-500 dark:text-gray-400 mb-8">The quiz session is complete.</p>
                 <button onClick={() => onNavigate('analytics', { sessionId: joinCode, quizTitle: quizTitle, isHost: true, quizId: quizId })} className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 dark:shadow-none transition-all"> <BarChart3 className="w-5 h-5 mr-2" /> View Final Analytics </button>
             </>
         )}
    </motion.div>
)};

// --- Full Page Loader ---
const FullPageLoader = () => ( <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-black p-4 font-sans"><div className="flex flex-col items-center text-gray-600 dark:text-gray-400"> <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" /> <p className="text-lg font-medium">Loading Session...</p> </div></div> );
// --- Full Page Error ---
const FullPageError = ({ error, onNavigate }) => ( <div className="min-h-screen w-full flex items-center justify-center bg-red-50 dark:bg-red-900/10 p-4 font-sans"><div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-red-200 dark:border-red-700/50"><AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" /> <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">An Error Occurred</h2> <p className="text-gray-600 dark:text-gray-400 mb-8 text-base">{error}</p> <button onClick={() => onNavigate('dashboard')} className="flex items-center justify-center w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"> <ChevronLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard </button> </div></div> );


// ##################################################################
// ## MAIN PAGE: HostSessionPage (Corrected WS Dependencies) ##
// ##################################################################
const HostSessionPage = ({ joinCode, quizId, onNavigate }) => {
    // --- Original State and Hooks (Preserved) ---
    const [quiz, setQuiz] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [status, setStatus] = useState('WAITING');
    const [answeredUsers, setAnsweredUsers] = useState(new Set());
    
    const [optionCounts, setOptionCounts] = useState({});
    const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });
    const [loadingQuiz, setLoadingQuiz] = useState(true);
    const [showResults, setShowResults] = useState(false);

    const { apiCall } = useAPI();
    const { connected, subscribe, send } = useWebSocket(joinCode);

    const onNavigateRef = useRef(onNavigate); useEffect(() => { onNavigateRef.current = onNavigate; }, [onNavigate]);
    const quizRef = useRef(quiz); useEffect(() => { quizRef.current = quiz; }, [quiz]);

    // Fetch Quiz Details (Original Logic)
    useEffect(() => {
        const fetchQuiz = async () => {
            setLoadingQuiz(true);
            try { const data = await apiCall(`/quiz/${quizId}`); setQuiz(data); }
            catch (err) { console.error('Failed to fetch quiz:', err); setNotification({show: true, message: 'Failed to load quiz details.', type: 'error'}); }
            finally { setLoadingQuiz(false); }
        };
        fetchQuiz();
    }, [quizId, apiCall]);

    // WebSocket Subscriptions (Original Logic from Reference with corrected dependencies)
    useEffect(() => {
        if (!connected) { console.log("Host WS: Not connected."); return; }
        console.log("Host WS: Connected, subscribing...");

        const unsubParticipants = subscribe(`/topic/session/${joinCode}/participants`, (data) => {
            console.log("Host WS: Received Participants Update:", data); // DEBUG
            setParticipants(Array.isArray(data) ? data.sort() : []);
        });
        
        const unsubHost = subscribe(`/topic/session/${joinCode}/host`, (data) => {
            if (data.eventType === 'USER_ANSWERED') {
                setAnsweredUsers(prev => new Set(prev).add(data.name));
                const { optionIndex } = data;
                setOptionCounts(prevCounts => ({...prevCounts, [optionIndex]: (prevCounts[optionIndex] || 0) + 1 }));
            }
        });
        const unsubQuestion = subscribe(`/topic/session/${joinCode}/question`, (data) => {
            setCurrentQuestion(data);
            setOptionCounts({});
            setAnsweredUsers(new Set());
            setShowResults(false);
        });
        const handleEndSignal = () => {
            const currentQuiz = quizRef.current;
            onNavigateRef.current('analytics', { sessionId: joinCode, quizTitle: currentQuiz?.title || 'Quiz Results', quizId: quizId, totalQuestions: currentQuiz?.questionList?.length || 0, isHost: true });
        };
        const unsubEnded = subscribe(`/topic/session/${joinCode}/ended`, handleEndSignal);
        const unsubStatus = subscribe(`/topic/session/${joinCode}`, (data) => {
            if (data?.eventType === 'STATUS_UPDATE') {
                const newStatus = (data.status === 'ACTIVE' || data.status === 'PAUSED') ? data.status : status; // Use existing status if unknown
                 setStatus(newStatus);
            }
        });

        // Initial fetch using `send`
        send(`/app/session/${joinCode}/participants`, {});
        console.log("Host WS: Sent initial participant request."); // DEBUG

        return () => { // Cleanup function
             console.log("Host WS: Unsubscribing..."); // DEBUG
            unsubParticipants?.(); unsubHost?.(); unsubEnded?.(); unsubQuestion?.(); unsubStatus?.();
        };
        // Dependencies reverted to match the original reference code EXACTLY
    }, [connected, joinCode, subscribe, send,status, quizId]);

    // Action Handlers (Original Logic)
    const handleStart = () => { send(`/app/session/${joinCode}/start`, {}); setStatus('ACTIVE'); };
    const handleNext = () => { send(`/app/session/${joinCode}/next`, {}); setShowResults(false); };
    const handlePause = async () => { try { await apiCall(`/sessions/${joinCode}/pause`, { method: 'PUT' }); } catch (err) { console.error('Failed to pause:', err); setNotification({show: true, message: 'Failed to pause session.', type: 'error'}); }};
    const handleResume = async () => { try { await apiCall(`/sessions/${joinCode}/resume`, { method: 'PUT' }); } catch (err) { console.error('Failed to resume:', err); setNotification({show: true, message: 'Failed to resume session.', type: 'error'}); }};
    const handleEnd = async () => { try { await apiCall(`/sessions/${joinCode}/end`, { method: 'PUT' }); } catch (err) { console.error('Failed to end session:', err); setNotification({show: true, message: 'Failed to end session.', type: 'error'}); }};
    const handleToggleResultsDisplay = () => { setShowResults(prev => !prev); };

    // --- Loading and Error States ---
    if (loadingQuiz) return <FullPageLoader />;
    if (!quiz && !loadingQuiz) return <FullPageError error="Failed to load quiz details." onNavigate={onNavigate} />;

    // --- Derived State ---
    const totalQuestions = quiz?.questionList?.length ?? 0;
    const currentQIndex = currentQuestion?.questionIndex ?? -1;

    // --- Main Render (Premium Re-styled) ---
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-black font-sans text-gray-900 dark:text-gray-100 overflow-hidden">

            {/* --- Main Content Area --- */}
            <main className="flex-1 flex flex-col p-6 lg:p-10 md:overflow-y-auto">
                 {/* --- MODIFICATION: Added Back Button --- */}
                 <motion.div layout="position" className="flex justify-between items-center mb-8 gap-4">
                     {/* Wrapper for back button and title */}
                     <div className="flex items-center gap-4 min-w-0"> {/* min-w-0 ensures truncation works */}
                         <button 
                             onClick={() => onNavigate('dashboard')} 
                             className="flex-shrink-0 flex items-center justify-center p-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
                             aria-label="Back to Dashboard"
                             title="Back to Dashboard"
                         >
                             <ArrowLeft className="w-5 h-5" />
                         </button>
                         <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                             {quiz?.title}
                         </h1>
                     </div>
                     {/* Connection Status */}
                      <div className={`flex-shrink-0 flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${connected ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 animate-pulse'}`}>
                        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        <span>{connected ? 'Connected' : 'Connecting...'}</span>
                      </div>
                 </motion.div>
                 {/* --- END MODIFICATION --- */}

                <div className="flex-1 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {status === 'WAITING' || status === 'PAUSED' ? (
                             <SessionStatusDisplay key="status" status={status} onNavigate={onNavigate} quizId={quizId} quizTitle={quiz?.title} joinCode={joinCode} />
                         )
                        : showResults && currentQuestion ? (
                             <ResultsDisplay key={`q-${currentQIndex}-res`} question={currentQuestion} totalQuestions={totalQuestions} optionCounts={optionCounts} />
                         )
                        : currentQuestion ? (
                             <QuestionDisplay key={`q-${currentQIndex}`} question={currentQuestion} index={currentQIndex} total={totalQuestions} answeredCount={answeredUsers.size} participantCount={participants.length} />
                        )
                        : ( <div className="flex-1 flex items-center justify-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div> )}
                    </AnimatePresence>
                </div>
            </main>

            {/* --- Sidebar --- */}
            <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-white dark:bg-gray-950 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 flex flex-col shadow-2xl md:h-screen">
                <div className="p-5">
                    {/* Participant List Title */}
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center border-b border-gray-200 dark:border-gray-800 pb-3 mb-3"> 
                        <Users className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" /> Participants ({participants.length}) 
                    </h2>
                </div>
                
                {/* Always show participant list */}
                <div className="px-5 pb-5 flex-grow overflow-y-auto min-h-[200px] flex flex-col">
                    {participants.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-sm text-center text-gray-500 dark:text-gray-400 italic">No participants yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 flex-1">
                            <AnimatePresence>
                                {participants.map(name => (
                                    <ParticipantItem key={name} name={name} hasAnswered={answeredUsers.has(name)} />
                                ))
                            }
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Control Panel: mt-auto pushes it to the bottom */}
                <div className="p-5 mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
                     <div className="space-y-3">
                         {status === 'WAITING' && ( <button onClick={handleStart} disabled={participants.length === 0 || !connected} className="w-full flex items-center justify-center px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30 dark:shadow-none transition-all disabled:opacity-50"> <Play className="w-5 h-5 mr-2" /> Start Quiz </button> )}
                         {status === 'PAUSED' && ( <button onClick={handleResume} disabled={!connected} className="w-full flex items-center justify-center px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30 dark:shadow-none transition-all disabled:opacity-50"> <Play className="w-5 h-5 mr-2" /> Resume Quiz </button> )}
                         {status === 'ACTIVE' && (
                             <>
                                  <button onClick={handleToggleResultsDisplay} disabled={!connected || !currentQuestion} className={`w-full flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-lg border transition-colors disabled:opacity-50 ${showResults ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-400 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-900/60' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                      {showResults ? <Eye className="w-5 h-5 mr-2"/> : <BarChart3 className="w-5 h-5 mr-2"/>}
                                      {showResults ? 'Hide Results' : 'Show Results'}
                                  </button>
                                  <button onClick={handlePause} disabled={!connected} className={`w-full flex items-center justify-center px-5 py-3 text-sm font-semibold rounded-lg border transition-colors disabled:opacity-50 bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/60`}>
                                     <Pause className="w-5 h-5 mr-2"/> Pause Quiz
                                 </button>
                                 <button onClick={handleNext} disabled={!connected} className="w-full flex items-center justify-center px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 dark:shadow-none transition-all disabled:opacity-50">
                                     {currentQIndex >= (totalQuestions || 0) - 1 ? 'Finish Quiz' : 'Next Question'} <ChevronRight className="w-5 h-5 ml-2" />
                                 </button>
                             </>
                         )}
                         {status !== 'WAITING' && (<button onClick={handleEnd} disabled={!connected} className="w-full flex items-center justify-center px-5 py-2 text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors disabled:opacity-50 mt-3"> <StopCircle className="w-4 h-4 mr-1.5" /> End Session </button>)}
                     </div>
                </div>
            </aside>

            <AnimatePresence> {notification.show && ( <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ show: false, message: '', type: 'error' })} /> )} </AnimatePresence>
        </div>
    );
};

export default HostSessionPage;