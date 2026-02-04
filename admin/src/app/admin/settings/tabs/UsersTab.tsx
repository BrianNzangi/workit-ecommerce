'use client';

import { useState } from 'react';
import { Trash2, Plus, X, ChevronDown } from 'lucide-react';
import { AdminUser } from './index';

interface UsersTabProps {
    adminUsers: AdminUser[];
    loadingUsers: boolean;
    onUpdateUserRole: (userId: string, newRole: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR') => Promise<void>;
    onToggleUserStatus: (userId: string, enabled: boolean) => Promise<void>;
    onDeleteUser: (userId: string) => Promise<void>;
    onCreateUser: (user: {
        email: string;
        firstName: string;
        lastName: string;
        password: string;
        role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
    }) => Promise<void>;
    readOnly?: boolean;
}

export default function UsersTab({
    adminUsers,
    loadingUsers,
    onUpdateUserRole,
    onToggleUserStatus,
    onDeleteUser,
    onCreateUser,
    readOnly = false,
}: UsersTabProps) {
    const [showNewUserForm, setShowNewUserForm] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        role: 'ADMIN' as 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR',
    });
    const [creatingUser, setCreatingUser] = useState(false);

    const handleCreateUser = async () => {
        // Validate fields
        if (!newUser.email || !newUser.firstName || !newUser.lastName || !newUser.password) {
            alert('Please fill in all fields');
            return;
        }

        if (newUser.password.length < 8) {
            alert('Password must be at least 8 characters');
            return;
        }

        setCreatingUser(true);
        try {
            await onCreateUser(newUser);
            setShowNewUserForm(false);
            setNewUser({
                email: '',
                firstName: '',
                lastName: '',
                password: '',
                role: 'ADMIN',
            });
        } finally {
            setCreatingUser(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Add User Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Admin Users
                    </h2>
                    <p className="text-sm text-gray-600">
                        Manage admin users and their access levels
                    </p>
                </div>
                <button
                    onClick={() => !readOnly && setShowNewUserForm(!showNewUserForm)}
                    disabled={readOnly}
                    className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2.5 rounded-xs hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {showNewUserForm ? (
                        <>
                            <X className="w-4 h-4" />
                            Cancel
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4" />
                            Add User
                        </>
                    )}
                </button>
            </div>

            {/* New User Form */}
            {showNewUserForm && (
                <div className="border border-gray-200 rounded-xs shadow-xs p-6 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Create New User
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name *
                            </label>
                            <input
                                type="text"
                                value={newUser.firstName}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, firstName: e.target.value })
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                value={newUser.lastName}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, lastName: e.target.value })
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                placeholder="Doe"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={newUser.email}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, email: e.target.value })
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password *
                            </label>
                            <input
                                type="password"
                                value={newUser.password}
                                onChange={(e) =>
                                    setNewUser({ ...newUser, password: e.target.value })
                                }
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                placeholder="Min. 8 characters"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role *
                        </label>
                        <div className="relative">
                            <select
                                value={newUser.role}
                                onChange={(e) =>
                                    setNewUser({
                                        ...newUser,
                                        role: e.target.value as
                                            | 'SUPER_ADMIN'
                                            | 'ADMIN'
                                            | 'EDITOR',
                                    })
                                }
                                className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-xs bg-white focus:ring-2 focus:ring-primary-600 focus:border-transparent cursor-pointer"
                            >
                                <option value="SUPER_ADMIN">Super Admin</option>
                                <option value="ADMIN">Admin</option>
                                <option value="EDITOR">Editor</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleCreateUser}
                            disabled={creatingUser}
                            className="flex items-center gap-2 bg-primary-800 text-white px-6 py-2.5 rounded-xs hover:bg-primary-900 transition-colors disabled:opacity-50"
                        >
                            {creatingUser ? 'Creating...' : 'Create User'}
                        </button>
                        <button
                            onClick={() => setShowNewUserForm(false)}
                            className="px-6 py-2.5 border border-gray-300 rounded-xs hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {loadingUsers ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {adminUsers.map((user) => (
                        <div
                            key={user.id}
                            className="border border-gray-200 rounded-xs shadow-xs p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-900">
                                            {user.firstName} {user.lastName}
                                        </h3>
                                        <span
                                            className={`text-xs px-2 py-1 rounded ${user.enabled !== false
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {user.enabled !== false ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {user.email}
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Role
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) =>
                                                        onUpdateUserRole(
                                                            user.id,
                                                            e.target.value as
                                                            | 'SUPER_ADMIN'
                                                            | 'ADMIN'
                                                            | 'EDITOR'
                                                        )
                                                    }
                                                    disabled={readOnly}
                                                    className="appearance-none px-3 py-1.5 pr-8 border border-gray-300 rounded-xs text-sm bg-white focus:ring-2 focus:ring-primary-600 focus:border-transparent cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                                                >
                                                    <option value="SUPER_ADMIN">
                                                        Super Admin
                                                    </option>
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="EDITOR">Editor</option>
                                                </select>
                                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Status
                                            </label>
                                            <button
                                                onClick={() =>
                                                    !readOnly && onToggleUserStatus(
                                                        user.id,
                                                        !user.enabled
                                                    )
                                                }
                                                disabled={readOnly}
                                                className={`px-3 py-1.5 rounded-xs text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${user.enabled
                                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                            >
                                                {user.enabled !== false ? 'Disable' : 'Enable'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => !readOnly && onDeleteUser(user.id)}
                                    disabled={readOnly}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete user"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                Created:{' '}
                                {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}

                    {adminUsers.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No users found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
