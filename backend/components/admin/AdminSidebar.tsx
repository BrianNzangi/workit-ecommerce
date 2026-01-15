'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    FileText,
    Tag,
    Image,
    TrendingUp,
    ChevronDown,
    ChevronRight,
    Megaphone,
    Clock,
} from 'lucide-react';

interface MenuItem {
    label: string;
    href?: string;
    icon: any;
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Catalog',
        icon: Package,
        children: [
            {
                label: 'Products',
                href: '/admin/products',
                icon: null,
            },
            {
                label: 'Collections',
                href: '/admin/collections',
                icon: null,
            },
            {
                label: 'Brands',
                href: '/admin/brands',
                icon: null,
            },
            {
                label: 'Assets',
                href: '/admin/assets',
                icon: null,
            },
        ],
    },
    {
        label: 'Orders',
        icon: ShoppingCart,
        children: [
            {
                label: 'Orders',
                href: '/admin/orders',
                icon: null,
            },
            {
                label: 'Abandoned Checkouts',
                href: '/admin/orders/abandoned',
                icon: null,
            },
        ],
    },
    {
        label: 'Customers',
        icon: Users,
        children: [
            {
                label: 'Customers',
                href: '/admin/customers',
                icon: null,
            },
            {
                label: 'Segments',
                href: '/admin/customers/segments',
                icon: null,
            },
        ],
    },
    {
        label: 'Marketing',
        icon: Megaphone,
        children: [
            {
                label: 'Analytics',
                href: '/admin/marketing',
                icon: null,
            },
            {
                label: 'Campaigns',
                href: '/admin/marketing/campaigns',
                icon: null,
            },
            {
                label: 'Automations',
                href: '/admin/marketing/automations',
                icon: null,
            },
            {
                label: 'Banners',
                href: '/admin/marketing/banners',
                icon: null,
            },
            {
                label: 'Homepage Collections',
                href: '/admin/marketing/homepage-collections',
                icon: null,
            },
        ],
    },
    {
        label: 'Blog',
        href: '/admin/blog',
        icon: FileText,
    },
    {
        label: 'Analytics',
        href: '/admin/analytics',
        icon: TrendingUp,
    },
    {
        label: 'Settings',
        href: '/admin/settings',
        icon: Settings,
    },
    {
        label: 'System',
        icon: Clock,
        children: [
            {
                label: 'Cron Jobs',
                href: '/admin/system/cron-jobs',
                icon: null,
            },
        ],
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    // Automatically expand the parent menu that contains the active page
    useEffect(() => {
        const activeParent = menuItems.find((item) => {
            if (item.children) {
                return item.children.some((child) =>
                    pathname === child.href || pathname?.startsWith(child.href + '/')
                );
            }
            return false;
        });

        if (activeParent) {
            setExpandedItems([activeParent.label]);
        } else {
            setExpandedItems([]);
        }
    }, [pathname]);

    const toggleExpand = (label: string) => {
        setExpandedItems((prev) => {
            // If clicking on an already expanded item, collapse it
            if (prev.includes(label)) {
                return [];
            }
            // Otherwise, close all others and open this one (accordion behavior)
            return [label];
        });
    };

    const isItemActive = (item: MenuItem): boolean => {
        if (item.href) {
            return pathname === item.href || pathname?.startsWith(item.href + '/');
        }
        if (item.children) {
            return item.children.some((child) => isItemActive(child));
        }
        return false;
    };

    const renderMenuItem = (item: MenuItem, level = 0) => {
        const Icon = item.icon;
        const isActive = isItemActive(item);
        const isExpanded = expandedItems.includes(item.label);
        const hasChildren = item.children && item.children.length > 0;

        if (hasChildren) {
            return (
                <li key={item.label}>
                    <button
                        onClick={() => toggleExpand(item.label)}
                        className={`
              w-full flex items-center justify-between px-3 py-2 rounded-xs transition-colors
              ${isActive ? 'text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'}
            `}
                    >
                        <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF5023]' : 'text-gray-500'}`} />
                            <span className="text-sm">{item.label}</span>
                        </div>
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                    </button>
                    {isExpanded && item.children && (
                        <ul className="ml-3 mt-1 space-y-1">
                            {item.children.map((child) => renderMenuItem(child, level + 1))}
                        </ul>
                    )}
                </li>
            );
        }

        return (
            <li key={item.href}>
                <Link
                    href={item.href!}
                    className={`
            flex items-center gap-2 px-3 py-2 rounded-xs transition-colors text-sm
            ${level > 0 ? 'pl-6' : ''}
            ${isActive
                            ? 'bg-white text-gray-900 font-medium shadow-xs'
                            : 'text-gray-700 hover:bg-gray-100'
                        }
          `}
                >
                    {level === 0 && Icon && (
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF5023]' : 'text-gray-500'}`} />
                    )}
                    <span>{item.label}</span>
                </Link>
            </li>
        );
    };

    return (
        <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen flex flex-col">
            {/* Logo */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6 text-[#FF5023]" />
                    <h1 className="text-lg font-bold text-gray-900">Workit Admin</h1>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3">
                <ul className="space-y-1">
                    {menuItems.map((item) => renderMenuItem(item))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                    Workit Admin © {new Date().getFullYear()}
                </p>
            </div>
        </aside>
    );
}

