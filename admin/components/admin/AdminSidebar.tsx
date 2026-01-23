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
                label: 'Homepage Collections',
                href: '/admin/homepage-collections',
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
            {
                label: 'Pages',
                icon: FileText,
                children: [
                    {
                        label: 'Warranty & Refunds',
                        href: '/admin/pages/warranty-refunds',
                        icon: null,
                    },
                    {
                        label: 'Shipping Policy',
                        href: '/admin/pages/shipping-policy',
                        icon: null,
                    },
                    {
                        label: 'Terms Of Service',
                        href: '/admin/pages/terms-of-service',
                        icon: null,
                    },
                    {
                        label: 'Privacy Policy',
                        href: '/admin/pages/privacy-policy',
                        icon: null,
                    },
                    {
                        label: 'Help Center',
                        href: '/admin/pages/help-center',
                        icon: null,
                    },
                    {
                        label: 'Returns & Claims',
                        href: '/admin/pages/returns-claims',
                        icon: null,
                    },
                ],
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
        ],
    },
    {
        label: 'Blog',
        href: '/admin/blog',
        icon: FileText,
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

    // Automatically expand the parent menus that contain the active page
    useEffect(() => {
        if (!pathname) return;

        const findAllParents = (items: MenuItem[]): string[] => {
            for (const item of items) {
                if (item.children) {
                    const subParents = findAllParents(item.children);
                    const hasDirectActiveChild = item.children.some(child =>
                        child.href && (pathname === child.href || pathname.startsWith(child.href + '/'))
                    );

                    if (subParents.length > 0 || hasDirectActiveChild) {
                        return [item.label, ...subParents];
                    }
                }
            }
            return [];
        };

        const parentsToExpand = findAllParents(menuItems);
        if (parentsToExpand.length > 0) {
            setExpandedItems(prev => {
                const next = new Set([...prev, ...parentsToExpand]);
                return Array.from(next);
            });
        }
    }, [pathname]);

    const toggleExpand = (label: string) => {
        setExpandedItems((prev) => {
            if (prev.includes(label)) {
                return prev.filter(item => item !== label);
            }
            return [...prev, label];
        });
    };

    const isItemActive = (item: MenuItem, siblings?: MenuItem[]): boolean => {
        if (item.href) {
            // Check if pathname exactly matches
            if (pathname === item.href) return true;

            // Check if pathname starts with this href
            if (pathname?.startsWith(item.href + '/')) {
                // If we have siblings, check if any sibling has a more specific match
                if (siblings) {
                    const hasMoreSpecificSibling = siblings.some(sibling => {
                        if (sibling.href && sibling.href !== item.href) {
                            // Check if the sibling's href is more specific (longer and matches)
                            if (pathname === sibling.href || (sibling.href && pathname?.startsWith(sibling.href + '/'))) {
                                return sibling.href!.length > item.href!.length;
                            }
                        }
                        return false;
                    });

                    // Only return true if no more specific sibling exists
                    return !hasMoreSpecificSibling;
                }
                return true;
            }
            return false;
        }
        // For parent items with children, don't mark as active
        return false;
    };

    const renderMenuItem = (item: MenuItem, level = 0, siblings?: MenuItem[]) => {
        const Icon = item.icon;
        const isActive = isItemActive(item, siblings);
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
                            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-primary-500' : 'text-secondary-400'}`} />}
                            <span className={`text-sm ${!Icon && level > 0 ? 'ml-6' : ''}`}>{item.label}</span>
                        </div>
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-secondary-400" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-secondary-400" />
                        )}
                    </button>
                    {isExpanded && item.children && (
                        <ul className="ml-3 mt-1 space-y-1">
                            {item.children.map((child) => renderMenuItem(child, level + 1, item.children))}
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

