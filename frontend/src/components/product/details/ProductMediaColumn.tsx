"use client"

import Image from "next/image"
import { getImageUrl } from "@/lib/image/image-utils"

interface ProductMediaColumnProps {
  images: { id: string; url: string; altText?: string; position?: number; featured?: boolean }[]
  productName: string
  selectedIdx: number
  onSelectImage: (idx: number) => void
}

export default function ProductMediaColumn({
  images,
  productName,
  selectedIdx,
  onSelectImage,
}: ProductMediaColumnProps) {
  if (images.length === 0) return null

  return (
    <div className="rounded-lg bg-white p-4 md:p-6">
      <div className="overflow-hidden rounded-lg bg-white">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-white">
          <Image
            src={getImageUrl(images[selectedIdx]?.url || "")}
            alt={productName}
            width={900}
            height={900}
            className="max-h-80 w-auto object-contain lg:max-h-80"
            unoptimized
          />
        </div>

        {images.length > 0 && (
          <div className="border-t border-gray-100 py-2">
            <div className="mb-3 text-center text-sm font-medium text-gray-500">
              {selectedIdx + 1}/{images.length}
            </div>
            <div className="flex gap-3 justify-center pb-1">
              {images.slice(0, 4).map((img, idx) => (
                <button
                  key={img.id || `${img.url}-${idx}`}
                  type="button"
                  onClick={() => onSelectImage(idx)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-white transition ${
                    selectedIdx === idx
                      ? "border-2 border-primary-900 shadow-sm border-b-[5px]"
                      : "border border-secondary-300"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image
                    src={getImageUrl(img.url || "")}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
