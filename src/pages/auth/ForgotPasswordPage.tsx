import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div className="h-[100dvh] w-full relative flex overflow-hidden bg-slate-900 selection:bg-amber-500/30">

      {/* UNIFIED BACKGROUND - Spans entire page */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-10" />

      {/* Shared Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-amber-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-orange-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Floating Particles/Stars spanning across */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full blur-[1px]"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-amber-400 rounded-full blur-[2px]"
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
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">
              Don't <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Panic</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-md mx-auto leading-relaxed font-medium">
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
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <Logo className="w-12 h-12" />
            </div>

            <motion.div
              ref={cardRef}
              className="glass-panel-v2 relative overflow-hidden p-6 sm:p-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900/40 backdrop-blur-md rounded-[2.5rem]"
            >
              {/* Card Internals - Subtle highlight */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 opacity-50" />

              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Forgot Password?</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Enter your email to recover account</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <motion.div variants={itemVariants} className="space-y-1.5 group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 group-focus-within:text-amber-400 transition-colors">
                    Email Address
                  </label>
                  <div className={`relative flex items-center bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-3.5 transition-all group-focus-within:bg-slate-900 group-focus-within:border-amber-500/50 group-focus-within:ring-4 group-focus-within:ring-amber-500/10 ${errors.email ? 'border-red-500/50' : ''}`}>
                    <Mail className="w-4 h-4 text-slate-500 mr-3 group-focus-within:text-amber-400 transition-colors" />
                    <input {...register('email')} type="email" placeholder="you@example.com" className="flex-1 bg-transparent border-none outline-none text-white text-sm font-semibold placeholder-slate-600" />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-400 text-[10px] font-bold ml-1 pt-1 flex items-center gap-1"
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
                    className="relative w-full group overflow-hidden rounded-2xl p-[1px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 animate-gradient-xy opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-slate-900 rounded-[15px] h-14 flex items-center justify-center transition-colors group-hover:bg-slate-900/0">
                      {isLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      ) : (
                        <span className="font-black text-white uppercase tracking-[0.2em] text-sm group-hover:tracking-[0.25em] transition-all">Send Reset Link</span>
                      )}
                    </div>
                  </button>
                </motion.div>

                {/* Footer */}
                <motion.div variants={itemVariants} className="text-center mt-6">
                  <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 text-xs font-bold tracking-wide hover:text-amber-400 transition-colors group uppercase">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
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
