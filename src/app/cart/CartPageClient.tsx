"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import CartEmpty from "@/components/cart/CartEmpty";

export default function CartPageClient() {
  const { items, clearCart } = useCartStore();

  const cartTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <section className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-12 py-6 font-[DM_SANS] space-y-4">
      {items.length === 0 ? (
        <CartEmpty />
      ) : (
        <>
          <h1 className="text-2xl font-semibold">Shopping Cart</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-6">
              {items.map((item) => (
                <CartItem key={item.id} {...item} />
              ))}

              <div className="flex items-center justify-start gap-4 mt-6">
                <Link
                  href="/products"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Continue Shopping
                </Link>

                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:underline"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Summary */}
            <CartSummary subtotal={cartTotal} />
          </div>
        </>
      )}
    </section>
  );
}
