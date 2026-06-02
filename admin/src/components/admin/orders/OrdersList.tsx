'use client';

import { useEffect, useRef, useState } from 'react';
import { ShoppingCart, Loader2, Printer, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useReactToPrint } from 'react-to-print';

interface Order {
    id: string;
    code: string;
    state: string;
    total: number;
    createdAt: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface InvoiceLine {
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

interface InvoiceOrder extends Order {
    subTotal: number;
    shipping: number;
    tax: number;
    shippingAddress?: {
        streetLine1?: string;
        streetLine2?: string;
        city?: string;
        province?: string;
        phoneNumber?: string;
    } | null;
    lines?: InvoiceLine[];
}

export function OrdersList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
    const invoiceCacheRef = useRef<Map<string, InvoiceOrder>>(new Map());
    const cleanupPrintRef = useRef<(() => void) | null>(null);
    const titleRef = useRef('invoice');

    const handleDownloadPdf = useReactToPrint({
        documentTitle: () => titleRef.current,
        pageStyle: `
            @page { size: A4; margin: 10mm; }
            @media print {
                body {
                    margin: 0;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                    display: flex;
                    justify-content: center;
                }
                .invoice-export-root {
                    width: 100% !important;
                    max-width: 190mm !important;
                    margin: 0 auto !important;
                    padding: 10mm !important;
                    box-shadow: none !important;
                }
                .items-table tr {
                    page-break-inside: avoid;
                }
            }
        `,
        onAfterPrint: () => {
            cleanupPrintRef.current?.();
            cleanupPrintRef.current = null;
            setDownloadingOrderId(null);
        },
        onPrintError: (_errorLocation, error) => {
            console.error('Print error:', error);
            toast({
                title: 'Download failed',
                description: error.message || 'Failed to generate invoice PDF.',
                variant: 'error',
            });
            cleanupPrintRef.current?.();
            cleanupPrintRef.current = null;
            setDownloadingOrderId(null);
        },
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/admin/orders', {
                credentials: 'include',
            });
            const text = await response.text();

            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('[OrdersList] JSON parse error:', e);
                throw new Error('Server returned invalid data format (HTML instead of JSON)');
            }

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch orders');
            }

            setOrders(result.orders || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err instanceof Error ? err.message : 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `KES ${amount.toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (state: string) => {
        const colors: Record<string, string> = {
            CREATED: 'bg-gray-100 text-gray-800',
            PAYMENT_PENDING: 'bg-yellow-100 text-yellow-800',
            PAYMENT_AUTHORIZED: 'bg-blue-100 text-blue-800',
            PAYMENT_SETTLED: 'bg-green-100 text-green-800',
            SHIPPED: 'bg-indigo-100 text-indigo-800',
            DELIVERED: 'bg-emerald-100 text-emerald-800',
            CANCELLED: 'bg-red-100 text-red-800',
        };
        return colors[state] || 'bg-gray-100 text-gray-800';
    };

    const openPrintInvoice = (orderId: string) => {
        const url = `/admin/orders/${orderId}?action=print`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const escapeHtml = (value: string) =>
        value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    const getLineName = (line: InvoiceLine, index: number): string => {
        const rawName =
            line.variant?.name ||
            line.variant?.product?.name ||
            line.name ||
            line.productName ||
            `Item ${index + 1}`;
        return rawName.replace(/\s*-?\s*default\s*/gi, '').trim() || `Item ${index + 1}`;
    };

    const buildInvoiceMarkup = (order: InvoiceOrder) => {
        const created = new Date(order.createdAt);
        const issueDate = created.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
        const dueDate = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000)
            .toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
            });

        const logoSrc = `${window.location.origin}/workit-logo.png`;
        const customerName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Customer';
        const customerEmail = order.customer?.email || '-';
        const ship = order.shippingAddress;
        const customerAddress = ship
            ? `${escapeHtml(ship.streetLine1 || '')}${ship.streetLine2 ? ', ' + escapeHtml(ship.streetLine2) : ''}<br />${escapeHtml(ship.city || '')}${ship.city && ship.province ? ', ' : ''}${escapeHtml(ship.province || '')}${ship.phoneNumber ? '<br />Phone: ' + escapeHtml(ship.phoneNumber) : ''}`
            : '-';

        const lines = Array.isArray(order.lines) ? order.lines : [];
        const subTotal = order.subTotal || 0;
        const totalTax = order.tax || 0;
        const total = order.total || 0;

        const lineRows = lines
            .map((line, idx) => {
                const name = escapeHtml(getLineName(line, idx));
                const qty = line.quantity || 0;
                const unitPrice = line.linePrice || 0;
                const lineTotal = unitPrice * qty;
                const lineTax = subTotal > 0 ? Math.round((lineTotal / subTotal) * totalTax * 100) / 100 : 0;
                return `
                <tr>
                  <td class="item-name-cell">${name}</td>
                  <td class="qty-cell">${qty}</td>
                  <td class="price-cell">${escapeHtml(formatCurrency(unitPrice))}</td>
                  <td class="tax-cell">${escapeHtml(formatCurrency(lineTax))}</td>
                  <td class="total-cell">${escapeHtml(formatCurrency(lineTotal))}</td>
                </tr>`;
            })
            .join('');

        const status = (order.state || 'CREATED').replace(/_/g, ' ');

        return `
        <div class="invoice-export-root">
          <style>
            .invoice-export-root {
              width: 1080px;
              background: #ffffff;
              color: #111827;
              font-family: "Hanken Grotesk", Arial, sans-serif;
              box-sizing: border-box;
              margin: 0 auto;
              padding: 40px;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 8px;
            }
            .header-left { flex: 1; }
            .invoice-logo {
              width: 170px;
              height: 54px;
              object-fit: contain;
              object-position: left center;
            }
            .header-brand {
              margin: 8px 0 4px;
              font-size: 26px;
              font-weight: 900;
              letter-spacing: -0.02em;
              color: #111827;
            }
            .header-sub {
              margin: 0 0 4px;
              font-size: 14px;
              color: #6b7280;
              font-weight: 600;
            }
            .header-address {
              margin: 0;
              font-size: 12px;
              color: #6b7280;
              line-height: 1.6;
            }
            .header-right { flex-shrink: 0; }
            .invoice-details-box {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 18px 22px;
              min-width: 260px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 3px 0;
            }
            .detail-label {
              font-size: 11px;
              color: #6b7280;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.06em;
            }
            .detail-value {
              font-size: 12px;
              color: #111827;
              font-weight: 700;
            }
            .detail-value.amount {
              font-size: 15px;
              color: #e71333;
              font-weight: 800;
            }
            .detail-value.status-value {
              color: #059669;
            }
            .detail-separator {
              height: 1px;
              background: #e5e7eb;
              margin: 6px 0;
            }
            .status-badge-wrapper {
              text-align: center;
              margin: 16px 0 24px;
            }
            .status-badge {
              display: inline-block;
              padding: 7px 44px;
              font-size: 16px;
              font-weight: 800;
              letter-spacing: 0.2em;
              color: #ffffff;
              background: #059669;
              border-radius: 4px;
            }
            .address-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 28px;
            }
            .section-label {
              margin: 0 0 10px;
              font-size: 10px;
              color: #6b7280;
              font-weight: 800;
              letter-spacing: 0.16em;
              text-transform: uppercase;
            }
            .section-name {
              margin: 0 0 6px;
              font-size: 16px;
              line-height: 1.3;
              color: #111827;
              font-weight: 800;
            }
            .section-line {
              margin: 0 0 3px;
              font-size: 13px;
              line-height: 1.5;
              color: #4b5563;
              font-weight: 500;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            .items-table thead th {
              text-align: left;
              color: #6b7280;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              padding: 10px 10px 10px 0;
              border-bottom: 2px solid #111827;
            }
            .items-table thead th.right { text-align: right; padding-right: 0; }
            .items-table tbody td {
              border-bottom: 1px solid #f3f4f6;
              padding: 12px 10px 12px 0;
              vertical-align: middle;
              font-size: 13px;
            }
            .item-name-cell {
              font-weight: 700;
              color: #111827;
            }
            .qty-cell,
            .price-cell,
            .tax-cell {
              text-align: right;
              color: #4b5563;
              font-weight: 600;
            }
            .total-cell {
              text-align: right;
              color: #111827;
              font-weight: 800;
              padding-right: 0 !important;
            }
            .summary-wrap {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 28px;
            }
            .summary {
              width: 300px;
              padding: 16px 20px;
              background: #f9fafb;
              border-radius: 8px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 13px;
            }
            .summary-label { color: #6b7280; }
            .summary-value { color: #111827; font-weight: 700; }
            .summary-value.discount { color: #e71333; }
            .summary-divider {
              height: 1px;
              background: #d1d5db;
              margin: 10px 0;
            }
            .summary-total {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .summary-total-label {
              color: #111827;
              font-size: 14px;
              font-weight: 800;
              text-transform: uppercase;
            }
            .summary-total-value {
              color: #111827;
              font-size: 22px;
              font-weight: 900;
            }
            .footer {
              padding: 18px 20px;
              background: #f9fafb;
              border-radius: 8px;
            }
            .footer-title {
              margin: 0 0 6px;
              font-size: 10px;
              color: #111827;
              font-weight: 800;
              letter-spacing: 0.16em;
              text-transform: uppercase;
            }
            .footer-text {
              margin: 0;
              font-size: 11px;
              color: #6b7280;
              line-height: 1.6;
            }
          </style>

          <div class="invoice-header">
            <div class="header-left">
              <img class="invoice-logo" src="${logoSrc}" alt="Workit" />
              <div class="header-brand">Workit</div>
              <div class="header-sub">Admin.</div>
              <p class="header-address">
                1728 Bangar St<br />
                Houston, ME 83743, United States<br />
                Phone: (+1) 142-5328-010
              </p>
            </div>
            <div class="header-right">
              <div class="invoice-details-box">
                <div class="detail-row">
                  <span class="detail-label">Invoice No</span>
                  <span class="detail-value">#${escapeHtml(order.code)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Issue Date</span>
                  <span class="detail-value">${escapeHtml(issueDate)}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Due Date</span>
                  <span class="detail-value">${escapeHtml(dueDate)}</span>
                </div>
                <div class="detail-separator"></div>
                <div class="detail-row">
                  <span class="detail-label">Amount</span>
                  <span class="detail-value amount">${escapeHtml(formatCurrency(total))}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status</span>
                  <span class="detail-value status-value">${escapeHtml(status)}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="status-badge-wrapper">
            <span class="status-badge">${escapeHtml(status)}</span>
          </div>

          <div class="address-grid">
            <div class="address-col">
              <p class="section-label">Issue From</p>
              <p class="section-name">Workit Enterprises INC</p>
              <p class="section-line">
                2437 Romana Street<br />
                Cambridge, MA 02141<br />
                Phone: (+31) 782-417-2804<br />
                Email: support@workit.co.ke
              </p>
            </div>
            <div class="address-col">
              <p class="section-label">Issue For</p>
              <p class="section-name">${escapeHtml(customerName)}</p>
              <p class="section-line">
                ${customerAddress}<br />
                Email: ${escapeHtml(customerEmail)}
              </p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th class="right">Qty</th>
                <th class="right">Price</th>
                <th class="right">Tax</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lineRows}
            </tbody>
          </table>

          <div class="summary-wrap">
            <div class="summary">
              <div class="summary-row">
                <span class="summary-label">Sub Total</span>
                <span class="summary-value">${escapeHtml(formatCurrency(subTotal))}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Discount</span>
                <span class="summary-value discount">- ${escapeHtml(formatCurrency(0))}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Estimated Tax</span>
                <span class="summary-value">${escapeHtml(formatCurrency(totalTax))}</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-total">
                <span class="summary-total-label">Grand Amount</span>
                <span class="summary-total-value">${escapeHtml(formatCurrency(total))}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p class="footer-title">NOTICE</p>
            <p class="footer-text">All accounts are to be paid within 7 days from receipt of invoice. To be paid by cheque, credit card, or direct payment online. If account is not paid within 7 days, the credit details supplied as confirmation of work undertaken will be charged the agreed quoted fee noted above.</p>
          </div>
        </div>`;
    };

    const handleDownloadInvoicePdf = async (orderId: string, orderCode: string) => {
        setDownloadingOrderId(orderId);

        let container: HTMLDivElement | null = null;

        try {
            let order = invoiceCacheRef.current.get(orderId);
            if (!order) {
                const response = await fetch(`/api/admin/orders/${orderId}`, {
                    credentials: 'include',
                });
                const result = await response.json();
                if (!result?.success || !result?.order) {
                    throw new Error(result?.error || 'Failed to fetch invoice details.');
                }
                order = result.order as InvoiceOrder;
                invoiceCacheRef.current.set(orderId, order);
            }

            titleRef.current = `invoice-${orderCode}`;

            container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-10000px';
            container.style.top = '0';
            container.style.width = '1080px';
            container.style.height = 'auto';
            container.style.zIndex = '-1';
            container.innerHTML = buildInvoiceMarkup(order);
            document.body.appendChild(container);

            const invoiceElement = container.querySelector('.invoice-export-root') as HTMLElement | null;
            if (!invoiceElement) {
                throw new Error('Failed to prepare invoice.');
            }

            const images = Array.from(invoiceElement.querySelectorAll('img'));
            await Promise.all(
                images.map(
                    (img) =>
                        new Promise<void>((resolve) => {
                            if (img.complete) { resolve(); return; }
                            img.onload = () => resolve();
                            img.onerror = () => resolve();
                        })
                )
            );

            cleanupPrintRef.current = () => {
                if (container && container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            };

            handleDownloadPdf(() => invoiceElement);
        } catch (err) {
            console.error('Failed to download invoice PDF:', err);
            toast({
                title: 'Download failed',
                description: err instanceof Error ? err.message : 'Failed to generate invoice PDF.',
                variant: 'error',
            });
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
            setDownloadingOrderId(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    <span className="ml-3 text-gray-600">Loading orders...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600">Orders will appear here when customers make purchases</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Link
                                    href={`/admin/orders/${order.id}`}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-900"
                                >
                                    {order.code}
                                </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {order.customer.firstName} {order.customer.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{order.customer.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.state)}`}>
                                    {order.state.replace(/_/g, ' ')}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(order.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openPrintInvoice(order.id)}
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDownloadInvoicePdf(order.id, order.code)}
                                        disabled={downloadingOrderId === order.id}
                                    >
                                        <Download className="w-4 h-4" />
                                        {downloadingOrderId === order.id ? 'Preparing...' : 'Download'}
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
