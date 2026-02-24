import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Mail, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/auth';
import Button from '../../components/Button';
import { Logo } from '../../components/common/Logo';
import { VerifyEmailIllustration } from '../../components/auth/AuthIllustrations';

const VerifyEmailPage: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const { token: paramsToken } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(5);
    const verificationStarted = React.useRef(false);

    const token = paramsToken || searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        const verify = async () => {
            if (verificationStarted.current) return;

            if (!token || !email) {
                setStatus('error');
                setMessage(t('auth.verifyEmail.invalidLink'));
                return;
            }

            try {
                verificationStarted.current = true;
                await authService.verifyEmail(email, token);
                setStatus('success');
                setMessage(t('auth.verifyEmail.successMessage'));
            } catch (error: any) {
                console.error('Verification error:', error);
                setStatus('error');
                setMessage(error.response?.data?.message || t('auth.verifyEmail.errorMessage'));
            }
        };

        verify();
    }, [token, email, t]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === 'success' && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (status === 'success' && countdown === 0) {
            navigate('/login');
        }
        return () => clearInterval(timer);
    }, [status, countdown, navigate]);

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

    const iconVariants: Variants = {
        hidden: { scale: 0, opacity: 0 },
        loading: { rotate: 360, transition: { duration: 1, repeat: Infinity, ease: "linear" } },
        success: { scale: [0, 1.2, 1], opacity: 1, transition: { duration: 0.5, times: [0, 0.7, 1] } },
        error: { x: [-10, 10, -10, 10, 0], opacity: 1, transition: { duration: 0.4 } }
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
                    <VerifyEmailIllustration />

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center mt-8 relative z-20"
                    >
                        <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
                            Email <span className="text-[#E10600]">Verification</span>
                        </h2>
                        <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed font-medium">
                            Confirming your email address to activate your account.
                        </p>
                    </motion.div>
                </div>

                {/* RIGHT SIDE: STATUS CARD */}
                <div className="flex-1 w-full max-w-[480px] flex items-center justify-center">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full relative"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={status}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="relative overflow-hidden p-8 sm:p-10 border border-red-50 shadow-[0_20px_50px_rgba(225,6,0,0.05)] bg-white/80 backdrop-blur-xl rounded-[2.5rem] text-center"
                            >
                                {/* Card Decoration */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-[#E10600] to-red-500 opacity-20" />

                                {status === 'loading' && (
                                    <div className="py-8">
                                        <motion.div
                                            variants={iconVariants}
                                            animate="loading"
                                            className="w-20 h-20 bg-red-50 text-[#E10600] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm"
                                        >
                                            <Loader2 size={40} />
                                        </motion.div>
                                        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                                            {t('auth.verifyEmail.verifyingAccount')}
                                        </h2>
                                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                                            {t('auth.verifyEmail.pleaseWait')}
                                        </p>
                                    </div>
                                )}

                                {status === 'success' && (
                                    <div className="py-4">
                                        <motion.div
                                            variants={iconVariants}
                                            initial="hidden"
                                            animate="success"
                                            className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm"
                                        >
                                            <CheckCircle2 size={48} />
                                        </motion.div>
                                        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                                            {t('auth.verifyEmail.success')}
                                        </h2>
                                        <p className="text-slate-500 text-lg mb-8 leading-relaxed font-medium">
                                            {message}
                                        </p>
                                        <div className="bg-slate-50 rounded-2xl p-5 mb-10 border border-slate-100">
                                            <p className="text-sm text-slate-400 font-medium">
                                                {t('auth.verifyEmail.redirecting')} <span className="font-bold text-emerald-500">{countdown}s</span>...
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="relative w-full group overflow-hidden rounded-2xl bg-[#E10600] hover:bg-[#b80000] shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] h-14"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="font-black text-white uppercase tracking-[0.2em] text-sm group-hover:tracking-[0.25em] transition-all">
                                                    {t('auth.verifyEmail.goToLogin')}
                                                </span>
                                                <ArrowRight size={18} className="text-white group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {status === 'error' && (
                                    <div className="py-4">
                                        <motion.div
                                            variants={iconVariants}
                                            animate="error"
                                            className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm"
                                        >
                                            <XCircle size={48} />
                                        </motion.div>
                                        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                                            {t('auth.verifyEmail.error')}
                                        </h2>
                                        <p className="text-slate-500 text-lg mb-8 leading-relaxed font-medium">
                                            {message || t('auth.verifyEmail.errorMessage')}
                                        </p>
                                        <div className="space-y-4">
                                            <button
                                                onClick={() => navigate('/resend-confirmation')}
                                                className="relative w-full group overflow-hidden rounded-2xl bg-[#E10600] hover:bg-[#b80000] shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] h-14"
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <Mail size={18} className="text-white" />
                                                    <span className="font-black text-white uppercase tracking-[0.2em] text-sm group-hover:tracking-[0.25em] transition-all">
                                                        {t('auth.verifyEmail.requestNewLink')}
                                                    </span>
                                                </div>
                                            </button>
                                            <Link
                                                to="/login"
                                                className="block text-slate-400 hover:text-[#E10600] font-bold text-xs uppercase tracking-widest transition-colors"
                                            >
                                                {t('auth.verifyEmail.backToLogin')}
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
