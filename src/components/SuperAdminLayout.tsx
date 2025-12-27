import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut,
    Menu,
    Settings,
    Shield,
    Key,
    UserCog,
    Users,
    X,
    Bell
} from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { Logo } from './common/Logo';
import { ThemeToggle } from './common/ThemeToggle';

interface SuperAdminLayoutProps {
    children: React.ReactNode;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement | null>(null);

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

    // Close sidebar on mobile on initial load
    // Close sidebar on mobile on initial load and resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        };
        handleResize(); // Run on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { icon: <Shield size={20} />, label: 'Dashboard', path: '/super-admin' },
        { icon: <Settings size={20} />, label: 'Role Definitions', path: '/super-admin/role-definitions' },
        { icon: <UserCog size={20} />, label: 'User Overrides', path: '/super-admin/roles' },
        { icon: <Key size={20} />, label: 'Permissions', path: '/super-admin/permissions' },
        { icon: <Users size={20} />, label: 'All Users', path: '/super-admin/users' },
        { icon: <Users size={20} />, label: 'Admins', path: '/super-admin/admins' },
        // Add more Super Admin specific items here
    ];

    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans overflow-hidden">
            {/* Mobile Header */}
            <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between flex-shrink-0 z-30">
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Logo />
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset - y - 0 left - 0 z - 40 bg - slate - 900 text - white transition - all duration - 300 ease -in -out
md:relative md: translate - x - 0 flex flex - col h - full
                    ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:w-20 lg:w-64'}
`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className={`p - 6 border - b border - slate - 700 flex items - center justify - between ${!sidebarOpen && 'md:justify-center'} `}>
                        <div className={`flex items - center gap - 2 ${!sidebarOpen && 'md:hidden lg:flex'} `}>
                            <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-bold text-white flex-shrink-0">SA</div>
                            <span className="font-bold text-lg whitespace-nowrap">Super Admin</span>
                        </div>
                        {/* Close button for mobile */}
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`
w - full flex items - center gap - 3 px - 3 py - 3 rounded - lg text - slate - 300 hover: bg - slate - 800 hover: text - white transition - colors
                                    ${window.location.pathname === item.path ? 'bg-indigo-600 text-white' : ''}
                                    ${!sidebarOpen && 'md:justify-center lg:justify-start'}
`}
                                title={!sidebarOpen ? item.label : ''}
                            >
                                <span className="min-w-[20px]">{item.icon}</span>
                                <span className={`${!sidebarOpen && 'md:hidden lg:block'} whitespace - nowrap`}>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* User Profile Footer */}
                    <div className="p-4 border-t border-slate-800 flex-shrink-0">
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className={`w - full flex items - center gap - 3 p - 2 rounded - lg hover: bg - slate - 800 transition - colors ${!sidebarOpen && 'md:justify-center lg:justify-start'} `}
                            >
                                <img
                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'SA')}`}
                                    alt="Profile"
                                    className="w-9 h-9 rounded-full border border-slate-600 flex-shrink-0"
                                />
                                <div className={`text-left overflow-hidden ${!sidebarOpen && 'md:hidden lg:block'}`}>
                                    <p className="text-sm font-medium text-white truncate max-w-[120px]">{user?.fullName}</p>
                                    <p className="text-xs text-slate-400 truncate max-w-[120px]">Super Admin</p>
                                </div>
                            </button >

                            {/* Dropdown */}
                            <AnimatePresence>
                                {
                                    profileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                            className="absolute bottom-full left-0 w-full mb-3 glass-card rounded-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden z-[100] origin-bottom backdrop-blur-2xl bg-white/90 dark:bg-slate-900/95"
                                        >
                                            <div className="px-6 py-2 border-b border-white/10 relative z-[2]">
                                                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] opacity-80">
                                                    Identity & Access Center
                                                </span>
                                            </div>

                                            <div className="px-6 py-3 flex items-center gap-4 relative z-[2]">
                                                <img
                                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'SA')}`}
                                                    alt="Profile"
                                                    className="w-10 h-10 rounded-xl border border-white/20 shadow-lg object-cover"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-red-500 uppercase tracking-tighter italic truncate">
                                                        {user?.fullName}
                                                    </p>
                                                    <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 opacity-60">
                                                        Super Administrator
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="px-2 pb-2 relative z-[2]">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all rounded-xl font-black text-[10px] uppercase tracking-[0.2em] min-h-[44px] border border-transparent hover:border-red-500/10 mt-1"
                                                >
                                                    <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )
                                }
                            </AnimatePresence >
                        </div >
                    </div >
                </div >
            </aside >

            {/* Overlay for mobile sidebar */}
            {
                sidebarOpen && (
                    <div
                        className="md:hidden fixed inset-0 bg-black/50 z-30"
                        onClick={() => setSidebarOpen(false)}
                    />
                )
            }

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Desktop Header for toggle */}
                <header className="hidden md:flex bg-white dark:bg-slate-900 h-16 border-b border-slate-200 dark:border-slate-800 items-center px-6 justify-between flex-shrink-0">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                        <Menu size={20} />
                    </button>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div >
    );
};

export default SuperAdminLayout;
