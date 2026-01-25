"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.authRelations = exports.productAssetRelations = exports.homepageCollectionProductRelations = exports.orderLineRelations = exports.productCollectionRelations = exports.blogRelations = exports.assetRelations = exports.addressRelations = exports.userRelations = exports.orderRelations = exports.collectionRelations = exports.productRelations = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const enums = __importStar(require("./schema/enums"));
const products = __importStar(require("./schema/products"));
const orders = __importStar(require("./schema/orders"));
const users = __importStar(require("./schema/users"));
const marketing = __importStar(require("./schema/marketing"));
const cms = __importStar(require("./schema/cms"));
const settings = __importStar(require("./schema/settings"));
const blog = __importStar(require("./schema/blog"));
const auth = __importStar(require("./schema/auth"));
__exportStar(require("./schema/enums"), exports);
__exportStar(require("./schema/products"), exports);
__exportStar(require("./schema/orders"), exports);
__exportStar(require("./schema/users"), exports);
__exportStar(require("./schema/marketing"), exports);
__exportStar(require("./schema/cms"), exports);
__exportStar(require("./schema/settings"), exports);
__exportStar(require("./schema/blog"), exports);
__exportStar(require("./schema/auth"), exports);
__exportStar(require("./client"), exports);
exports.productRelations = (0, drizzle_orm_1.relations)(products.products, ({ one, many }) => ({
    brand: one(products.brands, {
        fields: [products.products.brandId],
        references: [products.brands.id],
    }),
    homepageCollections: many(products.homepageCollectionProducts),
    assets: many(cms.productAssets),
    collections: many(products.productCollections),
    orderLines: many(orders.orderLines),
}));
exports.collectionRelations = (0, drizzle_orm_1.relations)(products.collections, ({ one, many }) => ({
    asset: one(cms.assets, {
        fields: [products.collections.assetId],
        references: [cms.assets.id],
    }),
    parent: one(products.collections, {
        fields: [products.collections.parentId],
        references: [products.collections.id],
        relationName: "parent",
    }),
    children: many(products.collections, {
        relationName: "parent",
    }),
    products: many(products.productCollections),
    banners: many(cms.banners),
}));
exports.orderRelations = (0, drizzle_orm_1.relations)(orders.orders, ({ one, many }) => ({
    customer: one(auth.user, {
        fields: [orders.orders.customerId],
        references: [auth.user.id],
    }),
    shippingAddress: one(orders.addresses, {
        fields: [orders.orders.shippingAddressId],
        references: [orders.addresses.id],
        relationName: "shippingAddress",
    }),
    billingAddress: one(orders.addresses, {
        fields: [orders.orders.billingAddressId],
        references: [orders.addresses.id],
        relationName: "billingAddress",
    }),
    shippingMethod: one(orders.shippingMethods, {
        fields: [orders.orders.shippingMethodId],
        references: [orders.shippingMethods.id],
    }),
    lines: many(orders.orderLines),
    payments: many(orders.payments),
}));
exports.userRelations = (0, drizzle_orm_1.relations)(auth.user, ({ many }) => ({
    addresses: many(orders.addresses),
    orders: many(orders.orders),
    sessions: many(auth.session),
    accounts: many(auth.account),
}));
exports.addressRelations = (0, drizzle_orm_1.relations)(orders.addresses, ({ one }) => ({
    customer: one(auth.user, {
        fields: [orders.addresses.customerId],
        references: [auth.user.id],
    }),
}));
exports.assetRelations = (0, drizzle_orm_1.relations)(cms.assets, ({ many }) => ({
    desktopBanners: many(cms.banners, { relationName: "desktopImage" }),
    mobileBanners: many(cms.banners, { relationName: "mobileImage" }),
    blogs: many(cms.blogs),
    collections: many(products.collections),
    products: many(cms.productAssets),
}));
exports.blogRelations = (0, drizzle_orm_1.relations)(cms.blogs, ({ one, many }) => ({
    asset: one(cms.assets, {
        fields: [cms.blogs.assetId],
        references: [cms.assets.id],
    }),
    categories: many(cms.blogCategories),
}));
exports.productCollectionRelations = (0, drizzle_orm_1.relations)(products.productCollections, ({ one }) => ({
    product: one(products.products, {
        fields: [products.productCollections.productId],
        references: [products.products.id],
    }),
    collection: one(products.collections, {
        fields: [products.productCollections.collectionId],
        references: [products.collections.id],
    }),
}));
exports.orderLineRelations = (0, drizzle_orm_1.relations)(orders.orderLines, ({ one }) => ({
    order: one(orders.orders, {
        fields: [orders.orderLines.orderId],
        references: [orders.orders.id],
    }),
    product: one(products.products, {
        fields: [orders.orderLines.productId],
        references: [products.products.id],
    }),
}));
exports.homepageCollectionProductRelations = (0, drizzle_orm_1.relations)(products.homepageCollectionProducts, ({ one }) => ({
    product: one(products.products, {
        fields: [products.homepageCollectionProducts.productId],
        references: [products.products.id],
    }),
    collection: one(products.homepageCollections, {
        fields: [products.homepageCollectionProducts.collectionId],
        references: [products.homepageCollections.id],
    }),
}));
exports.productAssetRelations = (0, drizzle_orm_1.relations)(cms.productAssets, ({ one }) => ({
    product: one(products.products, {
        fields: [cms.productAssets.productId],
        references: [products.products.id],
    }),
    asset: one(cms.assets, {
        fields: [cms.productAssets.assetId],
        references: [cms.assets.id],
    }),
}));
exports.authRelations = (0, drizzle_orm_1.relations)(auth.session, ({ one }) => ({
    user: one(auth.user, {
        fields: [auth.session.userId],
        references: [auth.user.id],
    }),
}));
exports.schema = {
    ...enums,
    ...products,
    ...orders,
    ...users,
    ...marketing,
    ...cms,
    ...settings,
    ...blog,
    ...auth,
    productRelations: exports.productRelations,
    collectionRelations: exports.collectionRelations,
    orderRelations: exports.orderRelations,
    customerRelations: exports.userRelations,
    userRelations: exports.userRelations,
    addressRelations: exports.addressRelations,
    assetRelations: exports.assetRelations,
    blogRelations: exports.blogRelations,
    productCollectionRelations: exports.productCollectionRelations,
    homepageCollectionProductRelations: exports.homepageCollectionProductRelations,
    productAssetRelations: exports.productAssetRelations,
    orderLineRelations: exports.orderLineRelations,
    authRelations: exports.authRelations,
};
//# sourceMappingURL=index.js.map