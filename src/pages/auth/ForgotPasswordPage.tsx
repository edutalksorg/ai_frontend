import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../components/Button';
import { authService } from '../../services/auth';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';

import { motion } from 'framer-motion';
import { fadeIn, slideUp, staggerContainer } from '../../constants/animations';
import { Logo } from '../../components/common/Logo';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

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

      navigate('/login');
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message || 'Failed to request password reset';
      dispatch(showToast({ message: serverMessage, type: 'error' }));
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
        {/* Back Button */}
        <motion.div variants={fadeIn} className="mb-8">
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-primary-500 dark:group-hover:border-primary-400 transition-colors shadow-sm">
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="text-xs font-semibold tracking-wide">Back to Login</span>
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
              Reset Password
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
            >
              Enter your email address and we'll send you a link to reset your password.
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

            {/* Submit Button */}
            <motion.div variants={slideUp} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="h-[56px] rounded-2xl font-bold text-base shadow-xl shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 transition-all duration-300"
              >
                Send Reset Link
              </Button>
            </motion.div>
          </form>

          {/* Footer Section */}
          <motion.div variants={fadeIn} className="mt-10 text-center">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Suddenly remembered?{' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 font-bold hover:text-primary-700 transition-all"
              >
                Sign in here
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;

