"use client";

import { Package, Clock, CheckCircle } from "lucide-react";

interface OrderStatsProps {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  loading: boolean;
}

export function OrderStats({ totalOrders, pendingOrders, completedOrders, loading }: OrderStatsProps) {
  const stats = [
    {
      label: "Total Orders",
      value: loading ? "..." : totalOrders.toString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Pending Orders",
      value: loading ? "..." : pendingOrders.toString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Completed Orders",
      value: loading ? "..." : completedOrders.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="bg-white shadow-xs p-6">
      <div className="space-y-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-4 rounded-full ${stat.bgColor}`}>
                  <Icon className={stat.color} size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
