import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import Button from '../../components/Button';
import { authService } from '../../services/auth';
import { usersService } from '../../services/users';
import { subscriptionsService } from '../../services/subscriptions';
import { setAuthData, setError, updateUserSubscription } from '../../store/authSlice';
import { showToast } from '../../store/uiSlice';
import { AppDispatch } from '../../store';
import { Logo } from '../../components/common/Logo';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, staggerContainer } from '../../constants/animations';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [showResend, setShowResend] = useState(false);

  // Clear the 'showResend' flag whenever the email input changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'email') setShowResend(false);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const watchedEmail = watch('email') || '';

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      console.log('Sending login request with:', { email: data.email, password: '***' });

      const response = await authService.login({
        identifier: data.email,  // Backend expects 'identifier' not 'email'
        password: data.password,
        rememberMe: true,
      });

      console.log('Login response:', response);

      // API interceptor already unwraps response.data, so response is the inner data object
      // Structure: { user, accessToken, refreshToken } OR { accessToken, refreshToken, data: { user } }
      const user = response?.user || response?.data?.user;
      const token = response?.accessToken || response?.token;

      console.log('Extracted user:', user);
      console.log('Extracted token:', token ? 'Present' : 'Missing');
      console.log('Full response structure:', response);

      if (user && token) {
        // If backend didn't mark role but email starts with 'admin', treat as admin
        const finalUser = { ...(user as any) } as any;
        const emailLower = (data.email || '').toLowerCase();
        if (emailLower.startsWith('admin') && finalUser.role !== 'admin') {
          finalUser.role = 'admin';
        }

        // Save refresh token for automatic token refresh
        const refreshToken = response?.refreshToken || response?.data?.refreshToken;
        if (refreshToken) {
          localStorage.setItem('edutalks_refresh_token', refreshToken);
          console.log('✅ Refresh token saved');
        } else {
          console.warn('⚠️ No refresh token in login response');
        }

        // 1. Set initial auth data (token is crucial for subsequent requests)
        dispatch(setAuthData({ user: finalUser, token }));

        // 2. Fetch full profile and subscription to ensure we have the latest status
        // This prevents the "Trial Expired" flash by ensuring Redux has the "Yearly" plan data immediately
        try {
          const profileRes = await usersService.getProfile();
          const profileData = (profileRes as any)?.data || profileRes;

          let subData = null;
          try {
            const subRes = await subscriptionsService.current();
            subData = (subRes as any)?.data || subRes;
          } catch (e) { console.log('No active sub on login'); }

          // Auto-subscribe to Free Trial if no active subscription
          if (!subData || !subData.status || subData.status === 'none') {
            try {
              console.log('Auto-subscribing new user to Free Trial...');
              const subscribeRes = await subscriptionsService.subscribe({
                planId: 'plan_free_trial'
              });
              const newSub = (subscribeRes as any)?.data || subscribeRes;

              if (newSub) {
                console.log('Auto-subscription successful:', newSub);
                subData = {
                  ...newSub,
                  plan: { name: 'Free Trial' },
                  planName: 'Free Trial',
                  status: 'Active' // Assume active after successful subscribe
                };

                // Update profileData to reflect the new subscription
                if (profileData) {
                  if (!profileData.subscription) profileData.subscription = {};
                  profileData.subscription.status = 'Active';
                  profileData.subscription.planName = 'Free Trial';
                  profileData.subscription.renewalDate = newSub.renewalDate;
                  profileData.subscription.isFreeTrial = true;
                }
              }
            } catch (autoSubError) {
              console.error('Failed to auto-subscribe to Free Trial:', autoSubError);
            }
          }

          // 3. Dispatch merged updates
          if (profileData) {
            // Re-dispatch setAuthData or setUser with the richer profile
            dispatch(setAuthData({
              user: {
                ...finalUser,
                ...profileData,
                subscriptionStatus: profileData.subscriptionStatus || profileData.subscription?.status,
                subscriptionPlan: profileData.subscriptionPlan || profileData.subscription?.planName || profileData.subscription?.plan?.name,
                trialEndDate: profileData.subscription?.renewalDate // Store renewalDate as trialEndDate for timer
              },
              token
            }));
          }

          if (subData) {
            dispatch(updateUserSubscription({
              subscriptionStatus: subData.status,
              subscriptionPlan: subData.plan?.name || subData.planName,
              trialEndDate: subData.renewalDate || subData.endDate
            }));
          }

        } catch (fetchError) {
          console.error('Failed to fetch rich profile data on login', fetchError);
          // Non-blocking: we still have the basic user from login response, so we proceed
        }

        dispatch(
          showToast({
            message: 'Login successful! Welcome back.',
            type: 'success',
          })
        );

        // Redirect based on role
        const roleLower = String(finalUser.role || '').toLowerCase();
        if (roleLower === 'admin') {
          navigate('/admindashboard');
        } else if (finalUser.role === 'instructor') {
          navigate('/instructor-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error('Missing user or token in response');
        dispatch(showToast({ message: 'Login failed - incomplete response', type: 'error' }));
      }
    } catch (error: any) {
      console.error('Login error caught:', error);
      console.error('Error response:', error?.response);
      console.error('Error response data:', error?.response?.data);

      // Extract error message from different response formats
      let errorMessage = 'Login failed';
      const responseData = error?.response?.data;

      if (responseData?.messages && responseData.messages.length > 0) {
        errorMessage = responseData.messages[0];
      } else if (responseData?.errors && responseData.errors.length > 0) {
        errorMessage = responseData.errors[0];
      } else if (responseData?.message) {
        errorMessage = responseData.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      console.error('Final error message:', errorMessage);

      // If backend indicates the email/account is not confirmed, show the "Resend confirmation" link
      const lower = (errorMessage || '').toLowerCase();
      const responseErrors: string[] = responseData?.errors || [];
      const responseMessages: string[] = responseData?.messages || [];

      const notConfirmedIndicator =
        lower.includes('confirm') ||
        responseErrors.some((e: string) => /confirm/i.test(e)) ||
        responseMessages.some((m: string) => /confirm/i.test(m));

      if (notConfirmedIndicator) {
        setShowResend(true);
      }

      dispatch(setError(errorMessage));
      dispatch(showToast({ message: errorMessage, type: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 dark:bg-[#020617] transition-colors duration-700">
      {/* Dynamic Background Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px] dark:bg-primary-400/5" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] dark:bg-blue-400/5" />
      </div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Back Button - Minimalist Elite Style */}
        <motion.div variants={fadeIn} className="mb-8">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-primary-500 dark:group-hover:border-primary-400 transition-colors shadow-sm">
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="text-xs font-semibold tracking-wide">Back to Home</span>
          </Link>
        </motion.div>

        <div className="glass-panel p-8 md:p-12 rounded-[32px] shadow-2xl">
          {/* Header Section */}
          <div className="text-center mb-10">
            <motion.div
              variants={fadeIn}
              className="inline-flex p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 mb-6 shadow-inner"
            >
              <Logo className="scale-125" />
            </motion.div>
            <motion.h1
              variants={slideUp}
              className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight"
            >
              Welcome back
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="text-slate-500 dark:text-slate-400 font-medium"
            >
              Please enter your details to sign in
            </motion.p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <motion.div variants={slideUp} className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full h-[56px] pl-12 pr-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-600 transition-all duration-300 outline-none font-medium"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs font-semibold ml-1 animate-fadeIn">
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div variants={slideUp} className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-[56px] pl-12 pr-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-600 transition-all duration-300 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs font-semibold ml-1 animate-fadeIn">
                  {errors.password.message}
                </p>
              )}

              {showResend && (
                <div className="pt-1">
                  <Link
                    to={`/resend-confirmation?email=${encodeURIComponent(watchedEmail)}`}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 underline transition-colors"
                  >
                    Resend confirmation link
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Remember Me */}
            <motion.div variants={fadeIn} className="flex items-center">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="sr-only" />
                <div className="w-5 h-5 border-2 border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 transition-all group-hover:border-primary-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-sm bg-primary-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                </div>
                <span className="ml-3 text-sm font-medium text-slate-600 dark:text-slate-400">Remember me</span>
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={slideUp} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="h-[56px] rounded-2xl font-bold text-base shadow-xl shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 transition-all duration-300"
              >
                Sign in
              </Button>
            </motion.div>
          </form>

          {/* Footer Section */}
          <motion.div variants={fadeIn} className="mt-10 text-center">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 dark:text-primary-400 font-bold hover:text-primary-700 transition-all"
              >
                Create one now
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
