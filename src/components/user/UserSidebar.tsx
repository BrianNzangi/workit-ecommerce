"use client";

import {
  LayoutDashboard,
  Package,
  Truck,
  ShoppingCart,
  Heart,
  GitCompare,
  CreditCard,
  History,
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

type ActiveSection = 'dashboard' | 'orders' | 'track-order' | 'cart' | 'wishlist' | 'compare' | 'cards-address' | 'browsing-history' | 'settings';

const navItems = [
  {
    label: "Dashboard",
    key: "dashboard" as ActiveSection,
    icon: LayoutDashboard,
  },
  {
    label: "Order History",
    key: "orders" as ActiveSection,
    icon: Package,
  },
  {
    label: "Track Order",
    key: "track-order" as ActiveSection,
    icon: Truck,
  },
  {
    label: "Shopping Cart",
    key: "cart" as ActiveSection,
    icon: ShoppingCart,
  },
  {
    label: "Wishlist",
    key: "wishlist" as ActiveSection,
    icon: Heart,
  },
  {
    label: "Compare",
    key: "compare" as ActiveSection,
    icon: GitCompare,
  },
  {
    label: "Cards & Address",
    key: "cards-address" as ActiveSection,
    icon: CreditCard,
  },
  {
    label: "Browsing History",
    key: "browsing-history" as ActiveSection,
    icon: History,
  },
  {
    label: "Setting",
    key: "settings" as ActiveSection,
    icon: Settings,
  },
];

interface UserSidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

export function UserSidebar({ activeSection, onSectionChange }: UserSidebarProps) {
  return (
    <div className="bg-white border border-gray-100 shadow-xs p-6">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onSectionChange(item.key)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors w-full text-left",
                isActive
                  ? "bg-[#0046BE] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}

        {/* Log Out */}
        <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 w-full text-left transition-colors">
          <LogOut size={18} />
          Log-out
        </button>
      </nav>
    </div>
  );
}
