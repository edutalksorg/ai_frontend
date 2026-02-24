import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LogOut,
    Settings,
    Wallet,
    Users,
    User,
    Ticket,
    Home,
    Clock,
    Crown
} from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/uiSlice';
import { closeRatingModal } from '../store/callSlice';
import OnlineStatusIndicator from './OnlineStatusIndicator';
import TrialTimer from './TrialTimer';
import CallRatingModal from './voice-call/CallRatingModal';
import { useUsageLimits } from '../hooks/useUsageLimits';
import { LanguageSelector } from './common/LanguageSelector';
import { Logo } from './common/Logo';
import callsService from '../services/calls';
import { useTranslation } from 'react-i18next';
import BackgroundGraphics from './BackgroundGraphics';
import UpgradeModal from './UpgradeModal';

interface UserLayoutProps {
    children: React.ReactNode;
    hideNavbar?: boolean;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children, hideNavbar = false }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);
    const { theme } = useSelector((state: RootState) => state.ui);
    const { showRatingModal, lastCompletedCall } = useSelector((state: RootState) => state.call);
    const { modal } = useSelector((state: RootState) => state.ui);
    const { t } = useTranslation();

    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement | null>(null);
    const {
        hasActiveSubscription,
        isFreeTrial,
        trialExpiresAt,
        triggerUpgradeModal,
        closeUpgradeModal,
        showUpgradeModal,
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
        { icon: <Home size={18} />, label: t('nav.dashboard'), path: '/dashboard' },
        { icon: <Wallet size={18} />, label: t('nav.wallet'), path: '/wallet' },
        { icon: <Ticket size={18} />, label: t('nav.subscriptions'), path: '/subscriptions' },
        { icon: <Users size={18} />, label: t('nav.referrals'), path: '/referrals' },
        { icon: <User size={18} />, label: t('nav.profile'), path: '/profile' },
        { icon: <Settings size={18} />, label: t('nav.settings'), path: '/settings' },
    ];

    return (
        <div className="min-h-[100dvh] relative flex flex-col isolate overflow-x-hidden w-full">

            {/* Ambient Background */}
            <BackgroundGraphics />

            {/* Floating Glass Header */}
            {!hideNavbar && (
                <div className="sticky top-4 z-50 px-2 sm:px-4 md:px-6 lg:px-8 pointer-events-none">
                    <header className="glass-panel mx-auto max-w-7xl rounded-full pointer-events-auto transition-all duration-300 shadow-sm border border-gray-100">
                        <div className="px-3 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-2">
                            {/* Logo Area */}
                            <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/dashboard')}>
                                <Logo />
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-2 md:gap-4">
                                {/* Status Badges */}
                                {isExplicitlyCancelled ? (
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full animate-pulse">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-600 shadow-[0_0_8px_rgba(225,6,0,0.6)]" />
                                        <span className="text-xs font-semibold text-primary-700">
                                            {t('subscription.noActivePlan')}
                                        </span>
                                    </div>
                                ) : isContentLocked && !hasActiveSubscription ? (
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-full">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                                        <span className="text-xs font-semibold text-orange-600">
                                            {t('subscription.planExpired')}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="hidden sm:block">
                                        <TrialTimer
                                            trialExpiresAt={trialExpiresAt}
                                            hasActiveSubscription={hasActiveSubscription}
                                            isFreeTrial={isFreeTrial}
                                            onUpgrade={() => triggerUpgradeModal('voice-call')}
                                            planName={user?.subscriptionPlan}
                                        />
                                    </div>
                                )}



                                {/* Language Selector */}
                                <div className="rounded-lg px-2 flex items-center text-gray-600 hover:bg-gray-50 transition-colors">
                                    <LanguageSelector />
                                </div>

                                {/* Profile Dropdown */}
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 focus:outline-none relative transition-transform active:scale-95"
                                    >
                                        <div className="relative ring-2 ring-white/50 rounded-full shadow-sm">
                                            <img
                                                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=E10600&color=ffffff`}
                                                alt="Profile"
                                                className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                            />
                                            <div className="absolute bottom-0 right-0 border-[3px] border-white rounded-full">
                                                <OnlineStatusIndicator />
                                            </div>
                                        </div>
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 mt-3 w-64 rounded-2xl shadow-xl z-50 animate-slideUp origin-top-right overflow-hidden bg-white border border-gray-100">
                                            <div className="px-4 py-4 border-b border-gray-100 mb-2 bg-gray-50">
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {user?.fullName}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
                                                    {user?.email}
                                                </p>
                                            </div>

                                            {/* Subscription Mini Card */}
                                            <div className="px-3 mb-2">
                                                <div
                                                    onClick={() => {
                                                        setProfileOpen(false);
                                                        navigate('/profile?tab=subscriptions');
                                                    }}
                                                    className={`p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-sm border ${hasActiveSubscription
                                                        ? 'bg-gradient-to-br from-red-600 to-rose-700 border-red-500 text-white'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className={`p-1 rounded-lg ${hasActiveSubscription ? 'bg-white/20' : 'bg-gray-200'}`}>
                                                            <Crown size={14} className={hasActiveSubscription ? 'text-white' : 'text-gray-600'} />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                                                            {t('profilePage.currentPlanLabel')}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-extrabold truncate">
                                                            {user?.subscriptionPlan || t('profilePage.noActivePlan')}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${hasActiveSubscription ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                                                            <span className="text-[10px] font-medium opacity-90">
                                                                {hasActiveSubscription ? t('profilePage.active') : t('profilePage.noActivePlan')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                                {menuItems.map((item) => (
                                                    <button
                                                        key={item.path}
                                                        onClick={() => {
                                                            setProfileOpen(false);
                                                            navigate(item.path);
                                                        }}
                                                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-primary-600 transition-all border-l-2 border-transparent hover:border-primary-600"
                                                    >
                                                        {React.cloneElement(item.icon as any, { className: "opacity-70 group-hover:opacity-100" })}
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="mt-2 border-t border-gray-100 pt-2">
                                                <button
                                                    onClick={() => { setProfileOpen(false); handleLogout(); }}
                                                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut size={18} />
                                                    {t('nav.signOut')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>
                </div>
            )}

            {/* Main Content */}
            {/* Main Content */}
            <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 mt-4 animate-fadeIn user-select-none">
                {/* Mobile-only Trial Timer */}
                {!isExplicitlyCancelled && !hasActiveSubscription && (
                    <div className="block sm:hidden mb-6">
                        <TrialTimer
                            trialExpiresAt={trialExpiresAt}
                            hasActiveSubscription={hasActiveSubscription}
                            isFreeTrial={isFreeTrial}
                            onUpgrade={triggerUpgradeModal}
                            planName={user?.subscriptionPlan}
                        />
                    </div>
                )}
                {children}
            </main>

            {/* Call Rating Modal */}
            {showRatingModal && lastCompletedCall && (
                <CallRatingModal
                    callId={lastCompletedCall.callId}
                    partnerName={lastCompletedCall.partnerName}
                    partnerId={lastCompletedCall.partnerId}
                    onClose={() => dispatch(closeRatingModal())}
                />
            )}

            {/* Global Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={closeUpgradeModal}
                reason={modal?.data?.reason || 'general'}
            />
        </div>
    );
};

export default UserLayout;
