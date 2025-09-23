import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

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
