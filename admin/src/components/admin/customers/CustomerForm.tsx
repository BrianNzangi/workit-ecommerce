'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { CustomerService } from '@/lib/services/customers/customer.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CustomerFormMode } from './form/types';

const initialFormData = {
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    address: '',
    apartment: '',
    city: '',
    country: '',
    postalCode: '',
    addressPhone: '',
    notes: '',
};

interface CustomerFormProps {
    mode?: CustomerFormMode;
    customerId?: string;
}

function normalizeCustomerPayload(payload: any) {
    return payload?.customer || payload;
}

const COUNTRIES = [
    { value: 'KE', label: 'Kenya' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'IN', label: 'India' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
];

export function CustomerForm({ mode = 'create', customerId }: CustomerFormProps) {
    const router = useRouter();
    const isEdit = mode === 'edit';

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState(initialFormData);

    const submitSuccessTitle = useMemo(() => (
        isEdit ? 'Customer updated' : 'Customer created'
    ), [isEdit]);

    useEffect(() => {
        if (!isEdit) return;
        if (!customerId) {
            setFetchLoading(false);
            setError('Customer ID is missing.');
            return;
        }

        const loadCustomer = async () => {
            try {
                setFetchLoading(true);
                setError('');
                const customerService = new CustomerService();
                const response = await customerService.getCustomer(customerId);
                const customer = normalizeCustomerPayload(response);

                if (!customer) {
                    throw new Error('Customer not found.');
                }

                setFormData({
                    ...initialFormData,
                    email: customer.email || '',
                    firstName: customer.firstName || '',
                    lastName: customer.lastName || '',
                    phoneNumber: customer.phoneNumber || '',
                    address: customer.address?.streetLine1 || '',
                    apartment: customer.address?.streetLine2 || '',
                    city: customer.address?.city || '',
                    country: customer.address?.country || '',
                    postalCode: customer.address?.postalCode || '',
                    addressPhone: customer.address?.phoneNumber || '',
                    notes: customer.notes || '',
                });
            } catch (loadError: any) {
                setError(loadError?.message || 'Failed to load customer.');
            } finally {
                setFetchLoading(false);
            }
        };

        loadCustomer();
    }, [customerId, isEdit]);

    const handleFieldChange = (field: string, value: string) => {
        setFormData((previous) => ({ ...previous, [field]: value }));
    };

    const validateForm = () => {
        if (!formData.firstName.trim()) return 'First name is required.';
        if (!formData.lastName.trim()) return 'Last name is required.';
        if (!formData.email.trim()) return 'Email is required.';

        if (!isEdit) {
            if (!formData.password) return 'Password is required.';
            if (formData.password.length < 8) return 'Password must be at least 8 characters long.';
            if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
        }

        return null;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const validationError = validateForm();
            if (validationError) {
                throw new Error(validationError);
            }

            const customerService = new CustomerService();
            const payload = {
                email: formData.email.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
                phoneNumber: formData.phoneNumber.trim() || undefined,
            };

            if (isEdit) {
                if (!customerId) throw new Error('Customer ID is missing.');
                await customerService.updateCustomer(customerId, payload);
            } else {
                await customerService.createCustomer({
                    ...payload,
                    password: formData.password,
                });
            }

            toast({
                title: submitSuccessTitle,
                description: `${payload.firstName} ${payload.lastName} was saved successfully.`,
                variant: 'success',
            });
            router.push('/admin/customers');
        } catch (submitError: any) {
            setError(submitError?.message || 'Unable to save customer.');
            toast({
                title: 'Save failed',
                description: submitError?.message || 'Unable to save customer.',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary-700 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm" className="rounded -ml-2 text-gray-500 hover:text-gray-900">
                        <Link href="/admin/customers">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold text-gray-900">
                        {isEdit ? 'Edit Customer' : 'Add Customer'}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button size="sm" className="rounded bg-primary-900 text-white hover:bg-primary-800" onClick={() => handleSubmit(new Event('submit') as any)} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded bg-white p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-1">Customer Information</h2>
                    <p className="text-xs text-gray-500 mb-5">Most important information about the customer</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">First Name</label>
                            <Input
                                value={formData.firstName}
                                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                className="rounded"
                                placeholder="Enter first name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Last Name</label>
                            <Input
                                value={formData.lastName}
                                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                className="rounded"
                                placeholder="Enter last name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                className="rounded"
                                placeholder="Enter email address"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number</label>
                            <Input
                                value={formData.phoneNumber}
                                onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                                className="rounded"
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded bg-white p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-1">Customer Address</h2>
                    <p className="text-xs text-gray-500 mb-5">Shipping address information</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Address</label>
                            <Input
                                value={formData.address}
                                onChange={(e) => handleFieldChange('address', e.target.value)}
                                className="rounded"
                                placeholder="Street address"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Apartment</label>
                            <Input
                                value={formData.apartment}
                                onChange={(e) => handleFieldChange('apartment', e.target.value)}
                                className="rounded"
                                placeholder="Apartment, suite, etc."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">City</label>
                            <Input
                                value={formData.city}
                                onChange={(e) => handleFieldChange('city', e.target.value)}
                                className="rounded"
                                placeholder="City"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Country</label>
                                <Select value={formData.country} onValueChange={(value) => handleFieldChange('country', value)}>
                                    <SelectTrigger className="rounded">
                                        <SelectValue placeholder="Choose" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COUNTRIES.map((country) => (
                                            <SelectItem key={country.value} value={country.value}>
                                                {country.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Postal Code</label>
                                <Input
                                    value={formData.postalCode}
                                    onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                                    className="rounded"
                                    placeholder="Postal code"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone</label>
                            <Input
                                value={formData.addressPhone}
                                onChange={(e) => handleFieldChange('addressPhone', e.target.value)}
                                className="rounded"
                                placeholder="Phone number"
                            />
                        </div>
                    </div>
                </div>

                {!isEdit && (
                    <div className="rounded bg-white p-6">
                        <h2 className="text-sm font-semibold text-gray-900 mb-1">Password</h2>
                        <p className="text-xs text-gray-500 mb-5">Set customer login credentials</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleFieldChange('password', e.target.value)}
                                    className="rounded"
                                    placeholder="Enter password"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm Password</label>
                                <Input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                                    className="rounded"
                                    placeholder="Confirm password"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="rounded bg-white p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-1">Customer Notes</h2>
                    <p className="text-xs text-gray-500 mb-5">Add notes about customer</p>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Notes</label>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => handleFieldChange('notes', e.target.value)}
                            className="rounded resize-none"
                            placeholder="Add notes about customer"
                            rows={4}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" size="sm" className="rounded" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" size="sm" className="rounded bg-primary-900 text-white hover:bg-primary-800" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
}
