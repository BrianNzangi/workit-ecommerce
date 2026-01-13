"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function CartEmpty() {
  return (
    <div className="text-center text-gray-600 mt-20 space-y-6">
      <div className="flex justify-center">
        <ShoppingCart className="w-12 h-12 text-gray-400" />
      </div>
      <p className="text-lg font-medium">Your cart is empty</p>
      <div className="flex justify-center gap-4">
        <Link
          href="/login"
          className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
        >
          LOGIN / REGISTER
        </Link>
        <Link
          href="/"
          className="px-4 py-2 border border-gray-300 text-sm rounded hover:border-gray-600"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
}