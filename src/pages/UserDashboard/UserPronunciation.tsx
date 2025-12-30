import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Loader, Clock, CheckCircle, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { pronunciationService } from '../../services/pronunciation';
import PronunciationRecorder from '../../components/PronunciationRecorder';
import Button from '../../components/Button';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';
import { useUsageLimits } from '../../hooks/useUsageLimits';

const UserPronunciation: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [paragraphs, setParagraphs] = useState<any[]>([]);
    const [currentParaIndex, setCurrentParaIndex] = useState(() => {
        const stored = localStorage.getItem('pronunciation_unlocked_index');
        return stored ? parseInt(stored, 10) : 0;
    });
    const [unlockedIndex, setUnlockedIndex] = useState(() => {
        const stored = localStorage.getItem('pronunciation_unlocked_index');
        return stored ? parseInt(stored, 10) : 0;
    });
    const [loading, setLoading] = useState(false);
    const [practiceComplete, setPracticeComplete] = useState(false);

    // Pagination for Sidebar
    const ITEMS_PER_PAGE = 8;
    const [sidebarPage, setSidebarPage] = useState(0);

    const {
        hasActiveSubscription,
        isTrialActive,
        triggerUpgradeModal,
    } = useUsageLimits();

    // Auto-switch sidebar page when current index changes
    useEffect(() => {
        if (paragraphs.length > 0) {
            const requiredPage = Math.floor(currentParaIndex / ITEMS_PER_PAGE);
            if (requiredPage !== sidebarPage) {
                setSidebarPage(requiredPage);
            }
        }
    }, [currentParaIndex, paragraphs.length]);

    const paginatedParagraphs = paragraphs.slice(
        sidebarPage * ITEMS_PER_PAGE,
        (sidebarPage + 1) * ITEMS_PER_PAGE
    );

    useEffect(() => {
        fetchParagraphs();
    }, []);

    const fetchParagraphs = async () => {
        try {
            setLoading(true);
            const res = await pronunciationService.listParagraphs();
            const items = (res as any)?.data || (Array.isArray(res) ? res : (res as any)?.items) || [];
            setParagraphs(items);
        } catch (error) {
            console.error("Failed to fetch paragraphs", error);
            dispatch(showToast({ message: 'Failed to load specific paragraphs', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const handlePronunciationSubmit = (result: any) => {
        const accuracy = result.scores?.accuracy ?? result.pronunciationAccuracy ?? result.accuracy ?? 0;

        if (accuracy >= 75) {
            dispatch(showToast({ message: t('pronunciation.greatJob') + `: ${accuracy.toFixed(1)}%. ` + t('pronunciation.nextUnlocked'), type: 'success' }));
            if (currentParaIndex === unlockedIndex) {
                if (currentParaIndex < paragraphs.length - 1) {
                    setUnlockedIndex(prev => {
                        const next = prev + 1;
                        localStorage.setItem('pronunciation_unlocked_index', next.toString());
                        return next;
                    });
                }
            }
            setPracticeComplete(true);
        } else {
            dispatch(showToast({ message: t('pronunciation.accuracy') + `: ${accuracy.toFixed(1)}%. ` + t('pronunciation.tryReach'), type: 'info' }));
            setPracticeComplete(false);
        }
    };

    const handleNextParagraph = () => {
        if (currentParaIndex < paragraphs.length - 1) {
            setCurrentParaIndex(prev => prev + 1);
            setPracticeComplete(false);
        }
    };

    const handlePrevParagraph = () => {
        if (currentParaIndex > 0) {
            setCurrentParaIndex(prev => prev - 1);
            setPracticeComplete(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Rich Header */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                {/* Decorative background for header */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-pink-500/20 transition-all duration-700" />

                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 p-[2px] shadow-lg shadow-pink-500/20">
                        <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center backdrop-blur-sm">
                            <Mic className="w-8 h-8 text-pink-500" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                            {t('pronunciation.title')}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Master your speaking skills
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 px-5 py-3 rounded-xl border border-slate-200/50 dark:border-white/10 backdrop-blur-md relative z-10">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {paragraphs.length > 0 ? `${currentParaIndex + 1} / ${paragraphs.length}` : '0 / 0'}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500 border border-pink-200 dark:border-pink-500/30">
                        <CheckCircle size={20} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-32">
                    <Loader className="w-12 h-12 animate-spin text-pink-500" />
                </div>
            ) : paragraphs.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Recorder (Main Content) */}
                    <div className="lg:col-span-2 flex flex-col">
                        <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem] relative overflow-hidden flex-1 min-h-[600px] border-0 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 ring-1 ring-white/50 dark:ring-white/10 transition-all duration-500">
                            {/* Background Blobs */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

                            <div className="relative z-10 w-full h-full">
                                {(hasActiveSubscription || isTrialActive) ? (
                                    <div className="flex flex-col h-full">
                                        <div className="mb-6 flex justify-between items-center">
                                            <div className="bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                    Paragraph {currentParaIndex + 1}
                                                </span>
                                            </div>
                                            {practiceComplete && (
                                                <span className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-bold animate-pulse bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                                                    <CheckCircle size={16} />
                                                    {t('pronunciation.unlocked')}
                                                </span>
                                            )}
                                        </div>

                                        <PronunciationRecorder
                                            paragraphId={paragraphs[currentParaIndex]?._id || paragraphs[currentParaIndex]?.id}
                                            paragraphText={paragraphs[currentParaIndex]?.text || paragraphs[currentParaIndex]?.content}
                                            onSubmit={handlePronunciationSubmit}
                                            onNext={handleNextParagraph}
                                            showNextButton={currentParaIndex < unlockedIndex}
                                        />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50 text-center rounded-[2.5rem]">
                                        <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-8 animate-bounce shadow-xl shadow-red-500/20">
                                            <Clock className="w-12 h-12" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Trial Ended</h3>
                                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-md leading-relaxed">
                                            Your 24-hour preview has expired. Unlock unlimited pronunciation practice with Pro.
                                        </p>
                                        <Button className="py-4 px-10 text-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-xl shadow-pink-500/30 rounded-xl" onClick={triggerUpgradeModal}>
                                            Upgrade to Pro
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Playlist/Navigation */}
                    {/* Fixed Pagination Structure */}
                    <div className="lg:col-span-1 flex flex-col">
                        <div className="glass-panel p-6 rounded-3xl flex-1 min-h-[600px] flex flex-col">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                        <CheckCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    </span>
                                    Course Content
                                </div>
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                    Page {sidebarPage + 1} / {Math.ceil(paragraphs.length / ITEMS_PER_PAGE) || 1}
                                </span>
                            </h4>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                {paginatedParagraphs.map((para, idx) => {
                                    const index = (sidebarPage * ITEMS_PER_PAGE) + idx;
                                    const isLocked = index > unlockedIndex;
                                    const isActive = index === currentParaIndex;
                                    const isCompleted = index < unlockedIndex;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (!isLocked) {
                                                    setCurrentParaIndex(index);
                                                    setPracticeComplete(false);
                                                }
                                            }}
                                            disabled={isLocked}
                                            className={`w-full text-left p-4 rounded-xl transition-all duration-300 group relative overflow-hidden border ${isActive
                                                ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30 border-transparent transform scale-[1.02]'
                                                : isLocked
                                                    ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-400 border-transparent opacity-70 cursor-not-allowed'
                                                    : 'bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-slate-200/50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-pink-200 dark:hover:border-pink-500/30'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4 relatie z-10">
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isActive
                                                    ? 'bg-white/20 text-white'
                                                    : isLocked
                                                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                                        : isCompleted
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                    }`}>
                                                    {isLocked ? <Lock size={14} /> : isCompleted ? <CheckCircle size={14} /> : index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-semibold truncate mb-1 ${isActive ? 'text-white' : ''}`}>
                                                        Paragraph {index + 1}
                                                    </p>
                                                    <p className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {para.text || para.content || "Practice text..."}
                                                    </p>
                                                </div>
                                                {isActive && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        <div className="flex gap-0.5">
                                                            <div className="w-1 h-3 bg-white/60 rounded-full animate-bounce delay-0" />
                                                            <div className="w-1 h-3 bg-white/60 rounded-full animate-bounce delay-100" />
                                                            <div className="w-1 h-3 bg-white/60 rounded-full animate-bounce delay-200" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls - Correctly Placed Outside List */}
                            {paragraphs.length > ITEMS_PER_PAGE && (
                                <div className="pt-4 mt-auto border-t border-slate-200 dark:border-slate-700 flex justify-between items-center gap-2">
                                    <button
                                        onClick={() => setSidebarPage(prev => Math.max(0, prev - 1))}
                                        disabled={sidebarPage === 0}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-all ${sidebarPage === 0
                                                ? 'text-slate-300 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <ChevronLeft size={16} /> Prev
                                    </button>
                                    <button
                                        onClick={() => setSidebarPage(prev => Math.min(Math.ceil(paragraphs.length / ITEMS_PER_PAGE) - 1, prev + 1))}
                                        disabled={sidebarPage >= Math.ceil(paragraphs.length / ITEMS_PER_PAGE) - 1}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-all ${sidebarPage >= Math.ceil(paragraphs.length / ITEMS_PER_PAGE) - 1
                                                ? 'text-slate-300 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        Next <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-panel py-32 text-center rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3 group-hover:rotate-6 transition-transform duration-500">
                            <Mic className="w-12 h-12 text-slate-300 dark:text-slate-600 group-hover:text-pink-500 transition-colors duration-500" />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t('pronunciation.noParagraphs')}</h4>
                        <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
                            No pronunciation exercises are available right now. Check out our daily topics for more practice material!
                        </p>
                        <Button
                            variant="outline"
                            className="px-8 py-3 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl"
                            onClick={() => navigate('/daily-topics')}
                        >
                            {t('pronunciation.checkDailyTopics')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPronunciation;
