'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import SectionContainer from '@/components/layout/SectionContainer';
import { handleDocumentNavigation } from '@/lib/utils/document-navigation';

const steps = [
  { label: 'Cart', href: '/cart' },
  { label: 'Checkout', href: '/checkout' },
  { label: 'Confirmation', href: '#' },
];

export default function CheckoutHeader() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/');
  }, [router]);

  const handleLogoClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    onAfterNavigate?: () => void,
  ) => {
    handleDocumentNavigation(event, '/', onAfterNavigate);
  };

  return (
    <header id="checkout-header">
      <div className="font-sans text-secondary-900 border-b border-gray-300 bg-white">
        <SectionContainer className="px-10 sm:px-12 lg:px-16 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className="inline-block relative w-37.5 sm:w-45 md:w-50 lg:w-30 xl:w-37.5 h-auto shrink-0"
            >
              <Image
                src="/workit-logo.png"
                alt="Workit Logo"
                width={250}
                height={70}
                className="w-full h-auto object-contain"
                priority
                unoptimized
              />
            </Link>

            {/* Steps - hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        index === 1
                          ? 'bg-primary-900 text-white'
                          : index < 1
                            ? 'bg-primary-900 text-white'
                            : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index < 1 ? '✓' : index + 1}
                    </div>
                    <span
                      className={`text-sm font-medium hidden md:inline ${
                        index === 1
                          ? 'text-primary-900'
                          : index < 1
                            ? 'text-gray-900'
                            : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-2 ${
                        index < 1 ? 'bg-primary-900' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Secure badge */}
            <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
              <Lock size={14} className="text-gray-400" />
              <span className="hidden sm:inline font-medium">Secure Checkout</span>
            </div>
          </div>
        </SectionContainer>
      </div>
    </header>
  );
}
