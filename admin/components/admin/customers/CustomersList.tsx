'use client';

import { useEffect, useState } from 'react';
import { Users, Loader2, Mail, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Customer {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    createdAt: string;
    enabled: boolean;
}

export function CustomersList() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch('/api/admin/customers');
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch customers');
            }

            setCustomers(data.customers || []);
        } catch (err) {
            console.error('Error fetching customers:', err);
            setError(err instanceof Error ? err.message : 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xs border border-gray-200 p-8 shadow-xs">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-[#FF5023] animate-spin" />
                    <span className="ml-3 text-gray-600 font-sans">Loading customers...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xs border border-gray-200 p-8 shadow-xs">
                <div className="text-center py-12">
                    <p className="text-red-600 font-sans">{error}</p>
                </div>
            </div>
        );
    }

    if (customers.length === 0) {
        return (
            <div className="bg-white rounded-xs border border-gray-200 p-8 shadow-xs">
                <div className="text-center py-12 font-sans">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers yet</h3>
                    <p className="text-gray-600 mb-6">Customer accounts will appear here when they register or purchase</p>
                    <Link
                        href="/admin/customers/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs"
                    >
                        Create Your First Customer
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xs shadow-xs border border-gray-200 overflow-hidden font-sans">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                Customer
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                Contact
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                Registered
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-[#FF5023] font-bold border border-gray-200 uppercase group-hover:bg-[#FF5023] group-hover:text-white transition-colors">
                                            {customer.firstName[0]}{customer.lastName[0]}
                                        </div>
                                        <div className="ml-4">
                                            <Link
                                                href={`/admin/customers/${customer.id}`}
                                                className="text-sm font-black text-gray-900 hover:text-[#FF5023] transition-colors"
                                            >
                                                {customer.firstName} {customer.lastName}
                                            </Link>
                                            <div className="text-xs text-gray-400 font-bold mt-0.5">ID: {customer.id.slice(0, 8)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center text-sm text-gray-600 font-medium">
                                            <Mail className="w-3.5 h-3.5 mr-2 text-gray-300" />
                                            {customer.email}
                                        </div>
                                        {customer.phoneNumber && (
                                            <div className="flex items-center text-sm text-gray-600 font-medium">
                                                <Phone className="w-3.5 h-3.5 mr-2 text-gray-300" />
                                                {customer.phoneNumber}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-600 font-medium">
                                        <Calendar className="w-3.5 h-3.5 mr-2 text-gray-300" />
                                        {formatDate(customer.createdAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-right">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${customer.enabled
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                        : 'bg-red-50 text-red-700 border border-red-100'
                                        }`}>
                                        {customer.enabled ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
