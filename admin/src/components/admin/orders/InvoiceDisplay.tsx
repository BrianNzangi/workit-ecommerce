'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Printer, Loader2, CheckCircle2 } from 'lucide-react';

interface OrderLine {
    id: string;
    quantity: number;
    linePrice: number;
    variant: {
        name: string;
        sku: string;
        product: {
            name: string;
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
    getStatusColor
}: InvoiceDisplayProps) {

    const formatCurrency = (amount: number) => {
        return `KES ${amount.toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getShortOrderNumber = (orderCode: string) => {
        return orderCode.slice(-6).toUpperCase();
    };

    const cleanProductName = (name: string) => {
        return name.replace(/\s*-?\s*default\s*/gi, '').trim();
    };

    return (
        <>
            <style jsx global>{`
                @media print {
                    nav, aside, header, footer, .no-print { 
                        display: none !important; 
                    }
                    
                    body, html { 
                        background: white !important; 
                        margin: 0 !important; 
                        padding: 0 !important;
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
                    
                    .text-brand { color: #FF5023 !important; }
                    .bg-slate-700 { background-color: #334155 !important; }
                }
                .text-brand { color: #FF5023; }
                .bg-brand { background-color: #FF5023; }
            `}</style>

            {/* Header Actions */}
            <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 font-sans">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/orders"
                        className="bg-white border border-gray-200 rounded-lg p-2.5 hover:bg-gray-50 text-gray-500 transition-colors shadow-sm"
                        title="Back to Orders"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Manage Order</h1>
                        <p className="text-sm text-gray-500">Back to order list</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm">
                        <span className="text-[10px] font-black text-gray-400 uppercase px-2 tracking-widest">Status</span>
                        <select
                            value={order.state}
                            onChange={(e) => onStatusUpdate(e.target.value)}
                            disabled={updatingStatus}
                            className={`text-xs font-black rounded-md px-2.5 py-1 focus:outline-none transition-colors cursor-pointer uppercase ${getStatusColor(order.state)}`}
                        >
                            {orderStates.map(state => (
                                <option key={state} value={state}>
                                    {state.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                        {updatingStatus && <Loader2 className="w-4 h-4 animate-spin mx-2 text-brand" />}
                    </div>

                    <button
                        onClick={onPrint}
                        className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-black font-bold shadow-md transition-all active:scale-95 text-sm"
                    >
                        <Printer className="w-4 h-4" />
                        Print Invoice
                    </button>
                </div>
            </div>

            {/* Invoice Body */}
            <div className="invoice-container bg-white shadow-xl border border-gray-100 min-h-[1100px] flex flex-col max-w-4xl mx-auto font-sans">

                {/* Header Section */}
                <div className="p-8 md:p-10">
                    <div className="flex justify-between items-start mb-2">
                        <div className="relative w-60 h-40">
                            <Image
                                src="/workit-logo.png"
                                alt="Workit Logo"
                                width={154}
                                height={154}
                                className="object-contain"
                            />
                        </div>
                        <div className="text-right">
                            <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest">Invoice# {getShortOrderNumber(order.code)}</h3>
                            <div className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">Issue date</div>
                            <div className="text-sm font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</div>
                        </div>
                    </div>

                    {/* Divider Bar */}
                    <div className="w-full h-1.5 bg-slate-700 mb-8 rounded-full opacity-90"></div>

                    {/* Title & Welcome */}
                    <div className="mb-10">
                        <h1 className="text-5xl font-black text-gray-900 mb-3 tracking-tighter">Workit</h1>
                        <p className="text-gray-500 text-lg font-medium max-w-lg leading-relaxed">Thank you for your purchase. We appreciate your confidence in our products and services!</p>
                    </div>

                    {/* Details Grid (2 columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        {/* Billed By */}
                        <div>
                            <h4 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-4 border-b border-gray-100 pb-2">Billed By</h4>
                            <div className="text-sm space-y-1.5">
                                <p className="font-black text-gray-900 text-base">Workit Enterprises</p>
                                <p className="text-gray-600 font-medium">Nairobi, Kenya</p>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div>
                            <h4 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-4 border-b border-gray-100 pb-2">Bill To</h4>
                            <div className="text-sm space-y-1.5">
                                <p className="font-black text-gray-900 text-base">{order.customer.firstName} {order.customer.lastName}</p>
                                <p className="text-gray-600 font-medium">{order.customer.email}</p>
                                {order.shippingAddress && (
                                    <div className="text-gray-600 font-medium">
                                        <p>{order.shippingAddress.streetLine1}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                                        <p className="mt-1 text-gray-900">{order.shippingAddress.phoneNumber}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-10">
                        <table className="w-full text-left border-collapse">
                            <thead className="border-b-2 border-slate-900">
                                <tr className="text-[11px] font-black text-gray-950 uppercase tracking-[0.2em]">
                                    <th className="py-5">Item</th>
                                    <th className="py-5 text-right pr-8">Qty</th>
                                    <th className="py-5 text-right pr-8">Price</th>
                                    <th className="py-5 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.lines.map((line) => (
                                    <tr key={line.id} className="group">
                                        <td className="py-6 pr-4">
                                            <div className="font-black text-gray-950 text-base group-hover:text-brand transition-colors">{cleanProductName(line.variant.name)}</div>
                                        </td>
                                        <td className="py-6 text-right pr-8 font-bold text-gray-600 text-sm">{line.quantity}</td>
                                        <td className="py-6 text-right pr-8 font-bold text-gray-600 text-sm">{formatCurrency(line.linePrice)}</td>
                                        <td className="py-6 text-right font-black text-gray-950 text-base">{formatCurrency(line.linePrice * line.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Section */}
                    <div className="flex justify-end pt-10 border-t-2 border-gray-950">
                        <div className="w-full md:w-72 space-y-6">
                            <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-gray-950">{formatCurrency(order.subTotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-widest">
                                <span>Delivery</span>
                                <span className="text-gray-950">{formatCurrency(order.shipping)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2">
                                <span>VAT 16.0%</span>
                                <span className="text-gray-950">{formatCurrency(order.tax)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-base font-black text-gray-950 uppercase tracking-tighter">Total</span>
                                <span className="text-2xl font-black text-gray-950 tracking-tighter">{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-auto p-12 md:p-16 pt-0">
                    <div className="border-t border-gray-100 pt-16 flex flex-col md:flex-row justify-between items-end gap-10">
                        <div className="max-w-sm">
                            <h5 className="text-[11px] font-black text-gray-950 uppercase tracking-widest mb-3">Questions about your order?</h5>
                            <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                Visit our help center or contact our support team at <span className="text-brand font-black underline decoration-2 underline-offset-2">support@workit.co.ke</span> for assistance with returns, warranties, or delivery inquiries.
                            </p>
                            <p className="text-[9px] text-gray-400 mt-4 italic font-bold">Standard terms and conditions apply to all purchases.</p>
                        </div>
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-1">
                            Page 01
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
