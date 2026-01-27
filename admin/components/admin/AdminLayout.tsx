'use client';

import { useSession, signOut } from '@/lib/auth-client';
import NextImage from 'next/image';
import { LogOut, User } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';

import { Container } from '@/components/ui/Container';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { data: session } = useSession();

    const handleLogout = async () => {
        await signOut();
        window.location.href = '/admin/login';
    };


    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar - Fixed Height/Width */}
            <AdminSidebar />

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-[72px] bg-white border-b border-gray-200 sticky top-0 z-20 shrink-0">
                    <Container className="px-6 h-full flex items-center">
                        <div className="flex justify-between items-center w-full">
                            {/* Dashboard Title */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
                                <p className="text-sm text-gray-500">Manage Workit Store</p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* User Info */}
                                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {session?.user?.name || 'Admin User'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(session?.user as any)?.role || 'ADMIN'}
                                        </p>
                                    </div>
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </Container>
                </header>

                {/* Main Content Scroll Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50 scroll-smooth">
                    <Container className="p-6">
                        {children}
                    </Container>
                </main>
            </div>
        </div>
    );
}
