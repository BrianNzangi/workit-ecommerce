'use client';

import { Suspense } from 'react';
import AuthModal from './AuthModal';

interface AuthModalWrapperProps {
    signInUrl: string;
    signUpUrl: string;
}

export default function AuthModalWrapper({ signInUrl, signUpUrl }: AuthModalWrapperProps) {
    return (
        <Suspense fallback={null}>
            <AuthModal signInUrl={signInUrl} signUpUrl={signUpUrl} />
        </Suspense>
    );
}
