import { CustomerRecord, OrderRecord } from '../types';
import { CustomerSegment } from './types';

const safeDate = (value?: string | null): number => {
    if (!value) return 0;
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
};

export const buildCustomerSegments = (
    customers: CustomerRecord[],
    orders: OrderRecord[]
): CustomerSegment[] => {
    const totalCustomers = customers.length;
    const cutoff30 = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const orderCountByCustomer = orders.reduce<Record<string, number>>((acc, order) => {
        if (!order.customerId) return acc;
        acc[order.customerId] = (acc[order.customerId] || 0) + 1;
        return acc;
    }, {});

    const withPercent = (count: number) => {
        if (totalCustomers === 0) return 0;
        return Math.round((count / totalCustomers) * 1000) / 10;
    };

    const activeCustomers = customers.filter((customer) => customer.enabled !== false).length;
    const newInLast30Days = customers.filter((customer) => safeDate(customer.createdAt) >= cutoff30).length;
    const withAtLeastOneOrder = customers.filter((customer) => (orderCountByCustomer[customer.id] || 0) >= 1).length;
    const repeatCustomers = customers.filter((customer) => (orderCountByCustomer[customer.id] || 0) > 1).length;
    const withoutOrders = totalCustomers - withAtLeastOneOrder;

    return [
        {
            id: 'all-customers',
            name: 'All customers',
            description: 'Every customer account in your store',
            customerCount: totalCustomers,
            percentage: withPercent(totalCustomers),
            source: 'auto',
        },
        {
            id: 'active-customers',
            name: 'Active customers',
            description: 'Customers currently marked as enabled',
            customerCount: activeCustomers,
            percentage: withPercent(activeCustomers),
            source: 'auto',
        },
        {
            id: 'new-30-days',
            name: 'New customers (30 days)',
            description: 'Customers registered in the last 30 days',
            customerCount: newInLast30Days,
            percentage: withPercent(newInLast30Days),
            source: 'auto',
        },
        {
            id: 'purchased-at-least-once',
            name: 'Purchased at least once',
            description: 'Customers with one or more orders',
            customerCount: withAtLeastOneOrder,
            percentage: withPercent(withAtLeastOneOrder),
            source: 'auto',
        },
        {
            id: 'repeat-customers',
            name: 'Repeat customers',
            description: 'Customers with more than one order',
            customerCount: repeatCustomers,
            percentage: withPercent(repeatCustomers),
            source: 'auto',
        },
        {
            id: 'no-purchase-yet',
            name: "Haven't purchased yet",
            description: 'Customers with no orders yet',
            customerCount: withoutOrders,
            percentage: withPercent(withoutOrders),
            source: 'auto',
        },
    ];
};
