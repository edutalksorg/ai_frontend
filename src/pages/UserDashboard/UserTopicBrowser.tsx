import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Star, CheckCircle, Lock, BookMarked, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/Button';
import { topicsService } from '../../services/topics';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';
import UserTopicDetailsPage from './UserTopicDetailsPage';

const UserTopicBrowser: React.FC = () => {
    const { t } = useTranslation();
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

            const sortedItems = [...items].sort((a: any, b: any) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

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

            let lastCompletedIndex = -1;
            items.forEach((topic: any, index: number) => {
                if (topic.isCompleted || topic.completed) {
                    lastCompletedIndex = index;
                }
            });

            const nextIndex = lastCompletedIndex + 1;
            setUnlockedIndex(Math.min(nextIndex, items.length - 1));
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
            setTopics(prev => prev.map(t => {
                if ((t.id || t._id) === (topic.id || topic._id)) {
                    return { ...t, isFavorite: !t.isFavorite };
                }
                return t;
            }));
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.messages?.[0] || 'Action failed';
            dispatch(showToast({ message: errorMsg, type: 'error' }));
        }
    };

    if (selectedTopicId) {
        return (
            <UserTopicDetailsPage
                topicId={selectedTopicId}
                onBack={() => {
                    setSelectedTopicId(null);
                    fetchTopics();
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="glass-panel p-4 flex items-center justify-between rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <BookOpen className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {t('topicBrowser.title')}
                    </h3>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-slate-500 animate-pulse">{t('topicBrowser.loading')}</div>
            ) : topics.length > 0 ? (
                <div className="flex flex-col items-center max-w-3xl mx-auto">
                    {/* Glass Progress Card */}
                    <div className="glass-panel w-full mb-8 p-6 rounded-2xl">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 block mb-1">Your Progress</span>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(((currentTopicIndex + 1) / topics.length) * 100)}%</span>
                            </div>
                            <span className="text-sm text-slate-500">{currentTopicIndex + 1} / {topics.length} Topics</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                style={{ width: `${((currentTopicIndex + 1) / topics.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="w-full flex justify-between items-center mb-6 gap-4">
                        <button
                            onClick={() => setCurrentTopicIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentTopicIndex === 0}
                            className={`glass-button px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${currentTopicIndex === 0
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:-translate-x-1'
                                }`}
                        >
                            <span>←</span>
                            <span className="hidden sm:inline">{t('common.previous')}</span>
                        </button>

                        <div className="flex gap-2">
                            {currentTopicIndex < unlockedIndex ? (
                                <span className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-500 rounded-full font-bold text-sm border border-green-500/20 backdrop-blur-sm">
                                    <CheckCircle size={14} />
                                    <span className="hidden xs:inline">{t('topicBrowser.completed')}</span>
                                </span>
                            ) : currentTopicIndex === unlockedIndex ? (
                                <span className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-full font-bold text-sm border border-indigo-500/20 backdrop-blur-sm animate-pulse">
                                    <Sparkles size={14} />
                                    <span className="hidden xs:inline">{t('topicBrowser.current')}</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 px-4 py-1.5 bg-slate-500/10 text-slate-500 rounded-full font-bold text-sm border border-slate-500/20 backdrop-blur-sm">
                                    <Lock size={14} />
                                    <span className="hidden xs:inline">{t('topicBrowser.locked')}</span>
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => setCurrentTopicIndex(prev => Math.min(topics.length - 1, prev + 1))}
                            disabled={currentTopicIndex >= unlockedIndex || currentTopicIndex === topics.length - 1}
                            className={`glass-button px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${currentTopicIndex >= unlockedIndex || currentTopicIndex === topics.length - 1
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:translate-x-1'
                                }`}
                        >
                            <span className="hidden sm:inline">{t('common.next')}</span>
                            <span>→</span>
                        </button>
                    </div>

                    {/* Current Topic Card */}
                    {(() => {
                        const topic = topics[currentTopicIndex];
                        const isCompleted = currentTopicIndex < unlockedIndex || (currentTopicIndex === unlockedIndex && allCompleted);
                        const isLocked = !isCompleted && currentTopicIndex > unlockedIndex;

                        return (
                            <div
                                className={`glass-card relative w-full overflow-hidden p-0 rounded-3xl transition-all duration-500 ${isLocked
                                    ? 'grayscale opacity-75'
                                    : 'hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.3)] hover:-translate-y-1'
                                    }`}
                            >
                                {/* Card Background Decoration */}
                                {!isLocked && (
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                )}

                                <div className="p-8 sm:p-10 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-2xl ${isLocked
                                            ? 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-400'
                                            : isCompleted
                                                ? 'bg-green-500/10 text-green-500 shadow-lg shadow-green-500/20 backdrop-blur-md'
                                                : 'bg-indigo-500/10 text-indigo-500 shadow-lg shadow-indigo-500/20 backdrop-blur-md'
                                            }`}>
                                            {isCompleted ? <CheckCircle className="w-8 h-8" strokeWidth={1.5} /> : <BookMarked className="w-8 h-8" strokeWidth={1.5} />}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-bold px-4 py-1.5 rounded-full border ${isLocked
                                                ? 'bg-slate-100/50 border-slate-200 text-slate-400'
                                                : 'bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-white/10 text-slate-600 dark:text-slate-300 backdrop-blur-sm'
                                                }`}>
                                                {topic.level || 'General'}
                                            </span>
                                            {!isLocked && (
                                                <button
                                                    className={`p-2.5 rounded-full hover:bg-white/50 dark:hover:bg-white/10 transition-colors backdrop-blur-sm border border-transparent hover:border-slate-200/50 dark:hover:border-white/10 ${topic.isFavorite ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-400'}`}
                                                    onClick={(e) => toggleFavorite(e, topic)}
                                                >
                                                    <Star size={22} className={topic.isFavorite ? "fill-current" : ""} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <h4 className={`text-2xl sm:text-4xl font-extrabold mb-4 leading-tight ${isLocked ? 'text-slate-400' : 'text-slate-900 dark:text-white'
                                        }`}>
                                        {topic.title}
                                    </h4>

                                    <p className={`text-lg mb-10 leading-relaxed ${isLocked ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'
                                        }`}>
                                        {topic.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        {isLocked ? (
                                            <div className="flex items-center text-slate-400 font-medium bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-xl">
                                                <Lock size={18} className="mr-2" />
                                                <span>{t('topicBrowser.lockedDesc')}</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedTopicId(topic.id || topic._id)}
                                                className={`group relative px-8 py-4 rounded-xl font-bold text-lg shadow-xl outline-none overflow-hidden transition-all ${isCompleted
                                                        ? 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
                                                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1'
                                                    }`}
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    {isCompleted ? t('topicBrowser.reviewTopic') : t('topicBrowser.startLearning')}
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
            ) : (
                <div className="glass-panel py-20 text-center rounded-3xl">
                    <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-xl text-slate-500 font-medium">
                        {t('topicBrowser.noTopics')}
                    </p>
                </div>
            )}
        </div>
    );
};

export default UserTopicBrowser;
