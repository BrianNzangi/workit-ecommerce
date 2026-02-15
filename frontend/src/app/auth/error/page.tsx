'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCw, ShieldAlert, Home } from 'lucide-react';
import { Suspense } from 'react';

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const getErrorMessage = (errorCode: string | null) => {
        switch (errorCode) {
            case 'state_mismatch':
                return {
                    title: 'Security Session Mismatch',
                    description: 'Your login session could not be verified for security reasons. This often happens if the login process was interrupted or if cookies are disabled.',
                    icon: ShieldAlert
                };
            case 'configuration_error':
                return {
                    title: 'Configuration Bug',
                    description: 'There is a technical issue with the authentication setup. Our engineers have been notified.',
                    icon: AlertCircle
                };
            case 'access_denied':
                return {
                    title: 'Access Denied',
                    description: 'You canceled the login process or do not have permission to access this resource.',
                    icon: AlertCircle
                };
            default:
                return {
                    title: 'Authentication Failed',
                    description: 'Something went wrong while trying to sign you in. Please try again or contact support if the issue persists.',
                    icon: AlertCircle
                };
        }
    };

    const errorMessage = getErrorMessage(error);
    const Icon = errorMessage.icon;

    return (
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {errorMessage.title}
                </h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    {errorMessage.description}
                </p>

                <div className="grid grid-cols-1 gap-3 w-full">
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-900 text-white rounded-xl font-semibold hover:bg-primary-800 transition-all shadow-lg shadow-primary-900/20 active:scale-[0.98]"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Signing In Again
                    </Link>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all active:scale-[0.98]"
                    >
                        <Home className="w-4 h-4" />
                        Back to Homepage
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 w-full text-center">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                        Error Code: {error || 'unknown_error'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center px-4 py-12">
            <Suspense fallback={
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
                    <p className="text-gray-500 font-medium">Loading error details...</p>
                </div>
            }>
                <AuthErrorContent />
            </Suspense>
        </div>
    );
}
