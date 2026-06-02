import { Suspense } from "react";
import SectionContainer from "@/components/layout/SectionContainer";
import CollectionDirectoryPage from "./CollectionDirectoryPage";

export default function ShopCollectionsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white font-sans">
        <SectionContainer className="py-16">
          <div className="space-y-8">
            <div className="h-12 w-64 bg-gray-100 animate-pulse rounded-lg mb-16" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="aspect-video bg-gray-100 animate-pulse rounded-3xl" />
              ))}
            </div>
          </div>
        </SectionContainer>
      </main>
    }>
      <CollectionDirectoryPage />
    </Suspense>
  );
}
