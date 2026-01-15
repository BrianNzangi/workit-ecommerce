"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { CouponInput } from "@/components/checkout/CouponInput";

interface CartSummaryProps {
  subtotal: number;
}

export default function CartSummary({ subtotal }: CartSummaryProps) {
  const { cart } = useCart();
  const { customer } = useAuth();
  const router = useRouter();

  const [discount, setDiscount] = useState(0);

  const discountedTotal = subtotal - discount;

  const handleApplyCoupon = (data: any) => {
    setDiscount(data.discountAmount);
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
  };

  const handleCheckout = () => {
    if (!customer) {
      router.push("/login");
      return;
    }

    if (cart.items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    router.push("/checkout");
  };

  return (
    <div className="border border-gray-100 rounded-sm p-5 bg-gray-50 space-y-4">
      <h2 className="text-lg font-semibold">Order Summary</h2>

      {/* Coupon */}
      <div className="space-y-1">
        <CouponInput
          subtotal={subtotal}
          onApply={handleApplyCoupon}
          onRemove={handleRemoveCoupon}
        />
      </div>

      {/* Totals */}
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>KES {subtotal.toFixed(2)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Discount</span>
          <span>-KES {discount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold text-base border-t pt-2">
        <span>Total</span>
        <span>KES {discountedTotal.toFixed(2)}</span>
      </div>

      <button
        onClick={handleCheckout}
        className="w-full bg-primary-900 text-white py-3 rounded text-sm font-bold uppercase tracking-wide hover:opacity-90 transition shadow-lg shadow-primary-900/20"
      >
        Proceed to Checkout
      </button>

      <div className="text-xs text-gray-500 mt-3 space-y-1 leading-snug">
        <p>Workit protects your payment information</p>
        <p>Every transaction is secure and encrypted</p>
        <p>We do not store your payment card's CVV, ensuring your privacy</p>
      </div>
    </div>
  );
}