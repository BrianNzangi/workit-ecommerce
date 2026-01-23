'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SignUpModalProps {
    signUpUrl: string;
}

export default function SignUpModal({ signUpUrl }: SignUpModalProps) {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Show modal after component mounts
        setShowModal(true);

        // Listen for messages from the iframe (e.g., successful authentication)
        const handleMessage = (event: MessageEvent) => {
            // Verify the origin is from WorkOS
            if (event.origin.includes('authkit.app')) {
                // Handle authentication success or other events
                console.log('Message from AuthKit:', event.data);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

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
                                Create an Account
                            </h1>
                            <p className="text-secondary-500 text-lg">
                                Join Workit today and upgrade your workspace
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-secondary-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-secondary-500">Already have an account?</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="inline-block text-primary-900 hover:text-primary-800 font-semibold transition-colors border-b-2 border-transparent hover:border-primary-800"
                        >
                            Sign in
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
                    src="/banners/homelapbanner.jpg"
                    alt="Modern workspace"
                    fill
                    className="object-cover opacity-90 transition-transform duration-[20s] hover:scale-105"
                    priority
                    quality={95}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20" />

                <div className="absolute bottom-0 left-0 right-0 p-16 z-30 text-white transform transition-all duration-500">
                    <h2 className="text-4xl font-bold mb-4 font-sans leading-tight">
                        Designed for <br />Modern Living
                    </h2>
                    <p className="text-xl text-white/80 max-w-md font-light">
                        Quality furniture that adapts to your lifestyle and work habits.
                    </p>
                </div>
            </div>

            {/* Modal Overlay with iframe */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Close button */}
                        <button
                            onClick={() => {
                                setShowModal(false);
                                window.location.href = '/';
                            }}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
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

                        {/* iframe containing WorkOS AuthKit */}
                        <iframe
                            src={signUpUrl}
                            className="w-full h-[600px] border-0"
                            title="Sign Up"
                            allow="clipboard-write"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
