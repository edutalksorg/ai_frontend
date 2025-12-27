import React, { useState } from 'react';
import { Tag, Check, X } from 'lucide-react';
import Button from '../../components/Button';
import { couponsService } from '../../services/coupons';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';
import type { ValidateCouponResponse } from '../../types';

const UserCoupons: React.FC = () => {
    const dispatch = useDispatch();
    const [validateCode, setValidateCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidateCouponResponse | null>(null);
    const [validationError, setValidationError] = useState<string>('');

    const handleValidate = async () => {
        if (!validateCode.trim()) {
            dispatch(showToast({ message: 'Please enter a coupon code', type: 'error' }));
            return;
        }

        try {
            setValidating(true);
            setValidationError('');
            setValidationResult(null);

            // Validate coupon without specific amount (just check if code exists and is active)
            const response = await couponsService.validate({
                couponCode: validateCode.toUpperCase(),
                amount: 0, // Pass 0 to just validate existence
                itemType: 'Plan',
                itemId: '', // Empty for general validation
            });

            const couponData = (response as any)?.data || response;

            if (couponData && (couponData.discountAmount !== undefined || couponData.finalPrice !== undefined)) {
                setValidationResult(couponData);
                setValidationError('');
                dispatch(showToast({
                    message: `Coupon "${validateCode.toUpperCase()}" is valid!`,
                    type: 'success'
                }));
            } else {
                setValidationResult(null);
                const errorMsg = couponData?.message || 'Invalid or expired coupon code';
                setValidationError(errorMsg);
                dispatch(showToast({ message: errorMsg, type: 'error' }));
            }
        } catch (error: any) {
            console.error('Validation error:', error);
            setValidationResult(null);
            const errorMsg = error.response?.data?.message ||
                error.response?.data?.messages?.[0] ||
                error.message ||
                'Invalid or expired coupon';
            setValidationError(errorMsg);
            dispatch(showToast({ message: errorMsg, type: 'error' }));
        } finally {
            setValidating(false);
        }
    };

    return (
        <div className="space-y-10 max-w-4xl mx-auto">
            {/* Validation Section */}
            <div className="glass-panel p-6 md:p-10 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600/10 rounded-xl flex items-center justify-center text-primary-600">
                            <Tag size={20} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">VOUCHER <span className="text-primary-600 dark:text-primary-400">ACTIVATION</span></h3>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="ENTER COUPON CODE"
                                value={validateCode}
                                onChange={(e) => setValidateCode(e.target.value.toUpperCase())}
                                className="w-full h-14 pl-6 pr-4 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-primary-500/5 focus:border-primary-600 focus:bg-white dark:focus:bg-white/10 transition-all font-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase tracking-widest text-[10px]"
                            />
                        </div>
                        <Button
                            onClick={handleValidate}
                            isLoading={validating}
                            className="h-14 px-10 rounded-2xl bg-primary-600 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary-500/20 hover:scale-[1.02] transition-all border-none"
                        >
                            Validate
                        </Button>
                    </div>

                    {validationResult && (
                        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-[1.5rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500">
                                <Check size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Protocol Verified</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {validationResult.discountPercentage
                                        ? `${validationResult.discountPercentage}% Discount Active`
                                        : `₹${validationResult.discountAmount} Discount Verified`}
                                </p>
                            </div>
                        </div>
                    )}

                    {validationError && (
                        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[1.5rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                                <X size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Protocol Failed</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{validationError}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Section */}
            <div className="glass-card p-6 md:p-10 rounded-3xl border-primary-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-[40px] -mr-16 -mt-16 transition-all group-hover:bg-primary-600/10" />

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    <div className="w-14 h-14 bg-primary-600 dark:bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                        <Tag size={24} />
                    </div>
                    <div className="space-y-6 text-center md:text-left flex-1">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">How to Use Coupons</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operational Guidelines</p>
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                'Enter your voucher code in the field above to validate it',
                                'Apply valid vouchers during checkout for instant discounts',
                                'Each voucher has specific terms and conditions',
                                'Contact hub support for any technical inquiries'
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-4 p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-primary-500/5 group/li hover:bg-white dark:hover:bg-white/10 transition-all">
                                    <div className="w-2 h-2 rounded-full bg-primary-600 group-hover/li:scale-150 transition-transform" />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover/li:text-slate-900 dark:group-hover/li:text-white transition-colors">
                                        {text}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCoupons;
