/**
 * Property tests for variant mutations error mapping.
 *
 * Validates: Requirements 1.4, 14.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { ErrorCode } from '@/lib/graphql/errors';

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

/**
 * Simulate the HttpClient throwing a 404 error object.
 * The HttpClient throws plain objects: { statusCode, message }.
 */
function make404Error(message = 'Not found') {
    return { statusCode: 404, message };
}

// ---------------------------------------------------------------------------
// Mock ProductService so we can control what it throws
// ---------------------------------------------------------------------------

vi.mock('@/lib/services/products/product.service', () => {
    return {
        ProductService: vi.fn().mockImplementation(() => ({
            addVariant: vi.fn(),
            updateVariant: vi.fn(),
            updateVariantStock: vi.fn(),
        })),
    };
});

// Mock next/headers to avoid Next.js server-only import errors in test env
vi.mock('next/headers', () => ({
    headers: vi.fn().mockResolvedValue(new Map()),
    cookies: vi.fn().mockResolvedValue(new Map()),
}));

import { variantMutations } from '../variant.mutations';
import { ProductService } from '@/lib/services/products/product.service';

// ---------------------------------------------------------------------------
// Property 1: HTTP 404 always maps to NOT_FOUND
// Validates: Requirements 1.4, 14.3
// ---------------------------------------------------------------------------

describe('variant mutations – HTTP 404 → NOT_FOUND (Property 1)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    /**
     * For addVariantToProduct: any 404 error message should produce NOT_FOUND.
     */
    it('addVariantToProduct: HTTP 404 with any message always maps to NOT_FOUND', async () => {
        await fc.assert(
            fc.asyncProperty(fc.string(), async (errorMessage) => {
                const MockedService = ProductService as any;
                MockedService.mockImplementation(() => ({
                    addVariant: vi.fn().mockRejectedValue(make404Error(errorMessage)),
                    updateVariant: vi.fn(),
                    updateVariantStock: vi.fn(),
                }));

                const context = authedContext();
                const input = { productId: 'prod-1', name: 'Variant', price: 100 };

                let caughtError: any;
                try {
                    await variantMutations.addVariantToProduct(null, { input }, context);
                } catch (e) {
                    caughtError = e;
                }

                expect(caughtError).toBeDefined();
                expect(caughtError.extensions?.code).toBe(ErrorCode.NOT_FOUND);
            })
        );
    });

    /**
     * For updateVariant: any 404 error message should produce NOT_FOUND.
     */
    it('updateVariant: HTTP 404 with any message always maps to NOT_FOUND', async () => {
        await fc.assert(
            fc.asyncProperty(fc.string(), async (errorMessage) => {
                const MockedService = ProductService as any;
                MockedService.mockImplementation(() => ({
                    addVariant: vi.fn(),
                    updateVariant: vi.fn().mockRejectedValue(make404Error(errorMessage)),
                    updateVariantStock: vi.fn(),
                }));

                const context = authedContext();

                let caughtError: any;
                try {
                    await variantMutations.updateVariant(null, { id: 'var-1', input: {} }, context);
                } catch (e) {
                    caughtError = e;
                }

                expect(caughtError).toBeDefined();
                expect(caughtError.extensions?.code).toBe(ErrorCode.NOT_FOUND);
            })
        );
    });

    /**
     * For updateVariantStock: any 404 error message should produce NOT_FOUND.
     */
    it('updateVariantStock: HTTP 404 with any message always maps to NOT_FOUND', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string(),
                fc.integer({ min: 0, max: 10000 }),
                async (errorMessage, stockOnHand) => {
                    const MockedService = ProductService as any;
                    MockedService.mockImplementation(() => ({
                        addVariant: vi.fn(),
                        updateVariant: vi.fn(),
                        updateVariantStock: vi.fn().mockRejectedValue(make404Error(errorMessage)),
                    }));

                    const context = authedContext();

                    let caughtError: any;
                    try {
                        await variantMutations.updateVariantStock(
                            null,
                            { id: 'var-1', stockOnHand },
                            context
                        );
                    } catch (e) {
                        caughtError = e;
                    }

                    expect(caughtError).toBeDefined();
                    expect(caughtError.extensions?.code).toBe(ErrorCode.NOT_FOUND);
                }
            )
        );
    });
});
