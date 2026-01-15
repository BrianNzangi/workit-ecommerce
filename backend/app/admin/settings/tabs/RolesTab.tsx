'use client';

import { CheckCircle, AlertCircle } from 'lucide-react';

export default function RolesTab() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    User Roles & Permissions
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    Overview of role-based access control. Assign roles to users in the Users tab.
                </p>
                <div className="space-y-4">
                    {/* Super Admin Role */}
                    <div className="border border-gray-200 rounded-xs shadow-xs p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 text-lg">
                                Super Admin
                            </h3>
                            <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                                Full Access
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Complete control over all system features and settings
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Manage all users</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Manage products</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Manage orders</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Manage customers</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>System settings</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Marketing campaigns</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Analytics & reports</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Content management</span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Role */}
                    <div className="border border-gray-200 rounded-xs shadow-xs p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 text-lg">Admin</h3>
                            <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                Most Features
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Manage products, orders, and customers (cannot manage users or system settings)
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <AlertCircle className="w-4 h-4" />
                                <span>Manage users</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Manage products</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Manage orders</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Manage customers</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <AlertCircle className="w-4 h-4" />
                                <span>System settings</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Marketing campaigns</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Analytics & reports</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Content management</span>
                            </div>
                        </div>
                    </div>

                    {/* Editor Role */}
                    <div className="border border-gray-200 rounded-xs shadow-xs p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 text-lg">Editor</h3>
                            <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                                Limited Access
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Edit content and view reports (cannot manage users, orders, or settings)
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <AlertCircle className="w-4 h-4" />
                                <span>Manage users</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Edit products</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <AlertCircle className="w-4 h-4" />
                                <span>Manage orders</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <AlertCircle className="w-4 h-4" />
                                <span>Manage customers</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <AlertCircle className="w-4 h-4" />
                                <span>System settings</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <AlertCircle className="w-4 h-4" />
                                <span>Marketing campaigns</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>View reports</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Edit content</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
