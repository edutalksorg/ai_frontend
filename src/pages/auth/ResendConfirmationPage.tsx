import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
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
          <ResendConfirmationIllustration />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8 relative z-20"
          >
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
              Resend <span className="text-[#E10600]">Confirmation</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed font-medium">
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
            {/* The Card - Matching brand transparent cards */}
            <div className="relative overflow-hidden p-6 sm:p-10 border border-red-50 shadow-[0_20px_50px_rgba(225,6,0,0.05)] bg-white/80 backdrop-blur-xl rounded-[2.5rem]">
              {/* Card Decoration */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-[#E10600] to-red-500 opacity-20" />

              <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{t('auth.resendConfirmation')}</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">{t('auth.forgotPasswordDesc')}</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <motion.div variants={itemVariants} className="space-y-1.5 group">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 group-focus-within:text-[#E10600] transition-colors">
                    {t('auth.emailLabel')}
                  </label>
                  <div className={`relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 transition-all group-focus-within:bg-white group-focus-within:border-[#E10600]/30 group-focus-within:ring-4 group-focus-within:ring-[#E10600]/5 ${errors.email ? 'border-red-500/50' : ''}`}>
                    <Mail className="w-4 h-4 text-slate-400 mr-3 group-focus-within:text-[#E10600] transition-colors" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="you@example.com"
                      className="flex-1 bg-transparent border-none outline-none text-slate-900 text-sm font-semibold placeholder-slate-300"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-[10px] font-bold ml-1 pt-1">{errors.email.message}</p>
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
                        <span className="font-black text-white uppercase tracking-[0.2em] text-sm group-hover:tracking-[0.25em] transition-all">{t('auth.resendConfirmation')}</span>
                      )}
                    </div>
                  </button>
                </motion.div>
              </form>

              <motion.div variants={itemVariants} className="mt-8 text-center">
                <p className="text-slate-400 text-xs font-medium">
                  {t('auth.remembered')}{' '}
                  <Link to="/login" className="text-[#E10600] font-bold hover:text-[#b80000] transition-colors">
                    {t('auth.login')}
                  </Link>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResendConfirmationPage;
