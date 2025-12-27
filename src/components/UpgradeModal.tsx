import React from 'react';
import { X, Crown, Check, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    reason?: 'voiceCall' | 'pronunciation' | 'general';
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, reason = 'general' }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        navigate('/subscriptions');
        onClose();
    };

    const getReasonMessage = () => {
        switch (reason) {
            case 'voiceCall':
                return "You've used your daily 5 minutes of voice calls.";
            case 'pronunciation':
                return "Your 24-hour pronunciation access has expired.";
            default:
                return "Unlock unlimited access to all features.";
        }
    };

    const features = [
        'Unlimited voice calls',
        'Unlimited pronunciation practice',
        'Access to all quizzes and topics',
        'Priority AI support',
        'Ad-free experience',
        'Advanced analytics',
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header with gradient */}
                <div className="relative bg-primary-600 p-8 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/20 shadow-xl">
                            <Crown className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">Upgrade to Pro</h2>
                            <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Unlock your full potential</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 bg-[var(--bg-primary)]">
                    {/* Reason message */}
                    <div className="mb-8 p-6 glass-card border-primary-500/20 rounded-[1.5rem]">
                        <p className="text-primary-600 dark:text-primary-400 text-xs font-black uppercase tracking-widest leading-relaxed">
                            {getReasonMessage()}
                        </p>
                    </div>

                    {/* Features list */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Pro Features
                        </h3>
                        <div className="space-y-3">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-300 text-sm">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing highlight */}
                    <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                                Limited Time Offer
                            </span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            Get 20% off on annual plans
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                        >
                            Maybe Later
                        </button>
                        <button
                            onClick={handleUpgrade}
                            className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl font-medium border-none"
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
