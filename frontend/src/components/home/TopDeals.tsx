'use client';

import { useState, useEffect } from 'react';
import ProductCard from '../product/ProductCard';
import { Product } from '@/types/product';

export default function TopDeals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const productsPerSlide = 5;
  const totalSlides = Math.ceil(products.length / productsPerSlide);

  useEffect(() => {
    // Fetch products from backend API
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=10');
        const data = await response.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to fetch top deals:', error);
      }
    };

    fetchProducts();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const visibleProducts = products.slice(
    currentSlide * productsPerSlide,
    (currentSlide + 1) * productsPerSlide
  );

  return (
    <section className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-12 py-4">
      <h2 className="font-['DM_Sans'] text-lg md:text-2xl font-semibold text-primary mb-4">Top Deals</h2>
      <div className="relative">
        <div className="flex overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out space-x-4"
            style={{ transform: `translateX(-${currentSlide * (100 / productsPerSlide)}%)` }}
          >
            {visibleProducts.map((product) => (
              <div key={product.id} className="min-w-[200px] max-w-[240px] flex-shrink-0">
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </div>
        {products.length > productsPerSlide && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white text-primary p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              disabled={currentSlide === 0}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white text-primary p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              disabled={currentSlide === totalSlides - 1}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
