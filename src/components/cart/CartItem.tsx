"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartItem({
  id,
  name,
  price,
  quantity,
  image,
}: CartItemProps) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 border border-gray-100 rounded-sm p-4 bg-white">
      <div className="w-24 h-24 relative">
        <Image
          src={image}
          alt={name}
          fill
          sizes="96px"
          className="object-cover rounded"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 line-clamp-2">
            {name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            KES {(price * quantity).toFixed(2)}
          </p>
        </div>

        <div className="flex items-center mt-3 gap-3">
          <button
            onClick={() => decreaseQuantity(id)}
            className="p-1 border rounded text-gray-600 hover:text-black"
          >
            <Minus size={16} />
          </button>
          <span className="text-sm">{quantity}</span>
          <button
            onClick={() => increaseQuantity(id)}
            className="p-1 border rounded text-gray-600 hover:text-black"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => removeItem(id)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}