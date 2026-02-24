import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence, Variants } from 'framer-motion';
import { authService } from '../../services/auth';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';
import { Mail, ArrowLeft, Sparkles, KeyRound, AlertCircle, Check } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { ForgotPasswordIllustration } from '../../components/auth/AuthIllustrations';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;



const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // 3D Tilt Values
  // 3D Tilt Values REMOVED


  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(data.email);

      dispatch(
        showToast({
          message: 'If this email is registered, a password reset link has been sent.',
          type: 'success',
        })
      );

      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message || 'Failed to request password reset';
      dispatch(showToast({ message: serverMessage, type: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

        {/* LEFT SIDE: ILLUSTRATION */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative">
          <ForgotPasswordIllustration />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8 relative z-20"
          >
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
              Don't <span className="text-amber-500">Panic</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed font-medium">
              It happens to the best of us. Let's get you back into your account.
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

              <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{t('auth.forgotPasswordTitle')}</h1>
                <p className="text-slate-900 text-xs font-bold uppercase tracking-[0.2em]">{t('auth.forgotPasswordDesc')}</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <motion.div variants={itemVariants} className="space-y-1.5 group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-black ml-1 group-focus-within:text-[#E10600] transition-colors">
                    {t('auth.emailLabel')}
                  </label>
                  <div className={`relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 transition-all group-focus-within:bg-white group-focus-within:border-[#E10600]/30 group-focus-within:ring-4 group-focus-within:ring-[#E10600]/5 ${errors.email ? 'border-red-500/50' : ''}`}>
                    <Mail className="w-4 h-4 text-slate-400 mr-3 group-focus-within:text-[#E10600] transition-colors" />
                    <input {...register('email')} type="email" placeholder="you@example.com" className="flex-1 bg-transparent border-none outline-none text-slate-900 text-sm font-semibold placeholder-slate-500" />
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

                {/* Action Button */}
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
                        <span className="font-black text-white uppercase tracking-[0.2em] text-sm group-hover:tracking-[0.25em] transition-all">{t('auth.sendResetLink')}</span>
                      )}
                    </div>
                  </button>
                </motion.div>

                {/* Footer */}
                <motion.div variants={itemVariants} className="text-center mt-8">
                  <Link to="/login" className="inline-flex items-center gap-2 text-black text-xs font-bold tracking-wide hover:text-black/70 transition-colors group uppercase">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    {t('auth.verifyEmail.backToLogin')}
                  </Link>
                </motion.div>

              </form>
            </motion.div>
          </motion.div>

        </div>

      </div>

    </div>
  );
};

export default ForgotPasswordPage;
