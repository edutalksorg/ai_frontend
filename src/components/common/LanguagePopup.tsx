import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setLanguage } from '../../store/uiSlice';
import { Globe, Check } from 'lucide-react';

import { LANGUAGES } from '../../constants/languages';

const POPUP_SEEN_KEY = 'has_seen_language_popup';


export const LanguagePopup: React.FC = () => {
    const dispatch = useDispatch();
    const { language, modal } = useSelector((state: RootState) => state.ui);
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState(language);

    useEffect(() => {
        // Only show if authenticated and hasn't seen popup
        const hasSeen = localStorage.getItem(POPUP_SEEN_KEY);
        if (isAuthenticated && !hasSeen) {
            setIsOpen(true);
            setSelectedLang(language);
        }
    }, [isAuthenticated, language]);

    const handleSave = () => {
        dispatch(setLanguage(selectedLang));
        localStorage.setItem(POPUP_SEEN_KEY, 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800">
                    <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                        <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Choose your language
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Select your preferred language for the best learning experience.
                    </p>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 gap-2">
                        {LANGUAGES.filter(lang => lang.code !== 'English').map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setSelectedLang(lang.code)}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selectedLang === lang.code
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500/50'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{lang.flag}</span>
                                    <span className={`font-medium ${selectedLang === lang.code
                                        ? 'text-blue-700 dark:text-blue-300'
                                        : 'text-slate-700 dark:text-slate-300'
                                        }`}>
                                        <span className="block text-sm font-bold">{lang.name}</span>
                                        <span className="block text-xs opacity-75">{lang.nativeName}</span>
                                    </span>
                                </div>
                                {selectedLang === lang.code && (
                                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <button
                        onClick={handleSave}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98]"
                    >
                        Save Preference
                    </button>
                </div>
            </div>
        </div>
    );
};
