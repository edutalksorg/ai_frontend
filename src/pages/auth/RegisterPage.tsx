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

// Small helper component to show instructor-only fields.
const InstructorExtraFields: React.FC<any> = ({ register, errors }) => {
  // Determine role from select value in DOM (simple but effective here)
  const role = (document.querySelector('select[name="role"]') as HTMLSelectElement)?.value || 'user';

  if (role !== 'instructor') return null;

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Instructor Bio
        </label>
        <textarea
          {...register('instructorBio')}
          placeholder="Tell us about your teaching experience"
          className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={4}
        />
        {errors.instructorBio && (
          <p className="text-red-600 text-sm mt-1">{errors.instructorBio.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Instructor Expertise (comma separated)
        </label>
        <input
          {...register('instructorExpertise')}
          type="text"
          placeholder="Vocabulary, Pronunciation, Conversation"
          className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {errors.instructorExpertise && (
          <p className="text-red-600 text-sm mt-1">{errors.instructorExpertise.message}</p>
        )}
      </div>
    </>
  );
};

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
    role: z.enum(['user', 'instructor']).default('user'),
    referralCode: z.string().optional(),
    referralSource: z.string().optional(),
    instructorBio: z.string().optional(),
    instructorExpertise: z.string().optional(),
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

      if (data.role === 'instructor') {
        payload.instructorBio = data.instructorBio || '';
        // instructorExpertise is a comma-separated string in the form; convert to array
        payload.instructorExpertise = data.instructorExpertise
          ? data.instructorExpertise.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
      }

      const response = await authService.register(payload);

      // Do not auto-login after registration; redirect user to login page.
      dispatch(
        showToast({
          message: 'Registration successful! Please login to continue.',
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
      if (!phoneExists && !passwordRequiresDigit && !passwordRequiresSpecial) {
        const errorMessage = serverData.message || error?.message || 'Registration failed';
        dispatch(setError(errorMessage));
        dispatch(showToast({ message: errorMessage, type: 'error' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
            Join EduTalks and get 24 hours free trial
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Full Name
              </label>
              <input
                {...register('fullName')}
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="john@example.com"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Phone Number
              </label>
              <input
                {...register('phoneNumber')}
                type="tel"
                placeholder="9876543210"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.phoneNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Role
              </label>
              <select
                {...register('role')}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="user">User (Learner)</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>

            {/* Instructor fields (shown when role === 'instructor') */}
            {/** Simple approach: instructorExpertise is entered as comma-separated list */}
            {/** Use watch or re-render by reading the form value */}
            {/** We'll use a small inline watcher */}
            <InstructorExtraFields register={register} errors={errors} />

            {/* Referral Code */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Referral Code (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  {...register('referralCode')}
                  type="text"
                  placeholder="REFER2025"
                  className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const code = document.querySelector<HTMLInputElement>('input[name="referralCode"]')?.value;
                    if (!code) return;
                    try {
                      const res = await import('../../services/referrals').then(m => m.referralsService.validateCode(code));
                      // Adjust check based on API response structure.
                      // Usually validate returns { data: true/false } or throws 404
                      const isValid = (res as any)?.data === true || (res as any)?.success === true;

                      if (isValid) {
                        dispatch(showToast({ message: 'Referral code is valid!', type: 'success' }));
                      } else {
                        dispatch(showToast({ message: 'Invalid referral code', type: 'error' }));
                      }
                    } catch (err) {
                      dispatch(showToast({ message: 'Invalid or expired referral code', type: 'error' }));
                    }
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
                >
                  Check
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
              )}

              <div className="mt-3 space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Password must contain:</p>
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
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
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
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Login here
            </Link>
          </p>

          {/* Privacy Notice */}
          <p className="text-xs text-slate-500 dark:text-slate-500 text-center mt-6">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

