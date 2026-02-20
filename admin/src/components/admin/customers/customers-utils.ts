import { CustomerRecord } from './types';

export const getCustomerName = (customer: CustomerRecord): string => {
    const firstName = customer.firstName?.trim() || '';
    const lastName = customer.lastName?.trim() || '';
    const combined = `${firstName} ${lastName}`.trim();

    if (combined) return combined;
    if (customer.name?.trim()) return customer.name.trim();
    return 'Unnamed Customer';
};

export const getCustomerInitials = (customer: CustomerRecord): string => {
    const firstName = customer.firstName?.trim() || '';
    const lastName = customer.lastName?.trim() || '';

    if (firstName || lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'C';
    }

    const fallback = customer.name?.trim() || customer.email || 'C';
    return fallback.charAt(0).toUpperCase();
};

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
