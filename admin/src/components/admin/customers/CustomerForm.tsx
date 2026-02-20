'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { CustomerService } from '@/lib/services/customers/customer.service';
import {
    CustomerDetailsCard,
    CustomerFormData,
    CustomerFormError,
    CustomerFormHeader,
    CustomerFormMode,
    CustomerFormSkeleton,
    CustomerSaveCard,
    CustomerSecurityCard,
} from './form';

const initialFormData: CustomerFormData = {
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
};

interface CustomerFormProps {
    mode?: CustomerFormMode;
    customerId?: string;
}

function normalizeCustomerPayload(payload: any) {
    return payload?.customer || payload;
}

function buildCustomerName(firstName: string, lastName: string, email: string) {
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || email;
}

export function CustomerForm({ mode = 'create', customerId }: CustomerFormProps) {
    const router = useRouter();
    const isEdit = mode === 'edit';

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CustomerFormData>(initialFormData);

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

                setFormData((previous) => ({
                    ...previous,
                    email: customer.email || '',
                    firstName: customer.firstName || '',
                    lastName: customer.lastName || '',
                    phoneNumber: customer.phoneNumber || '',
                    password: '',
                    confirmPassword: '',
                }));
            } catch (loadError: any) {
                setError(loadError?.message || 'Failed to load customer.');
            } finally {
                setFetchLoading(false);
            }
        };

        loadCustomer();
    }, [customerId, isEdit]);

    const handleFieldChange = (field: keyof CustomerFormData, value: string) => {
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
                name: buildCustomerName(formData.firstName.trim(), formData.lastName.trim(), formData.email.trim()),
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

    return (
        <>
            <CustomerFormHeader mode={mode} />

            {fetchLoading ? (
                <CustomerFormSkeleton />
            ) : (
                <form onSubmit={handleSubmit} className="w-full">
                    <CustomerFormError message={error} />

                    <div className="grid w-full grid-cols-1 items-start gap-6 xl:grid-cols-12">
                        <div className="min-w-0 space-y-6 xl:col-span-8">
                            <CustomerDetailsCard
                                formData={formData}
                                disabled={loading}
                                onFieldChange={handleFieldChange}
                            />

                            {!isEdit ? (
                                <CustomerSecurityCard
                                    formData={formData}
                                    disabled={loading}
                                    onFieldChange={handleFieldChange}
                                />
                            ) : null}
                        </div>

                        <div className="space-y-6 xl:col-span-4 xl:sticky xl:top-6">
                            <CustomerSaveCard mode={mode} loading={loading} />
                        </div>
                    </div>
                </form>
            )}
        </>
    );
}
