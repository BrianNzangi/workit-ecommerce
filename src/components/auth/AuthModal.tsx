'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface AuthModalProps {
    signInUrl: string;
    signUpUrl: string;
}

export default function AuthModal({ signInUrl, signUpUrl }: AuthModalProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [authType, setAuthType] = useState<'login' | 'signup' | null>(null);

    useEffect(() => {
        const auth = searchParams.get('auth');
        if (auth === 'login' || auth === 'signup') {
            setAuthType(auth);
            setShowModal(true);

            // Automatically redirect to WorkOS AuthKit after a brief moment
            const timer = setTimeout(() => {
                const authUrl = auth === 'login' ? signInUrl : signUpUrl;
                window.location.href = authUrl;
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [searchParams, signInUrl, signUpUrl]);

    const closeModal = () => {
        setShowModal(false);
        setAuthType(null);
        router.push('/');
    };

    const handleContinue = () => {
        const authUrl = authType === 'login' ? signInUrl : signUpUrl;
        window.location.href = authUrl;
    };

    if (!showModal || !authType) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-12 animate-in zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={closeModal}
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
                            {authType === 'login' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            )}
                        </svg>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                            {authType === 'login' ? 'Sign In' : 'Create Account'}
                        </h3>
                        <p className="text-secondary-600">
                            Redirecting to secure authentication...
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-secondary-200 border-t-primary-900"></div>
                    </div>

                    <p className="text-sm text-secondary-500">
                        If you're not redirected automatically,
                    </p>

                    <button
                        onClick={handleContinue}
                        className="w-full py-4 px-6 bg-primary-900 hover:bg-primary-800 text-white font-bold rounded-xl shadow-lg shadow-primary-900/20 hover:shadow-primary-900/40 transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        Continue to {authType === 'login' ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
}
