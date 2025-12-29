import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, Clock, History, RefreshCw, ArrowLeft, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

const UserVoiceCall: React.FC = () => {
    const { t } = useTranslation();
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
            dispatch(showToast({ message: t('voiceCall.trialExpired'), type: 'warning' }));
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
            dispatch(showToast({ message: t('voiceCall.userOffline'), type: 'warning' }));
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

                // STRICT STATUS CHECK: Only show users with status exactly 'Online'
                // This automatically excludes:
                // - 'Busy' users
                // - 'InCall' users (already in active calls)
                // - 'Offline' users
                const status = user.status || user.availability || '';
                const statusLower = status.toLowerCase();

                if (statusLower !== 'online') {
                    // Log why user was excluded for debugging
                    if (statusLower === 'busy' || statusLower === 'incall') {
                        callLogger.debug(`Excluding user ${user.userId || user.id} (${user.fullName}): status is ${status}`);
                    }
                    return false;
                }

                // Subscription/trial validation
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
            dispatch(showToast({ message: t('voiceCall.trialExpired'), type: 'error' }));
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
            dispatch(showToast({ message: t('voiceCall.userOffline'), type: 'error' }));
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
            dispatch(showToast({ message: t('voiceCall.calling'), type: 'info' }));
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

            // Auto-refresh available users if the error was due to user being busy
            const errorStr = typeof errorMessage === 'string' ? errorMessage.toLowerCase() : '';
            if (errorStr.includes('busy') ||
                errorStr.includes('in call') ||
                errorStr.includes('incall') ||
                errorStr.includes('another call') ||
                errorStr.includes('not joinable')) {
                callLogger.info('🔄 User was busy, refreshing available users list');
                fetchAvailableUsers({ silent: true });
            }

            dispatch(showToast({
                message: errorMessage,
                type: 'error'
            }));
        }
    };

    const formatLastActive = (lastActiveTime?: string) => {
        if (!lastActiveTime) return t('voiceCall.justNow');

        const now = new Date();
        // Ensure the date is treated as UTC if no timezone offset is provided
        const timeStr = lastActiveTime.endsWith('Z') ? lastActiveTime : `${lastActiveTime}Z`;
        const lastActive = new Date(timeStr);
        const diffMs = now.getTime() - lastActive.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return t('voiceCall.justNow');
        if (diffMins < 60) return `${diffMins}m ${t('voiceCall.ago')}`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ${t('voiceCall.ago')}`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ${t('voiceCall.ago')}`;
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header with Session Timer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
                    {activeTab === 'available' ? t('voiceCall.availableUsers') : t('voiceCall.callHistory')}
                </h3>
                <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
                    {/* Session Timer/Status */}
                    {activeTab === 'available' && (
                        hasActiveSubscription ? ( // Paid subscribers see unlimited
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <Clock className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                <span className="text-xs text-green-900 dark:text-green-200 whitespace-nowrap font-medium">
                                    {t('voiceCall.unlimited')}
                                </span>
                            </div>
                        ) : ( // Free trial users see usage
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                                    {Math.floor((voiceCallLimitSeconds - voiceCallRemainingSeconds) / 60)}:{String((voiceCallLimitSeconds - voiceCallRemainingSeconds) % 60).padStart(2, '0')} {t('voiceCall.used')}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-600">/</span>
                                <span className={`text-sm font-mono font-bold ${!hasVoiceCallTimeRemaining ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                                    {Math.floor(voiceCallRemainingSeconds / 60)}:{String(voiceCallRemainingSeconds % 60).padStart(2, '0')} {t('voiceCall.left')}
                                </span>
                            </div>
                        )
                    )}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'available' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            onClick={() => setActiveTab('available')}
                        >
                            {t('voiceCall.available')}
                        </button>
                        <button
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                            onClick={() => setActiveTab('history')}
                        >
                            {t('voiceCall.history')}
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'available' && (
                <div className="space-y-4">
                    {/* Status and Refresh */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('voiceCall.status')}:</span>
                            <div className="relative">
                                {/* Status Dot Indicator */}
                                <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${userStatus === 'online' ? 'bg-green-500' :
                                    userStatus === 'offline' ? 'bg-red-500' :
                                        'bg-orange-500'
                                    }`} />
                                <select
                                    className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white py-1.5 pl-8 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm font-medium shadow-sm transition-colors hover:border-blue-400"
                                    value={userStatus}
                                    onChange={(e) => {
                                        const newStatus = e.target.value;
                                        setUserStatus(newStatus);
                                        // Sync with backend
                                        if (newStatus === 'online' || newStatus === 'offline') {
                                            callsService.updateAvailability(newStatus === 'online' ? 'Online' : 'Offline')
                                                .catch(err => console.error('Failed to update availability', err));
                                        }
                                    }}
                                >
                                    <option value="online">{t('voiceCall.online')}</option>
                                    <option value="offline">{t('voiceCall.offline')}</option>
                                    <option value="busy">{t('voiceCall.busy')}</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">
                                {availableUsers.length} {t('voiceCall.onlineUsers')}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => fetchAvailableUsers()} leftIcon={<RefreshCw size={14} className={loading ? "animate-spin" : ""} />}>
                                {t('voiceCall.refresh')}
                            </Button>
                        </div>
                    </div>

                    {/* Random Call Interface */}
                    <div className="flex flex-col items-center justify-center py-12 md:py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-center">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50/50 dark:ring-blue-900/10">
                            <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                            {t('voiceCall.randomCallTitle')}
                        </h2>

                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-md mb-6 md:mb-8 px-4">
                            {t('voiceCall.randomCallDesc')}
                        </p>

                        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                            <Button
                                size="lg"
                                className={`w-full h-14 text-lg shadow-lg shadow-blue-500/20 rounded-full ${findingPartner ? 'animate-pulse cursor-wait' : ''}`}
                                onClick={() => {
                                    // Check voice call limit first
                                    if (voiceCallLimitSeconds !== -1 && !hasVoiceCallTimeRemaining) {
                                        setShowVoiceCallLimitModal(true);
                                    } else if (!hasActiveSubscription && !isTrialActive) {
                                        triggerUpgradeModal();
                                    } else {
                                        setShowPrivacyModal(true);
                                    }
                                }}
                                disabled={findingPartner || loading || availableUsers.length === 0}
                                leftIcon={findingPartner ? <RefreshCw className="animate-spin" /> : <Phone />}
                            >
                                {findingPartner ? t('voiceCall.finding') : t('voiceCall.callRandom')}
                            </Button>

                            {availableUsers.length === 0 && !loading && (
                                <p className="text-sm text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg border border-amber-100 dark:border-amber-800">
                                    {t('voiceCall.noUsers')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Privacy Notice Modal */}
                    {showPrivacyModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                                <div className="text-center mb-6">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                                        <User size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('voiceCall.privacyTitle')}</h3>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                        {t('voiceCall.privacyDesc')}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowPrivacyModal(false)}
                                    >
                                        {t('voiceCall.cancel')}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        onClick={() => {
                                            setShowPrivacyModal(false);
                                            handleRandomCall();
                                        }}
                                    >
                                        {t('voiceCall.agree')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}


            {activeTab === 'history' && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-12 text-center text-slate-500">{t('voiceCall.loadingHistory')}</div>
                    ) : history.length > 0 ? (
                        <div className="space-y-3">
                            {history.map((call) => {
                                // Map flat API fields
                                const startTime = call.initiatedAt || call.startTime;
                                const duration = call.durationSeconds !== undefined ? call.durationSeconds : call.duration;
                                const isIncoming = call.isIncoming;
                                const status = call.status || 'Unknown';

                                return (
                                    <div key={call.callId || call.id} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between transition-hover hover:border-blue-300 dark:hover:border-blue-700">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-full ${status === 'Completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                                                status === 'Missed' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                                                    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                                }`}>
                                                {/* Direction Icon */}
                                                {isIncoming ? (
                                                    <div className="relative">
                                                        <Phone size={20} />
                                                        <ArrowLeft size={12} className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full" />
                                                    </div>
                                                ) : (
                                                    <Phone size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                                    {/* MASKED NAME as per request */}
                                                    Voice Call
                                                </h4>
                                                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                    <span>{(() => {
                                                        // Backend sends UTC time without 'Z', so we need to append it
                                                        const timeStr = startTime?.endsWith?.('Z') ? startTime : `${startTime}Z`;
                                                        const date = new Date(timeStr);
                                                        return date.toLocaleDateString();
                                                    })()}</span>
                                                    <span>•</span>
                                                    <span>{(() => {
                                                        // Backend sends UTC time without 'Z', so we need to append it
                                                        const timeStr = startTime?.endsWith?.('Z') ? startTime : `${startTime}Z`;
                                                        const date = new Date(timeStr);
                                                        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                    })()}</span>
                                                    {status && (
                                                        <>
                                                            <span>•</span>
                                                            <span className={
                                                                status === 'Missed' ? 'text-red-500 font-medium' :
                                                                    status === 'Completed' ? 'text-green-600 font-medium' : ''
                                                            }>{status === 'Missed' ? t('voiceCall.missed') : status === 'Completed' ? t('voiceCall.completed') : status}</span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1.5 text-sm font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                <Clock size={14} />
                                                <span>
                                                    {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                <History size={24} />
                            </div>
                            <p className="text-slate-500">{t('voiceCall.noHistory')}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Voice Call Limit Reached Modal */}
            {showVoiceCallLimitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                                <Clock size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                {t('voiceCall.limitReached')}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                {t('voiceCall.limitDesc')}
                            </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed mb-3">
                                {t('voiceCall.goodNews')}
                            </p>
                            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 ml-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                                    <span>AI Pronunciation Practice</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                                    <span>Topics & Learning Materials</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                                    <span>Quizzes & Assessments</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl mb-6 border border-indigo-200 dark:border-indigo-800">
                            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-2">
                                {t('voiceCall.wantUnlimited')}
                            </p>
                            <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                {t('voiceCall.upgradeText')}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowVoiceCallLimitModal(false)}
                            >
                                {t('voiceCall.continuingTrial')}
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                onClick={() => {
                                    setShowVoiceCallLimitModal(false);
                                    navigate('/subscriptions');
                                }}
                            >
                                {t('voiceCall.upgradeNow')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserVoiceCall;

