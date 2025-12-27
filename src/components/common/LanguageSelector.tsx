import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { LANGUAGES, Language } from '../../constants/languages';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'edutalks_language_preference';
const DEFAULT_LANG_CODE = 'English';

export const LanguageSelector: React.FC = () => {
    // Initialize state from localStorage or default to English
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const found = LANGUAGES.find(l => l.name === saved || l.code === saved);
            if (found) return found;
        }
        return LANGUAGES.find(l => l.code === DEFAULT_LANG_CODE) || LANGUAGES[0];
    });

    const [isOpen, setIsOpen] = useState(false);
    const [showAllLanguages, setShowAllLanguages] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Persist to localStorage whenever selection changes
    useEffect(() => {
        if (selectedLanguage) {
            localStorage.setItem(STORAGE_KEY, selectedLanguage.name);
            // Dispatch custom event if other components need to know (optional but good for decoupled apps)
            window.dispatchEvent(new Event('languageChanged'));
        }
    }, [selectedLanguage]);

    // Close on click outside & Reset list view
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setTimeout(() => setShowAllLanguages(false), 200); // Reset after close animation
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (language: Language) => {
        setSelectedLanguage(language);
        setIsOpen(false);
        setShowAllLanguages(false);
    };

    // Filter languages for the "Clean" view
    // Always show English + Selected Language (if different)
    const priorityLanguages = LANGUAGES.filter(l =>
        l.code === 'English' || l.code === selectedLanguage.code
    );

    // Determine which list to show
    const displayedLanguages = showAllLanguages ? LANGUAGES : priorityLanguages;
    const hasMoreLanguages = !showAllLanguages && LANGUAGES.length > priorityLanguages.length;

    // Button Label Text
    const buttonLabel = selectedLanguage.code === 'English'
        ? 'GB ENGLISH'
        : `GB ENGLISH / ${selectedLanguage.name.toUpperCase()}`;

    return (
        <div className="relative flex items-center text-left" ref={dropdownRef}>
            {/* Dropdown Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl hover:bg-white/10 dark:hover:bg-white/10 transition-colors rounded-xl border border-primary-500/10 dark:border-white/10 group focus:outline-none focus:ring-2 focus:ring-primary-500/20 whitespace-nowrap"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Select Language"
            >
                {/* Mobile: Globe icon, Desktop: Flags */}
                <Globe size={18} className="sm:hidden text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:flex items-center text-xl leading-none group-hover:scale-105 transition-transform shrink-0">
                    {selectedLanguage.code !== 'English' && (
                        <span className="flex items-center">
                            <span>🇬🇧</span>
                            <span className="mx-1.5 text-slate-400 opacity-40">/</span>
                        </span>
                    )}
                    <span>{selectedLanguage.flag}</span>
                </span>

                <span className="hidden sm:inline text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] text-left truncate">
                    {buttonLabel}
                </span>

                <ChevronDown
                    size={14}
                    className={`text-slate-500 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, x: "-50%", scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                        exit={{ opacity: 0, y: -4, x: "-50%", scale: 0.98 }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 400,
                            mass: 0.8
                        }}
                        style={{
                            top: 'calc(100% + 6px)',
                            left: '50%'
                        }}
                        className="absolute w-full min-w-[220px] glass-panel rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-3 z-50 overflow-hidden border border-white/20 origin-top"
                        role="listbox"
                    >
                        <div className="px-6 py-3 border-b border-white/5 mb-2">
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] opacity-80">
                                Select Language Protocol
                            </span>
                        </div>

                        <div className="max-h-[340px] overflow-y-auto custom-scrollbar px-2 space-y-1">
                            {displayedLanguages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleSelect(lang)}
                                    role="option"
                                    aria-selected={selectedLanguage.code === lang.code}
                                    className={`
                                        w-full text-left flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group/item
                                        ${selectedLanguage.code === lang.code
                                            ? 'bg-primary-500/10 text-slate-900 dark:text-white border border-primary-500/10'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-white/5 border border-transparent hover:border-primary-500/5'
                                        }
                                    `}
                                >
                                    <span className="flex items-center gap-4">
                                        <span className="text-2xl leading-none group-hover/item:scale-110 transition-transform duration-300">{lang.flag}</span>
                                        <div className="flex flex-col">
                                            <span className={`text-xs uppercase tracking-widest font-black ${selectedLanguage.code === lang.code ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                                                {lang.name}
                                            </span>
                                            <span className="text-[10px] font-bold opacity-50 tracking-wide">{lang.nativeName}</span>
                                        </div>
                                    </span>
                                    {selectedLanguage.code === lang.code && (
                                        <div className="w-6 h-6 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-600/20 animate-in zoom-in-50 duration-300">
                                            <Check size={14} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}

                            {hasMoreLanguages && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAllLanguages(true);
                                    }}
                                    className="w-full text-left px-4 py-4 mt-2 text-[10px] font-black text-primary-600 dark:text-primary-400 hover:bg-primary-600/5 rounded-xl transition-all uppercase tracking-[0.2em] border-t border-primary-500/5 flex items-center gap-3 justify-center"
                                >
                                    <Globe size={14} />
                                    Master Language List
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

