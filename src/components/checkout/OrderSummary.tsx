"use client";

import { useCartStore } from "@/store/cartStore";

interface Coupon {
  code: string;
  discount: number;
}

interface OrderSummaryProps {
  coupon?: Coupon;
  shipping?: number;
  vatRate?: number;
}

export default function OrderSummary({
  coupon,
  shipping = 0,
  vatRate = 0.16,
}: OrderSummaryProps) {
  const { items } = useCartStore();

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const vat = subtotal * vatRate;
  const discount = coupon?.discount || 0;
  const total = subtotal + vat + shipping - discount;

  return (
    <div className="bg-gray-100 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold">Order Summary</h2>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-base">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>Ksh. {(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <hr />

      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>Ksh. {subtotal.toLocaleString()}</span>
      </div>

      {/* VAT */}
      <div className="flex justify-between text-sm">
        <span>VAT ({(vatRate * 100).toFixed(0)}%)</span>
        <span>Ksh. {vat.toLocaleString()}</span>
      </div>

      {/* Shipping */}
      <div className="flex justify-between text-sm">
        <span>Shipping</span>
        <span>Ksh. {shipping.toLocaleString()}</span>
      </div>

      {/* Discount */}
      {discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Coupon ({coupon?.code})</span>
          <span>-Ksh. {discount.toLocaleString()}</span>
        </div>
      )}

      <hr />

      {/* Total */}
      <div className="flex justify-between font-bold text-base">
        <span>Total</span>
        <span>Ksh. {total.toLocaleString()}</span>
      </div>
    </div>
  );
}