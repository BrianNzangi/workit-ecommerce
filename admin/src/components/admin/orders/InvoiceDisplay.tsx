'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface OrderLine {
    id: string;
    quantity: number;
    linePrice: number;
    name?: string;
    productName?: string;
    variant?: {
        name?: string;
        sku?: string;
        product?: {
            name?: string;
        };
    };
}

interface Order {
    id: string;
    code: string;
    state: string;
    total: number;
    subTotal: number;
    shipping: number;
    tax: number;
    createdAt: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
    };
    shippingAddress: {
        streetLine1: string;
        streetLine2: string;
        city: string;
        province: string;
        phoneNumber: string;
    } | null;
    lines: OrderLine[];
}

interface InvoiceDisplayProps {
    order: Order;
    orderStates: string[];
    updatingStatus: boolean;
    onStatusUpdate: (newState: string) => void;
    onPrint: () => void;
    getStatusColor: (state: string) => string;
}

export function InvoiceDisplay({
    order,
    orderStates,
    updatingStatus,
    onStatusUpdate,
    onPrint,
    getStatusColor,
}: InvoiceDisplayProps) {
    const lines = Array.isArray(order.lines) ? order.lines : [];

    const formatCurrency = (amount: number) => {
        return `KES ${amount.toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getInvoiceNumber = (orderCode: string) => {
        return orderCode;
    };

    const cleanProductName = (name: string) => {
        return name.replace(/\s*-?\s*default\s*/gi, '').trim();
    };

    const resolveLineName = (line: OrderLine, index: number) => {
        const rawName =
            line.variant?.name ||
            line.variant?.product?.name ||
            line.name ||
            line.productName ||
            `Item ${index + 1}`;

        const cleaned = cleanProductName(rawName);
        return cleaned.length > 0 ? cleaned : `Item ${index + 1}`;
    };

    const resolveLineSku = (line: OrderLine) => {
        return line.variant?.sku || null;
    };

    const formatOrderDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });
    };

    const getStatusBadgeVariant = (state: string) => {
        const map: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
            CREATED: 'secondary',
            PAYMENT_PENDING: 'warning',
            PAYMENT_AUTHORIZED: 'info',
            PAYMENT_SETTLED: 'success',
            SHIPPED: 'info',
            DELIVERED: 'default',
            CANCELLED: 'error',
        };

        return map[state] || 'secondary';
    };

    return (
        <>
            <style jsx global>{`
                @page {
                    size: auto;
                    margin: 0mm;
                }

                @media print {
                    nav, aside, header, footer, .no-print {
                        display: none !important;
                    }

                    body, html {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                        display: block !important;
                        width: 100% !important;
                    }

                    .admin-layout-container {
                        display: block !important;
                    }

                    .invoice-container {
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        position: relative !important;
                    }
                }
            `}</style>

            <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/admin/orders" title="Back to Orders">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Manage Order</h1>
                        <p className="text-sm text-gray-500">Back to order list</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Select value={order.state} onValueChange={onStatusUpdate} disabled={updatingStatus}>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Select order status" />
                            </SelectTrigger>
                            <SelectContent>
                                {orderStates.map((state) => (
                                    <SelectItem key={state} value={state}>
                                        {state.replace(/_/g, ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin text-primary-700" /> : null}
                    </div>

                    <Badge variant={getStatusBadgeVariant(order.state)} className={getStatusColor(order.state)}>
                        {order.state.replace(/_/g, ' ')}
                    </Badge>
                </div>
            </div>

            <Card id={`invoice-content-${order.id}`} className="invoice-container max-w-4xl mx-auto shadow-xl border-gray-200">
                <CardContent className="p-8 md:p-10 space-y-10">
                    <div className="flex justify-between items-start">
                        <div className="relative w-40 h-14">
                            <Image src="/workit-logo.png" alt="Workit Logo" fill className="object-contain object-left" />
                        </div>

                        <div className="text-right space-y-1">
                            <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider">
                                Invoice # {getInvoiceNumber(order.code)}
                            </h3>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Issue date</div>
                            <div className="text-sm font-semibold text-gray-700">{formatOrderDate(order.createdAt)}</div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Workit</h1>
                        <p className="text-gray-500 text-base font-medium max-w-lg leading-relaxed">
                            Thank you for your purchase. We appreciate your confidence in our products and services.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                        <div>
                            <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Billed By</h4>
                            <div className="text-sm space-y-1">
                                <p className="font-bold text-gray-900">Workit Enterprises</p>
                                <p className="text-gray-600">Nairobi, Kenya</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Bill To</h4>
                            <div className="text-sm space-y-1">
                                <p className="font-bold text-gray-900">
                                    {order.customer.firstName} {order.customer.lastName}
                                </p>
                                <p className="text-gray-600">{order.customer.email}</p>
                                {order.shippingAddress ? (
                                    <div className="text-gray-600">
                                        <p>{order.shippingAddress.streetLine1}</p>
                                        {order.shippingAddress.streetLine2 ? <p>{order.shippingAddress.streetLine2}</p> : null}
                                        <p>
                                            {order.shippingAddress.city}, {order.shippingAddress.province}
                                        </p>
                                        <p className="text-gray-900 mt-1">{order.shippingAddress.phoneNumber}</p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lines.map((line, index) => {
                                    const name = resolveLineName(line, index);
                                    const sku = resolveLineSku(line);
                                    return (
                                        <TableRow key={line.id}>
                                            <TableCell>
                                                <div className="font-semibold text-gray-950">{name}</div>
                                                {sku ? <div className="text-xs text-gray-500 mt-1">SKU: {sku}</div> : null}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-gray-700">{line.quantity}</TableCell>
                                            <TableCell className="text-right font-medium text-gray-700">{formatCurrency(line.linePrice)}</TableCell>
                                            <TableCell className="text-right font-semibold text-gray-950">
                                                {formatCurrency(line.linePrice * line.quantity)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end pt-6">
                        <div className="w-full md:w-80 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-semibold text-gray-950">{formatCurrency(order.subTotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Delivery</span>
                                <span className="font-semibold text-gray-950">{formatCurrency(order.shipping)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">VAT 16.0%</span>
                                <span className="font-semibold text-gray-950">{formatCurrency(order.tax)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-base font-bold text-gray-950 uppercase">Total</span>
                                <span className="text-2xl font-black text-gray-950">{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-200">
                        <div className="max-w-sm text-left">
                            <h5 className="text-xs font-bold text-gray-950 uppercase tracking-wider mb-2">Questions about your order?</h5>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Visit our help center or contact our support team at{' '}
                                <span className="text-primary-800 font-semibold">support@workit.co.ke</span>.
                            </p>
                            <p className="text-[10px] text-gray-400 mt-3 italic">Standard terms and conditions apply to all purchases.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
