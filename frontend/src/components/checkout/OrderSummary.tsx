"use client";

import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/store/cartStore";
import { getImageUrl } from "@/lib/image-utils";
import { Heart, X, Info, Minus, Plus } from "lucide-react";

interface Coupon {
  code: string;
  discount: number;
}

interface OrderSummaryProps {
  coupon?: Coupon;
  shipping?: number;
  vatRate?: number;
  onPlaceOrder?: () => void;
  isOrderReady?: boolean;
  loading?: boolean;
  showPaymentInstruction?: boolean;
}

export default function OrderSummary({
  coupon,
  shipping = 0,
  vatRate = 0.16,
  onPlaceOrder,
  isOrderReady = false,
  loading = false,
  showPaymentInstruction = false,
}: OrderSummaryProps) {
  const { cart } = useCart();
  const { removeItem, increaseQuantity, decreaseQuantity } = useCartStore();

  const subtotal = cart.subTotal;
  const discount = coupon?.discount || 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 font-[DM_SANS]">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Order Summary</h2>
        <span className="text-sm text-gray-500">{cart.items.length} items</span>
      </div>

      {/* Product Items */}
      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={item.lineId} className="relative border border-gray-200 rounded-lg p-4">
            {/* Remove Button */}
            <button
              onClick={() => removeItem(item.id)}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-500 rounded-full hover:bg-primary-900 hover:text-white transition"
            >
              <X size={14} />
            </button>

            <div className="flex gap-4">
              {/* Product Image */}
              <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                {item.image ? (
                  <Image
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {item.name}
                </h3>

                {/* Price */}
                <p className="text-base font-bold text-gray-900 mt-1">
                  KES {(item.priceWithTax * item.quantity).toLocaleString()}
                </p>

                {/* Quantity Controls */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-600">Qty</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="px-2 py-1 hover:bg-gray-100 transition"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium border-x border-gray-300">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="px-2 py-1 hover:bg-gray-100 transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr className="border-gray-200" />

      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">Subtotal</span>
        <span className="font-semibold">KES {subtotal.toLocaleString()}</span>
      </div>

      {/* Delivery Fee */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">Delivery Fee</span>
        <span className="font-semibold">
          {shipping > 0 ? `KES ${shipping.toLocaleString()}` : "KES 0.00"}
        </span>
      </div>

      {/* VAT */}
      <div className="flex justify-between text-sm items-center">
        <div className="flex items-center gap-1">
          <span className="text-gray-700">VAT</span>
          <Info size={14} className="text-gray-400" />
        </div>
        <span className="font-semibold text-gray-600">Price is Inclusive of VAT</span>
      </div>

      {/* Discount */}
      {discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Coupon ({coupon?.code})</span>
          <span className="font-semibold">-KES {discount.toLocaleString()}</span>
        </div>
      )}

      <hr className="border-gray-200" />

      {/* Total */}
      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>KES {total.toLocaleString()}</span>
      </div>

      {onPlaceOrder && (
        <div className="mt-4 space-y-4">
          <button
            onClick={onPlaceOrder}
            disabled={!isOrderReady}
            className={`
              w-full py-3 rounded-lg text-white font-medium transition-colors
              ${isOrderReady
                ? 'bg-primary-900 hover:bg-primary-800'
                : 'bg-gray-400 cursor-not-allowed'
              }
            `}
          >
            {loading ? "Processing..." : "Place Order"}
          </button>

          {showPaymentInstruction && (
            <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg text-sm">
              <p className="text-primary-900">
                💳 You will be redirected to Paystack to complete your payment securely.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
