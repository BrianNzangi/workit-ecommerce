"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@clerk/nextjs";

interface CartSummaryProps {
  subtotal: number;
}

export default function CartSummary({ subtotal }: CartSummaryProps) {
  const { items } = useCartStore();
  const { userId } = useAuth();
  const router = useRouter();

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");

  const discountedTotal = subtotal - discount;

  const applyCoupon = () => {
    if (coupon.toLowerCase() === "save10") {
      const calculatedDiscount = subtotal * 0.1;
      setDiscount(calculatedDiscount);
      setError("");
      toast.success("Coupon applied successfully!");
    } else {
      setDiscount(0);
      setError("Invalid coupon code");
      toast.error("Invalid coupon code");
    }
  };

  const handleCheckout = () => {
  if (!userId) {
    router.push("/sign-in?redirect_url=/checkout");
    return;
  }

  if (items.length === 0) {
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
        <label htmlFor="coupon" className="text-sm font-medium">
          Coupon Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="coupon"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="flex-1 border rounded px-3 py-1.5 text-sm"
            placeholder="Enter code e.g. SAVE10"
          />
          <button
            onClick={applyCoupon}
            className="text-sm bg-[#0046BE] text-white px-3 py-1.5 rounded hover:bg-black transition"
          >
            Apply
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {discount > 0 && (
          <p className="text-sm text-green-600">
            Discount applied: -KES {discount.toFixed(2)}
          </p>
        )}
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
        className="w-full bg-black text-white py-2 rounded text-sm font-semibold hover:bg-gray-800 transition"
      >
        Proceed to Checkout
      </button>

      <div className="text-xs text-gray-500 mt-3 space-y-1 leading-snug">
        <p>Workit protects your payment information</p>
        <p>Every transaction is secure and encrypted</p>
        <p>We do not store your payment card’s CVV, ensuring your privacy</p>
      </div>
    </div>
  );
}