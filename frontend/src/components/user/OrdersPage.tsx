"use client";

import { Package, CheckCircle, Clock, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";

export function OrdersPage() {
  const { data: ordersData, isLoading: loading, error: queryError } = useOrders();
  const orders = ordersData?.orders || [];
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to fetch orders') : null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-700" size={28} />;
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <Package className="animate-pulse text-gray-400 mb-4 mx-auto" size={64} />
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <XCircle className="text-red-600 mb-4 mx-auto" size={64} />
            <h2 className="text-xl font-semibold mb-2">Error Loading Orders</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-secondary-900 text-white">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="text-gray-400 mb-4 mx-auto" size={64} />
            <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You have not placed any orders yet.</p>
            <Button asChild className="bg-primary-900 text-white">
              <Link href="/">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-semibold">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.date_created)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.currency} {order.total}</p>
                    <p className="text-sm text-gray-600 capitalize">{order.status}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Items:</h4>
                  {order.line_items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} (x{item.quantity})</span>
                      <span>{order.currency} {item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-3">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Track Order
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
