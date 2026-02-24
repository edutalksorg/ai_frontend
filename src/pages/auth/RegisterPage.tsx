import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence, Variants } from 'framer-motion';
import Button from '../../components/Button';
import { authService } from '../../services/auth';
import { setAuthData, setError } from '../../store/authSlice';
import { showToast } from '../../store/uiSlice';
import { AppDispatch } from '../../store';
import { Logo } from '../../components/common/Logo';
import { Eye, EyeOff, User, Mail, Phone, Lock, Gift, Check, X, Sparkles, Wand2, AlertCircle, ArrowRight, GraduationCap, BookOpen, PenTool, ArrowLeft } from 'lucide-react';
import { RegisterIllustration } from '../../components/auth/AuthIllustrations';



type RegisterFormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: 'user';
  referralCode?: string;
  referralSource?: string;
};

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Values REMOVED



  const registerSchema = React.useMemo(() => z
    .object({
      fullName: z.string().min(2, 'Full name must be at least 2 characters'),
      email: z.string().email('Please enter a valid email address'),
      phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
      confirmPassword: z.string(),
      role: z.literal('user').default('user'),
      referralCode: z.string().optional(),
      referralSource: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'user' },
  });

  const passwordValue = watch('password') || '';
  const passwordRequirements = [
    { label: '8+ Chars', met: passwordValue.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(passwordValue) },
    { label: 'Lowercase', met: /[a-z]/.test(passwordValue) },
    { label: 'Number', met: /[0-9]/.test(passwordValue) },
    { label: 'Special', met: /[!@#$%^&*]/.test(passwordValue) },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const normalizedPhone = data.phoneNumber ? data.phoneNumber.replace(/\D/g, '') : '';
      await authService.register({ ...data, phoneNumber: normalizedPhone });
      dispatch(showToast({ message: 'Registration successful! Please login.', type: 'success' }));
      navigate('/login');
    } catch (error: any) {
      const serverData = error?.response?.data || error || {};
      const errorsArr: any[] = serverData.errors || serverData.validationErrors || [];

      if (errorsArr.some((e: any) => String(e).includes('phone'))) {
        setFormError('phoneNumber', { type: 'server', message: 'Phone number already exists' });
      }
      if (errorsArr.some((e: any) => String(e).includes('email')) || (serverData.messages && serverData.messages.includes('User with this email already exists'))) {
        setFormError('email', { type: 'server', message: 'Email already exists' });
      }

      const errorMessage = serverData.message || error?.message || 'Registration failed';
      dispatch(setError(errorMessage));
      dispatch(showToast({ message: errorMessage, type: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
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
      y: [-6, 6, -6],
      rotate: [5, -5, 5],
      transition: {
        duration: 5,
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
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Circles */}
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-red-50/50 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-red-100/30 rounded-full blur-3xl animate-pulse" />

      {/* Back Button */}
      <Link to="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-red-50 hover:border-red-200 transition-all text-slate-500 hover:text-[#E10600] group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-wider">Back</span>
      </Link>

      {/* Floating Particles - Subtle Red Tints */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/3 w-2 h-2 bg-red-400/20 rounded-full blur-[1px]"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-red-500/10 rounded-full blur-[2px]"
      />

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center p-4 lg:p-12 gap-8 lg:gap-16">

        {/* LEFT SIDE: CUSTOM ILLUSTRATION */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative">
          <RegisterIllustration />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8 relative z-20"
          >
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
              Join the <span className="text-[#E10600]">Revolution</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed font-medium">
              Experience the cutest way to master English pronunciation with AI.
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
            {/* The Card - Matching brand transparent cards */}
            <motion.div
              ref={cardRef}
              className="relative overflow-hidden p-6 sm:p-10 border border-red-50 shadow-[0_20px_50px_rgba(225,6,0,0.05)] bg-white/80 backdrop-blur-xl rounded-[2.5rem]"
            >
              {/* Card Decoration */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-[#E10600] to-red-500 opacity-20" />

              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{t('auth.createAccount')}</h1>
                <p className="text-black text-xs font-bold uppercase tracking-[0.2em]">{t('auth.joinFreeTrial')}</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Full Name */}
                <motion.div variants={itemVariants} className="space-y-1.5 group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-black ml-1 group-focus-within:text-[#E10600] transition-colors">{t('auth.fullName')}</label>
                  <div className={`relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 transition-all group-focus-within:bg-white group-focus-within:border-[#E10600]/30 group-focus-within:ring-4 group-focus-within:ring-[#E10600]/5 ${errors.fullName ? 'border-red-500/50' : ''}`}>
                    <User className="w-4 h-4 text-slate-400 mr-3 group-focus-within:text-[#E10600] transition-colors" />
                    <input {...register('fullName')} placeholder="John Doe" className="flex-1 bg-transparent border-none outline-none text-black text-sm font-semibold placeholder-slate-500" />
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div variants={itemVariants} className="space-y-1.5 group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-black ml-1 group-focus-within:text-[#E10600] transition-colors">{t('auth.emailLabel')}</label>
                  <div className={`relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 transition-all group-focus-within:bg-white group-focus-within:border-[#E10600]/30 group-focus-within:ring-4 group-focus-within:ring-[#E10600]/5 ${errors.email ? 'border-red-500/50' : ''}`}>
                    <Mail className="w-4 h-4 text-slate-400 mr-3 group-focus-within:text-[#E10600] transition-colors" />
                    <input {...register('email')} placeholder="john@example.com" className="flex-1 bg-transparent border-none outline-none text-black text-sm font-semibold placeholder-slate-500" />
                  </div>
                </motion.div>

                {/* Grid: Phone & Referral */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div variants={itemVariants} className="space-y-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-black ml-1 group-focus-within:text-[#E10600] transition-colors">{t('auth.phoneNumber')}</label>
                    <div className={`relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 transition-all group-focus-within:bg-white group-focus-within:border-[#E10600]/30 group-focus-within:ring-4 group-focus-within:ring-[#E10600]/5 ${errors.phoneNumber ? 'border-red-500/50' : ''}`}>
                      <Phone className="w-4 h-4 text-slate-400 mr-2 group-focus-within:text-[#E10600] transition-colors" />
                      <input {...register('phoneNumber')} placeholder={t('auth.phoneNumberPlaceholder')} className="flex-1 bg-transparent border-none outline-none text-black text-sm font-semibold placeholder-slate-500 min-w-0" />
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-black ml-1 group-focus-within:text-amber-500 transition-colors">{t('auth.referralCode')}</label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 transition-all group-focus-within:bg-white group-focus-within:border-amber-500/30 group-focus-within:ring-4 group-focus-within:ring-amber-500/5">
                      <Gift className="w-4 h-4 text-slate-400 mr-2 group-focus-within:text-amber-500 transition-colors" />
                      <input {...register('referralCode')} placeholder={t('auth.referralCodePlaceholder')} className="flex-1 bg-transparent border-none outline-none text-black text-sm font-semibold placeholder-slate-500 min-w-0" />
                    </div>
                  </motion.div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div variants={itemVariants} className="space-y-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-black ml-1 group-focus-within:text-[#E10600] transition-colors">{t('auth.password')}</label>
                    <div className={`relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 transition-all group-focus-within:bg-white group-focus-within:border-[#E10600]/30 group-focus-within:ring-4 group-focus-within:ring-[#E10600]/5 ${errors.password ? 'border-red-500/50' : ''}`}>
                      <Lock className="w-4 h-4 text-slate-400 mr-2 group-focus-within:text-[#E10600] transition-colors" />
                      <input
                        {...register('password')}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••"
                        className="flex-1 bg-transparent border-none outline-none text-slate-900 text-sm font-semibold placeholder-slate-300 min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-300 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-black ml-1 group-focus-within:text-[#E10600] transition-colors">{t('auth.confirmPasswordLabel')}</label>
                    <div className={`relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 transition-all group-focus-within:bg-white group-focus-within:border-[#E10600]/30 group-focus-within:ring-4 group-focus-within:ring-[#E10600]/5 ${errors.confirmPassword ? 'border-red-500/50' : ''}`}>
                      <Lock className="w-4 h-4 text-slate-400 mr-2 group-focus-within:text-[#E10600] transition-colors" />
                      <input
                        {...register('confirmPassword')}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••"
                        className="flex-1 bg-transparent border-none outline-none text-slate-900 text-sm font-semibold placeholder-slate-300 min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-slate-300 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* Combined Error Message */}
                <AnimatePresence>
                  {Object.keys(errors).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold bg-red-50 p-2 rounded-lg border border-red-100">
                        <AlertCircle className="w-3 h-3" />
                        {Object.values(errors)[0]?.message as string}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tiny Requirements */}
                <motion.div variants={itemVariants} className="flex flex-wrap gap-2 opacity-80">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className={`text-[8px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border transition-colors ${req.met ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-200 text-black'}`}>
                      {req.label}
                    </div>
                  ))}
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
                        <span className="font-black text-white uppercase tracking-[0.2em] text-sm group-hover:tracking-[0.25em] transition-all">{t('auth.signup')}</span>
                      )}
                    </div>
                  </button>
                </motion.div>

                <div className="text-center mt-4">
                  <p className="text-black text-xs font-medium">{t('auth.alreadyHaveAccount')} <Link to="/login" className="text-[#E10600] hover:text-[#b80000] font-bold transition-colors">{t('auth.login')}</Link></p>
                </div>

              </form>
            </motion.div>
          </motion.div>
        </div>

      </div>

    </div>
  );
};

export default RegisterPage;
