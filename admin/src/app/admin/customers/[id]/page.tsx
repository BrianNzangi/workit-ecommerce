'use client';

import { useEffect, useState, use } from 'react';
import { Loader2, AlertCircle, ArrowLeft, Star, StarHalf, Bell, Mail, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

interface OrderLine {
    id: string;
    quantity: number;
    linePrice: number;
    product?: {
        name?: string;
    } | null;
}

interface Order {
    id: string;
    code: string;
    state: string;
    total: number;
    createdAt: string;
}

interface Customer {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    phoneNumber?: string | null;
    createdAt: string;
    enabled?: boolean;
    location?: string;
    address?: {
        streetLine1?: string;
        streetLine2?: string;
        city?: string;
        province?: string;
        country?: string;
        postalCode?: string;
    } | null;
    orders?: Order[];
    totalSpent?: number;
    ordersCount?: number;
}

const ORDER_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
    CREATED: { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-600' },
    PAYMENT_PENDING: { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-600' },
    PAYMENT_AUTHORIZED: { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-600' },
    PAYMENT_SETTLED: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700' },
    SHIPPED: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700' },
    DELIVERED: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' },
};

const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).replace(',', '');

const getCustomerName = (customer: Customer): string => {
    const firstName = customer.firstName?.trim() || '';
    const lastName = customer.lastName?.trim() || '';
    const combined = `${firstName} ${lastName}`.trim();
    if (combined) return combined;
    if (customer.name?.trim()) return customer.name.trim();
    return 'Unnamed Customer';
};

const getCustomerInitials = (customer: Customer): string => {
    const firstName = customer.firstName?.trim() || '';
    const lastName = customer.lastName?.trim() || '';
    if (firstName || lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'C';
    }
    const fallback = customer.name?.trim() || customer.email || 'C';
    return fallback.charAt(0).toUpperCase();
};

const getCustomerYears = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
};

const getAvatarColor = (name: string) => {
    const colors = [
        'bg-blue-100 text-blue-700',
        'bg-green-100 text-green-700',
        'bg-purple-100 text-purple-700',
        'bg-orange-100 text-orange-700',
        'bg-pink-100 text-pink-700',
        'bg-indigo-100 text-indigo-700',
        'bg-teal-100 text-teal-700',
        'bg-amber-100 text-amber-700',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

export default function CustomerInformationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState<string[]>(['Vip Customer', 'Europe']);
    const [newTag, setNewTag] = useState('');
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState<{ emailNotifications: boolean; smsNotifications: boolean; promoNotifications: boolean } | null>(null);
    const [preferencesLoading, setPreferencesLoading] = useState(false);
    const [preferencesSaving, setPreferencesSaving] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCustomer();
        }
    }, [id]);

    useEffect(() => {
        if (id && customer) {
            fetchPreferences();
        }
    }, [id, customer]);

    const fetchCustomer = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/customers/${id}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch customer');
            }

            setCustomer(result.customer);
        } catch (err) {
            console.error('Error fetching customer:', err);
            setError(err instanceof Error ? err.message : 'Failed to load customer');
        } finally {
            setLoading(false);
        }
    };

    const fetchPreferences = async () => {
        try {
            setPreferencesLoading(true);
            const response = await fetch(`/api/admin/customers/${id}/preferences`);
            const result = await response.json();
            if (result.success && result.preferences) {
                setPreferences(result.preferences);
            }
        } catch (err) {
            console.error('Error fetching preferences:', err);
        } finally {
            setPreferencesLoading(false);
        }
    };

    const updatePreference = async (key: 'emailNotifications' | 'smsNotifications' | 'promoNotifications', value: boolean) => {
        const updated = { ...preferences, [key]: value };
        setPreferences(updated as any);
        setPreferencesSaving(true);
        try {
            const response = await fetch(`/api/admin/customers/${id}/preferences`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
            });
            const result = await response.json();
            if (!result.success) {
                setPreferences(preferences);
                toast({ title: 'Error', description: 'Failed to update preference', variant: 'error' });
            }
        } catch (err) {
            setPreferences(preferences);
            toast({ title: 'Error', description: 'Failed to update preference', variant: 'error' });
        } finally {
            setPreferencesSaving(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`/api/admin/customers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes, tags }),
            });
            toast({
                title: 'Success',
                description: 'Customer information updated',
                variant: 'success',
            });
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to update customer',
                variant: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <Loader2 className="w-8 h-8 text-primary-700 animate-spin mb-3" />
                        <p className="text-gray-600 text-sm">Loading customer information...</p>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    if (error || !customer) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <Card className="max-w-md mx-auto rounded border border-gray-200">
                        <CardContent className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Customer</h2>
                            <p className="text-sm text-gray-600 mb-6">{error || 'Customer not found'}</p>
                            <Button asChild variant="outline" className="rounded">
                                <Link href="/admin/customers">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    const name = getCustomerName(customer);
    const initials = getCustomerInitials(customer);
    const avatarColor = getAvatarColor(name);
    const years = getCustomerYears(customer.createdAt);
    const orders = customer.orders || [];

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" size="sm" className="rounded -ml-2 text-gray-500 hover:text-gray-900">
                            <Link href="/admin/customers">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <h1 className="text-xl font-semibold text-gray-900">Customer Information</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button size="sm" className="rounded bg-primary-900 text-white hover:bg-primary-800" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save
                        </Button>
                    </div>
                </div>

                <div className="flex gap-6">
                    <div className="flex-1 space-y-6">
                        <Card className="rounded border border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold ${avatarColor}`}>
                                            {initials}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
                                            <p className="text-sm text-gray-500">{customer.location || 'Unknown'}</p>
                                            <p className="text-sm text-gray-500">
                                                {customer.ordersCount || orders.length} Orders
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Customer for {years} {years === 1 ? 'year' : 'years'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4].map((star) => (
                                            <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                        <StarHalf className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Notes</h3>
                                    <p className="text-xs text-gray-500 mb-2">Notes</p>
                                    <Textarea
                                        placeholder="Add notes about customer"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="rounded resize-none"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded border border-gray-200">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-900">Notification Preferences</h3>
                                    {preferencesSaving && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                                </div>
                                {preferencesLoading ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                    </div>
                                ) : preferences ? (
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <div className="flex items-center gap-3">
                                                <Mail size={16} className="text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Email notifications</p>
                                                    <p className="text-xs text-gray-500">Order updates & receipts</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={preferences.emailNotifications}
                                                onClick={() => updatePreference('emailNotifications', !preferences.emailNotifications)}
                                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${preferences.emailNotifications ? 'bg-primary-900' : 'bg-gray-200'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 translate-y-0 rounded-full bg-white shadow transition-transform ${preferences.emailNotifications ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </button>
                                        </label>
                                        <label className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <div className="flex items-center gap-3">
                                                <Smartphone size={16} className="text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">SMS notifications</p>
                                                    <p className="text-xs text-gray-500">Text messages for order status</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={preferences.smsNotifications}
                                                onClick={() => updatePreference('smsNotifications', !preferences.smsNotifications)}
                                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${preferences.smsNotifications ? 'bg-primary-900' : 'bg-gray-200'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 translate-y-0 rounded-full bg-white shadow transition-transform ${preferences.smsNotifications ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </button>
                                        </label>
                                        <label className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                            <div className="flex items-center gap-3">
                                                <Bell size={16} className="text-gray-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Promotions & deals</p>
                                                    <p className="text-xs text-gray-500">Exclusive offers and discounts</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={preferences.promoNotifications}
                                                onClick={() => updatePreference('promoNotifications', !preferences.promoNotifications)}
                                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${preferences.promoNotifications ? 'bg-primary-900' : 'bg-gray-200'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 translate-y-0 rounded-full bg-white shadow transition-transform ${preferences.promoNotifications ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </button>
                                        </label>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 py-2">Unable to load preferences</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded border border-gray-200">
                            <CardContent className="p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">Customer Orders</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-semibold">Order</TableHead>
                                            <TableHead className="font-semibold">Date</TableHead>
                                            <TableHead className="font-semibold">Order Status</TableHead>
                                            <TableHead className="text-right font-semibold">Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => {
                                            const status = ORDER_STATUS_MAP[order.state] || ORDER_STATUS_MAP.CREATED;
                                            return (
                                                <TableRow key={order.id}>
                                                    <TableCell>
                                                        <Link
                                                            href={`/admin/orders/${order.id}`}
                                                            className="text-sm font-semibold text-primary-700 hover:text-primary-900"
                                                        >
                                                            #{order.code}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-600">{formatDate(order.createdAt)}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={`rounded border-0 px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.text}`}
                                                        >
                                                            {status.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right text-sm font-semibold text-gray-900">
                                                        {formatCurrency(order.total)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="w-80 shrink-0 space-y-6">
                        <Card className="rounded border border-gray-200">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-900">Overview</h3>
                                    <Button variant="ghost" size="sm" className="h-auto p-0 text-primary-700 hover:text-primary-900">
                                        Edit
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">Address</p>
                                        <p className="text-sm text-gray-700">
                                            {customer.address?.streetLine1 || 'N/A'}
                                            {customer.address?.streetLine2 && <>, {customer.address.streetLine2}</>}
                                            <br />
                                            {customer.address?.city || ''}{customer.address?.province && `, ${customer.address.province}`}
                                            <br />
                                            {customer.address?.postalCode || ''}
                                            <br />
                                            {customer.address?.country || customer.location || 'N/A'}
                                        </p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">Email Address</p>
                                        <p className="text-sm text-gray-700">{customer.email}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">Phone</p>
                                        <p className="text-sm text-gray-700">{customer.phoneNumber || 'N/A'}</p>
                                    </div>

                                    <Separator />

                                    <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded">
                                        Delete Customer
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded border border-gray-200">
                            <CardContent className="p-5">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
                                <p className="text-xs text-gray-500 mb-2">Add Tags</p>
                                <Input
                                    placeholder="Enter tag name"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="rounded mb-3"
                                />
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="rounded bg-gray-100 text-gray-700 px-2 py-1"
                                        >
                                            {tag}
                                            <button
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-1.5 text-gray-400 hover:text-gray-600"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-2 lg:hidden">
                    <Button variant="outline" size="sm" className="rounded" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                    <Button size="sm" className="rounded bg-primary-900 text-white hover:bg-primary-800" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save
                    </Button>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
