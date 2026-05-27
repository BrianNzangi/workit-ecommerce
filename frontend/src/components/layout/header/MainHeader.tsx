'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, X, Menu } from 'lucide-react';
import SectionContainer from '@/components/layout/SectionContainer';
import SearchBar from '@/components/SearchBar';
import MobileMegaMenu from '@/components/menu/MobileMegaMenu';
import UserMenu from '@/components/menu/UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { handleDocumentNavigation } from '@/lib/utils/document-navigation';

interface MainHeaderProps {
    cartItemCount: number;
    mobileMenuOpen: boolean;
    onToggleMobileMenu: () => void;
    onCloseMobileMenu: () => void;
    onOpenCart: () => void;
}

export default function MainHeader({
    cartItemCount,
    mobileMenuOpen,
    onToggleMobileMenu,
    onCloseMobileMenu,
    onOpenCart,
}: MainHeaderProps) {
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
        <header id="site-header">
            <div className="font-sans text-secondary-900 border-b border-gray-300">
                <SectionContainer className="px-10 sm:px-12 lg:px-16 py-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
                    <Link
                        href="/"
                        onClick={handleLogoClick}
                        className="inline-block relative w-37.5 sm:w-45 md:w-50 lg:w-30 xl:w-37.5 h-auto"
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

                    <div className="hidden md:flex grow max-w-3xl w-full">
                        <SearchBar />
                    </div>

                    <div className="hidden md:flex items-center gap-6 text-secondary-900">
                        <UserMenu />
                        <button
                            onClick={onOpenCart}
                            className="relative flex items-center gap-2 font-sans text-base text-secondary-900 hover:text-primary-900 transition-colors"
                        >
                            <div className="relative">
                                <ShoppingBag className="h-6 w-6" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-primary-900 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-lg font-medium">Cart</span>
                        </button>
                    </div>

                    <div className="md:hidden flex items-center gap-2">
                        <button onClick={onOpenCart} className="relative text-secondary-900">
                            <div className="relative">
                                <ShoppingBag className="h-6 w-6" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-primary-900 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </div>
                        </button>

                        <button
                            onClick={onToggleMobileMenu}
                            className="text-secondary-900"
                            aria-label="Toggle Menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                    </div>
                </SectionContainer>

                <div className="md:hidden px-4 pb-2">
                    <SearchBar />
                </div>

                <div
                    className={`fixed inset-0 z-50 transition-colors duration-300 ${mobileMenuOpen ? 'bg-black/40 pointer-events-auto' : 'bg-transparent pointer-events-none'
                        }`}
                    onClick={onCloseMobileMenu}
                >
                    <div
                        className={`absolute top-0 left-0 h-full w-[85%] max-w-100 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col overflow-hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b">
                            <Link
                                href="/"
                                onClick={(event) => handleLogoClick(event, onCloseMobileMenu)}
                                className="inline-block relative w-25 h-auto"
                            >
                                <Image
                                    src="/workit-logo.png"
                                    alt="Workit Logo"
                                    width={120}
                                    height={50}
                                    className="w-full h-auto object-contain"
                                    priority
                                    unoptimized
                                />
                            </Link>
                            <button
                                onClick={onCloseMobileMenu}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
                                aria-label="Close Menu"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-2">
                            <MobileMegaMenu onNavigate={onCloseMobileMenu} />
                            <div className="border-t border-gray-100 mt-4 pt-4">
                                <AccountAccordion />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

function AccountAccordion() {
    const [open, setOpen] = useState(false);
    const { customer } = useAuth();
    const router = useRouter();

    return (
        <div className="border-b border-gray-200">
            <button
                onClick={() => setOpen(!open)}
                className="w-full text-left flex justify-between items-center py-2 px-2 font-sans text-gray-700 font-medium"
            >
                Account
                <span>{open ? '-' : '+'}</span>
            </button>
            {open && (
                <div className="pl-4 flex flex-col gap-1 text-left">
                    {!customer ? (
                        <>
                            <button
                                onClick={() => router.push('/?auth=login')}
                                className="py-1 text-gray-600 font-sans hover:text-primary-900 text-left"
                            >
                                Sign In
                            </button>
                            <Link href="/?auth=signup" className="py-1 text-gray-600 font-sans hover:text-primary-900 text-left" onClick={() => setOpen(false)}>
                                Sign Up
                            </Link>
                            <Link href="/help-center" className="py-1 text-gray-600 font-sans hover:text-primary-900" onClick={() => setOpen(false)}>Help & Support</Link>
                            <Link href="/about-workit" className="py-1 text-gray-600 font-sans hover:text-primary-900" onClick={() => setOpen(false)}>About</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard" className="py-1 text-gray-600 font-sans hover:text-primary-900" onClick={() => setOpen(false)}>My Account</Link>
                            <Link href="/dashboard?section=orders" className="py-1 text-gray-600 font-sans hover:text-primary-900" onClick={() => setOpen(false)}>Orders</Link>
                            <Link href="/help-center" className="py-1 text-gray-600 font-sans hover:text-primary-900" onClick={() => setOpen(false)}>Help & Support</Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
