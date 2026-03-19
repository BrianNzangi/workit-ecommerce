function RelatedProductsSkeleton({ title }: { title: string }) {
  return (
    <section className="bg-accent-800 py-12 mt-12 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8 xl:px-10 2xl:px-4">
        <div className="h-8 w-72 rounded bg-white/20 animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`${title}-${index}`}
              className="rounded-sm bg-white p-3 space-y-3 animate-pulse"
            >
              <div className="aspect-[4/5] w-full rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-5 w-1/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <main className="font-sans mt-8 animate-pulse">
      <div className="container mx-auto max-w-7xl px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-4 mb-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="h-4 w-4 rounded bg-gray-200" />
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="h-4 w-4 rounded bg-gray-200" />
          <div className="h-4 w-40 rounded bg-gray-200" />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/4 lg:w-2/3 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-sm">
              <div className="flex flex-row md:flex-col gap-2 overflow-hidden">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 md:w-20 md:h-20 rounded bg-gray-200"
                  />
                ))}
              </div>

              <div className="flex-1 h-[25rem] md:h-[38rem] rounded bg-gray-100" />
            </div>

            <section className="mt-2 space-y-4">
              <div className="h-7 w-48 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
              <div className="h-4 w-2/3 rounded bg-gray-200" />
            </section>
          </div>

          <div className="w-full md:w-1/4 lg:w-1/3">
            <div className="rounded-sm bg-white flex flex-col gap-4 mt-2 p-1">
              <div className="h-7 w-4/5 rounded bg-gray-200" />
              <div className="h-5 w-1/3 rounded bg-gray-200" />
              <div className="h-10 w-1/2 rounded bg-gray-200" />
              <div className="border-b border-gray-200" />
              <div className="h-6 w-1/2 rounded bg-gray-200" />
              <div className="h-12 w-40 rounded bg-gray-200" />
              <div className="h-12 w-full rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-12 flex-1 rounded bg-gray-200" />
                <div className="h-12 flex-1 rounded bg-gray-200" />
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-200">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 rounded bg-gray-200" />
                      <div className="h-3 w-full rounded bg-gray-200" />
                      <div className="h-3 w-5/6 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RelatedProductsSkeleton title="similar-items" />
      <RelatedProductsSkeleton title="also-viewed" />
    </main>
  );
}
