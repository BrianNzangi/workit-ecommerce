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
    X,
    BarChart3,
    Store,
    Building2,
    Percent,
    Zap,
    Star,
    Trash2,
} from 'lucide-react';

interface MenuItem {
    label: string;
    href?: string;
    icon: any;
    children?: MenuItem[];
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

const menuSections: MenuSection[] = [
    {
        title: 'Overview',
        items: [
            {
                label: 'Dashboard',
                href: '/admin/dashboard',
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: 'Commerce',
        items: [
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
        ],
    },
    {
        title: 'Promotions',
        items: [
            {
                label: 'Promotion Deals',
                icon: Percent,
                children: [
                    {
                        label: 'Coupon',
                        href: '/admin/promotions/coupons',
                        icon: null,
                    },
                    {
                        label: 'Flash Sales',
                        href: '/admin/promotions/flash-sales',
                        icon: null,
                    },
                    {
                        label: 'Featured Deal',
                        href: '/admin/promotions/featured-deals',
                        icon: null,
                    },
                    {
                        label: 'Clearance Deal',
                        href: '/admin/promotions/clearance-deals',
                        icon: null,
                    },
                ],
            },
        ],
    },
    {
        title: 'Content',
        items: [
            {
                label: 'Pages',
                icon: FileText,
                children: [
                    {
                        label: 'Returns Policy',
                        href: '/admin/content/pages/returns-policy',
                        icon: null,
                    },
                    {
                        label: 'Refunds Policy',
                        href: '/admin/content/pages/refunds-policy',
                        icon: null,
                    },
                    {
                        label: 'Shipping Policy',
                        href: '/admin/content/pages/shipping-policy',
                        icon: null,
                    },
                    {
                        label: 'Terms Of Service',
                        href: '/admin/content/pages/terms-of-service',
                        icon: null,
                    },
                    {
                        label: 'Privacy Policy',
                        href: '/admin/content/pages/privacy-policy',
                        icon: null,
                    },
                    {
                        label: 'Advertising Policy',
                        href: '/admin/content/pages/advertising-policy',
                        icon: null,
                    },
                    {
                        label: 'Help Center',
                        href: '/admin/content/pages/help-center',
                        icon: null,
                    },
                    {
                        label: 'About Workit',
                        href: '/admin/content/pages/about-workit',
                        icon: null,
                    },
                ],
            },
            {
                label: 'Homepage Control',
                href: '/admin/content/homepage',
                icon: LayoutDashboard,
            },
            {
                label: 'Blog',
                href: '/admin/content/blog',
                icon: Megaphone,
            },
            {
                label: 'Banners',
                href: '/admin/marketing/banners',
                icon: Image,
            },
        ],
    },
    {
        title: 'Administration',
        items: [
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
        ],
    },
];

const menuItems: MenuItem[] = menuSections.flatMap((section) => section.items);

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    useEffect(() => {
        if (!pathname) return;

        const findAllParents = (items: MenuItem[]): string[] => {
            for (const item of items) {
                if (item.children) {
                    const subParents = findAllParents(item.children);
                    const hasDirectActiveChild = item.children.some(
                        (child) =>
                            child.href &&
                            (pathname === child.href || pathname.startsWith(child.href + '/'))
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
            setExpandedItems((prev) => {
                const next = new Set([...prev, ...parentsToExpand]);
                return Array.from(next);
            });
        }
    }, [pathname]);

    const toggleExpand = (label: string) => {
        setExpandedItems((prev) => {
            if (prev.includes(label)) {
                return prev.filter((item) => item !== label);
            }
            return [...prev, label];
        });
    };

    const isItemActive = (item: MenuItem, siblings?: MenuItem[]): boolean => {
        if (item.href) {
            if (pathname === item.href) return true;

            if (pathname?.startsWith(item.href + '/')) {
                if (siblings) {
                    const hasMoreSpecificSibling = siblings.some((sibling) => {
                        if (sibling.href && sibling.href !== item.href) {
                            if (
                                pathname === sibling.href ||
                                (sibling.href && pathname?.startsWith(sibling.href + '/'))
                            ) {
                                return sibling.href!.length > item.href!.length;
                            }
                        }
                        return false;
                    });

                    return !hasMoreSpecificSibling;
                }
                return true;
            }
            return false;
        }
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
              w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group
              ${isActive
                                ? 'bg-white/10 text-white font-medium'
                                : 'text-secondary-300 hover:bg-white/5 hover:text-white'
                            }
            `}
                    >
                        <div className="flex items-center gap-3">
                            {Icon && (
                                <Icon
                                    className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-500' : 'text-secondary-400 group-hover:text-secondary-200'}`}
                                />
                            )}
                            <span className={`text-sm ${!Icon && level > 0 ? 'ml-6' : ''}`}>
                                {item.label}
                            </span>
                        </div>
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-secondary-400 group-hover:text-secondary-200" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-secondary-400 group-hover:text-secondary-200" />
                        )}
                    </button>
                    {isExpanded && item.children && (
                        <ul className="ml-4 mt-1 space-y-0.5 border-l border-secondary-700 pl-2">
                            {item.children.map((child) =>
                                renderMenuItem(child, level + 1, item.children)
                            )}
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
            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm group
            ${level > 0 ? 'pl-6' : ''}
            ${isActive
                                ? 'bg-primary-900 text-white font-medium shadow-sm'
                                : 'text-secondary-300 hover:bg-white/5 hover:text-white'
                            }
          `}
                >
                    {level === 0 && Icon && (
                        <Icon
                            className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-secondary-400 group-hover:text-secondary-200'}`}
                        />
                    )}
                    <span>{item.label}</span>
                </Link>
            </li>
        );
    };

    return (
        <aside
            className={`
        fixed inset-y-0 left-0 w-64 bg-secondary-900 border-r border-secondary-800 flex flex-col h-full z-40
        transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
        >
            <div className="h-[72px] flex items-center justify-between px-5 border-b border-secondary-800 bg-secondary-900 shrink-0">
                <Link href="/admin/dashboard" className="relative h-8 w-32 block">
                    <NextImage
                        src="/workit-logo-white.png"
                        alt="Workit Logo"
                        fill
                        sizes="256px"
                        className="object-contain object-left"
                        priority
                    />
                </Link>
                <button
                    onClick={onClose}
                    className="lg:hidden p-1.5 text-secondary-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 p-3 pt-4 overflow-y-auto custom-scrollbar">
                {menuSections.map((section) => (
                    <div key={section.title} className="mb-5">
                        <h3 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-secondary-500">
                            {section.title}
                        </h3>
                        <ul className="space-y-0.5">
                            {section.items.map((item) => renderMenuItem(item))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-secondary-800 bg-secondary-900">
                <div className="flex items-center gap-3 px-2 py-2.5 rounded-lg bg-secondary-800/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-800 to-primary-900 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                            Workit Enterprises
                        </p>
                        <p className="text-[10px] text-secondary-400">Admin Panel v2.0</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
