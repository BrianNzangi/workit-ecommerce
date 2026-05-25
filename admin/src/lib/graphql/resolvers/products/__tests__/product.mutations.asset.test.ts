/**
 * Unit tests for product asset mutations.
 *
 * Tests:
 *   - addAssetToProduct returns ProductAsset
 *   - removeAssetFromProduct returns true
 *   - setFeaturedAsset returns updated ProductAsset
 *
 * Validates: Requirements 2.1, 2.2, 2.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
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

/** Build an unauthenticated context */
const unauthContext = () => ({
    auth: null as any,
});

// ---------------------------------------------------------------------------
// Mock ProductService
// ---------------------------------------------------------------------------

const mockAddAsset = vi.fn();
const mockRemoveAsset = vi.fn();
const mockSetFeaturedAsset = vi.fn();

vi.mock('@/lib/services', () => {
    return {
        ProductService: vi.fn().mockImplementation(() => ({
            addAsset: mockAddAsset,
            removeAsset: mockRemoveAsset,
            setFeaturedAsset: mockSetFeaturedAsset,
            // other methods not needed for these tests
            createProduct: vi.fn(),
            updateProduct: vi.fn(),
            deleteProduct: vi.fn(),
        })),
        // re-export CreateProductInput type (not a value, so no-op)
    };
});

// Mock next/headers to avoid Next.js server-only import errors in test env
vi.mock('next/headers', () => ({
    headers: vi.fn().mockResolvedValue(new Map()),
    cookies: vi.fn().mockResolvedValue(new Map()),
}));

import { productMutations } from '../product.mutations';

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const PRODUCT_ID = 'prod-abc';
const ASSET_ID = 'asset-xyz';

const mockProductAsset = {
    id: 'pa-1',
    productId: PRODUCT_ID,
    assetId: ASSET_ID,
    sortOrder: 0,
    featured: false,
    asset: {
        id: ASSET_ID,
        url: 'https://example.com/image.jpg',
        mimeType: 'image/jpeg',
    },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('productMutations – asset operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    // addAssetToProduct
    // -------------------------------------------------------------------------

    describe('addAssetToProduct', () => {
        it('returns the created ProductAsset on success', async () => {
            mockAddAsset.mockResolvedValue(mockProductAsset);

            const result = await productMutations.addAssetToProduct(
                null,
                { productId: PRODUCT_ID, assetId: ASSET_ID, sortOrder: 0, featured: false },
                authedContext()
            );

            expect(result).toEqual(mockProductAsset);
            expect(mockAddAsset).toHaveBeenCalledWith(PRODUCT_ID, {
                assetId: ASSET_ID,
                sortOrder: 0,
                featured: false,
            });
        });

        it('passes optional sortOrder and featured when provided', async () => {
            const assetWithSort = { ...mockProductAsset, sortOrder: 3, featured: true };
            mockAddAsset.mockResolvedValue(assetWithSort);

            const result = await productMutations.addAssetToProduct(
                null,
                { productId: PRODUCT_ID, assetId: ASSET_ID, sortOrder: 3, featured: true },
                authedContext()
            );

            expect(result).toEqual(assetWithSort);
            expect(mockAddAsset).toHaveBeenCalledWith(PRODUCT_ID, {
                assetId: ASSET_ID,
                sortOrder: 3,
                featured: true,
            });
        });

        it('maps HTTP 404 to NOT_FOUND error', async () => {
            mockAddAsset.mockRejectedValue({ statusCode: 404, message: 'Product not found' });

            let caughtError: any;
            try {
                await productMutations.addAssetToProduct(
                    null,
                    { productId: PRODUCT_ID, assetId: ASSET_ID },
                    authedContext()
                );
            } catch (e) {
                caughtError = e;
            }

            expect(caughtError).toBeDefined();
            expect(caughtError.extensions?.code).toBe(ErrorCode.NOT_FOUND);
        });

        it('throws UNAUTHORIZED when called without auth', async () => {
            let caughtError: any;
            try {
                await productMutations.addAssetToProduct(
                    null,
                    { productId: PRODUCT_ID, assetId: ASSET_ID },
                    unauthContext()
                );
            } catch (e) {
                caughtError = e;
            }

            expect(caughtError).toBeDefined();
            // requireAuth throws before any service call
            expect(mockAddAsset).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    // removeAssetFromProduct
    // -------------------------------------------------------------------------

    describe('removeAssetFromProduct', () => {
        it('returns true on successful removal', async () => {
            mockRemoveAsset.mockResolvedValue(true);

            const result = await productMutations.removeAssetFromProduct(
                null,
                { productId: PRODUCT_ID, assetId: ASSET_ID },
                authedContext()
            );

            expect(result).toBe(true);
            expect(mockRemoveAsset).toHaveBeenCalledWith(PRODUCT_ID, ASSET_ID);
        });

        it('maps HTTP 404 to NOT_FOUND error', async () => {
            mockRemoveAsset.mockRejectedValue({ statusCode: 404, message: 'Asset not found' });

            let caughtError: any;
            try {
                await productMutations.removeAssetFromProduct(
                    null,
                    { productId: PRODUCT_ID, assetId: ASSET_ID },
                    authedContext()
                );
            } catch (e) {
                caughtError = e;
            }

            expect(caughtError).toBeDefined();
            expect(caughtError.extensions?.code).toBe(ErrorCode.NOT_FOUND);
        });

        it('maps HTTP 400 to VALIDATION_ERROR', async () => {
            mockRemoveAsset.mockRejectedValue({ statusCode: 400, message: 'Invalid asset ID' });

            let caughtError: any;
            try {
                await productMutations.removeAssetFromProduct(
                    null,
                    { productId: PRODUCT_ID, assetId: ASSET_ID },
                    authedContext()
                );
            } catch (e) {
                caughtError = e;
            }

            expect(caughtError).toBeDefined();
            expect(caughtError.extensions?.code).toBe(ErrorCode.VALIDATION_ERROR);
        });

        it('throws UNAUTHORIZED when called without auth', async () => {
            let caughtError: any;
            try {
                await productMutations.removeAssetFromProduct(
                    null,
                    { productId: PRODUCT_ID, assetId: ASSET_ID },
                    unauthContext()
                );
            } catch (e) {
                caughtError = e;
            }

            expect(caughtError).toBeDefined();
            expect(mockRemoveAsset).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    // setFeaturedAsset
    // -------------------------------------------------------------------------

    describe('setFeaturedAsset', () => {
        it('returns the updated ProductAsset on success', async () => {
            const featuredAsset = { ...mockProductAsset, featured: true };
            mockSetFeaturedAsset.mockResolvedValue(featuredAsset);

            const result = await productMutations.setFeaturedAsset(
                null,
                { productId: PRODUCT_ID, assetId: ASSET_ID },
                authedContext()
            );

            expect(result).toEqual(featuredAsset);
            expect(mockSetFeaturedAsset).toHaveBeenCalledWith(PRODUCT_ID, ASSET_ID);
        });

        it('maps HTTP 404 to NOT_FOUND error', async () => {
            mockSetFeaturedAsset.mockRejectedValue({ statusCode: 404, message: 'Asset not found' });

            let caughtError: any;
            try {
                await productMutations.setFeaturedAsset(
                    null,
                    { productId: PRODUCT_ID, assetId: ASSET_ID },
                    authedContext()
                );
            } catch (e) {
                caughtError = e;
            }

            expect(caughtError).toBeDefined();
            expect(caughtError.extensions?.code).toBe(ErrorCode.NOT_FOUND);
        });

        it('maps HTTP 500 to INTERNAL_ERROR', async () => {
            mockSetFeaturedAsset.mockRejectedValue({ statusCode: 500, message: 'Server error' });

            let caughtError: any;
            try {
                await productMutations.setFeaturedAsset(
                    null,
                    { productId: PRODUCT_ID, assetId: ASSET_ID },
                    authedContext()
                );
            } catch (e) {
                caughtError = e;
            }

            expect(caughtError).toBeDefined();
            expect(caughtError.extensions?.code).toBe(ErrorCode.INTERNAL_ERROR);
        });

        it('throws UNAUTHORIZED when called without auth', async () => {
            let caughtError: any;
            try {
                await productMutations.setFeaturedAsset(
                    null,
                    { productId: PRODUCT_ID, assetId: ASSET_ID },
                    unauthContext()
                );
            } catch (e) {
                caughtError = e;
            }

            expect(caughtError).toBeDefined();
            expect(mockSetFeaturedAsset).not.toHaveBeenCalled();
        });
    });
});
