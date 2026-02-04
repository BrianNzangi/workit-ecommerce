import { scalarResolvers } from './scalars';
import { authQueries } from './auth/auth.queries';
import { authMutations } from './auth/auth.mutations';
import { productQueries } from './products/product.queries';
import { productMutations } from './products/product.mutations';
import { variantMutations } from './products/variant.mutations';
import { collectionQueries } from './collections/collection.queries';
import { collectionMutations } from './collections/collection.mutations';
import { homepageQueries } from './homepage/homepage.queries';
import { homepageMutations } from './homepage/homepage.mutations';
import { blogQueries } from './blog/blog.queries';
import { blogMutations } from './blog/blog.mutations';
import { bannerQueries } from './banners/banner.queries';
import { bannerMutations } from './banners/banner.mutations';
import { customerQueries } from './customers/customer.queries';
import { customerMutations } from './customers/customer.mutations';
import { addressMutations } from './customers/address.mutations';
import { orderQueries } from './orders/order.queries';
import { orderMutations } from './orders/order.mutations';
import { inventoryQueries } from './orders/inventory.queries';
import { paymentQueries } from './payments/payment.queries';
import { paymentMutations } from './payments/payment.mutations';
import { shippingQueries } from './shipping/shipping.queries';
import { shippingMutations } from './shipping/shipping.mutations';
import { assetQueries } from './assets/asset.queries';
import { assetMutations } from './assets/asset.mutations';
import { analyticsQueries } from './analytics/analytics.queries';

export const resolvers = {
    // Scalars
    ...scalarResolvers,

    // Queries
    Query: {
        _health: () => 'OK',

        // Auth
        ...authQueries,

        // Products
        ...productQueries,

        // Collections
        ...collectionQueries,

        // Homepage
        ...homepageQueries,

        // Blog
        ...blogQueries,

        // Banners
        ...bannerQueries,

        // Customers
        ...customerQueries,

        // Orders
        ...orderQueries,
        ...inventoryQueries,

        // Payments
        ...paymentQueries,

        // Shipping
        ...shippingQueries,

        // Assets
        ...assetQueries,

        // Analytics
        ...analyticsQueries,
    },

    // Mutations
    Mutation: {
        _ping: () => 'PONG',

        // Auth
        ...authMutations,

        // Products
        ...productMutations,
        ...variantMutations,

        // Collections
        ...collectionMutations,

        // Homepage
        ...homepageMutations,

        // Blog
        ...blogMutations,

        // Banners
        ...bannerMutations,

        // Customers
        ...customerMutations,
        ...addressMutations,

        // Orders
        ...orderMutations,

        // Payments
        ...paymentMutations,

        // Shipping
        ...shippingMutations,

        // Assets
        ...assetMutations,
    },
};
