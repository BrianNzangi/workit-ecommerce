import { Suspense } from "react";
import CollectionDirectoryPage from "./CollectionDirectoryPage";

export default function ShopCollectionsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white font-sans">
        <div className="max-w-7xl mx-auto px-4 py-16 space-y-8">
          <div className="h-12 w-64 bg-white animate-pulse rounded-lg mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="h-64 bg-white animate-pulse rounded-3xl" />
            ))}
          </div>
        </div>
      </main>
    }>
      <CollectionDirectoryPage />
    </Suspense>
  );
}
