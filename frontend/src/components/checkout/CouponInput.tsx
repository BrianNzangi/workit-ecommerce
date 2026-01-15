'use client';

import { useState } from 'react';
import { Tag, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface DiscountData {
    success: boolean;
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    discountAmount: number;
    message: string;
}

interface Props {
    subtotal: number;
    onApply: (discount: DiscountData) => void;
    onRemove: () => void;
}

export function CouponInput({ subtotal, onApply, onRemove }: Props) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

    const handleApply = async () => {
        if (!code.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, subtotal })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                onApply(data);
                setAppliedCoupon(data.code);
                toast.success(data.message);
            } else {
                const errorMessage = data.error || 'Invalid coupon code';
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to validate coupon');
            toast.error('Failed to validate coupon');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setAppliedCoupon(null);
        setCode('');
        setError(null);
        onRemove();
    };

    if (appliedCoupon) {
        return (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                    <Tag className="w-4 h-4" />
                    <span className="font-bold text-sm uppercase">{appliedCoupon} Applied</span>
                </div>
                <button
                    onClick={handleRemove}
                    className="text-green-700 hover:text-green-900 transition-colors"
                    aria-label="Remove coupon"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label htmlFor="coupon-input" className="text-sm font-medium">
                Coupon Code
            </label>
            <div className="flex gap-2">
                <input
                    id="coupon-input"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Discount code"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-900 focus:border-primary-900 outline-none text-sm transition-all"
                    disabled={loading}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApply();
                        }
                    }}
                />
                <button
                    onClick={handleApply}
                    disabled={loading || !code.trim()}
                    className="px-6 py-2 bg-secondary-900 text-white rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium transition-all"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply'}
                </button>
            </div>
            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        </div>
    );
}
