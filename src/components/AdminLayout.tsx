import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut,
    Settings,
    Users,
    User,
    Home,
    DollarSign,
    Tag,
    CreditCard,
    Shield,
} from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { Logo } from './common/Logo';
import { ThemeToggle } from './common/ThemeToggle';
import { useAdminModules } from '../hooks/useAdminModules';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement | null>(null);

    // Fetch admin modules for navigation filtering
    const { hasModule } = useAdminModules();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!profileRef.current) return;
            if (profileOpen && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [profileOpen]);

    // All menu items with their required modules
    const allMenuItems = [
        { icon: <Home size={18} />, label: 'Dashboard', path: '/admin', module: null }, // Always visible
        { icon: <Shield size={18} />, label: 'User Management', path: '/admin', module: 'users' },
        { icon: <Users size={18} />, label: 'Referrals', path: '/admin/referrals', module: 'referrals' },
        { icon: <DollarSign size={18} />, label: 'Payments', path: '/admin/payments', module: 'payments' },
        { icon: <Tag size={18} />, label: 'Coupons', path: '/admin/coupons', module: 'coupons' },
        { icon: <CreditCard size={18} />, label: 'Subscriptions', path: '/admin/subscriptions', module: 'subscriptions' },
        { icon: <User size={18} />, label: 'Profile', path: '/admin/profile', module: null }, // Always visible
        { icon: <Settings size={18} />, label: 'Settings', path: '/admin/settings', module: null }, // Always visible
    ];

    // Filter menu items based on assigned modules
    const menuItems = allMenuItems.filter(item =>
        !item.module || hasModule(item.module)
    );

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 flex flex-col">
            <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/admin')}
                    >
                        <Logo />
                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400 hidden sm:block">
                            Admin
                        </span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 h-full">
                        <ThemeToggle />

                        <div className="h-full flex items-center relative" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg min-h-[44px] min-w-[44px]"
                            >
                                <img
                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}`}
                                    alt="Profile"
                                    className="w-9 h-9 md:w-10 md:h-10 rounded-full"
                                />
                            </button>

                            <AnimatePresence>
                                {profileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                        className="absolute right-0 top-full mt-3 w-[min(calc(100vw-2rem),16rem)] md:w-64 glass-card rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] py-3 z-[100] overflow-hidden border border-white/20 origin-top-right backdrop-blur-2xl bg-white/90 dark:bg-slate-900/95"
                                    >
                                        {/* Decorative Arrow */}
                                        <div className="absolute top-0 right-6 w-3 h-3 bg-white/90 dark:bg-slate-900/95 border-l border-t border-white/20 -translate-y-1.5 rotate-45 z-[1]" />

                                        <div className="px-6 py-2 border-b border-primary-500/10 mb-2 relative z-[2]">
                                            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] opacity-80">
                                                Identity & Access Center
                                            </span>
                                        </div>

                                        <div className="px-6 py-3 mb-2 flex items-center gap-4 relative z-[2]">
                                            <img
                                                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Admin')}`}
                                                alt="Profile"
                                                className="w-10 h-10 rounded-xl border border-white/20 shadow-lg object-cover"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-primary-500 uppercase tracking-tighter italic truncate">
                                                    {user?.fullName}
                                                </p>
                                                <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 opacity-60">
                                                    Administrator
                                                </p>
                                            </div>
                                        </div>

                                        <div className="max-h-[60vh] overflow-y-auto px-2 space-y-0.5 relative z-[2]">
                                            {menuItems.map((item) => (
                                                <button
                                                    key={item.path}
                                                    onClick={() => {
                                                        setProfileOpen(false);
                                                        navigate(item.path);
                                                    }}
                                                    className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-[10px] transition-all duration-300 rounded-xl group/item min-h-[44px] uppercase tracking-[0.15em] font-black ${location.pathname === item.path
                                                        ? 'text-primary-600 dark:text-primary-400 bg-primary-500/10 border border-primary-500/10'
                                                        : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/5 border border-transparent hover:border-primary-500/10'
                                                        }`}
                                                >
                                                    <span className={`transition-transform duration-300 ${location.pathname === item.path ? 'scale-110' : 'group-hover/item:scale-110 opacity-70'}`}>
                                                        {item.icon}
                                                    </span>
                                                    <span className="truncate">{item.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-2 px-2 border-t border-primary-500/10 pt-2 pb-1 relative z-[2]">
                                            <button
                                                onClick={() => { setProfileOpen(false); handleLogout(); }}
                                                className="w-full text-left flex items-center justify-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500/10 rounded-xl transition-all group/logout min-h-[44px] border border-transparent hover:border-red-500/10"
                                            >
                                                <LogOut size={16} className="group-hover/logout:translate-x-1 transition-transform" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </nav>
            </header>

            <main className="flex-1">
                <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">{children}</div>
            </main>
        </div>
    );
};

export default AdminLayout;
