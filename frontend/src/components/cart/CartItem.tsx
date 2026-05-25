"use client";

import Image from "next/image";
import { Minus, Plus, Tag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";
import { getImageUrl } from "@/lib/image/image-utils";
import type { ProductPromotion } from "@/types/product";

interface CartItemProps {
  lineId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  activePromotion?: ProductPromotion | null;
}

export default function CartItem({
  lineId,
  name,
  price,
  quantity,
  image,
  activePromotion,
}: CartItemProps) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCartStore();
  const couponCode = activePromotion?.couponCode?.trim() || "";
  const couponBadge = activePromotion?.badgeText?.trim() || "";
  const couponMessage = couponBadge || `Save with code ${couponCode}`;

  const handleCopyCode = async () => {
    if (!couponCode) return;

    try {
      await navigator.clipboard.writeText(couponCode);
      toast.success(`${couponCode} copied`);
    } catch {
      toast.error("Could not copy code");
    }
  };

  return (
    <div className="flex gap-4 rounded-md border border-gray-200 bg-white p-4 sm:p-5">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded bg-gray-100">
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
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h2 className="line-clamp-2 text-base font-medium text-secondary-900">
            {name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            KES {price.toFixed(0)} x {quantity}
          </p>
          <p className="mt-1 text-base font-bold text-gray-900">
            KES {(price * quantity).toFixed(0)}
          </p>

          {couponCode && (
            <div className="mt-4 max-w-fit">
              <div className="flex min-w-[280px] items-start gap-3 rounded-md border border-dashed border-red-300 bg-white px-4 py-3">
                <span className="mt-0.5 shrink-0 text-red-500">
                  <Tag size={17} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight text-red-600">
                    {couponMessage}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="mt-1 text-sm font-medium text-primary-900 underline underline-offset-2 hover:text-primary-800"
                  >
                    Copy code
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => decreaseQuantity(lineId)}
            className="rounded border border-gray-300 p-1 text-gray-600 transition hover:bg-gray-100"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => increaseQuantity(lineId)}
            className="rounded border border-gray-300 p-1 text-gray-600 transition hover:bg-gray-100"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => removeItem(lineId)}
            className="ml-4 text-red-500 transition hover:text-red-700"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
