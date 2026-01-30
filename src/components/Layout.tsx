import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  Settings,
  Wallet,
  Users,
  User,
  Ticket,
  Home,
  Moon,
  Sun,
  BookOpen,
  Mic,
} from 'lucide-react';
import { LanguageSelector } from './common/LanguageSelector';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/uiSlice';
import { Logo } from './common/Logo';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.ui);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Check if we should hide the sidebar (e.g. for Instructor Profile)
  const shouldHideSidebar = location.pathname === '/instructor/profile';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!profileRef.current) return;
      if (profileOpen && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };


    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && profileOpen) setProfileOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [profileOpen]);

  // Sidebar Logic
  const menuItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <BookOpen size={20} />, label: 'Topics', path: '/dashboard?tab=topics' },
    { icon: <Ticket size={20} />, label: 'Quizzes', path: '/dashboard?tab=quizzes' },
    { icon: <Mic size={20} />, label: 'Pronunciation', path: '/dashboard?tab=pronunciation' },
    { icon: <Wallet size={20} />, label: 'Wallet', path: '/wallet' },
    { icon: <Users size={20} />, label: 'Referrals', path: '/referrals' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  const isActiveLink = (path: string, currentPath: string, currentSearch: string) => {
    if (path.includes('?')) {
      const [base, query] = path.split('?');
      return currentPath === base && currentSearch.includes(query);
    }
    return currentPath === path;
  };

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && !shouldHideSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!shouldHideSidebar && (
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
              <Logo />
              <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                Student
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 md:py-3 rounded-xl text-sm font-medium transition-all duration-200 mx-0 md:mx-2 min-h-[44px]
                    ${isActiveLink(item.path, location.pathname, location.search)
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2 flex-shrink-0">
              <button
                onClick={() => navigate('/dashboard?tab=profile')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full bg-slate-200"
                />
                <div className="flex-1 min-w-0 text-left">
                  <p className="truncate font-medium text-slate-900 dark:text-white">{user?.fullName}</p>
                  <p className="truncate text-xs text-slate-500">View Profile</p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-14 md:h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 lg:px-8 flex-shrink-0">
          {!shouldHideSidebar && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Menu className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>
          )}
          {shouldHideSidebar && <div />} {/* Spacer if menu button is hidden */}

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <LanguageSelector />
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
