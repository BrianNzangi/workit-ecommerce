'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { getImageUrl } from '@/lib/image/image-utils';
import { useHydrated } from '@/hooks/useHydrated';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
} from '@/components/ui/drawer';

interface CartSlideProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatPrice(price: number): string {
  return `KES ${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function CartSlide({ isOpen, onClose }: CartSlideProps) {
  const hydrated = useHydrated();
  const { items, increaseQuantity, decreaseQuantity, removeItem, getTotalQuantity } = useCartStore();

  const safeItems = hydrated ? items : [];
  const total = safeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = hydrated ? getTotalQuantity() : 0;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }} direction="right">
      <DrawerOverlay />
      <DrawerContent side="right" className="flex flex-col bg-white">
        <DrawerTitle className="sr-only">Shopping Cart</DrawerTitle>
        <div className="flex flex-col h-full">
          <DrawerHeader className="border-b border-gray-200 px-4 py-3 flex-row flex items-center justify-between gap-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900 tracking-tight">
                Cart
              </h2>
              {itemCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-md bg-primary-900 text-white text-[11px] font-medium tabular-nums">
                  {itemCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="size-8 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {safeItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="size-12 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-900">Your cart is empty</p>
                <p className="text-xs text-gray-500 mt-1 mb-6">
                  Add some products to get started!
                </p>
                <Button
                  variant="outline"
                  className="border-gray-200 text-gray-900 hover:bg-gray-50"
                  onClick={onClose}
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {safeItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                    <div className="relative size-20 shrink-0 rounded-md bg-gray-100 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center text-gray-400 text-[10px]">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.price)}
                      </p>

                      <div className="flex items-center gap-1 pt-1">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="size-7 inline-flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <Minus className="size-3.5 text-gray-600" />
                        </button>
                        <span className="text-sm font-medium min-w-8 text-center tabular-nums text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="size-7 inline-flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <Plus className="size-3.5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-2 size-7 inline-flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-500 pt-0.5">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {safeItems.length > 0 && (
            <DrawerFooter className="border-t border-gray-200 px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Subtotal</span>
                <span className="text-base font-semibold text-gray-900 tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 text-gray-900 hover:bg-gray-50"
                  asChild
                >
                  <Link href="/cart" onClick={onClose}>
                    View Cart
                  </Link>
                </Button>
                <Button
                  className="flex-1 bg-primary-900 text-white hover:bg-primary-800"
                  asChild
                >
                  <Link href="/checkout" onClick={onClose}>
                    Checkout Now
                  </Link>
                </Button>
              </div>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
