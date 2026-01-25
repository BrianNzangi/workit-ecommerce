import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoginForm, SignUpForm } from './AuthForms';
import Image from 'next/image';

export default function AuthModal() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [authType, setAuthType] = useState<'login' | 'signup' | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const auth = searchParams.get('auth');
        if (auth === 'login' || auth === 'signup') {
            setAuthType(auth);
            setShowModal(true);
        } else {
            setShowModal(false);
            setAuthType(null);
        }
    }, [searchParams]);

    const closeModal = () => {
        setShowModal(false);
        setAuthType(null);
        // Remove 'auth' param from URL
        const params = new URLSearchParams(searchParams.toString());
        params.delete('auth');
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            closeModal();
        }
    };

    if (!showModal || !authType) return null;

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="relative w-full max-w-[440px] mx-4 bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            >
                <div className="p-10 pt-12 text-center">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/workit-logo.png"
                            alt="Workit Logo"
                            width={100}
                            height={40}
                            className="h-auto w-auto"
                            priority
                        />
                    </div>

                    <h3 className="text-[28px] font-bold text-secondary-900 mb-2 leading-tight">
                        {authType === 'login' ? 'Login Now' : 'Join Workit'}
                    </h3>
                    <p className="text-secondary-500 text-base mb-8">
                        {authType === 'login'
                            ? 'Enter your information to sign in.'
                            : 'Enter your details to create an account.'}
                    </p>

                    {/* Form Content */}
                    <div className="text-left">
                        {authType === 'login' ? <LoginForm /> : <SignUpForm />}
                    </div>

                    <div className="mt-8">
                        <p className="text-secondary-600 text-[15px]">
                            {authType === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button
                                onClick={() => {
                                    const type = authType === 'login' ? 'signup' : 'login';
                                    router.push(`?auth=${type}`, { scroll: false });
                                }}
                                className="text-primary-900 font-bold hover:underline"
                            >
                                {authType === 'login' ? 'Register now' : 'Sign in here'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
