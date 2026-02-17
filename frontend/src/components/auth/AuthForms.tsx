'use client';

import { useState } from 'react';
import { signIn, signUp, authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

export function SocialLogin() {
    const handleGoogleSignIn = async () => {
        try {
            await signIn.social({
                provider: 'google',
                callbackURL: '/',
            });
        } catch (err: any) {
            toast.error(err.message || 'Failed to sign in with Google');
        }
    };

    return (
        <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-2 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-all duration-200 font-medium text-secondary-700"
        >
            <FcGoogle className="text-2xl" />
            <span>Google</span>
        </button>
    );
}

export function Separator() {
    return (
        <div className="relative flex items-center justify-center my-8">
            <div className="grow border-t border-secondary-100"></div>
            <span className="shrink mx-4 text-secondary-400 text-sm font-medium">Or</span>
            <div className="grow border-t border-secondary-100"></div>
        </div>
    );
}

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await signIn.email({
                email,
                password,
                callbackURL: '/',
            });
            if (error) {
                toast.error(error.message || 'Failed to sign in');
            } else {
                toast.success('Signed in successfully');
                router.refresh();
            }
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <SocialLogin />
            <Separator />

            <form onSubmit={handleSubmit} className="space-y-5">
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
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-2 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-900/5 focus:border-primary-900 transition-all text-secondary-900 placeholder:text-secondary-400"
                        placeholder="Password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                    >
                        {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                    </button>
                </div>

                <div className="text-left">
                    <button type="button" className="text-primary-900 text-sm hover:underline">
                        Forgot password?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-secondary-200 text-secondary-400 font-bold rounded-lg hover:bg-secondary-300 hover:text-secondary-500 transition-all disabled:opacity-50 mt-4 active:bg-primary-900 active:text-white"
                >
                    {loading ? 'Processing...' : 'Continue'}
                </button>
            </form>
        </div>
    );
}

export function SignUpForm({ ontoVerify }: { ontoVerify: (email: string) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await signUp.email({
                email,
                password,
                name: `${firstName} ${lastName}`,
                firstName,
                lastName,
                callbackURL: '/',
            } as any);
            if (error) {
                toast.error(error.message || 'Failed to sign up');
            } else {
                // Send verification OTP after successful sign-up
                await authClient.emailOtp.sendVerificationOtp({
                    email,
                    type: "email-verification",
                });
                toast.success('Account created! Please verify your email.');
                ontoVerify(email);
            }
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <SocialLogin />
            <Separator />

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-2 rounded-lg border border-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-900/5 focus:border-primary-900 transition-all text-secondary-900 placeholder:text-secondary-400"
                    placeholder="Create password"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-secondary-200 text-secondary-400 font-bold rounded-lg hover:bg-secondary-300 hover:text-secondary-500 transition-all disabled:opacity-50 mt-4 active:bg-primary-900 active:text-white"
                >
                    {loading ? 'Creating...' : 'Create Account'}
                </button>
            </form>
        </div>
    );
}

export function VerifyOTPForm({ email }: { email: string }) {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await authClient.emailOtp.verifyEmail({
                email,
                otp,
            });
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
        }
    };

    const handleResend = async () => {
        try {
            const { error } = await authClient.emailOtp.sendVerificationOtp({
                email,
                type: 'email-verification',
            });
            if (error) {
                toast.error(error.message || 'Failed to resend code');
            } else {
                toast.success('Verification code resent');
            }
        } catch (err: any) {
            toast.error(err.message || 'An error occurred');
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
