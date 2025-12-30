import React from 'react';
import { Tag, Check, X, Ticket, ArrowRight, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/Button';
import { useDispatch } from 'react-redux';

const UserCoupons: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-500/10 rounded-xl">
                    <Ticket className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('couponsPage.title') || 'Coupons & Offers'}</h1>
                    <p className="text-sm text-slate-500">Manage and redeem your promo codes</p>
                </div>
            </div>

            {/* Info Section - Glass Panel */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -mr-10 -mt-10" />

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20 text-white rotate-3">
                            <Tag size={32} />
                        </div>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                {t('couponsPage.howToUse')}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Follow these simple steps to apply your promotional codes and get discounts on subscriptions.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">1</span>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{t('couponsPage.step1')}</p>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">2</span>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{t('couponsPage.step2')}</p>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">3</span>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{t('couponsPage.step3')}</p>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs">4</span>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{t('couponsPage.step4')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-100 dark:border-blue-500/10">
                            <HelpCircle size={18} className="flex-shrink-0" />
                            <p>Coupons are applied directly at the checkout page when purchasing a subscription plan.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty State / Placeholder for future list */}
            <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center border-dashed border-2 border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                    <Ticket className="text-slate-400" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Active Coupons</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                    You don't have any saved coupons at the moment. Keep an eye out for special promotions!
                </p>
            </div>
        </div>
    );
};

export default UserCoupons;
