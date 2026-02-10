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
    <div className="h-[100dvh] w-full relative flex overflow-hidden bg-slate-900 selection:bg-fuchsia-500/30">

      {/* UNIFIED BACKGROUND - Spans entire page */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-slate-900 to-fuchsia-900" />
      <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-10" />

      {/* Shared Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Back Button */}
      <Link to="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 backdrop-blur-md transition-all text-slate-400 hover:text-white group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-wider">Back</span>
      </Link>

      {/* Floating Particles/Stars spanning across */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full blur-[1px]"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-sky-400 rounded-full blur-[2px]"
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
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">
              Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Revolution</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-md mx-auto leading-relaxed font-medium">
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
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <Logo className="w-12 h-12" />
            </div>

            {/* The Card - Now clearly floating on the shared background */}
            <motion.div
              ref={cardRef}
              className="glass-panel-v2 relative overflow-hidden p-6 sm:p-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900/40 backdrop-blur-md rounded-[2.5rem]"
            >
              {/* Card Internals - Subtle highlight */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-fuchsia-500 to-sky-500 opacity-50" />

              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Create Account</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Start your free trial today</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Full Name */}
                <motion.div variants={itemVariants} className="space-y-1.5 group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 group-focus-within:text-sky-400 transition-colors">Full Name</label>
                  <div className={`relative flex items-center bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-3.5 transition-all group-focus-within:bg-slate-900 group-focus-within:border-sky-500/50 group-focus-within:ring-4 group-focus-within:ring-sky-500/10 ${errors.fullName ? 'border-red-500/50' : ''}`}>
                    <User className="w-4 h-4 text-slate-500 mr-3 group-focus-within:text-sky-400 transition-colors" />
                    <input {...register('fullName')} placeholder="John Doe" className="flex-1 bg-transparent border-none outline-none text-white text-sm font-semibold placeholder-slate-600" />
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div variants={itemVariants} className="space-y-1.5 group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 group-focus-within:text-sky-400 transition-colors">Email Address</label>
                  <div className={`relative flex items-center bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-3.5 transition-all group-focus-within:bg-slate-900 group-focus-within:border-sky-500/50 group-focus-within:ring-4 group-focus-within:ring-sky-500/10 ${errors.email ? 'border-red-500/50' : ''}`}>
                    <Mail className="w-4 h-4 text-slate-500 mr-3 group-focus-within:text-sky-400 transition-colors" />
                    <input {...register('email')} placeholder="john@example.com" className="flex-1 bg-transparent border-none outline-none text-white text-sm font-semibold placeholder-slate-600" />
                  </div>
                </motion.div>

                {/* Grid: Phone & Referral */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div variants={itemVariants} className="space-y-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 group-focus-within:text-sky-400 transition-colors">Phone</label>
                    <div className={`relative flex items-center bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-3.5 transition-all group-focus-within:bg-slate-900 group-focus-within:border-sky-500/50 group-focus-within:ring-4 group-focus-within:ring-sky-500/10 ${errors.phoneNumber ? 'border-red-500/50' : ''}`}>
                      <Phone className="w-4 h-4 text-slate-500 mr-2 group-focus-within:text-sky-400 transition-colors" />
                      <input {...register('phoneNumber')} placeholder="+1 234..." className="flex-1 bg-transparent border-none outline-none text-white text-sm font-semibold placeholder-slate-600 min-w-0" />
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 group-focus-within:text-amber-400 transition-colors">Referral</label>
                    <div className="relative flex items-center bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-3.5 transition-all group-focus-within:bg-slate-900 group-focus-within:border-amber-500/50 group-focus-within:ring-4 group-focus-within:ring-amber-500/10">
                      <Gift className="w-4 h-4 text-slate-500 mr-2 group-focus-within:text-amber-400 transition-colors" />
                      <input {...register('referralCode')} placeholder="Opt Code" className="flex-1 bg-transparent border-none outline-none text-white text-sm font-semibold placeholder-slate-600 min-w-0" />
                    </div>
                  </motion.div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div variants={itemVariants} className="space-y-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 group-focus-within:text-sky-400 transition-colors">Password</label>
                    <div className={`relative flex items-center bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-3.5 transition-all group-focus-within:bg-slate-900 group-focus-within:border-sky-500/50 group-focus-within:ring-4 group-focus-within:ring-sky-500/10 ${errors.password ? 'border-red-500/50' : ''}`}>
                      <Lock className="w-4 h-4 text-slate-500 mr-2 group-focus-within:text-sky-400 transition-colors" />
                      <input
                        {...register('password')}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••"
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm font-semibold placeholder-slate-600 min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="opacity-40 hover:opacity-100 transition-opacity"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5 text-white" /> : <Eye className="w-3.5 h-3.5 text-white" />}
                      </button>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 group-focus-within:text-sky-400 transition-colors">Confirm</label>
                    <div className={`relative flex items-center bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-3.5 transition-all group-focus-within:bg-slate-900 group-focus-within:border-sky-500/50 group-focus-within:ring-4 group-focus-within:ring-sky-500/10 ${errors.confirmPassword ? 'border-red-500/50' : ''}`}>
                      <Lock className="w-4 h-4 text-slate-500 mr-2 group-focus-within:text-sky-400 transition-colors" />
                      <input
                        {...register('confirmPassword')}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••"
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm font-semibold placeholder-slate-600 min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="opacity-40 hover:opacity-100 transition-opacity"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5 text-white" /> : <Eye className="w-3.5 h-3.5 text-white" />}
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
                      <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                        <AlertCircle className="w-3 h-3" />
                        {Object.values(errors)[0]?.message as string}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tiny Requirements */}
                <motion.div variants={itemVariants} className="flex flex-wrap gap-2 opacity-60">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className={`text-[8px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border ${req.met ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                      {req.label}
                    </div>
                  ))}
                </motion.div>

                <motion.div variants={itemVariants} className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full group overflow-hidden rounded-2xl p-[1px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-fuchsia-500 to-sky-500 animate-gradient-xy" />
                    <div className="relative bg-slate-900 rounded-[15px] h-14 flex items-center justify-center transition-colors group-hover:bg-slate-900/0">
                      {isLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      ) : (
                        <span className="font-black text-white uppercase tracking-[0.2em] text-sm group-hover:tracking-[0.25em] transition-all">Create Account</span>
                      )}
                    </div>
                  </button>
                </motion.div>

                <div className="text-center mt-4">
                  <p className="text-slate-500 text-xs font-medium">Already have an account? <Link to="/login" className="text-sky-400 hover:text-sky-300 font-bold transition-colors">Sign In</Link></p>
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
