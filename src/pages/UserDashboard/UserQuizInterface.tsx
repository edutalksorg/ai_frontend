import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Clock, ArrowRight, RotateCcw, Award, ChevronRight, ChevronDown, Lock, CheckCircle, BrainCircuit, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { quizzesService } from '../../services/quizzes';
import Button from '../../components/Button';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';
import UserQuizTakingPage from './UserQuizTakingPage';

const UserQuizInterface: React.FC = () => {
    const { t } = useTranslation();
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
            const res = await quizzesService.list();
            const items = (res as any)?.data || (Array.isArray(res) ? res : (res as any)?.items) || [];

            const potentialItems = items.filter((quiz: any) => {
                const id = quiz.id || quiz._id;
                const hiddenQuizzes = JSON.parse(localStorage.getItem('hidden_quizzes') || '[]');
                if (hiddenQuizzes.includes(id)) return false;
                if (quiz.deleted || quiz.isDeleted) return false;
                if (quiz.isLocked === true) return false;
                return true;
            });

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
                    if (err?.response?.status === 400 || err?.response?.status === 404 || err?.status === 400 || err?.status === 404) {
                        console.warn(`Excluding invalid quiz ${quizId}`, err);
                    }
                }
            }));

            const sortedItems = [...validItems].sort((a: any, b: any) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            setQuizzes(sortedItems);
            setAttempts(attemptsData);

            let lastCompletedIndex = -1;
            sortedItems.forEach((quiz: any, index: number) => {
                const quizId = quiz.id || quiz._id;
                const quizAttempts = attemptsData[quizId] || [];
                if (quizAttempts.length > 0) {
                    lastCompletedIndex = index;
                }
            });

            const nextIndex = lastCompletedIndex + 1;
            const newUnlockedIndex = Math.min(nextIndex, sortedItems.length - 1);

            setUnlockedIndex(newUnlockedIndex);
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
        try { return new Date(dateString).toLocaleDateString(); } catch { return 'N/A'; }
    };

    if (loading) return <div className="py-20 text-center text-slate-500 animate-pulse">{t('quiz.loading')}</div>;

    if (selectedQuizId) {
        return (
            <UserQuizTakingPage
                quizId={selectedQuizId}
                onBack={() => {
                    setSelectedQuizId(null);
                    fetchQuizzes();
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-panel p-4 flex items-center justify-between rounded-xl sticky top-20 z-20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/10 rounded-lg">
                        <CheckSquare className="w-6 h-6 text-pink-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {t('quiz.title')}
                    </h3>
                </div>
                <div className="text-sm font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {t('quiz.progress')}: {quizzes.length > 0 ? `${currentQuizIndex + 1} / ${quizzes.length}` : '0 / 0'}
                </div>
            </div>

            {quizzes.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    {/* Left: Quiz Card */}
                    <div className="lg:col-span-2 h-full flex flex-col">
                        {(() => {
                            const quiz = quizzes[currentQuizIndex];
                            const isCompleted = currentQuizIndex < unlockedIndex;
                            const isLocked = !isCompleted && currentQuizIndex > unlockedIndex;
                            const quizAttempts = attempts[quiz.id || quiz._id] || [];
                            const bestScore = quizAttempts.length > 0
                                ? Math.max(...quizAttempts.map(a => a.score))
                                : null;

                            return (
                                <div className={`glass-card relative w-full overflow-visible p-0 rounded-3xl transition-all duration-500 flex-1 flex flex-col justify-center group ${isLocked
                                    ? 'grayscale opacity-75'
                                    : 'hover:shadow-[0_20px_60px_-15px_rgba(236,72,153,0.4)] hover:-translate-y-2 hover:scale-[1.02]'
                                    }`}>

                                    <div className="p-8 sm:p-10 relative z-10 w-full bg-white/5 backdrop-blur-md rounded-3xl">
                                        {/* Decorative Blob inside card */}
                                        {!isLocked && <div className="absolute top-10 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />}

                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`p-4 rounded-2xl ${isLocked
                                                ? 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-400'
                                                : isCompleted
                                                    ? 'bg-green-500/10 text-green-500 shadow-lg shadow-green-500/20'
                                                    : 'bg-pink-500/10 text-pink-500 shadow-lg shadow-pink-500/20'
                                                }`}>
                                                {isCompleted ? <CheckCircle className="w-8 h-8" strokeWidth={1.5} /> : <CheckSquare className="w-8 h-8" strokeWidth={1.5} />}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-sm font-bold px-4 py-1.5 rounded-full border ${isLocked
                                                    ? 'bg-slate-100/50 border-slate-200 text-slate-400'
                                                    : 'bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-white/10 text-slate-600 dark:text-slate-300'
                                                    }`}>
                                                    {quiz.difficulty ? t(`quiz.difficultyLevels.${quiz.difficulty.toLowerCase()}`) : 'Medium'}
                                                </span>
                                            </div>
                                        </div>

                                        <h4 className={`text-2xl sm:text-3xl font-extrabold mb-4 leading-tight ${isLocked ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                            {quiz.title}
                                        </h4>

                                        <p className={`text-lg mb-8 leading-relaxed line-clamp-2 ${isLocked ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {quiz.description}
                                        </p>

                                        <div className={`flex flex-wrap items-center gap-6 mb-8 text-sm font-medium ${isLocked ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50">
                                                <Clock className="w-4 h-4" />
                                                <span>{quiz.timeLimitMinutes || quiz.duration || 10} {t('common.mins')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50">
                                                <Award className="w-4 h-4" />
                                                <span>{quiz.questions?.length || 0} {t('quiz.questions')}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-200/50 dark:border-white/10">
                                            {isLocked ? (
                                                <div className="flex items-center text-slate-400 font-medium bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-xl">
                                                    <Lock size={18} className="mr-2" />
                                                    <span>{t('quiz.lockedDesc')}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-full sm:w-auto">
                                                        {bestScore !== null && (
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-4 ${bestScore >= 80 ? 'border-green-500 text-green-600' : 'border-orange-500 text-orange-600'
                                                                    }`}>
                                                                    {bestScore}%
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs uppercase font-bold text-slate-400">{t('quiz.bestScore')}</span>
                                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">Keep improving!</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const nextIndex = currentQuizIndex + 1;
                                                            const nextQuizId = nextIndex < quizzes.length ? (quizzes[nextIndex].id || quizzes[nextIndex]._id) : null;
                                                            setSelectedQuizId(quiz.id || quiz._id);
                                                        }}
                                                        className="w-full sm:w-auto relative group px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-bold shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:-translate-y-1 transition-all"
                                                    >
                                                        <span className="flex items-center justify-center gap-2">
                                                            {isCompleted ? t('quiz.retake') : (bestScore !== null ? t('quiz.improve') : t('quiz.start'))}
                                                            <ArrowRight size={18} />
                                                        </span>
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Recent Attempts Integrated nicely */}
                                        {!isLocked && quizAttempts.length > 0 && (
                                            <div className="mt-8 pt-4 border-t border-slate-200/50 dark:border-white/5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <History size={14} className="text-slate-400" />
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('quiz.recentHistory')}</span>
                                                </div>
                                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                                    {quizAttempts.slice(0, 3).map((attempt: any) => (
                                                        <div key={attempt.id} className="flex flex-col items-center bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-lg min-w-[80px] border border-slate-100 dark:border-slate-700/50">
                                                            <span className="text-xs text-slate-500 mb-1">{formatDate(attempt)}</span>
                                                            <span className={`font-bold text-sm ${attempt.score >= 80 ? 'text-green-500' : 'text-slate-700 dark:text-slate-300'}`}>{attempt.score}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Right: Progress & Navigation */}
                    <div className="glass-panel p-6 rounded-3xl flex flex-col h-full">
                        {/* Progress Card */}
                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-3">
                                <div>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider">{t('quiz.yourMastery')}</span>
                                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{Math.round(((currentQuizIndex + 1) / quizzes.length) * 100)}%</span>
                                </div>
                                <BrainCircuit className="w-6 h-6 text-pink-500/30" />
                            </div>
                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                                    style={{ width: `${((currentQuizIndex + 1) / quizzes.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex justify-center mb-6">
                            {currentQuizIndex < unlockedIndex ? (
                                <span className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full font-bold text-sm border border-green-500/20 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
                                    <CheckCircle size={16} />
                                    <span>{t('quiz.completed')}</span>
                                </span>
                            ) : currentQuizIndex === unlockedIndex ? (
                                <span className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 text-pink-500 rounded-full font-bold text-sm border border-pink-500/20 backdrop-blur-sm animate-pulse transition-all hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20">
                                    <BrainCircuit size={16} />
                                    <span>{t('quiz.current')}</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 px-4 py-2 bg-slate-500/10 text-slate-500 rounded-full font-bold text-sm border border-slate-500/20 backdrop-blur-sm">
                                    <Lock size={16} />
                                    <span>{t('quiz.locked')}</span>
                                </span>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="space-y-3 flex-1 flex flex-col justify-end">
                            <button
                                onClick={() => setCurrentQuizIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuizIndex === 0}
                                className={`w-full glass-button px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${currentQuizIndex === 0
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:-translate-x-1 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20'
                                    }`}
                            >
                                <ArrowRight className="rotate-180" size={18} />
                                <span>{t('common.previous')}</span>
                            </button>

                            <button
                                onClick={() => setCurrentQuizIndex(prev => Math.min(quizzes.length - 1, prev + 1))}
                                disabled={currentQuizIndex >= unlockedIndex || currentQuizIndex === quizzes.length - 1}
                                className={`w-full glass-button px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${currentQuizIndex >= unlockedIndex || currentQuizIndex === quizzes.length - 1
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:translate-x-1 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20'
                                    }`}
                            >
                                <span>{t('common.next')}</span>
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-panel py-20 text-center rounded-3xl border-dashed border-2 border-slate-300 dark:border-slate-700">
                    <CheckSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-xl text-slate-500 font-bold">{t('quiz.noQuizzes')}</p>
                    <p className="text-slate-400 mt-2">Check back later for new challenges!</p>
                </div>
            )}
        </div>
    );
};

export default UserQuizInterface;
