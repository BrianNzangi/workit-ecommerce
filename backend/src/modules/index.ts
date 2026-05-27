import { FastifyPluginAsync } from "fastify";
import { analyticsRoutes } from "./analytics/index.js";
import { authRoutes } from "./auth/index.js";
import { assetsRoutes } from "./catalog/assets/index.js";
import { brandsRoutes } from "./catalog/brands/index.js";
import { collectionsRoutes } from "./catalog/collections/index.js";
import { productsRoutes } from "./catalog/products/index.js";
import { ordersRoutes } from "./fulfillment/orders/index.js";
import { shippingRoutes } from "./fulfillment/shipping/index.js";
import { customersRoutes } from "./identity/customers/index.js";
import { usersRoutes } from "./identity/users/index.js";
import { promotionsRoutes } from "./promotions/index.js";
import { marketingRoutes } from "./marketing/index.js";
import { brevoRoutes } from "./site/brevo/index.js";
import { settingsRoutes } from "./site/settings/index.js";
import { storeRoutes } from "./site/store/index.js";
import { cartRoutes } from "./cart/index.js";
import { checkoutRoutes } from "./checkout/index.js";
import { cronRoutes } from "./cron/index.js";
import { featureFlags, isRouteMigrationEnabled } from "../infrastructure/feature-flags/flags.js";
import { checkoutRoutes as dddCheckoutRoutes } from "../presentation/modules/checkout/index.js";
import { catalogRoutes as dddCatalogRoutes } from "../presentation/modules/catalog/index.js";
import { identityRoutes as dddIdentityRoutes } from "../presentation/modules/identity/index.js";
import { cartRoutes as dddCartRoutes } from "../presentation/modules/cart/index.js";
import { shippingRoutes as dddShippingRoutes } from "../presentation/modules/fulfillment/shipping/index.js";
import { ordersRoutes as dddOrdersRoutes } from "../presentation/modules/fulfillment/orders/index.js";

export const appModules: FastifyPluginAsync = async (fastify) => {
    const useDDDOrderManagement = isRouteMigrationEnabled(featureFlags.useDDDOrderManagement);
    const useDDDCatalog = isRouteMigrationEnabled(featureFlags.useDDDCatalog);
    const useDDDCustomer = isRouteMigrationEnabled(featureFlags.useDDDCustomer);
    const useDDDFulfillment = isRouteMigrationEnabled(featureFlags.useDDDFulfillment);


    // Analytics
    await fastify.register(analyticsRoutes, { prefix: "/analytics" });

    // Auth (Admin)
    await fastify.register(authRoutes, { prefix: "/auth" });
    await fastify.register(authRoutes, { prefix: "/api/auth" });

    // Catalog
    if (useDDDCatalog) {
        await fastify.register(dddCatalogRoutes, { prefix: "/catalog/products" });
    } else {
        await fastify.register(productsRoutes, { prefix: "/catalog/products" });
    }
    await fastify.register(brandsRoutes, { prefix: "/catalog/brands" });
    await fastify.register(collectionsRoutes, { prefix: "/catalog/collections" });
    await fastify.register(assetsRoutes, { prefix: "/catalog/assets" });

    // Fulfillment
    if (useDDDFulfillment || useDDDOrderManagement) {
        await fastify.register(dddOrdersRoutes, { prefix: "/fulfillment/orders" });
        await fastify.register(dddShippingRoutes, { prefix: "/fulfillment/shipping" });
    } else {
        await fastify.register(ordersRoutes, { prefix: "/fulfillment/orders" });
        await fastify.register(shippingRoutes, { prefix: "/fulfillment/shipping" });
    }

    // Identity
    if (useDDDCustomer) {
        await fastify.register(dddIdentityRoutes, { prefix: "/identity/customers" });
    } else {
        await fastify.register(customersRoutes, { prefix: "/identity/customers" });
    }
    await fastify.register(usersRoutes, { prefix: "/identity/users" });

    // Promotions
    await fastify.register(promotionsRoutes, { prefix: "/promotions" });
    await fastify.register(promotionsRoutes, { prefix: "/api/promotions" });

    // Marketing (Content Management)
    await fastify.register(marketingRoutes, { prefix: "/marketing" });

    // Site / Storefront
    await fastify.register(brevoRoutes, { prefix: "/site/brevo" });
    await fastify.register(settingsRoutes, { prefix: "/site/settings" });

    // Storefront Public API
    await fastify.register(storeRoutes, { prefix: "/store" });
    // Backward-compatible public API aliases
    await fastify.register(storeRoutes, { prefix: "/api" });

    // Cart
    if (useDDDOrderManagement) {
        await fastify.register(dddCartRoutes, { prefix: "/cart" });
        await fastify.register(dddCartRoutes, { prefix: "/api/cart" });
    } else {
        await fastify.register(cartRoutes, { prefix: "/cart" });
        // Backward-compatible public API alias
        await fastify.register(cartRoutes, { prefix: "/api/cart" });
    }

    // Checkout
    if (useDDDOrderManagement) {
        await fastify.register(dddCheckoutRoutes, { prefix: "/checkout" });
        await fastify.register(dddCheckoutRoutes, { prefix: "/api/checkout" });
    } else {
        await fastify.register(checkoutRoutes, { prefix: "/checkout" });
        // Backward-compatible public API alias
        await fastify.register(checkoutRoutes, { prefix: "/api/checkout" });
    }

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
                    "site/brevo",
                    "site/settings",
                    "site/store",
                    "admin fulfillment routes",
                ],
            },
            "V2_ONLY mode is enabled, but some routes still rely on legacy handlers inside backend",
        );
    }
};

export default appModules;
