import React, { useState } from 'react';
import { Volume2, Play, Pause, VolumeX } from 'lucide-react';

interface SpeakerPlayButtonProps {
    /**
     * Optional boolean to control playing state externally
     */
    isPlaying?: boolean;
    /**
     * Disable interaction, e.g. if no text is present
     */
    disabled?: boolean;
    /**
     * Show loading state while generating audio
     */
    isLoading?: boolean;
    /**
     * Callback when button is toggled
     */
    onToggle?: () => void;
}

export const SpeakerPlayButton: React.FC<SpeakerPlayButtonProps> = ({
    isPlaying: externalIsPlaying,
    disabled = false,
    isLoading = false,
    onToggle
}) => {
    // Internal state for uncontrolled usage or fallback
    const [internalIsPlaying, setInternalIsPlaying] = useState(false);

    // Determine current state (controlled vs uncontrolled)
    const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;

    const handleClick = () => {
        if (disabled || isLoading) return;

        // If not controlled, toggle internal state
        if (externalIsPlaying === undefined) {
            setInternalIsPlaying(!internalIsPlaying);
        }

        // Notify parent
        if (onToggle) {
            onToggle();
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            aria-label={isPlaying ? "Pause pronunciation" : "Listen pronunciation"}
            title={isPlaying ? "Pause" : "Listen Pronunciation"}
            className={`
                relative group flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                focus:outline-none focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/50
                ${disabled
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    : isPlaying
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-300/50 dark:shadow-blue-900/40 scale-105'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-md hover:shadow-lg hover:scale-105 hover:text-blue-600 dark:hover:text-blue-400'
                }
            `}
        >
            {/* Animated Ring Effect when playing */}
            {isPlaying && !disabled && (
                <>
                    <span className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-75 animate-ping" />
                    <span className="absolute -inset-1 rounded-full border border-blue-200 dark:border-blue-800 opacity-50 animate-pulse" />
                </>
            )}

            {/* Icon Switching Logic */}
            <div className={`relative z-10 transition-transform duration-300 ${isPlaying ? 'scale-90' : 'scale-100'}`}>
                {isLoading ? (
                    <div className="animate-spin">⟳</div>
                ) : disabled ? (
                    <VolumeX size={18} strokeWidth={2} />
                ) : isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                ) : (
                    <div className="relative">
                        <Volume2 size={18} className="group-hover:hidden transition-all duration-200" />
                        <Play size={18} fill="currentColor" className="hidden group-hover:block ml-0.5 transition-all duration-200" />
                    </div>
                )}
            </div>

            <span className="relative z-10 text-xs font-bold uppercase tracking-wider">
                {isLoading ? 'Loading...' : 'AI Voiceover'}
            </span>
        </button>
    );

};
