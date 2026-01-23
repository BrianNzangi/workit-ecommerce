"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import CartEmpty from "@/components/cart/CartEmpty";

export default function CartPageClient() {
  const { items } = useCartStore();

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <section className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-12 py-6 font-sans space-y-4">
      {items.length === 0 ? (
        <CartEmpty />
      ) : (
        <>
          <h1 className="text-2xl font-semibold">Shopping Cart</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-6">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  lineId={item.id}
                  name={item.name}
                  price={item.price}
                  quantity={item.quantity}
                  image={item.image}
                />
              ))}

              <div className="flex items-center justify-start gap-4 mt-6">
                <Link
                  href="/"
                  className="text-sm text-primary-900 hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Delivery Information Section */}
              <div className="border border-gray-100 rounded-sm p-6 mt-12 space-y-4 bg-white/50">
                <h3 className="text-base font-bold flex items-center gap-2 text-gray-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  Delivery Information
                </h3>

                <div className="flex flex-col gap-6 text-sm text-gray-600">
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Standard Delivery</p>
                    <p>Standard Delivery is 2-4 working days.</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-1 text-primary-900">Need it faster?</p>
                    <p>
                      You can upgrade to Next Day Delivery during Checkout for Next Working Day delivery (Order before 10pm).
                      Next Day Delivery is not available outside of Mainland UK. Delivery is Monday to Friday, excluding public holidays.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 border-l-2 border-primary-900">
                    <p className="leading-relaxed">
                      Any orders placed after 10pm Friday and over the weekend will not be dispatched until Monday excluding Public Holidays.
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="md:col-span-1">
              <div className="sticky top-6">
                <CartSummary subtotal={total} />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
