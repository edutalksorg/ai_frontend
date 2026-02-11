import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Clock, BarChart, BookOpen, ArrowLeft, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UserLayout from '../../components/UserLayout';
import Button from '../../components/Button';
import JumbleGame from '../../components/JumbleGame';
import { topicsService } from '../../services/topics';
import { showToast } from '../../store/uiSlice';

interface UserTopicDetailsPageProps {
    topicId?: string;
    onBack?: () => void;
}

const UserTopicDetailsPage: React.FC<UserTopicDetailsPageProps> = ({ topicId: propTopicId, onBack }) => {
    const { t, i18n } = useTranslation();
    const { id: paramId } = useParams<{ id: string }>();
    const id = propTopicId || paramId;
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [topic, setTopic] = useState<any | null>(null);
    const [nextTopicId, setNextTopicId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGrammarCompleted, setIsGrammarCompleted] = useState(false);

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


            </div>

            {/* Main Single Card Content */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-3xl mx-auto shadow-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                {/* Header Section */}
                <div className="relative z-10 mb-8 text-center">
                    <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{topic.category?.name || topic.category || 'General'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{topic.level || 'All Levels'}</span>
                    </div>

                    <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                        {topic.title}
                    </h1>
                </div>

                {/* Main Content: Jumble Game */}
                <div className="mb-8">
                    {topic.grammarData && topic.grammarData.originalSentence ? (
                        <JumbleGame
                            originalSentence={topic.grammarData.originalSentence}
                            explanation={topic.grammarData.explanation}
                            translations={topic.grammarData.translations}
                            currentLanguage={i18n.language}
                            onSuccess={setIsGrammarCompleted}
                        />
                    ) : (
                        <p className="text-center text-slate-500 italic">No exercise available for this lesson.</p>
                    )}
                </div>

                {/* Footer / Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <Button
                        onClick={handleMarkCompleted}
                        disabled={!isGrammarCompleted}
                        className={`font-bold px-8 py-3 rounded-xl shadow-lg w-full sm:w-auto flex items-center justify-center transition-all duration-300 ${isGrammarCompleted
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                            }`}
                    >
                        <CheckCircle className="mr-2" size={20} />
                        {t('topicDetails.markCompleted')}
                    </Button>


                </div>
            </div>
        </div >
    );

    if (onBack) return content;

    return (
        <UserLayout>
            {content}
        </UserLayout>
    );

};

export default UserTopicDetailsPage;
