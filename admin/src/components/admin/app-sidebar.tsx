'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    FileText,
    Image,
    Megaphone,
    Clock,
    BarChart3,
    Building2,
    Percent,
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';

interface MenuItem {
    label: string;
    href?: string;
    icon?: any;
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
                    { label: 'Products', href: '/admin/products' },
                    { label: 'Collections', href: '/admin/collections' },
                    { label: 'Homepage Collections', href: '/admin/homepage-collections' },
                    { label: 'Brands', href: '/admin/brands' },
                    { label: 'Assets', href: '/admin/assets' },
                ],
            },
            {
                label: 'Orders',
                icon: ShoppingCart,
                children: [
                    { label: 'Orders', href: '/admin/orders' },
                    { label: 'Abandoned Checkouts', href: '/admin/orders/abandoned' },
                ],
            },
            {
                label: 'Customers',
                icon: Users,
                children: [
                    { label: 'Customers', href: '/admin/customers' },
                    { label: 'Segments', href: '/admin/customers/segments' },
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
                    { label: 'Coupon', href: '/admin/promotions/coupons' },
                    { label: 'Flash Sales', href: '/admin/promotions/flash-sales' },
                    { label: 'Featured Deal', href: '/admin/promotions/featured-deals' },
                    { label: 'Clearance Deal', href: '/admin/promotions/clearance-deals' },
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
                    { label: 'Returns Policy', href: '/admin/content/pages/returns-policy' },
                    { label: 'Refunds Policy', href: '/admin/content/pages/refunds-policy' },
                    { label: 'Shipping Policy', href: '/admin/content/pages/shipping-policy' },
                    { label: 'Terms Of Service', href: '/admin/content/pages/terms-of-service' },
                    { label: 'Privacy Policy', href: '/admin/content/pages/privacy-policy' },
                    { label: 'Advertising Policy', href: '/admin/content/pages/advertising-policy' },
                    { label: 'Help Center', href: '/admin/content/pages/help-center' },
                    { label: 'About Workit', href: '/admin/content/pages/about-workit' },
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
            {
                label: 'Analytics',
                icon: BarChart3,
                children: [
                    { label: 'Product Views', href: '/admin/analytics/views' },
                ],
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
                    { label: 'Cron Jobs', href: '/admin/system/cron-jobs' },
                ],
            },
        ],
    },
];

const allMenuItems: MenuItem[] = menuSections.flatMap((s) => s.items);

function isActivePath(pathname: string | null, href: string): boolean {
    if (!pathname) return false;
    if (pathname === href) return true;
    if (pathname.startsWith(href + '/')) return true;
    return false;
}

function findParentLabels(pathname: string | null, items: MenuItem[]): string[] {
    const result: string[] = [];
    for (const item of items) {
        if (item.children) {
            if (item.children.some((c) => c.href && isActivePath(pathname, c.href))) {
                result.push(item.label);
            }
            result.push(...findParentLabels(pathname, item.children));
        }
    }
    return result;
}

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <Link href="/admin/dashboard" className="relative h-8 w-32 block mx-2">
                    <NextImage
                        src="/workit-logo-white.png"
                        alt="Workit Logo"
                        fill
                        sizes="256px"
                        className="object-contain object-left"
                        priority
                    />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                {menuSections.map((section) => (
                    <SidebarGroup key={section.title}>
                        <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {section.items.map((item) => (
                                    <MenuItemComponent
                                        key={item.label}
                                        item={item}
                                        pathname={pathname}
                                    />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <div className="flex items-center gap-3 px-2 py-2.5">
                    <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-sidebar-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                        <p className="text-xs font-medium truncate text-sidebar-foreground">
                            Workit Enterprises
                        </p>
                        <p className="text-[10px] text-sidebar-foreground/60">Admin Panel v2.0</p>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}

function MenuItemComponent({ item, pathname }: { item: MenuItem; pathname: string | null }) {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.href ? isActivePath(pathname, item.href) : false;
    const isChildActive = hasChildren && (item.children!.some((c) => c.href && isActivePath(pathname, c.href)));
    const [open, setOpen] = useState(isChildActive);

    useEffect(() => {
        if (isChildActive && !open) setOpen(true);
    }, [isChildActive, open]);

    const toggle = useCallback(() => setOpen((o) => !o), []);

    if (hasChildren) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    isActive={isActive || isChildActive}
                    onClick={toggle}
                    className="cursor-pointer"
                >
                    {Icon && <Icon />}
                    <span>{item.label}</span>
                    <ChevronDown
                        className={`ml-auto transition-transform ${open ? '' : '-rotate-90'}`}
                    />
                </SidebarMenuButton>
                {open && (
                    <SidebarMenuSub>
                        {item.children!.map((child) => (
                            <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton
                                    asChild
                                    isActive={child.href ? isActivePath(pathname, child.href) : false}
                                >
                                    <Link href={child.href!}>
                                        <span>{child.label}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                )}
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link href={item.href!}>
                    {Icon && <Icon />}
                    <span>{item.label}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
