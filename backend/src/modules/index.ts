import { FastifyPluginAsync } from "fastify";
import { analyticsRoutes } from "./analytics/index.js";
import { authRoutes } from "./auth/index.js";
import { assetsRoutes } from "./catalog/assets/index.js";
import { brandsRoutes } from "./catalog/brands/index.js";
import { collectionsRoutes } from "./catalog/collections/index.js";
import { productsRoutes } from "./catalog/products/index.js";
import { customerAuthRoutes } from "./customer-auth/index.js";
import { ordersRoutes } from "./fulfillment/orders/index.js";
import { shippingRoutes } from "./fulfillment/shipping/index.js";
import { customersRoutes } from "./identity/customers/index.js";
import { usersRoutes } from "./identity/users/index.js";
import { bannersRoutes } from "./marketing/banners/index.js";
import { blogsRoutes } from "./marketing/blog/index.js";
import { campaignsRoutes } from "./marketing/campaigns/index.js";
import { homepageRoutes } from "./marketing/homepage/index.js";
import { brevoRoutes } from "./site/brevo/index.js";
import { settingsRoutes } from "./site/settings/index.js";
import { storeRoutes } from "./site/store/index.js";
import { cartRoutes } from "./cart/index.js";
import { checkoutRoutes } from "./checkout/index.js";

export const appModules: FastifyPluginAsync = async (fastify) => {


    // Analytics
    await fastify.register(analyticsRoutes, { prefix: "/analytics" });

    // Auth (Admin)
    await fastify.register(authRoutes, { prefix: "/auth" });

    // Auth (Customer)
    await fastify.register(customerAuthRoutes, { prefix: "/auth/customer" });

    // Catalog
    await fastify.register(productsRoutes, { prefix: "/catalog/products" });
    await fastify.register(brandsRoutes, { prefix: "/catalog/brands" });
    await fastify.register(collectionsRoutes, { prefix: "/catalog/collections" });
    await fastify.register(assetsRoutes, { prefix: "/catalog/assets" });

    // Fulfillment
    await fastify.register(ordersRoutes, { prefix: "/fulfillment/orders" });
    await fastify.register(shippingRoutes, { prefix: "/fulfillment/shipping" });

    // Identity
    await fastify.register(customersRoutes, { prefix: "/identity/customers" });
    await fastify.register(usersRoutes, { prefix: "/identity/users" });

    // Marketing
    await fastify.register(bannersRoutes, { prefix: "/marketing/banners" });
    await fastify.register(blogsRoutes, { prefix: "/marketing/blog" });
    await fastify.register(campaignsRoutes, { prefix: "/marketing/campaigns" });
    await fastify.register(homepageRoutes, { prefix: "/marketing/homepage" });

    // Site / Storefront
    await fastify.register(brevoRoutes, { prefix: "/site/brevo" });
    await fastify.register(settingsRoutes, { prefix: "/site/settings" });

    // Storefront Public API
    await fastify.register(storeRoutes, { prefix: "/store" });

    // Cart
    await fastify.register(cartRoutes, { prefix: "/cart" });

    // Checkout
    await fastify.register(checkoutRoutes, { prefix: "/checkout" });
};



export default appModules;
