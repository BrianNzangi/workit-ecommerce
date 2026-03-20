import SectionContainer from '@/components/layout/SectionContainer';

function ProductCardSkeleton() {
  return (
    <div className="space-y-3 rounded-sm bg-white p-3 shadow-sm">
      <div className="aspect-[4/5] w-full rounded bg-gray-200" />
      <div className="h-4 w-4/5 rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
      <div className="h-5 w-1/3 rounded bg-gray-200" />
    </div>
  );
}

function BannerStripSkeleton({ heightClass }: { heightClass: string }) {
  return <div className={`w-full rounded-lg bg-gray-200 ${heightClass}`} />;
}

export default function Loading() {
  return (
    <main className="animate-pulse bg-white font-sans">
      <section className="pt-4">
        <SectionContainer className="px-3 sm:px-6 md:px-2 lg:px-8 xl:px-8 2xl:px-8">
          <div className="aspect-[16/13.2] w-full rounded-xl bg-gray-200 sm:aspect-[20/13.2] md:aspect-[3/1.44] lg:aspect-[4/1.44] xl:aspect-[5/1.44]" />
        </SectionContainer>
      </section>

      <section className="pt-2">
        <SectionContainer className="px-4 md:px-6 lg:px-8">
          <div className="mb-5 h-8 w-52 rounded bg-gray-200" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
                <div className="aspect-square rounded bg-gray-200" />
                <div className="mx-auto h-4 w-3/4 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </SectionContainer>
      </section>

      <section className="py-8">
        <SectionContainer className="px-4 md:px-6 lg:px-8">
          <div className="mb-5 h-8 w-40 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </SectionContainer>
      </section>

      <section className="pb-8">
        <SectionContainer className="px-4 md:px-6 lg:px-8">
          <BannerStripSkeleton heightClass="h-28 md:h-32" />
        </SectionContainer>
      </section>

      <section className="pb-8">
        <SectionContainer className="px-4 md:px-6 lg:px-8">
          <div className="space-y-10">
            {Array.from({ length: 2 }).map((_, sectionIndex) => (
              <div key={sectionIndex} className="space-y-5">
                <div className="h-8 w-56 rounded bg-gray-200" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <ProductCardSkeleton key={`${sectionIndex}-${index}`} />
                  ))}
                </div>
                {sectionIndex === 0 ? <BannerStripSkeleton heightClass="h-28 md:h-32" /> : null}
              </div>
            ))}
          </div>
        </SectionContainer>
      </section>

      <section className="py-8">
        <SectionContainer className="px-4 md:px-6 lg:px-8">
          <div className="mb-5 h-8 w-44 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
                <div className="aspect-video rounded bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-6 w-5/6 rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-4/5 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </SectionContainer>
      </section>

      <section className="pb-10">
        <SectionContainer className="px-4 md:px-6 lg:px-8">
          <div className="rounded-2xl bg-gray-100 px-6 py-10">
            <div className="mx-auto mb-4 h-8 w-40 rounded bg-gray-200" />
            <div className="mx-auto h-4 w-full max-w-3xl rounded bg-gray-200" />
            <div className="mx-auto mt-3 h-4 w-5/6 max-w-2xl rounded bg-gray-200" />
          </div>
        </SectionContainer>
      </section>
    </main>
  );
}
