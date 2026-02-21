'use client';

import { useState } from 'react';
import { signIn, signUp, authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

type ModalBusyReporter = (busy: boolean, message?: string) => void;
const requestTimeoutFromEnv = Number(process.env.NEXT_PUBLIC_AUTH_REQUEST_TIMEOUT_MS ?? "30000");
const AUTH_REQUEST_TIMEOUT_MS = Number.isFinite(requestTimeoutFromEnv) && requestTimeoutFromEnv > 0
    ? requestTimeoutFromEnv
    : 30000;

const generateHiddenPassword = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `workit-${crypto.randomUUID()}-A1!`;
    }
    return `workit-${Math.random().toString(36).slice(2)}-${Date.now()}-A1!`;
};

async function withRequestTimeout<T>(promise: Promise<T>, timeoutMs = AUTH_REQUEST_TIMEOUT_MS) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Request timed out. Please try again.')), timeoutMs);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
}

export function LoginForm({ onBusyChange }: { onBusyChange?: ModalBusyReporter }) {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'request' | 'verify'>('request');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const router = useRouter();

    const handleRequestOtp = async () => {
        setSendingOtp(true);
        onBusyChange?.(true, 'Sending login code...');
        try {
            const { error } = await withRequestTimeout(authClient.emailOtp.sendVerificationOtp({
                email,
                type: 'sign-in',
            }));
            if (error) {
                toast.error(error.message || 'Failed to send code');
            } else {
                toast.success('Verification code sent to your email');
                setStep('verify');
            }
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
        } finally {
            setSendingOtp(false);
            onBusyChange?.(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifyingOtp(true);
        onBusyChange?.(true, 'Verifying code...');
        try {
            const { error } = await withRequestTimeout(signIn.emailOtp({
                email,
                otp,
            } as any));

            if (error) {
                toast.error(error.message || 'Invalid verification code');
            } else {
                toast.success('Signed in successfully');
                router.push('/');
                router.refresh();
            }
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
        } finally {
            setVerifyingOtp(false);
            onBusyChange?.(false);
        }
    };

    return (
        <div className="w-full">
            {step === 'request' ? (
                <>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            void handleRequestOtp();
                        }}
                        className="space-y-0"
                    >
                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-2 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-900/5 focus:border-primary-900 transition-all text-secondary-900 placeholder:text-secondary-400"
                                placeholder="Email address"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sendingOtp}
                            className="w-full py-2 bg-primary-900 text-white font-bold rounded-lg hover:bg-primary-800 transition-all disabled:opacity-50 mt-4"
                        >
                            {sendingOtp ? 'Sending code...' : 'Send Login Code'}
                        </button>
                    </form>
                </>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <p className="text-secondary-600 text-sm mb-4">
                        We've sent a 6-digit login code to <span className="font-bold text-secondary-900">{email}</span>.
                    </p>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-5 py-3 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-900/5 focus:border-primary-900 transition-all text-secondary-900 placeholder:text-secondary-400 text-center text-2xl tracking-[0.5em] font-bold"
                        placeholder="000000"
                        maxLength={6}
                        required
                    />
                    <button
                        type="submit"
                        disabled={verifyingOtp}
                        className="w-full py-2 bg-secondary-200 text-secondary-400 font-bold rounded-lg hover:bg-secondary-300 hover:text-secondary-500 transition-all disabled:opacity-50 mt-4 active:bg-primary-900 active:text-white"
                    >
                        {verifyingOtp ? 'Verifying...' : 'Sign In'}
                    </button>
                    <div className="text-center mt-4 space-x-3">
                        <button
                            type="button"
                            onClick={() => void handleRequestOtp()}
                            className="text-primary-900 text-sm font-bold hover:underline"
                        >
                            Resend Code
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setStep('request');
                                setOtp('');
                            }}
                            className="text-secondary-600 text-sm hover:underline"
                        >
                            Change Email
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export function SignUpForm({
    ontoVerify,
    onBusyChange,
}: {
    ontoVerify: (email: string) => void;
    onBusyChange?: ModalBusyReporter;
}) {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        onBusyChange?.(true, 'Sending sign up code...');
        try {
            const generatedPassword = generateHiddenPassword();
            const { error } = await withRequestTimeout(signUp.email({
                email,
                password: generatedPassword,
                name: `${firstName} ${lastName}`,
                firstName,
                lastName,
                callbackURL: '/',
            } as any));
            if (error) {
                toast.error(error.message || 'Failed to sign up');
            } else {
                // Send verification OTP after successful sign-up
                const { error: otpError } = await withRequestTimeout(authClient.emailOtp.sendVerificationOtp({
                    email,
                    type: "email-verification",
                }));
                if (otpError) {
                    toast.error(otpError.message || 'Account created, but failed to send verification code.');
                } else {
                    toast.success('Account created! Please verify your email.');
                }
                ontoVerify(email);
            }
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
        } finally {
            setLoading(false);
            onBusyChange?.(false);
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-5 py-2 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-900/5 focus:border-primary-900 transition-all text-secondary-900 placeholder:text-secondary-400"
                        placeholder="First name"
                        required
                    />
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-5 py-2 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-900/5 focus:border-primary-900 transition-all text-secondary-900 placeholder:text-secondary-400"
                        placeholder="Last name"
                        required
                    />
                </div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-2 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-900/5 focus:border-primary-900 transition-all text-secondary-900 placeholder:text-secondary-400"
                    placeholder="Email address"
                    required
                />
                
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-primary-900 text-white font-bold rounded-lg hover:bg-primary-800 transition-all disabled:opacity-50 mt-4"
                >
                    {loading ? 'Sending code...' : 'Send Sign Up Code'}
                </button>
            </form>
        </div>
    );
}

export function VerifyOTPForm({ email, onBusyChange }: { email: string; onBusyChange?: ModalBusyReporter }) {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        onBusyChange?.(true, 'Verifying your email...');
        try {
            const { error } = await withRequestTimeout(authClient.emailOtp.verifyEmail({
                email,
                otp,
            }));
            if (error) {
                toast.error(error.message || 'Invalid verification code');
            } else {
                toast.success('Email verified successfully!');
                router.push('/');
                router.refresh();
            }
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
        } finally {
            setLoading(false);
            onBusyChange?.(false);
        }
    };

    const handleResend = async () => {
        onBusyChange?.(true, 'Resending verification code...');
        try {
            const { error } = await withRequestTimeout(authClient.emailOtp.sendVerificationOtp({
                email,
                type: 'email-verification',
            }));
            if (error) {
                toast.error(error.message || 'Failed to resend code');
            } else {
                toast.success('Verification code resent');
            }
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
        } finally {
            onBusyChange?.(false);
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-secondary-600 text-sm mb-4">
                    We've sent a 6-digit verification code to <span className="font-bold text-secondary-900">{email}</span>.
                </p>
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-5 py-3 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-900/5 focus:border-primary-900 transition-all text-secondary-900 placeholder:text-secondary-400 text-center text-2xl tracking-[0.5em] font-bold"
                    placeholder="000000"
                    maxLength={6}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-secondary-200 text-secondary-400 font-bold rounded-lg hover:bg-secondary-300 hover:text-secondary-500 transition-all disabled:opacity-50 mt-4 active:bg-primary-900 active:text-white"
                >
                    {loading ? 'Verifying...' : 'Verify Email'}
                </button>
                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={handleResend}
                        className="text-primary-900 text-sm font-bold hover:underline"
                    >
                        Resend Code
                    </button>
                </div>
            </form>
        </div>
    );
}
