import { DateTimeResolver, JSONResolver } from 'graphql-scalars';
import { AuthService, RegisterAdminInput, LoginInput } from '@/lib/services/auth.service';
import { ProductService, CreateProductInput, UpdateProductInput, ProductListOptions, CreateVariantInput, UpdateVariantInput } from '@/lib/services/product.service';
import { AssetService } from '@/lib/services/asset.service';
import { CollectionService, CreateCollectionInput, UpdateCollectionInput, CollectionListOptions } from '@/lib/services/collection.service';
import { HomepageCollectionService, CreateHomepageCollectionInput, UpdateHomepageCollectionInput, HomepageCollectionListOptions } from '@/lib/services/homepage-collection.service';
import { BlogService, CreateBlogInput, UpdateBlogInput, BlogListOptions } from '@/lib/services/blog.service';
import { BannerService, CreateBannerInput, UpdateBannerInput, BannerListOptions } from '@/lib/services/banner.service';
import { CustomerService, RegisterCustomerInput, UpdateCustomerInput, CreateAddressInput, UpdateAddressInput, CustomerSearchOptions } from '@/lib/services/customer.service';
import { ShippingMethodService, CreateShippingMethodInput, UpdateShippingMethodInput, ShippingMethodListOptions } from '@/lib/services/shipping-method.service';
import { OrderService, CreateOrderInput, OrderListOptions, OrderSearchOptions } from '@/lib/services/order.service';
import { PaymentService, InitializePaymentInput } from '@/lib/services/payment.service';
import { AnalyticsService } from '@/lib/services/analytics.service';
import { AssetType, OrderState } from '@prisma/client';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from './context';

export const resolvers = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,

  Query: {
    _health: () => 'OK',

    me: async (_parent: any, _args: any, context: GraphQLContext) => {
      requireAuth(context.auth);
      return context.auth.user;
    },

    // Product queries
    product: async (
      _parent: any,
      { id, includeDeleted }: { id: string; includeDeleted?: boolean },
      context: GraphQLContext
    ) => {
      // Public access for storefront
      const productService = new ProductService(context.prisma);
      return await productService.getProduct(id, includeDeleted);
    },

    products: async (
      _parent: any,
      { options }: { options?: ProductListOptions },
      context: GraphQLContext
    ) => {
      // Public access for storefront
      const productService = new ProductService(context.prisma);
      return await productService.getProducts(options);
    },

    searchProducts: async (
      _parent: any,
      { searchTerm, options }: { searchTerm: string; options?: ProductListOptions },
      context: GraphQLContext
    ) => {
      // Public access for storefront
      const productService = new ProductService(context.prisma);
      return await productService.searchProducts(searchTerm, options);
    },

    searchProductsEnhanced: async (
      _parent: any,
      { searchTerm, options }: { searchTerm: string; options?: { take?: number; skip?: number; enabledOnly?: boolean; inStockOnly?: boolean; groupByProduct?: boolean } },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const productService = new ProductService(context.prisma);
      return await productService.searchProductsEnhanced(searchTerm, options);
    },

    // Asset queries
    asset: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const assetService = new AssetService(context.prisma);
      return await assetService.getAsset(id);
    },

    assets: async (
      _parent: any,
      { options }: { options?: { type?: AssetType; take?: number; skip?: number } },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const assetService = new AssetService(context.prisma);
      return await assetService.getAssets(options?.type, options?.take, options?.skip);
    },

    // Collection queries
    collection: async (
      _parent: any,
      { id, includeChildren }: { id: string; includeChildren?: boolean },
      context: GraphQLContext
    ) => {
      // Public access for storefront
      const collectionService = new CollectionService(context.prisma);
      return await collectionService.getCollection(id, includeChildren);
    },

    collections: async (
      _parent: any,
      { options }: { options?: CollectionListOptions },
      context: GraphQLContext
    ) => {
      // Public access for storefront
      const collectionService = new CollectionService(context.prisma);
      return await collectionService.getCollections(options);
    },

    // Homepage Collection queries
    homepageCollection: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      // Public access for storefront
      const homepageCollectionService = new HomepageCollectionService(context.prisma);
      return await homepageCollectionService.getHomepageCollection(id);
    },

    homepageCollections: async (
      _parent: any,
      { options }: { options?: HomepageCollectionListOptions },
      context: GraphQLContext
    ) => {
      // Public access for storefront
      const homepageCollectionService = new HomepageCollectionService(context.prisma);
      return await homepageCollectionService.getHomepageCollections(options);
    },

    // Blog queries
    blog: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      // Public access for storefront
      const blogService = new BlogService(context.prisma);
      return await blogService.getBlog(id);
    },

    blogBySlug: async (
      _parent: any,
      { slug }: { slug: string },
      context: GraphQLContext
    ) => {
      // Public access for storefront
      const blogService = new BlogService(context.prisma);
      return await blogService.getBlogBySlug(slug);
    },

    blogs: async (
      _parent: any,
      { options }: { options?: BlogListOptions },
      context: GraphQLContext
    ) => {
      // Public access for storefront
      const blogService = new BlogService(context.prisma);
      return await blogService.getBlogs(options);
    },

    // Banner queries
    banner: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const bannerService = new BannerService(context.prisma);
      return await bannerService.getBanner(id);
    },

    bannerBySlug: async (
      _parent: any,
      { slug }: { slug: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const bannerService = new BannerService(context.prisma);
      return await bannerService.getBannerBySlug(slug);
    },

    banners: async (
      _parent: any,
      { options }: { options?: BannerListOptions },
      context: GraphQLContext
    ) => {
      // Public access for storefront
      const bannerService = new BannerService(context.prisma);
      return await bannerService.getBanners(options);
    },

    // Customer queries
    customer: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const customerService = new CustomerService(context.prisma);
      return await customerService.getCustomer(id);
    },

    searchCustomers: async (
      _parent: any,
      { searchTerm, options }: { searchTerm: string; options?: CustomerSearchOptions },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const customerService = new CustomerService(context.prisma);
      return await customerService.searchCustomers(searchTerm, options);
    },

    customerOrders: async (
      _parent: any,
      { customerId }: { customerId: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const customerService = new CustomerService(context.prisma);
      return await customerService.getCustomerOrders(customerId);
    },

    // Shipping Method queries
    shippingMethod: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const shippingMethodService = new ShippingMethodService(context.prisma);
      return await shippingMethodService.getShippingMethod(id);
    },

    shippingMethods: async (
      _parent: any,
      { options }: { options?: ShippingMethodListOptions },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const shippingMethodService = new ShippingMethodService(context.prisma);
      return await shippingMethodService.getShippingMethods(options);
    },

    // Order queries
    order: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const orderService = new OrderService(context.prisma);
      return await orderService.getOrder(id);
    },

    orders: async (
      _parent: any,
      { options }: { options?: OrderListOptions },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const orderService = new OrderService(context.prisma);
      return await orderService.getOrders(options);
    },

    searchOrders: async (
      _parent: any,
      { searchTerm, options }: { searchTerm: string; options?: OrderSearchOptions },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const orderService = new OrderService(context.prisma);
      return await orderService.searchOrders(searchTerm, options);
    },

    inventory: async (
      _parent: any,
      { lowStockThreshold }: { lowStockThreshold?: number },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const orderService = new OrderService(context.prisma);
      return await orderService.getInventory({ lowStockThreshold });
    },

    // Payment queries
    payment: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      return await context.prisma.payment.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              customer: true,
            },
          },
        },
      });
    },

    paymentByReference: async (
      _parent: any,
      { reference }: { reference: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const paymentService = new PaymentService(context.prisma);
      return await paymentService.getPaymentByReference(reference);
    },

    paymentByOrderId: async (
      _parent: any,
      { orderId }: { orderId: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const paymentService = new PaymentService(context.prisma);
      return await paymentService.getPaymentByOrderId(orderId);
    },

    // Analytics queries
    getDashboardStats: async (
      _parent: any,
      { startDate, endDate }: { startDate: Date; endDate: Date },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const analyticsService = new AnalyticsService(context.prisma);
      return await analyticsService.getDashboardStats(startDate, endDate);
    },

    getRecentOrders: async (
      _parent: any,
      { limit }: { limit?: number },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const analyticsService = new AnalyticsService(context.prisma);
      return await analyticsService.getRecentOrders(limit);
    },

    getLowStockAlerts: async (
      _parent: any,
      { threshold }: { threshold?: number },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const analyticsService = new AnalyticsService(context.prisma);
      return await analyticsService.getLowStockAlerts(threshold);
    },

    getTopSellingProducts: async (
      _parent: any,
      { startDate, endDate, limit }: { startDate: Date; endDate: Date; limit?: number },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const analyticsService = new AnalyticsService(context.prisma);
      return await analyticsService.getTopSellingProducts(startDate, endDate, limit);
    },
  },

  Mutation: {
    _ping: () => 'PONG',

    register: async (
      _parent: any,
      { input }: { input: RegisterAdminInput },
      context: GraphQLContext
    ) => {
      const authService = new AuthService(context.prisma);
      return await authService.register(input);
    },

    login: async (
      _parent: any,
      { input }: { input: LoginInput },
      context: GraphQLContext
    ) => {
      const authService = new AuthService(context.prisma);
      return await authService.login(input);
    },

    logout: async (_parent: any, _args: any, context: GraphQLContext) => {
      // In a stateless JWT system, logout is handled client-side by removing the token
      // This mutation exists for API consistency and can be extended for token blacklisting
      requireAuth(context.auth);

      // For now, we just return true
      // In a production system, you might want to:
      // 1. Add the token to a blacklist/revocation list
      // 2. Store revoked tokens in Redis with TTL
      // 3. Use shorter-lived tokens with refresh tokens

      return true;
    },

    // Product mutations
    createProduct: async (
      _parent: any,
      { input }: { input: CreateProductInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const productService = new ProductService(context.prisma);
      return await productService.createProduct(input);
    },

    updateProduct: async (
      _parent: any,
      { id, input }: { id: string; input: UpdateProductInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const productService = new ProductService(context.prisma);
      return await productService.updateProduct(id, input);
    },

    deleteProduct: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const productService = new ProductService(context.prisma);
      return await productService.deleteProduct(id);
    },

    // Variant mutations
    addVariantToProduct: async (
      _parent: any,
      { input }: { input: CreateVariantInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const productService = new ProductService(context.prisma);
      return await productService.addVariantToProduct(input);
    },

    updateVariant: async (
      _parent: any,
      { id, input }: { id: string; input: UpdateVariantInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const productService = new ProductService(context.prisma);
      return await productService.updateVariant(id, input);
    },

    updateVariantStock: async (
      _parent: any,
      { id, stockOnHand }: { id: string; stockOnHand: number },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const productService = new ProductService(context.prisma);
      return await productService.updateVariantStock(id, stockOnHand);
    },

    // Asset mutations
    uploadAsset: async (
      _parent: any,
      { input }: { input: { file: string; fileName: string; mimeType: string; folder?: string } },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const assetService = new AssetService(context.prisma);

      // Convert base64 string to Buffer
      const fileBuffer = Buffer.from(input.file, 'base64');

      const result = await assetService.uploadAsset({
        file: fileBuffer,
        fileName: input.fileName,
        mimeType: input.mimeType,
        folder: input.folder,
      });

      return { asset: result.asset };
    },

    deleteAsset: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const assetService = new AssetService(context.prisma);
      return await assetService.deleteAsset(id);
    },

    // Product-Asset mutations
    addAssetToProduct: async (
      _parent: any,
      { productId, assetId, sortOrder, featured }: { productId: string; assetId: string; sortOrder?: number; featured?: boolean },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const productService = new ProductService(context.prisma);
      return await productService.addAssetToProduct(productId, assetId, sortOrder, featured);
    },

    removeAssetFromProduct: async (
      _parent: any,
      { productId, assetId }: { productId: string; assetId: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const productService = new ProductService(context.prisma);
      return await productService.removeAssetFromProduct(productId, assetId);
    },

    setFeaturedAsset: async (
      _parent: any,
      { productId, assetId }: { productId: string; assetId: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const productService = new ProductService(context.prisma);
      return await productService.setFeaturedAsset(productId, assetId);
    },

    // Collection mutations
    createCollection: async (
      _parent: any,
      { input }: { input: CreateCollectionInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const collectionService = new CollectionService(context.prisma);
      return await collectionService.createCollection(input);
    },

    updateCollection: async (
      _parent: any,
      { id, input }: { id: string; input: UpdateCollectionInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const collectionService = new CollectionService(context.prisma);
      return await collectionService.updateCollection(id, input);
    },

    assignProductToCollection: async (
      _parent: any,
      { productId, collectionId, sortOrder }: { productId: string; collectionId: string; sortOrder?: number },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const collectionService = new CollectionService(context.prisma);
      return await collectionService.assignProductToCollection(productId, collectionId, sortOrder);
    },

    removeProductFromCollection: async (
      _parent: any,
      { productId, collectionId }: { productId: string; collectionId: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const collectionService = new CollectionService(context.prisma);
      return await collectionService.removeProductFromCollection(productId, collectionId);
    },

    updateCollectionSortOrder: async (
      _parent: any,
      { id, sortOrder }: { id: string; sortOrder: number },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const collectionService = new CollectionService(context.prisma);
      return await collectionService.updateCollectionSortOrder(id, sortOrder);
    },

    // Homepage Collection mutations
    createHomepageCollection: async (
      _parent: any,
      { input }: { input: CreateHomepageCollectionInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const homepageCollectionService = new HomepageCollectionService(context.prisma);
      return await homepageCollectionService.createHomepageCollection(input);
    },

    updateHomepageCollection: async (
      _parent: any,
      { id, input }: { id: string; input: UpdateHomepageCollectionInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const homepageCollectionService = new HomepageCollectionService(context.prisma);
      return await homepageCollectionService.updateHomepageCollection(id, input);
    },

    addProductToHomepageCollection: async (
      _parent: any,
      { collectionId, productId, sortOrder }: { collectionId: string; productId: string; sortOrder?: number },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const homepageCollectionService = new HomepageCollectionService(context.prisma);
      return await homepageCollectionService.addProductToHomepageCollection(collectionId, productId, sortOrder);
    },

    removeProductFromHomepageCollection: async (
      _parent: any,
      { collectionId, productId }: { collectionId: string; productId: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const homepageCollectionService = new HomepageCollectionService(context.prisma);
      return await homepageCollectionService.removeProductFromHomepageCollection(collectionId, productId);
    },

    reorderHomepageCollectionProducts: async (
      _parent: any,
      { collectionId, productOrders }: { collectionId: string; productOrders: Array<{ productId: string; sortOrder: number }> },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const homepageCollectionService = new HomepageCollectionService(context.prisma);
      return await homepageCollectionService.reorderHomepageCollectionProducts(collectionId, productOrders);
    },

    // Blog mutations
    createBlog: async (
      _parent: any,
      { input }: { input: CreateBlogInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const blogService = new BlogService(context.prisma);
      return await blogService.createBlog(input);
    },

    updateBlog: async (
      _parent: any,
      { id, input }: { id: string; input: UpdateBlogInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const blogService = new BlogService(context.prisma);
      return await blogService.updateBlog(id, input);
    },

    publishBlog: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const blogService = new BlogService(context.prisma);
      return await blogService.publishBlog(id);
    },

    unpublishBlog: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const blogService = new BlogService(context.prisma);
      return await blogService.unpublishBlog(id);
    },

    // Banner mutations
    createBanner: async (
      _parent: any,
      { input }: { input: CreateBannerInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const bannerService = new BannerService(context.prisma);
      return await bannerService.createBanner(input);
    },

    updateBanner: async (
      _parent: any,
      { id, input }: { id: string; input: UpdateBannerInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const bannerService = new BannerService(context.prisma);
      return await bannerService.updateBanner(id, input);
    },

    // Customer mutations
    registerCustomer: async (
      _parent: any,
      { input }: { input: RegisterCustomerInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const customerService = new CustomerService(context.prisma);
      return await customerService.registerCustomer(input);
    },

    updateCustomer: async (
      _parent: any,
      { id, input }: { id: string; input: UpdateCustomerInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const customerService = new CustomerService(context.prisma);
      return await customerService.updateCustomer(id, input);
    },

    createAddress: async (
      _parent: any,
      { input }: { input: CreateAddressInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const customerService = new CustomerService(context.prisma);
      return await customerService.createAddress(input);
    },

    updateAddress: async (
      _parent: any,
      { id, input }: { id: string; input: UpdateAddressInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const customerService = new CustomerService(context.prisma);
      return await customerService.updateAddress(id, input);
    },

    deleteAddress: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const customerService = new CustomerService(context.prisma);
      return await customerService.deleteAddress(id);
    },

    // Shipping Method mutations
    createShippingMethod: async (
      _parent: any,
      { input }: { input: CreateShippingMethodInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const shippingMethodService = new ShippingMethodService(context.prisma);
      return await shippingMethodService.createShippingMethod(input);
    },

    updateShippingMethod: async (
      _parent: any,
      { id, input }: { id: string; input: UpdateShippingMethodInput },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const shippingMethodService = new ShippingMethodService(context.prisma);
      return await shippingMethodService.updateShippingMethod(id, input);
    },

    deleteShippingMethod: async (
      _parent: any,
      { id }: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const shippingMethodService = new ShippingMethodService(context.prisma);
      return await shippingMethodService.deleteShippingMethod(id);
    },

    // Order mutations
    createOrder: async (
      _parent: any,
      { input }: { input: CreateOrderInput },
      context: GraphQLContext
    ) => {
      // Allow anonymous order creation for storefront checkout
      const orderService = new OrderService(context.prisma);
      return await orderService.createOrder(input);
    },

    updateOrderStatus: async (
      _parent: any,
      { id, state }: { id: string; state: OrderState },
      context: GraphQLContext
    ) => {
      requireAuth(context.auth);
      const orderService = new OrderService(context.prisma);
      return await orderService.updateOrderStatus(id, state);
    },

    // Payment mutations
    initializePayment: async (
      _parent: any,
      { input }: { input: InitializePaymentInput },
      context: GraphQLContext
    ) => {
      // Allow anonymous payment initialization for storefront checkout
      const paymentService = new PaymentService(context.prisma);
      return await paymentService.initializePayment(input);
    },
  },

  // Field resolvers
  Product: {
    variants: async (parent: any, _args: any, context: GraphQLContext) => {
      // Use DataLoader to batch and cache variant queries
      return await context.loaders.variantsByProductIdLoader.load(parent.id);
    },
    optionGroups: async (parent: any, _args: any, context: GraphQLContext) => {
      return await context.prisma.productOptionGroup.findMany({
        where: { productId: parent.id },
        include: {
          options: true,
        },
      });
    },
    assets: async (parent: any, _args: any, context: GraphQLContext) => {
      // Use DataLoader to batch and cache asset queries
      return await context.loaders.productAssetsByProductIdLoader.load(parent.id);
    },
    collections: async (parent: any, _args: any, context: GraphQLContext) => {
      // Use DataLoader to batch and cache collection queries
      return await context.loaders.productCollectionsByProductIdLoader.load(parent.id);
    },
  },

  Collection: {
    products: async (parent: any, _args: any, context: GraphQLContext) => {
      // Use DataLoader to batch and cache product queries
      return await context.loaders.productCollectionsByCollectionIdLoader.load(parent.id);
    },
  },

  HomepageCollection: {
    products: async (parent: any, _args: any, context: GraphQLContext) => {
      return await context.prisma.homepageCollectionProduct.findMany({
        where: { collectionId: parent.id },
        include: {
          product: true,
          collection: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });
    },
  },

  Blog: {
    categories: async (parent: any, _args: any, context: GraphQLContext) => {
      return await context.prisma.blogCategory.findMany({
        where: { blogId: parent.id },
      });
    },
    asset: async (parent: any, _args: any, context: GraphQLContext) => {
      if (!parent.assetId) return null;
      return await context.prisma.asset.findUnique({
        where: { id: parent.assetId },
      });
    },
  },

  Customer: {
    addresses: async (parent: any, _args: any, context: GraphQLContext) => {
      // Use DataLoader to batch and cache address queries
      return await context.loaders.addressesByCustomerIdLoader.load(parent.id);
    },
    orders: async (parent: any, _args: any, context: GraphQLContext) => {
      // Use DataLoader to batch and cache order queries
      return await context.loaders.ordersByCustomerIdLoader.load(parent.id);
    },
  },

  Order: {
    customer: async (parent: any, _args: any, context: GraphQLContext) => {
      // Use DataLoader to batch and cache customer queries
      return await context.loaders.customerLoader.load(parent.customerId);
    },
    lines: async (parent: any, _args: any, context: GraphQLContext) => {
      // Use DataLoader to batch and cache order line queries
      return await context.loaders.orderLinesByOrderIdLoader.load(parent.id);
    },
    shippingAddress: async (parent: any, _args: any, context: GraphQLContext) => {
      if (!parent.shippingAddressId) return null;
      // Use DataLoader to batch and cache address queries
      return await context.loaders.addressLoader.load(parent.shippingAddressId);
    },
    billingAddress: async (parent: any, _args: any, context: GraphQLContext) => {
      if (!parent.billingAddressId) return null;
      // Use DataLoader to batch and cache address queries
      return await context.loaders.addressLoader.load(parent.billingAddressId);
    },
    payments: async (parent: any, _args: any, context: GraphQLContext) => {
      return await context.prisma.payment.findMany({
        where: { orderId: parent.id },
      });
    },
  },

  OrderLine: {
    variant: async (parent: any, _args: any, context: GraphQLContext) => {
      // Use DataLoader to batch and cache variant queries
      return await context.loaders.productVariantLoader.load(parent.variantId);
    },
  },
};
