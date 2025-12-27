import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LogOut,
    Settings,
    Users,
    User,
    Ticket,
    ChevronDown
} from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { closeRatingModal } from '../store/callSlice';
import OnlineStatusIndicator from './OnlineStatusIndicator';
import TrialTimer from './TrialTimer';
import CallRatingModal from './voice-call/CallRatingModal';
import { useUsageLimits } from '../hooks/useUsageLimits';
import { LanguageSelector } from './common/LanguageSelector';
import { Logo } from './common/Logo';
import callsService from '../services/calls';
import { ThemeToggle } from './common/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';


interface UserLayoutProps {
    children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);
    const { showRatingModal, lastCompletedCall } = useSelector((state: RootState) => state.call);

    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement | null>(null);
    const {
        hasActiveSubscription,
        isFreeTrial,
        trialExpiresAt,
        triggerUpgradeModal,
        isContentLocked,
        isExplicitlyCancelled
    } = useUsageLimits();

    const handleLogout = async () => {
        try {
            await callsService.updateAvailability('Offline');
        } catch (error) {
            console.error('Failed to set status to Offline:', error);
        }
        dispatch(logout());
        navigate('/');
    };

    // Close profile dropdown when clicking outside or pressing Escape
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!profileRef.current) return;
            if (profileOpen && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && profileOpen) setProfileOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, [profileOpen]);

    const menuItems = [
        { icon: <Ticket size={18} />, label: 'Subscriptions', path: '/subscriptions' },
        { icon: <Users size={18} />, label: 'Referrals', path: '/referrals' },
        { icon: <User size={18} />, label: 'Profile', path: '/profile' },
        { icon: <Settings size={18} />, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="min-h-dvh flex flex-col relative overflow-hidden bg-[var(--bg-primary)]">
            {/* Background Decorative Elements - Dynamic Glows */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 dark:bg-primary-600/20 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-violet/10 dark:bg-accent-violet/20 rounded-full blur-[160px]" />
            </div>
            {/* Header */}
            <header className="sticky top-0 z-40 glass-panel border-b border-secondary-400 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 md:h-16">
                        {/* Logo */}
                        <div className="cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <Logo />
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 md:gap-4 h-full">
                            {/* Trial/Plan Status */}
                            {isExplicitlyCancelled ? (
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                                        No Active Plan
                                    </span>
                                </div>
                            ) : isContentLocked && !hasActiveSubscription ? (
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                                        Plan Expired
                                    </span>
                                </div>
                            ) : (
                                <TrialTimer
                                    trialExpiresAt={trialExpiresAt}
                                    hasActiveSubscription={hasActiveSubscription}
                                    isFreeTrial={isFreeTrial}
                                    onUpgrade={triggerUpgradeModal}
                                    planName={user?.subscriptionPlan}
                                />
                            )}

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Language Selector */}
                            <LanguageSelector />

                            {/* Profile Dropdown */}
                            <div className="h-full flex items-center relative" ref={profileRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 focus:outline-none relative min-h-[44px] min-w-[44px]"
                                >
                                    <div className="relative flex items-center gap-2 bg-slate-100/50 dark:bg-white/5 pl-1 pr-3 py-1 rounded-full border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all">
                                        <div className="relative">
                                            <img
                                                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`}
                                                alt="Profile"
                                                className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-slate-200 dark:border-white/10"
                                            />
                                            <OnlineStatusIndicator />
                                        </div >
                                        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                                    </div >
                                </button >

                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                            className="absolute right-0 top-full mt-3 w-[min(calc(100vw-2rem),16rem)] md:w-64 glass-card rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] py-3 z-[100] overflow-hidden border border-white/20 origin-top-right backdrop-blur-2xl bg-white/90 dark:bg-slate-900/95"
                                        >
                                            {/* Decorative Arrow */}
                                            <div className="absolute top-0 right-6 w-3 h-3 bg-white/90 dark:bg-slate-900/95 border-l border-t border-white/20 -translate-y-1.5 rotate-45 z-[1]" />

                                            <div className="px-6 py-2 border-b border-primary-500/10 mb-2 relative z-[2]">
                                                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] opacity-80">
                                                    Identity & Access Center
                                                </span>
                                            </div>

                                            <div className="px-6 py-3 mb-2 flex items-center gap-4 relative z-[2]">
                                                <img
                                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`}
                                                    alt="Profile"
                                                    className="w-10 h-10 rounded-xl border border-white/20 shadow-lg object-cover"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-primary-500 uppercase tracking-tighter italic truncate">
                                                        {user?.fullName}
                                                    </p>
                                                    <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 opacity-60">
                                                        Authorized Session
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="max-h-[60vh] overflow-y-auto px-2 space-y-0.5 relative z-[2]">
                                                {menuItems.map((item) => (
                                                    <button
                                                        key={item.path}
                                                        onClick={() => {
                                                            setProfileOpen(false);
                                                            navigate(item.path);
                                                        }}
                                                        className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-[10px] transition-all duration-300 rounded-xl group/item min-h-[44px] uppercase tracking-[0.15em] font-black ${location.pathname === item.path
                                                            ? 'text-primary-600 dark:text-primary-400 bg-primary-500/10 border border-primary-500/10'
                                                            : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/5 border border-transparent hover:border-primary-500/10'
                                                            }`}
                                                    >
                                                        <span className={`transition-transform duration-300 ${location.pathname === item.path ? 'scale-110' : 'group-hover/item:scale-110 opacity-70'}`}>
                                                            {item.icon}
                                                        </span>
                                                        <span className="truncate">{item.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="mt-2 px-2 border-t border-primary-500/10 pt-2 pb-1 relative z-[2]">
                                                <button
                                                    onClick={() => { setProfileOpen(false); handleLogout(); }}
                                                    className="w-full text-left flex items-center justify-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500/10 rounded-xl transition-all group/logout min-h-[44px] border border-transparent hover:border-red-500/10"
                                                >
                                                    <LogOut size={16} className="group-hover/logout:translate-x-1 transition-transform" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div >
                        </div >
                    </div >
                </div >
            </header >

            {/* Main Content */}
            < main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 overflow-x-hidden" >
                {children}
            </main >

            {/* Call Rating Modal */}
            {
                showRatingModal && lastCompletedCall && (
                    <CallRatingModal
                        callId={lastCompletedCall.callId}
                        partnerName={lastCompletedCall.partnerName}
                        onClose={() => dispatch(closeRatingModal())}
                    />
                )
            }
        </div >
    );
};

export default UserLayout;
