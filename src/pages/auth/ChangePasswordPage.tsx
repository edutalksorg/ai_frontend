import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { motion, Variants } from 'framer-motion';
import { Lock, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import Button from '../../components/Button';
import { authService } from '../../services/auth';
import { showToast } from '../../store/uiSlice';
import { AppDispatch } from '../../store';
import { Logo } from '../../components/common/Logo';
import { ChangePasswordIllustration } from '../../components/auth/AuthIllustrations';


const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const ChangePasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
    });

    const newPasswordValue = watch('newPassword') || '';

    const passwordRequirements = [
        { label: 'At least 8 characters', met: newPasswordValue.length >= 8 },
        { label: 'At least 1 uppercase letter', met: /[A-Z]/.test(newPasswordValue) },
        { label: 'At least 1 lowercase letter', met: /[a-z]/.test(newPasswordValue) },
        { label: 'At least 1 number', met: /[0-9]/.test(newPasswordValue) },
        { label: 'At least 1 special character (!@#$%^&*)', met: /[!@#$%^&*]/.test(newPasswordValue) },
    ];

    const onSubmit = async (data: ChangePasswordFormData) => {
        try {
            setIsLoading(true);

            await authService.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            });

            dispatch(
                showToast({
                    message: 'Password changed successfully!',
                    type: 'success',
                })
            );

            reset();
            navigate(-1);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to change password';
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
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    return (
        <div className="h-[100dvh] w-full relative flex overflow-hidden bg-slate-900 selection:bg-blue-500/30">
            {/* UNIFIED BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-10" />

            {/* Ambient Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

            {/* Floating Particles */}
            <motion.div
                animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full blur-[1px]"
            />
            <motion.div
                animate={{ y: [0, 30, 0], x: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-blue-400 rounded-full blur-[2px]"
            />

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center p-4 lg:p-12 gap-8 lg:gap-16">

                {/* LEFT SIDE: ILLUSTRATION */}
                <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative">
                    <ChangePasswordIllustration />

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center mt-8 relative z-20"
                    >
                        <h2 className="text-5xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">
                            Secure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Account</span>
                        </h2>
                        <p className="text-slate-300 text-lg max-w-md mx-auto leading-relaxed font-medium">
                            Update your password to keep your account safe and secure.
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
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 opacity-50" />

                            {/* Back Button */}
                            <Link
                                to="/settings"
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                            >
                                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                <span className="text-sm font-medium">Back</span>
                            </Link>

                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Change Password</h1>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Update your account password</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            {...register('currentPassword')}
                                            type={showCurrentPassword ? "text" : "password"}
                                            className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.currentPassword && (
                                        <p className="text-red-400 text-sm mt-1.5">{errors.currentPassword.message}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            {...register('newPassword')}
                                            type={showNewPassword ? "text" : "password"}
                                            className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.newPassword && (
                                        <p className="text-red-400 text-sm mt-1.5">{errors.newPassword.message}</p>
                                    )}

                                    <div className="mt-3 space-y-1.5 p-3 bg-white/5 rounded-lg border border-white/5">
                                        <p className="text-xs font-medium text-slate-300 mb-2">Password must contain:</p>
                                        {passwordRequirements.map((req, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${req.met
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-slate-700 text-slate-500'
                                                    }`}>
                                                    {req.met ? (
                                                        <Check size={12} strokeWidth={3} />
                                                    ) : (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    )}
                                                </div>
                                                <span className={`text-xs ${req.met ? 'text-slate-400 line-through opacity-50' : 'text-slate-400'
                                                    }`}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            {...register('confirmPassword')}
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-red-400 text-sm mt-1.5">{errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    isLoading={isLoading}
                                    className="mt-6"
                                >
                                    Change Password
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
