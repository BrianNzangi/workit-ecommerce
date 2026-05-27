function PageSkeletonContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 ${className}`}>
      {children}
    </div>
  );
}

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

function RecommendationsSkeleton({ title }: { title: string }) {
  return (
    <div className="pb-12 last:pb-0">
      <div className="mb-3 h-8 w-72 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <ProductCardSkeleton key={`${title}-${index}`} />
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="mt-0 animate-pulse bg-[#FAFAFA] font-sans">
      <PageSkeletonContainer className="mb-8 py-6">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="h-4 w-12 rounded bg-gray-200" />
          <div className="h-4 w-3 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-4 w-3 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex w-full flex-col gap-4 md:w-3/4 lg:w-2/3">
            <div className="rounded-lg bg-white p-4 shadow-md md:p-6">
              <div className="relative overflow-hidden rounded-lg bg-white">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border border-gray-200 bg-white" />
                  <div className="absolute right-3 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border border-gray-200 bg-white" />

                  <div className="flex items-center justify-center overflow-hidden rounded-lg bg-white">
                    <div className="aspect-video w-full rounded-lg bg-gray-100" />
                  </div>
                </div>

                <div className="border-t border-gray-100 px-2 py-2 md:px-2">
                  <div className="mx-auto mb-3 h-4 w-10 rounded bg-gray-200" />
                  <div className="flex gap-3 overflow-hidden pb-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-24 w-24 shrink-0 rounded-sm bg-white ${
                          index === 0 ? "border-2 border-primary-900" : "border border-gray-200"
                        }`}
                      >
                        <div className="h-full w-full rounded-sm bg-gray-200" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <section className="rounded-lg bg-white p-5 shadow-md md:p-5">
              <div className="mb-4 h-8 w-52 rounded bg-gray-200" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-5/6 rounded bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
              </div>
            </section>
          </div>

          <div className="sticky top-24 self-start flex w-full flex-col gap-4 md:w-1/4 lg:w-1/3">
            <div className="flex flex-col gap-5 rounded-lg bg-white px-2 py-2 shadow-md md:px-5 md:py-5">
              <div className="h-8 w-28 rounded bg-primary-100" />
              <div className="h-8 w-5/6 rounded bg-gray-200" />
              <div className="-mt-2 h-5 w-32 rounded bg-gray-200" />
              <div className="h-10 w-1/2 rounded bg-gray-200" />
              <div className="border-b border-gray-200" />

              <div className="flex items-center justify-between gap-3">
                <div className="h-7 w-40 rounded bg-gray-200" />
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                </div>
              </div>

              <div className="flex items-stretch gap-3">
                <div className="min-h-12 w-23 rounded-none border border-gray-200 bg-white" />
                <div className="min-h-12 flex-1 bg-gray-200" />
              </div>
            </div>

            <div className="flex flex-col gap-5 rounded-lg bg-white px-2 py-2 shadow-md md:px-5 md:py-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-2/3 rounded bg-gray-200" />
                    <div className="h-4 w-full rounded bg-gray-200" />
                    <div className="h-4 w-5/6 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageSkeletonContainer>

      <section className="mt-12 w-full bg-white py-12">
        <PageSkeletonContainer>
          <RecommendationsSkeleton title="similar-items" />
          <RecommendationsSkeleton title="also-viewed" />
        </PageSkeletonContainer>
      </section>
    </main>
  );
}
