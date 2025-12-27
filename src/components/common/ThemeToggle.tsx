import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Moon, Sun } from 'lucide-react';
import { RootState } from '../../store';
import { toggleTheme } from '../../store/uiSlice';
import { motion } from 'framer-motion';

export const ThemeToggle: React.FC = () => {
    const dispatch = useDispatch();
    const { theme } = useSelector((state: RootState) => state.ui);

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => dispatch(toggleTheme())}
            className="p-2.5 rounded-xl bg-white/10 dark:bg-slate-800/50 border border-secondary-400/30 dark:border-white/10 text-primary-500 dark:text-secondary-400 hover:bg-white/20 dark:hover:bg-slate-700/50 transition-all shadow-sm"
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5" />
            ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
            )}
        </motion.button>
    );
};
