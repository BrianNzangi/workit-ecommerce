/**
 * Unit tests for CustomerService.searchCustomers
 *
 * Validates: Requirements 6.1
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the clients module before importing the service
vi.mock('@/lib/clients', () => {
    const customersListMock = vi.fn();
    return {
        adminClient: {
            customers: {
                list: customersListMock,
            },
        },
        apiClient: {},
    };
});

import { CustomerService } from './customer.service';
import { adminClient } from '@/lib/clients';

describe('CustomerService.searchCustomers', () => {
    let service: CustomerService;
    let customersListSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        service = new CustomerService();
        customersListSpy = adminClient.customers.list as ReturnType<typeof vi.fn>;
        customersListSpy.mockReset();
    });

    it('calls customers.list with { q: searchTerm } when searching', async () => {
        const mockCustomers = [
            { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
            { id: '2', firstName: 'Johnny', lastName: 'Smith', email: 'johnny@example.com' },
        ];
        customersListSpy.mockResolvedValue(mockCustomers);

        await service.searchCustomers('john');

        expect(customersListSpy).toHaveBeenCalledOnce();
        expect(customersListSpy).toHaveBeenCalledWith({ q: 'john' });
    });

    it('returns the raw array from the backend without local filtering', async () => {
        // The mock returns customers whose names do NOT contain the search term —
        // if local filtering were applied, the result would be empty.
        const mockCustomers = [
            { id: '1', firstName: 'Alice', lastName: 'Wonder', email: 'alice@example.com' },
            { id: '2', firstName: 'Bob', lastName: 'Builder', email: 'bob@example.com' },
        ];
        customersListSpy.mockResolvedValue(mockCustomers);

        const result = await service.searchCustomers('john');

        // All items returned by the backend are passed through as-is
        expect(result).toEqual(mockCustomers);
        expect(result).toHaveLength(2);
    });

    it('unwraps a { customers: [...] } envelope when the backend returns one', async () => {
        const mockCustomers = [
            { id: '3', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
        ];
        customersListSpy.mockResolvedValue({ customers: mockCustomers, total: 1 });

        const result = await service.searchCustomers('jane');

        expect(result).toEqual(mockCustomers);
    });

    it('forwards additional options alongside the q param', async () => {
        customersListSpy.mockResolvedValue([]);

        await service.searchCustomers('alice', { take: 10, skip: 0 } as any);

        expect(customersListSpy).toHaveBeenCalledWith({ q: 'alice', take: 10, skip: 0 });
    });

    it('returns an empty array when the backend returns an empty list', async () => {
        customersListSpy.mockResolvedValue([]);

        const result = await service.searchCustomers('nobody');

        expect(result).toEqual([]);
    });
});
