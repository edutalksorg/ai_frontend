import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
        { label: t('auth.reqLength'), met: newPasswordValue.length >= 8 },
        { label: t('auth.reqUppercase'), met: /[A-Z]/.test(newPasswordValue) },
        { label: t('auth.reqLowercase'), met: /[a-z]/.test(newPasswordValue) },
        { label: t('auth.reqNumber'), met: /[0-9]/.test(newPasswordValue) },
        { label: t('auth.reqSpecial'), met: /[!@#$%^&*]/.test(newPasswordValue) },
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
        <div className="h-[100dvh] w-full relative flex overflow-hidden bg-white selection:bg-red-500/20">
            {/* UNIFIED BACKGROUND - Premium Red-White Aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-[#E10600] to-white opacity-[0.03]" />
            <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-[0.02]" />

            {/* Shared Ambient Glows - Branding Tints */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Back Button */}
            <Link to="/settings" className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-red-50 hover:border-red-200 transition-all text-slate-500 hover:text-[#E10600] group">
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
                    <ChangePasswordIllustration />

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center mt-8 relative z-20"
                    >
                        <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
                            {t('profilePage.changePassword').split(' ')[0]} {t('wallet.your')} <span className="text-[#E10600]">{t('profilePage.changePassword').split(' ')[1]}</span>
                        </h2>
                        <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed font-medium">
                            {t('settingsPage.security.changePasswordDesc')}
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
                                <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{t('profilePage.changePassword')}</h1>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">{t('settingsPage.security.changePasswordDesc')}</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                {/* Current Password */}
                                <div className="space-y-1.5 group">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 group-focus-within:text-[#E10600] transition-colors">
                                        {t('profilePage.currentPassword')}
                                    </label>
                                    <div className={`relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 transition-all group-focus-within:bg-white group-focus-within:border-[#E10600]/30 group-focus-within:ring-4 group-focus-within:ring-[#E10600]/5 ${errors.currentPassword ? 'border-red-500/50' : ''}`}>
                                        <Lock className="w-4 h-4 text-slate-400 mr-3 group-focus-within:text-[#E10600] transition-colors" />
                                        <input
                                            {...register('currentPassword')}
                                            type={showCurrentPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="flex-1 bg-transparent border-none outline-none text-slate-900 text-sm font-semibold placeholder-slate-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="text-slate-300 hover:text-slate-600 transition-colors"
                                        >
                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.currentPassword && (
                                        <p className="text-red-500 text-[10px] font-bold ml-1 pt-1">{errors.currentPassword.message}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div className="space-y-1.5 group">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 group-focus-within:text-[#E10600] transition-colors">
                                        {t('profilePage.newPassword')}
                                    </label>
                                    <div className={`relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 transition-all group-focus-within:bg-white group-focus-within:border-[#E10600]/30 group-focus-within:ring-4 group-focus-within:ring-[#E10600]/5 ${errors.newPassword ? 'border-red-500/50' : ''}`}>
                                        <Lock className="w-4 h-4 text-slate-400 mr-3 group-focus-within:text-[#E10600] transition-colors" />
                                        <input
                                            {...register('newPassword')}
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="flex-1 bg-transparent border-none outline-none text-slate-900 text-sm font-semibold placeholder-slate-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="text-slate-300 hover:text-slate-600 transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.newPassword && (
                                        <p className="text-red-500 text-[10px] font-bold ml-1 pt-1">{errors.newPassword.message}</p>
                                    )}

                                    <div className="mt-4 space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('auth.passwordRequirements')}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                            {passwordRequirements.map((req, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${req.met
                                                        ? 'bg-emerald-50 text-emerald-500 shadow-sm shadow-emerald-500/10'
                                                        : 'bg-slate-200 text-slate-400'
                                                        }`}>
                                                        {req.met ? (
                                                            <Check size={10} strokeWidth={4} />
                                                        ) : (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                        )}
                                                    </div>
                                                    <span className={`text-[10px] font-bold transition-all ${req.met ? 'text-slate-400 line-through' : 'text-slate-500'
                                                        }`}>
                                                        {req.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5 group">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 group-focus-within:text-[#E10600] transition-colors">
                                        {t('profilePage.confirmPassword')}
                                    </label>
                                    <div className={`relative flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 transition-all group-focus-within:bg-white group-focus-within:border-[#E10600]/30 group-focus-within:ring-4 group-focus-within:ring-[#E10600]/5 ${errors.confirmPassword ? 'border-red-500/50' : ''}`}>
                                        <Lock className="w-4 h-4 text-slate-400 mr-3 group-focus-within:text-[#E10600] transition-colors" />
                                        <input
                                            {...register('confirmPassword')}
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="flex-1 bg-transparent border-none outline-none text-slate-900 text-sm font-semibold placeholder-slate-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="text-slate-300 hover:text-slate-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-[10px] font-bold ml-1 pt-1">{errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="relative w-full group overflow-hidden rounded-2xl bg-[#E10600] hover:bg-[#b80000] shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
                                    >
                                        <div className="relative h-14 flex items-center justify-center">
                                            {isLoading ? (
                                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                            ) : (
                                                <span className="font-black text-white uppercase tracking-[0.2em] text-sm group-hover:tracking-[0.25em] transition-all">{t('profilePage.changePassword')}</span>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
