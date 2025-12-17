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

            if (couponData && couponData.isValid) {
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
        <div className="space-y-6 md:space-y-8 px-4 sm:px-0">
            {/* Header / Validate Section */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl md:rounded-2xl p-6 md:p-8 text-white shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Have a Coupon Code?</h2>
                    <p className="text-pink-100 mb-6">Enter your coupon code below to validate and see the discount</p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                        <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={validateCode}
                            onChange={(e) => setValidateCode(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
                            className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-pink-100 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm uppercase"
                        />
                        <Button
                            className="bg-white text-rose-600 hover:bg-pink-50 border-none px-8"
                            onClick={handleValidate}
                            isLoading={validating}
                        >
                            {validating ? 'Checking...' : 'Validate'}
                        </Button>
                    </div>
                    {validationError && (
                        <div className="mt-6 bg-red-500/20 backdrop-blur-md rounded-xl p-4 border border-red-300/30">
                            <div className="flex items-start gap-3">
                                <X size={24} className="text-red-300 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="font-bold text-lg text-white">Invalid Coupon</p>
                                    <p className="mt-1 text-sm text-red-100">{validationError}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {validationResult && (
                        <div className="mt-6 bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30">
                            <div className="flex items-start gap-3">
                                <Check size={24} className="text-green-300 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="font-bold text-lg">Valid Coupon!</p>
                                    <div className="mt-2 space-y-1 text-sm">
                                        {validationResult.discountPercentage && (
                                            <p>• Discount: <span className="font-bold">{validationResult.discountPercentage}%</span></p>
                                        )}
                                        {validationResult.discountAmount !== undefined && (
                                            <p>• You save: <span className="font-bold">₹{validationResult.discountAmount.toFixed(2)}</span></p>
                                        )}
                                        {validationResult.finalPrice !== undefined && (
                                            <p>• Final price: <span className="font-bold">₹{validationResult.finalPrice.toFixed(2)}</span></p>
                                        )}
                                        {!validationResult.discountAmount && !validationResult.finalPrice && (
                                            <p className="text-sm">Coupon code is valid and can be applied at checkout</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                    <Tag size={32} className="text-pink-500 flex-shrink-0" />
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">How to Use Coupons</h3>
                        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                            <li>• Enter your coupon code in the field above to validate it</li>
                            <li>• Apply valid coupons during checkout to get discounts on quizzes and plans</li>
                            <li>• Each coupon has specific terms and conditions</li>
                            <li>• Contact support if you have any questions about coupons</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCoupons;
