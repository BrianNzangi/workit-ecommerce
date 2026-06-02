"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Package, CheckCircle, Clock, Truck, XCircle,
  Download, Printer, ShoppingBag, MapPin, CreditCard, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useOrder } from "@/hooks/useOrder";
import { useReactToPrint } from "react-to-print";

interface OrderDetailPageProps {
  orderId: string;
}

export function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showInvoice = searchParams.get('invoice') === '1';
  const { data: orderData, isLoading: loading, error: queryError } = useOrder(orderId);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const order = orderData?.order;
  const rawError = queryError || (orderData?.success === false ? orderData.error : null);
  const error = rawError ? (typeof rawError === 'string' ? rawError : 'Failed to load order') : null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-600" size={22} />;
      case 'processing': return <Clock className="text-amber-600" size={22} />;
      case 'shipped': return <Truck className="text-blue-600" size={22} />;
      case 'cancelled': return <XCircle className="text-red-600" size={22} />;
      default: return <Package className="text-gray-600" size={22} />;
    }
  };

  const getStatusBadge = (state: string) => {
    const map: Record<string, 'default' | 'secondary' | 'outline'> = {
      PAYMENT_SETTLED: 'default',
      DELIVERED: 'default',
      SHIPPED: 'secondary',
      PAYMENT_AUTHORIZED: 'secondary',
      CREATED: 'secondary',
      PAYMENT_PENDING: 'secondary',
      CANCELLED: 'outline',
    };
    return <Badge variant={map[state] || 'secondary'}>{state.replace(/_/g, ' ')}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef as React.RefObject<Element | null>,
    documentTitle: `invoice-${order?.code || orderId}`,
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print {
        body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        [data-print-invoice] { width: 100% !important; max-width: 190mm !important; border: none !important; box-shadow: none !important; margin: 0 auto !important; padding: 0 !important; }
        .no-print { display: none !important; }
      }
    `,
    onBeforePrint: async () => { setIsGeneratingPdf(true); },
    onAfterPrint: () => { setIsGeneratingPdf(false); },
  });

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-16">
            <Package className="animate-pulse text-gray-300 mb-4 mx-auto" size={48} />
            <p className="text-gray-500">Loading order details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !order) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-16">
            <XCircle className="text-red-500 mb-4 mx-auto" size={48} />
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-6">{error || 'The order you are looking for does not exist.'}</p>
            <Button asChild className="rounded">
              <Link href="/dashboard?section=orders">&larr; Back to Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {!showInvoice && (
        <>
          <div className="no-print flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded -ml-2 text-gray-500 hover:text-gray-900">
              <Link href="/dashboard?section=orders">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-primary-50 rounded-xl">
                  <ShoppingBag className="text-primary-700" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Order #{order.code}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Placed on {formatDateTime(order.date_created)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(order.state)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrint()}
                  disabled={isGeneratingPdf}
                  className="rounded-lg"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-1.5 h-4 w-4" />
                  )}
                  {isGeneratingPdf ? 'Preparing...' : 'Download Invoice'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrint()}
                  disabled={isGeneratingPdf}
                  className="rounded-lg"
                >
                  <Printer className="mr-1.5 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              <Card className="border border-gray-200 rounded-xl">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                  <div className="divide-y divide-gray-100">
                    {order.line_items.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="text-gray-400" size={24} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{order.currency} {item.price}</p>
                          <p className="text-sm text-gray-500">
                            {order.currency} {(item.priceRaw * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">{formatCurrency(order.subTotalRaw)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-gray-900">{formatCurrency(order.shippingRaw)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium text-gray-900">{formatCurrency(order.taxRaw)}</span>
                    </div>
                    <div className="border-t border-gray-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border border-gray-200 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="text-gray-500" size={18} />
                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Shipping Address</h2>
                  </div>
                  {order.shippingAddress ? (
                    <div className="text-sm text-gray-700 space-y-1">
                      <p className="font-medium text-gray-900">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </p>
                      <p>{order.shippingAddress.streetLine1}</p>
                      {order.shippingAddress.streetLine2 && <p>{order.shippingAddress.streetLine2}</p>}
                      <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                      <p className="text-gray-900 font-medium mt-2">{order.shippingAddress.phoneNumber}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No shipping address provided.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-gray-200 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="text-gray-500" size={18} />
                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Payment</h2>
                  </div>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method</span>
                      <span className="font-medium text-gray-900">
                        {order.payments?.[0]?.method || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      {getStatusBadge(order.state)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-bold text-gray-900">{formatCurrency(order.totalRaw)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      <div
        ref={invoiceRef}
        data-print-invoice
        className="rounded border border-gray-200 bg-white shadow-sm mx-auto no-print"
        style={{ width: '794px', minHeight: '1123px' }}
      >
        <CardContent className="p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
              <p className="text-sm text-gray-500 mt-1">#{order.code}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase">Issue Date</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(order.date_created)}</p>
              <p className="text-xs font-medium text-gray-500 uppercase mt-2">Due Date</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(new Date(new Date(order.date_created).getTime() + 7 * 86400000).toISOString())}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200" />

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
                  {order.customer?.firstName} {order.customer?.lastName}
                </p>
                <p className="text-gray-600">{order.customer?.email}</p>
                {order.shippingAddress && (
                  <div className="text-gray-600">
                    <p>{order.shippingAddress.streetLine1}</p>
                    {order.shippingAddress.streetLine2 && <p>{order.shippingAddress.streetLine2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                    <p className="text-gray-900 mt-1">{order.shippingAddress.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left font-semibold text-gray-900 pb-3">Product</th>
                  <th className="text-right font-semibold text-gray-900 pb-3">Qty</th>
                  <th className="text-right font-semibold text-gray-900 pb-3">Price</th>
                  <th className="text-right font-semibold text-gray-900 pb-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.line_items.map((item, idx) => (
                  <tr key={item.id || idx} className="border-b border-gray-100">
                    <td className="py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 text-right text-gray-700">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-700">{formatCurrency(item.priceRaw)}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(item.priceRaw * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full md:w-72 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.subTotalRaw)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.shippingRaw)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.taxRaw)}</span>
              </div>
              <div className="border-t border-gray-200" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(order.totalRaw)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200" />

          <div className="text-center text-sm text-gray-500">
            <p>Thank you for your business!</p>
            <p className="text-xs mt-1">For questions about your order, contact support@workit.co.ke</p>
          </div>
        </CardContent>
      </div>

      <div className="no-print flex justify-center gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => handlePrint()}
          disabled={isGeneratingPdf}
          className="rounded-lg"
        >
          {isGeneratingPdf ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isGeneratingPdf ? 'Preparing PDF...' : 'Download Invoice PDF'}
        </Button>
        <Button
          variant="outline"
          onClick={() => handlePrint()}
          disabled={isGeneratingPdf}
          className="rounded-lg"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
      </div>
    </div>
  );
}
