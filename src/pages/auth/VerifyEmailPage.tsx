import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Mail } from 'lucide-react';
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
        <div className="h-[100dvh] w-full relative flex overflow-hidden bg-slate-900 selection:bg-green-500/30">
            {/* UNIFIED BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-10" />

            {/* Ambient Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-green-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

            {/* Floating Particles */}
            <motion.div
                animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full blur-[1px]"
            />
            <motion.div
                animate={{ y: [0, 30, 0], x: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-green-400 rounded-full blur-[2px]"
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
                        <h2 className="text-5xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">
                            Email <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Verification</span>
                        </h2>
                        <p className="text-slate-300 text-lg max-w-md mx-auto leading-relaxed font-medium">
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
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-6">
                            <Logo className="w-12 h-12" />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={status}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass-panel-v2 relative overflow-hidden p-8 sm:p-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] text-center"
                            >
                                {/* Card Highlight */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 opacity-50" />

                                {status === 'loading' && (
                                    <div className="py-8">
                                        <motion.div
                                            variants={iconVariants}
                                            animate="loading"
                                            className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6"
                                        >
                                            <Loader2 size={40} />
                                        </motion.div>
                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            {t('auth.verifyEmail.verifyingAccount')}
                                        </h2>
                                        <p className="text-slate-400">
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
                                            className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6"
                                        >
                                            <CheckCircle2 size={48} />
                                        </motion.div>
                                        <h2 className="text-3xl font-bold text-white mb-3">
                                            {t('auth.verifyEmail.success')}
                                        </h2>
                                        <p className="text-lg text-slate-300 mb-6">
                                            {message}
                                        </p>
                                        <div className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/10">
                                            <p className="text-sm text-slate-400">
                                                {t('auth.verifyEmail.redirecting')} <span className="font-bold text-green-400">{countdown}s</span>...
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => navigate('/login')}
                                            variant="primary"
                                            fullWidth
                                            className="flex items-center justify-center gap-2 group h-12"
                                        >
                                            {t('auth.verifyEmail.goToLogin')}
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                )}

                                {status === 'error' && (
                                    <div className="py-4">
                                        <motion.div
                                            variants={iconVariants}
                                            animate="error"
                                            className="w-24 h-24 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6"
                                        >
                                            <XCircle size={48} />
                                        </motion.div>
                                        <h2 className="text-3xl font-bold text-white mb-3">
                                            {t('auth.verifyEmail.error')}
                                        </h2>
                                        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                                            {message || t('auth.verifyEmail.errorMessage')}
                                        </p>
                                        <div className="space-y-3">
                                            <Button
                                                onClick={() => navigate('/resend-confirmation')}
                                                variant="primary"
                                                fullWidth
                                                className="flex items-center justify-center gap-2 h-12"
                                            >
                                                <Mail size={18} />
                                                {t('auth.verifyEmail.requestNewLink')}
                                            </Button>
                                            <Link
                                                to="/login"
                                                className="block text-slate-400 hover:text-white font-medium transition-colors"
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
