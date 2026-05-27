import Image from "next/image";

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white font-sans">
      <div className="animate-pulse">
        <Image
          src="/workit-logo.png"
          alt="Workit"
          width={160}
          height={48}
          priority
          className="h-12 w-auto"
        />
      </div>
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary-900 [animation-delay:0ms]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary-900 [animation-delay:150ms]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary-900 [animation-delay:300ms]" />
      </div>
      <span className="sr-only" role="status">Loading...</span>
    </main>
  );
}
