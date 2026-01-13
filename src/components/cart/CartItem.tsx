"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { getImageUrl } from "@/lib/image-utils";

interface CartItemProps {
  lineId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CartItem({
  lineId,
  name,
  price,
  quantity,
  image,
}: CartItemProps) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 border border-gray-100 rounded-sm p-4 bg-white">
      <div className="w-24 h-24 relative bg-gray-100 rounded overflow-hidden flex-shrink-0">
        {image ? (
          <Image
            src={getImageUrl(image)}
            alt={name}
            fill
            sizes="96px"
            className="object-contain"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 line-clamp-2">
            {name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            KES {price.toFixed(0)} × {quantity}
          </p>
          <p className="text-base font-bold text-gray-900 mt-1">
            KES {(price * quantity).toFixed(0)}
          </p>
        </div>

        <div className="flex items-center mt-3 gap-3">
          <button
            onClick={() => decreaseQuantity(lineId)}
            className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition"
          >
            <Minus size={16} />
          </button>
          <span className="text-sm font-medium w-8 text-center">{quantity}</span>
          <button
            onClick={() => increaseQuantity(lineId)}
            className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => removeItem(lineId)}
            className="ml-4 text-red-500 hover:text-red-700 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
