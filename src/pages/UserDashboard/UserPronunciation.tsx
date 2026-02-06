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
        // stored is 1-based (count). current index is 0-based.
        // If we have unlocked 4 items, we should be on index 3 (4th item).
        return stored ? Math.max(0, parseInt(stored, 10) - 1) : 0;
    });
    const [unlockedIndex, setUnlockedIndex] = useState(() => {
        const stored = localStorage.getItem('pronunciation_unlocked_index');
        return stored ? Math.max(1, parseInt(stored, 10)) : 1;
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

    // Show completed history AND current active.
    // unlockedIndex is 1-based count.
    // slice(0, unlockedIndex) shows (0...unlockedIndex-1).
    let visibleCount = unlockedIndex;
    if (visibleCount > paragraphs.length) visibleCount = paragraphs.length;

    const visibleParagraphs = paragraphs.slice(0, visibleCount);

    const paginatedParagraphs = visibleParagraphs.slice(
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
            dispatch(showToast({ message: t('pronunciation.loadError'), type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    // Safety check: Clamp indices if they exceed bounds (e.g., if paragraphs were deleted)
    useEffect(() => {
        if (paragraphs.length > 0) {
            const maxIndex = paragraphs.length - 1;
            // unlockedIndex is 1-based count. Max accessible index is unlockedIndex - 1.
            const maxUnlocked = Math.max(0, unlockedIndex - 1);

            if (currentParaIndex > maxIndex || currentParaIndex > maxUnlocked) {
                // If current index is out of bounds, reset to the last available/unlocked paragraph
                setCurrentParaIndex(prev => Math.min(prev, maxIndex, maxUnlocked));
            }

            // Also clamp unlockedIndex if it exceeds length + 1 (allow it to be length + 1 for 'all done')
            if (unlockedIndex > paragraphs.length + 1) {
                setUnlockedIndex(paragraphs.length + 1);
            }
        }
    }, [paragraphs.length, currentParaIndex, unlockedIndex]);

    const handlePronunciationSubmit = (result: any) => {
        const accuracy = result.scores?.accuracy ?? result.pronunciationAccuracy ?? result.accuracy ?? 0;

        if (accuracy >= 70) {
            dispatch(showToast({ message: t('pronunciation.greatJob') + `: ${accuracy.toFixed(1)}%. ` + t('pronunciation.nextUnlocked'), type: 'success' }));

            // Unlock next paragraph if we are at the edge of progress
            // unlockedIndex is 1-based count (e.g., 1 means 1st paragraph unlocked).
            // currentParaIndex is 0-based.
            // So if we are on index 0, and unlockedIndex is 1, we are at the edge.
            if (currentParaIndex === unlockedIndex - 1) {
                // Prevent incrementing passed the total number of paragraphs
                if (unlockedIndex < paragraphs.length) {
                    setUnlockedIndex(prev => {
                        const next = prev + 1;
                        localStorage.setItem('pronunciation_unlocked_index', next.toString());
                        return next;
                    });
                }
            }
            setPracticeComplete(true);
        } else {
            dispatch(showToast({ message: t('pronunciation.accuracy') + `: ${accuracy.toFixed(1)}%. ` + t('pronunciation.tryBetter'), type: 'info' }));
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
            <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden group">
                {/* Decorative background for header */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-pink-500/20 transition-all duration-700" />

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 p-[2px] shadow-lg shadow-pink-500/20">
                        <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center backdrop-blur-sm">
                            <Mic className="w-6 h-6 text-pink-500" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                            {t('pronunciation.title')}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {t('pronunciation.masterSkills')}
                        </p>
                    </div>
                </div>

                {/* Progress indicator removed */}
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
                                            {/* Paragraph Label Removed */}
                                            <div></div>
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
                                            title={paragraphs[currentParaIndex]?.title}
                                            onSubmit={handlePronunciationSubmit}
                                            onNext={handleNextParagraph}
                                            onCancel={() => navigate('/dashboard')}
                                            // Show next button if there are more paragraphs available
                                            // We remove the unlockedIndex check here because if they pass, unlockedIndex updates instantly, 
                                            // but structurally strictly speaking, as long as it's not the last one, we can offer 'Next'
                                            // provided they actually passed (handled by Recorder UI mostly, but let's be safe)
                                            showNextButton={currentParaIndex < paragraphs.length - 1}
                                        />
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50 text-center rounded-[2.5rem]">
                                        <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-8 animate-bounce shadow-xl shadow-red-500/20">
                                            <Clock className="w-12 h-12" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t('pronunciation.trialEnded')}</h3>
                                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-md leading-relaxed">
                                            {t('pronunciation.trialExpiredMessage')}
                                        </p>
                                        <Button className="py-4 px-10 text-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-xl shadow-pink-500/30 rounded-xl" onClick={() => triggerUpgradeModal()}>
                                            {t('pronunciation.upgradeToPro')}
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
                                    {t('pronunciation.courseContent')}
                                </div>
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
                                                    <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                                        {para.title || t('pronunciation.paragraphLabel', { index: index + 1 })}
                                                    </p>
                                                    <p className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {(para.content || "").substring(0, 40)}...
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
                            {visibleParagraphs.length > ITEMS_PER_PAGE && (
                                <div className="pt-4 mt-auto border-t border-slate-200 dark:border-slate-700 flex justify-between items-center gap-2">
                                    <button
                                        onClick={() => setSidebarPage(prev => Math.max(0, prev - 1))}
                                        disabled={sidebarPage === 0}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-all ${sidebarPage === 0
                                            ? 'text-slate-300 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <ChevronLeft size={16} /> {t('pronunciation.prev')}
                                    </button>
                                    <button
                                        onClick={() => setSidebarPage(prev => Math.min(Math.ceil(visibleParagraphs.length / ITEMS_PER_PAGE) - 1, prev + 1))}
                                        disabled={sidebarPage >= Math.ceil(visibleParagraphs.length / ITEMS_PER_PAGE) - 1}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-all ${sidebarPage >= Math.ceil(visibleParagraphs.length / ITEMS_PER_PAGE) - 1
                                            ? 'text-slate-300 bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {t('pronunciation.next')} <ChevronRight size={16} />
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
                            {t('pronunciation.noParagraphsDesc')}
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
