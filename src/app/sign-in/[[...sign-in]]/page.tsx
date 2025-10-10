import type { Metadata } from 'next';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Sign In - Workit",
  description: "Sign in to your Workit account to manage your profile, orders, and preferences.",
  robots: "noindex, nofollow",
  openGraph: {
    title: "Sign In - Workit",
    description: "Sign in to your Workit account to manage your profile, orders, and preferences.",
    url: "https://www.workit.co.ke/sign-in",
    siteName: "Workit",
    type: "website",
    images: [
      {
        url: "/workit-logo.png",
        width: 1200,
        height: 630,
        alt: "Sign In - Workit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In - Workit",
    description: "Sign in to your Workit account to manage your profile, orders, and preferences.",
  },
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center px-4 sm:px-6 lg:px-8 font-['DM_SANS']">
      <div className="max-w-md w-full space-y-2">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              className="mx-auto h-12 w-auto"
              src="/workit-logo.svg"
              alt="Workit"
              width={48}
              height={48}
            />
          </Link>
        </div>
        <div className="bg-white py-8 px-6 border border-gray-200 rounded-lg">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
