import { Suspense } from 'react';
import ProductsPageClient from './ProductsPageClient';

export default function ProductsPage() {
    return (
        <Suspense
            fallback={
                <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                    <p className="text-center text-gray-500">Loading products...</p>
                </div>
            }
        >
            <ProductsPageClient />
        </Suspense>
    );
}
