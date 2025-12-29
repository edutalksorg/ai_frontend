import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Save, Lock, Bell, Moon, Sun, Globe, ArrowLeft } from 'lucide-react';
import UserLayout from '../../components/UserLayout';
import Button from '../../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, showToast } from '../../store/uiSlice';
import { RootState } from '../../store';

const UserSettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { theme } = useSelector((state: RootState) => state.ui);
    const { user } = useSelector((state: RootState) => state.auth);

    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        browser: true,
        marketing: false
    });

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        dispatch(showToast({ message: t('settingsPage.saveSuccess'), type: 'success' }));
    };

    return (
        <UserLayout>
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-full transition-colors text-blue-600 dark:text-blue-400"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settingsPage.title')}</h1>
                        <p className="text-slate-600 dark:text-slate-400">{t('settingsPage.subtitle')}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Appearance */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-white">
                            <Moon className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">{t('settingsPage.appearance.title')}</h2>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">{t('settingsPage.appearance.themePref')}</p>
                                <p className="text-sm text-slate-500">{t('settingsPage.appearance.themeDesc')}</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => dispatch(toggleTheme())}
                                leftIcon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            >
                                {theme === 'dark' ? t('settingsPage.appearance.lightMode') : t('settingsPage.appearance.darkMode')}
                            </Button>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-white">
                            <Bell className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">{t('settingsPage.notifications.title')}</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-2">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{t('settingsPage.notifications.email')}</p>
                                    <p className="text-sm text-slate-500">{t('settingsPage.notifications.emailDesc')}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications.email}
                                        onChange={e => setNotifications({ ...notifications, email: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between p-2">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{t('settingsPage.notifications.browser')}</p>
                                    <p className="text-sm text-slate-500">{t('settingsPage.notifications.browserDesc')}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications.browser}
                                        onChange={e => setNotifications({ ...notifications, browser: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-white">
                            <Lock className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">{t('settingsPage.security.title')}</h2>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{t('settingsPage.security.changePassword')}</p>
                                    <p className="text-sm text-slate-500">{t('settingsPage.security.changePasswordDesc')}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/change-password')}
                                >
                                    {t('settingsPage.security.update')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSave} isLoading={loading} leftIcon={<Save size={18} />}>
                            {t('settingsPage.saveChanges')}
                        </Button>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default UserSettingsPage;
