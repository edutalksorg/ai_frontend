import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Clock, BarChart, BookOpen, ArrowLeft, Star, CheckCircle } from 'lucide-react';
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



            // Auto-mark local progress if revisiting?
            // User requested explicit manual completion, so we might skip auto-marking on load.
            // Or if we want auto-tracking, we can add it here.
            // For now, removing the failed backend call.
        } catch (error) {
            console.error('Failed to load topic details:', error);
            dispatch(showToast({ message: 'Failed to load topic details', type: 'error' }));
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
        return onBack ? loadingContent : <UserLayout>{loadingContent}</UserLayout>;
    }

    if (!topic) return null;


    const content = (
        <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="ghost"
                    onClick={() => onBack ? onBack() : navigate('/dashboard?tab=topics')}
                    leftIcon={<ArrowLeft size={18} />}
                >
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
                            console.error('Error response:', error.response?.data);
                            console.error('Error status:', error.response?.status);
                            console.error('Topic ID being used:', topic.id || topic._id);
                            const errorMsg = error.response?.data?.message || error.response?.data?.messages?.[0] || 'Failed to update favorite';
                            dispatch(showToast({ message: errorMsg, type: 'error' }));
                        }
                    }}
                    className={`p-2 rounded-full transition-colors ${topic.isFavorite
                        ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                        : 'text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    title={topic.isFavorite ? t('topicDetails.removeFromFavorites') : t('topicDetails.addToFavorites')}
                >
                    <Star size={24} className={topic.isFavorite ? 'fill-current' : ''} />
                </button>
            </div>

            {/* Topic Header */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wide">
                        {topic.category?.name || topic.category || 'General'}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-full text-xs font-medium">
                        {topic.level || 'All Levels'}
                    </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    {topic.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                        <Clock size={16} /> {topic.estimatedTime || '15 mins'}
                    </span>
                    <span className="flex items-center gap-1">
                        <BarChart size={16} /> {topic.views || 0} {t('topicDetails.views')}
                    </span>
                    <span className="flex items-center gap-1">
                        <BookOpen size={16} /> {topic.category?.name || 'General'}
                    </span>
                </div>
            </div>

            {/* Topic Content */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                {topic.imageUrl && (
                    <img
                        src={topic.imageUrl}
                        alt={topic.title}
                        className="w-full h-auto max-h-96 object-cover rounded-xl mb-8 shadow-sm"
                    />
                )}

                <div className="prose dark:prose-invert max-w-none">
                    <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
                        {t('topicDetails.about')}
                    </h2>
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {topic.content || topic.description || t('topicDetails.noContent')}
                    </div>
                </div>

                {/* Completion & Next Topic Navigation */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Button
                        onClick={handleMarkCompleted}
                        variant="outline"
                        className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                    >
                        <CheckCircle className="mr-2" size={18} />
                        {t('topicDetails.markCompleted')}
                    </Button>

                    {nextTopicId && (
                        <Button
                            onClick={() => navigate(`/topics/${nextTopicId}`)}
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white group"
                        >
                            {t('topicDetails.skipNext')}
                            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </Button>
                    )}
                </div>

                {/* Topic Info Sidebar */}
                <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{t('topicDetails.info')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <span className="block text-sm text-slate-500 dark:text-slate-400 mb-1">{t('topicDetails.level')}</span>
                            <span className="font-medium text-slate-900 dark:text-white">{topic.level || 'All Levels'}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-slate-500 dark:text-slate-400 mb-1">{t('topicDetails.duration')}</span>
                            <span className="font-medium text-slate-900 dark:text-white">{topic.estimatedTime || '15 mins'}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-slate-500 dark:text-slate-400 mb-1">{t('topicDetails.category')}</span>
                            <span className="font-medium text-slate-900 dark:text-white">{topic.category?.name || topic.category || 'General'}</span>
                        </div>
                    </div>
                </div>
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
