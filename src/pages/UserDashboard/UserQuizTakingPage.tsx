import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckSquare, Clock, ArrowRight, RotateCcw, Award, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { showToast } from '../../store/uiSlice';
import { quizzesService } from '../../services/quizzes';
import UserLayout from '../../components/UserLayout';
import Button from '../../components/Button';

interface UserQuizTakingPageProps {
    quizId?: string;
    onBack?: () => void;
}

const UserQuizTakingPage: React.FC<UserQuizTakingPageProps> = ({ quizId: propQuizId, onBack }) => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const quizId = propQuizId || id;
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [quiz, setQuiz] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [hasStarted, setHasStarted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(false);


    const [startedAt, setStartedAt] = useState<string | null>(null);

    const [quizResult, setQuizResult] = useState<any | null>(null);
    const [nextQuizId, setNextQuizId] = useState<string | null>(null);

    useEffect(() => {
        if (quizId) {
            fetchQuizDetails(quizId);
        }
    }, [quizId]);

    useEffect(() => {
        let interval: any;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        handleSubmitQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const fetchQuizDetails = async (quizId: string) => {
        try {
            setLoading(true);
            const [quizRes, quizzesRes] = await Promise.all([
                quizzesService.getById(quizId),
                quizzesService.list()
            ]);

            setQuiz((quizRes as any)?.data || quizRes);

            // Determine next quiz logic
            const allQuizzes = (quizzesRes as any)?.data || quizzesRes;
            if (Array.isArray(allQuizzes) && allQuizzes.length > 0) {
                const sortedQuizzes = [...allQuizzes].sort((a: any, b: any) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );

                const currentIndex = sortedQuizzes.findIndex((q: any) => (q.id || q._id) === ((quizRes as any).id || (quizRes as any)._id));
                if (currentIndex !== -1 && currentIndex < sortedQuizzes.length - 1) {
                    const nextQuiz = sortedQuizzes[currentIndex + 1];
                    setNextQuizId(nextQuiz.id || nextQuiz._id);
                } else {
                    setNextQuizId(null);
                }
            }

        } catch (error: any) {
            const errorMessage = error?.response?.data?.messages?.[0] || error?.response?.data?.message || 'Failed to load quiz';
            dispatch(showToast({ message: errorMessage, type: 'error' }));
            navigate('/dashboard?tab=quizzes');
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = () => {
        if (!quiz) return;
        setStartedAt(new Date().toISOString());
        setHasStarted(true);
        setTimeLeft((quiz.timeLimit || 10) * 60);
        setTimerActive(true);
    };

    const handleAnswerSelect = (optionId: string) => {
        const currentQuestion = quiz?.questions[currentQuestionIndex];
        if (currentQuestion) {
            setAnswers(prev => ({
                ...prev,
                [currentQuestion.id || currentQuestion._id]: optionId
            }));
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!quiz || submitting || !startedAt) return;

        try {
            setSubmitting(true);
            setTimerActive(false);

            // DEBUG: Log what we're sending
            console.log('=== QUIZ SUBMISSION DEBUG ===');
            console.log('Quiz ID:', quiz.id || quiz._id);
            console.log('Answers object (original):', answers);
            console.log('Started at:', startedAt);
            console.log('Quiz questions (full structure):', JSON.stringify(quiz.questions, null, 2));

            // Backend expects a dictionary: { "questionId": "answer", ... }
            console.log('Submitting answers object:', answers);

            // 1. Submit the quiz
            const submitResponse = await quizzesService.submit(quiz.id || quiz._id, answers, startedAt);

            // 2. Extract attempt ID
            // Handle various possible response structures
            const submitData = (submitResponse as any)?.data || submitResponse;
            const attemptId = submitData?.id || submitData?._id || submitData?.attemptId;

            console.log('Submission response:', submitResponse);
            console.log('Extracted attemptId:', attemptId);

            if (attemptId) {
                // 3. Fetch detailed results
                try {
                    const attemptDetails = await quizzesService.getAttemptDetails(quiz.id || quiz._id, attemptId);
                    console.log('Fetched attempt details:', attemptDetails);

                    const resultData = (attemptDetails as any)?.data || attemptDetails;
                    setQuizResult(resultData);
                    dispatch(showToast({ message: 'Quiz submitted successfully!', type: 'success' }));
                } catch (fetchError) {
                    console.error('Error fetching attempt details:', fetchError);
                    // Fallback to submission response if detail fetch fails
                    setQuizResult(submitData);
                    dispatch(showToast({ message: 'Quiz submitted, but could not load detailed results.', type: 'warning' }));
                }
            } else {
                console.warn('No attempt ID returned from submission');
                setQuizResult(submitData);
                dispatch(showToast({ message: 'Quiz submitted successfully!', type: 'success' }));
            }

        } catch (error: any) {
            console.error('Quiz submission error:', error);
            const errorMsg = error.response?.data?.message || error.response?.data?.messages?.[0] || 'Failed to submit quiz';
            dispatch(showToast({ message: errorMsg, type: 'error' }));
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <UserLayout>
                <div className="flex items-center justify-center min-h-dvh">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-slate-600 dark:text-slate-400">{t('quizTaking.loadingQuiz')}</p>
                    </div>
                </div>
            </UserLayout>
        );
    }

    if (quizResult) {
        // Extract data from result - handle both nested and flat structures
        const score = quizResult.score ?? quizResult.data?.score ?? 0;
        const correctAnswers = quizResult.correctAnswers ?? quizResult.data?.correctAnswers ?? 0;
        const totalQuestions = quizResult.totalQuestions ?? quizResult.data?.totalQuestions ?? quiz?.questions?.length ?? 0;
        const totalPoints = quizResult.totalPoints ?? quizResult.data?.totalPoints ?? 0;
        const passingScore = quiz?.passingScore || 70;

        return (
            <UserLayout>
                <div className="max-w-3xl mx-auto text-center">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm">
                        <div className="mb-6">
                            {score >= passingScore ? (
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Award size={40} />
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <RotateCcw size={40} />
                                </div>
                            )}
                            <h2 className="text-3xl font-bold mb-2">
                                {score >= passingScore ? t('quizTaking.passed') : t('quizTaking.keepPracticing')}
                            </h2>

                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="text-sm text-slate-500 mb-1">{t('quizTaking.correct')}</div>
                                <div className="text-xl font-bold text-green-600">{correctAnswers}</div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="text-sm text-slate-500 mb-1">{t('quizTaking.totalQuestions')}</div>
                                <div className="text-xl font-bold">{totalQuestions}</div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="text-sm text-slate-500 mb-1">{t('quizTaking.score')}</div>
                                <div className="text-xl font-bold text-indigo-600">{score}%</div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => onBack ? onBack() : navigate('/dashboard?tab=quizzes')}
                            >
                                {t('quizTaking.backToDashboard')}
                            </Button>

                            {/* Show Next Quiz ONLY if passed AND next quiz exists */}
                            {((quizResult.passed || score >= passingScore) && nextQuizId) ? (
                                <Button
                                    onClick={() => {
                                        // Force reload/navigate to new quiz
                                        window.location.href = `/quizzes/${nextQuizId}`;
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {t('quizTaking.nextQuiz')}
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {t('quizTaking.retake')}
                                </Button>
                            )}
                        </div>


                    </div>
                </div>
            </UserLayout>
        );
    }

    if (!quiz) return null;

    if (!hasStarted) {
        return (
            <UserLayout>
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => onBack ? onBack() : navigate(-1)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full transition-colors text-slate-600 dark:text-slate-300"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-3xl font-bold">{quiz.title}</h1>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">{quiz.description}</p>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                <p className="text-sm text-slate-500">{t('quizTaking.questions')}</p>
                                <p className="text-2xl font-bold">{quiz.questions?.length || 0}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                <p className="text-sm text-slate-500">{t('quizTaking.timeLimit')}</p>
                                <p className="text-2xl font-bold">{quiz.timeLimit || 10} {t('quizTaking.min')}</p>
                            </div>
                        </div>
                        <Button onClick={handleStartQuiz} className="w-full">{t('quizTaking.startQuiz')}</Button>
                    </div>
                </div>
            </UserLayout>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion?.id || currentQuestion?._id];

    return (
        <UserLayout>
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm mb-6">
                    <div className="flex justify-between items-center">
                        <span>{t('quizTaking.question')} {currentQuestionIndex + 1} {t('quizTaking.of')} {quiz.questions?.length}</span>
                        <span className={`font-mono text-lg font-bold ${timeLeft < 60 ? 'text-red-600' : ''}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm mb-6">
                    <h2 className="text-2xl font-bold mb-6">{currentQuestion?.questionText}</h2>
                    <div className="space-y-3">
                        {currentQuestion?.options?.map((option: string, index: number) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(option)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${currentAnswer === option
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                        {t('quizTaking.previous')}
                    </Button>
                    {currentQuestionIndex === (quiz.questions?.length || 0) - 1 ? (
                        <Button onClick={handleSubmitQuiz} disabled={submitting}>
                            {submitting ? t('quizTaking.submitting') : t('quizTaking.submitQuiz')}
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>{t('quizTaking.next')}</Button>
                    )}
                </div>
            </div>
        </UserLayout>
    );
};

export default UserQuizTakingPage;

