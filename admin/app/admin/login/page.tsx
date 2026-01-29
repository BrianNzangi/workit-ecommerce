'use client';

import { useState } from 'react';
import { signIn } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
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
    <div className="min-h-screen flex">
      {/* Left Panel - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12 text-white">
          {/* Icon */}
          <div className="mb-8 inline-flex">
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform rotate-12 transition-transform hover:rotate-0 duration-300">
                <Sparkles className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Hello<br />
            Workit!
          </h1>

          {/* Description */}
          <p className="text-lg text-white/90 leading-relaxed max-w-md">
            Streamlining Workit e-commerce operations with powerful admin tools.
            Track sales, manage inventory, and analyze performance through automation
            and track tons of data!
          </p>

          {/* Footer */}
          <div className="mt-auto pt-12">
            <p className="text-white/70 text-sm">
              © {new Date().getFullYear()} Workit. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
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
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-secondary-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-3 border border-secondary-200 rounded-xl bg-white text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-secondary-300"
                  placeholder="hello@workit.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-secondary-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm text-primary-700 hover:text-primary-900 font-medium transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-3 border border-secondary-200 rounded-xl bg-white text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-secondary-300"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-secondary-900 hover:bg-secondary-800 disabled:bg-secondary-400 text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 shadow-lg shadow-secondary-900/20 hover:shadow-xl hover:shadow-secondary-900/30 transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Login Now'
              )}
            </button>
          </form>


          {/* Help Text */}
          <p className="mt-8 text-center text-sm text-secondary-500">
            Need help? Contact{' '}
            <a href="mailto:support@workit.co.ke" className="text-primary-700 hover:text-primary-900 font-medium transition-colors">
              support@workit.co.ke
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
