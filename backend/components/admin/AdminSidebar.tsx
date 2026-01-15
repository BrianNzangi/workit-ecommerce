'use client';

import Link from 'next/link';
import NextImage from 'next/image';
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
              ${isActive ? 'text-white font-medium' : 'text-secondary-300 hover:bg-secondary-800'}
            `}
                    >
                        <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-primary-500' : 'text-secondary-400'}`} />
                            <span className="text-sm">{item.label}</span>
                        </div>
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-secondary-400" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-secondary-400" />
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
                            ? 'bg-primary-900 text-white font-medium'
                            : 'text-secondary-300 hover:bg-secondary-800'
                        }
          `}
                >
                    {level === 0 && Icon && (
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-secondary-400'}`} />
                    )}
                    <span>{item.label}</span>
                </Link>
            </li>
        );
    };

    return (
        <aside className="w-64 bg-secondary-900 border-r border-secondary-800 flex flex-col h-full shrink-0 z-30">
            {/* Logo Section */}
            <div className="h-[72px] flex items-center px-6 border-b border-secondary-800 bg-secondary-900 shrink-0">
                <Link href="/admin/dashboard" className="relative h-8 w-32 block">
                    <NextImage
                        src="/workit-logo-white.png"
                        alt="Workit Logo"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 pt-4 overflow-y-auto custom-scrollbar">
                <ul className="space-y-1">
                    {menuItems.map((item) => renderMenuItem(item))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-secondary-800 bg-secondary-900">
                <p className="text-xs text-secondary-400 text-center">
                    Workit Admin © {new Date().getFullYear()}
                </p>
            </div>
        </aside>
    );
}

