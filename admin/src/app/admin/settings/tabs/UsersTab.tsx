'use client';

import { useState } from 'react';
import { Trash2, Plus, X, UserPlus, Search } from 'lucide-react';
import { AdminUser } from './index';
import type { UserRole } from '@/lib/auth/rbac';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
};

const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
        case 'SUPER_ADMIN': return 'info';
        case 'ADMIN': return 'default';
        case 'EDITOR': return 'secondary';
        default: return 'outline';
    }
};

const getRoleLabel = (role: UserRole) => {
    switch (role) {
        case 'SUPER_ADMIN': return 'Super Admin';
        case 'ADMIN': return 'Admin';
        case 'EDITOR': return 'Editor';
        case 'CUSTOMER': return 'Customer';
        default: return role;
    }
};

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
    const [searchQuery, setSearchQuery] = useState('');
    const [newUser, setNewUser] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        role: 'ADMIN' as UserRole,
    });
    const [creatingUser, setCreatingUser] = useState(false);
    const [formError, setFormError] = useState('');

    const filteredUsers = adminUsers.filter((user) => {
        const query = searchQuery.toLowerCase();
        return (
            user.email.toLowerCase().includes(query) ||
            user.firstName?.toLowerCase().includes(query) ||
            user.lastName?.toLowerCase().includes(query)
        );
    });

    const handleCreateUser = async () => {
        setFormError('');

        if (!newUser.email || !newUser.password) {
            setFormError('Email and password are required.');
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
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{adminUsers.length} user{adminUsers.length !== 1 ? 's' : ''}</p>
                </div>
                {!readOnly && (
                    <Button
                        onClick={() => setShowNewUserForm((prev) => !prev)}
                        className="bg-primary-800 hover:bg-primary-900 text-white h-9"
                    >
                        {showNewUserForm ? (
                            <>
                                <X className="w-4 h-4 mr-1.5" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4 mr-1.5" />
                                Add User
                            </>
                        )}
                    </Button>
                )}
            </div>

            {showNewUserForm && !readOnly && (
                <div className="bg-white rounded-lg p-5">
                    <div className="mb-4">
                        <h3 className="text-base font-semibold text-gray-900">Create New User</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Add a new admin user to your team</p>
                    </div>

                    {formError && (
                        <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700 mb-4">
                            {formError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new_user_first_name">First Name</Label>
                                <Input
                                    id="new_user_first_name"
                                    type="text"
                                    value={newUser.firstName}
                                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                    placeholder="John"
                                    className="h-9"
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
                                    className="h-9"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new_user_email">Email</Label>
                                <Input
                                    id="new_user_email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="john@example.com"
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new_user_password">Password</Label>
                                <Input
                                    id="new_user_password"
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    placeholder="Min. 8 characters"
                                    className="h-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                                value={newUser.role}
                                onValueChange={(value) =>
                                    setNewUser({
                                        ...newUser,
                                        role: value as UserRole,
                                    })
                                }
                            >
                                <SelectTrigger className="w-full md:w-72 h-9">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="EDITOR">Editor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        <div className="flex gap-2">
                            <Button onClick={handleCreateUser} disabled={creatingUser} className="h-9">
                                {creatingUser ? 'Creating...' : 'Create User'}
                            </Button>
                            <Button variant="outline" onClick={() => { setShowNewUserForm(false); setFormError(''); }} className="h-9">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                />
            </div>

            <div className="bg-white rounded-lg overflow-hidden">
                {loadingUsers ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-800"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">{searchQuery ? 'No users match your search' : 'No users found'}</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-70">User</TableHead>
                                <TableHead className="w-40">Role</TableHead>
                                <TableHead className="w-25">Status</TableHead>
                                <TableHead className="w-35">Created</TableHead>
                                {!readOnly && <TableHead className="w-15 text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarFallback className="bg-primary-100 text-primary-800 text-xs font-medium">
                                                    {getInitials(user.firstName, user.lastName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm text-gray-900 truncate">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={user.role}
                                            onValueChange={(value) =>
                                                onUpdateUserRole(user.id, value as UserRole)
                                            }
                                            disabled={readOnly}
                                        >
                                            <SelectTrigger className="w-full h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                                <SelectItem value="ADMIN">Admin</SelectItem>
                                                <SelectItem value="EDITOR">Editor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.enabled !== false ? 'success' : 'outline'} className="text-xs h-5 px-1.5">
                                            {user.enabled !== false ? 'Active' : 'Disabled'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    {!readOnly && (
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                                                title="Delete user"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
