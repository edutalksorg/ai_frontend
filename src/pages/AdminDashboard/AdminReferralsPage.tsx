import React, { useState, useEffect } from 'react';
import { Save, Settings, DollarSign, Users, Shield, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import AdminLayout from '../../components/AdminLayout';
import { referralsService } from '../../services/referrals';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';

const AdminReferralsPage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({
        referrerRewardAmount: 0,
        refereeRewardAmount: 0,
        refereeDiscountPercentage: 0,
        currency: 'INR',
        bonusTier1Count: 0,
        bonusTier1Amount: 0,
        bonusTier2Count: 0,
        bonusTier2Amount: 0,
        bonusTier3Count: 0,

        bonusTier3Amount: 0,
        requireEmailVerification: true,
        requireFirstPayment: true,
        rewardPendingPeriodHours: 24,
        referralExpiryDays: 30,
        maxReferralsPerDay: 10,
        maxReferralsPerMonth: 100,
        enableIpTracking: true,
        enableDeviceFingerprinting: true,
        isActive: true,
        allowTrialCompletionReward: true,
        trialCompletionRewardMultiplier: 1.0
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await referralsService.getSettings();
            const data = (res as any)?.data || res;
            if (data) {
                setSettings(data);
            }
        } catch (error: any) {
            console.error('Failed to load referral settings:', error);
            dispatch(showToast({
                message: error.response?.data?.message || 'Failed to load settings',
                type: 'error'
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await referralsService.updateSettings(settings);
            dispatch(showToast({ message: 'Settings updated successfully', type: 'success' }));
            fetchSettings();
        } catch (error: any) {
            dispatch(showToast({
                message: error.response?.data?.message || 'Failed to update settings',
                type: 'error'
            }));
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-white dark:bg-slate-950 p-6 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-slate-600 dark:text-slate-400">Loading settings...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                                    <Settings className="text-blue-600" size={40} />
                                    Referral Settings
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Configure referral rewards and system behavior
                                </p>
                            </div>
                        </div>
                        <Button onClick={handleSave} disabled={saving} leftIcon={<Save size={18} />}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* Reward Settings */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <DollarSign className="text-green-500" size={24} />
                                Reward Configuration
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Referrer Reward Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.referrerRewardAmount}
                                        onChange={(e) => handleChange('referrerRewardAmount', parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Referee Reward Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.refereeRewardAmount}
                                        onChange={(e) => handleChange('refereeRewardAmount', parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Referee Discount (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.refereeDiscountPercentage}
                                        onChange={(e) => handleChange('refereeDiscountPercentage', parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Currency
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.currency}
                                        onChange={(e) => handleChange('currency', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bonus Tiers */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Users className="text-blue-500" size={24} />
                                Bonus Tiers
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Tier 1 */}
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 space-y-4">
                                    <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Tier 1</h4>
                                    <div>
                                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Referrals Required</label>
                                        <input
                                            type="number"
                                            value={settings.bonusTier1Count}
                                            onChange={(e) => handleChange('bonusTier1Count', parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Bonus Amount</label>
                                        <input
                                            type="number"
                                            value={settings.bonusTier1Amount}
                                            onChange={(e) => handleChange('bonusTier1Amount', parseFloat(e.target.value) || 0)}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Tier 2 */}
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 space-y-4">
                                    <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Tier 2</h4>
                                    <div>
                                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Referrals Required</label>
                                        <input
                                            type="number"
                                            value={settings.bonusTier2Count}
                                            onChange={(e) => handleChange('bonusTier2Count', parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Bonus Amount</label>
                                        <input
                                            type="number"
                                            value={settings.bonusTier2Amount}
                                            onChange={(e) => handleChange('bonusTier2Amount', parseFloat(e.target.value) || 0)}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Tier 3 */}
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 space-y-4">
                                    <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Tier 3</h4>
                                    <div>
                                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Referrals Required</label>
                                        <input
                                            type="number"
                                            value={settings.bonusTier3Count}
                                            onChange={(e) => handleChange('bonusTier3Count', parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Bonus Amount</label>
                                        <input
                                            type="number"
                                            value={settings.bonusTier3Amount}
                                            onChange={(e) => handleChange('bonusTier3Amount', parseFloat(e.target.value) || 0)}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Limits & Security */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Limits */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Clock className="text-orange-500" size={24} />
                                    Limits & Timing
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Max Referrals Per Day
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.maxReferralsPerDay}
                                            onChange={(e) => handleChange('maxReferralsPerDay', parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Max Referrals Per Month
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.maxReferralsPerMonth}
                                            onChange={(e) => handleChange('maxReferralsPerMonth', parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Reward Pending Period (Hours)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.rewardPendingPeriodHours}
                                            onChange={(e) => handleChange('rewardPendingPeriodHours', parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Referral Expiry (Days)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.referralExpiryDays}
                                            onChange={(e) => handleChange('referralExpiryDays', parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Security & Requirements */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Shield className="text-purple-500" size={24} />
                                    Security & Requirements
                                </h3>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={settings.isActive}
                                            onChange={(e) => handleChange('isActive', e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">System Active</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={settings.requireEmailVerification}
                                            onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Require Email Verification</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={settings.requireFirstPayment}
                                            onChange={(e) => handleChange('requireFirstPayment', e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Require First Payment</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={settings.enableIpTracking}
                                            onChange={(e) => handleChange('enableIpTracking', e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Enable IP Tracking</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={settings.enableDeviceFingerprinting}
                                            onChange={(e) => handleChange('enableDeviceFingerprinting', e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Enable Device Fingerprinting</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={settings.allowTrialCompletionReward}
                                            onChange={(e) => handleChange('allowTrialCompletionReward', e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Allow Trial Completion Reward</span>
                                    </label>
                                    {settings.allowTrialCompletionReward && (
                                        <div className="pl-8 pt-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Trial Completion Multiplier
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={settings.trialCompletionRewardMultiplier}
                                                onChange={(e) => handleChange('trialCompletionRewardMultiplier', parseFloat(e.target.value) || 0)}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminReferralsPage;
