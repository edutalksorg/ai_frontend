import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap, MessageCircle, Star, Sparkles, GraduationCap, BookOpen, PenTool, Lightbulb, Music, Award, TrendingUp, Users, FileText, Headphones, Mic, Mail, KeyRound, HelpCircle, RefreshCw, Send, ShieldCheck, Lock, Key, Check, AlertTriangle, Shield, MailCheck, CheckCircle, Clock, MailPlus, RotateCw } from 'lucide-react';

export const LoginIllustration = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Main Container for the Illustration */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-[400px] h-[400px] flex items-center justify-center"
            >
                {/* Glowing Background Blob */}
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/30 to-indigo-600/30 rounded-full blur-[80px] animate-pulse" />

                {/* Orbiting Elements */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[360px] h-[360px] rounded-full border border-white/5 border-dashed"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[280px] h-[280px] rounded-full border border-white/5 border-dashed"
                />

                {/* CUTE ROBOT CHARACTER */}
                <motion.div
                    animate={{ y: [-15, 15, -15], rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-20"
                >
                    {/* Robot Head/Body Composition using Lucide Icon as base but customized */}
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[3rem] shadow-[0_0_60px_rgba(139,92,246,0.3)]">
                        <Bot size={140} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" strokeWidth={1.5} />

                        {/* Animated Eyes (Blinking) */}
                        <motion.div
                            animate={{ scaleY: [1, 0.1, 1, 1, 1] }}
                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1, 0.8, 1] }} // Blink logic
                            className="absolute top-[42%] left-[32%] w-[12%] h-[8%] bg-cyan-400 rounded-full blur-[1px] shadow-[0_0_8px_cyan]"
                        />
                        <motion.div
                            animate={{ scaleY: [1, 0.1, 1, 1, 1] }}
                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1, 0.8, 1] }}
                            className="absolute top-[42%] right-[32%] w-[12%] h-[8%] bg-cyan-400 rounded-full blur-[1px] shadow-[0_0_8px_cyan]"
                        />
                    </div>

                    {/* Floating 'Chat' Bubble */}
                    <motion.div
                        animate={{ y: [-5, 5, -5], x: [5, -5, 5], scale: [1, 1.1, 1] }}
                        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                        className="absolute -top-10 -right-12 bg-indigo-500/80 backdrop-blur-md p-3 rounded-2xl rounded-bl-sm border border-white/20 shadow-lg"
                    >
                        <MessageCircle size={32} className="text-white" fill="rgba(255,255,255,0.2)" />
                    </motion.div>

                    {/* Floating 'Idea' Bulb */}
                    <motion.div
                        animate={{ y: [5, -5, 5], x: [-5, 5, -5], rotate: [-10, 10, -10] }}
                        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                        className="absolute -bottom-4 -left-12 bg-violet-500/80 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-lg"
                    >
                        <Sparkles size={32} className="text-yellow-300" fill="currentColor" />
                    </motion.div>

                    {/* Microphone - Speaking Practice */}
                    <motion.div
                        animate={{ y: [-8, 8, -8], rotate: [5, -5, 5] }}
                        transition={{ duration: 4.5, repeat: Infinity, delay: 0.8 }}
                        className="absolute -top-6 left-0 bg-pink-500/80 backdrop-blur-md p-2.5 rounded-xl border border-white/20 shadow-lg"
                    >
                        <Mic size={24} className="text-white" />
                    </motion.div>

                    {/* Headphones - Listening */}
                    <motion.div
                        animate={{ y: [6, -6, 6], x: [-3, 3, -3] }}
                        transition={{ duration: 5.5, repeat: Infinity, delay: 1.2 }}
                        className="absolute bottom-0 -right-8 bg-cyan-500/80 backdrop-blur-md p-2.5 rounded-full border border-white/20 shadow-lg"
                    >
                        <Headphones size={24} className="text-white" />
                    </motion.div>
                </motion.div>

                {/* Floating Background Icons - Learning Journey */}
                <FloatingIcon icon={<Music size={24} />} x="-40%" y="-30%" color="text-pink-400" delay={0} />
                <FloatingIcon icon={<Zap size={24} />} x="45%" y="-20%" color="text-yellow-400" delay={1} />
                <FloatingIcon icon={<Star size={24} />} x="-35%" y="40%" color="text-cyan-400" delay={2} />
                <FloatingIcon icon={<BookOpen size={20} />} x="50%" y="35%" color="text-purple-400" delay={1.5} />
                <FloatingIcon icon={<Award size={20} />} x="-45%" y="-10%" color="text-amber-400" delay={2.5} />
                <FloatingIcon icon={<TrendingUp size={20} />} x="35%" y="-45%" color="text-emerald-400" delay={0.8} />

            </motion.div>
        </div>
    );
};

export const RegisterIllustration = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Main Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-[400px] h-[400px] flex items-center justify-center"
            >
                {/* Glowing Background Blob */}
                <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/30 to-purple-600/30 rounded-full blur-[80px] animate-pulse" />

                {/* Orbiting Elements */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[340px] h-[340px] rounded-full border border-white/5 border-dashed"
                />

                {/* CUTE STUDENT/LEARNING SCENE */}
                <motion.div
                    animate={{ y: [-15, 15, -15] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-20 flex flex-col items-center"
                >
                    {/* Main Icon: Graduation Cap */}
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2.5rem] shadow-[0_0_60px_rgba(217,70,239,0.3)]">
                        <GraduationCap size={140} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" strokeWidth={1.5} />
                    </div>
                </motion.div>

                {/* Floating Book */}
                <motion.div
                    animate={{ x: [-50, -40, -50], y: [10, -10, 10], rotate: [-10, -15, -10] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-0 bg-purple-500/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl"
                >
                    <BookOpen size={40} className="text-white" />
                </motion.div>

                {/* Floating Pen */}
                <motion.div
                    animate={{ x: [50, 60, 50], y: [-20, 0, -20], rotate: [15, 25, 15] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-20 right-0 bg-fuchsia-500/80 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-xl"
                >
                    <PenTool size={36} className="text-white" />
                </motion.div>

                {/* Quiz/Test Icon */}
                <motion.div
                    animate={{ y: [-10, 10, -10], scale: [1, 1.1, 1] }}
                    transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
                    className="absolute top-10 right-10 bg-emerald-500/80 backdrop-blur-md p-3 rounded-xl border border-white/20 shadow-xl"
                >
                    <FileText size={28} className="text-white" />
                </motion.div>

                {/* Collaboration/Users Icon */}
                <motion.div
                    animate={{ x: [-5, 5, -5], y: [5, -5, 5] }}
                    transition={{ duration: 5.5, repeat: Infinity, delay: 1.5 }}
                    className="absolute bottom-10 left-10 bg-blue-500/80 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-xl"
                >
                    <Users size={28} className="text-white" />
                </motion.div>

                {/* Career Growth Icon */}
                <motion.div
                    animate={{ y: [8, -8, 8], rotate: [-5, 5, -5] }}
                    transition={{ duration: 4.5, repeat: Infinity, delay: 2 }}
                    className="absolute top-1/2 right-5 bg-amber-500/80 backdrop-blur-md p-2.5 rounded-lg border border-white/20 shadow-xl"
                >
                    <TrendingUp size={24} className="text-white" />
                </motion.div>

                {/* Floating Stars & Icons */}
                <FloatingIcon icon={<Star size={20} />} x="0%" y="-50%" color="text-yellow-300" delay={0.5} />
                <FloatingIcon icon={<Lightbulb size={24} />} x="40%" y="30%" color="text-amber-300" delay={1.5} />
                <FloatingIcon icon={<Sparkles size={24} />} x="-40%" y="20%" color="text-white" delay={2.5} />
                <FloatingIcon icon={<Award size={20} />} x="-48%" y="-35%" color="text-rose-400" delay={1.8} />
                <FloatingIcon icon={<Music size={18} />} x="48%" y="-40%" color="text-purple-400" delay={0.7} />

            </motion.div>
        </div>
    );
};

export const ForgotPasswordIllustration = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-[400px] h-[400px] flex items-center justify-center"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/30 to-orange-600/30 rounded-full blur-[80px] animate-pulse" />

                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[340px] h-[340px] rounded-full border border-white/5 border-dashed"
                />

                <motion.div
                    animate={{ y: [-15, 15, -15] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-20"
                >
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2.5rem] shadow-[0_0_60px_rgba(251,146,60,0.3)]">
                        <Mail size={140} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" strokeWidth={1.5} />
                    </div>
                </motion.div>

                <motion.div
                    animate={{ x: [-40, -30, -40], y: [10, -10, 10], rotate: [-10, -15, -10] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-4 bg-amber-500/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl"
                >
                    <KeyRound size={36} className="text-white" />
                </motion.div>

                <motion.div
                    animate={{ x: [40, 50, 40], y: [-15, 0, -15], rotate: [10, 15, 10] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-24 right-4 bg-orange-500/80 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-xl"
                >
                    <Send size={28} className="text-white" />
                </motion.div>

                <FloatingIcon icon={<HelpCircle size={24} />} x="-45%" y="-25%" color="text-amber-300" delay={0.5} />
                <FloatingIcon icon={<RefreshCw size={20} />} x="45%" y="30%" color="text-orange-400" delay={1.5} />
                <FloatingIcon icon={<Shield size={22} />} x="-40%" y="35%" color="text-yellow-300" delay={2} />
                <FloatingIcon icon={<Star size={18} />} x="40%" y="-40%" color="text-amber-400" delay={0.8} />
            </motion.div>
        </div>
    );
};

export const ResetPasswordIllustration = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-[400px] h-[400px] flex items-center justify-center"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/30 to-teal-600/30 rounded-full blur-[80px] animate-pulse" />

                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[340px] h-[340px] rounded-full border border-white/5 border-dashed"
                />

                <motion.div
                    animate={{ y: [-15, 15, -15] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-20"
                >
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2.5rem] shadow-[0_0_60px_rgba(16,185,129,0.3)]">
                        <ShieldCheck size={140} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" strokeWidth={1.5} />
                    </div>
                </motion.div>

                <motion.div
                    animate={{ x: [-45, -35, -45], y: [8, -8, 8], rotate: [-8, -12, -8] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-24 left-6 bg-emerald-500/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl"
                >
                    <Lock size={32} className="text-white" />
                </motion.div>

                <motion.div
                    animate={{ x: [45, 55, 45], y: [-12, 0, -12], rotate: [12, 18, 12] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-20 right-6 bg-teal-500/80 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-xl"
                >
                    <Key size={30} className="text-white" />
                </motion.div>

                <FloatingIcon icon={<Check size={24} />} x="-42%" y="-28%" color="text-emerald-300" delay={0.5} />
                <FloatingIcon icon={<RefreshCw size={20} />} x="48%" y="32%" color="text-teal-400" delay={1.5} />
                <FloatingIcon icon={<Award size={22} />} x="-38%" y="38%" color="text-green-300" delay={2} />
                <FloatingIcon icon={<Star size={18} />} x="42%" y="-38%" color="text-emerald-400" delay={0.8} />
            </motion.div>
        </div>
    );
};

export const ChangePasswordIllustration = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-[400px] h-[400px] flex items-center justify-center"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 rounded-full blur-[80px] animate-pulse" />

                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[340px] h-[340px] rounded-full border border-white/5 border-dashed"
                />

                <motion.div
                    animate={{ y: [-15, 15, -15] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-20"
                >
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2.5rem] shadow-[0_0_60px_rgba(59,130,246,0.3)]">
                        <Lock size={140} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" strokeWidth={1.5} />

                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute top-2 right-2 bg-blue-500/90 backdrop-blur-sm p-2 rounded-full border border-white/30"
                        >
                            <RefreshCw size={24} className="text-white" />
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    animate={{ x: [-42, -32, -42], y: [12, -12, 12] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-8 bg-blue-500/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl"
                >
                    <Shield size={32} className="text-white" />
                </motion.div>

                <motion.div
                    animate={{ x: [42, 52, 42], y: [-18, 0, -18] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-24 right-8 bg-indigo-500/80 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-xl"
                >
                    <Key size={28} className="text-white" />
                </motion.div>

                <FloatingIcon icon={<Check size={24} />} x="-44%" y="-30%" color="text-blue-300" delay={0.5} />
                <FloatingIcon icon={<ShieldCheck size={22} />} x="46%" y="34%" color="text-indigo-400" delay={1.5} />
                <FloatingIcon icon={<AlertTriangle size={20} />} x="-40%" y="36%" color="text-sky-300" delay={2} />
                <FloatingIcon icon={<Star size={18} />} x="44%" y="-36%" color="text-blue-400" delay={0.8} />
            </motion.div>
        </div>
    );
};

export const VerifyEmailIllustration = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-[400px] h-[400px] flex items-center justify-center"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-green-600/30 to-emerald-600/30 rounded-full blur-[80px] animate-pulse" />

                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[340px] h-[340px] rounded-full border border-white/5 border-dashed"
                />

                <motion.div
                    animate={{ y: [-15, 15, -15] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-20"
                >
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2.5rem] shadow-[0_0_60px_rgba(34,197,94,0.3)]">
                        <Mail size={140} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" strokeWidth={1.5} />

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ duration: 0.6, delay: 0.5, repeat: Infinity, repeatDelay: 3 }}
                            className="absolute -top-2 -right-2 bg-green-500/90 backdrop-blur-sm p-2 rounded-full border border-white/30"
                        >
                            <Check size={28} className="text-white" strokeWidth={3} />
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    animate={{ x: [-38, -28, -38], y: [10, -10, 10] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-24 left-10 bg-green-500/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl"
                >
                    <CheckCircle size={32} className="text-white" />
                </motion.div>

                <motion.div
                    animate={{ x: [38, 48, 38], y: [-14, 0, -14] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-20 right-10 bg-emerald-500/80 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-xl"
                >
                    <Send size={28} className="text-white" />
                </motion.div>

                <FloatingIcon icon={<Clock size={22} />} x="-40%" y="-32%" color="text-green-300" delay={0.5} />
                <FloatingIcon icon={<Sparkles size={24} />} x="44%" y="30%" color="text-emerald-400" delay={1.5} />
                <FloatingIcon icon={<Award size={20} />} x="-36%" y="40%" color="text-lime-300" delay={2} />
                <FloatingIcon icon={<Star size={18} />} x="40%" y="-40%" color="text-green-400" delay={0.8} />
            </motion.div>
        </div>
    );
};

export const ResendConfirmationIllustration = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-[400px] h-[400px] flex items-center justify-center"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-violet-600/30 rounded-full blur-[80px] animate-pulse" />

                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[340px] h-[340px] rounded-full border border-white/5 border-dashed"
                />

                <motion.div
                    animate={{ y: [-15, 15, -15] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-20"
                >
                    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2.5rem] shadow-[0_0_60px_rgba(139,92,246,0.3)]">
                        <Mail size={140} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" strokeWidth={1.5} />

                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-4 -right-4 bg-purple-500/90 backdrop-blur-sm p-3 rounded-full border border-white/30"
                        >
                            <RotateCw size={26} className="text-white" />
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    animate={{ x: [-40, -30, -40], y: [12, -12, 12] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-8 bg-purple-500/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl"
                >
                    <Send size={32} className="text-white" />
                </motion.div>

                <motion.div
                    animate={{ x: [40, 50, 40], y: [-16, 0, -16] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-22 right-8 bg-violet-500/80 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-xl"
                >
                    <Clock size={28} className="text-white" />
                </motion.div>

                <FloatingIcon icon={<HelpCircle size={22} />} x="-42%" y="-30%" color="text-purple-300" delay={0.5} />
                <FloatingIcon icon={<RefreshCw size={20} />} x="46%" y="32%" color="text-violet-400" delay={1.5} />
                <FloatingIcon icon={<Zap size={22} />} x="-38%" y="38%" color="text-fuchsia-300" delay={2} />
                <FloatingIcon icon={<Star size={18} />} x="42%" y="-38%" color="text-purple-400" delay={0.8} />
            </motion.div>
        </div>
    );
};

// Helper for small floating icons
const FloatingIcon = ({ icon, x, y, color, delay }: { icon: React.ReactNode, x: string, y: string, color: string, delay: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{
                opacity: { delay, duration: 0.5 },
                scale: { delay, duration: 0.5, type: "spring" },
                y: { duration: 3, repeat: Infinity, delay: delay + 1, ease: "easeInOut" }
            }}
            style={{ left: `calc(50% + ${x})`, top: `calc(50% + ${y})` }}
            className={`absolute p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 shadow-lg ${color}`}
        >
            {icon}
        </motion.div>
    );
}
