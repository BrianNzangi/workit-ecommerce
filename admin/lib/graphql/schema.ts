import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # Scalar types
  scalar DateTime
  scalar JSON

  # Error type for structured error responses
  type ErrorExtensions {
    code: String!
    field: String
    details: JSON
  }

  # Admin User Types
  enum AdminRole {
    SUPER_ADMIN
    ADMIN
    EDITOR
  }

  type AdminUser {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: AdminRole!
    enabled: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: AdminUser!
    expiresAt: DateTime!
  }

  input RegisterAdminInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: AdminRole
  }

  input LoginInput {
    email: String!
    password: String!
  }

  # Product Types
  type Product {
    id: ID!
    name: String!
    slug: String!
    description: String
    enabled: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    variants: [ProductVariant!]!
    optionGroups: [ProductOptionGroup!]!
    assets: [ProductAsset!]!
    collections: [ProductCollection!]!
  }

  type ProductAsset {
    id: ID!
    productId: String!
    assetId: String!
    sortOrder: Int!
    featured: Boolean!
    asset: Asset!
  }

  type ProductVariant {
    id: ID!
    productId: String!
    name: String!
    sku: String!
    price: Int!
    stockOnHand: Int!
    enabled: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    options: [ProductVariantOption!]!
  }

  type ProductOptionGroup {
    id: ID!
    productId: String!
    code: String!
    name: String!
    options: [ProductOption!]!
  }

  type ProductOption {
    id: ID!
    groupId: String!
    code: String!
    name: String!
  }

  type ProductVariantOption {
    id: ID!
    variantId: String!
    optionId: String!
    option: ProductOption!
  }

  input CreateProductInput {
    name: String!
    slug: String
    description: String
    enabled: Boolean
  }

  input UpdateProductInput {
    name: String
    slug: String
    description: String
    enabled: Boolean
  }

  input CreateVariantInput {
    productId: String!
    name: String!
    sku: String!
    price: Int!
    stockOnHand: Int
    enabled: Boolean
    optionIds: [String!]
  }

  input UpdateVariantInput {
    name: String
    sku: String
    price: Int
    stockOnHand: Int
    enabled: Boolean
  }

  input ProductListOptions {
    take: Int
    skip: Int
    includeDeleted: Boolean
  }

  input SearchProductsOptions {
    take: Int
    skip: Int
    enabledOnly: Boolean
    inStockOnly: Boolean
    groupByProduct: Boolean
  }

  type SearchResult {
    id: ID!
    productId: ID!
    name: String!
    slug: String!
    price: Int!
    image: String
    sku: String!
    stockOnHand: Int!
  }

  # Asset Types
  enum AssetType {
    IMAGE
    VIDEO
    DOCUMENT
  }

  type Asset {
    id: ID!
    name: String!
    type: AssetType!
    mimeType: String!
    fileSize: Int!
    source: String!
    preview: String!
    width: Int
    height: Int
    createdAt: DateTime!
  }

  input UploadAssetInput {
    file: String!
    fileName: String!
    mimeType: String!
    folder: String
  }

  type AssetUploadResult {
    asset: Asset!
  }

  input AssetListOptions {
    type: AssetType
    take: Int
    skip: Int
  }

  # Collection Types
  type Collection {
    id: ID!
    name: String!
    slug: String!
    description: String
    parentId: String
    enabled: Boolean!
    sortOrder: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    parent: Collection
    children: [Collection!]!
    products: [ProductCollection!]!
    asset: Asset
  }

  type ProductCollection {
    id: ID!
    productId: String!
    collectionId: String!
    sortOrder: Int!
    product: Product!
    collection: Collection!
  }

  input CreateCollectionInput {
    name: String!
    slug: String
    description: String
    parentId: String
    enabled: Boolean
    sortOrder: Int
    assetId: String
  }

  input UpdateCollectionInput {
    name: String
    slug: String
    description: String
    parentId: String
    enabled: Boolean
    sortOrder: Int
    assetId: String
  }

  input CollectionListOptions {
    take: Int
    skip: Int
    parentId: String
    includeChildren: Boolean
  }

  # Homepage Collection Types
  type HomepageCollection {
    id: ID!
    title: String!
    slug: String!
    enabled: Boolean!
    sortOrder: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    products: [HomepageCollectionProduct!]!
  }

  type HomepageCollectionProduct {
    id: ID!
    collectionId: String!
    productId: String!
    sortOrder: Int!
    collection: HomepageCollection!
    product: Product!
  }

  input CreateHomepageCollectionInput {
    title: String!
    slug: String
    enabled: Boolean
    sortOrder: Int
  }

  input UpdateHomepageCollectionInput {
    title: String
    slug: String
    enabled: Boolean
    sortOrder: Int
  }

  input HomepageCollectionListOptions {
    take: Int
    skip: Int
    enabled: Boolean
  }

  input ProductOrderInput {
    productId: String!
    sortOrder: Int!
  }

  # Blog Types
  type Blog {
    id: ID!
    title: String!
    slug: String!
    content: String!
    excerpt: String
    published: Boolean!
    publishedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    asset: Asset
    categories: [BlogCategory!]!
  }

  type BlogCategory {
    id: ID!
    blogId: String!
    name: String!
  }

  input CreateBlogInput {
    title: String!
    slug: String
    content: String!
    excerpt: String
    assetId: String
    categories: [String!]
  }

  input UpdateBlogInput {
    title: String
    slug: String
    content: String
    excerpt: String
    assetId: String
    categories: [String!]
  }

  input BlogListOptions {
    take: Int
    skip: Int
    published: Boolean
  }

  # Banner Types
  enum BannerPosition {
    HERO
    DEALS
    DEALS_HORIZONTAL
    MIDDLE
    BOTTOM
    COLLECTION_TOP
  }

  type Banner {
    id: ID!
    title: String!
    slug: String!
    position: BannerPosition!
    link: String
    enabled: Boolean!
    sortOrder: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    image: Asset
    mobileImage: Asset
    collection: Collection
  }

  input CreateBannerInput {
    title: String!
    slug: String
    position: BannerPosition!
    link: String
    enabled: Boolean
    sortOrder: Int
    imageId: String
    mobileImageId: String
    collectionId: String
  }

  input UpdateBannerInput {
    title: String
    slug: String
    position: BannerPosition
    link: String
    enabled: Boolean
    sortOrder: Int
    imageId: String
    mobileImageId: String
    collectionId: String
  }

  input BannerListOptions {
    take: Int
    skip: Int
    position: BannerPosition
    enabled: Boolean
  }

  # Customer Types
  type Customer {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    phoneNumber: String
    enabled: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    addresses: [Address!]!
    orders: [Order!]!
  }

  type Address {
    id: ID!
    customerId: String
    fullName: String!
    streetLine1: String!
    streetLine2: String
    city: String!
    province: String!
    postalCode: String!
    country: String!
    phoneNumber: String!
    defaultShipping: Boolean!
    defaultBilling: Boolean!
  }

  input RegisterCustomerInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    phoneNumber: String
  }

  input UpdateCustomerInput {
    email: String
    firstName: String
    lastName: String
    phoneNumber: String
    enabled: Boolean
  }

  input CreateAddressInput {
    customerId: String!
    fullName: String!
    streetLine1: String!
    streetLine2: String
    city: String!
    province: String!
    postalCode: String!
    country: String
    phoneNumber: String!
    defaultShipping: Boolean
    defaultBilling: Boolean
  }

  input UpdateAddressInput {
    fullName: String
    streetLine1: String
    streetLine2: String
    city: String
    province: String
    postalCode: String
    country: String
    phoneNumber: String
    defaultShipping: Boolean
    defaultBilling: Boolean
  }

  input CustomerSearchOptions {
    take: Int
    skip: Int
  }

  # Shipping Method Types
  type ShippingMethod {
    id: ID!
    code: String!
    name: String!
    description: String
    price: Int!
    enabled: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateShippingMethodInput {
    code: String!
    name: String!
    description: String
    price: Int!
    enabled: Boolean
  }

  input UpdateShippingMethodInput {
    code: String
    name: String
    description: String
    price: Int
    enabled: Boolean
  }

  input ShippingMethodListOptions {
    take: Int
    skip: Int
    enabledOnly: Boolean
  }

  # Order Types
  enum OrderState {
    CREATED
    PAYMENT_PENDING
    PAYMENT_AUTHORIZED
    PAYMENT_SETTLED
    SHIPPED
    DELIVERED
    CANCELLED
  }

  type Order {
    id: ID!
    code: String!
    customerId: String!
    state: OrderState!
    subTotal: Int!
    shipping: Int!
    tax: Int!
    total: Int!
    currencyCode: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    customer: Customer!
    lines: [OrderLine!]!
    shippingAddress: Address
    billingAddress: Address
    payments: [Payment!]!
  }

  type OrderLine {
    id: ID!
    orderId: String!
    variantId: String!
    quantity: Int!
    linePrice: Int!
    variant: ProductVariant!
  }

  enum PaymentState {
    PENDING
    AUTHORIZED
    SETTLED
    DECLINED
    CANCELLED
    ERROR
  }

  type Payment {
    id: ID!
    orderId: String!
    method: String!
    amount: Int!
    state: PaymentState!
    transactionId: String
    paystackRef: String
    metadata: JSON
    errorMessage: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Order input types
  input CreateOrderLineInput {
    variantId: String!
    quantity: Int!
  }

  # Inline address input for checkout
  input OrderAddressInput {
    fullName: String!
    streetLine1: String!
    streetLine2: String
    city: String!
    province: String!
    postalCode: String!
    country: String
    phoneNumber: String!
  }

  # Enhanced order input for storefront checkout
  input CreateOrderInput {
    # Option 1: Existing customer with saved addresses
    customerId: String
    shippingAddressId: String
    billingAddressId: String
    
    # Option 2: New customer or guest checkout with inline data
    email: String
    firstName: String
    lastName: String
    phoneNumber: String
    password: String # Optional - if provided, creates account; if not, creates guest customer
    
    # Inline address data (required if addressIds not provided)
    shippingAddress: OrderAddressInput
    billingAddress: OrderAddressInput # Optional - uses shipping address if not provided
    
    # Order details
    lines: [CreateOrderLineInput!]!
    shippingMethodId: String
    shippingCost: Int
    tax: Int
  }

  input OrderListOptions {
    take: Int
    skip: Int
    sortBy: String
    sortOrder: String
    state: OrderState
  }

  input OrderSearchOptions {
    take: Int
    skip: Int
  }

  # Inventory Types
  type InventoryItem {
    id: ID!
    sku: String!
    name: String!
    productName: String!
    stockOnHand: Int!
    price: Int!
    enabled: Boolean!
  }

  # Analytics Types
  type DashboardStats {
    totalRevenue: Int!
    orderCount: Int!
    period: DatePeriod!
  }

  type DatePeriod {
    start: DateTime!
    end: DateTime!
  }

  type RecentOrder {
    id: ID!
    code: String!
    customerName: String!
    total: Int!
    state: OrderState!
    createdAt: DateTime!
  }

  type LowStockAlert {
    id: ID!
    sku: String!
    name: String!
    productName: String!
    stockOnHand: Int!
    price: Int!
  }

  type TopSellingProduct {
    productId: ID!
    productName: String!
    totalQuantitySold: Int!
    totalRevenue: Int!
  }

  # Payment Types
  input InitializePaymentInput {
    orderId: String!
    email: String!
    amount: Int!
    callbackUrl: String
  }

  type InitializePaymentResponse {
    authorizationUrl: String!
    accessCode: String!
    reference: String!
  }

  # Base types
  type Query {
    _health: String!
    me: AdminUser
    
    # Product queries
    product(id: ID!, includeDeleted: Boolean): Product
    products(options: ProductListOptions): [Product!]!
    searchProducts(searchTerm: String!, options: ProductListOptions): [Product!]!
    searchProductsEnhanced(searchTerm: String!, options: SearchProductsOptions): [SearchResult!]!
    
    # Asset queries
    asset(id: ID!): Asset
    assets(options: AssetListOptions): [Asset!]!
    
    # Collection queries
    collection(id: ID!, includeChildren: Boolean): Collection
    collections(options: CollectionListOptions): [Collection!]!
    
    # Homepage Collection queries
    homepageCollection(id: ID!): HomepageCollection
    homepageCollections(options: HomepageCollectionListOptions): [HomepageCollection!]!
    
    # Blog queries
    blog(id: ID!): Blog
    blogBySlug(slug: String!): Blog
    blogs(options: BlogListOptions): [Blog!]!
    
    # Banner queries
    banner(id: ID!): Banner
    bannerBySlug(slug: String!): Banner
    banners(options: BannerListOptions): [Banner!]!
    
    # Customer queries
    customer(id: ID!): Customer
    searchCustomers(searchTerm: String!, options: CustomerSearchOptions): [Customer!]!
    customerOrders(customerId: ID!): [Order!]!
    
    # Shipping Method queries
    shippingMethod(id: ID!): ShippingMethod
    shippingMethods(options: ShippingMethodListOptions): [ShippingMethod!]!
    
    # Order queries
    order(id: ID!): Order
    orders(options: OrderListOptions): [Order!]!
    searchOrders(searchTerm: String!, options: OrderSearchOptions): [Order!]!
    
    # Inventory queries
    inventory(lowStockThreshold: Int): [InventoryItem!]!
    
    # Payment queries
    payment(id: ID!): Payment
    paymentByReference(reference: String!): Payment
    paymentByOrderId(orderId: ID!): Payment
    
    # Analytics queries
    getDashboardStats(startDate: DateTime!, endDate: DateTime!): DashboardStats!
    getRecentOrders(limit: Int): [RecentOrder!]!
    getLowStockAlerts(threshold: Int): [LowStockAlert!]!
    getTopSellingProducts(startDate: DateTime!, endDate: DateTime!, limit: Int): [TopSellingProduct!]!
  }

  type Mutation {
    _ping: String!
    register(input: RegisterAdminInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    
    # Product mutations
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    
    # Variant mutations
    addVariantToProduct(input: CreateVariantInput!): ProductVariant!
    updateVariant(id: ID!, input: UpdateVariantInput!): ProductVariant!
    updateVariantStock(id: ID!, stockOnHand: Int!): ProductVariant!
    
    # Asset mutations
    uploadAsset(input: UploadAssetInput!): AssetUploadResult!
    deleteAsset(id: ID!): Boolean!
    
    # Product-Asset mutations
    addAssetToProduct(productId: ID!, assetId: ID!, sortOrder: Int, featured: Boolean): ProductAsset!
    removeAssetFromProduct(productId: ID!, assetId: ID!): Boolean!
    setFeaturedAsset(productId: ID!, assetId: ID!): ProductAsset!
    
    # Collection mutations
    createCollection(input: CreateCollectionInput!): Collection!
    updateCollection(id: ID!, input: UpdateCollectionInput!): Collection!
    assignProductToCollection(productId: ID!, collectionId: ID!, sortOrder: Int): ProductCollection!
    removeProductFromCollection(productId: ID!, collectionId: ID!): Boolean!
    updateCollectionSortOrder(id: ID!, sortOrder: Int!): Collection!
    
    # Homepage Collection mutations
    createHomepageCollection(input: CreateHomepageCollectionInput!): HomepageCollection!
    updateHomepageCollection(id: ID!, input: UpdateHomepageCollectionInput!): HomepageCollection!
    addProductToHomepageCollection(collectionId: ID!, productId: ID!, sortOrder: Int): HomepageCollectionProduct!
    removeProductFromHomepageCollection(collectionId: ID!, productId: ID!): Boolean!
    reorderHomepageCollectionProducts(collectionId: ID!, productOrders: [ProductOrderInput!]!): Boolean!
    
    # Blog mutations
    createBlog(input: CreateBlogInput!): Blog!
    updateBlog(id: ID!, input: UpdateBlogInput!): Blog!
    publishBlog(id: ID!): Blog!
    unpublishBlog(id: ID!): Blog!
    
    # Banner mutations
    createBanner(input: CreateBannerInput!): Banner!
    updateBanner(id: ID!, input: UpdateBannerInput!): Banner!
    
    # Customer mutations
    registerCustomer(input: RegisterCustomerInput!): Customer!
    updateCustomer(id: ID!, input: UpdateCustomerInput!): Customer!
    createAddress(input: CreateAddressInput!): Address!
    updateAddress(id: ID!, input: UpdateAddressInput!): Address!
    deleteAddress(id: ID!): Boolean!
    
    # Shipping Method mutations
    createShippingMethod(input: CreateShippingMethodInput!): ShippingMethod!
    updateShippingMethod(id: ID!, input: UpdateShippingMethodInput!): ShippingMethod!
    deleteShippingMethod(id: ID!): Boolean!
    
    # Order mutations
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, state: OrderState!): Order!
    
    # Payment mutations
    initializePayment(input: InitializePaymentInput!): InitializePaymentResponse!
  }
`;
