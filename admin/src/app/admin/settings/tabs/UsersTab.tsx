'use client';

import { useState } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { AdminUser } from './index';
import type { UserRole } from '@/lib/auth/rbac';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface UsersTabProps {
    adminUsers: AdminUser[];
    loadingUsers: boolean;
    onUpdateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
    onToggleUserStatus: (userId: string, enabled: boolean) => Promise<void>;
    onDeleteUser: (userId: string) => Promise<void>;
    onCreateUser: (user: {
        email: string;
        firstName?: string;
        lastName?: string;
        password: string;
        role: UserRole;
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
        role: 'ADMIN' as UserRole,
    });
    const [creatingUser, setCreatingUser] = useState(false);
    const [formError, setFormError] = useState('');

    const handleCreateUser = async () => {
        setFormError('');

        if (!newUser.email || !newUser.password) {
            setFormError('Please fill in email and password.');
            return;
        }

        if (newUser.password.length < 8) {
            setFormError('Password must be at least 8 characters.');
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Users</h2>
                    <p className="text-sm text-gray-600">Manage users and assign their roles.</p>
                </div>
                <Button
                    onClick={() => !readOnly && setShowNewUserForm((prev) => !prev)}
                    disabled={readOnly}
                    className="bg-primary-800 hover:bg-primary-900 text-white"
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
                </Button>
            </div>

            {showNewUserForm && (
                <Card className="bg-gray-50">
                    <CardHeader>
                        <CardTitle>Create New User</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new_user_first_name">First Name</Label>
                                <Input
                                    id="new_user_first_name"
                                    type="text"
                                    value={newUser.firstName}
                                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                    placeholder="John"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new_user_last_name">Last Name</Label>
                                <Input
                                    id="new_user_last_name"
                                    type="text"
                                    value={newUser.lastName}
                                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new_user_email">Email *</Label>
                                <Input
                                    id="new_user_email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new_user_password">Password *</Label>
                                <Input
                                    id="new_user_password"
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    placeholder="Min. 8 characters"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Role *</Label>
                            <Select
                                value={newUser.role}
                                onValueChange={(value) =>
                                    setNewUser({
                                        ...newUser,
                                        role: value as UserRole,
                                    })
                                }
                            >
                                <SelectTrigger className="w-full md:w-72">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="EDITOR">Editor</SelectItem>
                                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={handleCreateUser} disabled={creatingUser}>
                                {creatingUser ? 'Creating...' : 'Create User'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowNewUserForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {loadingUsers ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {adminUsers.map((user) => (
                        <Card key={user.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900">
                                                {user.firstName} {user.lastName}
                                            </h3>
                                            <Badge variant={user.enabled !== false ? 'success' : 'error'}>
                                                {user.enabled !== false ? 'Active' : 'Disabled'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{user.email}</p>

                                        <div className="flex flex-wrap items-end gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-xs">Role</Label>
                                                <Select
                                                    value={user.role}
                                                    onValueChange={(value) =>
                                                        onUpdateUserRole(user.id, value as UserRole)
                                                    }
                                                    disabled={readOnly}
                                                >
                                                    <SelectTrigger className="w-36">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                                        <SelectItem value="EDITOR">Editor</SelectItem>
                                                        <SelectItem value="CUSTOMER">Customer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs">Status</Label>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => !readOnly && onToggleUserStatus(user.id, !user.enabled)}
                                                    disabled={readOnly}
                                                >
                                                    {user.enabled !== false ? 'Disable' : 'Enable'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => !readOnly && onDeleteUser(user.id)}
                                        disabled={readOnly}
                                        title="Delete user"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                    Created: {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {adminUsers.length === 0 && <div className="text-center py-12 text-gray-500">No users found</div>}
                </div>
            )}
        </div>
    );
}
