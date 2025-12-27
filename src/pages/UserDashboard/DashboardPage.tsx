import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Phone,
    BookOpen,
    CheckSquare,
    Mic,
    Wallet,
    CreditCard,
    Users,
    User
} from 'lucide-react';
import UserLayout from '../../components/UserLayout';
import UserTopicBrowser from './UserTopicBrowser';
import UserQuizInterface from './UserQuizInterface';
import UserVoiceCall from './UserVoiceCall';
import UserPronunciation from './UserPronunciation';
import UserWallet from './UserWallet';
import UserSubscriptions from './UserSubscriptions';
import UserReferrals from './UserReferrals';
import UserProfile from './UserProfile';
import UpgradeModal from '../../components/UpgradeModal';
import SubscriptionLock from '../../components/SubscriptionLock';
import DashboardCarousel from '../../components/DashboardCourosel';
import { useUsageLimits } from '../../hooks/useUsageLimits';
import { fadeIn, slideUp, buttonClick } from '../../constants/animations';

type TabType = 'voice' | 'topics' | 'quizzes' | 'pronunciation' | 'wallet' | 'subscriptions' | 'referrals' | 'profile';

const DashboardPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const tabParam = searchParams.get('tab') as TabType;
    const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'topics');
    const {
        showUpgradeModal,
        closeUpgradeModal,
        isTrialActive,
        trialRemainingTime,
        hasActiveSubscription,
        triggerUpgradeModal,
    } = useUsageLimits();

    // Carousel slides
    const carouselSlides = [
        {
            id: '1',
            image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop',
            title: 'Master English with Voice Calls',
            description: 'Practice real conversations with native speakers and improve your fluency',
            ctaText: 'Start Calling',
            ctaLink: '/voice-calls'
        },
        {
            id: '2',
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop',
            title: 'Interactive Learning Topics',
            description: 'Explore curated topics designed to enhance your language skills',
            ctaText: 'Browse Topics',
            ctaLink: '/topics'
        },
        {
            id: '3',
            image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=400&fit=crop',
            title: 'Test Your Knowledge',
            description: 'Take quizzes and track your progress with detailed analytics',
            ctaText: 'Take Quiz',
            ctaLink: '/quizzes'
        },
        {
            id: '4',
            image: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=1200&h=400&fit=crop',
            title: 'Perfect Your Pronunciation',
            description: 'Get instant feedback on your pronunciation with AI-powered analysis',
            ctaText: 'Try Now',
            ctaLink: '/pronunciation'
        }
    ];

    // Sync tab param with state
    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // Update URL when tab changes
    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const tabs = [
        { id: 'voice' as TabType, label: 'Voice Calls', icon: Phone },
        { id: 'topics' as TabType, label: 'Topics', icon: BookOpen },
        { id: 'quizzes' as TabType, label: 'Quizzes', icon: CheckSquare },
        { id: 'pronunciation' as TabType, label: 'Pronunciation', icon: Mic },
    ];

    const handleSwipe = (direction: 'left' | 'right') => {
        const currentIndex = tabs.findIndex(t => t.id === activeTab);
        if (currentIndex === -1) return;

        if (direction === 'left' && currentIndex < tabs.length - 1) {
            handleTabChange(tabs[currentIndex + 1].id);
        } else if (direction === 'right' && currentIndex > 0) {
            handleTabChange(tabs[currentIndex - 1].id);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'topics':
                return <UserTopicBrowser />;
            case 'quizzes':
                return <UserQuizInterface />;
            case 'voice':
                return <UserVoiceCall />;
            case 'pronunciation':
                return <UserPronunciation />;
            default:
                return <UserTopicBrowser />;
        }
    };

    const { isContentLocked, isExplicitlyCancelled } = useUsageLimits();

    return (
        <UserLayout>
            <div className="max-w-7xl mx-auto relative max-w-full overflow-x-hidden">
                {/* Header */}
                <motion.div
                    variants={slideUp}
                    initial="initial"
                    animate="animate"
                    className="mb-8 md:mb-12"
                >
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-50 mb-4 tracking-tighter leading-tight">
                        LEARNING <span className="text-primary-600 dark:text-primary-400 uppercase tracking-wider">DASHBOARD</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                        Elite standard language mastery at your fingertips.
                    </p>
                </motion.div>

                {/* Dashboard Carousel */}
                <DashboardCarousel slides={carouselSlides} autoPlayInterval={5000} />

                {/* Navigation Tabs - Professional Glass System */}
                <motion.div
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.2 }}
                    className="mb-8 md:mb-12 sticky top-20 z-30"
                >
                    <div className="glass-panel p-2 rounded-[2rem] shadow-2xl border border-white/10">
                        <div className="flex overflow-x-auto scrollbar-hide gap-2 p-1 bg-slate-200/20 dark:bg-white/5 rounded-[1.75rem]">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <motion.button
                                        key={tab.id}
                                        whileHover={{ y: -1 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black transition-all flex-1 min-w-[150px] uppercase tracking-[0.2em] text-[10px] sm:text-xs ${isActive
                                            ? 'bg-white dark:bg-blue-600 text-primary-600 dark:text-white shadow-2xl shadow-primary-500/20 dark:shadow-blue-500/20'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isActive ? 'scale-110' : 'opacity-70'}`} />
                                        <span className="leading-tight">{tab.label}</span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Content Area - VISIBLY LOCKED IF EXPIRED */}
                <div className="relative min-h-[50vh]">
                    {/* Lock Overlay - Smaller Popup, Transparent Background */}
                    {isContentLocked && (
                        <div
                            className="absolute inset-0 z-50 flex items-center justify-center cursor-not-allowed"
                            onClick={(e) => {
                                e.stopPropagation();
                                triggerUpgradeModal();
                            }}
                        >
                            {/* Smaller, centered "Toast-like" card */}
                            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-primary-100 dark:border-red-900 flex flex-col items-center max-w-sm mx-4 animate-in fade-in zoom-in duration-500">
                                <div className="w-16 h-16 bg-primary-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-primary-500 dark:text-red-400 shadow-inner">
                                    <Wallet size={32} />
                                </div>
                                <h3 className="text-xl font-extrabold text-primary-500 mb-2">
                                    {isExplicitlyCancelled ? 'No Active Plan' : 'Trial Expired'}
                                </h3>
                                <p className="text-base text-slate-600 dark:text-slate-400 text-center mb-6 leading-relaxed font-medium">
                                    {isExplicitlyCancelled
                                        ? "You don't have any active plan."
                                        : "Your free trial has ended."}
                                    <br />
                                    Please subscribe to unlock content.
                                </p>
                                <motion.button
                                    whileHover="hover"
                                    whileTap="tap"
                                    variants={buttonClick}
                                    className="px-8 py-3 bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all w-full uppercase tracking-widest text-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/subscriptions');
                                    }}
                                >
                                    Choose Plan
                                </motion.button>
                            </div>
                        </div>
                    )}

                    {/* Content is rendered but interactions prevented if locked */}
                    {/* Added select-none and pointer-events-none to prevent interaction */}
                    {/* Added slight blur and grayscale to indicate specific "disabled" state without hiding content */}
                    <motion.div
                        className={`transition-all duration-300 ${isContentLocked ? 'opacity-60 blur-[2px] pointer-events-none select-none grayscale-[0.3]' : ''}`}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            const threshold = 50;
                            if (info.offset.x < -threshold) {
                                handleSwipe('left');
                            } else if (info.offset.x > threshold) {
                                handleSwipe('right');
                            }
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </UserLayout>
    );
};

export default DashboardPage;
