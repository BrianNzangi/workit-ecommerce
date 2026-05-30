function ProductCardSkeleton() {
  return (
    <div className="space-y-3 rounded-sm bg-white p-3 shadow-sm">
      <div className="aspect-4/5 w-full rounded bg-gray-200" />
      <div className="h-4 w-4/5 rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
      <div className="h-5 w-1/3 rounded bg-gray-200" />
    </div>
  );
}

export default function ProductRecommendationsLoading() {
  return (
    <section className="mt-12 w-full animate-pulse bg-white py-12">
      <div className="mx-auto max-w-300 px-4">
        <div className="pb-12">
          <div className="mb-3 h-8 w-72 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <ProductCardSkeleton key={`similar-${index}`} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 h-8 w-80 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <ProductCardSkeleton key={`also-${index}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
