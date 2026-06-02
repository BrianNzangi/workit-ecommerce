"use client";

import { useState, useMemo } from "react";
import { Package, CheckCircle, Clock, Truck, XCircle, Eye, Search, FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";

type StatusFilter = 'all' | 'processing' | 'completed' | 'shipped' | 'cancelled';

export function OrdersPage() {
  const { data: ordersData, isLoading: loading, error: queryError } = useOrders();
  const orders = ordersData?.orders || [];
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to fetch orders') : null;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(q) ||
        order.line_items.some(item => item.name.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [orders, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / perPage));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * perPage, currentPage * perPage);

  const counts = useMemo(() => ({
    all: orders.length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }), [orders]);

  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'processing', label: 'Processing', count: counts.processing },
    { key: 'shipped', label: 'Shipped', count: counts.shipped },
    { key: 'completed', label: 'Completed', count: counts.completed },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-600" size={16} />;
      case 'processing': return <Clock className="text-amber-600" size={16} />;
      case 'shipped': return <Truck className="text-blue-600" size={16} />;
      case 'cancelled': return <XCircle className="text-red-600" size={16} />;
      default: return <Package className="text-gray-600" size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
      completed: { variant: 'default', label: 'Completed' },
      processing: { variant: 'secondary', label: 'Processing' },
      shipped: { variant: 'secondary', label: 'Shipped' },
      cancelled: { variant: 'outline', label: 'Cancelled' },
    };
    const s = map[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
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
      <Card>
        <CardContent>
          <div className="text-center py-16">
            <Package className="animate-pulse text-gray-300 mb-4 mx-auto" size={48} />
            <p className="text-gray-500">Loading your orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-16">
            <XCircle className="text-red-500 mb-4 mx-auto" size={48} />
            <h2 className="text-xl font-semibold mb-2">Error Loading Orders</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-secondary-900 text-white rounded">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        {orders.length > 0 && (
          <p className="text-xs text-gray-500">{orders.length} total</p>
        )}
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-16">
              <Package className="text-gray-300 mb-4 mx-auto" size={48} />
              <h2 className="text-lg font-semibold mb-2">No Orders Yet</h2>
              <p className="text-gray-500 mb-6">You have not placed any orders yet.</p>
              <Button asChild className="bg-primary-900 text-white rounded">
                <Link href="/">Start Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    statusFilter === tab.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1.5 text-[10px] px-1 py-0.5 rounded-full ${
                      statusFilter === tab.key ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-8 rounded-lg bg-white h-9 text-sm"
              />
            </div>
          </div>

          {paginatedOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="text-gray-300 mb-3 mx-auto" size={36} />
                <p className="text-sm text-gray-500">No {statusFilter !== 'all' ? statusFilter : ''} orders match your search.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {paginatedOrders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className="font-semibold text-gray-900 text-sm">#{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(order.date_created)}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        {order.line_items.slice(0, 2).map((item, i) => (
                          <span key={i} className="text-sm text-gray-700">{item.name}</span>
                        ))}
                        {order.line_items.length > 2 && (
                          <span className="text-sm text-gray-400">+{order.line_items.length - 2} more</span>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 text-sm pt-0.5">{order.currency} {order.total}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0 pt-0.5">
                      <Button asChild variant="outline" size="sm" className="h-7 px-2.5 text-xs rounded">
                        <Link href={`/orders/${order.id}`}>
                          <Eye size={12} className="mr-1" />
                          Details
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs rounded text-gray-500">
                        <Link href={`/orders/${order.id}?invoice=1`}>
                          <FileDown size={12} />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 w-7 p-0 rounded"
              >
                <ChevronLeft size={14} />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`h-7 w-7 p-0 text-xs rounded ${currentPage === page ? 'bg-secondary-900 text-white' : ''}`}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-7 w-7 p-0 rounded"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
