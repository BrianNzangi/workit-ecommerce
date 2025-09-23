'use client'

import ProductCard from './ColProductCard'
import { Product } from '@/types/product'

interface ColProductGridProps {
  products: Product[]
}

export default function ColProductGrid({ products }: ColProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          slug={product.slug}
          link={product.link}
          price={product.price}
          regular_price={product.regular_price}
          image={product.image}
          images={product.images}
          variations={product.variations}
          type={product.type}
          categories={product.categories}
        />
      ))}
    </div>
  )
}
