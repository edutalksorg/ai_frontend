import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, Variants } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';
import { authService } from '../../services/auth';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';
import { Logo } from '../../components/common/Logo';
import { ResendConfirmationIllustration } from '../../components/auth/AuthIllustrations';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

const ResendConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    if (email) {
      setValue('email', email);
    }
  }, [location.search, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      await authService.resendEmailConfirmation(data.email);

      dispatch(
        showToast({
          message: 'If this email is registered, a confirmation email has been sent.',
          type: 'success',
        })
      );

      navigate('/login');
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message || 'Failed to resend confirmation';
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

  return (
    <div className="h-[100dvh] w-full relative flex overflow-hidden bg-slate-900 selection:bg-purple-500/30">
      {/* UNIFIED BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-10" />

      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Floating Particles */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full blur-[1px]"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-purple-400 rounded-full blur-[2px]"
      />

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center p-4 lg:p-12 gap-8 lg:gap-16">

        {/* LEFT SIDE: ILLUSTRATION */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative">
          <ResendConfirmationIllustration />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8 relative z-20"
          >
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">
              Resend <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">Confirmation</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-md mx-auto leading-relaxed font-medium">
              Didn't receive the email? We'll send you a new confirmation link.
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

            <div className="glass-panel-v2 relative overflow-hidden p-6 sm:p-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900/40 backdrop-blur-md rounded-[2.5rem]">
              {/* Card Highlight */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-500 opacity-50" />

              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Resend Email Confirmation</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Enter your email to resend the link</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1.5">{errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                  Resend Confirmation
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                  Remembered?{' '}
                  <Link to="/login" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResendConfirmationPage;
