import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Clock, Award, PlayCircle, Lock, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { quizzesService } from '../../services/quizzes';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';

const UserQuizInterface: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [unlockedIndex, setUnlockedIndex] = useState(0);
    const [allCompleted, setAllCompleted] = useState(false);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const res = await quizzesService.list();
            let items = (res as any)?.data || (Array.isArray(res) ? res : (res as any)?.items) || [];

            // Sort quizzes by creation date or another stable field to ensure consistent path
            const sortedItems = [...items].sort((a: any, b: any) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            // Fetch progress/attempts to determine unlocking
            // For now, we'll try to determine completion based on fields in items or local storage fallback
            // In a real app, this would come from a specific 'progress' API
            try {
                const localCompleted = JSON.parse(localStorage.getItem('completedQuizzes') || '[]');
                if (Array.isArray(localCompleted)) {
                    items = sortedItems.map((item: any) => {
                        const isDone = localCompleted.includes(item.id || item._id) || item.isCompleted || item.completed;
                        return { ...item, isCompleted: isDone };
                    });
                } else {
                    items = sortedItems;
                }
            } catch (e) {
                items = sortedItems;
            }

            setQuizzes(items);

            // Calculate progress
            let lastCompletedIndex = -1;
            items.forEach((quiz: any, index: number) => {
                if (quiz.isCompleted) {
                    lastCompletedIndex = index;
                }
            });

            const nextIndex = lastCompletedIndex + 1;
            setUnlockedIndex(Math.min(nextIndex, items.length - 1));
            setCurrentQuizIndex(Math.min(nextIndex, items.length - 1));
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
            dispatch(showToast({ message: 'Failed to load quizzes', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="glass-panel p-4 flex items-center justify-between rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <CheckSquare className="w-6 h-6 text-[#E10600]" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {t('quiz.title') || 'Quizzes'}
                    </h3>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-slate-500 animate-pulse">{t('common.loading')}</div>
            ) : quizzes.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        {/* Left: Current Quiz Card */}
                        <div className="lg:col-span-2 h-full flex flex-col">
                            {(() => {
                                const quiz = quizzes[currentQuizIndex];
                                const isCompleted = currentQuizIndex < unlockedIndex || (currentQuizIndex === unlockedIndex && allCompleted) || quiz.isCompleted;
                                const isLocked = !isCompleted && currentQuizIndex > unlockedIndex;

                                return (
                                    <div
                                        className={`glass-card relative w-full overflow-hidden p-0 rounded-3xl transition-all duration-500 flex-1 flex flex-col justify-center group ${isLocked
                                            ? 'grayscale opacity-75'
                                            : 'hover:shadow-[0_20px_60px_-15px_rgba(225,6,0,0.2)] hover:-translate-y-2 hover:scale-[1.02]'
                                            }`}
                                    >
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                                        <div className="p-8 sm:p-10 relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-4 rounded-2xl ${isLocked
                                                    ? 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-400'
                                                    : isCompleted
                                                        ? 'bg-green-500/10 text-green-500 shadow-lg shadow-green-500/20 backdrop-blur-md'
                                                        : 'bg-red-500/10 text-[#E10600] shadow-lg shadow-red-500/20 backdrop-blur-md'
                                                    }`}>
                                                    {isCompleted ? <CheckCircle size={32} /> : <PlayCircle size={32} />}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-bold px-4 py-1.5 rounded-full border ${isLocked
                                                        ? 'bg-slate-100/50 border-slate-200 text-slate-400'
                                                        : 'bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-white/10 text-slate-600 dark:text-slate-300'
                                                        }`}>
                                                        {quiz.category || 'General'}
                                                    </span>
                                                </div>
                                            </div>

                                            <h4 className={`text-2xl sm:text-4xl font-extrabold mb-4 leading-tight ${isLocked ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                                {quiz.title}
                                            </h4>

                                            <p className={`text-lg mb-10 leading-relaxed ${isLocked ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                                {quiz.description}
                                            </p>

                                            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400 mb-10">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={20} className="text-[#E10600]" />
                                                    <span className="font-bold">{quiz.timeLimitMinutes || quiz.duration || 10}m</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Award size={20} className="text-[#E10600]" />
                                                    <span className="font-bold">{quiz.questions?.length || 0} Questions</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                {isLocked ? (
                                                    <div className="flex items-center text-slate-400 font-medium bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-xl">
                                                        <Lock size={18} className="mr-2" />
                                                        <span>{t('topicBrowser.lockedDesc') || 'Locked • Complete previous quiz'}</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate(`/quizzes/${quiz.id || quiz._id}`)}
                                                        className={`group relative px-8 py-4 rounded-xl font-bold text-lg shadow-xl outline-none overflow-hidden transition-all ${isCompleted
                                                            ? 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
                                                            : 'bg-gradient-to-r from-[#E10600] to-[#b80000] text-white shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-1'
                                                            }`}
                                                    >
                                                        <span className="relative z-10 flex items-center gap-2">
                                                            {isCompleted ? t('quiz.retake') || 'Retake Quiz' : t('quiz.start') || 'Start Quiz'}
                                                            <span className="transition-transform group-hover:translate-x-1">→</span>
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Right: Progress List */}
                        <div className="glass-panel p-6 rounded-3xl flex flex-col h-full bg-white/50 dark:bg-slate-900/50">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quiz History</h5>
                            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                {quizzes.filter((_, idx) => idx <= unlockedIndex).map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuizIndex(idx)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all ${currentQuizIndex === idx
                                            ? 'bg-red-500/10 border-[#E10600]/30 shadow-sm'
                                            : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-100 dark:hover:border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${q.isCompleted ? 'bg-green-500/10 text-green-500' : idx > unlockedIndex ? 'bg-slate-100 text-slate-400' : 'bg-red-500/10 text-[#E10600]'}`}>
                                                {q.isCompleted ? <CheckCircle size={14} /> : idx > unlockedIndex ? <Lock size={14} /> : <PlayCircle size={14} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-xs font-bold truncate ${currentQuizIndex === idx ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {q.title}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium">
                                                    {q.isCompleted ? 'Completed' : idx > unlockedIndex ? 'Locked' : 'Available'}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center justify-between gap-4 mt-8">
                        <button
                            onClick={() => setCurrentQuizIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuizIndex === 0}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 ${currentQuizIndex === 0
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-slate-50 dark:hover:bg-white/10'
                                }`}
                        >
                            <ArrowLeft size={16} />
                            <span>{t('common.previous')}</span>
                        </button>

                        <button
                            onClick={() => setCurrentQuizIndex(prev => Math.min(quizzes.length - 1, prev + 1))}
                            disabled={currentQuizIndex >= unlockedIndex || currentQuizIndex === quizzes.length - 1}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 ${currentQuizIndex >= unlockedIndex || currentQuizIndex === quizzes.length - 1
                                ? 'opacity-50 cursor-not-allowed text-slate-300'
                                : 'hover:bg-red-50 dark:hover:bg-white/10 text-[#E10600] border-red-200/50'
                                }`}
                        >
                            <span>{t('common.next')}</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </>
            ) : (
                <div className="glass-panel py-20 text-center rounded-3xl">
                    <CheckSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-xl text-slate-500 font-medium">
                        {t('quiz.noQuizzes') || 'No quizzes available yet.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default UserQuizInterface;
