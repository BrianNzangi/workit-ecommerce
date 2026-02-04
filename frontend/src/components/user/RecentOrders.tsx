"use client";

import { Package, CheckCircle, Clock, Truck, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
}

interface Order {
  id: string;
  date_created: string;
  status: string;
  total: string;
  currency: string;
  line_items: OrderItem[];
}

interface RecentOrdersProps {
  orders: Order[];
  loading: boolean;
}

export function RecentOrders({ orders, loading }: RecentOrdersProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={28} />;
      case 'processing':
        return <Clock className="text-primary-900" size={28} />;
      case 'shipped':
        return <Truck className="text-orange-600" size={28} />;
      case 'cancelled':
        return <XCircle className="text-red-600" size={28} />;
      default:
        return <Package className="text-gray-600" size={28} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 shadow-xs p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
          Recent Orders
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 shadow-xs p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          Recent Orders
        </h2>
        <Link href="/orders" className="text-gray-500 hover:text-gray-700">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <Package className="text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-600 mb-4">You have not placed any orders yet.</p>
          <Link href="/">
            <Button className="bg-primary-900 text-white">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 p-4 transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">{formatDate(order.date_created)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {order.currency} {order.total}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">{order.status}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {order.line_items.length} item{order.line_items.length !== 1 ? 's' : ''}
                </div>
                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline" size="sm" className="flex items-center text-primary-900 hover:shdow-sm  gap-2">
                    <Eye size={14} />
                    Order Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
