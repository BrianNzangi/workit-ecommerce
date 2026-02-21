'use client';

import { useSession, signOut } from '@/lib/auth/auth-client';
import { normalizeAdminRole } from '@/lib/auth/rbac';
import NextImage from 'next/image';
import { LogOut, User, ChevronDown, Menu as MenuIcon } from 'lucide-react';
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
} from '@/components/ui/dropdown-menu';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const rawRole = String((session?.user as any)?.role || '').toUpperCase();
    const userRole = normalizeAdminRole(rawRole) || rawRole || 'CUSTOMER';

    const handleLogout = async () => {
        await signOut();
        window.location.href = '/admin/login';
    };

    // Close sidebar when navigating on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

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
                                    className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                >
                                    <MenuIcon className="w-6 h-6" />
                                </button>
                                <div>
                                    <h2 className="text-base lg:text-lg font-semibold text-gray-900 leading-tight">Admin Dashboard</h2>
                                    <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">Manage Workit Store</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-auto p-1.5 lg:p-2 hover:bg-gray-100 flex items-center gap-2 lg:gap-3">
                                            <div className="flex items-center gap-2 lg:gap-3">
                                                <div className="w-8 h-8 lg:w-9 lg:h-9 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                                                </div>
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {session?.user?.name || 'Admin User'}
                                                    </p>
                                                    <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wider">
                                                        {userRole}
                                                    </p>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="text-error focus:text-error cursor-pointer">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Logout</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </Container>
                </header>

                {/* Main Content Scroll Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50 scroll-smooth">
                    <Container className="p-4 lg:p-6">
                        {children}
                    </Container>
                </main>
            </div>
        </div>
    );
}
