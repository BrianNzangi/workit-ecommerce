'use client';

import { useSession, signOut } from '@/lib/auth/auth-client';
import { normalizeAdminRole } from '@/lib/auth/rbac';
import { LogOut, User, ChevronDown, Settings, Bell, Store } from 'lucide-react';
import { useState } from 'react';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
    DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbLink,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { AlertModal } from '@/components/ui/alert-modal';
import { AppSidebar } from '@/components/admin/app-sidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export function AdminLayout({ children }: AdminLayoutProps) {
    const { data: session } = useSession();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const rawRole = String((session?.user as any)?.role || '').toUpperCase();
    const userRole = normalizeAdminRole(rawRole) || rawRole || 'CUSTOMER';

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await signOut();
        window.location.href = '/admin/login';
    };

    const initiateLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        handleLogout();
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    const userName = session?.user?.name || 'Admin User';
    const userEmail = session?.user?.email || 'admin@workit.com';
    const initials = getInitials(userName);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4 w-full">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="/admin/dashboard">
                                            <Store className="w-4 h-4 inline-block mr-1 text-primary-900" />
                                            Workit Store
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>Admin Dashboard</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                            {/* Notifications */}
                            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-900 rounded-full"></span>
                            </button>

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-auto p-1.5 lg:p-2 hover:bg-gray-100 flex items-center gap-2 lg:gap-3 rounded-lg">
                                        <div className="flex items-center gap-2 lg:gap-3">
                                            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-primary-800 to-primary-900 rounded-full flex items-center justify-center shadow-sm">
                                                <span className="text-white text-sm font-semibold">{initials}</span>
                                            </div>
                                            <div className="text-left hidden sm:block">
                                                <p className="text-sm font-medium text-gray-900 leading-tight">
                                                    {userName}
                                                </p>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 p-2 border-gray-100">
                                    {/* User Info Header */}
                                    <div className="px-3 py-3 mb-2 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-primary-800 to-primary-900 rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm font-semibold">{initials}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                                                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <DropdownMenuGroup>
                                        <DropdownMenuItem className="cursor-pointer py-2.5">
                                            <User className="w-4 h-4" />
                                            <span>My Account</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer py-2.5">
                                            <Settings className="w-4 h-4" />
                                            <span>Preferences</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>

                                    <DropdownMenuSeparator className="bg-gray-100" />

                                    <DropdownMenuItem
                                        onClick={initiateLogout}
                                        className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer py-2.5"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                        <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Main Content Scroll Area */}
                <div className="flex-1 overflow-y-auto bg-[#F5F6FA]">
                    <Container className="p-4 lg:p-6">
                        {children}
                    </Container>
                </div>
            </SidebarInset>

            {/* Logout Confirmation Modal */}
            <AlertModal
                isOpen={showLogoutModal}
                onClose={cancelLogout}
                onConfirm={confirmLogout}
                loading={isLoggingOut}
                title="Confirm Logout"
                description="Are you sure you want to logout? You will be redirected to the login page."
            />
        </SidebarProvider>
    );
}
