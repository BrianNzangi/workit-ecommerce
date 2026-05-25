/**
 * Property test for searchProductsEnhanced – empty search term short-circuit.
 *
 * Property 6: Empty search term returns empty array without backend call
 * Validates: Requirements 3.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal auth context that passes requireAuth */
const authedContext = () => ({
    auth: {
        user: { id: 'user-1', role: 'admin' },
        session: {},
        isAuthenticated: true,
    } as any,
});

// ---------------------------------------------------------------------------
// Mock ProductService so we can verify no HTTP call is made
// ---------------------------------------------------------------------------

const mockSearchProductsEnhanced = vi.fn();

vi.mock('@/lib/services', () => {
    return {
        ProductService: vi.fn().mockImplementation(() => ({
            searchProductsEnhanced: mockSearchProductsEnhanced,
        })),
        // re-export other types as no-ops
    };
});

// Mock next/headers to avoid Next.js server-only import errors in test env
vi.mock('next/headers', () => ({
    headers: vi.fn().mockResolvedValue(new Map()),
    cookies: vi.fn().mockResolvedValue(new Map()),
}));

import { productQueries } from '../product.queries';

// ---------------------------------------------------------------------------
// Property 6: Empty search term returns empty array without backend call
// Validates: Requirements 3.3
// ---------------------------------------------------------------------------

describe('searchProductsEnhanced – empty search term short-circuit (Property 6)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    /**
     * For any authenticated context, calling searchProductsEnhanced with an
     * empty string MUST return [] and MUST NOT call the backend service.
     */
    it('returns [] and makes no backend call when searchTerm is empty string', async () => {
        const context = authedContext();

        const result = await productQueries.searchProductsEnhanced(
            null,
            { searchTerm: '' },
            context
        );

        expect(result).toEqual([]);
        expect(mockSearchProductsEnhanced).not.toHaveBeenCalled();
    });

    /**
     * Property: for any options object, an empty searchTerm always short-circuits.
     * The backend service is never called regardless of what options are passed.
     */
    it('never calls backend for empty searchTerm regardless of options (property)', async () => {
        await fc.assert(
            fc.asyncProperty(
                // Generate arbitrary options objects (or undefined)
                fc.option(
                    fc.record({
                        limit: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
                        offset: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: undefined }),
                    }),
                    { nil: undefined }
                ),
                async (options) => {
                    vi.clearAllMocks();
                    const context = authedContext();

                    const result = await productQueries.searchProductsEnhanced(
                        null,
                        { searchTerm: '', options: options ?? undefined },
                        context
                    );

                    // Must return empty array
                    expect(result).toEqual([]);
                    // Must NOT have called the backend
                    expect(mockSearchProductsEnhanced).not.toHaveBeenCalled();
                }
            )
        );
    });

    /**
     * Contrast: a non-empty searchTerm DOES call the backend service.
     * This confirms the short-circuit only applies to empty strings.
     */
    it('calls backend when searchTerm is non-empty', async () => {
        mockSearchProductsEnhanced.mockResolvedValue([{ id: 'p1', name: 'Widget' }]);

        const context = authedContext();

        const result = await productQueries.searchProductsEnhanced(
            null,
            { searchTerm: 'widget' },
            context
        );

        expect(mockSearchProductsEnhanced).toHaveBeenCalledWith('widget', undefined);
        expect(result).toEqual([{ id: 'p1', name: 'Widget' }]);
    });
});
