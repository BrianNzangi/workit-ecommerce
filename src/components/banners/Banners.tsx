'use client'

import Image from 'next/image'

export default function Banners() {
  const banners = [
    { src: '/banners/banner4.webp', alt: 'Electronics' },
    { src: '/banners/banner5.webp', alt: 'Fashion' },
    { src: '/banners/banner6.webp', alt: 'Home & Living' },
  ]

  return (
    <section className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-4 mb-8">
      <div className="flex gap-4 overflow-x-auto md:grid md:grid-cols-3 md:overflow-visible no-scrollbar cursor-pointer">
        {banners.map((banner, index) => (
          <div
            key={index}
            className="
              relative 
              w-[80%] sm:w-[60%] md:w-full 
              aspect-[16/9] sm:aspect-[20/9] md:aspect-[4/1] lg:aspect-[5/1] 
              min-h-[80px] sm:min-h-[220px] md:min-h-[140px] lg:min-h-[200px] 
              rounded-sm 
              flex-shrink-0
            "
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              className="object-cover object-center rounded-sm"
              priority={index === 0}
            />
          </div>
        ))}
      </div>
    </section>
  )
}