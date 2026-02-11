import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mic, BookOpen, Phone, CheckSquare, Rocket, Star, Zap, Facebook, Linkedin, Instagram, Mail, ArrowRight, Check, Loader } from 'lucide-react';
import { subscriptionsService } from '../../services/subscriptions';
import Button from '../../components/Button';
import { Logo } from '../../components/common/Logo';

const AnimatedBanner: React.FC = () => {
    return (
        <div className="w-full max-w-5xl animate-in fade-in slide-in-from-top duration-1000">
            <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-indigo-600/20 rounded-[2.5rem] blur-2xl opacity-70"></div>
                <div className="relative aspect-[512/384] md:aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 bg-slate-900/50 backdrop-blur-sm">
                    <img
                        src="/hero-banner.gif"
                        alt="EduTalks Animated Banner"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

const LandingPage: React.FC = () => {
    const { t } = useTranslation();
    const [plans, setPlans] = useState<any[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await subscriptionsService.getPlans();
                const planList = (response as any)?.data || (Array.isArray(response) ? response : (response as any)?.items) || [];
                setPlans(planList);
            } catch (error) {
                console.error("Failed to fetch plans", error);
            } finally {
                setLoadingPlans(false);
            }
        };
        fetchPlans();
    }, []);

    const getFeatureDisplay = (key: string, value: any) => {
        if (['priority', '_id', 'createdat', 'updatedat', '__v', 'id', 'subscriptions'].includes(key.toLowerCase())) return null;
        let displayValue = typeof value === 'string' ? value : (value?.value || value?.text);
        if (!displayValue || displayValue === 'true' || displayValue === 'false') return null;
        return displayValue;
    };

    return (
        <div className="min-h-dvh bg-white dark:bg-slate-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
                    <div className="cursor-pointer">
                        <Logo className="!text-xl sm:!text-2xl" />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link to="/login">
                            <Button variant="outline" size="md" className="!px-2.5 !py-1.5 !text-xs sm:!px-4 sm:!py-2.5 sm:!text-base">
                                {t('landing.nav.login')}
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="primary" size="md" className="!px-2.5 !py-1.5 !text-xs sm:!px-4 sm:!py-2.5 sm:!text-base whitespace-nowrap">
                                {t('landing.nav.getStarted')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <section className="relative overflow-hidden pt-16 lg:pt-16 pb-20 flex items-center min-h-[80vh]">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 w-full">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 lg:gap-24 relative z-10">
                        {/* Left Portion: Animated Hero Banner */}
                        <div className="w-full lg:w-[55%] animate-in fade-in slide-in-from-left duration-1000">
                            <div className="relative group w-full">
                                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-violet-600/30 rounded-[3rem] blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
                                <div className="relative w-full rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] border border-white/10 bg-slate-900/50 backdrop-blur-md transform transition-transform duration-700 hover:scale-[1.01]">
                                    <img
                                        src="/hero-banner.gif"
                                        alt="EduTalks Animated Banner"
                                        className="w-full h-auto object-cover block"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Portion: Welcome Component */}
                        <div className="w-full lg:w-[40%] text-center lg:text-left space-y-10 animate-in fade-in slide-in-from-right duration-1000 delay-300">
                            <div className="space-y-6">
                                <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight leading-[1.02] text-white">
                                    <span className="text-blue-500">Welcome to </span>
                                    <span className="text-violet-500 block">EduTalks</span>
                                </h1>

                                <div className="space-y-4">
                                    <p className="text-2xl lg:text-3xl font-bold text-slate-100">
                                        Master English. <br className="hidden lg:block" /> Connect with the World.
                                    </p>
                                    <p className="text-lg sm:text-xl text-slate-400 max-w-xl lg:mx-0 mx-auto leading-relaxed font-medium">
                                        Learn English through real conversations, AI-powered feedback, and daily practice with learners worldwide.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2">
                                <Link to="/register" className="w-full sm:w-auto">
                                    <button className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xl transition-all shadow-2xl shadow-blue-500/40 w-full lg:w-[220px] transform hover:scale-105 active:scale-95">
                                        Get Started
                                    </button>
                                </Link>
                                <Link to="/login" className="w-full sm:w-auto">
                                    <button className="h-16 px-10 bg-transparent border-2 border-slate-700 hover:border-blue-500 hover:bg-blue-500/10 text-white font-extrabold rounded-2xl text-xl transition-all w-full lg:w-[220px] transform hover:scale-105 active:scale-95">
                                        Sign In
                                    </button>
                                </Link>
                            </div>

                            <div className="inline-flex items-center gap-4 text-base text-slate-400 font-bold bg-white/5 px-8 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <span className="text-2xl animate-bounce">🎁</span>
                                <span>Get 24 hours of free trial</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Showcase Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-32">
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-slate-900 dark:text-white">
                    {t('landing.features.title')}
                </h2>

                {/* Feature 1: Voice Calling */}
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                    <div className="flex-1 w-full relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <img
                            src="/assets/voice-call.svg"
                            alt="Voice Call Interface"
                            className="relative rounded-3xl shadow-2xl w-full border border-slate-200 dark:border-slate-700 bg-slate-900/50 backdrop-blur-sm"
                        />
                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                            <Phone className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                            {t('landing.features.voiceCalling.title')}
                        </h3>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t('landing.features.voiceCalling.description')} Connect instantly with learning partners around the world. Our smart matching system ensures you always have someone to practice with.
                        </p>
                        <ul className="space-y-3">
                            {[
                                'Real-time P2P audio',
                                'Smart partner matching',
                                'Topic suggestions during calls'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/voice-calls" className="inline-block pt-4 text-indigo-500 font-semibold hover:text-indigo-600 transition-colors">
                            Start a Call &rarr;
                        </Link>
                    </div>
                </div>

                {/* Feature 2: Daily Topics (Reversed) */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
                    <div className="flex-1 w-full relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <img
                            src="/assets/topics.svg"
                            alt="Topics Interface"
                            className="relative rounded-3xl shadow-2xl w-full border border-slate-200 dark:border-slate-700 bg-slate-900/50 backdrop-blur-sm"
                        />
                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-cyan-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                            {t('landing.features.dailyTopics.title')}
                        </h3>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t('landing.features.dailyTopics.description')} Never run out of things to say. Explore our vast library of conversation starters, curated for every skill level.
                        </p>
                        <ul className="space-y-3">
                            {[
                                'Curated daily topics',
                                'Vocabulary suggestions',
                                'Level-based categorization'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/daily-topics" className="inline-block pt-4 text-cyan-500 font-semibold hover:text-cyan-600 transition-colors">
                            Explore Topics &rarr;
                        </Link>
                    </div>
                </div>

                {/* Feature 3: Quizzes */}
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                    <div className="flex-1 w-full relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <img
                            src="/assets/quizzes.svg"
                            alt="Quiz Interface"
                            className="relative rounded-3xl shadow-2xl w-full border border-slate-200 dark:border-slate-700 bg-slate-900/50 backdrop-blur-sm"
                        />
                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <CheckSquare className="w-8 h-8 text-amber-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                            {t('landing.features.dailyQuizzes.title')}
                        </h3>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t('landing.features.dailyQuizzes.description')} Test your knowledge and track your progress with our gamified quizzes. Earn points and climb the leaderboard.
                        </p>
                        <ul className="space-y-3">
                            {[
                                'Instant feedback',
                                'Various difficulty levels',
                                'Track your mastery'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/quizzes" className="inline-block pt-4 text-amber-500 font-semibold hover:text-amber-600 transition-colors">
                            Take a Quiz &rarr;
                        </Link>
                    </div>
                </div>

                {/* Feature 4: AI Pronunciation (Reversed) */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
                    <div className="flex-1 w-full relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <img
                            src="/assets/ai-pronunciation.svg"
                            alt="AI Analysis"
                            className="relative rounded-3xl shadow-2xl w-full border border-slate-200 dark:border-slate-700 bg-slate-900/50 backdrop-blur-sm"
                        />
                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <Mic className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                            {t('landing.features.aiPronunciation.title')}
                        </h3>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t('landing.features.aiPronunciation.description')} Get instant, detailed feedback on your pronunciation using our advanced AI technology. Perfection is within reach.
                        </p>
                        <ul className="space-y-3">
                            {[
                                'Visual sound wave analysis',
                                'Accuracy scoring',
                                'Phoneme-level feedback'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/pronunciation" className="inline-block pt-4 text-emerald-500 font-semibold hover:text-emerald-600 transition-colors">
                            Analyze Voice &rarr;
                        </Link>
                    </div>
                </div>

            </section>

            {/* Stats Section */}
            <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 text-center text-white">
                        <div>
                            <p className="text-4xl font-bold">10K+</p>
                            <p className="text-lg mt-2 opacity-90">{t('landing.stats.activeLearners')}</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold">500+</p>
                            <p className="text-lg mt-2 opacity-90">{t('landing.stats.dailyTopics')}</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold">100+</p>
                            <p className="text-lg mt-2 opacity-90">{t('landing.stats.quizQuestions')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="bg-slate-50 dark:bg-slate-900/50 py-24 border-y border-slate-200 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-500/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
                            Choose Your Plan
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Start with a free trial and upgrade anytime. All plans include access to our core features.
                        </p>
                    </div>

                    {loadingPlans ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader className="w-10 h-10 text-violet-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {plans.length > 0 ? plans.map((plan) => {
                                const isYearlyPlan = plan.name?.toLowerCase().includes('yearly') || plan.interval?.toLowerCase() === 'year';
                                const isFreeTrial = plan.name?.toLowerCase().includes('free trial');
                                const isQuarterly = plan.name?.toLowerCase().includes('quarterly');

                                return (
                                    <div key={plan.id || plan._id} className={`relative rounded-3xl p-6 sm:p-8 flex flex-col h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${isYearlyPlan
                                            ? 'border-violet-500/50 dark:border-violet-400/30 bg-gradient-to-b from-violet-50/50 to-white/50 dark:from-violet-900/20 dark:to-slate-900/40 shadow-violet-500/10'
                                            : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700'
                                        }`}>
                                        {isYearlyPlan && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-black px-6 py-2 rounded-full shadow-xl z-40 animate-bounce tracking-wider flex items-center gap-2 border-2 border-white/20">
                                                <Zap size={16} fill="white" />
                                                BEST OFFER
                                            </div>
                                        )}

                                        <div className="mb-6 pt-2">
                                            <h4 className={`text-xl font-bold mb-2 ${isYearlyPlan ? 'text-violet-700 dark:text-violet-300' : 'text-slate-900 dark:text-white'}`}>
                                                {plan.name}
                                            </h4>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-baseline gap-2">
                                                    {isYearlyPlan && (
                                                        <span className="text-xl text-slate-400 line-through font-medium">₹1300</span>
                                                    )}
                                                    <span className={`text-4xl font-extrabold tracking-tight ${isYearlyPlan ? 'text-violet-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                                                        ₹{plan.price}
                                                    </span>
                                                    <span className={`text-sm font-medium ${isYearlyPlan ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500'}`}>
                                                        /{isFreeTrial ? '24h' : (plan.interval === 'year' || isYearlyPlan) ? 'year' : (isQuarterly ? '3 months' : 'month')}
                                                    </span>
                                                </div>
                                                {isYearlyPlan && (
                                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded w-fit flex items-center gap-1 mt-1 border border-red-200 dark:border-red-800/30">
                                                        <Zap size={10} fill="currentColor" />
                                                        Limited Time Offer
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 leading-relaxed min-h-[40px]">
                                                {plan.description}
                                            </p>
                                        </div>

                                        <div className="h-px w-full bg-slate-200 dark:bg-slate-700/50 mb-6" />

                                        <ul className="space-y-4 mb-8 flex-1">
                                            {plan.features && Object.keys(plan.features).length > 0 ? (
                                                Object.entries(plan.features).map(([key, value], i) => {
                                                    const displayValue = getFeatureDisplay(key, value);
                                                    if (!displayValue) return null;

                                                    return (
                                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                            <div className={`mt-0.5 p-0.5 rounded-full shrink-0 ${isYearlyPlan ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400' : 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'}`}>
                                                                <Check size={12} strokeWidth={3} />
                                                            </div>
                                                            <span className="leading-tight">{displayValue}</span>
                                                        </li>
                                                    );
                                                })
                                            ) : (
                                                <li className="text-sm text-slate-500 italic">Core features included</li>
                                            )}
                                        </ul>

                                        <Link to="/register" className="mt-auto">
                                            <button className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all ${isYearlyPlan
                                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-violet-500/30'
                                                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                                                }`}>
                                                {isFreeTrial ? "Start Free Trial" : "Get Started"}
                                            </button>
                                        </Link>
                                    </div>
                                );
                            }) : (
                                <div className="col-span-full text-center text-slate-500">
                                    No plans available at the moment.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Community Section */}
            <section className="bg-slate-50 dark:bg-slate-900/50 py-24 border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
                        Join Our Global Community
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-16 max-w-2xl mx-auto">
                        Connect with thousands of learners, practice real conversations, and make friends from around the world.
                    </p>

                    <div className="grid md:grid-cols-3 gap-12 items-end">
                        {/* Learner 1 */}
                        <div className="flex flex-col items-center group">
                            <div className="relative mb-8 transition-transform duration-500 hover:-translate-y-4">
                                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/30 transition-colors"></div>
                                <img src="/assets/learner-audio.svg" alt="Listening Practice" className="w-64 h-64 relative z-10 drop-shadow-2xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Immersive Listening</h3>
                            <p className="text-slate-600 dark:text-slate-400">Practice with native audio</p>
                        </div>

                        {/* Learner 3 (Center - Connect) */}
                        <div className="flex flex-col items-center group -mt-12">
                            <div className="relative mb-8 transition-transform duration-500 hover:scale-110">
                                <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-2xl group-hover:bg-pink-500/30 transition-colors"></div>
                                <img src="/assets/community-connect.svg" alt="Social Connection" className="w-80 h-80 relative z-10 drop-shadow-2xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Real Connections</h3>
                            <p className="text-slate-600 dark:text-slate-400">Make friends & learn together</p>
                        </div>

                        {/* Learner 2 */}
                        <div className="flex flex-col items-center group">
                            <div className="relative mb-8 transition-transform duration-500 hover:-translate-y-4">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/30 transition-colors"></div>
                                <img src="/assets/learner-study.svg" alt="Focused Study" className="w-64 h-64 relative z-10 drop-shadow-2xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Structured Learning</h3>
                            <p className="text-slate-600 dark:text-slate-400">Master topics daily</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-slate-950 py-24 text-center relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 text-slate-800/50 transform -rotate-12">
                        <Rocket size={120} strokeWidth={1} />
                    </div>
                    <div className="absolute bottom-10 right-10 text-slate-800/50 transform rotate-12">
                        <Zap size={120} strokeWidth={1} />
                    </div>
                    <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                    <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>

                    {/* Gradient Blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="inline-block p-3 rounded-2xl bg-slate-900/50 border border-slate-800 mb-6 backdrop-blur-sm">
                        <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">
                        Start Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Today</span>
                    </h2>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of English learners and start your journey to fluency. No credit card required.
                    </p>
                    <Link to="/register">
                        <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1">
                            Create Free Account
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-white border-t border-slate-900 pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <Mic className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-2xl tracking-tight">EduTalks</h3>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Master English visually and verbally. Connect with the world through real-time conversations and AI-powered pronunciation feedback.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://www.facebook.com/people/Edutalks/61578676177087/" target="_blank" rel="noreferrer" className="p-2 bg-slate-900 rounded-lg hover:bg-slate-800 hover:text-blue-500 transition-colors"><Facebook size={20} /></a>
                                <a href="https://www.linkedin.com/company/edutalks-pvt-ltd/posts/?feedView=all" target="_blank" rel="noreferrer" className="p-2 bg-slate-900 rounded-lg hover:bg-slate-800 hover:text-blue-600 transition-colors"><Linkedin size={20} /></a>
                                <a href="https://www.instagram.com/edutalks_tech?igsh=MXZjcm5mcDB0MzNi" target="_blank" rel="noreferrer" className="p-2 bg-slate-900 rounded-lg hover:bg-slate-800 hover:text-pink-500 transition-colors"><Instagram size={20} /></a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6 flex items-center gap-2"><BookOpen size={18} className="text-slate-500" /> Product</h4>
                            <ul className="space-y-4 text-slate-400">
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Voice Rooms</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Daily Topics</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Pronunciation AI</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6 flex items-center gap-2"><CheckSquare size={18} className="text-slate-500" /> Company</h4>
                            <ul className="space-y-4 text-slate-400">
                                <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                                <li><Link to="/success-stories" className="hover:text-indigo-400 transition-colors">Success Stories</Link></li>
                                <li><Link to="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6 flex items-center gap-2"><Mail size={18} className="text-slate-500" /> Stay Updated</h4>
                            <p className="text-slate-400 text-sm mb-4">Subscribe to our newsletter for daily tips.</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                                />
                                <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors">
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
                        <p>{t('landing.footer.copyright')}</p>
                        <div className="flex gap-6">
                            <Link to="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
                            <Link to="/cookie-policy" className="hover:text-slate-300 transition-colors">Cookie Policy</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
