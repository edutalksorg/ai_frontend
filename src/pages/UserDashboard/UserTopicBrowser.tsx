import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Star, CheckCircle, Lock } from 'lucide-react';
import Button from '../../components/Button';
import { topicsService } from '../../services/topics';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';
import UserTopicDetailsPage from './UserTopicDetailsPage';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp, buttonClick, cardHover, staggerContainer } from '../../constants/animations';

const UserTopicBrowser: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
    const [unlockedIndex, setUnlockedIndex] = useState(0);
    const [allCompleted, setAllCompleted] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const res = await topicsService.list();
            let items = (res as any)?.data || (Array.isArray(res) ? res : (res as any)?.items) || [];

            // Sort by createdAt to ensure "created first" comes first
            const sortedItems = [...items].sort((a: any, b: any) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            // Progress is now primarily handled via Local Storage in the frontend
            // We skip the explicit per-item backend fetch to avoid 404s/overhead



            // Merge with Local Storage Progress (Fallback)
            try {
                const localCompleted = JSON.parse(localStorage.getItem('completedTopics') || '[]');
                if (Array.isArray(localCompleted)) {
                    items = items.map((item: any) => {
                        if (localCompleted.includes(item.id || item._id)) {
                            return { ...item, isCompleted: true };
                        }
                        return item;
                    });
                }
            } catch (e) {
                console.error('Error reading local progress', e);
            }

            setTopics(items);

            // Determine unlocked index based on completion status
            let lastCompletedIndex = -1;
            items.forEach((topic: any, index: number) => {
                if (topic.isCompleted || topic.completed) {
                    lastCompletedIndex = index;
                }
            });

            // The unlocked index is the one after the last completed one
            const nextIndex = lastCompletedIndex + 1;
            setUnlockedIndex(Math.min(nextIndex, items.length - 1));

            // Auto-advance to the latest unlocked item
            setCurrentTopicIndex(Math.min(nextIndex, items.length - 1));

        } catch (error) {
            console.error('Failed to fetch topics:', error);
            dispatch(showToast({ message: 'Failed to load topics', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (e: React.MouseEvent, topic: any) => {
        e.stopPropagation();
        try {
            if (topic.isFavorite) {
                await topicsService.unfavorite(topic.id || topic._id);
                dispatch(showToast({ message: 'Removed from favorites', type: 'success' }));
            } else {
                await topicsService.favorite(topic.id || topic._id);
                dispatch(showToast({ message: 'Added to favorites', type: 'success' }));
            }
            // Optimistic update
            setTopics(prev => prev.map(t => {
                if ((t.id || t._id) === (topic.id || topic._id)) {
                    return { ...t, isFavorite: !t.isFavorite };
                }
                return t;
            }));
        } catch (error: any) {
            console.error('Failed to toggle favorite', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Topic ID being used:', topic.id || topic._id);
            console.error('Topic object:', topic);
            const errorMsg = error.response?.data?.message || error.response?.data?.messages?.[0] || 'Action failed';
            dispatch(showToast({ message: errorMsg, type: 'error' }));
        }
    };

    // If a topic is selected, show the detail view
    if (selectedTopicId) {
        return (
            <UserTopicDetailsPage
                topicId={selectedTopicId}
                onBack={() => {
                    setSelectedTopicId(null);
                    fetchTopics(); // Refresh to update completion status
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
                        TOPICS <span className="text-primary-600 dark:text-primary-400">PATH</span>
                    </h3>
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-1">
                        Your roadmap to English fluency
                    </p>
                </div>
            </motion.div>

            {loading ? (
                <div className="py-12 text-center text-slate-500">Loading topics...</div>
            ) : topics.length > 0 ? (
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
                                PROGRESS: {Math.round(((currentTopicIndex + 1) / topics.length) * 100)}%
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {currentTopicIndex + 1} / {topics.length} TOPICS
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-primary-500/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentTopicIndex + 1) / topics.length) * 100}%` }}
                                className="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-1000"
                            />
                        </div>
                    </motion.div>

                    {/* Navigation Controls - Top */}
                    <motion.div
                        variants={fadeIn}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.2 }}
                        className="w-full flex justify-between items-center mb-8 gap-4"
                    >
                        <motion.button
                            whileHover={currentTopicIndex !== 0 ? { x: -3 } : {}}
                            whileTap={currentTopicIndex !== 0 ? { scale: 0.95 } : {}}
                            onClick={() => setCurrentTopicIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentTopicIndex === 0}
                            className={`min-h-[44px] px-6 rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.2em] border shadow-sm ${currentTopicIndex === 0
                                ? 'text-slate-300 border-slate-100 dark:border-white/5 cursor-not-allowed'
                                : 'text-primary-600 border-primary-500/10 dark:text-white dark:border-white/10 hover:bg-white dark:hover:bg-white/5'
                                }`}
                        >
                            <span className="flex items-center gap-2">← PREV</span>
                        </motion.button>

                        <div className="flex gap-2">
                            <AnimatePresence mode="wait">
                                {currentTopicIndex < unlockedIndex ? (
                                    <motion.span
                                        key="completed"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="inline-flex items-center px-4 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest"
                                    >
                                        COMPLETED
                                    </motion.span>
                                ) : currentTopicIndex === unlockedIndex ? (
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
                            whileHover={!(currentTopicIndex >= unlockedIndex || currentTopicIndex === topics.length - 1) ? { x: 3 } : {}}
                            whileTap={!(currentTopicIndex >= unlockedIndex || currentTopicIndex === topics.length - 1) ? { scale: 0.95 } : {}}
                            onClick={() => setCurrentTopicIndex(prev => Math.min(topics.length - 1, prev + 1))}
                            disabled={currentTopicIndex >= unlockedIndex || currentTopicIndex === topics.length - 1}
                            className={`min-h-[44px] px-6 rounded-xl text-[10px] font-black transition-all uppercase tracking-[0.2em] border shadow-sm ${currentTopicIndex >= unlockedIndex || currentTopicIndex === topics.length - 1
                                ? 'text-slate-300 border-slate-100 dark:border-white/5 cursor-not-allowed'
                                : 'text-primary-600 border-primary-500/10 dark:text-white dark:border-white/10 hover:bg-white dark:hover:bg-white/5'
                                }`}
                        >
                            <span className="flex items-center gap-2">NEXT →</span>
                        </motion.button>
                    </motion.div>

                    {/* Current Topic Card */}
                    {(() => {
                        // If all completed and we are at the end, maybe show a "Course Complete" distinct card?
                        // For now, sticking to the standard card but with "Review" state

                        const topic = topics[currentTopicIndex];
                        const isCompleted = currentTopicIndex < unlockedIndex || (currentTopicIndex === unlockedIndex && allCompleted);
                        const isLocked = !isCompleted && currentTopicIndex > unlockedIndex;

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
                                        setSelectedTopicId(topic.id || topic._id);
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
                                        {isCompleted ? <CheckCircle className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border ${isLocked
                                            ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400'
                                            : 'bg-primary-500/5 border-primary-500/20 text-primary-600 dark:text-primary-400'
                                            }`}>
                                            {topic.level || 'LEVEL: GENERAL'}
                                        </span>
                                        {!isLocked && (
                                            <motion.button
                                                whileHover={{ scale: 1.2, rotate: 15 }}
                                                whileTap={{ scale: 0.9 }}
                                                className={`p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 transition-colors border border-primary-500/5 ${topic.isFavorite ? 'text-amber-500' : 'text-slate-300'}`}
                                                onClick={(e) => toggleFavorite(e, topic)}
                                            >
                                                <Star size={20} className={topic.isFavorite ? "fill-current" : ""} />
                                            </motion.button>
                                        )}
                                    </div>
                                </div>

                                <h4 className={`text-3xl sm:text-5xl font-black mb-6 tracking-tighter leading-tight ${isLocked ? 'text-slate-300 dark:text-slate-800' : 'text-slate-900 dark:text-slate-50'
                                    }`}>
                                    {topic.title?.toUpperCase()}
                                </h4>

                                <p className={`text-lg md:text-xl mb-12 line-clamp-3 leading-relaxed font-medium transition-colors ${isLocked ? 'text-slate-400 dark:text-slate-800' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                                    }`}>
                                    {topic.description}
                                </p>

                                <div className="flex items-center justify-between pt-8 border-t border-primary-500/5">
                                    {isLocked ? (
                                        <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                            <Lock size={16} className="mr-3" />
                                            COMPLETE PREVIOUS TOPIC TO UNLOCK
                                        </div>
                                    ) : (
                                        <div className={`flex items-center text-xs font-black uppercase tracking-[0.3em] transition-all group-hover:gap-6 gap-4 ${isCompleted ? 'text-green-600' : 'text-primary-600 dark:text-primary-400'
                                            }`}>
                                            <span>{isCompleted ? 'REVIEW CONTENT' : 'START JOURNEY'}</span>
                                            <motion.span
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                            >
                                                →
                                            </motion.span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })()}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                        No topics available.
                    </p>
                </div>
            )}
        </div>
    );
};

export default UserTopicBrowser;

