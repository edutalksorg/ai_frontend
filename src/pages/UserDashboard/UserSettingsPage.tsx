import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Lock, Bell, Moon, Sun, Globe, ArrowLeft, Shield, Eye } from 'lucide-react';
import UserLayout from '../../components/UserLayout';
import Button from '../../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, showToast } from '../../store/uiSlice';
import { RootState } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp } from '../../constants/animations';

const UserSettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { theme } = useSelector((state: RootState) => state.ui);

    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        browser: true,
        marketing: false
    });

    const handleSave = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoading(false);
        dispatch(showToast({ message: 'Configuration Synchronized', type: 'success' }));
    };

    const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary-600/10 rounded-2xl flex items-center justify-center text-primary-600 shadow-inner shadow-primary-500/5">
                <Icon size={24} />
            </div>
            <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                    {title}
                </h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-70">
                    {subtitle}
                </p>
            </div>
        </div>
    );

    return (
        <UserLayout>
            <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
                {/* Header */}
                <motion.div
                    initial="initial" animate="animate" variants={fadeIn}
                    className="flex items-center gap-8"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="w-14 h-14 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-primary-500/10 dark:border-white/5 text-primary-600 dark:text-white transition-all hover:shadow-primary-500/10 hover:scale-105"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-tight">
                            <span className="text-primary-600 dark:text-primary-400">SETTINGS</span>
                        </h1>
                        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
                            Operational Hub & Preference Architect
                        </p>
                    </div>
                </motion.div>

                <div className="space-y-10">
                    {/* Appearance Section */}
                    <motion.div initial="initial" animate="animate" variants={slideUp} transition={{ delay: 0.1 }}
                        className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                        <SectionHeader
                            icon={Eye}
                            title="Visual Interface"
                            subtitle="Theme Preference Engine"
                        />

                        <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50/50 dark:bg-white/5 rounded-[1.5rem] border border-primary-500/5 group hover:bg-white dark:hover:bg-white/10 transition-all gap-6">
                            <div className="text-center sm:text-left">
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Theme Interface</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Synchronize the interface with your environmental lighting</p>
                            </div>
                            <Button
                                size="md"
                                onClick={() => dispatch(toggleTheme())}
                                className="h-10 px-8 rounded-xl bg-primary-600 text-white font-black uppercase tracking-[0.2em] text-[8px] shadow-lg shadow-primary-500/20 hover:scale-105 transition-all border-none"
                            >
                                {theme === 'dark' ? <Sun size={14} className="mr-2" /> : <Moon size={14} className="mr-2" />}
                                {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
                            </Button>
                        </div>
                    </motion.div>

                    {/* Notifications Section */}
                    <motion.div initial="initial" animate="animate" variants={slideUp} transition={{ delay: 0.2 }}
                        className="glass-card p-6 md:p-8 rounded-3xl"
                    >
                        <SectionHeader
                            icon={Bell}
                            title="Alert Matrix"
                            subtitle="Communication & Distribution Control"
                        />

                        <div className="space-y-4">
                            {[
                                { id: 'email', title: 'Email Relay', desc: 'Secure delivery of summaries and account alerts' },
                                { id: 'browser', title: 'Push Relay', desc: 'Real-time synchronization with system signals' }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-primary-500/5 hover:bg-white dark:hover:bg-white/10 transition-all group">
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">{item.title}</p>
                                        <p className="text-[10px] font-bold text-slate-500 opacity-70 group-hover:opacity-100 transition-opacity uppercase tracking-wider">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={(notifications as any)[item.id]}
                                            onChange={e => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-slate-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Security Section */}
                    <motion.div initial="initial" animate="animate" variants={slideUp} transition={{ delay: 0.3 }}
                        className="glass-card p-6 md:p-8 rounded-3xl"
                    >
                        <SectionHeader
                            icon={Shield}
                            title="Security Core"
                            subtitle="Identity & Access Calibration"
                        />

                        <div className="p-6 bg-slate-50/50 dark:bg-white/5 rounded-[1.5rem] border border-primary-500/5 group hover:bg-white dark:hover:bg-white/10 transition-all">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                <div className="text-center sm:text-left">
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Access Credentials</p>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Calibrate your authentication password periodically</p>
                                </div>
                                <Button
                                    size="md"
                                    onClick={() => navigate('/change-password')}
                                    className="h-10 px-8 rounded-xl bg-primary-600 text-white font-black uppercase tracking-[0.2em] text-[8px] shadow-lg shadow-primary-500/20 hover:scale-105 transition-all border-none"
                                >
                                    CHANGE PASSWORD
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Save Footer */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        className="flex justify-end pt-6"
                    >
                        <Button
                            onClick={handleSave}
                            isLoading={loading}
                            className="h-10 px-10 rounded-xl bg-primary-600 text-white font-black uppercase tracking-[0.2em] text-[8px] shadow-xl shadow-primary-500/30 hover:scale-[1.05] active:scale-95 transition-all"
                        >
                            <Save size={14} className="mr-2" /> SAVE
                        </Button>
                    </motion.div>
                </div>
            </div>
        </UserLayout>
    );
};

export default UserSettingsPage;
