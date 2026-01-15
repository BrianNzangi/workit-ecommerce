'use client';

import ProductCard from '../product/ProductCard';
import { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product} // spread the entire product object to match ProductCardProps
        />
      ))}
    </div>
  );
}