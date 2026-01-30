import React, { useState, useEffect } from 'react';

interface OnlineStatusIndicatorProps {
    showLabel?: boolean;
}


const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({ showLabel = false }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // Listen to online/offline events
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Also track visibility changes
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // User switched tabs/minimized - still consider online if network is up
                setIsOnline(navigator.onLine);
            } else {
                // User returned - check network status
                setIsOnline(navigator.onLine);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    if (showLabel) {
        return (
            <div className="flex items-center gap-2">
                <div className={`relative w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}>
                    {isOnline && (
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    )}
                </div>
                <span className={`text-sm font-medium ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                </span>
            </div>
        );
    }

    return (
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white dark:border-slate-900 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}>
            {isOnline && (
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            )}
        </div>
    );
};

export default OnlineStatusIndicator;
