'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2, Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
    product?: {
        name?: string;
    } | null;
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
    getStatusColor: (state: string) => string;
}

export function InvoiceDisplay({
    order,
    orderStates,
    updatingStatus,
    onStatusUpdate,
    getStatusColor,
}: InvoiceDisplayProps) {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const lines = Array.isArray(order.lines) ? order.lines : [];

    const formatCurrency = (amount: number) => {
        return `KES ${amount.toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
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

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current) return;

        try {
            const clone = invoiceRef.current.cloneNode(true) as HTMLElement;
            
            const replaceUnsupportedColors = (element: HTMLElement) => {
                const style = window.getComputedStyle(element);
                const props = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'];
                
                props.forEach(prop => {
                    const value = style.getPropertyValue(prop);
                    if (value.includes('lab(') || value.includes('oklch(') || value.includes('lch(')) {
                        (element.style as any)[prop] = '#000000';
                    }
                });

                Array.from(element.children).forEach(child => {
                    if (child instanceof HTMLElement) {
                        replaceUnsupportedColors(child);
                    }
                });
            };

            clone.style.position = 'absolute';
            clone.style.left = '-9999px';
            clone.style.top = '0';
            clone.style.transform = 'none';
            clone.style.width = invoiceRef.current.offsetWidth + 'px';
            document.body.appendChild(clone);

            replaceUnsupportedColors(clone);

            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
            });

            document.body.removeChild(clone);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`invoice-${order.code}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    return (
        <div className="flex gap-6">
            <div className="flex-1">
                <div className="no-print mb-4">
                    <Button asChild variant="ghost" size="sm" className="rounded -ml-2 text-gray-500 hover:text-gray-900">
                        <Link href="/admin/orders">
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Back to Orders
                        </Link>
                    </Button>
                </div>

                <div className="no-print mb-4">
                    <h1 className="text-xl font-semibold text-gray-900">Order {order.code}</h1>
                </div>

                <div
                    ref={invoiceRef}
                    className="rounded border border-gray-200 bg-white shadow-sm"
                    style={{ transform: 'scale(0.85)', transformOrigin: 'top left', width: '117.6%' }}
                >
                    <CardContent className="p-8 space-y-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
                                <p className="text-sm text-gray-500 mt-1">#{order.code}</p>
                            </div>

                            <div className="text-right space-y-1">
                                <p className="text-xs font-medium text-gray-500 uppercase">Issue Date</p>
                                <p className="text-sm font-semibold text-gray-900">{formatOrderDate(order.createdAt)}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">From</h4>
                                <div className="text-sm space-y-1">
                                    <p className="font-semibold text-gray-900">Workit Enterprises</p>
                                    <p className="text-gray-600">Nairobi, Kenya</p>
                                    <p className="text-gray-600">support@workit.co.ke</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Bill To</h4>
                                <div className="text-sm space-y-1">
                                    <p className="font-semibold text-gray-900">
                                        {order.customer.firstName} {order.customer.lastName}
                                    </p>
                                    <p className="text-gray-600">{order.customer.email}</p>
                                    {order.shippingAddress && (
                                        <div className="text-gray-600">
                                            <p>{order.shippingAddress.streetLine1}</p>
                                            {order.shippingAddress.streetLine2 && <p>{order.shippingAddress.streetLine2}</p>}
                                            <p>
                                                {order.shippingAddress.city}, {order.shippingAddress.province}
                                            </p>
                                            <p className="text-gray-900 mt-1">{order.shippingAddress.phoneNumber}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">Product</TableHead>
                                        <TableHead className="text-right font-semibold">Qty</TableHead>
                                        <TableHead className="text-right font-semibold">Price</TableHead>
                                        <TableHead className="text-right font-semibold">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lines.map((line) => {
                                        const productName = line.product?.name || 'Unknown Product';
                                        return (
                                            <TableRow key={line.id}>
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">{productName}</div>
                                                </TableCell>
                                                <TableCell className="text-right text-gray-700">{line.quantity}</TableCell>
                                                <TableCell className="text-right text-gray-700">{formatCurrency(line.linePrice)}</TableCell>
                                                <TableCell className="text-right font-semibold text-gray-900">
                                                    {formatCurrency(line.linePrice * line.quantity)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end">
                            <div className="w-full md:w-72 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(order.subTotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Delivery</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(order.shipping)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-base font-semibold text-gray-900">Total</span>
                                    <span className="text-xl font-bold text-gray-900">{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="text-center text-sm text-gray-500">
                            <p>Thank you for your business!</p>
                            <p className="text-xs mt-1">For questions about your order, contact support@workit.co.ke</p>
                        </div>
                    </CardContent>
                </div>
            </div>

            <div className="no-print w-72 shrink-0">
                <div className="sticky top-0 pt-0 space-y-4">
                    <Card className="rounded border border-gray-200">
                        <CardContent className="p-5 space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900">Order Actions</h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Status</label>
                                    <Select value={order.state} onValueChange={onStatusUpdate} disabled={updatingStatus}>
                                        <SelectTrigger className="w-full rounded">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orderStates.map((state) => (
                                                <SelectItem key={state} value={state}>
                                                    {state.replace(/_/g, ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {updatingStatus && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Updating...
                                        </div>
                                    )}
                                </div>

                                <Badge variant={getStatusBadgeVariant(order.state)} className={`${getStatusColor(order.state)} rounded w-full justify-center py-1.5`}>
                                    {order.state.replace(/_/g, ' ')}
                                </Badge>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadPDF}
                                    className="w-full rounded"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadPDF}
                                    className="w-full rounded"
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Invoice
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded border border-gray-200">
                        <CardContent className="p-5 space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900">Order Info</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Code</span>
                                    <span className="font-medium text-gray-900">{order.code}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date</span>
                                    <span className="font-medium text-gray-900">{formatOrderDate(order.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Customer</span>
                                    <span className="font-medium text-gray-900 truncate ml-2 max-w-[120px]">
                                        {order.customer.firstName} {order.customer.lastName}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
