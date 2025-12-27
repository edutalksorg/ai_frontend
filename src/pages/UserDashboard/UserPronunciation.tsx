import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Loader, Clock, CheckCircle, XCircle } from 'lucide-react';
import { pronunciationService } from '../../services/pronunciation';
import PronunciationRecorder from '../../components/PronunciationRecorder';
import Button from '../../components/Button';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';
import { useUsageLimits } from '../../hooks/useUsageLimits';
import { motion } from 'framer-motion';
import { fadeIn, slideUp } from '../../constants/animations';

const UserPronunciation: React.FC = () => {
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
    const {
        hasActiveSubscription,
        isTrialActive,
        triggerUpgradeModal,
    } = useUsageLimits();

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
        // Handle result mapping from API (checks for nested scores object first)
        const accuracy = result.scores?.accuracy ?? result.pronunciationAccuracy ?? result.accuracy ?? 0;
        const fluency = result.scores?.fluency ?? result.fluencyScore ?? result.fluency ?? 0;
        const overall = result.scores?.overall ?? result.overallScore ?? result.OverallScore ?? 0;

        console.log('Pronunciation Result processed:', { accuracy, fluency, overall, result });

        if (accuracy >= 75) {
            dispatch(showToast({ message: `Great job! Accuracy: ${accuracy.toFixed(1)}%. Next paragraph unlocked!`, type: 'success' }));

            // Only unlock if we are at the current unlocked frontier
            if (currentParaIndex === unlockedIndex) {
                if (currentParaIndex < paragraphs.length - 1) {
                    setUnlockedIndex(prev => {
                        const next = prev + 1;
                        localStorage.setItem('pronunciation_unlocked_index', next.toString());
                        return next;
                    });
                }
            }
            // Always set practice complete to show the Next button
            setPracticeComplete(true);
        } else {
            dispatch(showToast({ message: `Accuracy: ${accuracy.toFixed(1)}%. Try again to reach 75%!`, type: 'info' }));
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
        <div className="space-y-6 md:space-y-10">
            <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4"
            >
                <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-100 dark:text-white tracking-tighter uppercase leading-tight">
                        AI <span className="text-primary-600 dark:text-primary-400">PRONUNCIATION</span>
                    </h3>
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-1">
                        Master your accent with AI analysis
                    </p>
                </div>
                <div className="flex items-center gap-2 px-6 py-2 glass-panel rounded-xl text-[10px] font-black text-primary-600 dark:text-primary-400 tracking-widest uppercase">
                    Progress: {paragraphs.length > 0 ? `${currentParaIndex + 1} / ${paragraphs.length}` : '0 / 0'}
                </div>
            </motion.div>

            {
                loading ? (
                    <div className="flex justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : paragraphs.length > 0 ? (
                    <div>
                        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <Button variant="outline" size="sm" onClick={handlePrevParagraph} disabled={currentParaIndex === 0}>
                                Previous
                            </Button>
                            <div className="flex gap-2">
                                {practiceComplete && currentParaIndex < paragraphs.length - 1 && (
                                    <span className="flex items-center text-green-600 text-sm font-medium animate-pulse">
                                        Unlocked!
                                    </span>
                                )}
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleNextParagraph}
                                    disabled={currentParaIndex >= unlockedIndex}
                                >
                                    Next Paragraph
                                </Button>
                            </div>
                        </div>



                        <motion.div
                            variants={slideUp}
                            className="glass-card rounded-3xl p-6 sm:p-10 border border-primary-500/10 dark:border-white/5 relative overflow-hidden"
                        >
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                            {(hasActiveSubscription || isTrialActive) ? (
                                <PronunciationRecorder
                                    paragraphId={paragraphs[currentParaIndex]?._id || paragraphs[currentParaIndex]?.id}
                                    paragraphText={paragraphs[currentParaIndex]?.text || paragraphs[currentParaIndex]?.content}
                                    onSubmit={handlePronunciationSubmit}
                                    onNext={handleNextParagraph}
                                    showNextButton={currentParaIndex < unlockedIndex}
                                />
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                                        <XCircle className="w-10 h-10" />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Access Restricted</h4>
                                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto font-medium">
                                        Your trial has expired. Upgrade to our Master plan for unlimited AI analysis.
                                    </p>
                                    <Button
                                        size="lg"
                                        className="bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-12 h-14 uppercase font-black tracking-widest text-xs shadow-xl shadow-primary-500/20"
                                        onClick={triggerUpgradeModal}
                                    >
                                        Upgrade to Pro
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Mic className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4 opacity-50" />
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            No paragraphs available for practice right now.
                        </p>
                        <Button variant="outline" onClick={() => navigate('/daily-topics')}>
                            Check Daily Topics
                        </Button>
                    </div>
                )
            }
        </div >
    );
};

export default UserPronunciation;

