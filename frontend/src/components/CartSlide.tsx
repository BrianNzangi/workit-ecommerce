'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { getImageUrl } from '@/lib/image-utils';

interface CartSlideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSlide({ isOpen, onClose }: CartSlideProps) {
  const { items, increaseQuantity, decreaseQuantity, removeItem, getTotalQuantity } = useCartStore();

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = getTotalQuantity();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-99 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Cart Slide */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[480px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-100 border-l border-gray-200
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-sans font-semibold text-gray-800">
            Your Cart {itemCount > 0 && `(${itemCount})`}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-red-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 h-[calc(100%-180px)] overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center text-gray-600 mt-10">
              <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-md font-sans font-medium">Your cart is empty</p>
              <p className="text-sm font-sans text-gray-400 mt-1">
                Add some products to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 shrink-0 bg-gray-100 rounded-md overflow-hidden">
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
                    <h3 className="font-sans text-sm font-medium text-gray-800 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="font-sans text-base font-bold text-gray-900 mt-1">
                      KES {Number(item.price).toFixed(0)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-sans text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100">
          {/* Total */}
          {items.length > 0 && (
            <div className="px-5 py-3 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <span className="font-sans text-base font-semibold text-gray-800">Subtotal</span>
                <span className="font-sans text-lg font-bold text-gray-900">
                  KES {total.toFixed(0)}
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="px-5 py-4 flex gap-3">
            <Link
              href="/cart"
              onClick={onClose}
              className="w-full text-center bg-white border border-secondary-300 text-gray-800 py-2 rounded-xs text-sm font-sans font-medium hover:bg-gray-50 transition"
            >
              View Cart
            </Link>

            <Link
              href="/checkout"
              onClick={onClose}
              className={`w-full text-center bg-primary-900 text-white py-2 rounded-xs text-sm font-sans font-semibold hover:bg-[#e04500] transition ${items.length === 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
            >
              Checkout Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
