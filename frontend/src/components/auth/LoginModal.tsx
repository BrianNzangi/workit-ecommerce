'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LoginModalProps {
    signInUrl: string;
}

export default function LoginModal({ signInUrl }: LoginModalProps) {
    const [showModal, setShowModal] = useState(false);
    const [authWindow, setAuthWindow] = useState<Window | null>(null);

    useEffect(() => {
        // Show modal after component mounts
        setShowModal(true);

        // Check if the auth window was closed
        const checkWindowClosed = setInterval(() => {
            if (authWindow && authWindow.closed) {
                setShowModal(false);
                clearInterval(checkWindowClosed);
                // Optionally refresh the page to check auth status
                window.location.reload();
            }
        }, 500);

        return () => clearInterval(checkWindowClosed);
    }, [authWindow]);

    const openAuthModal = () => {
        // Calculate center position
        const width = 500;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        // Open WorkOS AuthKit in a popup window
        const popup = window.open(
            signInUrl,
            'WorkOS Sign In',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        setAuthWindow(popup);
    };

    return (
        <div className="flex min-h-screen w-full bg-white">
            {/* Left Side - Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-24 relative z-10">
                <div className="w-full max-w-[420px] space-y-10">
                    <div className="flex flex-col items-center justify-center text-center space-y-6">
                        <Link href="/" className="transition-transform hover:scale-105 duration-200">
                            <Image
                                src="/workit-logo.svg"
                                alt="Workit Logo"
                                width={160}
                                height={45}
                                className="h-12 w-auto"
                                priority
                            />
                        </Link>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight text-secondary-900 font-sans">
                                Welcome Back
                            </h1>
                            <p className="text-secondary-500 text-lg">
                                Sign in to your account to continue
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-secondary-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-secondary-500">New to Workit?</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/sign-up"
                            className="inline-block text-primary-900 hover:text-primary-800 font-semibold transition-colors border-b-2 border-transparent hover:border-primary-800"
                        >
                            Create an account
                        </Link>
                    </div>

                    {/* Footer links */}
                    <div className="pt-8 flex justify-center gap-8 text-sm text-secondary-400">
                        <Link href="/privacy-policy" className="hover:text-secondary-600 transition-colors">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="hover:text-secondary-600 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block w-1/2 relative bg-secondary-900 overflow-hidden">
                <div className="absolute inset-0 bg-primary-900/10 mix-blend-overlay z-10" />
                <Image
                    src="/banners/deskbanner.jpg"
                    alt="Workspace setup"
                    fill
                    className="object-cover opacity-90 transition-transform duration-[20s] hover:scale-105"
                    priority
                    quality={95}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-20" />

                <div className="absolute bottom-0 left-0 right-0 p-16 z-30 text-white transform transition-all duration-500">
                    <h2 className="text-4xl font-bold mb-4 font-sans leading-tight">
                        Elevate Your <br />Workspace Experience
                    </h2>
                    <p className="text-xl text-white/80 max-w-md font-light">
                        Discover premium office furniture designed for potential, productivity, and comfort.
                    </p>
                </div>
            </div>

            {/* Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-12 animate-in zoom-in-95 duration-300">
                        {/* Close button */}
                        <button
                            onClick={() => {
                                setShowModal(false);
                                window.location.href = '/';
                            }}
                            className="absolute top-4 right-4 p-2 rounded-full bg-secondary-100 hover:bg-secondary-200 transition-all duration-200 hover:scale-110"
                            aria-label="Close modal"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-secondary-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Modal Content */}
                        <div className="text-center space-y-6">
                            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-primary-900"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-secondary-900 mb-2">Sign In</h3>
                                <p className="text-secondary-600">
                                    Click below to open the secure sign-in window
                                </p>
                            </div>

                            <button
                                onClick={openAuthModal}
                                className="w-full py-4 px-6 bg-primary-900 hover:bg-primary-800 text-white font-bold rounded-xl shadow-lg shadow-primary-900/20 hover:shadow-primary-900/40 transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Open Sign In
                            </button>

                            <p className="text-sm text-secondary-500">
                                A secure window will open for authentication
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
