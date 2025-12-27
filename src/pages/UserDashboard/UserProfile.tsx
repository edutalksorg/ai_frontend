import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone, Save, Camera, Wallet, CreditCard, Users, Ticket, ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp, buttonClick } from '../../constants/animations';
import { usersService } from '../../services/users';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, updateUserSubscription } from '../../store/authSlice';
import { RootState } from '../../store';
import { showToast } from '../../store/uiSlice';
import UserWallet from './UserWallet';
import UserSubscriptions from './UserSubscriptions';
import UserReferrals from './UserReferrals';
import UserCoupons from './UserCoupons';
import { subscriptionsService } from '../../services/subscriptions';


type ProfileTabType = 'profile' | 'wallet' | 'subscriptions' | 'referrals' | 'coupons';

const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') as ProfileTabType;
    const [activeTab, setActiveTab] = useState<ProfileTabType>(tabParam || 'profile');

    const [profile, setProfile] = useState<any>(null);
    const [currentSubscription, setCurrentSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Form States
    const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    // Sync tab param with state
    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // Refresh profile when switching back to profile tab
    useEffect(() => {
        if (activeTab === 'profile' && !loading) {
            fetchProfile();
        }
    }, [activeTab]);

    // Update URL when tab changes
    const handleTabChange = (tab: ProfileTabType) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await usersService.getProfile();
            const data = (res as any)?.data || res;
            setProfile(data);
            setFormData({
                fullName: data.fullName || '',
                email: data.email || '',
                phone: data.phoneNumber || ''
            });

            // Dispatch updates to Redux immediately after fetch
            if (user) {
                dispatch(setUser({
                    ...user,
                    ...data,
                    id: user.id || data.userId,
                    role: user.role,
                    avatar: data.avatarUrl || user.avatar,
                    subscriptionStatus: data.subscriptionStatus || data.subscription?.status || user.subscriptionStatus,
                    subscriptionPlan: data.subscriptionPlan || data.subscription?.planName || data.subscription?.plan?.name || user.subscriptionPlan,
                }));
            }

            // Fetch Subscription (Handle 404/Empty safely)
            // If justSubscribed is true, poll aggressively
            const isJustSubscribed = (window.history.state?.usr?.justSubscribed) || (location.state as any)?.justSubscribed;

            console.log('🔍 Profile Page - Subscription Check:', {
                isJustSubscribed,
                locationState: location.state,
                historyState: window.history.state,
                userSubscriptionStatus: data.subscriptionStatus,
                userSubscriptionPlan: data.subscriptionPlan
            });

            let attempts = 0;
            // If just subscribed, retry up to 10 times (10 seconds), otherwise just once
            const maxAttempts = isJustSubscribed ? 10 : 1;
            let subFound = false;

            while (attempts < maxAttempts && !subFound) {
                try {
                    console.log(`🔄 Fetching subscription (attempt ${attempts + 1}/${maxAttempts})...`);
                    const subRes = await subscriptionsService.current();
                    const subData = (subRes as any)?.data || subRes;

                    console.log('📦 Subscription API Response:', {
                        raw: subRes,
                        extracted: subData,
                        hasStatus: !!subData?.status,
                        hasPlanId: !!subData?.planId,
                        status: subData?.status,
                        planName: subData?.planName || subData?.plan?.name
                    });

                    // Only set if we have valid data
                    if (subData && (subData.status || subData.planId)) {
                        // If we are waiting for a NEW subscription, ensure it is actually active/trialing
                        // before accepting it, to avoid picking up an old cancelled one if backend hasn't updated
                        if (isJustSubscribed && !['active', 'trialing', 'succeeded'].includes(subData.status?.toLowerCase())) {
                            console.log(`⏳ Subscription found but status is "${subData.status}", waiting for active/trialing...`);
                            throw new Error("Subscription found but not active yet");
                        }

                        console.log('✅ Valid subscription found:', subData);
                        setCurrentSubscription(subData);
                        subFound = true; // Exit loop

                        // Dispatch subscription update immediately
                        dispatch(updateUserSubscription({
                            subscriptionStatus: subData.status,
                            subscriptionPlan: subData.plan?.name || subData.planName,
                            trialEndDate: subData.endDate || subData.renewalDate
                        }));

                        // Force update local profile state to match if needed
                        if (isJustSubscribed) {
                            dispatch(showToast({ message: "Subscription verified!", type: "success" }));
                        }
                    } else {
                        console.log('❌ No valid subscription data found');
                        setCurrentSubscription(null);
                    }
                } catch (e) {
                    console.log(`❌ Subscription fetch attempt ${attempts + 1} failed:`, e);
                    if (attempts === maxAttempts - 1) {
                        // FALLBACK: Use subscription data from user profile if API fails
                        console.log('🔍 Checking user profile for subscription data:', {
                            subscriptionStatus: data.subscriptionStatus,
                            subscriptionPlan: data.subscriptionPlan,
                            subscription: data.subscription
                        });

                        if (data.subscriptionStatus || data.subscription) {
                            console.log('💡 Using subscription data from user profile as fallback');
                            const fallbackSub = {
                                status: data.subscriptionStatus || data.subscription?.status,
                                planName: data.subscriptionPlan || data.subscription?.planName || data.subscription?.plan?.name,
                                plan: data.subscription?.plan || { name: data.subscriptionPlan },
                                renewalDate: data.subscription?.renewalDate || data.subscription?.endDate,
                                endDate: data.subscription?.endDate
                            };
                            console.log('📦 Fallback subscription:', fallbackSub);
                            setCurrentSubscription(fallbackSub);
                            subFound = true;
                        } else {
                            console.log('❌ No subscription data available in user profile either');
                            setCurrentSubscription(null);
                        }
                    } else {
                        // Wait 1 second before retry
                        await new Promise(r => setTimeout(r, 1000));
                    }
                }
                attempts++;
            }

        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setLoading(false);
        }
    };

    // Removed sync useEffect to avoid infinite loops and stale closures. 
    // Dispatch is now handled in fetchProfile.

    const handleUpdateProfile = async () => {
        try {
            const updatedProfile = await usersService.updateProfile({
                fullName: formData.fullName,
                phoneNumber: formData.phone
            });

            // Use returned data or fall back to local form data
            const mergedProfile = {
                ...profile,
                ...updatedProfile, // If API returns the object
                fullName: formData.fullName, // Ensure local values take precedence if API void/partial
                phoneNumber: formData.phone
            };

            setProfile(mergedProfile);

            // Dispatch to Redux
            if (user) {
                dispatch(setUser({
                    ...user,
                    ...mergedProfile,
                    id: user.id
                }));
            }

            dispatch(showToast({ message: 'Profile updated successfully', type: 'success' }));
            setIsEditing(false);

            // Optional: Re-fetch silently if needed, but we trust the update
            // fetchProfile(); 
        } catch (error) {
            console.error('Update profile failed:', error);
            dispatch(showToast({ message: 'Failed to update profile', type: 'error' }));
        }
    };

    const tabs = [
        { id: 'profile' as ProfileTabType, label: 'Profile', icon: User },
        { id: 'wallet' as ProfileTabType, label: 'Wallet', icon: Wallet },
        { id: 'subscriptions' as ProfileTabType, label: 'Subscriptions', icon: CreditCard },
        { id: 'referrals' as ProfileTabType, label: 'Referrals', icon: Users },
        { id: 'coupons' as ProfileTabType, label: 'Coupons', icon: Ticket },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'wallet':
                return <UserWallet />;
            case 'subscriptions':
                return <UserSubscriptions />;
            case 'referrals':
                return <UserReferrals />;
            case 'coupons':
                return <UserCoupons />;
            case 'profile':
            default:
                return renderProfileContent();
        }
    };

    const renderProfileContent = () => {
        if (loading) return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accessing Profile Data...</p>
            </div>
        );
        if (!profile) return null;

        return (
            <motion.div
                variants={slideUp}
                initial="initial"
                animate="animate"
                className="max-w-4xl mx-auto space-y-8"
            >
                {/* Profile Header Card */}
                <div className="glass-card backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-primary-500/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="relative group">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-white/5 overflow-hidden border-4 border-white/10 shadow-2xl relative"
                            >
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl font-black text-slate-700">
                                        {profile.fullName?.charAt(0) || 'U'}
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="text-white w-8 h-8" />
                                </div>
                            </motion.div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-primary-600 rounded-xl shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                            >
                                <Camera size={20} />
                            </motion.button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight uppercase">
                                    {profile.fullName}
                                </h2>
                                <p className="text-lg font-medium text-slate-500 dark:text-slate-400 mt-1">{profile.email}</p>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="px-5 py-2 bg-primary-600/10 border border-primary-600/20 text-primary-600 dark:text-primary-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    {profile.role?.toUpperCase() || 'ELITE MEMBER'}
                                </span>
                                {profile.isVerified && (
                                    <span className="px-5 py-2 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        VERIFIED IDENTITY
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Status Card - Improved UI */}
                <div className="glass-card relative overflow-hidden rounded-3xl p-6 md:p-10 border border-primary-500/10 shadow-2xl transition-all duration-500">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-primary-600" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Current Subscription</h3>
                            </div>
                            <div>
                                <h4 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-tight">
                                    {currentSubscription?.plan?.name?.toUpperCase() || currentSubscription?.planName?.toUpperCase() || 'STANDARD ACCESS'}
                                </h4>
                                {currentSubscription && (
                                    <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-slate-500 opacity-70">
                                        {['active', 'trialing', 'succeeded', 'year'].includes(currentSubscription?.status?.toLowerCase() || '') ? 'RENEWS' : 'EXPIRED'} ON {new Date(currentSubscription.renewalDate || currentSubscription.endDate || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button
                            size="md"
                            className="h-10 px-10 rounded-xl bg-primary-600 text-white font-black uppercase tracking-[0.2em] text-[8px] shadow-xl shadow-primary-500/20 hover:scale-105 transition-all border-none"
                            onClick={() => handleTabChange('subscriptions')}
                        >
                            {currentSubscription ? 'Manage Subscription' : 'Upgrade Account'}
                        </Button>
                    </div>
                </div>

                {/* Profile Information Form */}
                <div className="glass-card backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-primary-500/10 shadow-2xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-600/10 rounded-2xl flex items-center justify-center text-primary-600">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white uppercase tracking-tight leading-tight">Account Credentials</h3>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-70">Security & Identity Calibration</p>
                            </div>
                        </div>
                        {!isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="h-10 px-8 rounded-xl bg-primary-600 text-white font-black uppercase tracking-[0.2em] text-[8px] shadow-lg shadow-primary-500/20 hover:scale-105 transition-all"
                            >
                                Edit Profile
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div variants={fadeIn} className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                            <div className="relative group">
                                <User className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? 'text-primary-600' : 'text-slate-400'}`} size={18} />
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-14 pr-6 h-14 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-primary-500/5 focus:border-primary-600 focus:bg-white dark:focus:bg-white/10 transition-all font-bold text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide"
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={fadeIn} className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Primary Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full pl-14 pr-6 h-14 bg-white/[0.02] rounded-2xl border border-white/5 font-bold text-slate-500 dark:text-slate-600 cursor-not-allowed text-sm tracking-wide"
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={fadeIn} className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                            <div className="relative group">
                                <Phone className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? 'text-primary-600' : 'text-slate-400'}`} size={18} />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full pl-14 pr-6 h-14 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-primary-500/5 focus:border-primary-600 focus:bg-white dark:focus:bg-white/10 transition-all font-bold text-slate-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide"
                                />
                            </div>
                        </motion.div>
                    </div>

                    <AnimatePresence>
                        {isEditing && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex flex-col sm:flex-row gap-4 mt-12 pt-10 border-t border-primary-500/5"
                            >
                                <Button
                                    size="md"
                                    onClick={handleUpdateProfile}
                                    className="h-10 flex-1 sm:flex-none sm:w-40 rounded-xl bg-primary-600 text-white font-black uppercase tracking-[0.2em] text-[8px] shadow-lg shadow-primary-500/20 hover:scale-[1.02] transition-all border-none"
                                >
                                    Save
                                </Button>
                                <Button
                                    size="md"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            fullName: profile.fullName || '',
                                            email: profile.email || '',
                                            phone: profile.phoneNumber || ''
                                        });
                                    }}
                                    className="h-10 flex-1 sm:flex-none sm:w-40 rounded-xl border-primary-500/10 text-slate-500 dark:text-slate-400 uppercase font-black tracking-[0.22em] text-[8px] bg-slate-100 dark:bg-white/5"
                                >
                                    Cancel
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="flex items-center gap-8"
            >
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    className="w-14 h-14 flex items-center justify-center bg-slate-100 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-primary-500/10 dark:border-white/10 text-slate-900 dark:text-white transition-all hover:bg-slate-200 dark:hover:bg-white/10 shadow-2xl"
                >
                    <ArrowLeft size={24} />
                </motion.button>
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                        ACCOUNT <span className="text-primary-600 dark:text-primary-400">PROFILE</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 opacity-70">
                        Universal Command Hub & Personal Records
                    </p>
                </div>
            </motion.div>

            {/* Navigation Tabs - Consistent with Dashboard */}
            <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.1 }}
                className="sticky top-20 z-30"
            >
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-2 rounded-3xl border border-primary-500/10 dark:border-white/5 shadow-xl">
                    <div className="flex overflow-x-auto scrollbar-hide gap-2 p-1 bg-slate-100/50 dark:bg-white/5 rounded-2xl">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black transition-all flex-1 min-w-[160px] uppercase tracking-[0.2em] text-[10px] sm:text-xs ${isActive
                                        ? 'bg-white text-primary-600 shadow-lg shadow-primary-500/20'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isActive ? 'text-primary-600' : ''}`} />
                                    <span className="leading-tight">{tab.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default UserProfile;
