import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence, Variants } from 'framer-motion';
import Button from '../../components/Button';
import { authService } from '../../services/auth';
import { usersService } from '../../services/users';
import { subscriptionsService } from '../../services/subscriptions';
import { setAuthData, setError, updateUserSubscription } from '../../store/authSlice';
import { showToast } from '../../store/uiSlice';
import { AppDispatch } from '../../store';
import { Logo } from '../../components/common/Logo';
import { Eye, EyeOff, Mail, Lock, Check, AlertCircle, Sparkles, ArrowRight, Bot, Music, MessageSquare, ArrowLeft } from 'lucide-react';
import { LoginIllustration } from '../../components/auth/AuthIllustrations';

// Updated to use new AuthIllustrations component



const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Values REMOVED




  const loginSchema = React.useMemo(() => z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }), []);

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    }
  });

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
      const response = await authService.login({
        identifier: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false,
      });

      let user = response?.user || response?.data?.user;
      let token = response?.accessToken || response?.token;

      if (!user && response?.id && response?.email) {
        user = response;
        token = response.token;
      }

      if (user && token) {
        const finalUser = { ...(user as any) } as any;
        const emailLower = (data.email || '').toLowerCase();
        if (emailLower.startsWith('admin') && finalUser.role !== 'admin') {
          finalUser.role = 'admin';
        }

        const refreshToken = response?.refreshToken || response?.data?.refreshToken;
        if (refreshToken) localStorage.setItem('edutalks_refresh_token', refreshToken);

        dispatch(setAuthData({ user: finalUser, token }));

        try {
          const profileRes = await usersService.getProfile();
          const profileData = (profileRes as any)?.data || profileRes;
          let subData = null;
          try {
            const subRes = await subscriptionsService.current();
            subData = (subRes as any)?.data || subRes;
          } catch (e) { }

          if (!subData || !subData.status || subData.status === 'none') {
            try {
              const subscribeRes = await subscriptionsService.subscribe({ planId: 'plan_free_trial' });
              const newSub = (subscribeRes as any)?.data || subscribeRes;
              if (newSub) {
                subData = { ...newSub, plan: { name: 'Free Trial' }, planName: 'Free Trial', status: 'Active' };
                if (profileData) {
                  if (!profileData.subscription) profileData.subscription = {};
                  profileData.subscription.status = 'Active';
                  profileData.subscription.planName = 'Free Trial';
                  profileData.subscription.renewalDate = newSub.renewalDate;
                  profileData.subscription.isFreeTrial = true;
                }
              }
            } catch (autoSubError) { }
          }

          if (profileData) {
            dispatch(setAuthData({
              user: {
                ...finalUser, ...profileData,
                subscriptionStatus: profileData.subscriptionStatus || profileData.subscription?.status,
                subscriptionPlan: profileData.subscriptionPlan || profileData.subscription?.planName || profileData.subscription?.plan?.name,
                trialEndDate: profileData.subscription?.renewalDate
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
        } catch (fetchError) { }

        dispatch(showToast({ message: 'Login successful!', type: 'success' }));
        const roleLower = String(finalUser.role || '').toLowerCase();
        if (roleLower === 'admin') navigate('/admindashboard');
        else if (finalUser.role === 'instructor') navigate('/instructor-dashboard');
        else navigate('/dashboard');
      } else {
        dispatch(showToast({ message: 'Login failed', type: 'error' }));
      }
    } catch (error: any) {
      let errorMessage = 'Login failed';
      const responseData = error?.response?.data;
      if (responseData?.messages?.[0]) errorMessage = responseData.messages[0];
      else if (responseData?.errors?.[0]) errorMessage = responseData.errors[0];
      else if (responseData?.message) errorMessage = responseData.message;
      else if (error?.message) errorMessage = error.message;

      const lower = errorMessage.toLowerCase();
      if (lower.includes('confirm') || lower.includes('verify')) setShowResend(true);

      dispatch(setError(errorMessage));
      dispatch(showToast({ message: errorMessage, type: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = () => {
    if (!watchedEmail) {
      navigate('/resend-confirmation');
    } else {
      navigate(`/resend-confirmation?email=${encodeURIComponent(watchedEmail)}`);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0, scale: 0.95, rotateX: -15 },
    visible: {
      y: 0, opacity: 1, scale: 1, rotateX: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    }
  };

  const floatingIconVariants: Variants = {
    float: {
      y: [-5, 5, -5],
      rotate: [-5, 5, -5],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  };

  return (
    <div className="h-[100dvh] w-full relative flex overflow-hidden bg-white selection:bg-red-500/20">
      {/* UNIFIED BACKGROUND - Premium Red-White Aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-[#E10600] to-white opacity-[0.03]" />
      <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-[0.02]" />

      {/* Shared Ambient Glows - Branding Tints */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Circles matching the rest of the site */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-red-100/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-50/40 rounded-full blur-3xl animate-pulse" />

      {/* Back Button */}
      <Link to="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-red-50 hover:border-red-200 transition-all text-slate-500 hover:text-[#E10600] group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-wider">Back</span>
      </Link>

      {/* Floating Particles - Subtle Red Tints */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 right-1/4 w-2 h-2 bg-red-400/20 rounded-full blur-[1px]"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-red-500/10 rounded-full blur-[2px]"
      />

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center p-4 lg:p-12 gap-8 lg:gap-16">

        {/* LEFT SIDE: CUSTOM ILLUSTRATION */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative">
          <LoginIllustration />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8 relative z-20"
          >
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
              Master Your <span className="text-[#E10600]">Voice</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed font-medium">
              Log in to continue your journey to perfect pronunciation.
            </p>
          </motion.div>
        </div>


        {/* RIGHT SIDE: FORM CARD */}
        <div className="flex-1 w-full max-w-[480px] flex items-center justify-center">

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full relative"
          >
            {/* The Card - Matching the brand's transparent cards */}
            <motion.div
              ref={cardRef}
              className="relative overflow-hidden p-6 sm:p-10 border border-red-50 shadow-[0_20px_50px_rgba(225,6,0,0.05)] bg-white/80 backdrop-blur-xl rounded-[2.5rem]"
            >
              {/* Card Decoration */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-[#E10600] to-red-500 opacity-20" />

              <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{t('auth.welcomeBack')}</h1>
                <p className="text-black text-xs font-bold uppercase tracking-[0.2em]">{t('auth.subtitle')}</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Email */}
                <motion.div variants={itemVariants} className="space-y-1.5 group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-black ml-1 group-focus-within:text-[#E10600] transition-colors">{t('auth.email')}</label>
                  <div className={`relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 transition-all group-focus-within:bg-white group-focus-within:border-[#E10600]/30 group-focus-within:ring-4 group-focus-within:ring-[#E10600]/5 ${errors.email ? 'border-red-500/50' : ''}`}>
                    <Mail className="w-4 h-4 text-slate-400 mr-3 group-focus-within:text-[#E10600] transition-colors" />
                    <input {...register('email')} type="email" placeholder="you@example.com" className="flex-1 bg-transparent border-none outline-none text-black text-sm font-semibold placeholder-slate-500" />
                    {!errors.email && watchedEmail && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 text-[#E10600]">
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-500 text-[10px] font-bold ml-1 pt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" /> {errors.email.message}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants} className="space-y-1.5 group">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-black group-focus-within:text-[#E10600] transition-colors">{t('auth.password')}</label>
                    <Link to="/forgot-password" university-id="forgot-password-link" className="text-[10px] font-bold text-black hover:text-black/70 transition-colors uppercase tracking-wider">{t('auth.forgot')}</Link>
                  </div>
                  <div className={`relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 transition-all group-focus-within:bg-white group-focus-within:border-[#E10600]/30 group-focus-within:ring-4 group-focus-within:ring-[#E10600]/5 ${errors.password ? 'border-red-500/50' : ''}`}>
                    <Lock className="w-4 h-4 text-slate-400 mr-3 group-focus-within:text-[#E10600] transition-colors" />
                    <input
                      {...register('password')}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent border-none outline-none text-black text-sm font-semibold placeholder-slate-500"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-300 hover:text-slate-600 transition-colors"><Eye className="w-4 h-4" /></button>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center justify-between px-1">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        {...register('rememberMe')}
                      />
                      <div className="w-5 h-5 rounded-lg border-2 border-slate-200 bg-white peer-checked:bg-[#E10600] peer-checked:border-[#E10600] transition-all flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                      </div>
                    </div>
                    <span className="ml-3 text-[10px] font-bold text-black tracking-wider uppercase group-hover:text-black transition-colors">{t('auth.rememberMe')}</span>
                  </label>

                  {showResend && (
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      className="text-[10px] font-bold text-[#E10600] hover:text-[#b80000] transition-colors uppercase tracking-wider"
                    >
                      {t('auth.resendConfirmation')}
                    </button>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full group overflow-hidden rounded-2xl bg-[#E10600] hover:bg-[#b80000] shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
                  >
                    <div className="relative h-14 flex items-center justify-center">
                      {isLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      ) : (
                        <span className="font-black text-white uppercase tracking-[0.2em] text-sm group-hover:tracking-[0.25em] transition-all">{t('auth.login')}</span>
                      )}
                    </div>
                  </button>
                </motion.div>

                <div className="text-center mt-8">
                  <p className="text-black text-xs font-medium">{t('auth.dontHaveAccount')} <Link to="/register" className="text-[#E10600] hover:text-[#b80000] font-bold transition-colors">{t('auth.signup')}</Link></p>
                </div>

              </form>
            </motion.div>
          </motion.div>
        </div>

      </div>

    </div>
  );
};

export default LoginPage;
