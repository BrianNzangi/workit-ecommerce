"use client";

import { useEffect, useState } from "react";
import { Package, CheckCircle, Clock, Truck, XCircle } from "lucide-react";
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

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();

        if (data.success) {
          setOrders(data.orders);
        } else {
          setError(data.error || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Fetch orders error:', err);
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-700" size={28} />;
      case 'processing':
        return <Clock className="text-blue-600" size={28} />;
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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <Package className="animate-pulse text-gray-400 mb-4 mx-auto" size={64} />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <XCircle className="text-red-600 mb-4 mx-auto" size={64} />
          <h1 className="text-xl font-semibold mb-2">Error Loading Orders</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-[#1F2323] text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 shadow-xs p-6">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="text-gray-400 mb-4 mx-auto" size={64} />
          <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
          <p className="text-muted-foreground mb-6">You have not placed any orders yet.</p>
          <Button asChild className="bg-[#0046BE] text-white">
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
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.date_created)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{order.currency} {order.total}</p>
                  <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
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
    </div>
  );
}
