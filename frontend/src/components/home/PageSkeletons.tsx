import SectionContainer from '@/components/layout/SectionContainer';
import ProductCardSkeleton from "./ProductCardSkeleton";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className ?? ""}`} />;
}

export function HeroSectionSkeleton() {
  return (
    <section aria-label="Loading banners" className="w-full">
      <SectionContainer className="py-6">
        <Skeleton className="w-full h-45 md:h-75 rounded-sm" />
      </SectionContainer>
      <div className="flex justify-center gap-2 mt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-2.5 h-2.5 rounded-full" />
        ))}
      </div>
    </section>
  );
}

export function CategoriesSkeleton() {
  return (
    <section aria-label="Loading categories" className="py-2 sm:py-4 lg:py-4">
      <SectionContainer className="">
        <Skeleton className="h-7 w-40 mb-6" />
        <div className="grid grid-cols-8 gap-2 lg:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="w-full aspect-square rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

export function DealsSkeleton() {
  return (
    <section aria-label="Loading deals" className="py-6 md:py-8">
      <SectionContainer className="">
        <Skeleton className="h-7 w-24 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-video rounded-md" />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

export function BlogGridSkeleton() {
  return (
    <section aria-label="Loading blog posts" className="py-6 md:py-8">
      <SectionContainer className="mb-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-video rounded-lg" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}

export function BannerSkeleton() {
  return (
    <section aria-label="Loading banner" className="py-2 md:py-4">
      <SectionContainer className="">
        <Skeleton className="w-full h-52 rounded-md" />
      </SectionContainer>
    </section>
  );
}

export function CollectionSkeleton() {
  return (
    <section aria-label="Loading collection" className="py-2 md:py-4">
      <SectionContainer className="mb-8 py-6">
        <div className="flex items-end justify-between mb-4">
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
