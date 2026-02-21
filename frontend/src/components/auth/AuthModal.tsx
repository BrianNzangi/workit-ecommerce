import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoginForm, SignUpForm, VerifyOTPForm } from './AuthForms';
import Image from 'next/image';

export default function AuthModal() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [authType, setAuthType] = useState<'login' | 'signup' | 'verify' | null>(null);
    const [emailForVerification, setEmailForVerification] = useState('');
    const [isBusy, setIsBusy] = useState(false);
    const [busyMessage, setBusyMessage] = useState('Sending information...');
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
        setEmailForVerification('');
        setIsBusy(false);
        setBusyMessage('Sending information...');
        // Remove 'auth' param from URL
        const params = new URLSearchParams(searchParams.toString());
        params.delete('auth');
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (isBusy) return;
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            closeModal();
        }
    };

    const handleBusyChange = (busy: boolean, message?: string) => {
        setIsBusy(busy);
        if (busy) {
            setBusyMessage(message || 'Sending information...');
        } else {
            setBusyMessage('Sending information...');
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
                className="relative w-full max-w-110 mx-4 bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            >
                {isBusy && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75 backdrop-blur-[1px]">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white shadow-md border border-secondary-100">
                            <span className="h-5 w-5 rounded-full border-2 border-primary-900 border-t-transparent animate-spin" />
                            <span className="text-sm font-medium text-secondary-700">{busyMessage}</span>
                        </div>
                    </div>
                )}

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
                        {authType === 'login' ? 'Login Now' : authType === 'verify' ? 'Verify Email' : 'Join Workit'}
                    </h3>
                    <p className="text-secondary-500 text-base mb-8">
                        {authType === 'login'
                            ? 'Enter your email to receive a one-time login code.'
                            : authType === 'verify'
                                ? `Enter the code sent to your email.`
                                : 'Enter your details to receive a sign-up verification code.'}
                    </p>

                    {/* Form Content */}
                    <div className="text-left">
                        {authType === 'login' ? (
                            <LoginForm onBusyChange={handleBusyChange} />
                        ) : authType === 'verify' ? (
                            <VerifyOTPForm email={emailForVerification} onBusyChange={handleBusyChange} />
                        ) : (
                            <SignUpForm
                                ontoVerify={(email) => {
                                    setEmailForVerification(email);
                                    setAuthType('verify');
                                }}
                                onBusyChange={handleBusyChange}
                            />
                        )}
                    </div>

                    <div className="mt-8">
                        <p className="text-secondary-600 text-[15px]">
                            {authType === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button
                                onClick={() => {
                                    if (isBusy) return;
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
