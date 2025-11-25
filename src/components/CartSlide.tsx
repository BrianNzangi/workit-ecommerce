'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useVendureCart } from '@/hooks/useVendureCart';

interface CartSlideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSlide({ isOpen, onClose }: CartSlideProps) {
  const {
    cart,
    loading,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  } = useVendureCart();

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[100] border-l border-gray-200
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-lg font-[DM_Sans] font-semibold text-gray-800">Your Cart</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-red-500">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 h-[calc(100%-64px)] overflow-y-auto">
        {cart.items.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">
            <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-md font-[DM_Sans] font-medium">Your cart is empty</p>
            <p className="text-sm font-[DM_Sans] text-gray-400 mt-1">
              Looks like you haven&apos;t added anything yet.
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="flex justify-between items-center pb-2 text-xs text-gray-500 font-medium border-b border-gray-200 mb-4 px-1">
              <span>Product</span>
              <span className="pr-2">QTY</span>
            </div>

            {/* Cart Items */}
            <div className="space-y-5">
              {cart.items.map((item) => (
                <div key={item.lineId} className="flex items-start justify-between gap-4">
                  {/* Image */}
                  <div className="w-16 h-16 border border-secondary-200 rounded-xs relative">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover scale-90"
                        sizes="64px"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 items-start">
                    <p className="text-sm text-gray-800 line-clamp-2">
                      {item.name}
                    </p>
                    <div className="flex items-center justify-start gap-4 mt-1">
                      <p className="text-sm text-secondary-900 font-semibold">
                        KES {(item.priceWithTax * item.quantity).toFixed(2)}
                      </p>

                      <button
                        onClick={() => removeItem(item.lineId)}
                        className="text-xs text-red-500 hover:underline"
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center border border-secondary-300 rounded-xs px-2 py-1 gap-2">
                    <button
                      onClick={() => decreaseQuantity(item.lineId)}
                      className="text-gray-600 hover:text-black disabled:opacity-50"
                      disabled={loading}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(item.lineId)}
                      className="text-gray-600 hover:text-black disabled:opacity-50"
                      disabled={loading}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Total */}
            <div className="mt-8 px-1 flex justify-end items-center">
              <p className="text-base text-gray-800 font-semibold">
                Total: KES {cart.total.toFixed(2)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="absolute bottom-0 left-0 w-full px-5 py-4 bg-white border-t border-gray-100 flex gap-3">
        <Link
          href="/cart"
          onClick={onClose}
          className="w-full text-center bg-white border border-secondary-300 text-gray-800 py-2 rounded-xs text-sm font-[DM_Sans] font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          View Cart
        </Link>

        <Link
          href="/checkout"
          onClick={onClose}
          className="w-full text-center bg-primary-900 text-white py-2 rounded-xs text-sm font-[DM_Sans] font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ pointerEvents: cart.items.length === 0 ? 'none' : 'auto' }}
        >
          Checkout Now
        </Link>
      </div>
    </div>
  );
}
