import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

// Helper component

// Helper component deleted line 16

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

  const registerSchema = React.useMemo(() => z
    .object({
      fullName: z.string().min(2, t('auth.validation.fullNameMin')),
      email: z.string().email(t('auth.validation.emailInvalid')),
      phoneNumber: z.string().regex(/^\d{10}$/, t('auth.validation.phoneDigits')),
      // Password rules: at least 8 chars, at least one digit, at least one special char
      password: z
        .string()
        .min(8, t('auth.validation.passwordMin'))
        .regex(/[A-Z]/, t('auth.validation.passwordUppercase'))
        .regex(/[a-z]/, t('auth.validation.passwordLowercase'))
        .regex(/[0-9]/, t('auth.validation.passwordNumber'))
        .regex(/[!@#$%^&*]/, t('auth.validation.passwordSpecial')),
      confirmPassword: z.string(),
      // Role is fixed to 'user' for public registration
      role: z.literal('user').default('user'),
      referralCode: z.string().optional(),
      referralSource: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.validation.passwordMatch'),
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
    defaultValues: {
      role: 'user',
    },
  });

  const passwordValue = watch('password') || '';

  const passwordRequirements = [
    { label: t('auth.reqLength'), met: passwordValue.length >= 8 },
    { label: t('auth.reqUppercase'), met: /[A-Z]/.test(passwordValue) },
    { label: t('auth.reqLowercase'), met: /[a-z]/.test(passwordValue) },
    { label: t('auth.reqNumber'), met: /[0-9]/.test(passwordValue) },
    { label: t('auth.reqSpecial'), met: /[!@#$%^&*]/.test(passwordValue) },
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
          message: t('auth.registrationSuccess'),
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
        if (passwordRequiresDigit) messages.push(t('auth.validation.passwordNumber'));
        if (passwordRequiresSpecial) messages.push(t('auth.validation.passwordSpecial'));

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
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          {/* Back to Home Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 group"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {/* <span className="text-sm font-medium">Back to Home</span> */}
          </Link>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo className="scale-125" />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-white">
            {t('auth.createAccount')}
          </h1>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
            {t('auth.joinFreeTrial')}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                {t('auth.fullName')}
              </label>
              <input
                {...register('fullName')}
                type="text"
                placeholder={t('auth.fullNamePlaceholder')}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                {t('auth.emailLabel')}
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder={t('auth.enterEmail')}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                {t('auth.phoneNumber')}
              </label>
              <input
                {...register('phoneNumber')}
                type="tel"
                placeholder={t('auth.phoneNumberPlaceholder')}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.phoneNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                {t('auth.referralCode')}
              </label>
              <input
                {...register('referralCode')}
                type="text"
                placeholder={t('auth.referralCodePlaceholder')}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  placeholder=""
                  className="w-full px-4 py-2.5 pr-12 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
              )}

              <div className="mt-3 space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">{t('auth.passwordRequirements')}</p>
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${req.met
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}>
                      {req.met ? (
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </div>
                    <span className={`text-xs ${req.met ? 'text-slate-600 dark:text-slate-300 line-through opacity-50' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                {t('auth.confirmPasswordLabel')}
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder=""
                  className="w-full px-4 py-2.5 pr-12 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              className="mt-6"
            >
              {t('auth.createAccount')}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              {t('auth.login')}
            </Link>
          </p>

          {/* Privacy Notice */}
          <p className="text-xs text-slate-500 dark:text-slate-500 text-center mt-6">
            {t('auth.privacyNotice')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

