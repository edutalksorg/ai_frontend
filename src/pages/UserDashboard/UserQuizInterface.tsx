import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Clock, ArrowRight, RotateCcw, Award, ChevronRight, ChevronDown, Lock, CheckCircle } from 'lucide-react';
import { quizzesService } from '../../services/quizzes';
import Button from '../../components/Button';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';
import UserQuizTakingPage from './UserQuizTakingPage';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp, buttonClick, cardHover } from '../../constants/animations';

const UserQuizInterface: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState<Record<string, any[]>>({});
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [unlockedIndex, setUnlockedIndex] = useState(0);
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            // Revert to standard list endpoint for users to avoid permission issues
            const res = await quizzesService.list();
            const items = (res as any)?.data || (Array.isArray(res) ? res : (res as any)?.items) || [];
            console.log('Raw Quizzes from API (User List):', items);

            // Filter out deleted or locally hidden quizzes
            // First pass: Basic property check
            const potentialItems = items.filter((quiz: any) => {
                const id = quiz.id || quiz._id;

                // Check if hidden locally
                const hiddenQuizzes = JSON.parse(localStorage.getItem('hidden_quizzes') || '[]');
                if (hiddenQuizzes.includes(id)) return false;

                // Check deleted status
                if (quiz.deleted || quiz.isDeleted) return false;

                // Check isLocked status (User Request: only show unlocked quizzes)
                // We default to true (show) if isLocked is missing to be safe, 
                // but if it's explicitly true, we hide it.
                if (quiz.isLocked === true) return false;

                return true;
            });

            // Second pass: Validate by fetching attempts
            // This is critical because some deleted quizzes might still be returned by the list API
            // but will fail with 400/404 when we try to interact with them.
            const attemptsData: Record<string, any[]> = {};
            const validItems: any[] = [];

            await Promise.all(potentialItems.map(async (quiz: any) => {
                const quizId = quiz.id || quiz._id;
                try {
                    const attemptsRes = await quizzesService.getAttempts(quizId);
                    const attemptsItems = (attemptsRes as any)?.data || (Array.isArray(attemptsRes) ? attemptsRes : (attemptsRes as any)?.items) || [];
                    attemptsData[quizId] = attemptsItems;
                    validItems.push(quiz);
                } catch (err: any) {
                    // If we get a 400 or 404, assume the quiz is invalid/deleted and exclude it
                    if (err?.response?.status === 400 || err?.response?.status === 404 || err?.status === 400 || err?.status === 404) {
                        console.warn(`Excluding invalid quiz ${quizId} (likely deleted):`, err);
                    } else {
                        // For other errors (500, network), we might still want to show it or at least log it
                        console.error(`Failed to fetch attempts for quiz ${quizId}`, err);
                        // Decided: If we can't fetch attempts, we probably shouldn't show it as "active" 
                        // to prevent user frustration, but strictly only filtering 4xx is safer for flakes.
                        // However, to be safe against the specific issue USER reported, we filter it.
                    }
                }
            }));

            console.log('Active Quizzes (Validated):', validItems);

            // Sort to ensure consistent order (e.g., by created date)
            const sortedItems = [...validItems].sort((a: any, b: any) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            setQuizzes(sortedItems);
            setAttempts(attemptsData);

            // Determine unlocked index based on fetched attempts
            let lastCompletedIndex = -1;
            sortedItems.forEach((quiz: any, index: number) => {
                const quizId = quiz.id || quiz._id;
                const quizAttempts = attemptsData[quizId] || [];
                // Check if there are any attempts
                if (quizAttempts.length > 0) {
                    lastCompletedIndex = index;
                }
            });

            const nextIndex = lastCompletedIndex + 1;
            const newUnlockedIndex = Math.min(nextIndex, sortedItems.length - 1);

            setUnlockedIndex(newUnlockedIndex);
            // Default to showing the active unlocked quiz

            // Only update current index if we are at 0 (initial load)
            // or if the current index is now out of bounds
            if (currentQuizIndex === 0 || currentQuizIndex >= sortedItems.length) {
                setCurrentQuizIndex(newUnlockedIndex);
            }

        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
            dispatch(showToast({ message: 'Failed to load quizzes', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const fetchAttempts = async (quizId: string) => {
        if (attempts[quizId]) return;

        try {
            const res = await quizzesService.getAttempts(quizId);
            const items = (res as any)?.data || (Array.isArray(res) ? res : (res as any)?.items) || [];
            setAttempts(prev => ({ ...prev, [quizId]: items }));
        } catch (error) {
            console.error('Failed to fetch attempts:', error);
        }
    };

    // Load attempts when current index changes, effectively lazy loading when user navigates
    useEffect(() => {
        if (quizzes.length > 0) {
            const quiz = quizzes[currentQuizIndex];
            if (quiz) {
                fetchAttempts(quiz.id || quiz._id);
            }
        }
    }, [currentQuizIndex, quizzes]);

    const formatDate = (attempt: any): string => {
        const dateString = attempt?.createdAt || attempt?.completedAt || attempt?.submittedAt || attempt?.timestamp;
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'N/A';
        }
    };

    if (loading) {
        return <div className="py-12 text-center text-slate-500">Loading quizzes...</div>;
    }

    // If a quiz is selected, show the quiz taking page
    if (selectedQuizId) {
        return (
            <UserQuizTakingPage
                quizId={selectedQuizId}
                onBack={() => {
                    setSelectedQuizId(null);
                    fetchQuizzes(); // Refresh to update attempts
                }}
            />
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="flex items-center justify-between px-2 sm:px-0"
            >
                <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight">
                        QUIZ <span className="text-primary-600 dark:text-primary-400">PATH</span>
                    </h3>
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-1">
                        Test your language mastery levels
                    </p>
                </div>
            </motion.div>

            {quizzes.length > 0 ? (
                <div className="flex flex-col items-center max-w-2xl mx-auto px-2 sm:px-4">
                    {/* Progress Indicator */}
                    <motion.div
                        variants={slideUp}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.1 }}
                        className="w-full mb-8"
                    >
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                                PROGRESS: {Math.round(((currentQuizIndex + 1) / quizzes.length) * 100)}%
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {currentQuizIndex + 1} / {quizzes.length} QUIZZES
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-primary-500/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentQuizIndex + 1) / quizzes.length) * 100}%` }}
                                className="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-1000"
                            />
                        </div>
                    </motion.div>

                    {/* Navigation Controls */}
                    <motion.div
                        variants={fadeIn}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.2 }}
                        className="w-full flex justify-between items-center mb-8 gap-4"
                    >
                        <motion.button
                            whileHover={currentQuizIndex !== 0 ? { x: -3 } : {}}
                            whileTap={currentQuizIndex !== 0 ? { scale: 0.95 } : {}}
                            onClick={() => setCurrentQuizIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuizIndex === 0}
                            className={`min-h-[44px] px-6 rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.2em] border shadow-sm ${currentQuizIndex === 0
                                ? 'text-slate-300 border-slate-100 dark:border-white/5 cursor-not-allowed'
                                : 'text-primary-600 border-primary-500/10 dark:text-white dark:border-white/10 hover:bg-white dark:hover:bg-white/5'
                                }`}
                        >
                            <span className="flex items-center gap-2">← PREV</span>
                        </motion.button>

                        <div className="flex gap-2">
                            <AnimatePresence mode="wait">
                                {currentQuizIndex < unlockedIndex ? (
                                    <motion.span
                                        key="completed"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="inline-flex items-center px-4 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest"
                                    >
                                        COMPLETED
                                    </motion.span>
                                ) : currentQuizIndex === unlockedIndex ? (
                                    <motion.span
                                        key="current"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="inline-flex items-center px-4 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-[9px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest animate-pulse"
                                    >
                                        CURRENT
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="locked"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="inline-flex items-center px-4 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest"
                                    >
                                        LOCKED
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.button
                            whileHover={!(currentQuizIndex >= unlockedIndex || currentQuizIndex === quizzes.length - 1) ? { x: 3 } : {}}
                            whileTap={!(currentQuizIndex >= unlockedIndex || currentQuizIndex === quizzes.length - 1) ? { scale: 0.95 } : {}}
                            onClick={() => setCurrentQuizIndex(prev => Math.min(quizzes.length - 1, prev + 1))}
                            disabled={currentQuizIndex >= unlockedIndex || currentQuizIndex === quizzes.length - 1}
                            className={`min-h-[44px] px-6 rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.2em] border shadow-sm ${currentQuizIndex >= unlockedIndex || currentQuizIndex === quizzes.length - 1
                                ? 'text-slate-300 border-slate-100 dark:border-white/5 cursor-not-allowed'
                                : 'text-primary-600 border-primary-500/10 dark:text-white dark:border-white/10 hover:bg-white dark:hover:bg-white/5'
                                }`}
                        >
                            <span className="flex items-center gap-2">NEXT →</span>
                        </motion.button>
                    </motion.div>

                    {/* Quiz Card */}
                    {(() => {
                        const quiz = quizzes[currentQuizIndex];
                        const isCompleted = currentQuizIndex < unlockedIndex;
                        const isLocked = !isCompleted && currentQuizIndex > unlockedIndex;
                        const quizAttempts = attempts[quiz.id || quiz._id] || [];
                        const bestScore = quizAttempts.length > 0
                            ? Math.max(...quizAttempts.map(a => a.score))
                            : null;

                        return (
                            <motion.div
                                layout
                                variants={slideUp}
                                initial="initial"
                                animate="animate"
                                whileHover={!isLocked ? { y: -10, scale: 1.02 } : {}}
                                className={`w-full group relative overflow-hidden glass-card rounded-[2.5rem] p-8 sm:p-12 border transition-all cursor-pointer ${isLocked
                                    ? 'opacity-40 grayscale pointer-events-none'
                                    : isCompleted
                                        ? 'border-green-500/30'
                                        : 'shadow-2xl'
                                    }`}
                                onClick={() => {
                                    if (!isLocked) {
                                        setSelectedQuizId(quiz.id || quiz._id);
                                    }
                                }}
                            >
                                {/* Background Decorative Elements */}
                                {!isLocked && (
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-primary-600/10 transition-colors" />
                                )}

                                <div className="flex justify-between items-start mb-10">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500 ${isLocked
                                        ? 'bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-slate-600'
                                        : isCompleted
                                            ? 'bg-green-500 text-white shadow-green-500/20'
                                            : 'bg-primary-600 text-white shadow-primary-500/20'
                                        }`}>
                                        {isCompleted ? <CheckCircle className="w-8 h-8" /> : (isLocked ? <Lock className="w-8 h-8" /> : <CheckSquare className="w-8 h-8" />)}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border ${isLocked
                                            ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400'
                                            : 'bg-primary-500/5 border-primary-500/20 text-primary-600 dark:text-primary-400'
                                            }`}>
                                            {quiz.difficulty?.toUpperCase() || 'DIFFICULTY: MEDIUM'}
                                        </span>
                                    </div>
                                </div>

                                <h4 className={`text-3xl sm:text-5xl font-black mb-6 tracking-tighter leading-tight ${isLocked ? 'text-slate-300 dark:text-slate-700' : 'text-slate-900 dark:text-white'
                                    }`}>
                                    {quiz.title?.toUpperCase()}
                                </h4>

                                <p className={`text-lg md:text-xl mb-12 line-clamp-3 leading-relaxed font-medium transition-colors ${isLocked ? 'text-slate-400 dark:text-slate-700' : 'text-slate-600 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                                    }`}>
                                    {quiz.description}
                                </p>

                                <div className={`flex flex-wrap items-center gap-8 mb-12 ${isLocked ? 'text-slate-300' : 'text-primary-600/60 font-black text-[10px] uppercase tracking-widest'}`}>
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4" />
                                        <span>{quiz.timeLimit || 10} MINS</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Award className="w-4 h-4" />
                                        <span>{quiz.questions?.length || 0} QUESTS</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-8 border-t border-primary-500/5">
                                    {isLocked ? (
                                        <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] w-full justify-center">
                                            <Lock size={16} className="mr-3" />
                                            COMPLETE PREVIOUS QUIZ TO UNLOCK
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
                                                <div>
                                                    {bestScore !== null && (
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                            ELITE SCORE: <span className={`text-xl ml-2 font-mono ${bestScore >= 80 ? 'text-green-600' : 'text-primary-600'
                                                                }`}>{bestScore}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    size="lg"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const nextIndex = currentQuizIndex + 1;
                                                        const nextQuizId = nextIndex < quizzes.length ? (quizzes[nextIndex].id || quizzes[nextIndex]._id) : null;

                                                        navigate(`/quizzes/${quiz.id || quiz._id}`, {
                                                            state: { nextQuizId }
                                                        });
                                                    }}
                                                    className="bg-primary-600 hover:bg-primary-700 text-white min-w-[200px] h-14 rounded-2xl shadow-xl shadow-primary-500/20 uppercase font-black tracking-[0.2em] text-[10px] border-none"
                                                >
                                                    {isCompleted ? 'RETAKE MASTER' : (bestScore !== null ? 'SURPASS SCORE' : 'DOMINATE QUIZ')}
                                                </Button>
                                            </div>

                                            {/* Recent Attempts Mini-view */}
                                            {quizAttempts.length > 0 && (
                                                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {quizAttempts.slice(0, 2).map((attempt: any) => (
                                                        <div key={attempt.id} className="flex justify-between items-center p-4 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-primary-500/5">
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{formatDate(attempt)}</span>
                                                            <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 font-mono">{attempt.score}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                        );
                    })()}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-slate-500">No quizzes available.</p>
                </div>
            )}
        </div>
    );
};

export default UserQuizInterface;
