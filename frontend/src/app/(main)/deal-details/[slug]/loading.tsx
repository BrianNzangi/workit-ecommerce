function BreadcrumbSkeleton() {
  return (
    <div className="hidden md:flex flex-wrap items-center gap-2 mb-6">
      <div className="h-4 w-12 rounded bg-gray-200" />
      <div className="h-4 w-3 rounded bg-gray-200" />
      <div className="h-4 w-24 rounded bg-gray-200" />
      <div className="h-4 w-3 rounded bg-gray-200" />
      <div className="h-4 w-32 rounded bg-gray-200" />
    </div>
  );
}

function MediaColumnSkeleton() {
  return (
    <div className="rounded-lg bg-white p-4 md:p-6">
      <div className="overflow-hidden rounded-lg bg-white">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-white">
          <div className="aspect-square w-full max-h-80 rounded-lg bg-gray-100" />
        </div>
      </div>

      <div className="py-2 scale-90">
        <div className="mb-3 mx-auto h-4 w-10 rounded bg-gray-200" />
        <div className="flex gap-2 justify-center pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 w-20 shrink-0 rounded-sm border bg-gray-200"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoColumnSkeleton() {
  return (
    <div className="flex flex-col gap-2 md:gap-4">
      <div className="h-7 w-3/4 rounded bg-gray-200" />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="h-4 w-20 rounded bg-gray-200" />
        <span className="h-4 w-3 rounded bg-gray-200" />
        <div className="h-4 w-28 rounded bg-gray-200" />
        <span className="h-4 w-3 rounded bg-gray-200" />
        <div className="h-4 w-16 rounded bg-gray-200" />
      </div>
      <div className="border-t border-gray-200 mt-2 pt-3 space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
        <div className="h-4 w-4/6 rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
      </div>
      <div className="mt-auto flex flex-col gap-3">
        <div className="h-12 w-12 rounded-full border bg-gray-200" />
        <div className="border-t border-gray-200 pt-3">
          <div className="h-4 w-72 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function PurchaseColumnSkeleton() {
  return (
    <div className="flex flex-col gap-4 border-l-0 md:border-l border-gray-200 pl-0 md:pl-6">
      <div className="border-b border-gray-200 pb-8 space-y-4">
        <div className="h-6 w-24 rounded-full bg-primary-100" />
        <div className="h-10 w-2/3 rounded bg-gray-200" />
        <div className="h-5 w-1/2 rounded bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
          <div className="h-5 w-28 rounded bg-gray-200" />
        </div>
        <div className="border-b border-gray-200" />
        <div className="flex items-stretch gap-3">
          <div className="h-12 w-18 rounded-md border border-gray-200 bg-white" />
          <div className="h-12 flex-1 rounded-md bg-gray-200" />
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-1.5">
              <div className="h-5 w-2/3 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileBarSkeleton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 md:hidden shadow-lg">
      <div className="flex items-stretch gap-3">
        <div className="h-12 w-18 rounded-md border border-gray-200 bg-white" />
        <div className="h-12 flex-1 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

function DescriptionSkeleton() {
  return (
    <section className="border-t border-b border-gray-200 py-4 mt-6 md:mt-12">
      <div className="h-6 w-48 rounded bg-gray-200 mb-4" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-5/6 rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <main className="animate-pulse bg-white font-sans">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 py-6">
        <BreadcrumbSkeleton />

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(420px,1.3fr)_minmax(360px,1.1fr)_minmax(320px,0.8fr)] gap-4 md:gap-8">
          <MediaColumnSkeleton />
          <InfoColumnSkeleton />
          <div className="xl:sticky xl:top-22 xl:self-start">
            <PurchaseColumnSkeleton />
          </div>
        </div>

        <DescriptionSkeleton />
      </div>

      <MobileBarSkeleton />
    </main>
  );
}
