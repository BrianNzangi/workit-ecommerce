import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SectionContainer from '@/components/layout/SectionContainer';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
};

export default function NotFoundPage() {
  return (
    <SectionContainer className="px-6 sm:px-8 lg:px-16 py-12">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 mx-auto">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-8xl sm:text-9xl font-bold text-gray-900 tracking-tight">404</h1>
          <h2 className="mt-4 text-2xl sm:text-3xl font-semibold text-gray-800">Page not found</h2>
          <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-md lg:max-w-sm">
            We can&apos;t seem to find the page you&apos;re looking for.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-sm bg-primary-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            BACK TO HOME
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <Image
            src="/404.svg"
            alt="404 illustration"
            width={500}
            height={500}
            className="w-full max-w-md lg:max-w-lg h-auto"
            priority
          />
        </div>
      </div>
    </SectionContainer>
  );
}
