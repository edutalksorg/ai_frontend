import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Clock, BarChart, BookOpen, ArrowLeft, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UserLayout from '../../components/UserLayout';
import Button from '../../components/Button';
import { topicsService } from '../../services/topics';
import { showToast } from '../../store/uiSlice';

interface UserTopicDetailsPageProps {
    topicId?: string;
    onBack?: () => void;
}

const UserTopicDetailsPage: React.FC<UserTopicDetailsPageProps> = ({ topicId: propTopicId, onBack }) => {
    const { t } = useTranslation();
    const { id: paramId } = useParams<{ id: string }>();
    const id = propTopicId || paramId;
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [topic, setTopic] = useState<any | null>(null);
    const [nextTopicId, setNextTopicId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchTopicDetails(id);
        }
    }, [id]);

    const fetchTopicDetails = async (topicId: string) => {
        try {
            setLoading(true);
            const [topicRes, topicsRes] = await Promise.all([
                topicsService.get(topicId),
                topicsService.list()
            ]);

            const topicData = (topicRes as any)?.data || topicRes;
            setTopic(topicData);

            // Determine next topic logic
            const allTopics = (topicsRes as any)?.data || topicsRes;
            if (Array.isArray(allTopics) && allTopics.length > 0) {
                const sortedTopics = [...allTopics].sort((a: any, b: any) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );

                const currentIndex = sortedTopics.findIndex((t: any) => (t.id || t._id) === (topicData.id || topicData._id));
                if (currentIndex !== -1 && currentIndex < sortedTopics.length - 1) {
                    const nextTopic = sortedTopics[currentIndex + 1];
                    setNextTopicId(nextTopic.id || nextTopic._id);
                } else {
                    setNextTopicId(null);
                }
            }

        } catch (error) {
            console.error('Failed to load topic details:', error);
            dispatch(showToast({ message: 'Failed to load topic details', type: 'error' }));
            if (onBack) onBack();
            else navigate('/dashboard?tab=topics');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkCompleted = () => {
        if (!topic) return;

        // Local Storage Progress (Frontend Only)
        try {
            const completed = JSON.parse(localStorage.getItem('completedTopics') || '[]');
            const topicId = topic.id || topic._id;
            if (!completed.includes(topicId)) {
                completed.push(topicId);
                localStorage.setItem('completedTopics', JSON.stringify(completed));
            }
            dispatch(showToast({ message: 'Topic marked as completed!', type: 'success' }));
        } catch (e) {
            console.error('Failed to save to localStorage', e);
            dispatch(showToast({ message: 'Failed to save progress', type: 'error' }));
        }

        // If next topic exists, help user navigate there
        if (onBack) {
            onBack();
        } else if (nextTopicId) {
            navigate(`/topics/${nextTopicId}`);
        } else {
            navigate('/dashboard?tab=topics');
        }
    };

    if (loading) {
        const loadingContent = (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center animate-pulse">
                    <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                    <div className="h-2 w-32 bg-slate-200 dark:bg-slate-700 rounded-full mb-2"></div>
                </div>
            </div>
        );
        return onBack ? loadingContent : <UserLayout>{loadingContent}</UserLayout>;
    }

    if (!topic) return null;


    const content = (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Back Button */}
            <div className="flex items-center justify-between mb-8">
                <Button
                    onClick={() => onBack ? onBack() : navigate('/dashboard?tab=topics')}
                    className="glass-button p-2 pr-4 rounded-full"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    {t('topicDetails.backToTopics')}
                </Button>

                <button
                    onClick={async () => {
                        if (!topic) return;
                        try {
                            if (topic.isFavorite) {
                                await topicsService.unfavorite(topic.id || topic._id);
                                setTopic({ ...topic, isFavorite: false });
                                dispatch(showToast({ message: 'Removed from favorites', type: 'success' }));
                            } else {
                                await topicsService.favorite(topic.id || topic._id);
                                setTopic({ ...topic, isFavorite: true });
                                dispatch(showToast({ message: 'Added to favorites', type: 'success' }));
                            }
                        } catch (error: any) {
                            console.error('Failed to toggle favorite:', error);
                            const errorMsg = error.response?.data?.message || error.response?.data?.messages?.[0] || 'Failed to update favorite';
                            dispatch(showToast({ message: errorMsg, type: 'error' }));
                        }
                    }}
                    className={`glass-button p-3 rounded-full transition-all duration-300 ${topic.isFavorite
                        ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 shadow-yellow-400/20'
                        : 'text-slate-400 hover:text-yellow-400'
                        }`}
                    title={topic.isFavorite ? t('topicDetails.removeFromFavorites') : t('topicDetails.addToFavorites')}
                >
                    <Star size={24} className={topic.isFavorite ? 'fill-current' : ''} />
                </button>
            </div>

            {/* Topic Header - Glass Panel */}
            <div className="glass-panel p-8 rounded-3xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30">
                            {topic.category?.name || topic.category || 'General'}
                        </span>
                        <span className="px-3 py-1 glass-button text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold uppercase tracking-wide">
                            {topic.level || 'All Levels'}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                        {topic.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                            <Clock size={16} className="text-indigo-500" />
                            {topic.estimatedTime || '15 mins'}
                        </span>
                        <span className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                            <BarChart size={16} className="text-indigo-500" />
                            {topic.views || 0} {t('topicDetails.views')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Topic Content - Glass Card */}
            <div className="glass-card p-0 rounded-3xl overflow-hidden mb-8">
                {topic.imageUrl && (
                    <div className="relative w-full h-64 md:h-80 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                        <img
                            src={topic.imageUrl}
                            alt={topic.title}
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                )}

                <div className="p-8 md:p-10">
                    <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="text-indigo-500" size={24} />
                        {t('topicDetails.about')}
                    </h2>

                    <div className="prose dark:prose-invert prose-lg max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
                        {topic.content || topic.description || t('topicDetails.noContent')}
                    </div>
                </div>
            </div>

            {/* Info Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-2xl text-center">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('topicDetails.level')}</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{topic.level || 'All Levels'}</span>
                </div>
                <div className="glass-panel p-6 rounded-2xl text-center">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('topicDetails.duration')}</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{topic.estimatedTime || '15 mins'}</span>
                </div>
                <div className="glass-panel p-6 rounded-2xl text-center">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('topicDetails.category')}</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{topic.category?.name || topic.category || 'General'}</span>
                </div>
            </div>

            {/* Navigation Actions */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-6 z-20 backdrop-blur-xl border-t border-white/20 shadow-2xl">
                <Button
                    onClick={handleMarkCompleted}
                    className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg shadow-green-500/30 px-6 py-3 rounded-xl"
                >
                    <CheckCircle className="mr-2" size={20} />
                    {t('topicDetails.markCompleted')}
                </Button>

                {nextTopicId && (
                    <Button
                        onClick={() => navigate(`/topics/${nextTopicId}`)}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/30 px-6 py-3 rounded-xl group"
                    >
                        {t('topicDetails.skipNext')}
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                    </Button>
                )}
            </div>
        </div>
    );

    if (onBack) return content;

    return (
        <UserLayout>
            {content}
        </UserLayout>
    );

};

export default UserTopicDetailsPage;
