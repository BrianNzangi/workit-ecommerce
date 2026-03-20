export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white font-sans">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-900"
        aria-label="Loading"
        role="status"
      />
    </main>
  );
}
