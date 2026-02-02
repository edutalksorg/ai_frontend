import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, HelpCircle, Clock, CheckSquare, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import InstructorLayout from './InstructorLayout';
import Button from '../../components/Button';
import { quizzesService } from '../../services/quizzes';
import { showToast } from '../../store/uiSlice';
import { useDispatch } from 'react-redux';

const InstructorQuizzesPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [allQuizzes, setAllQuizzes] = useState<any[]>([]); // All filtered quizzes
    const [quizzes, setQuizzes] = useState<any[]>([]); // Current page quizzes
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async (pageNumber = 1) => {
        try {
            setLoading(true);
            setPage(pageNumber);

            // Fetch ALL quizzes at once for accurate client-side pagination
            const res = await quizzesService.getInstructorQuizzes({
                Page: 1,
                PageSize: 1000  // Fetch all quizzes
            });

            console.log('Quiz API Response:', res);

            // Handle response data
            let data: any[] = [];
            let backendTotalCount = 0;

            if (Array.isArray(res)) {
                data = res;
                backendTotalCount = (res as any).totalCount || (res as any).total || data.length;
            } else {
                data = (res as any)?.data || [];
                backendTotalCount = (res as any)?.totalCount || (res as any)?.total || data.length;
            }

            // Filter out deleted quizzes
            const hiddenQuizzes = JSON.parse(localStorage.getItem('hidden_quizzes') || '[]');
            const activeQuizzes = data.filter((q: any) => {
                const id = q.id || q._id;
                return !q.deleted && !q.isDeleted && !hiddenQuizzes.includes(id);
            });

            // Store all quizzes for client-side pagination
            setAllQuizzes(activeQuizzes);

            // Calculate pagination based on ACTUAL filtered count (not backend count)
            const actualTotalCount = activeQuizzes.length;
            const calculatedTotalPages = Math.ceil(actualTotalCount / 10);
            setTotalPages(calculatedTotalPages);
            setTotalCount(actualTotalCount);

            // Slice the quizzes for the current page (client-side pagination)
            const startIndex = (pageNumber - 1) * 10;
            const endIndex = startIndex + 10;
            const pageQuizzes = activeQuizzes.slice(startIndex, endIndex);
            setQuizzes(pageQuizzes);

            console.log(`Client-Side Pagination - Page: ${pageNumber}, Total Count: ${actualTotalCount}, Total Pages: ${calculatedTotalPages}, Showing ${pageQuizzes.length} quizzes (${startIndex + 1}-${Math.min(endIndex, actualTotalCount)})`);
            console.log(`Backend reported: ${backendTotalCount} quizzes, but after filtering we have: ${actualTotalCount} quizzes`);

        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
            // Fallback to regular list
            try {
                const res = await quizzesService.list({
                    Page: pageNumber,
                    PageSize: 10
                });
                let data: any[] = [];
                if (Array.isArray(res)) {
                    data = res;
                    if ((res as any).totalPages) setTotalPages((res as any).totalPages);
                } else {
                    data = (res as any)?.data || [];
                    if ((res as any)?.totalPages) setTotalPages((res as any).totalPages);
                }

                // Filter out deleted quizzes
                const hiddenQuizzes = JSON.parse(localStorage.getItem('hidden_quizzes') || '[]');
                const activeQuizzes = data.filter((q: any) => {
                    const id = q.id || q._id;
                    return !q.deleted && !q.isDeleted && !hiddenQuizzes.includes(id);
                });

                setQuizzes(activeQuizzes);
            } catch (e) {
                dispatch(showToast({ message: 'Failed to load quizzes', type: 'error' }));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;

        try {
            await quizzesService.deleteQuiz(id);
            dispatch(showToast({ message: 'Quiz deleted successfully', type: 'success' }));
            fetchQuizzes();
        } catch (error: any) {
            console.error('Failed to delete quiz:', error);

            // Fallback: Soft delete if hard delete fails (e.g. due to dependencies)
            // If status is 400 or 500, try soft delete first
            if (error?.response?.status === 400 || error?.response?.status === 500) {
                try {
                    console.log('Attempting soft delete...');
                    await quizzesService.updateQuiz(id, {
                        isDeleted: true,
                        deleted: true,
                        isPublished: false // Also unpublish just in case
                    });
                    dispatch(showToast({ message: 'Quiz deleted (soft)', type: 'success' }));
                    fetchQuizzes();
                    return;
                } catch (softError) {
                    console.error('Soft delete also failed:', softError);

                    // FINAL FALLBACK: Client-side hide
                    // If backend refuses both delete and update, we hide it locally
                    console.log('Activating client-side hide fallback');
                    try {
                        const hidden = JSON.parse(localStorage.getItem('hidden_quizzes') || '[]');
                        if (!hidden.includes(id)) {
                            hidden.push(id);
                            localStorage.setItem('hidden_quizzes', JSON.stringify(hidden));
                        }

                        // Force update UI locally without fetching
                        setQuizzes(prev => prev.filter(q => (q.id || q._id) !== id));
                        dispatch(showToast({ message: 'Quiz deleted (locally)', type: 'success' }));
                        return;
                    } catch (localError) {
                        console.error('Local hide failed', localError);
                    }
                }
            }

            dispatch(showToast({ message: 'Failed to delete quiz', type: 'error' }));
        }
    };

    const handlePublish = async (id: string, isCurrentlyPublished: boolean) => {
        const newStatus = !isCurrentlyPublished;

        // 1. Optimistic Update (Immediate Feedback)
        setQuizzes(prev => prev.map(q =>
            (q.id === id || q._id === id) ? { ...q, isPublished: newStatus } : q
        ));
        setAllQuizzes(prev => prev.map(q =>
            (q.id === id || q._id === id) ? { ...q, isPublished: newStatus } : q
        ));

        try {
            if (!isCurrentlyPublished) {
                // Publish the quiz
                await quizzesService.publishQuiz(id);
                dispatch(showToast({ message: 'Quiz published successfully! Users can now see it.', type: 'success' }));
            } else {
                // Unpublish the quiz
                await quizzesService.unpublishQuiz(id);
                dispatch(showToast({ message: 'Quiz unpublished successfully', type: 'success' }));
            }
            // 2. Background Consistency Check
            // We TRUST the optimistic update if the API call didn't throw.
            // Re-fetching immediately often causes a race condition where we get stale data (Draft) 
            // before the DB commit finishes, causing a "blink". 
            // We skip re-fetching here. Use manual refresh if needed.
            // fetchQuizzes(page);
        } catch (error: any) {
            console.error('Failed to update quiz status:', error);
            const errorMsg = error?.response?.data?.message || error?.response?.data?.messages?.[0] || 'Failed to update quiz status';
            dispatch(showToast({ message: errorMsg, type: 'error' }));

            // 3. Rollback on Failure
            setQuizzes(prev => prev.map(q =>
                (q.id === id || q._id === id) ? { ...q, isPublished: isCurrentlyPublished } : q
            ));
            setAllQuizzes(prev => prev.map(q =>
                (q.id === id || q._id === id) ? { ...q, isPublished: isCurrentlyPublished } : q
            ));
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
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Quizzes</h1>
                            <p className="text-slate-600 dark:text-slate-400">Manage your quizzes and assessments</p>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        leftIcon={<Plus size={20} />}
                        onClick={() => navigate('/instructor/quizzes/new')}
                        className="w-full md:w-auto"
                    >
                        Create New Quiz
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading quizzes...</div>
                ) : quizzes.length === 0 ? (
                    <div className="text-center py-12">
                        <HelpCircle className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4 opacity-50" />
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            No quizzes yet. Create your first quiz to challenge your students!
                        </p>
                        <Button
                            variant="primary"
                            leftIcon={<Plus size={20} />}
                            onClick={() => navigate('/instructor/quizzes/new')}
                        >
                            Create First Quiz
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                            <div
                                key={quiz.id || quiz._id}
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">
                                            {quiz.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                            {quiz.description}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${quiz.isPublished
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                            }`}
                                    >
                                        {quiz.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {quiz.duration || 30} mins
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CheckSquare size={14} />
                                        {quiz.questions?.length || quiz.totalQuestions || 0} Questions
                                    </span>
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                                        {quiz.difficulty || 'Beginner'}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        leftIcon={<Edit size={16} />}
                                        onClick={() => navigate(`/instructor/quizzes/${quiz.id || quiz._id}`)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={quiz.isPublished ? 'text-orange-600' : 'text-green-600'}
                                        onClick={() => handlePublish(quiz.id || quiz._id, quiz.isPublished)}
                                    >
                                        {quiz.isPublished ? 'Unpublish' : 'Publish'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        leftIcon={<Trash2 size={16} />}
                                        onClick={() => handleDelete(quiz.id || quiz._id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {quizzes.length > 0 && (
                    <div className="flex items-center justify-between py-4 mt-6">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Page {page} of {totalPages} ({totalCount} total quizzes)
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchQuizzes(page - 1)}
                                disabled={page <= 1 || loading}
                                leftIcon={<ChevronLeft size={16} />}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchQuizzes(page + 1)}
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

export default InstructorQuizzesPage;