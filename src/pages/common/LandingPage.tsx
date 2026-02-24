import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mic, BookOpen, Phone, CheckSquare, Rocket, Star, Zap, Facebook, Linkedin, Instagram, Mail, ArrowRight, Download } from 'lucide-react';
import Button from '../../components/Button';
import { Logo } from '../../components/common/Logo';
import { usePWA } from '../../hooks/usePWA';

const AnimatedBanner: React.FC = () => {
    return (
        <div className="w-full max-w-5xl animate-in fade-in slide-in-from-top duration-1000">
            <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-red-600/20 via-orange-600/20 to-pink-600/20 rounded-[2.5rem] blur-2xl opacity-70"></div>
                <div className="relative aspect-[512/384] md:aspect-video rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(255,0,0,0.1)] border border-gray-100 bg-white/50 backdrop-blur-sm">
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
    const { isInstallable, installPWA } = usePWA();

    const handleAPKDownload = () => {
        const link = document.createElement('a');
        link.href = '/edutalks.apk';
        link.download = 'edutalks.apk';
        link.click();
    };

    return (
        <div className="min-h-dvh bg-[#FAFAFA] overflow-x-hidden w-full relative">

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-white sm:bg-white/80 sm:backdrop-blur-lg border-b border-gray-100 shadow-sm sm:shadow-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 flex items-center justify-between">
                    <div className="cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <Logo className="!text-lg sm:!text-2xl" />
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-4 overflow-hidden">
                        {isInstallable ? (
                            <button
                                onClick={installPWA}
                                title="Download APK file"
                                className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-[#E10600] hover:bg-red-50 rounded-full border border-[#E10600] transition-all whitespace-nowrap"
                            >
                                <Download size={16} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline ml-1.5">Download Now</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleAPKDownload}
                                title="Download APK file"
                                className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-[#E10600] hover:bg-red-50 rounded-full border border-[#E10600] transition-all whitespace-nowrap"
                            >
                                <Download size={16} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline ml-1.5">Download Now</span>
                            </button>
                        )}
                        <Link to="/login" className="shrink-0">
                            <Button variant="outline" size="sm" className="!px-2 !py-1.5 !text-[10px] sm:!text-sm border-gray-200 hover:bg-gray-50 text-gray-700">
                                {t('landing.nav.login')}
                            </Button>
                        </Link>
                        <Link to="/register" className="shrink-0">
                            <Button variant="primary" size="sm" className="!px-2 sm:!px-4 !py-1.5 !text-[10px] sm:!text-sm whitespace-nowrap bg-[#E10600] hover:bg-[#b80000] text-white border-none shadow-lg shadow-red-500/30">
                                {t('landing.nav.getStarted')}
                            </Button>
                        </Link>

                    </div>
                </div>
            </nav>


            <section className="relative overflow-hidden pt-24 lg:pt-24 pb-12 flex items-center min-h-[80vh]">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 w-full">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 lg:gap-24 relative z-10">
                        {/* Left Portion: Welcome Component */}
                        <div className="w-full lg:w-[45%] text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-left duration-1000 order-1">
                            <div className="space-y-4">
                                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-[#1A1A1A]">
                                    Welcome to <br />
                                    <span className="text-[#E10600]">EduTalks</span>
                                </h1>


                                <p className="text-xl lg:text-2xl font-medium text-gray-600 max-w-xl mx-auto lg:mx-0">
                                    Master English. Connect with the World.
                                </p>
                                <p className="text-base text-gray-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                                    Learn English through real conversations, AI-powered feedback, and daily practice with learners worldwide.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                                <Link to="/register" className="w-full sm:w-auto">
                                    <button className="h-14 px-8 bg-[#E10600] hover:bg-[#b80000] text-white font-bold rounded-full text-lg shadow-xl shadow-red-500/20 w-full sm:min-w-[180px] transition-transform hover:scale-105">
                                        Get Started
                                    </button>
                                </Link>
                                {isInstallable ? (
                                    <button
                                        onClick={installPWA}
                                        className="h-14 px-8 bg-white border-2 border-[#E10600] text-[#E10600] hover:bg-red-50 font-bold rounded-full text-lg w-full sm:min-w-[180px] transition-transform hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <Download size={20} /> Install App
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAPKDownload}
                                        className="h-14 px-8 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-full text-lg w-full sm:min-w-[180px] transition-transform hover:scale-105"
                                    >
                                        Download APK
                                    </button>
                                )}
                            </div>

                            <div className="inline-flex items-center gap-3 text-sm text-gray-500 bg-white px-6 py-2 rounded-full border border-gray-100 shadow-sm mt-4">
                                <span className="text-xl">🎁</span>
                                <span className="font-medium">Get 24 hours of free trial</span>
                            </div>
                        </div>

                        {/* Right Portion: Animated Hero Banner */}
                        <div className="w-full lg:w-[50%] animate-in fade-in slide-in-from-right duration-1000 order-2">
                            <div className="relative group w-full perspective-1000">
                                <div className="absolute -inset-4 bg-gradient-to-tr from-red-500/20 to-orange-500/20 rounded-[3rem] blur-3xl opacity-50"></div>
                                <div className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200/50 border border-white/50 bg-white transform transition-transform duration-700 hover:rotate-1">
                                    <img
                                        src="/hero-banner.gif"
                                        alt="EduTalks Experience"
                                        className="w-full h-auto object-cover block"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Showcase Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
                <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-8 text-slate-900 tracking-tight">
                    {t('landing.features.title')}
                </h2>

                {/* Feature 1: Voice Calling */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24">
                    <div className="w-full md:w-[42%] relative group">
                        {/* Decorative floating dots */}
                        <div className="absolute top-1/4 -left-4 w-3 h-3 rounded-full bg-slate-300 animate-pulse hidden md:block" />
                        <div className="absolute bottom-1/3 -right-4 w-2 h-2 rounded-full bg-red-400 animate-pulse hidden md:block" />

                        <div className="bg-gradient-to-br from-red-50/50 to-white/80 backdrop-blur-xl p-4 rounded-[3.5rem] shadow-[0_20px_50px_rgba(239,68,68,0.1)] relative z-10 border border-red-100/50">
                            <img
                                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1000"
                                alt="Voice Calling - Global Connectivity"
                                className="w-full h-[320px] object-cover rounded-[2.5rem] transform group-hover:scale-105 transition-transform duration-700 shadow-inner"
                            />
                        </div>
                    </div>
                    <div className="flex-1 space-y-6 relative">
                        <h3 className="text-4xl font-extrabold text-[#1A1A1A]">
                            Voice Calling
                        </h3>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Practice speaking with other learners in real-time WebRTC calls. Connect instantly with learning partners around the world.
                            Our smart matching system ensures you always have someone to practice with.
                        </p>
                        <ul className="space-y-6">
                            {[
                                'Real-time P2P audio',
                                'Smart partner matching',
                                'Topic suggestions during calls'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-gray-700">
                                    <div className="w-2 h-2 rounded-full bg-[#E10600]" />
                                    <span className="font-medium text-lg">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="pt-4">
                            <Link to="/voice-calls">
                                <button className="h-14 px-10 border-2 border-[#E10600] text-[#E10600] hover:bg-red-50 px-8 rounded-xl font-bold flex items-center gap-2 transition-all text-lg">
                                    Start a Call <ArrowRight size={20} />
                                </button>
                            </Link>
                        </div>

                    </div>
                </div>

                {/* Feature 2: Daily Grammar (Reversed) */}
                <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-12 md:gap-24">
                    <div className="w-full md:w-[42%] relative group">
                        {/* Decorative floating dots */}
                        <div className="absolute top-1/4 -right-4 w-3 h-3 rounded-full bg-blue-300 animate-pulse hidden md:block" />
                        <div className="absolute bottom-1/3 -left-4 w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden md:block" />

                        <div className="bg-gradient-to-br from-blue-50/50 to-white/80 backdrop-blur-xl p-4 rounded-[3.5rem] shadow-[0_20px_50px_rgba(59,130,246,0.1)] relative z-10 border border-blue-100/50">
                            <img
                                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000"
                                alt="Modern Grammar Learning"
                                className="w-full h-[320px] object-cover rounded-[2.5rem] transform group-hover:scale-105 transition-transform duration-700 shadow-inner"
                            />
                        </div>
                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-3xl font-bold text-[#1A1A1A]">
                            Daily Grammar
                        </h3>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Master English grammar through interactive exercises. Align written sentences, correct structures, and learn in real-time.
                        </p>
                        <ul className="space-y-3">
                            {[
                                'Jumbled sentence realignment',
                                'Real-time structural feedback',
                                'Daily personalized exercises'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/daily-topics" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-colors mt-4">
                            Practice Grammar <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* Feature 3: Quizzes */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24">
                    <div className="w-full md:w-[42%] relative group">
                        {/* Decorative floating dots */}
                        <div className="absolute top-1/3 -left-4 w-3 h-3 rounded-full bg-amber-300 animate-pulse hidden md:block" />
                        <div className="absolute bottom-1/4 -right-4 w-2 h-2 rounded-full bg-red-400 animate-pulse hidden md:block" />

                        <div className="bg-gradient-to-br from-amber-50/50 to-white/80 backdrop-blur-xl p-4 rounded-[3.5rem] shadow-[0_20px_50px_rgba(245,158,11,0.1)] relative z-10 border border-amber-100/50">
                            <img
                                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000"
                                alt="Educational Quiz Connection"
                                className="w-full h-[320px] object-cover rounded-[2.5rem] transform group-hover:scale-105 transition-transform duration-700 shadow-inner"
                            />
                        </div>
                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
                            <CheckSquare className="w-8 h-8 text-amber-500" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                            Daily Quizzes
                        </h3>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            {t('landing.features.dailyQuizzes.description')} Sharpen your skills with AI-generated questions tailored to your level.
                        </p>
                        <ul className="space-y-4">
                            {[
                                'Instant feedback',
                                'Various difficulty levels',
                                'Track your mastery'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-slate-800 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/quizzes" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 mt-4 h-12">
                            Take a Quiz <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* Feature 4: AI Pronunciation (Reversed) */}
                <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-12 md:gap-24">
                    <div className="w-full md:w-[42%] relative group">
                        {/* Decorative floating dots */}
                        <div className="absolute top-1/3 -right-4 w-3 h-3 rounded-full bg-emerald-300 animate-pulse hidden md:block" />
                        <div className="absolute bottom-1/4 -left-4 w-2 h-2 rounded-full bg-blue-400 animate-pulse hidden md:block" />

                        <div className="bg-gradient-to-br from-emerald-50/50 to-white/80 backdrop-blur-xl p-4 rounded-[3.5rem] shadow-[0_20px_50px_rgba(16,185,129,0.1)] relative z-10 border border-emerald-100/50">
                            <img
                                src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1000"
                                alt="AI Pronunciation Voice Analysis"
                                className="w-full h-[320px] object-cover rounded-[2.5rem] transform group-hover:scale-105 transition-transform duration-700 shadow-inner"
                            />
                        </div>

                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <Mic className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                            AI Pronunciation
                        </h3>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            {t('landing.features.aiPronunciation.description')} Perfect your speaking skills with instant, phoneme-level feedback powered by advanced AI.
                        </p>
                        <ul className="space-y-4">
                            {[
                                'Visual sound wave analysis',
                                'Accuracy scoring',
                                'Phoneme-level feedback'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-slate-800 font-medium">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link to="/pronunciation" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 mt-4 h-12">
                            Analyze Voice <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

            </section>

            {/* Stats Section with Red-White Gradient */}
            <section className="bg-gradient-to-b from-red-600 via-[#E10600] to-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-3 gap-12 text-center items-center">
                        <div className="group">
                            <p className="text-5xl md:text-6xl font-black text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500">10K+</p>
                            <p className="text-sm md:text-base mt-3 font-bold text-white/90 uppercase tracking-[0.2em]">{t('landing.stats.activeLearners')}</p>
                        </div>
                        <div className="group">
                            <p className="text-5xl md:text-6xl font-black text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500">500+</p>
                            <p className="text-sm md:text-base mt-3 font-bold text-white/90 uppercase tracking-[0.2em]">{t('landing.stats.dailyTopics')}</p>
                        </div>
                        <div className="group">
                            <p className="text-5xl md:text-6xl font-black text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500">100+</p>
                            <p className="text-sm md:text-base mt-3 font-bold text-white/90 uppercase tracking-[0.2em]">{t('landing.stats.quizQuestions')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Section - Red-White Gradient Background */}
            <section className="bg-gradient-to-tr from-white via-red-50 to-white py-24 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">
                        Join Our Global Community
                    </h2>
                    <p className="text-xl text-slate-600 mb-16 max-w-2xl mx-auto">
                        Connect with thousands of learners, practice real conversations, and make friends from around the world.
                    </p>

                    <div className="grid md:grid-cols-3 gap-12 items-end">
                        {/* Learner 1 */}
                        <div className="flex flex-col items-center group">
                            <div className="relative mb-8 transition-transform duration-500 hover:-translate-y-4">
                                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl group-hover:bg-red-500/50 transition-colors"></div>
                                <div className="w-48 h-48 rounded-full bg-slate-700/50 flex items-center justify-center border border-white/10 backdrop-blur-sm">
                                    <img src="/assets/learner-audio.svg" alt="Listening Practice" className="w-32 h-32 relative z-10 drop-shadow-xl opacity-90" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Immersive Listening</h3>
                            <p className="text-slate-600">Practice with native audio</p>
                        </div>

                        {/* Learner 3 (Center - Connect) */}
                        <div className="flex flex-col items-center group -mt-12">
                            <div className="relative mb-8 transition-transform duration-500 hover:scale-110">
                                <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl group-hover:bg-blue-500/50 transition-colors"></div>
                                <div className="w-56 h-56 rounded-full bg-slate-700/50 flex items-center justify-center border border-white/10 backdrop-blur-sm shadow-xl">
                                    <img src="/assets/community-connect.svg" alt="Social Connection" className="w-40 h-40 relative z-10 drop-shadow-xl opacity-90" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Real Connections</h3>
                            <p className="text-slate-600">Make friends & learn together</p>
                        </div>

                        {/* Learner 2 */}
                        <div className="flex flex-col items-center group">
                            <div className="relative mb-8 transition-transform duration-500 hover:-translate-y-4">
                                <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-xl group-hover:bg-orange-500/50 transition-colors"></div>
                                <div className="w-48 h-48 rounded-full bg-slate-700/50 flex items-center justify-center border border-white/10 backdrop-blur-sm">
                                    <img src="/assets/learner-study.svg" alt="Focused Study" className="w-32 h-32 relative z-10 drop-shadow-xl opacity-90" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Structured Learning</h3>
                            <p className="text-slate-600">Master topics daily</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Red-White Gradient */}
            <section className="bg-gradient-to-br from-red-600 via-[#E10600] to-white py-24 text-center relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 text-white/5 transform -rotate-12">
                        <Rocket size={120} strokeWidth={1} />
                    </div>
                    <div className="absolute bottom-10 right-10 text-white/5 transform rotate-12">
                        <Zap size={120} strokeWidth={1} />
                    </div>

                    {/* Gradient Blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E10600]/10 rounded-full blur-3xl -z-10"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="inline-block p-3 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
                        <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white tracking-tight drop-shadow-md">
                        Start Learning Today
                    </h2>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                        Join thousands of English learners and start your journey to fluency. No credit card required.
                    </p>
                    <Link to="/register">
                        <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#E10600] hover:bg-[#b80000] text-white font-bold rounded-full text-lg transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-1">
                            Create Free Account
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </div>
            </section>

            {/* App Installation Instructions Section */}
            <section id="download-app" className="bg-white py-20 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8 text-center md:text-left">
                            <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
                                Take EduTalks <br />
                                <span className="text-[#E10600]">Everywhere You Go</span>
                            </h2>
                            <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                                Experience seamless learning on your Android device. Practice pronunciation, join voice rooms, and learn on the move.
                            </p>

                            <div className="space-y-6 pt-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 font-bold text-[#E10600]">1</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900">Download APK</h4>
                                        <p className="text-slate-600">Click the button below to download the `edutalks.apk` file directly to your device.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 font-bold text-[#E10600]">2</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900">Enable Unknown Sources</h4>
                                        <p className="text-slate-600">Go to Settings &gt; Security and toggle "Unknown Sources" or "Install Unknown Apps" to allow the installation.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 font-bold text-[#E10600]">3</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900">Tap to Install</h4>
                                        <p className="text-slate-600">Open your downloads folder and tap on the `edutalks.apk` file to finish the setup.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <button
                                    onClick={handleAPKDownload}
                                    className="h-16 px-10 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-lg flex items-center gap-3 transition-all shadow-xl hover:-translate-y-1 mx-auto md:mx-0"
                                >
                                    <Download className="" /> Download for Android (APK)
                                </button>
                            </div>
                        </div>

                        <div className="w-full md:w-[45%] relative">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-[#E10600]/20 to-orange-500/20 rounded-[3rem] blur-3xl opacity-50"></div>
                            <div className="relative rounded-[3rem] overflow-hidden border-8 border-slate-900 shadow-2xl max-w-[300px] mx-auto">
                                <img
                                    src="/hero-banner.gif"
                                    alt="EduTalks Mobile"
                                    className="w-full h-auto"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer - Light Theme matching the new Red-White Aesthetic */}
            <footer className="bg-white text-slate-600 border-t border-red-50 pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Link to="/" className="cursor-pointer transition-transform hover:scale-105">
                                    <Logo className="!text-xl" />
                                </Link>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Master English visually and verbally. Connect with the world through real-time conversations and AI-powered pronunciation feedback.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://www.facebook.com/people/Edutalks/61578676177087/" target="_blank" rel="noreferrer" className="p-2.5 bg-red-50 text-[#E10600] rounded-xl hover:bg-[#E10600] hover:text-white transition-all duration-300"><Facebook size={20} /></a>
                                <a href="https://www.linkedin.com/company/edutalks-pvt-ltd/posts/?feedView=all" target="_blank" rel="noreferrer" className="p-2.5 bg-red-50 text-[#E10600] rounded-xl hover:bg-[#E10600] hover:text-white transition-all duration-300"><Linkedin size={20} /></a>
                                <a href="https://www.instagram.com/edutalks_tech?igsh=MXZjcm5mcDB0MzNi" target="_blank" rel="noreferrer" className="p-2.5 bg-red-50 text-[#E10600] rounded-xl hover:bg-[#E10600] hover:text-white transition-all duration-300"><Instagram size={20} /></a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 text-lg mb-6">Product</h4>
                            <ul className="space-y-4 text-slate-600 font-medium">
                                <li><a href="#" className="hover:text-[#E10600] transition-colors">Voice Rooms</a></li>
                                <li><a href="#" className="hover:text-[#E10600] transition-colors">Daily Topics</a></li>
                                <li><a href="#" className="hover:text-[#E10600] transition-colors">Pronunciation AI</a></li>
                                <li><a href="#download-app" className="hover:text-[#E10600] transition-colors">Download App</a></li>
                                <li><a href="#" className="hover:text-[#E10600] transition-colors">Pricing</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 text-lg mb-6">Company</h4>
                            <ul className="space-y-4 text-slate-600 font-medium">
                                <li><Link to="/about" className="hover:text-[#E10600] transition-colors">About Us</Link></li>
                                <li><Link to="/success-stories" className="hover:text-[#E10600] transition-colors">Success Stories</Link></li>
                                <li><Link to="/blog" className="hover:text-[#E10600] transition-colors">Blog</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 text-lg mb-6">Stay Updated</h4>
                            <p className="text-slate-500 text-sm mb-6">Subscribe to our newsletter for daily tips.</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600] transition-all placeholder:text-slate-400 text-slate-900"
                                />
                                <button className="bg-[#E10600] hover:bg-[#b80000] p-3 rounded-xl transition-all shadow-lg shadow-red-500/20 text-white">
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-medium">
                        <p>© 2024 Edutalks Learning Pvt Ltd Product. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link to="/privacy" className="hover:text-[#E10600] transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-[#E10600] transition-colors">Terms of Service</Link>
                            <Link to="/cookie-policy" className="hover:text-[#E10600] transition-colors">Cookie Policy</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
