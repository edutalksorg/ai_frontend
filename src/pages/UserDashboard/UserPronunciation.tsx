import React, { useState, useEffect } from 'react';
import { Mic, BookOpen, Check, Sparkles, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { pronunciationService } from '../../services/pronunciation';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';
import PronunciationRecorder from '../../components/PronunciationRecorder';

const UserPronunciation: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [paragraphs, setParagraphs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [showSidebarMobile, setShowSidebarMobile] = useState(false);

    useEffect(() => {
        fetchParagraphs();
        // Load completed IDs from localStorage if possible (persistence)
        const saved = localStorage.getItem('pronunciation_completed_ids');
        if (saved) {
            try {
                setCompletedIds(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse completed IDs');
            }
        }
    }, []);

    const fetchParagraphs = async () => {
        try {
            setLoading(true);
            const res = await pronunciationService.listParagraphs();
            const items = (res as any)?.data || (Array.isArray(res) ? res : (res as any)?.items) || [];
            setParagraphs(items);
        } catch (error) {
            console.error('Failed to fetch paragraphs:', error);
            dispatch(showToast({ message: 'Failed to load pronunciation exercises', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const paragraphsToDisplay = searchQuery
        ? paragraphs.filter(p =>
            p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.text?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : paragraphs;

    const currentParagraph = paragraphsToDisplay[currentIndex];

    const handleNext = () => {
        if (currentIndex < paragraphsToDisplay.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            dispatch(showToast({ message: 'You have completed all available topics!', type: 'success' }));
            setCurrentIndex(0); // Reset or stay at last
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleComplete = (id: string) => {
        if (!completedIds.includes(id)) {
            const nextCompleted = [...completedIds, id];
            setCompletedIds(nextCompleted);
            localStorage.setItem('pronunciation_completed_ids', JSON.stringify(nextCompleted));
        }
    };

    if (loading) {
        return <div className="py-20 text-center text-slate-500 animate-pulse">{t('common.loading')}</div>;
    }


    return (
        <div className="max-w-7xl mx-auto px-4 pb-12 space-y-6">
            {/* Header Area */}
            <div className="glass-panel p-4 flex items-center justify-between gap-4 rounded-xl border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <Mic className="w-6 h-6 text-[#E10600]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('pronunciation.title') || 'Pronunciation Practice'}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                    className="bg-[#E10600] h-full transition-all duration-500 shadow-[0_0_8px_rgba(225,6,0,0.3)]"
                    style={{ width: `${(completedIds.length / paragraphs.length) * 100}%` }}
                />
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Main Content Area */}
                <div className="flex-1 w-full space-y-6 order-2 lg:order-1">
                    <div className="w-full">
                        {currentParagraph ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Navigation Buttons */}
                                <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/50 p-2 rounded-2xl backdrop-blur-sm">
                                    <button
                                        onClick={handleBack}
                                        disabled={currentIndex === 0}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${currentIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-[#E10600] hover:bg-red-50 dark:hover:bg-red-900/10'
                                            }`}
                                    >
                                        <ArrowLeft size={18} />
                                        <span>Previous</span>
                                    </button>

                                    <div className="hidden sm:flex gap-1.5 px-4 py-2 bg-slate-100/80 dark:bg-slate-700/80 rounded-full">
                                        {paragraphsToDisplay.slice(Math.max(0, currentIndex - 3), Math.min(paragraphsToDisplay.length, currentIndex + 4)).map((_, i) => {
                                            const actualIdx = Math.max(0, currentIndex - 3) + i;
                                            return (
                                                <div
                                                    key={actualIdx}
                                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${actualIdx === currentIndex ? 'w-6 bg-[#E10600]' : 'bg-slate-300 dark:bg-slate-600'
                                                        }`}
                                                />
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        disabled={currentIndex === paragraphsToDisplay.length - 1}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${currentIndex === paragraphsToDisplay.length - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-[#E10600] hover:bg-red-50 dark:hover:bg-red-900/10'
                                            }`}
                                    >
                                        <span>Next</span>
                                        <ArrowLeft size={18} className="translate-x-1 rotate-180" />
                                    </button>
                                </div>

                                <PronunciationRecorder
                                    paragraphId={currentParagraph.id || currentParagraph._id}
                                    paragraphText={currentParagraph.text}
                                    title={currentParagraph.title}
                                    onNext={handleNext}
                                    showNextButton={currentIndex < paragraphsToDisplay.length - 1}
                                    onSubmit={(result) => {
                                        console.log("Assessment complete", result);
                                        handleComplete(currentParagraph.id || currentParagraph._id);
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="glass-panel py-20 text-center rounded-3xl">
                                <Mic className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-xl text-slate-500 font-medium">
                                    {t('pronunciation.noExercises') || 'No exercises found.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar (Course Content) */}
                <div className="w-full lg:w-80 order-1 lg:order-2 space-y-4 lg:mt-[72px]">
                    <div className="glass-panel p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden sticky top-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <BookOpen className="w-5 h-5 text-[#E10600]" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {t('pronunciation.courseContent') || 'Course Content'}
                            </h3>
                        </div>

                        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar pr-2">
                            {paragraphsToDisplay.map((p, idx) => {
                                const isSelected = idx === currentIndex;
                                const isCompleted = completedIds.includes(p.id || p._id);

                                // User request: only show completed passages (and the currently selected one so they can see what they're doing)
                                if (!isCompleted && !isSelected) return null;

                                return (
                                    <button
                                        key={p.id || p._id}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`w-full group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left ${isSelected
                                            ? 'bg-[#E10600] text-white shadow-lg shadow-red-200 dark:shadow-none scale-[1.02]'
                                            : 'bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-700 dark:text-slate-300 border border-transparent'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-full flex-shrink-0 transition-colors ${isSelected
                                            ? 'bg-white/20'
                                            : isCompleted ? 'bg-emerald-500/10' : 'bg-slate-200 dark:bg-slate-700'
                                            }`}>
                                            {isCompleted ? (
                                                <Check className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                                            ) : (
                                                <Sparkles className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate ${isSelected ? 'text-white' : ''}`}>
                                                {p.title}
                                            </p>
                                            <p className={`text-[10px] uppercase tracking-widest font-black opacity-60 ${isSelected ? 'text-red-100' : 'text-slate-400'}`}>
                                                {isCompleted ? 'Completed' : 'Practice Now'}
                                            </p>
                                        </div>

                                        {isSelected && (
                                            <div className="flex gap-1">
                                                <div className="w-0.5 h-3 bg-white/60 rounded-full" />
                                                <div className="w-0.5 h-3 bg-white/60 rounded-full" />
                                                <div className="w-0.5 h-3 bg-white/60 rounded-full" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Summary Card */}
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Progress</span>
                                <span className="text-xs font-black text-[#E10600]">{Math.round((completedIds.length / paragraphs.length) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#E10600] h-full transition-all duration-1000"
                                    style={{ width: `${(completedIds.length / paragraphs.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPronunciation;
