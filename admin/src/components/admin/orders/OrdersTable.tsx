import { useState } from 'react';
import Link from 'next/link';
import { Eye, Printer, Download, Pencil, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination } from '@/components/ui/Pagination';
import { Order } from './types';

interface OrdersTableProps {
    orders: Order[];
    onPrintInvoice?: (orderId: string) => void;
    onDownloadInvoice?: (orderId: string, orderCode: string) => void;
    downloadingOrderId?: string | null;
}

const ITEMS_PER_PAGE = 10;

const PAYMENT_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
    CREATED: { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-600' },
    PAYMENT_PENDING: { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-600' },
    PAYMENT_AUTHORIZED: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-700' },
    PAYMENT_SETTLED: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-700' },
    SHIPPED: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-700' },
    DELIVERED: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-700' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' },
};

const ORDER_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
    CREATED: { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-600' },
    PAYMENT_PENDING: { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-600' },
    PAYMENT_AUTHORIZED: { label: 'Ready', bg: 'bg-orange-100', text: 'text-orange-700' },
    PAYMENT_SETTLED: { label: 'Ready', bg: 'bg-orange-100', text: 'text-orange-700' },
    SHIPPED: { label: 'Shipped', bg: 'bg-gray-700', text: 'text-white' },
    DELIVERED: { label: 'Delivered', bg: 'bg-blue-100', text: 'text-blue-700' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' },
};

const formatCurrency = (amount: number) =>
    `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).replace(',', '');

export function OrdersTable({ orders, onPrintInvoice, onDownloadInvoice, downloadingOrderId }: OrdersTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const toggleSelectAll = () => {
        if (selectedOrders.size === paginatedOrders.length) {
            setSelectedOrders(new Set());
        } else {
            setSelectedOrders(new Set(paginatedOrders.map((o) => o.id)));
        }
    };

    const toggleSelect = (orderId: string) => {
        const newSelected = new Set(selectedOrders);
        if (newSelected.has(orderId)) {
            newSelected.delete(orderId);
        } else {
            newSelected.add(orderId);
        }
        setSelectedOrders(newSelected);
    };

    return (
        <div className="rounded border border-gray-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="w-12 px-4 py-3">
                                <Checkbox
                                    checked={selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Order
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Customer
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Payment Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Order Status
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Total
                            </th>
                            <th className="w-32 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {paginatedOrders.map((order) => {
                            const paymentStatus = PAYMENT_STATUS_MAP[order.state] || PAYMENT_STATUS_MAP.CREATED;
                            const orderStatus = ORDER_STATUS_MAP[order.state] || ORDER_STATUS_MAP.CREATED;
                            const customerName = `${order.customer.firstName} ${order.customer.lastName}`.trim();

                            return (
                                <tr key={order.id} className="transition-colors hover:bg-gray-50/50">
                                    <td className="px-4 py-3">
                                        <Checkbox
                                            checked={selectedOrders.has(order.id)}
                                            onCheckedChange={() => toggleSelect(order.id)}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="text-sm font-semibold text-primary-700 hover:text-primary-900"
                                        >
                                            #{order.code}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{customerName}</td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant="outline"
                                            className={`rounded border-0 px-2.5 py-0.5 text-xs font-medium ${paymentStatus.bg} ${paymentStatus.text}`}
                                        >
                                            {paymentStatus.label}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant="outline"
                                            className={`rounded border-0 px-2.5 py-0.5 text-xs font-medium ${orderStatus.bg} ${orderStatus.text}`}
                                        >
                                            {orderStatus.label}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                        {formatCurrency(order.total)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-primary-900 hover:bg-primary-50"
                                            >
                                                <Link href={`/admin/orders/${order.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {onPrintInvoice && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onPrintInvoice(order.id)}
                                                    className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {onDownloadInvoice && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDownloadInvoice(order.id, order.code)}
                                                    disabled={downloadingOrderId === order.id}
                                                    className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
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
                totalItems={orders.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
