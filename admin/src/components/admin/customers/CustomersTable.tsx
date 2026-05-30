import { useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Trash2, Mail, Smartphone, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination } from '@/components/ui/Pagination';
import { CustomerRecord } from './types';
import { getCustomerInitials, getCustomerName } from './customers-utils';

interface CustomersTableProps {
    customers: CustomerRecord[];
}

const ITEMS_PER_PAGE = 10;

const formatCurrency = (amount: number) =>
    `KES ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function CustomersTable({ customers }: CustomersTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());

    const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCustomers = customers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const toggleSelectAll = () => {
        if (selectedCustomers.size === paginatedCustomers.length) {
            setSelectedCustomers(new Set());
        } else {
            setSelectedCustomers(new Set(paginatedCustomers.map((c) => c.id)));
        }
    };

    const toggleSelect = (customerId: string) => {
        const newSelected = new Set(selectedCustomers);
        if (newSelected.has(customerId)) {
            newSelected.delete(customerId);
        } else {
            newSelected.add(customerId);
        }
        setSelectedCustomers(newSelected);
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-blue-100 text-blue-700',
            'bg-green-100 text-green-700',
            'bg-purple-100 text-purple-700',
            'bg-orange-100 text-orange-700',
            'bg-pink-100 text-pink-700',
            'bg-indigo-100 text-indigo-700',
            'bg-teal-100 text-teal-700',
            'bg-amber-100 text-amber-700',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="rounded bg-white">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="w-12 px-4 py-3">
                                <Checkbox
                                    checked={selectedCustomers.size === paginatedCustomers.length && paginatedCustomers.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Location
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Orders
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Spent
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Notifications
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCustomers.map((customer) => {
                            const name = getCustomerName(customer);
                            const initials = getCustomerInitials(customer);
                            const avatarColor = getAvatarColor(name);

                            return (
                                <tr key={customer.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                                    <td className="px-4 py-3">
                                        <Checkbox
                                            checked={selectedCustomers.has(customer.id)}
                                            onCheckedChange={() => toggleSelect(customer.id)}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor}`}>
                                                {initials}
                                            </div>
                                            <Link
                                                href={`/admin/customers/${customer.id}`}
                                                className="text-sm font-medium text-gray-900 hover:text-primary-700"
                                            >
                                                {name}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {customer.location || 'Unknown'}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                                        {customer.ordersCount || 0}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                        {formatCurrency(customer.totalSpent || 0)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className={`flex items-center justify-center w-7 h-7 rounded-full ${customer.notifications?.emailNotifications ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`} title={`Email: ${customer.notifications?.emailNotifications ? 'On' : 'Off'}`}>
                                                <Mail size={14} />
                                            </div>
                                            <div className={`flex items-center justify-center w-7 h-7 rounded-full ${customer.notifications?.smsNotifications ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`} title={`SMS: ${customer.notifications?.smsNotifications ? 'On' : 'Off'}`}>
                                                <Smartphone size={14} />
                                            </div>
                                            <div className={`flex items-center justify-center w-7 h-7 rounded-full ${customer.notifications?.promoNotifications ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`} title={`Promos: ${customer.notifications?.promoNotifications ? 'On' : 'Off'}`}>
                                                <Bell size={14} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Button asChild variant="ghost" size="sm" className="rounded hover:bg-gray-100">
                                            <Link href={`/admin/customers/${customer.id}`}>
                                                <Eye size={16} className="mr-1" />
                                                View
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={customers.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
