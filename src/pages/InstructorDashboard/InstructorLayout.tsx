import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    FileQuestion,
    Mic,
    Settings,
    LogOut,
    Menu,
    Bell
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { ThemeToggle } from '../../components/common/ThemeToggle';

interface InstructorLayoutProps {
    children: React.ReactNode;
}

const InstructorLayout: React.FC<InstructorLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/instructor-dashboard' },
        { icon: <BookOpen size={20} />, label: 'Topics', path: '/instructor/topics' },
        { icon: <FileQuestion size={20} />, label: 'Quizzes', path: '/instructor/quizzes' },
        { icon: <Mic size={20} />, label: 'Pronunciation', path: '/instructor/pronunciation' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/instructor/settings' },
    ];

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-50 h-full w-full md:w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0
          transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-14 md:h-16 flex items-center px-4 md:px-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            EduTalks
                        </span>
                        <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                            Generic
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                  flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mx-0 md:mx-2 min-h-[44px]
                  ${isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }
                `}
                                onClick={() => setSidebarOpen(false)}
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Profile & Logout - Premium Style */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2 flex-shrink-0">
                        <div className="px-2 py-2 mb-1">
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] opacity-80">
                                Identity & Access Center
                            </span>
                        </div>

                        <NavLink
                            to="/instructor/profile"
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-500/5 transition-all group border border-transparent hover:border-primary-500/10"
                        >
                            <div className="relative">
                                <img
                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-xl border border-white/20 shadow-lg object-cover"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm" />
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="text-xs font-black text-primary-500 uppercase tracking-tighter italic truncate">
                                    {user?.fullName}
                                </p>
                                <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 opacity-60 truncate">
                                    Certified Instructor
                                </p>
                            </div>
                        </NavLink>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 mt-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] min-h-[44px] border border-transparent hover:border-red-500/10"
                        >
                            <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Header */}
                <header className="h-14 md:h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-6 lg:px-8 flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <ThemeToggle />
                        <button className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 relative min-h-[44px] min-w-[44px] flex items-center justify-center">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default InstructorLayout;
