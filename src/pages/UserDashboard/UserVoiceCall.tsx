import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, Clock, History, RefreshCw, ArrowLeft, ChevronDown, CheckCircle } from 'lucide-react';
import callsService from '../../services/calls';
import Button from '../../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../../store/uiSlice';
import { useUsageLimits } from '../../hooks/useUsageLimits';
import { useVoiceCall } from '../../hooks/useVoiceCall';
import VoiceCallTimer from '../../components/VoiceCallTimer';
import UserStatusIndicator from '../../components/UserStatusIndicator';
import OnlineStatusIndicator from '../../components/OnlineStatusIndicator';
import { RootState } from '../../store';
import { callLogger } from '../../utils/callLogger';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp, buttonClick, cardHover, staggerContainer } from '../../constants/animations';

const UserVoiceCall: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state: RootState) => state.auth);
    const { initiateCall } = useVoiceCall();
    const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [userStatus, setUserStatus] = useState('online');
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [findingPartner, setFindingPartner] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showVoiceCallLimitModal, setShowVoiceCallLimitModal] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const statusRef = useRef<HTMLDivElement>(null);

    const {
        hasActiveSubscription,
        isTrialActive,
        isFreeTrial,
        voiceCallRemainingSeconds,
        hasVoiceCallTimeRemaining,
        voiceCallLimitSeconds,
        triggerUpgradeModal,
    } = useUsageLimits();

    const handleRandomCall = async () => {
        if (findingPartner) return;

        // Check voice call time limit BEFORE showing privacy modal
        if (voiceCallLimitSeconds !== -1 && !hasVoiceCallTimeRemaining) {
            callLogger.warning('Call blocked: No remaining call time');
            setShowVoiceCallLimitModal(true);
            return;
        }

        // Check if user has trial access or subscription
        if (!hasActiveSubscription && !isTrialActive) {
            callLogger.warning('Call blocked: No active subscription or trial');
            triggerUpgradeModal();
            dispatch(showToast({ message: 'Trial expired. Upgrade to Pro for unlimited calls!', type: 'warning' }));
            return;
        }

        setFindingPartner(true);

        // Minimal UX delay to make it feel like "searching"
        await new Promise(resolve => setTimeout(resolve, 1500));

        let usersToPickFrom = availableUsers;

        // If no users, try one quick refresh
        if (usersToPickFrom.length === 0) {
            callLogger.info('No local users, trying forced refresh before random pick');
            await fetchAvailableUsers({ silent: true });
        }

        if (availableUsers.length === 0) {
            dispatch(showToast({ message: 'No online users found. Please try again.', type: 'warning' }));
            setFindingPartner(false);
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableUsers.length);
        const randomUser = availableUsers[randomIndex];

        callLogger.info('🎲 Selected random partner', {
            userId: randomUser.userId || randomUser.id,
            name: randomUser.fullName
        });

        await handleInitiateCall(randomUser.userId || randomUser.id);
        setFindingPartner(false);
    };

    const fetchAvailableUsers = async (options?: { silent?: boolean }) => {
        try {
            if (!options?.silent) setLoading(true);
            callLogger.debug('Fetching available users');

            const res = await callsService.availableUsers({ limit: 1000 });

            // Log the full response structure to understand what we're getting
            if (!options?.silent) callLogger.debug('Available users API response:', res);

            // Try multiple ways to extract the data
            let items = [];

            if (Array.isArray(res)) {
                items = res;
                if (!options?.silent) callLogger.debug('Data extracted: Direct array');
            } else if ((res as any)?.data) {
                items = Array.isArray((res as any).data) ? (res as any).data : [(res as any).data];
                if (!options?.silent) callLogger.debug('Data extracted: From res.data');
            } else if ((res as any)?.items) {
                items = (res as any).items;
                if (!options?.silent) callLogger.debug('Data extracted: From res.items');
            } else {
                items = [res];
                if (!options?.silent) callLogger.debug('Data extracted: Wrapped response');
            }

            // Filter to show only online users with active subscriptions/trials and EXCLUDE current user
            const onlineUsers = items.filter((user: any) => {
                if (!user) return false;

                // Exclude current user from list
                if (user.userId === currentUser?.id || user.id === currentUser?.id) return false;

                // STRICT: Only show users who are explicitly online
                let isOnline = false;
                if (user.isOnline !== undefined) {
                    isOnline = user.isOnline === true;
                } else if (user.status === 'online' || user.status === 'Online') {
                    isOnline = true;
                } else if (user.availability === 'Online') {
                    isOnline = true;
                }

                // If not online, exclude immediately
                if (!isOnline) return false;

                // NEW: Check subscription/trial status to exclude expired users
                const subStatus = (user.subscriptionStatus || user.subscription?.status || '').toLowerCase();

                // Exclude users with explicitly expired, cancelled, or past_due subscriptions
                if (subStatus === 'expired' || subStatus === 'cancelled' || subStatus === 'past_due') {
                    callLogger.debug(`Filtering out user ${user.userId || user.id}: subscription status is ${subStatus}`);
                    return false;
                }

                // Check if trial has expired
                if (user.trialEndDate) {
                    const trialEnd = new Date(user.trialEndDate);
                    const now = new Date();

                    // If trial expired and no active subscription, exclude
                    if (now >= trialEnd && subStatus !== 'active' && subStatus !== 'trialing' && subStatus !== 'succeeded') {
                        callLogger.debug(`Filtering out user ${user.userId || user.id}: trial expired and no active subscription`);
                        return false;
                    }
                }

                // User is online and has valid subscription/trial
                return true;
            });

            if (!options?.silent) callLogger.info(`Found ${onlineUsers.length} available users out of ${items.length} total`);

            setAvailableUsers(onlineUsers);
            setLastUpdated(new Date());
        } catch (error: any) {
            callLogger.error('Failed to fetch available users', error);
        } finally {
            if (!options?.silent) setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            setLoading(true);
            callLogger.debug('Fetching call history');
            // FIX: Use pageSize instead of limit as per Swagger
            const res = await callsService.history({ pageSize: 100 });

            // Handle flat array response directly from Swagger example
            const items = (res as any)?.data || (Array.isArray(res) ? res : (res as any)?.items) || [];

            callLogger.info(`Found ${items.length} call history items`);
            setHistory(items);
        } catch (error) {
            callLogger.error('Failed to fetch call history', error);
        } finally {
            setLoading(false);
        }
    };

    // Close status dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
                setStatusOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusChange = (newStatus: string) => {
        setUserStatus(newStatus);
        setStatusOpen(false);
        if (newStatus === 'online' || newStatus === 'offline') {
            callsService.updateAvailability(newStatus === 'online' ? 'Online' : 'Offline')
                .catch(err => console.error('Failed to update availability', err));
        }
    };

    const statusOptions = [
        { id: 'online', label: 'ONLINE', color: 'bg-green-500', text: 'text-green-500' },
        { id: 'offline', label: 'OFFLINE', color: 'bg-slate-500', text: 'text-slate-500' },
        { id: 'busy', label: 'BUSY', color: 'bg-amber-500', text: 'text-amber-500' },
    ];

    const currentStatusConfig = statusOptions.find(o => o.id === userStatus) || statusOptions[1];

    // Poll for updates and maintain 'Online' status
    useEffect(() => {
        if (activeTab === 'available') {
            fetchAvailableUsers(); // Initial load (shows loader)

            let pollCount = 0;
            const interval = setInterval(() => {
                pollCount++;
                fetchAvailableUsers({ silent: true }); // Silent poll

                // Every 6 polls (30 seconds), re-assert Online status (Heartbeat)
                if (pollCount % 6 === 0) {
                    callsService.updateAvailability('Online').catch(err =>
                        callLogger.warning('Heartbeat failed', err)
                    );
                }
            }, 5000);

            return () => clearInterval(interval);
        } else {
            fetchHistory();
        }
    }, [activeTab]);

    const handleInitiateCall = async (userId: string) => {
        callLogger.info('🎯 User clicked Call button', {
            targetUserId: userId,
            currentUserId: currentUser?.id
        });

        // STRICT: Check if user has trial access or subscription FIRST
        if (!hasActiveSubscription && !isTrialActive) {
            callLogger.warning('Call blocked: No active subscription or trial');
            triggerUpgradeModal();
            dispatch(showToast({ message: 'Your free trial has expired. Upgrade to continue calling!', type: 'error' }));
            return;
        }

        // Check session time limit (only if not unlimited)
        if (voiceCallLimitSeconds !== -1 && !hasVoiceCallTimeRemaining) {
            callLogger.warning('Call blocked: No remaining call time');
            setShowVoiceCallLimitModal(true);
            return;
        }

        // Check if target user is online
        const targetUser = availableUsers.find(u => (u.userId || u.id) === userId);
        if (!targetUser) {
            callLogger.warning('Call blocked: Target user is offline or not available');
            dispatch(showToast({ message: 'This user is currently offline. Please try again later.', type: 'error' }));
            return;
        }

        callLogger.info('✅ Subscription and time checks passed, initiating call');
        callLogger.debug('User ID being sent as calleeId:', userId);

        // Debug payload
        const payload = { calleeId: userId };
        callLogger.debug('Sending payload to backend:', JSON.stringify(payload));

        // Use the new hook to initiate the call
        const result = await initiateCall(userId);

        if (result.success) {
            callLogger.info('✅ Call initiated successfully from UserVoiceCall', {
                callId: result.callId
            });
            dispatch(showToast({ message: 'Calling...', type: 'info' }));
        } else {
            // Extract detailed error message
            const apiError = result.error as any;
            const errorMessage = apiError?.response?.data?.message ||
                apiError?.response?.data?.elements?.[0]?.errorMessage || // Common validation error structure
                apiError?.message ||
                'Failed to initiate call';

            const validationErrors = apiError?.response?.data?.errors; // standard .NET validation errors

            callLogger.error('❌ Failed to initiate call from UserVoiceCall', {
                error: apiError,
                message: errorMessage,
                validationErrors
            });

            dispatch(showToast({
                message: errorMessage,
                type: 'error'
            }));
        }
    };

    const formatLastActive = (lastActiveTime?: string) => {
        if (!lastActiveTime) return 'Just now';

        const now = new Date();
        // Ensure the date is treated as UTC if no timezone offset is provided
        const timeStr = lastActiveTime.endsWith('Z') ? lastActiveTime : `${lastActiveTime}Z`;
        const lastActive = new Date(timeStr);
        const diffMs = now.getTime() - lastActive.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header with Session Timer */}
            <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="flex flex-col sm:flex-row items-center justify-between gap-6 glass-panel p-6 rounded-[2rem]"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-600 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Phone className="w-6 h-6 text-white dark:text-[#030014]" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                            {activeTab === 'available' ? 'PRACTICE HUB' : 'CALL HISTORY'}
                        </h3>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                            Global Fluency Network
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {/* Session Timer/Status */}
                    {activeTab === 'available' && (
                        hasActiveSubscription ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">
                                    Unlimited Access
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                                <Clock className="w-4 h-4 text-primary-500" />
                                <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                                    {Math.floor(voiceCallRemainingSeconds / 60)}:{String(voiceCallRemainingSeconds % 60).padStart(2, '0')} LEFT
                                </span>
                            </div>
                        )
                    )}

                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-full sm:w-auto border border-primary-500/5">
                        <motion.button
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex-1 sm:flex-none px-6 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest ${activeTab === 'available' ? 'bg-white dark:bg-white text-primary-600 dark:text-[#030014] shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-white'}`}
                            onClick={() => setActiveTab('available')}
                        >
                            Connect
                        </motion.button>
                        <motion.button
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex-1 sm:flex-none px-6 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest ${activeTab === 'history' ? 'bg-white dark:bg-white text-primary-600 dark:text-[#030014] shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-white'}`}
                            onClick={() => setActiveTab('history')}
                        >
                            History
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {activeTab === 'available' && (
                <div className="space-y-6 relative z-30">
                    {/* Status and Refresh */}
                    <motion.div
                        variants={fadeIn}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: 0.3 }}
                        className="relative z-30 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/40 dark:bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-primary-500/10 dark:border-white/5 shadow-sm overflow-visible"
                    >
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">Your Status:</span>
                            <div className="relative" ref={statusRef}>
                                <motion.button
                                    whileHover={{ y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setStatusOpen(!statusOpen)}
                                    className="flex items-center gap-3 bg-white/5 border border-white/5 text-[10px] font-black tracking-widest px-4 py-2.5 rounded-xl hover:bg-white/10 transition-all uppercase min-w-[130px] justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${currentStatusConfig.color} shadow-[0_0_8px_rgba(0,0,0,0.5)] ${userStatus === 'online' ? 'animate-pulse' : ''}`} />
                                        <span className={currentStatusConfig.text}>{currentStatusConfig.label}</span>
                                    </div>
                                    <ChevronDown size={12} className={`transition-transform duration-300 ${statusOpen ? 'rotate-180' : ''}`} />
                                </motion.button>

                                <AnimatePresence>
                                    {statusOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="absolute top-full mt-3 left-0 w-full glass-panel rounded-xl shadow-2xl py-2 z-50 border border-white/10"
                                        >
                                            {statusOptions.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleStatusChange(option.id)}
                                                    className={`w-full text-left px-4 py-2.5 text-[10px] font-black tracking-widest transition-all flex items-center gap-3 hover:bg-white/5 ${userStatus === option.id ? 'bg-primary-500/10 text-primary-500' : 'text-slate-400'}`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${option.color}`} />
                                                    {option.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black text-primary-500/60 uppercase tracking-[0.2em] whitespace-nowrap">
                                    {availableUsers.length} MEMBERS ONLINE
                                </span>
                            </div>
                            <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fetchAvailableUsers()}
                                className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-black uppercase tracking-widest text-[10px] hover:opacity-80 transition-opacity"
                            >
                                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                                <span>Sync</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Random Call Interface */}
                    <motion.div
                        variants={slideUp}
                        initial="initial"
                        animate="animate"
                        className="relative z-10 overflow-hidden flex flex-col items-center justify-center py-24 glass-panel rounded-[3rem] text-center"
                    >
                        {/* Decorative Background Gradients */}
                        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-600/10 rounded-full blur-[100px]" />
                            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary-500/10 rounded-full blur-[100px]" />
                        </div>

                        <div className="relative mb-8">
                            <div className="w-28 h-28 bg-primary-600 dark:bg-primary-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/40 rotate-6 transition-transform hover:rotate-0 duration-500">
                                <Phone className="w-12 h-12 text-white -rotate-6" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white dark:border-[#030014] flex items-center justify-center shadow-lg">
                                <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                            </div>
                        </div>

                        <h2 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-tight uppercase drop-shadow-md">
                            VOICE <br className="sm:hidden" /> <span className="text-primary-600 dark:text-primary-400">CONNECT</span>
                        </h2>

                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-lg mb-12 px-6 font-medium leading-relaxed">
                            Practice your natural English with online learners. <br className="hidden md:block" /> Real conversations, real progress.
                        </p>

                        <div className="flex flex-col items-center gap-6 w-full max-w-sm px-6">
                            <motion.div
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full"
                            >
                                <Button
                                    size="lg"
                                    className={`w-full h-16 text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-primary-500/20 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white border-none transition-all group ${findingPartner ? 'animate-pulse' : ''}`}
                                    onClick={() => {
                                        if (voiceCallLimitSeconds !== -1 && !hasVoiceCallTimeRemaining) {
                                            setShowVoiceCallLimitModal(true);
                                        } else if (!hasActiveSubscription && !isTrialActive) {
                                            triggerUpgradeModal();
                                        } else {
                                            setShowPrivacyModal(true);
                                        }
                                    }}
                                    disabled={findingPartner || loading || availableUsers.length === 0}
                                    leftIcon={findingPartner ? <RefreshCw className="animate-spin" /> : <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                >
                                    {findingPartner ? 'FINDING PARTNER...' : 'START SESSION'}
                                </Button>
                            </motion.div>

                            {availableUsers.length === 0 && !loading && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                                        Waiting for users...
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Privacy Notice Modal */}
                    <AnimatePresence>
                        {showPrivacyModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-primary-950/40 backdrop-blur-sm"
                                    onClick={() => setShowPrivacyModal(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-md w-full p-8 z-10 border border-primary-100 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-2 bg-primary-600 dark:bg-primary-500" />

                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-primary-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary-500 dark:text-primary-400 shadow-sm border border-primary-100">
                                            <User size={32} />
                                        </div>
                                        <h3 className="text-2xl font-black text-primary-500 dark:text-white uppercase tracking-tight">Privacy Notice</h3>
                                    </div>

                                    <div className="bg-secondary-200/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-secondary-400 mb-8">
                                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-bold uppercase tracking-wide opacity-80">
                                            Practice hub is for learning purposes only. EduTalks is not responsible for info shared. Avoid sharing sensitive data or private details.
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            variant="outline"
                                            className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-xs border-secondary-400 text-slate-500"
                                            onClick={() => setShowPrivacyModal(false)}
                                        >
                                            Decline
                                        </Button>
                                        <Button
                                            className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                                            onClick={() => {
                                                setShowPrivacyModal(false);
                                                handleRandomCall();
                                            }}
                                        >
                                            Connect
                                        </Button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-24 text-center">
                            <RefreshCw className="w-12 h-12 text-primary-500/20 animate-spin mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Syncing History...</p>
                        </div>
                    ) : history.length > 0 ? (
                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                            className="space-y-4"
                        >
                            {history.map((call) => {
                                // Map flat API fields
                                const startTime = call.initiatedAt || call.startTime;
                                const duration = call.durationSeconds !== undefined ? call.durationSeconds : call.duration;
                                const isIncoming = call.isIncoming;
                                const status = call.status || 'Unknown';

                                return (
                                    <motion.div
                                        key={call.callId || call.id}
                                        variants={fadeIn}
                                        whileHover={{ x: 5 }}
                                        className="p-4 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-primary-500/5 rounded-2xl flex items-center justify-between transition-all group hover:bg-white/60 dark:hover:bg-white/10"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${status === 'Completed' ? 'bg-green-500/10 text-green-600' :
                                                status === 'Missed' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-slate-500/10 text-slate-500'
                                                }`}>
                                                <Phone size={20} className={isIncoming ? "rotate-180" : ""} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                                    VOICE SESSION
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        {(() => {
                                                            const timeStr = startTime?.endsWith?.('Z') ? startTime : `${startTime}Z`;
                                                            const date = new Date(timeStr);
                                                            return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                                                        })()}
                                                    </span>
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border ${status === 'Missed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        status === 'Completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                                        }`}>{status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-primary-600 dark:text-primary-400 bg-primary-500/5 px-3 py-1 rounded-lg border border-primary-500/10 inline-flex items-center gap-2">
                                                <Clock size={12} />
                                                <span className="font-mono">
                                                    {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                <History size={24} />
                            </div>
                            <p className="text-slate-500">No call history found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Voice Call Limit Reached Modal */}
            <AnimatePresence>
                {showVoiceCallLimitModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-primary-950/60 backdrop-blur-md"
                            onClick={() => setShowVoiceCallLimitModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl max-w-lg w-full p-10 z-10 border border-primary-100 relative overflow-hidden text-center"
                        >
                            <div className="absolute top-0 left-0 w-full h-3 bg-primary-600 dark:bg-primary-500" />

                            <div className="mb-10">
                                <div className="w-24 h-24 bg-primary-50 dark:bg-indigo-900/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-primary-500 dark:text-primary-400 shadow-inner border border-primary-100 rotate-12">
                                    <Clock size={48} className="-rotate-12" />
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black text-primary-500 dark:text-white mb-3 tracking-tighter uppercase">
                                    Limit Reached
                                </h3>
                                <p className="text-lg text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest opacity-70">
                                    You've used your 5 free minutes
                                </p>
                            </div>

                            <div className="bg-secondary-200/50 dark:bg-slate-800/50 p-6 rounded-[2rem] mb-10 border border-secondary-400 text-left">
                                <p className="text-sm font-black text-primary-500 uppercase tracking-widest mb-4">
                                    YOUR ACTIVE BENEFITS:
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        'Full Pronunciation Access',
                                        'All Interactive Topics',
                                        'Unlimited Smart Quizzes'
                                    ].map((item, i) => (
                                        <motion.li
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * i }}
                                            key={i}
                                            className="flex items-center gap-4 text-slate-700 dark:text-slate-200"
                                        >
                                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="font-bold uppercase tracking-wider text-xs">{item}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-primary-500 p-8 rounded-[2rem] mb-10 shadow-xl shadow-primary-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                                <p className="text-xl font-black text-white uppercase tracking-tighter mb-2 italic">
                                    WANT UNLIMITED CALLS?
                                </p>
                                <p className="text-xs text-white/80 font-bold uppercase tracking-[0.15em]">
                                    UPGRADE TO PRO FOR UNLIMITED VOICE SESSIONS
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs border-secondary-400 text-slate-500"
                                    onClick={() => setShowVoiceCallLimitModal(false)}
                                >
                                    Later
                                </Button>
                                <motion.div
                                    whileHover="hover"
                                    whileTap="tap"
                                    variants={buttonClick}
                                    className="flex-1"
                                >
                                    <Button
                                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary-500 text-white shadow-xl shadow-primary-500/30 border-b-4 border-primary-700"
                                        onClick={() => {
                                            setShowVoiceCallLimitModal(false);
                                            navigate('/subscriptions');
                                        }}
                                    >
                                        UPGRADE NOW
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default UserVoiceCall;
