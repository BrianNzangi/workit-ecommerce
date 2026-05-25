'use client';

import { useEffect, useRef, useState } from 'react';
import { ShoppingCart, Loader2, Printer, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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

declare global {
    interface Window {
        html2canvas?: (element: HTMLElement, options?: Record<string, any>) => Promise<HTMLCanvasElement>;
        jspdf?: {
            jsPDF: new (...args: any[]) => any;
        };
    }
}

export function OrdersList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
    const pdfLibsPromiseRef = useRef<Promise<void> | null>(null);
    const invoiceCacheRef = useRef<Map<string, InvoiceOrder>>(new Map());

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

    const loadExternalScript = (src: string) => {
        return new Promise<void>((resolve, reject) => {
            const existing = document.querySelector(`script[data-pdf-lib="${src}"]`) as HTMLScriptElement | null;
            if (existing) {
                if (existing.dataset.loaded === 'true') {
                    resolve();
                    return;
                }
                existing.addEventListener('load', () => resolve(), { once: true });
                existing.addEventListener('error', () => reject(new Error(`Failed loading ${src}`)), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.dataset.pdfLib = src;
            script.onload = () => {
                script.dataset.loaded = 'true';
                resolve();
            };
            script.onerror = () => reject(new Error(`Failed loading ${src}`));
            document.body.appendChild(script);
        });
    };

    const ensurePdfLibs = () => {
        if (!pdfLibsPromiseRef.current) {
            pdfLibsPromiseRef.current = Promise.all([
                loadExternalScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'),
                loadExternalScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'),
            ]).then(() => undefined);
        }
        return pdfLibsPromiseRef.current;
    };

    const waitForImages = (root: HTMLElement) => {
        const images = Array.from(root.querySelectorAll('img'));
        return Promise.all(
            images.map(
                (img) =>
                    new Promise<void>((resolve) => {
                        if (img.complete) {
                            resolve();
                            return;
                        }
                        img.onload = () => resolve();
                        img.onerror = () => resolve();
                    })
            )
        );
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
        const created = new Date(order.createdAt).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });

        const customerName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Customer';
        const customerEmail = order.customer?.email || '-';
        const logoSrc = `${window.location.origin}/workit-logo.png`;
        const lines = Array.isArray(order.lines) ? order.lines : [];

        const lineRows = lines
            .map((line, idx) => {
                const name = escapeHtml(getLineName(line, idx));
                const qty = line.quantity || 0;
                const unit = line.linePrice || 0;
                const amount = unit * qty;
                return `
                <tr>
                  <td class="item-cell">
                    <div class="item-name">${name}</div>
                  </td>
                  <td class="qty-cell">${qty}</td>
                  <td class="price-cell">${escapeHtml(formatCurrency(unit))}</td>
                  <td class="amount-cell">${escapeHtml(formatCurrency(amount))}</td>
                </tr>`;
            })
            .join('');

        return `
        <div class="invoice-export-root">
          <style>
            .invoice-export-root {
              width: 1080px;
              background: #ffffff;
              color: #111827;
              font-family: "Hanken Grotesk", Arial, sans-serif;
              border: 1px solid #e5e7eb;
              border-radius: 2px;
              box-sizing: border-box;
              margin: 0 auto;
            }
            .invoice-inner { padding: 34px; }
            .invoice-top {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 18px;
            }
            .invoice-logo {
              width: 170px;
              height: 54px;
              object-fit: contain;
              object-position: left center;
            }
            .invoice-meta { text-align: right; }
            .invoice-number {
              font-weight: 800;
              font-size: 12px;
              letter-spacing: 0.05em;
              margin: 0 0 6px;
            }
            .invoice-label {
              margin: 0;
              color: #6b7280;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            .invoice-date {
              margin: 4px 0 0;
              color: #374151;
              font-size: 14px;
              font-weight: 700;
              letter-spacing: 0.02em;
            }
            .bar { height: 1px; background: #e5e7eb; margin: 16px 0 28px; }
            .brand-title {
              margin: 0 0 12px;
              font-size: 48px;
              line-height: 1;
              font-weight: 900;
              letter-spacing: -0.04em;
              color: #111827;
            }
            .brand-subtitle {
              margin: 0;
              color: #6b7280;
              font-size: 19px;
              line-height: 1.5;
              font-weight: 500;
              max-width: 680px;
            }
            .bill-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              column-gap: 64px;
              margin-top: 34px;
            }
            .section-label {
              margin: 0 0 14px;
              font-size: 12px;
              color: #6b7280;
              font-weight: 800;
              letter-spacing: 0.16em;
              text-transform: uppercase;
            }
            .section-name {
              margin: 0 0 8px;
              font-size: 22px;
              line-height: 1.2;
              color: #111827;
              font-weight: 800;
            }
            .section-line {
              margin: 0;
              font-size: 17px;
              line-height: 1.35;
              color: #4b5563;
              font-weight: 500;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 34px;
            }
            .items-table thead th {
              text-align: left;
              color: #6b7280;
              font-size: 16px;
              font-weight: 600;
              padding: 14px 10px 14px 0;
              border-bottom: 2px solid #111827;
            }
            .items-table thead th.right { text-align: right; padding-right: 0; }
            .items-table tbody td {
              border-bottom: 1px solid #f3f4f6;
              padding: 16px 10px 16px 0;
              vertical-align: middle;
            }
            .item-name { font-size: 18px; color: #111827; font-weight: 700; }
            .qty-cell, .price-cell { text-align: right; color: #4b5563; font-size: 16px; font-weight: 600; }
            .amount-cell { text-align: right; color: #111827; font-size: 18px; font-weight: 800; padding-right: 0 !important; }
            .summary-wrap { margin-top: 34px; display: flex; justify-content: flex-end; }
            .summary { width: 360px; }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 14px;
              font-size: 16px;
            }
            .summary-label { color: #6b7280; }
            .summary-value { color: #111827; font-weight: 700; }
            .summary-divider { height: 1px; background: #e5e7eb; margin: 16px 0 14px; }
            .summary-total {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .summary-total-label {
              color: #111827;
              font-size: 20px;
              font-weight: 800;
              letter-spacing: 0.02em;
              text-transform: uppercase;
            }
            .summary-total-value {
              color: #111827;
              font-size: 34px;
              font-weight: 900;
              letter-spacing: -0.02em;
            }
            .footer {
              margin-top: 34px;
              padding-top: 24px;
              border-top: 1px solid #e5e7eb;
              text-align: left;
            }
            .footer-title {
              margin: 0 0 8px;
              font-size: 12px;
              color: #111827;
              font-weight: 800;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            .footer-text {
              margin: 0;
              font-size: 12px;
              color: #6b7280;
              line-height: 1.5;
            }
            .footer-email { color: #cc0000; font-weight: 700; }
            .footer-note {
              margin: 8px 0 0;
              font-size: 10px;
              color: #9ca3af;
              font-style: italic;
            }
          </style>

          <div class="invoice-inner">
            <div class="invoice-top">
              <img class="invoice-logo" src="${logoSrc}" alt="Workit" />
              <div class="invoice-meta">
                <p class="invoice-number">INVOICE # ${escapeHtml(order.code)}</p>
                <p class="invoice-label">ISSUE DATE</p>
                <p class="invoice-date">${escapeHtml(created)}</p>
              </div>
            </div>

            <div class="bar"></div>

            <h1 class="brand-title">Workit</h1>
            <p class="brand-subtitle">Thank you for your purchase. We appreciate your confidence in our products and services.</p>

            <div class="bill-grid">
              <div>
                <p class="section-label">Billed By</p>
                <p class="section-name">Workit Enterprises</p>
                <p class="section-line">Nairobi, Kenya</p>
              </div>
              <div>
                <p class="section-label">Bill To</p>
                <p class="section-name">${escapeHtml(customerName)}</p>
                <p class="section-line">${escapeHtml(customerEmail)}</p>
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="right">Qty</th>
                  <th class="right">Price</th>
                  <th class="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${lineRows}
              </tbody>
            </table>

            <div class="summary-wrap">
              <div class="summary">
                <div class="summary-row"><span class="summary-label">Subtotal</span><span class="summary-value">${escapeHtml(formatCurrency(order.subTotal || 0))}</span></div>
                <div class="summary-row"><span class="summary-label">Delivery</span><span class="summary-value">${escapeHtml(formatCurrency(order.shipping || 0))}</span></div>
                <div class="summary-row"><span class="summary-label">VAT 16.0%</span><span class="summary-value">${escapeHtml(formatCurrency(order.tax || 0))}</span></div>
                <div class="summary-divider"></div>
                <div class="summary-total">
                  <span class="summary-total-label">TOTAL</span>
                  <span class="summary-total-value">${escapeHtml(formatCurrency(order.total || 0))}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <p class="footer-title">Questions about your order?</p>
              <p class="footer-text">Visit our help center or contact our support team at <span class="footer-email">support@workit.co.ke</span>.</p>
              <p class="footer-note">Standard terms and conditions apply to all purchases.</p>
            </div>
          </div>
        </div>`;
    };

    useEffect(() => {
        ensurePdfLibs().catch(() => {
            // Lazy retry during click if preload fails
            pdfLibsPromiseRef.current = null;
        });
    }, []);

    const handleDownloadInvoicePdf = async (orderId: string, orderCode: string) => {
        let frame: HTMLIFrameElement | null = null;
        setDownloadingOrderId(orderId);

        try {
            await ensurePdfLibs();

            if (!window.html2canvas || !window.jspdf?.jsPDF) {
                throw new Error('PDF libraries failed to initialize.');
            }

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

            frame = document.createElement('iframe');
            frame.style.position = 'fixed';
            frame.style.left = '-10000px';
            frame.style.top = '0';
            frame.style.width = '1024px';
            frame.style.height = '1600px';
            frame.style.opacity = '0';
            frame.style.border = '0';
            document.body.appendChild(frame);

            const frameDoc = frame.contentDocument;
            if (!frameDoc) {
                throw new Error('Failed to initialize invoice renderer.');
            }

            frameDoc.open();
            frameDoc.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Invoice PDF Render</title>
  </head>
  <body style="margin:0;padding:0;background:#ffffff;">
    ${buildInvoiceMarkup(order)}
  </body>
</html>`);
            frameDoc.close();

            const invoiceElement = frameDoc.querySelector('.invoice-export-root') as HTMLElement | null;
            if (!invoiceElement) {
                throw new Error('Failed to prepare invoice canvas.');
            }

            await waitForImages(invoiceElement);

            const canvas = await window.html2canvas(invoiceElement, {
                scale: 1.5,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                onclone: (clonedDoc: Document) => {
                    // Keep only invoice-local styles to avoid unsupported lab/oklch parsing.
                    const styles = clonedDoc.querySelectorAll('style,link[rel="stylesheet"]');
                    styles.forEach((styleNode: Element) => {
                        const text = styleNode.textContent || '';
                        const href = (styleNode as HTMLLinkElement).href || '';
                        const isInvoiceStyle = text.includes('.invoice-export-root');
                        const isExternalStyle = href.length > 0;
                        if (!isInvoiceStyle || isExternalStyle) {
                            styleNode.remove();
                        }
                    });
                },
            });

            const imageData = canvas.toDataURL('image/jpeg', 0.92);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 16;
            const imageWidth = pageWidth - margin * 2;
            const imageHeight = (canvas.height * imageWidth) / canvas.width;
            const usableHeight = pageHeight - margin * 2;

            let heightLeft = imageHeight;
            let y = margin;

            pdf.addImage(imageData, 'JPEG', margin, y, imageWidth, imageHeight, undefined, 'FAST');
            heightLeft -= usableHeight;

            while (heightLeft > 0) {
                y = margin - (imageHeight - heightLeft);
                pdf.addPage();
                pdf.addImage(imageData, 'JPEG', margin, y, imageWidth, imageHeight, undefined, 'FAST');
                heightLeft -= usableHeight;
            }

            pdf.save(`${orderCode}.pdf`);
        } catch (err) {
            console.error('Failed to download invoice PDF:', err);
            toast({
                title: 'Download failed',
                description: err instanceof Error ? err.message : 'Failed to generate invoice PDF.',
                variant: 'error',
            });
        } finally {
            if (frame && frame.parentNode) {
                frame.parentNode.removeChild(frame);
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
