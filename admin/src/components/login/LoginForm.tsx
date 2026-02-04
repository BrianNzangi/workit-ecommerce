'use client';

import { useState } from 'react';
import { signIn } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import { FormInput } from './FormInput';
import { SubmitButton } from './SubmitButton';
import { ErrorAlert } from './ErrorAlert';

export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { error } = await signIn.email({
                email,
                password,
                callbackURL: '/admin/dashboard',
            });

            if (error) {
                setError(error.message || 'Invalid email or password');
            } else {
                router.push('/admin/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            {/* Logo/Brand for mobile */}
            <div className="lg:hidden mb-8 text-center">
                <h2 className="text-3xl font-bold text-primary-900">Workit</h2>
            </div>

            {/* Form Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-secondary-900 mb-2">
                    Welcome Back!
                </h2>
                <p className="text-secondary-500">
                    Sign in with your email and password below.
                </p>
            </div>

            {/* Error Message */}
            <ErrorAlert message={error} />

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <FormInput
                    id="email"
                    type="email"
                    label="Email Address"
                    value={email}
                    onChange={setEmail}
                    placeholder="hello@workit.com"
                    icon={Mail}
                    disabled={isLoading}
                    required
                />

                {/* Password Field */}
                <FormInput
                    id="password"
                    type="password"
                    label="Password"
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    icon={Lock}
                    disabled={isLoading}
                    required
                    extraAction={
                        <button
                            type="button"
                            className="text-sm text-primary-700 hover:text-primary-900 font-medium transition-colors"
                        >
                            Forgot?
                        </button>
                    }
                />

                {/* Submit Button */}
                <SubmitButton isLoading={isLoading}>
                    Login Now
                </SubmitButton>
            </form>

            {/* Help Text */}
            <p className="mt-8 text-center text-sm text-secondary-500">
                Need help? Contact{' '}
                <a
                    href="mailto:support@workit.co.ke"
                    className="text-primary-700 hover:text-primary-900 font-medium transition-colors"
                >
                    support@workit.co.ke
                </a>
            </p>
        </div>
    );
}
