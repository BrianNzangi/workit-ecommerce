'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { CustomerService } from '@/lib/services/customers/customer.service';

export function CustomerForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate password length
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            const customerService = new CustomerService();
            await customerService.createCustomer({
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
            });

            // Redirect after creation
            router.push('/admin/customers');
        } catch (err: any) {
            setError(err.message || 'Failed to create customer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-6">
                <Link
                    href="/admin/customers"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Customers
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Create Customer</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xs text-red-700 text-sm shadow-xs">
                        {error}
                    </div>
                )}

                {/* Customer Information */}
                <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-[#FF5023]/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-[#FF5023]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
                            <p className="text-sm text-gray-600">Basic details about the customer</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                    placeholder="John"
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                placeholder="john.doe@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                placeholder="+254 700 000 000"
                            />
                        </div>
                    </div>
                </div>

                {/* Account Security */}
                <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password *
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                placeholder="Enter password (min. 8 characters)"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password *
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength={8}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                placeholder="Confirm password"
                            />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xs p-3">
                            <p className="text-sm text-blue-800">
                                <strong>Password requirements:</strong> Minimum 8 characters
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Link
                        href="/admin/customers"
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xs hover:bg-gray-50 transition-colors text-center"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs font-medium"
                    >
                        {loading ? 'Creating...' : 'Create Customer'}
                    </button>
                </div>
            </form>
        </>
    );
}
