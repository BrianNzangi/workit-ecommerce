'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

const routeLabels: Record<string, string> = {
    admin: 'Admin',
    dashboard: 'Dashboard',
    products: 'Products',
    collections: 'Collections',
    'homepage-collections': 'Homepage Collections',
    brands: 'Brands',
    assets: 'Assets',
    pages: 'Pages',
    orders: 'Orders',
    abandoned: 'Abandoned Checkouts',
    customers: 'Customers',
    segments: 'Segments',
    marketing: 'Marketing',

    banners: 'Banners',
    blog: 'Blog',
    settings: 'Settings',
    system: 'System',
    'cron-jobs': 'Cron Jobs',
    'warranty-refunds': 'Returns and Refunds',
    'shipping-policy': 'Shipping Policy',
    'terms-of-service': 'Terms of Service',
    'privacy-policy': 'Privacy Policy',
    'help-center': 'Help Center',
    'advertising-policy': 'Advertising Policy',
    login: 'Login',
};

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let accumulatedPath = '';
    segments.forEach((segment, index) => {
        accumulatedPath += `/${segment}`;
        const label = routeLabels[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        breadcrumbs.push({
            label,
            href: index === segments.length - 1 ? undefined : accumulatedPath,
        });
    });

    return breadcrumbs;
}

export function Breadcrumb() {
    const pathname = usePathname();
    const breadcrumbs = generateBreadcrumbs(pathname);

    if (pathname === '/admin/dashboard' || pathname === '/admin') {
        return null;
    }

    return (
        <nav className="flex items-center gap-1 text-sm mb-6" aria-label="Breadcrumb">
            <Link
                href="/admin/dashboard"
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
                <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {breadcrumbs.map((breadcrumb, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                    <div key={index} className="flex items-center gap-1">
                        {breadcrumb.href && !isLast ? (
                            <Link
                                href={breadcrumb.href}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {breadcrumb.label}
                            </Link>
                        ) : (
                            <span className="text-gray-900 font-medium">{breadcrumb.label}</span>
                        )}
                        {!isLast && <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </div>
                );
            })}
        </nav>
    );
}
