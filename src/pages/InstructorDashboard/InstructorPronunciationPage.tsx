import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, Save, X, BookOpen, Volume2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import InstructorLayout from './InstructorLayout';
import Button from '../../components/Button';
import { pronunciationService } from '../../services/pronunciation';
import { showToast } from '../../store/uiSlice';
import { useDispatch } from 'react-redux';
import { PronunciationParagraph } from '../../types';

const PronunciationContentManager: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [paragraphs, setParagraphs] = useState<PronunciationParagraph[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [currentParagraph, setCurrentParagraph] = useState<Partial<PronunciationParagraph>>({});

    useEffect(() => {
        loadParagraphs();
    }, []);

    const loadParagraphs = async (pageNumber = 1) => {
        try {
            setLoading(true);
            const res = await pronunciationService.getInstructorParagraphs({
                pageNumber,
                pageSize: 10
            });

            let rawItems: any[] = [];

            if (Array.isArray(res)) {
                rawItems = res;
                if ((res as any).totalPages) setTotalPages((res as any).totalPages);
                if ((res as any).currentPage) setPage((res as any).currentPage);
            } else {
                const data = (res as any)?.data || (res as any)?.items;
                if (Array.isArray(data)) {
                    rawItems = data;
                }
                if ((res as any)?.totalPages) setTotalPages((res as any).totalPages);
                if ((res as any)?.currentPage) setPage((res as any).currentPage);
            }

            const items: PronunciationParagraph[] = rawItems.map((item: any) => ({
                id: item.id || item.Id,
                title: item.title || item.Title || '',
                text: item.text || item.Text,
                difficulty: item.difficulty || item.Difficulty,
                language: item.language || item.Language,
                createdBy: item.createdBy || item.CreatedBy,
                createdAt: item.createdAt || item.CreatedAt,
                phoneticTranscription: item.phoneticTranscription || item.PhoneticTranscription,
                referenceAudioUrl: item.referenceAudioUrl || item.ReferenceAudioUrl,
                wordCount: item.wordCount,
                estimatedDurationSeconds: item.estimatedDurationSeconds,
                isPublished: item.isPublished === 1 || item.isPublished === true
            }));

            setParagraphs(items);
        } catch (error) {
            console.error('Failed to load paragraphs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (paragraph?: PronunciationParagraph) => {
        if (paragraph) {
            setCurrentParagraph(paragraph);
        } else {
            setCurrentParagraph({
                title: '',
                text: '',
                difficulty: 'Beginner',
                language: 'en-US',
                phoneticTranscription: '',
                referenceAudioUrl: '',
                isPublished: false
            });
        }
        setIsEditing(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this paragraph?')) return;

        try {
            setActionLoading(id);
            await pronunciationService.deleteParagraph(id);
            dispatch(showToast({ message: 'Paragraph deleted', type: 'success' }));
            loadParagraphs(page);
        } catch (error) {
            console.error('Failed to delete paragraph:', error);
            dispatch(showToast({ message: 'Failed to delete paragraph', type: 'error' }));
        } finally {
            setActionLoading(null);
        }
    };

    const handlePublishToggle = async (id: string, currentStatus: boolean) => {
        try {
            setActionLoading(id);
            await pronunciationService.togglePublish(id, !currentStatus);
            dispatch(showToast({
                message: `Paragraph ${!currentStatus ? 'published' : 'unpublished'} successfully`,
                type: 'success'
            }));

            // Optimistic update
            setParagraphs(prev => prev.map(p =>
                p.id === id ? { ...p, isPublished: !currentStatus } : p
            ));
        } catch (error) {
            console.error('Failed to update publish status:', error);
            dispatch(showToast({ message: 'Failed to update status', type: 'error' }));
        } finally {
            setActionLoading(null);
        }
    };

    const handleSave = async () => {
        if (!currentParagraph.title?.trim()) {
            dispatch(showToast({ message: 'Title is required', type: 'error' }));
            return;
        }

        if (!currentParagraph.text?.trim()) {
            dispatch(showToast({ message: 'Text content is required', type: 'error' }));
            return;
        }

        try {
            setLoading(true);
            const payload = {
                Title: currentParagraph.title,
                Text: currentParagraph.text,
                Difficulty: currentParagraph.difficulty || 'Beginner',
                Language: currentParagraph.language || 'en-US',
                PhoneticTranscription: currentParagraph.phoneticTranscription,
                ReferenceAudioUrl: currentParagraph.referenceAudioUrl,
                isPublished: currentParagraph.isPublished,
                ...(currentParagraph.id ? { Id: currentParagraph.id } : {})
            };

            if (currentParagraph.id) {
                await pronunciationService.updateParagraph(currentParagraph.id, payload);
                dispatch(showToast({ message: 'Paragraph updated', type: 'success' }));
            } else {
                await pronunciationService.createParagraph(payload);
                dispatch(showToast({ message: 'Paragraph created', type: 'success' }));
            }
            setIsEditing(false);
            loadParagraphs(page);
        } catch (error: any) {
            console.error('Failed to save paragraph:', error);
            const data = error?.response?.data;
            let message = data?.message || 'Failed to save paragraph';
            dispatch(showToast({ message, type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <InstructorLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-500" />
                                Pronunciation Content
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your pronunciation practice materials</p>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEdit()}
                        leftIcon={<Plus size={16} />}
                    >
                        Add Paragraph
                    </Button>
                </div>

                {isEditing && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                                {currentParagraph.id ? 'Edit Paragraph' : 'New Paragraph'}
                            </h3>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={currentParagraph.title || ''}
                                    onChange={(e) => setCurrentParagraph(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-4"
                                    placeholder="e.g., The Art of Small Talk"
                                />

                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Text Content
                                </label>
                                <textarea
                                    value={currentParagraph.text || ''}
                                    onChange={(e) => setCurrentParagraph(prev => ({ ...prev, text: e.target.value }))}
                                    rows={6}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter the text for students to practice pronouncing..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Difficulty
                                    </label>
                                    <select
                                        value={currentParagraph.difficulty || 'Beginner'}
                                        onChange={(e) => setCurrentParagraph(prev => ({ ...prev, difficulty: e.target.value as any }))}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Language
                                    </label>
                                    <input
                                        type="text"
                                        value={currentParagraph.language || 'en-US'}
                                        onChange={(e) => setCurrentParagraph(prev => ({ ...prev, language: e.target.value }))}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    checked={currentParagraph.isPublished || false}
                                    onChange={(e) => setCurrentParagraph(prev => ({ ...prev, isPublished: e.target.checked }))}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label htmlFor="isPublished" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Publish immediately
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleSave} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Content'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Grid Layout */}
                {!loading && paragraphs.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
                        <Volume2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Content Yet</h3>
                        <p className="mb-6">Create your first pronunciation practice paragraph to get started.</p>
                        <Button
                            variant="primary"
                            onClick={() => handleEdit()}
                            leftIcon={<Plus size={16} />}
                        >
                            Create Paragraph
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paragraphs.map((para) => (
                            <div key={para.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg line-clamp-1" title={para.title}>
                                            {para.title || 'Untitled Paragraph'}
                                        </h3>
                                        {para.isPublished ? (
                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900">
                                                published
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                                                draft
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 min-h-[60px]">
                                        {para.text}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full ${para.difficulty === 'Beginner' ? 'bg-green-500' :
                                                para.difficulty === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                                                }`} />
                                            {para.difficulty}
                                        </span>
                                        <span>•</span>
                                        <span>{para.estimatedDurationSeconds || 60} sec</span>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(para)}
                                        leftIcon={<Edit2 size={14} />}
                                        className="flex-1 border-slate-200 dark:border-slate-600"
                                    >
                                        Edit
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handlePublishToggle(para.id, !!para.isPublished)}
                                        disabled={actionLoading === para.id}
                                        className={para.isPublished ? 'text-orange-600' : 'text-green-600'}
                                    >
                                        {para.isPublished ? 'Unpublish' : 'Publish'}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(para.id)}
                                        disabled={actionLoading === para.id}
                                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        leftIcon={<Trash2 size={14} />}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {paragraphs.length > 0 && (
                    <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-6">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Page {page} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadParagraphs(page - 1)}
                                disabled={page <= 1 || loading}
                                leftIcon={<ChevronLeft size={16} />}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadParagraphs(page + 1)}
                                disabled={page >= totalPages || loading}
                                rightIcon={<ChevronRight size={16} />}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </InstructorLayout>
    );
};

export default PronunciationContentManager;