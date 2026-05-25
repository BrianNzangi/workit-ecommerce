'use client';

import { useSession, signOut } from '@/lib/auth/auth-client';
import { normalizeAdminRole } from '@/lib/auth/rbac';
import NextImage from 'next/image';
import { LogOut, User, ChevronDown, Menu as MenuIcon, Settings, Bell, Store } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
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
import { AlertModal } from '@/components/ui/alert-modal';

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
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

    // Close sidebar when navigating on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    const userName = session?.user?.name || 'Admin User';
    const userEmail = session?.user?.email || 'admin@workit.com';
    const initials = getInitials(userName);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Fixed Height/Width */}
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-[72px] bg-white border-b border-gray-200 sticky top-0 z-20 shrink-0">
                    <Container className="px-4 lg:px-6 h-full flex items-center">
                        <div className="flex justify-between items-center w-full">
                            {/* Left Side: Mobile Menu Toggle & Title */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <MenuIcon className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <Store className="w-4 h-4 text-primary-900" />
                                    </div>
                                    <div>
                                        <h2 className="text-base lg:text-lg font-semibold text-gray-900 leading-tight">Admin Dashboard</h2>
                                        <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">Manage Workit Store</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
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
                    </Container>
                </header>

                {/* Main Content Scroll Area */}
                <main className="flex-1 overflow-y-auto bg-[#F5F6FA] scroll-smooth">
                    <Container className="p-4 lg:p-6">
                        {children}
                    </Container>
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            <AlertModal
                isOpen={showLogoutModal}
                onClose={cancelLogout}
                onConfirm={confirmLogout}
                loading={isLoggingOut}
                title="Confirm Logout"
                description="Are you sure you want to logout? You will be redirected to the login page."
            />
        </div>
    );
}
