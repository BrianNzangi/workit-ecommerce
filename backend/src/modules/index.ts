import { FastifyPluginAsync } from "fastify";
import { analyticsRoutes } from "./analytics/index.js";
import { authRoutes } from "./auth/index.js";
import { assetsRoutes } from "./catalog/assets/index.js";
import { brandsRoutes } from "./catalog/brands/index.js";
import { collectionsRoutes } from "./catalog/collections/index.js";
import { usersRoutes } from "./identity/users/index.js";
import { settingsRoutes } from "./site/settings/index.js";
import { storeRoutes } from "./site/store/index.js";
import { reviewsRoutes } from "./reviews/index.js";
import { cronRoutes } from "./cron/index.js";
import { featureFlags } from "../infrastructure/feature-flags/flags.js";
import { catalogRoutes as dddCatalogRoutes } from "../presentation/modules/catalog/index.js";
import { identityRoutes as dddIdentityRoutes } from "../presentation/modules/identity/index.js";
import { cartRoutes as dddCartRoutes } from "../presentation/modules/cart/index.js";
import { checkoutRoutes as dddCheckoutRoutes } from "../presentation/modules/checkout/index.js";
import { shippingRoutes as dddShippingRoutes } from "../presentation/modules/fulfillment/shipping/index.js";
import { ordersRoutes as dddOrdersRoutes } from "../presentation/modules/fulfillment/orders/index.js";
import { promotionsRoutes as dddPromotionsRoutes } from "../presentation/modules/promotions/index.js";
import { marketingRoutes as dddMarketingRoutes } from "../presentation/modules/marketing/index.js";

export const appModules: FastifyPluginAsync = async (fastify) => {

    // Analytics
    await fastify.register(analyticsRoutes, { prefix: "/analytics" });

    // Auth (Admin)
    await fastify.register(authRoutes, { prefix: "/auth" });
    await fastify.register(authRoutes, { prefix: "/api/auth" });

    // Catalog
    await fastify.register(dddCatalogRoutes, { prefix: "/catalog/products" });
    await fastify.register(brandsRoutes, { prefix: "/catalog/brands" });
    await fastify.register(collectionsRoutes, { prefix: "/catalog/collections" });
    await fastify.register(assetsRoutes, { prefix: "/catalog/assets" });

    // Fulfillment
    await fastify.register(dddOrdersRoutes, { prefix: "/fulfillment/orders" });
    await fastify.register(dddShippingRoutes, { prefix: "/fulfillment/shipping" });

    // Identity
    await fastify.register(dddIdentityRoutes, { prefix: "/identity/customers" });
    await fastify.register(usersRoutes, { prefix: "/identity/users" });

    // Promotions
    await fastify.register(dddPromotionsRoutes, { prefix: "/promotions" });
    await fastify.register(dddPromotionsRoutes, { prefix: "/api/promotions" });

    // Marketing (Content Management)
    await fastify.register(dddMarketingRoutes, { prefix: "/marketing" });

    // Reviews
    await fastify.register(reviewsRoutes, { prefix: "/catalog/reviews" });

    // Site / Storefront
    await fastify.register(settingsRoutes, { prefix: "/site/settings" });

    // Storefront Public API
    await fastify.register(storeRoutes, { prefix: "/store" });
    await fastify.register(storeRoutes, { prefix: "/api" });

    // Cart
    await fastify.register(dddCartRoutes, { prefix: "/cart" });
    await fastify.register(dddCartRoutes, { prefix: "/api/cart" });

    // Checkout
    await fastify.register(dddCheckoutRoutes, { prefix: "/checkout" });
    await fastify.register(dddCheckoutRoutes, { prefix: "/api/checkout" });

    // Cron Jobs
    await fastify.register(cronRoutes, { prefix: "/cron" });

    if (featureFlags.v2OnlyMode) {
        fastify.log.warn(
            {
                legacyContextsStillActive: [
                    "auth",
                    "analytics",
                    "catalog brands",
                    "catalog collections",
                    "catalog assets",
                    "identity users",
                    "marketing",
                    "site/settings",
                    "site/store",
                ],
            },
            "V2_ONLY mode is enabled, but some routes still rely on legacy handlers inside backend",
        );
    }
};

export default appModules;
