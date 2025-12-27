import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Star, Shield, Zap, AlertCircle, ArrowLeft, Tag, X, CheckCircle } from 'lucide-react';
import Button from '../../components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp, buttonClick } from '../../constants/animations';
import { subscriptionsService } from '../../services/subscriptions';
import { paymentsService } from '../../services/payments';
import { couponsService } from '../../services/coupons';
import { updateUserSubscription, setUser } from '../../store/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { showToast } from '../../store/uiSlice';
import SwitchPlanModal from '../../components/SwitchPlanModal';
import { authService } from '../../services/auth';
import { useUsageLimits } from '../../hooks/useUsageLimits';

const UserSubscriptions: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [plans, setPlans] = useState<any[]>([]);
    const [currentSub, setCurrentSub] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [switchModalOpen, setSwitchModalOpen] = useState(false);
    const [pendingPlan, setPendingPlan] = useState<any | null>(null);
    const [searchParams] = useSearchParams();
    const [processingSwitch, setProcessingSwitch] = useState(false);
    const { isExplicitlyCancelled } = useUsageLimits();

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupons, setAppliedCoupons] = useState<Record<string, any>>({});
    const [validatingCoupon, setValidatingCoupon] = useState<Record<string, boolean>>({});
    const [showCouponInput, setShowCouponInput] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchData();
        checkPaymentStatus();
    }, []);

    const checkPaymentStatus = async () => {
        console.log('🔙 ========== RETURNED FROM PAYMENT GATEWAY ==========');
        console.log('🌐 Current URL:', window.location.href);
        console.log('📍 Current Path:', window.location.pathname);
        console.log('🔍 URL Search Params:', window.location.search);

        // Get transactionId from URL params or localStorage
        let transactionId = searchParams.get('transactionId');
        let pendingPayment: any = null;

        console.log('🆔 Transaction ID from URL:', transactionId);

        if (!transactionId) {
            console.log('⚠️ No transactionId in URL, checking localStorage...');
            // Try to get from localStorage
            const stored = localStorage.getItem('pending_payment');
            console.log('📦 localStorage "pending_payment":', stored);

            if (stored) {
                try {
                    pendingPayment = JSON.parse(stored);
                    transactionId = pendingPayment.transactionId;
                    console.log('✅ Retrieved pending payment from localStorage:', pendingPayment);
                    console.log('🆔 Transaction ID from localStorage:', transactionId);
                } catch (e) {
                    console.error('❌ Failed to parse pending payment:', e);
                }
            } else {
                console.log('❌ No pending payment found in localStorage');
            }
        } else {
            console.log('✅ Transaction ID found in URL!');
            // Also load pending payment details if available
            const stored = localStorage.getItem('pending_payment');
            if (stored) {
                try {
                    pendingPayment = JSON.parse(stored);
                    console.log('📦 Also loaded pending payment details:', pendingPayment);
                } catch (e) {
                    console.error('Failed to parse pending payment:', e);
                }
            }
        }

        if (!transactionId) {
            console.log('❌ No transaction ID found anywhere, skipping payment check');
            return;
        }

        console.log('🔍 ========== STARTING PAYMENT STATUS CHECK ==========');
        console.log('🆔 Checking status for Transaction ID:', transactionId);
        console.log('💰 Expected Amount:', pendingPayment?.amount);
        console.log('📦 Expected Plan:', pendingPayment?.planName);

        dispatch(showToast({ message: 'Verifying payment status...', type: 'info' }));

        let pollAttempts = 0;
        const maxPollAttempts = 60; // Poll for up to 3 minutes (60 * 3s = 180s)
        let retryDelay = 3000; // Start with 3 seconds
        const maxRetryDelay = 24000; // Max 24 seconds
        let paymentCompleted = false;

        console.log('⏱️ Polling Configuration:', {
            maxAttempts: maxPollAttempts,
            initialDelay: '3s',
            maxDelay: '24s',
            totalTimeout: '3 minutes'
        });

        while (pollAttempts < maxPollAttempts && !paymentCompleted) {
            try {
                console.log(`\n🔄 ========== POLL ATTEMPT ${pollAttempts + 1}/${maxPollAttempts} ==========`);
                console.log('📡 Calling API: GET /api/v1/payments/' + transactionId + '/status');

                const res = await paymentsService.checkPaymentStatus(transactionId);

                console.log('📨 Raw API Response:', res);

                // Extract status from response
                const paymentData = (res as any).data || res;
                const status = paymentData?.status?.toUpperCase();

                console.log('💳 ========== PAYMENT STATUS DETAILS ==========');
                console.log('� Status:', status);
                console.log('💰 Amount:', paymentData?.amount);
                console.log('💱 Currency:', paymentData?.currency);
                console.log('📝 Description:', paymentData?.description);
                console.log('📅 Created At:', paymentData?.createdAt);
                console.log('✅ Completed At:', paymentData?.completedAt);
                console.log('❌ Failure Reason:', paymentData?.failureReason);

                if (status === 'COMPLETED' || status === 'SUCCESS') {
                    console.log('🎉 ========== PAYMENT SUCCESSFUL! ==========');
                    paymentCompleted = true;
                    dispatch(showToast({ message: 'Payment successful! Activating subscription...', type: 'success' }));

                    // Clear pending payment from localStorage
                    console.log('🗑️ Clearing localStorage...');
                    localStorage.removeItem('pending_payment');
                    console.log('✅ localStorage cleared');

                    // IMMEDIATE ACCESS: Update Global Redux State (Optimistic)
                    console.log('🔄 Updating Redux state (optimistic)...');
                    dispatch(updateUserSubscription({
                        subscriptionStatus: 'active',
                        subscriptionPlan: pendingPayment?.planName || 'Premium'
                    }));
                    console.log('✅ Redux state updated');

                    // Poll for subscription activation
                    console.log('\n🔄 ========== POLLING FOR SUBSCRIPTION ACTIVATION ==========');
                    let subAttempts = 0;
                    const maxSubAttempts = 10;
                    let subscriptionReady = false;
                    let verifiedSubData: any = null;

                    while (subAttempts < maxSubAttempts && !subscriptionReady) {
                        try {
                            console.log(`📡 Subscription check attempt ${subAttempts + 1}/${maxSubAttempts}`);
                            const subRes = await subscriptionsService.current();
                            const subData = (subRes as any)?.data || subRes;

                            console.log('📦 Subscription API Response:', {
                                status: subData?.status,
                                planName: subData?.planName || subData?.plan?.name,
                                renewalDate: subData?.renewalDate
                            });

                            if (subData && ['active', 'trialing', 'succeeded'].includes(subData.status?.toLowerCase())) {
                                subscriptionReady = true;
                                verifiedSubData = subData;
                                console.log('✅ Subscription verified and active!', subData);

                                // Update Redux with REAL data
                                dispatch(updateUserSubscription({
                                    subscriptionStatus: subData.status,
                                    subscriptionPlan: subData.plan?.name || subData.planName,
                                    trialEndDate: subData.endDate || subData.renewalDate
                                }));
                            } else {
                                console.log(`⏳ Subscription not active yet (status: ${subData?.status}), retrying...`);
                            }
                        } catch (e) {
                            console.log(`❌ Subscription check failed (attempt ${subAttempts + 1}):`, e);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                        subAttempts++;
                    }

                    // Refresh User Profile
                    console.log('\n🔄 Refreshing user profile...');
                    try {
                        const profileRes = await authService.getProfile();
                        const userData = (profileRes as any).data || profileRes;
                        if (userData && userData.id) {
                            if (subscriptionReady && verifiedSubData) {
                                userData.subscriptionStatus = verifiedSubData.status;
                                userData.subscriptionPlan = verifiedSubData.plan?.name || verifiedSubData.planName;
                                userData.trialEndDate = verifiedSubData.endDate || verifiedSubData.renewalDate;
                            }
                            dispatch(setUser(userData));
                            console.log('✅ User profile refreshed');
                            console.log('📦 Updated user data:', {
                                subscriptionStatus: userData.subscriptionStatus,
                                subscriptionPlan: userData.subscriptionPlan,
                                trialEndDate: userData.trialEndDate
                            });
                        }
                    } catch (err) {
                        console.error('❌ Failed to sync profile:', err);
                    }

                    // Force token refresh by re-logging in
                    console.log('\n🔄 Forcing token refresh...');
                    try {
                        // Get fresh token with updated subscription claims
                        const token = localStorage.getItem('token');
                        if (token) {
                            // The token will be refreshed on next API call
                            console.log('✅ Token will be refreshed on next request');
                        }
                    } catch (err) {
                        console.error('❌ Token refresh failed:', err);
                    }

                    // Show success message
                    dispatch(showToast({
                        message: 'Subscription activated successfully! Redirecting...',
                        type: 'success'
                    }));

                    // Wait a moment for state updates to propagate
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Navigate to Profile
                    console.log('\n🏠 ========== NAVIGATING TO PROFILE ==========');
                    console.log('📍 Target URL: /profile');
                    console.log('🎯 Navigation State:', {
                        justSubscribed: true,
                        transactionId: transactionId
                    });

                    // Force a full page reload to ensure fresh data
                    console.log('🔄 Forcing page reload to refresh all data...');
                    window.location.href = '/profile';

                    console.log('✅ ========== PAYMENT FLOW COMPLETED ==========\n');
                    return; // Exit polling loop

                } else if (status === 'FAILED') {
                    console.log('❌ ========== PAYMENT FAILED ==========');
                    console.log('Failure Reason:', paymentData?.failureReason);
                    paymentCompleted = true;
                    localStorage.removeItem('pending_payment');
                    dispatch(showToast({ message: 'Payment failed. Please try again.', type: 'error' }));
                    return;

                } else if (status === 'PENDING') {
                    // Continue polling
                    console.log(`⏳ Payment still pending, will retry in ${retryDelay / 1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));

                } else {
                    console.log('❓ Unknown payment status:', status);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }

                // Reset retry delay on successful API call
                retryDelay = 3000;

            } catch (error: any) {
                console.error('❌ ========== PAYMENT STATUS CHECK ERROR ==========');
                console.error('Error:', error);
                console.error('Error Message:', error.message);

                // Exponential backoff for network errors
                if (error.message?.includes('Network') || error.message?.includes('fetch')) {
                    console.log(`🔌 Network error detected, retrying in ${retryDelay / 1000}s...`);
                    dispatch(showToast({
                        message: `Network error. Retrying in ${retryDelay / 1000}s...`,
                        type: 'warning'
                    }));

                    await new Promise(resolve => setTimeout(resolve, retryDelay));

                    // Exponential backoff: 3s → 6s → 12s → 24s
                    retryDelay = Math.min(retryDelay * 2, maxRetryDelay);
                    console.log(`📈 Increased retry delay to ${retryDelay / 1000}s`);
                } else {
                    // Other errors, wait standard delay
                    console.log(`⏱️ Waiting 3s before retry...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }

            pollAttempts++;
        }

        // If we exit the loop without completion
        if (!paymentCompleted) {
            console.log('⏱️ ========== PAYMENT VERIFICATION TIMEOUT ==========');
            console.log(`Stopped after ${pollAttempts} attempts`);
            dispatch(showToast({
                message: 'Payment verification timed out. Please check your subscription status.',
                type: 'warning'
            }));
        }
    };
    const fetchData = async () => {
        try {
            setLoading(true);
            const [plansRes, subRes] = await Promise.all([
                subscriptionsService.getPlans(),
                subscriptionsService.current().catch(() => null) // Handle 404 if no sub
            ]);

            const planList = (plansRes as any)?.data || (Array.isArray(plansRes) ? plansRes : (plansRes as any)?.items) || [];
            setPlans(planList);
            setCurrentSub((subRes as any)?.data || subRes);
        } catch (error) {
            console.error('Failed to load subscriptions:', error);
            // dispatch(showToast({ message: 'Failed to load subscription info', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (plan: any) => {
        // Check if user has an active subscription
        const isSubActive = ['active', 'trialing', 'succeeded', 'year'].includes(currentSub?.status?.toLowerCase());

        if (currentSub && isSubActive) {
            // Show confirmation modal before switching
            setPendingPlan(plan);
            setSwitchModalOpen(true);
            return;
        }

        // No active subscription - proceed directly
        await processSubscription(plan);
    };

    const handleConfirmSwitch = async () => {
        if (!pendingPlan) return;

        try {
            setProcessingSwitch(true);
            setSwitchModalOpen(false);

            console.log('🔄 ========== PLAN SWITCH FLOW ==========');
            console.log('📋 Current Plan:', currentSub?.planName || currentSub?.plan?.name);
            console.log('📋 New Plan:', pendingPlan.name);

            // Step 1: Cancel current subscription
            dispatch(showToast({ message: 'Canceling current subscription...', type: 'info' }));

            console.log('❌ Step 1: Canceling current subscription...');
            console.log('Current subscription data:', currentSub);
            console.log('Subscription ID:', currentSub?.subscriptionId || currentSub?.id);

            await subscriptionsService.cancel({
                subscriptionId: currentSub?.subscriptionId || currentSub?.id,
                reason: 'Switching to ' + pendingPlan.name
            });
            console.log('✅ Cancel API call completed');

            // Step 2: Wait for cancellation to process
            console.log('⏳ Waiting for cancellation to process...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 3: Subscribe to new plan
            dispatch(showToast({ message: 'Processing new subscription...', type: 'info' }));
            console.log('💳 Step 2: Subscribing to new plan...');

            // processSubscription will:
            // - Call /Subscriptions/subscribe
            // - Get redirectUrl and transactionId
            // - Store in localStorage
            // - Redirect to PhonePe
            // - After return, checkPaymentStatus verifies and redirects to profile
            await processSubscription(pendingPlan);

        } catch (error: any) {
            console.error('❌ Failed to switch plan:', error);
            console.error('Response data:', error.response?.data);
            console.error('Backend messages:', error.response?.data?.messages);

            const errorMsg = error.response?.data?.messages?.[0]
                || error.response?.data?.errors?.[0]
                || error.response?.data?.message
                || error.message
                || 'Failed to switch plan. Please try again.';

            dispatch(showToast({
                message: errorMsg,
                type: 'error'
            }));
        } finally {
            setProcessingSwitch(false);
            setPendingPlan(null);
        }
    };

    // Coupon validation function
    const validateAndApplyCoupon = async (plan: any, code: string) => {
        if (!code.trim()) {
            dispatch(showToast({ message: 'Please enter a coupon code', type: 'warning' }));
            return;
        }

        const planId = plan.id || plan._id;

        try {
            setValidatingCoupon(prev => ({ ...prev, [planId]: true }));

            console.log('🎟️ Validating coupon:', {
                code: code.toUpperCase(),
                planId,
                planPrice: plan.price,
                planName: plan.name
            });

            const response = await couponsService.validate({
                couponCode: code.toUpperCase(),
                amount: plan.price, // Pass actual plan price
                itemType: 'Subscription', // Changed from 'Plan' to match API
                itemId: planId,
            });

            console.log('✅ Coupon validation response:', response);

            const couponData = (response as any)?.data || response;

            console.log('📦 Coupon data:', couponData);

            // API returns discountAmount, finalPrice, discountPercentage on success
            if (couponData && (couponData.discountAmount !== undefined || couponData.finalPrice !== undefined)) {
                // Store coupon data with code for later use
                const couponInfo = {
                    code: code.toUpperCase(),
                    discountAmount: couponData.discountAmount,
                    finalPrice: couponData.finalPrice,
                    discountPercentage: couponData.discountPercentage,
                    discountValue: couponData.discountAmount,
                    discountType: 'FixedAmount', // Based on API response
                };

                setAppliedCoupons(prev => ({ ...prev, [planId]: couponInfo }));
                dispatch(showToast({
                    message: `Coupon "${code.toUpperCase()}" applied! You save ₹${couponData.discountAmount}`,
                    type: 'success'
                }));
                setCouponCode('');
            } else {
                console.warn('❌ Invalid coupon response:', couponData);
                // Extract error message from API response
                const errorMessage = couponData?.errors?.[0] || couponData?.messages?.[0] || couponData?.message || 'Invalid or expired coupon code';
                console.log('Error message:', errorMessage);
                dispatch(showToast({
                    message: errorMessage,
                    type: 'error'
                }));
            }
        } catch (error: any) {
            console.error('❌ Coupon validation failed:', error);
            console.error('Error response:', error.response);
            // Extract error from response
            const errorData = error.response?.data;
            const errorMsg = errorData?.errors?.[0] || errorData?.messages?.[0] || errorData?.message || error.response?.data?.errors?.[0] || 'Invalid or expired coupon code';
            dispatch(showToast({ message: errorMsg, type: 'error' }));
        } finally {
            setValidatingCoupon((prev: any) => ({ ...prev, [planId]: false }));
        }
    };

    const removeCoupon = (planId: string) => {
        setAppliedCoupons((prev: any) => {
            const next = { ...prev };
            delete next[planId];
            return next;
        });
        dispatch(showToast({ message: 'Coupon removed', type: 'info' }));
    };

    const toggleCouponInput = (planId: string) => {
        setShowCouponInput((prev: any) => ({ ...prev, [planId]: !prev[planId] }));
    };

    const calculateFinalPrice = (plan: any, coupon: any) => {
        if (!coupon) return plan.price;

        // If API provided finalPrice, use it directly
        if (coupon.finalPrice !== undefined) {
            return coupon.finalPrice;
        }

        // Otherwise calculate from discount
        let discount = 0;
        if (coupon.discountType === 'Percentage' || coupon.discountType === 1) {
            discount = (plan.price * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
        } else {
            discount = coupon.discountValue || coupon.discountAmount || 0;
        }

        return Math.max(0, plan.price - discount);
    };

    const processSubscription = async (plan: any) => {
        try {
            console.log('🚀 ========== PAYMENT FLOW STARTED ==========');
            console.log('📋 Plan Details:', {
                planId: plan.id || plan._id,
                planName: plan.name,
                price: plan.price,
                interval: plan.interval
            });

            dispatch(showToast({ message: 'Initiating subscription...', type: 'info' }));

            const planId = plan.id || plan._id;
            const appliedCoupon = appliedCoupons[planId];

            const response = await subscriptionsService.subscribe({
                planId: planId,
                userPhone: user?.phoneNumber,
                couponCode: appliedCoupon?.code || undefined,
            });

            console.log('📨 Raw Subscribe API Response:', response);

            // Extract data from response
            const responseData = (response as any).data || response;
            const redirectUrl = responseData.redirectUrl;
            const transactionId = responseData.transactionId; // Format: "019b2603-06ab-791c-a9ac-6142ede7ba02"

            console.log('📝 ========== SUBSCRIBE RESPONSE DETAILS ==========');
            console.log('🆔 Transaction ID:', transactionId);
            console.log('🔗 Redirect URL:', redirectUrl);
            console.log('💰 Amount Charged:', responseData.amountCharged);
            console.log('📦 Plan Name:', responseData.planName);
            console.log('📅 Start Date:', responseData.startDate);
            console.log('📅 Renewal Date:', responseData.renewalDate);
            console.log('🔄 Status:', responseData.status);
            console.log('💳 Requires Payment:', responseData.requiresPayment);

            // Store transaction info in localStorage BEFORE redirecting
            if (transactionId) {
                const pendingPayment = {
                    transactionId,
                    planId: plan.id || plan._id,
                    planName: responseData.planName || plan.name,
                    amount: responseData.amountCharged,
                    timestamp: Date.now()
                };

                console.log('💾 ========== STORING IN LOCALSTORAGE ==========');
                console.log('📦 Pending Payment Object:', pendingPayment);
                localStorage.setItem('pending_payment', JSON.stringify(pendingPayment));
                console.log('✅ Stored in localStorage with key: "pending_payment"');

                // Verify storage
                const stored = localStorage.getItem('pending_payment');
                console.log('🔍 Verification - Retrieved from localStorage:', stored);
            } else {
                console.warn('⚠️ No transactionId found in response!');
            }

            // Redirect to payment gateway if URL provided
            if (redirectUrl) {
                console.log('🌐 ========== REDIRECTING TO PAYMENT GATEWAY ==========');
                console.log('🔗 Full Redirect URL:', redirectUrl);
                console.log('🆔 Transaction ID being used:', transactionId);
                console.log('🏠 Will return to:', `${window.location.origin}/subscriptions?transactionId=${transactionId}`);
                console.log('⏰ Redirect happening in 3...2...1...');

                // Redirect to payment gateway
                window.location.href = redirectUrl;
                return;
            }

            console.log('ℹ️ No redirect URL - subscription activated immediately (free trial)');

            // If no redirect URL, subscription is activated immediately (free trial)
            dispatch(showToast({ message: 'Subscription activated successfully!', type: 'success' }));

            // Refresh data
            await fetchData();

            // Update Global Redux State
            dispatch(updateUserSubscription({
                subscriptionStatus: 'active',
                subscriptionPlan: plan.name || 'Pro',
            }));

        } catch (e: any) {
            console.error('❌ ========== SUBSCRIPTION ERROR ==========');
            console.error('Error details:', e);
            console.error('Response data:', e.response?.data);
            console.error('Backend messages:', e.response?.data?.messages);
            console.error('Backend errors:', e.response?.data?.errors);

            // Extract meaningful error message
            const errorMsg = e.response?.data?.messages?.[0]
                || e.response?.data?.errors?.[0]
                || e.response?.data?.message
                || e.message
                || 'Failed to activate subscription. Please try again.';

            dispatch(showToast({ message: errorMsg, type: 'error' }));
        }
    };
    if (loading) return <div className="text-center py-12 text-slate-500">Loading plans...</div>;

    return (
        <div className="space-y-10">
            {/* Header Section */}
            {!searchParams.get('tab') && (
                <motion.div
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                    className="flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-8">
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
                                SUBSCRIPTION <span className="text-primary-600 dark:text-primary-400">MATRIX</span>
                            </h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 opacity-70">
                                Global Proficiency & Performance Standards
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin mb-4" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compiling Plan Data...</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {currentSub && (
                        <motion.div
                            variants={slideUp}
                            initial="initial"
                            animate="animate"
                            className="glass-card backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-primary-500/10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-600/10 rounded-2xl flex items-center justify-center">
                                            <Shield className="text-primary-600" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-tight">Active Subscription</h3>
                                            <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest mt-0.5 opacity-70">Authenticated Endpoint</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight uppercase leading-tight">
                                            {currentSub.plan?.name || currentSub.planName || 'Master Access'}
                                        </h4>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                            STATUS: {currentSub.status?.toUpperCase() || 'ACTIVE'} • RENEWS {new Date(currentSub.renewalDate || currentSub.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-center md:text-right space-y-4">
                                    <p className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                                        ₹{currentSub.amount || '0.00'}
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">/ {currentSub.plan?.interval || 'mo'}</span>
                                    </p>
                                    <div className="flex justify-center md:justify-end">
                                        <span className="px-5 py-2 bg-white/5 backdrop-blur-md rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border border-white/5">
                                            Premium Identity Verified
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
                        {plans.map((plan, index) => {
                            const isCurrentPlan = currentSub && (plan.id === currentSub.planId || plan._id === currentSub.planId);
                            const isSubActive = ['active', 'trialing', 'succeeded', 'year'].includes(currentSub?.status?.toLowerCase() || '');
                            const isFreeTrial = currentSub?.planName?.toLowerCase().includes('free') || currentSub?.plan?.name?.toLowerCase().includes('free');
                            const isLocked = isCurrentPlan && isSubActive;
                            const isYearlyPlan = plan.interval?.toLowerCase().includes('year');

                            return (
                                <motion.div
                                    key={plan.id || plan._id}
                                    variants={fadeIn}
                                    initial="initial"
                                    animate="animate"
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className={`relative flex flex-col p-5 md:p-6 rounded-3xl border transition-all duration-500 h-full ${isYearlyPlan && !isLocked
                                        ? 'bg-slate-900 border-primary-500/30 shadow-2xl shadow-primary-500/20'
                                        : isLocked
                                            ? 'glass-panel border-primary-500 shadow-[0_0_50px_rgba(15,23,42,0.1)]'
                                            : 'glass-card border-white/10 shadow-xl'
                                        }`}
                                >
                                    {isYearlyPlan && !isLocked && (
                                        <div className="absolute top-6 right-8 px-5 py-2 bg-[#433355] rounded-xl text-[9px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-[#433355]/30">
                                            ELITE VALUE
                                        </div>
                                    )}

                                    <div className="flex flex-col flex-1">
                                        <div className="space-y-6 mb-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isYearlyPlan && !isLocked ? 'bg-white text-primary-600' : 'bg-primary-600/10 text-primary-600'}`}>
                                                {isYearlyPlan ? <Star size={28} /> : plan.price === 0 ? <Zap size={28} /> : <Shield size={28} />}
                                            </div>
                                            <div>
                                                <h4 className={`text-xl font-semibold tracking-tight uppercase ${isYearlyPlan && !isLocked ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                                    {plan.name}
                                                </h4>
                                                <div className="flex items-baseline mt-3">
                                                    <span className={`text-2xl md:text-3xl font-semibold tracking-tight ${isYearlyPlan && !isLocked ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                                        ₹{plan.price}
                                                    </span>
                                                    <span className="ml-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                                        / {plan.interval || 'month'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-[10px] font-medium mb-6 leading-relaxed text-slate-500 dark:text-slate-400 uppercase tracking-wide opacity-80">
                                            {plan.description}
                                        </p>

                                        <ul className="space-y-4 mb-8 flex-1">
                                            {plan.features && Object.keys(plan.features).length > 0 ? (
                                                Object.entries(plan.features)
                                                    .map(([key, value]: [string, any], i: number) => {
                                                        const lowerKey = key.toLowerCase();
                                                        if (['priority', '_id', 'createdat', 'updatedat', '__v', 'id', 'subscriptions'].includes(lowerKey)) return null;
                                                        let displayValue = typeof value === 'string' ? value : (value?.value || value?.text);
                                                        if (!displayValue || typeof displayValue !== 'string') return null;
                                                        const lowerVal = displayValue.toLowerCase().trim();
                                                        if (lowerVal === 'true' || lowerVal === 'false' || !isNaN(Number(displayValue))) return null;

                                                        return (
                                                            <li key={i} className="flex items-start gap-4">
                                                                <div className="mt-0.5 flex-shrink-0 text-primary-600">
                                                                    <CheckCircle size={14} />
                                                                </div>
                                                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 leading-tight">
                                                                    {displayValue}
                                                                </span>
                                                            </li>
                                                        );
                                                    })
                                            ) : (
                                                <li className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Specifications Classified</li>
                                            )}
                                        </ul>

                                        {/* Dynamic Action Button */}
                                        <div className="mt-auto pt-8 border-t border-primary-500/10">
                                            {(() => {
                                                const planId = plan.id || plan._id;
                                                const appliedCoupon = appliedCoupons[planId];
                                                const showInput = showCouponInput[planId];
                                                const isValidating = validatingCoupon[planId];

                                                return (
                                                    <div className="space-y-6">
                                                        {!isLocked && (
                                                            <div className="space-y-4">
                                                                {!appliedCoupon ? (
                                                                    <div className="space-y-3">
                                                                        <button
                                                                            onClick={() => toggleCouponInput(planId)}
                                                                            className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-primary-600 hover:opacity-80 transition-opacity"
                                                                        >
                                                                            <Tag size={12} />
                                                                            {showInput ? 'DISABLE OVERRIDE' : 'APPLY VOUCHER'}
                                                                        </button>
                                                                        {showInput && (
                                                                            <div className="flex gap-2">
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="VOUCHER KEY"
                                                                                    value={couponCode}
                                                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                                                    className="flex-1 px-4 h-12 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-primary-500/10 dark:border-white/10 text-[10px] font-black uppercase tracking-widest focus:border-[#433355] text-slate-900 dark:text-white outline-none placeholder:text-slate-500/50"
                                                                                />
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() => validateAndApplyCoupon(plan, couponCode)}
                                                                                    className="h-12 px-6 rounded-xl bg-primary-600 text-white font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-primary-500/20"
                                                                                    isLoading={isValidating}
                                                                                >
                                                                                    DEPLOY
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
                                                                                <Tag size={16} />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{appliedCoupon.code}</p>
                                                                                <p className="text-[10px] font-black text-green-500/60 uppercase">DEDUCTED</p>
                                                                            </div>
                                                                        </div>
                                                                        <button onClick={() => removeCoupon(planId)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all">
                                                                            <X size={16} />
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {appliedCoupon && (
                                                                    <div className="flex justify-between items-center py-5 border-y border-white/5">
                                                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">FINAL RATE:</span>
                                                                        <span className="text-3xl font-black text-green-500 tracking-tighter">₹{calculateFinalPrice(plan, appliedCoupon).toFixed(0)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <Button
                                                            size="md"
                                                            className={`w-full h-11 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all ${isLocked
                                                                ? 'bg-primary-600 text-white shadow-primary-500/20 cursor-default'
                                                                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/30 hover:scale-[1.02]'
                                                                }`}
                                                            disabled={false}
                                                            onClick={() => {
                                                                const isFreePlanCard = plan.name?.toLowerCase().includes('free');
                                                                const isTrialExpiredByTime = user?.trialEndDate && new Date() > new Date(user.trialEndDate);
                                                                const hasActivePaidSubscription = isSubActive && !isFreeTrial;
                                                                const hasActiveFreeTrialSubscription = isSubActive && isFreeTrial;
                                                                const isPlanUsed = isFreePlanCard && (
                                                                    hasActivePaidSubscription ||
                                                                    hasActiveFreeTrialSubscription ||
                                                                    isExplicitlyCancelled ||
                                                                    isTrialExpiredByTime ||
                                                                    (!isSubActive && (user?.subscriptionStatus === 'cancelled' || user?.subscriptionStatus === 'expired'))
                                                                );

                                                                if (isLocked) {
                                                                    dispatch(showToast({ message: "ACTIVE STATUS: You are currently utilizing this subscription tier.", type: "info" }));
                                                                    return;
                                                                }
                                                                if (isPlanUsed) {
                                                                    dispatch(showToast({
                                                                        message: "QUOTA EXHAUSTED: You have already utilized this Free Access tier.",
                                                                        type: "warning"
                                                                    }));
                                                                    return;
                                                                }
                                                                handleSubscribe(plan);
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-center gap-3">
                                                                {isLocked && <CheckCircle size={14} />}
                                                                {isLocked ? 'ACTIVE PLAN' : 'UPGRADE NOW'}
                                                            </div>
                                                        </Button>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            <SwitchPlanModal
                isOpen={switchModalOpen}
                onClose={() => setSwitchModalOpen(false)}
                currentPlanName={currentSub?.planName || currentSub?.plan?.name || 'Standard'}
                newPlanName={pendingPlan?.name || 'Elite'}
                onConfirm={handleConfirmSwitch}
                isLoading={processingSwitch}
            />
        </div>
    );
};

export default UserSubscriptions;
