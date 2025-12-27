import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import Button from '../../components/Button';
import { authService } from '../../services/auth';
import { setAuthData, setError } from '../../store/authSlice';
import { showToast } from '../../store/uiSlice';
import { AppDispatch } from '../../store';
import { Logo } from '../../components/common/Logo';
import { motion } from 'framer-motion';
import { fadeIn, slideUp, buttonClick, staggerContainer } from '../../constants/animations';

// Helper component


const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
    // Password rules: at least 8 chars, at least one digit, at least one special char
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)'),
    confirmPassword: z.string(),
    // Role is fixed to 'user' for public registration
    role: z.literal('user').default('user'),
    referralCode: z.string().optional(),
    referralSource: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'user',
    },
  });

  const passwordValue = watch('password') || '';

  const passwordRequirements = [
    { label: 'At least 8 characters', met: passwordValue.length >= 8 },
    { label: 'At least 1 uppercase letter', met: /[A-Z]/.test(passwordValue) },
    { label: 'At least 1 lowercase letter', met: /[a-z]/.test(passwordValue) },
    { label: 'At least 1 number', met: /[0-9]/.test(passwordValue) },
    { label: 'At least 1 special character (!@#$%^&*)', met: /[!@#$%^&*]/.test(passwordValue) },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      // Prepare payload matching backend schema
      // Normalize phone to digits only to avoid formatting mismatches
      const normalizedPhone = data.phoneNumber ? data.phoneNumber.replace(/\D/g, '') : '';

      const payload: any = {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: normalizedPhone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role,
        referralCode: data.referralCode,
        referralSource: data.referralSource,
      };



      const response = await authService.register(payload);

      // Do not auto-login after registration; redirect user to login page.
      dispatch(
        showToast({
          message: 'Registration successful! Please Confirm your email before login .',
          type: 'success',
        })
      );

      // Redirect to login so user can authenticate explicitly
      navigate('/login');
    } catch (error: any) {
      // Try to map validation errors to form fields for better UX
      const serverData = error?.response?.data || error || {};

      const errorsArr: any[] = serverData.errors || serverData.validationErrors || [];
      // Map phone error
      const phoneExists = Array.isArray(errorsArr)
        ? errorsArr.includes('PHONE_EXISTS') || errorsArr.some((e: string) => typeof e === 'string' && e.toLowerCase().includes('phone'))
        : false;

      if (phoneExists) {
        setFormError('phoneNumber', {
          type: 'server',
          message: 'A user with this phone number already exists',
        });
        dispatch(showToast({ message: 'A user with this phone number already exists', type: 'error' }));
      }

      // Map email error
      const emailExists = Array.isArray(errorsArr)
        ? errorsArr.includes('EMAIL_EXISTS') || errorsArr.some((e: string) => typeof e === 'string' && e.toLowerCase().includes('email exists'))
        : (serverData.messages && serverData.messages.includes('User with this email already exists'));

      if (emailExists) {
        setFormError('email', {
          type: 'server',
          message: 'User with this email already exists',
        });
        dispatch(showToast({ message: 'User with this email already exists', type: 'error' }));
      }

      // Map password-specific backend errors
      const passwordRequiresDigit = Array.isArray(errorsArr) && errorsArr.includes('PasswordRequiresDigit');
      const passwordRequiresSpecial = Array.isArray(errorsArr) && errorsArr.includes('PasswordRequiresNonAlphanumeric');

      if (passwordRequiresDigit || passwordRequiresSpecial) {
        const messages: string[] = [];
        if (passwordRequiresDigit) messages.push('Password must contain at least one digit');
        if (passwordRequiresSpecial) messages.push('Password must contain at least one special character');

        setFormError('password', {
          type: 'server',
          message: messages.join('. '),
        });

        // Also set confirmPassword error to prompt user to re-enter
        setFormError('confirmPassword', {
          type: 'server',
          message: 'Please re-enter the password after fixing the requirements',
        });

        dispatch(showToast({ message: messages.join('. '), type: 'error' }));
      }

      // If no mapped field errors, show generic message
      if (!phoneExists && !emailExists && !passwordRequiresDigit && !passwordRequiresSpecial) {
        const errorMessage = serverData.message || error?.message || 'Registration failed';
        dispatch(setError(errorMessage));
        dispatch(showToast({ message: errorMessage, type: 'error' }));
      }
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
        className="w-full max-w-[640px] relative z-10 py-12"
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
              Create Account
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="text-slate-500 dark:text-slate-400 font-medium"
            >
              Start your 24-hour free trial with EduTalks
            </motion.p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <motion.div variants={slideUp} className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="John Doe"
                    className="w-full h-[56px] pl-12 pr-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-600 transition-all duration-300 outline-none font-medium"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-xs font-semibold ml-1">{errors.fullName.message}</p>
                )}
              </motion.div>

              {/* Email Address */}
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
                    placeholder="john@example.com"
                    className="w-full h-[56px] pl-12 pr-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-600 transition-all duration-300 outline-none font-medium"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs font-semibold ml-1">{errors.email.message}</p>
                )}
              </motion.div>

              {/* Phone Number */}
              <motion.div variants={slideUp} className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    {...register('phoneNumber')}
                    type="tel"
                    placeholder="9876543210"
                    className="w-full h-[56px] pl-12 pr-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-600 transition-all duration-300 outline-none font-medium"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs font-semibold ml-1">{errors.phoneNumber.message}</p>
                )}
              </motion.div>

              {/* Referral Code */}
              <motion.div variants={slideUp} className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Referral Code (Optional)
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <input
                    {...register('referralCode')}
                    type="text"
                    placeholder="REFER2025"
                    className="w-full h-[56px] pl-12 pr-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-600 transition-all duration-300 outline-none font-medium"
                  />
                </div>
              </motion.div>
            </div>

            {/* Password Section */}
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password Field */}
                <motion.div variants={slideUp} className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    Password
                  </label>
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
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={slideUp} className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full h-[56px] pl-12 pr-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-600 transition-all duration-300 outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Password Requirements */}
              <motion.div variants={fadeIn} className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 backdrop-blur-md">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Security Requirements</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 ${req.met ? 'bg-green-500/20 text-green-500 shadow-sm shadow-green-500/10' : 'bg-slate-200 dark:bg-white/10 text-slate-400'
                        }`}>
                        {req.met ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        )}
                      </div>
                      <span className={`text-xs font-semibold transition-colors duration-300 ${req.met ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Error Messages */}
            {(errors.password || errors.confirmPassword) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                {errors.password && <p className="text-red-500 text-xs font-semibold mb-1">{errors.password.message}</p>}
                {errors.confirmPassword && <p className="text-red-500 text-xs font-semibold">{errors.confirmPassword.message}</p>}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div variants={slideUp} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="h-[56px] rounded-2xl font-bold text-base shadow-xl shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 transition-all duration-300"
              >
                Create Account
              </Button>
            </motion.div>
          </form>

          {/* Footer Section */}
          <motion.div variants={fadeIn} className="mt-10 space-y-6 text-center">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 font-bold hover:text-primary-700 transition-all font-bold"
              >
                Sign in here
              </Link>
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-[80%] mx-auto font-medium">
              By joining, you agree to our{' '}
              <span className="text-slate-900 dark:text-slate-300 cursor-pointer hover:underline">Terms of Service</span> and{' '}
              <span className="text-slate-900 dark:text-slate-300 cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

