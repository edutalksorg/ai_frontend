import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, BookOpen, Clock, Eye, ArrowLeft } from 'lucide-react';
import InstructorLayout from './InstructorLayout';
import Button from '../../components/Button';
import { topicsService } from '../../services/topics';
import { showToast } from '../../store/uiSlice';
import { useDispatch } from 'react-redux';

const InstructorTopicsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const res = await topicsService.list();
            const data = (res as any)?.data || (Array.isArray(res) ? res : []);
            setTopics(data);
        } catch (error) {
            console.error('Failed to fetch topics:', error);
            dispatch(showToast({ message: 'Failed to load topics', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this topic?')) return;

        try {
            await topicsService.remove(id);
            dispatch(showToast({ message: 'Topic deleted successfully', type: 'success' }));
            fetchTopics();
        } catch (error) {
            console.error('Failed to delete topic:', error);
            dispatch(showToast({ message: 'Failed to delete topic', type: 'error' }));
        }
    };

    const handlePublish = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'published' ? 'draft' : 'published';
        try {
            // Assuming PATCH /api/v1/topics/{id}/status as per requirement
            await topicsService.updateStatus(id, newStatus);
            dispatch(showToast({ message: `Topic ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`, type: 'success' }));
            fetchTopics();
        } catch (error) {
            console.error('Failed to update topic status:', error);
            // Fallback to update if specific endpoint fails
            try {
                await topicsService.update(id, { status: newStatus });
                dispatch(showToast({ message: `Topic ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`, type: 'success' }));
                fetchTopics();
            } catch (e) {
                dispatch(showToast({ message: 'Failed to update topic status', type: 'error' }));
            }
        }
    };

    return (
        <InstructorLayout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/instructor-dashboard')}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Grammar Lessons</h1>
                            <p className="text-slate-600 dark:text-slate-400">Manage your grammar lessons</p>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        leftIcon={<Plus size={20} />}
                        onClick={() => navigate('/instructor/topics/new')}
                        className="w-full md:w-auto"
                    >

                        Create New Grammar Lesson
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading grammar lessons...</div>
                ) : topics.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4 opacity-50" />
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            No grammar lessons yet. Create your first lesson to get started!
                        </p>
                        <Button
                            variant="primary"
                            leftIcon={<Plus size={20} />}
                            onClick={() => navigate('/instructor/topics/new')}
                        >

                            Create First Grammar Lesson
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topics.map((topic) => (
                            <div
                                key={topic.id || topic._id}
                                className="card hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">
                                            {topic.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                            {topic.description}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${topic.status === 'published'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                            }`}
                                    >
                                        {topic.status || 'draft'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {topic.estimatedTime || 15} mins
                                    </span>
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                                        {topic.difficulty || 'Beginner'}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        leftIcon={<Edit size={16} />}
                                        onClick={() => navigate(`/instructor/topics/${topic.id || topic._id}`)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={topic.status === 'published' ? 'text-orange-600' : 'text-green-600'}
                                        onClick={() => handlePublish(topic.id || topic._id, topic.status)}
                                    >
                                        {topic.status === 'published' ? 'Unpublish' : 'Publish'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        leftIcon={<Trash2 size={16} />}
                                        onClick={() => handleDelete(topic.id || topic._id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </InstructorLayout>
    );
};

export default InstructorTopicsPage;
