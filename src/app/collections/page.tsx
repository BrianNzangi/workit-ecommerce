import { Suspense } from "react";
import CollectionsClient from "./CollectionsClient";

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 font-[DM_SANS]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <div className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
            <div className="lg:w-3/4">
              <div className="animate-pulse mb-6">
                <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    }>
      <CollectionsClient />
    </Suspense>
  );
}
