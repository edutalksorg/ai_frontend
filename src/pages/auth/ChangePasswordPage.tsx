import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { Lock, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Button from '../../components/Button';
import { authService } from '../../services/auth';
import { showToast } from '../../store/uiSlice';
import { AppDispatch } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp } from '../../constants/animations';

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'At least one uppercase required')
            .regex(/[a-z]/, 'At least one lowercase required')
            .regex(/[0-9]/, 'At least one number required')
            .regex(/[!@#$%^&*]/, 'At least one special character required'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
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
        { label: 'Min 8 Characters', met: newPasswordValue.length >= 8 },
        { label: 'Uppercase Letter', met: /[A-Z]/.test(newPasswordValue) },
        { label: 'Lowercase Letter', met: /[a-z]/.test(newPasswordValue) },
        { label: 'Numeric Digit', met: /[0-9]/.test(newPasswordValue) },
        { label: 'Special Symbol', met: /[!@#$%^&*]/.test(newPasswordValue) },
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
                    message: 'Access Credentials Synchronized',
                    type: 'success',
                })
            );

            reset();
            setTimeout(() => navigate(-1), 1000);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Access synchronization failed';
            dispatch(showToast({ message: errorMessage, type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030014] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#2563eb15,transparent_70%)]" />

            <motion.div
                initial="initial" animate="animate" variants={fadeIn}
                className="w-full max-w-lg relative z-10"
            >
                {/* Back Button */}
                <Link
                    to="/settings"
                    className="w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 text-white transition-all hover:bg-white/10 mb-8 group"
                >
                    <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                </Link>

                <div className="glass-card p-10 md:p-14 rounded-[3rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/20">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">
                                Change Password
                            </h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-70">
                                Identity & Access Security Center
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Current Password */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-white uppercase tracking-widest ml-1">
                                Current Password
                            </label>
                            <div className="relative group">
                                <input
                                    {...register('currentPassword')}
                                    type={showCurrentPassword ? "text" : "password"}
                                    className="w-full h-14 pl-6 pr-14 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-primary-600 focus:bg-white/10 transition-all font-bold text-sm tracking-widest"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-1 animate-pulse">
                                    {errors.currentPassword.message}
                                </p>
                            )}
                        </div>

                        {/* New Password */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-white uppercase tracking-widest ml-1">
                                    New Password
                                </label>
                                <div className="relative group">
                                    <input
                                        {...register('newPassword')}
                                        type={showNewPassword ? "text" : "password"}
                                        className="w-full h-14 pl-6 pr-14 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-primary-600 focus:bg-white/10 transition-all font-bold text-sm tracking-widest"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-1 animate-pulse">
                                        {errors.newPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* Requirements Matrix */}
                            <div className="grid grid-cols-2 gap-3 p-6 bg-white/5 rounded-[1.5rem] border border-white/5">
                                {passwordRequirements.map((req, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500 ${req.met
                                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                            : 'bg-white/10 text-slate-600'
                                            }`}>
                                            <ShieldCheck size={12} className={req.met ? "scale-110" : "scale-100 opacity-40"} />
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-500 ${req.met
                                            ? 'text-white'
                                            : 'text-slate-600'
                                            }`}>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-white uppercase tracking-widest ml-1">
                                New Password
                            </label>
                            <div className="relative group">
                                <input
                                    {...register('confirmPassword')}
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="w-full h-14 pl-6 pr-14 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-primary-600 focus:bg-white/10 transition-all font-bold text-sm tracking-widest"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-1 animate-pulse">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="h-10 w-40 rounded-xl bg-primary-600 text-white font-black uppercase tracking-[0.2em] text-[8px] shadow-2xl shadow-primary-500/30 hover:scale-[1.05] active:scale-95 transition-all mx-auto"
                            >
                                <ShieldCheck size={14} className="mr-2" /> SAVE
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ChangePasswordPage;
