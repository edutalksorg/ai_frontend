import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckSquare, Clock, ArrowRight, RotateCcw, Award, ArrowLeft, BrainCircuit, CheckCircle, XCircle, Timer, AlertTriangle } from 'lucide-react';
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
        // Use timeLimitMinutes (new) or duration (legacy)
        const limit = quiz.timeLimitMinutes || quiz.duration || quiz.timeLimit || 10;
        setTimeLeft(limit * 60);
        setTimerActive(true);
    };

    const handleAnswerSelect = (optionId: string) => {
        const currentQuestion = quiz?.questions[currentQuestionIndex];
        if (currentQuestion) {
            // Fallback to index if ID is missing (common cause of scoring errors)
            const key = currentQuestion.id || currentQuestion._id || currentQuestionIndex;
            setAnswers(prev => ({
                ...prev,
                [key]: optionId
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

            // 1. Submit the quiz
            // Backend expects array of { questionId, selectedOption }
            const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
                questionId,
                selectedOption
            }));

            const submitResponse = await quizzesService.submit(quiz.id || quiz._id, formattedAnswers, startedAt);

            // 2. Extract attempt ID
            // Handle various possible response structures
            const submitData = (submitResponse as any)?.data || submitResponse;
            const attemptId = submitData?.id || submitData?._id || submitData?.attemptId;

            if (attemptId) {
                // 3. Fetch detailed results
                try {
                    const attemptDetails = await quizzesService.getAttemptDetails(quiz.id || quiz._id, attemptId);
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
            <UserLayout hideNavbar={true}>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-center animate-pulse">
                        <BrainCircuit className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold text-lg">{t('quizTaking.loadingQuiz')}</p>
                    </div>
                </div>
            </UserLayout>
        );
    }

    if (quizResult) {
        // Extract data from result - handle both nested and flat structures
        const data = quizResult.data || quizResult;
        const score = data.score ?? 0;
        const correctAnswers = data.correctCount ?? data.correctAnswers ?? 0;
        const totalQuestions = data.totalQuestions ?? quiz?.questions?.length ?? 0;
        const passingScore = data.passingScore ?? quiz?.passingScore ?? 60;
        const passed = data.passed ?? (score >= passingScore);

        return (
            <UserLayout hideNavbar={true}>
                <div className="max-w-2xl mx-auto text-center pb-20">
                    {/* Result Card */}
                    <div className="glass-panel p-10 rounded-3xl relative overflow-hidden mb-8">
                        {/* Confeetti/Glow */}
                        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl -mr-20 -mt-20 ${passed ? 'bg-green-500/10' : 'bg-orange-500/10'}`} />
                        <div className={`absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl -ml-20 -mb-20 ${passed ? 'bg-green-500/10' : 'bg-orange-500/10'}`} />

                        <div className="relative z-10">
                            {passed ? (
                                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20 animate-in zoom-in duration-500">
                                    <Award size={48} className="text-white" />
                                </div>
                            ) : (
                                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20 animate-in zoom-in duration-500">
                                    <RotateCcw size={48} className="text-white" />
                                </div>
                            )}

                            <h2 className="text-4xl font-extrabold mb-2 text-slate-900 dark:text-white">
                                {passed ? t('quizTaking.passed') : t('quizTaking.keepPracticing')}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                                {passed
                                    ? "Congratulations on mastering this topic! You've shown excellent understanding."
                                    : "Don't give up! Review the material and try again to improve your score."}
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('quizTaking.correct')}</div>
                                    <div className="text-2xl font-black text-green-500">{correctAnswers}</div>
                                </div>
                                <div className="p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('quizTaking.totalQuestions')}</div>
                                    <div className="text-2xl font-black text-slate-700 dark:text-slate-300">{totalQuestions}</div>
                                </div>
                                <div className="p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('quizTaking.score')}</div>
                                    <div className={`text-2xl font-black ${passed ? 'text-green-500' : 'text-orange-500'}`}>{score}%</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => onBack ? onBack() : navigate('/dashboard?tab=quizzes')}
                                    className="glass-button"
                                >
                                    {t('quizTaking.backToDashboard')}
                                </Button>

                                {/* Show Next Quiz ONLY if passed AND next quiz exists */}
                                {((passed || score >= passingScore) && nextQuizId) ? (
                                    <Button
                                        onClick={() => {
                                            // Force reload/navigate to new quiz
                                            window.location.href = `/quizzes/${nextQuizId}`;
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                                    >
                                        {t('quizTaking.nextQuiz')}
                                        <ArrowRight size={18} className="ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => window.location.reload()}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                                    >
                                        <RotateCcw size={18} className="mr-2" />
                                        {t('quizTaking.retake')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </UserLayout>
        );
    }

    if (!quiz) return null;

    if (!hasStarted) {
        return (
            <UserLayout hideNavbar={true}>
                <div className="max-w-2xl mx-auto pt-8">
                    <div className="glass-panel p-8 md:p-12 rounded-3xl text-center relative overflow-hidden">
                        {/* Blob */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mt-20" />

                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <BrainCircuit className="w-10 h-10 text-indigo-500" />
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">{quiz.title}</h1>
                            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">{quiz.description}</p>

                            <div className="flex justify-center gap-4 mb-10">
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <Clock className="w-5 h-5 text-indigo-500" />
                                    <span className="font-bold text-slate-700 dark:text-slate-300">
                                        {quiz.timeLimitMinutes || quiz.duration || 10} {t('quizTaking.min')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <CheckSquare className="w-5 h-5 text-indigo-500" />
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{quiz.questions?.length || 0} {t('quizTaking.questions')}</span>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => onBack ? onBack() : navigate(-1)}
                                    className="glass-button"
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    onClick={handleStartQuiz}
                                    className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/30 font-bold"
                                >
                                    {t('quizTaking.startQuiz')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </UserLayout>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    // Check both ID (if exists) and index to find the saved answer
    const currentAnswer = answers[currentQuestion?.id] || answers[currentQuestion?._id] || answers[currentQuestionIndex];

    return (
        <UserLayout>
            <div className="max-w-3xl mx-auto pb-20">
                {/* Header / Timer */}
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between mb-8 sticky top-20 z-20 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-500">{t('quizTaking.question')} {currentQuestionIndex + 1}</span>
                    </div>

                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border font-mono font-bold ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                        <Timer size={16} />
                        {formatTime(timeLeft)}
                    </div>
                </div>


                {/* Question Card */}
                <div className="glass-card p-8 md:p-10 rounded-3xl mb-8 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10" />

                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-8 leading-normal relative z-10">
                        {currentQuestion?.questionText || currentQuestion?.question}
                    </h2>

                    <div className="space-y-4 relative z-10">
                        {currentQuestion?.options?.map((option: string, index: number) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(option)}
                                className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${currentAnswer === option
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 shadow-md shadow-indigo-500/10'
                                    : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                            >
                                <span className={`font-medium ${currentAnswer === option ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {option}
                                </span>
                                {currentAnswer === option && (
                                    <CheckCircle className="text-indigo-500 animate-in zoom-in duration-300" size={20} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                    <Button
                        variant="ghost"
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className="text-slate-500 hover:text-indigo-600"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        {t('quizTaking.previous')}
                    </Button>

                    {currentQuestionIndex === (quiz.questions?.length || 0) - 1 ? (
                        <Button
                            onClick={handleSubmitQuiz}
                            disabled={submitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 shadow-lg shadow-indigo-500/20"
                        >
                            {submitting ? 'Submitting...' : t('quizTaking.submitQuiz')}
                        </Button>
                    ) : (
                        <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 shadow-lg shadow-indigo-500/20">
                            {t('quizTaking.next')}
                            <ArrowRight size={20} className="ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </UserLayout>
    );
};

export default UserQuizTakingPage;
