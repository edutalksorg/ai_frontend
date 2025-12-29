import React, { useState } from 'react';
import { Tag, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/Button';
import { couponsService } from '../../services/coupons';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';
import type { ValidateCouponResponse } from '../../types';

const UserCoupons: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [validateCode, setValidateCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidateCouponResponse | null>(null);
    const [validationError, setValidationError] = useState<string>('');

    const handleValidate = async () => {
        if (!validateCode.trim()) {
            dispatch(showToast({ message: t('couponsPage.enterCode'), type: 'error' }));
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
                    message: t('couponsPage.validMessage', { code: validateCode.toUpperCase() }),
                    type: 'success'
                }));
            } else {
                setValidationResult(null);
                const errorMsg = couponData?.message || t('couponsPage.invalidMessage');
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
        <div className="space-y-6 md:space-y-8">

            {/* Info Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                    <Tag size={32} className="text-pink-500 flex-shrink-0" />
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('couponsPage.howToUse')}</h3>
                        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                            <li>• {t('couponsPage.step1')}</li>
                            <li>• {t('couponsPage.step2')}</li>
                            <li>• {t('couponsPage.step3')}</li>
                            <li>• {t('couponsPage.step4')}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCoupons;
