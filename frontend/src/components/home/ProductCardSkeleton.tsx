export default function ProductCardSkeleton() {
  return (
    <div className="rounded-lg bg-gray-100 animate-pulse p-3 space-y-3">
      <div className="w-full aspect-square bg-gray-300 rounded-md" />
      <div className="h-4 bg-gray-300 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  );
}