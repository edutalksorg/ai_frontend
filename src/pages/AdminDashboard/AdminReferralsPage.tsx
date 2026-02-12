import React, { useState, useEffect } from 'react';
import { Save, Settings, DollarSign, Users, Shield, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import AdminLayout from '../../components/AdminLayout';
import { referralsService } from '../../services/referrals';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../../store/uiSlice';
import { RootState } from '../../store';

const AdminReferralsPage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({
        referrerRewardAmount: 0,
        refereeRewardAmount: 0,
        refereeDiscountPercentage: 0,
        currency: 'INR',
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
        trialCompletionRewardMultiplier: 1.0,
        plans: []
    });

    const handlePlanChange = (index: number, field: string, value: any) => {
        const newPlans = [...(settings.plans || [])];
        newPlans[index] = { ...newPlans[index], [field]: value };
        setSettings({ ...settings, plans: newPlans });
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);

            // Diagnostic logging
            console.log('=== REFERRAL SETTINGS DEBUG ===');
            console.log('Current User:', user);
            console.log('User Role:', user?.role);

            // Check token
            const token = localStorage.getItem('edutalks_token');
            if (token) {
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c: string) =>
                        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                    ).join(''));
                    const payload = JSON.parse(jsonPayload);
                    console.log('Token Payload:', payload);
                    console.log('Permissions in token:', payload.permissions || payload.permission || 'No permissions found');
                } catch (e) {
                    console.error('Failed to decode token:', e);
                }
            }

            console.log('Attempting to fetch referral settings...');
            const res = await referralsService.getSettings();
            const data = (res as any)?.data || res;
            console.log('Referral settings loaded successfully:', data);

            if (data) {
                setSettings(data);
            }
        } catch (error: any) {
            console.error('=== REFERRAL SETTINGS ERROR ===');
            console.error('Full error object:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            console.error('Error message:', error.response?.data?.message || error.message);

            dispatch(showToast({
                message: error.response?.data?.message || error.response?.data?.title || 'Failed to load settings. Check console for details.',
                type: 'error'
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            console.log('Attempting to save referral settings:', settings);
            await referralsService.updateSettings(settings);
            console.log('Referral settings saved successfully');
            dispatch(showToast({ message: 'Settings updated successfully', type: 'success' }));
            fetchSettings();
        } catch (error: any) {
            console.error('=== SAVE REFERRAL SETTINGS ERROR ===');
            console.error('Full error:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);

            dispatch(showToast({
                message: error.response?.data?.message || error.response?.data?.title || 'Failed to update settings. Check console for details.',
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
                        <div className="space-y-6">


                            {/* Plan Percentage Settings */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Users className="text-indigo-500" size={24} />
                                    Plan-based Rewards (Percentage of Plan Price)
                                </h3>
                                <div className="space-y-6">
                                    {settings.plans && settings.plans.length > 0 ? (
                                        settings.plans.map((plan: any, index: number) => {
                                            if (plan.name === 'Free Trial') return null;
                                            return (
                                                <div key={plan.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="font-semibold text-lg text-slate-900 dark:text-white">{plan.name}</h4>
                                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                            Price: {plan.currency || 'INR'} {plan.price}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                                Referrer Share (%)
                                                            </label>
                                                            <div className="flex items-center gap-4">
                                                                <input
                                                                    type="number"
                                                                    value={plan.referrerRewardPercentage}
                                                                    onChange={(e) => handlePlanChange(index, 'referrerRewardPercentage', parseFloat(e.target.value) || 0)}
                                                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                                                />
                                                                <span className="text-sm text-slate-500 whitespace-nowrap">
                                                                    ≈ {plan.currency || 'INR'} {((plan.price * (plan.referrerRewardPercentage || 0)) / 100).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                                Referee Share (%)
                                                            </label>
                                                            <div className="flex items-center gap-4">
                                                                <input
                                                                    type="number"
                                                                    value={plan.refereeRewardPercentage}
                                                                    onChange={(e) => handlePlanChange(index, 'refereeRewardPercentage', parseFloat(e.target.value) || 0)}
                                                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                                                />
                                                                <span className="text-sm text-slate-500 whitespace-nowrap">
                                                                    ≈ {plan.currency || 'INR'} {((plan.price * (plan.refereeRewardPercentage || 0)) / 100).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <p className="text-slate-500 dark:text-slate-400">No active plans found to configure.</p>
                                    )}
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

                                    </div>
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
