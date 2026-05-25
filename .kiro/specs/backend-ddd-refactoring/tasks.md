 # Implementation Plan: Backend DDD Refactoring

## Overview

This implementation plan transforms the Workit e-commerce backend from Transaction Script/Anemic Domain Model to Domain-Driven Design architecture. The refactoring introduces rich domain models, bounded contexts, domain events, and layered architecture while maintaining backward compatibility.

The migration follows a 7-phase approach over 12 weeks, with each bounded context migrated independently using feature flags for safe rollout and instant rollback capability.

**Important**: All new DDD code will be created in a new `backend-v2` directory. The existing `backend` directory will remain as reference and for code migration. This allows us to build the new architecture cleanly while keeping the old implementation intact.

## Tasks

- [x] 1. Phase 1: Foundation (Week 1-2)
  - [x] 1.1 Create backend-v2 directory structure for DDD layers
    - Create `backend-v2/` root directory
    - Create `backend-v2/src/domain/`, `backend-v2/src/application/`, `backend-v2/src/infrastructure/` directories
    - Create subdirectories for each bounded context
    - Copy `backend/package.json` to `backend-v2/package.json` as starting point
    - Copy `backend/tsconfig.json` to `backend-v2/tsconfig.json`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 1.2 Implement base Entity class
    - Create `backend-v2/src/domain/shared/Entity.ts` with identity and equality logic
    - Implement generic type parameter for ID type
    - _Requirements: 1.1, 1.3_

  - [x] 1.3 Implement base ValueObject class
    - Create `backend-v2/src/domain/shared/ValueObject.ts` with structural equality
    - Implement immutability through Object.freeze
    - _Requirements: 1.2, 1.5_

  - [x] 1.4 Implement base AggregateRoot class
    - Create `backend-v2/src/domain/shared/AggregateRoot.ts` extending Entity
    - Add domain event collection and management methods
    - _Requirements: 1.6, 3.8_

  - [x] 1.5 Implement base DomainEvent class
    - Create `backend-v2/src/domain/shared/DomainEvent.ts` with timestamp and event type
    - _Requirements: 5.1_

  - [x] 1.6 Write unit tests for base classes
    - Create `backend-v2/tests/unit/domain/shared/` directory
    - Test Entity equality and identity
    - Test ValueObject immutability and structural equality
    - Test AggregateRoot event management
    - _Requirements: 21.1, 21.2_

  - [x] 1.7 Implement EventBus infrastructure
    - Create `backend-v2/src/infrastructure/events/EventBus.ts` implementing IEventBus interface
    - Create `backend-v2/src/application/shared/IEventBus.ts` interface
    - Implement publish and subscribe methods with handler registry
    - _Requirements: 5.7, 5.8_

  - [x] 1.8 Implement UnitOfWork with Drizzle transactions
    - Create `backend-v2/src/infrastructure/persistence/unit-of-work/DrizzleUnitOfWork.ts`
    - Create `backend-v2/src/application/shared/IUnitOfWork.ts` interface
    - Implement transaction wrapper using Drizzle's transaction API
    - Reference database connection from `backend/src/lib/db.ts` (shared)
    - _Requirements: 8.9_

  - [x] 1.9 Set up dependency injection container
    - Create `backend-v2/src/infrastructure/di/container.ts` with registration and resolution
    - Implement singleton pattern for service instances
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

  - [x] 1.10 Write integration tests for infrastructure components
    - Create `backend-v2/tests/integration/` directory
    - Test EventBus publish/subscribe functionality
    - Test UnitOfWork transaction commit and rollback
    - Test DI container registration and resolution
    - _Requirements: 22.1, 22.4_

- [x] 2. Checkpoint - Foundation complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Phase 2: Order Management Context (Week 3-5)
  - [x] 3.1 Implement Money value object
    - Create `backend-v2/src/domain/order-management/value-objects/Money.ts`
    - Implement validation for non-negative amounts
    - Implement arithmetic operations (add, subtract, multiply)
    - Implement currency validation
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 3.2 Implement OrderCode value object
    - Create `backend-v2/src/domain/order-management/value-objects/OrderCode.ts`
    - Implement generation logic with format validation
    - _Requirements: 4.9_

  - [x] 3.3 Write unit tests for value objects
    - Create `backend-v2/tests/unit/domain/order-management/` directory
    - Test Money validation and arithmetic operations
    - Test Money currency mismatch errors
    - Test OrderCode generation and validation
    - _Requirements: 21.2_

  - [x] 3.4 Implement OrderLine entity
    - Create `backend-v2/src/domain/order-management/entities/OrderLine.ts`
    - Implement totalPrice calculation method
    - _Requirements: 10.7_

  - [x] 3.5 Implement Payment entity
    - Create `backend-v2/src/domain/order-management/entities/Payment.ts`
    - Implement payment state management
    - _Requirements: 11.1, 11.2, 11.3, 11.9_

  - [x] 3.6 Implement Order aggregate root
    - Create `backend-v2/src/domain/order-management/aggregates/Order.ts`
    - Implement state machine with valid transitions
    - Implement transitionTo method with validation
    - Implement settlePayment method
    - Raise OrderPlaced event on creation
    - Raise OrderStateChanged event on transitions
    - _Requirements: 3.1, 3.2, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

  - [x] 3.7 Write unit tests for Order aggregate
    - Test state transition validation
    - Test payment settlement with amount matching
    - Test domain event raising
    - Test invariant enforcement
    - _Requirements: 21.1, 21.4, 21.6_

  - [x] 3.8 Implement CartLine entity
    - Create `backend-v2/src/domain/order-management/entities/CartLine.ts`
    - _Requirements: 10.1_

  - [x] 3.9 Implement Cart aggregate root
    - Create `backend-v2/src/domain/order-management/aggregates/Cart.ts`
    - Implement line item validation
    - _Requirements: 10.1, 10.2_

  - [x] 3.10 Write unit tests for Cart aggregate
    - Test line item management
    - Test validation rules
    - _Requirements: 21.1_

  - [x] 3.11 Implement domain exceptions
    - Create `backend-v2/src/domain/order-management/errors/InvalidStateTransitionError.ts`
    - Create `backend-v2/src/domain/order-management/errors/PaymentVerificationError.ts`
    - Create `backend-v2/src/domain/order-management/errors/InvalidMoneyOperationError.ts`
    - _Requirements: 24.1, 24.3, 24.6_

  - [x] 3.12 Implement PricingService domain service
    - Create `backend-v2/src/domain/order-management/services/PricingService.ts`
    - Implement calculateSubtotal method
    - Implement applyDiscount method with campaign support
    - Implement calculateTotal method
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 3.13 Write unit tests for PricingService
    - Test subtotal calculation from order lines
    - Test discount application for different discount types
    - Test total calculation with shipping and tax
    - _Requirements: 21.3_

  - [x] 3.14 Implement OrderStateService domain service
    - Create `backend-v2/src/domain/order-management/services/OrderStateService.ts`
    - Implement state transition validation logic
    - _Requirements: 7.9, 7.10_

  - [x] 3.15 Implement PaymentVerificationService domain service
    - Create `backend-v2/src/domain/order-management/services/PaymentVerificationService.ts`
    - Implement payment validation methods
    - Reference Paystack integration from `backend/src/lib/` (can be shared)
    - _Requirements: 11.4, 11.5, 11.6, 11.7, 11.8_

  - [x] 3.16 Define repository interfaces
    - Create `backend-v2/src/domain/order-management/repositories/IOrderRepository.ts`
    - Create `backend-v2/src/domain/order-management/repositories/ICartRepository.ts`
    - Define methods: findById, save, findByCustomerId, findByCode
    - _Requirements: 6.1, 6.2, 6.5_

  - [x] 3.17 Implement OrderMapper
    - Create `backend-v2/src/infrastructure/persistence/mappers/OrderMapper.ts`
    - Implement toDomain method mapping database records to Order aggregate
    - Implement toPersistence method mapping Order aggregate to database records
    - Reference database schema from `backend/packages/db/` (shared)
    - _Requirements: 6.9_

  - [x] 3.18 Implement CartMapper
    - Create `backend-v2/src/infrastructure/persistence/mappers/CartMapper.ts`
    - Implement toDomain and toPersistence methods
    - _Requirements: 6.9_

  - [x] 3.19 Implement OrderRepository
    - Create `backend-v2/src/infrastructure/persistence/repositories/OrderRepository.ts`
    - Implement findById with eager loading of lines, addresses, payments
    - Implement findByCustomerId
    - Implement findByCode
    - Implement save with upsert logic for order, lines, and payment
    - Use shared database connection from `backend/src/lib/db.ts`
    - _Requirements: 6.2, 6.6, 6.7, 6.8, 25.2_

  - [x] 3.20 Implement CartRepository
    - Create `backend-v2/src/infrastructure/persistence/repositories/CartRepository.ts`
    - Implement findByCustomerId, findByGuestId, save, delete methods
    - _Requirements: 6.5_

  - [x] 3.21 Write integration tests for repositories
    - Test OrderRepository CRUD operations with database
    - Test CartRepository CRUD operations
    - Test eager loading and aggregate reconstruction
    - _Requirements: 22.1, 22.3_

  - [x] 3.22 Implement PlaceOrderService application service
    - Create `backend-v2/src/application/order-management/services/PlaceOrderService.ts`
    - Implement execute method orchestrating: cart loading, stock validation, pricing, order creation
    - Use UnitOfWork for transaction management
    - Publish domain events after successful order creation
    - _Requirements: 8.1, 8.2, 8.3, 8.7, 8.8, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [x] 3.23 Write integration tests for PlaceOrderService
    - Test successful order creation from cart
    - Test stock allocation and validation
    - Test transaction rollback on errors
    - Test domain event publishing
    - _Requirements: 22.1, 22.2, 22.4, 22.5_

  - [x] 3.24 Implement VerifyPaymentService application service
    - Create `backend-v2/src/application/order-management/services/VerifyPaymentService.ts`
    - Implement execute method for payment verification workflow
    - Validate payment details against order total
    - Update order state to PAYMENT_SETTLED
    - _Requirements: 8.1, 8.4, 11.5, 11.6, 11.7, 11.8, 11.9_

  - [x] 3.25 Write integration tests for VerifyPaymentService
    - Test successful payment verification
    - Test payment amount validation
    - Test order state transition
    - _Requirements: 22.1, 22.4_

  - [x] 3.26 Implement AddToCartService application service
    - Create `backend-v2/src/application/order-management/services/AddToCartService.ts`
    - Implement cart line item management
    - _Requirements: 8.1, 8.5_

  - [x] 3.27 Register Order Management services in DI container
    - Update `backend-v2/src/infrastructure/di/container.ts`
    - Register repositories, mappers, domain services, application services
    - Configure dependency injection for PlaceOrderService and VerifyPaymentService
    - _Requirements: 19.2, 19.3, 19.4, 19.6_

  - [x] 3.28 Add feature flag for Order Management context
    - Create `backend-v2/src/infrastructure/feature-flags/flags.ts` with useDDDOrderManagement flag
    - Add environment variable USE_DDD_ORDER_MANAGEMENT to `backend-v2/.env.example`
    - _Requirements: 20.1, 20.5_

  - [x] 3.29 Create presentation layer adapter for checkout
    - Create `backend-v2/src/presentation/modules/checkout/` directory
    - Create adapter endpoints that use PlaceOrderService and VerifyPaymentService
    - Maintain same API contract as `backend/src/modules/checkout/`
    - Add feature flag check to toggle between old (backend) and new (backend-v2) implementations
    - _Requirements: 18.3, 18.4, 20.1, 20.4_

  - [x] 3.30 Write equivalence tests for checkout flow
    - Create `backend-v2/tests/equivalence/` directory
    - Compare old vs new implementation outputs for same inputs
    - Verify order totals, line items, and state match
    - _Requirements: 20.6_

  - [x] 3.31 Write contract tests for checkout API
    - Test POST /checkout/initiate response schema
    - Test POST /checkout/verify response schema
    - Ensure backward compatibility with `backend` API
    - _Requirements: 18.4_

- [x] 4. Checkpoint - Order Management complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Phase 3: Catalog Context (Week 6-7)
  - [x] 5.1 Implement ProductSKU value object
    - Create `backend-v2/src/domain/catalog/value-objects/ProductSKU.ts`
    - Implement format validation
    - _Requirements: 4.8_

  - [x] 5.2 Write unit tests for ProductSKU
    - Test SKU format validation
    - Test equality comparison
    - _Requirements: 21.2_

  - [x] 5.3 Implement Product aggregate root
    - Create `backend-v2/src/domain/catalog/entities/Product.ts`
    - Implement reserveStock method with validation
    - Implement releaseStock method
    - Enforce non-negative stock invariant
    - Enforce sale price <= original price invariant
    - Raise ProductStockChanged events
    - _Requirements: 3.4, 3.5, 3.6, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 5.4 Write unit tests for Product aggregate
    - Test stock reservation with validation
    - Test stock release
    - Test invariant enforcement (non-negative stock, price validation)
    - Test domain event raising
    - _Requirements: 21.1, 21.4, 21.6_

  - [x] 5.5 Implement catalog domain exceptions
    - Create `backend-v2/src/domain/catalog/errors/InsufficientStockError.ts`
    - Create `backend-v2/src/domain/catalog/errors/InvalidSKUError.ts`
    - _Requirements: 24.1, 24.2_

  - [x] 5.6 Implement StockAllocationService domain service
    - Create `backend-v2/src/domain/catalog/services/StockAllocationService.ts`
    - Implement allocateStock method with atomic validation and reservation
    - _Requirements: 7.6, 7.7, 7.8, 12.7_

  - [x] 5.7 Write unit tests for StockAllocationService
    - Test multi-product stock allocation
    - Test validation before allocation
    - Test atomic rollback on insufficient stock
    - _Requirements: 21.3_

  - [x] 5.8 Define IProductRepository interface
    - Create `backend-v2/src/domain/catalog/repositories/IProductRepository.ts`
    - Define methods: findById, findBySKU, findByIds, save, search
    - _Requirements: 6.1, 6.3_

  - [x] 5.9 Implement ProductMapper
    - Create `backend-v2/src/infrastructure/persistence/mappers/ProductMapper.ts`
    - Implement toDomain and toPersistence methods
    - _Requirements: 6.9_

  - [x] 5.10 Implement ProductRepository
    - Create `backend-v2/src/infrastructure/persistence/repositories/ProductRepository.ts`
    - Implement findById, findBySKU, findByIds methods
    - Implement save with stock update
    - Implement search with filtering and pagination
    - _Requirements: 6.3, 6.8, 25.1, 25.2_

  - [x] 5.11 Write integration tests for ProductRepository
    - Test CRUD operations
    - Test search with various filters
    - Test batch loading (findByIds)
    - _Requirements: 22.1, 22.3_

  - [x] 5.12 Implement SearchProductsService application service
    - Create `backend-v2/src/application/catalog/services/SearchProductsService.ts`
    - Implement product search with filters
    - _Requirements: 8.1, 8.6_

  - [x] 5.13 Register Catalog services in DI container
    - Update `backend-v2/src/infrastructure/di/container.ts`
    - Register ProductRepository, ProductMapper, StockAllocationService, SearchProductsService
    - _Requirements: 19.2, 19.3, 19.4_

  - [x] 5.14 Add feature flag for Catalog context
    - Add useDDDCatalog flag to `backend-v2/src/infrastructure/feature-flags/flags.ts`
    - Add environment variable USE_DDD_CATALOG
    - _Requirements: 20.1, 20.5_

  - [x] 5.15 Create presentation layer adapter for catalog
    - Create `backend-v2/src/presentation/modules/catalog/` directory
    - Create adapter endpoints that use SearchProductsService
    - Maintain same API contract as `backend/src/modules/catalog/`
    - _Requirements: 18.3, 20.1_

  - [x] 5.16 Subscribe to ProductStockChanged events in Order Management
    - Implement event handler in `backend-v2/src/application/order-management/event-handlers/`
    - Handle stock change notifications
    - _Requirements: 5.8_

  - [x] 5.17 Write integration tests for catalog-order integration
    - Test stock allocation during order placement
    - Test ProductStockChanged event publishing
    - _Requirements: 22.1, 22.4_

- [x] 6. Checkpoint - Catalog complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Phase 4: Customer Management Context (Week 8)
  - [x] 7.1 Implement Email value object
    - Create `domain/customer-management/value-objects/Email.ts`
    - Implement format validation
    - _Requirements: 4.6_

  - [x] 7.2 Implement PhoneNumber value object
    - Create `domain/customer-management/value-objects/PhoneNumber.ts`
    - Implement format validation
    - _Requirements: 4.7_

  - [x] 7.3 Implement Address value object
    - Create `domain/customer-management/value-objects/Address.ts`
    - Implement validation for required fields
    - Implement formatted display method
    - _Requirements: 4.4, 4.5, 14.1, 14.2, 14.3, 14.4_

  - [x] 7.4 Write unit tests for customer value objects
    - Test Email format validation
    - Test PhoneNumber format validation
    - Test Address validation and display formatting
    - _Requirements: 21.2, 14.7_

  - [x] 7.5 Implement Customer aggregate root
    - Create `domain/customer-management/aggregates/Customer.ts`
    - Implement addAddress method with validation
    - Implement setDefaultShippingAddress method
    - Implement setDefaultBillingAddress method
    - Raise CustomerRegistered event on creation
    - _Requirements: 3.7, 15.1, 15.2, 15.3, 15.4, 15.6, 14.5_

  - [x] 7.6 Write unit tests for Customer aggregate
    - Test address management methods
    - Test default address setting
    - Test CustomerRegistered event
    - _Requirements: 21.1, 21.6_

  - [x] 7.7 Implement customer domain exceptions
    - Create `domain/customer-management/errors/ValidationError.ts`
    - Create `domain/customer-management/errors/DuplicateEmailError.ts`
    - _Requirements: 24.1, 24.4_

  - [x] 7.8 Define ICustomerRepository interface
    - Create `domain/customer-management/repositories/ICustomerRepository.ts`
    - Define methods: findById, findByEmail, save
    - _Requirements: 6.1, 6.4, 15.5_

  - [x] 7.9 Implement CustomerMapper
    - Create `infrastructure/persistence/mappers/CustomerMapper.ts`
    - Implement toDomain and toPersistence methods
    - Map Address value objects to addresses table
    - _Requirements: 6.9, 14.6_

  - [x] 7.10 Implement CustomerRepository
    - Create `infrastructure/persistence/repositories/CustomerRepository.ts`
    - Implement findById, findByEmail, save methods
    - Load customer with addresses
    - _Requirements: 6.4, 6.8_

  - [x] 7.11 Write integration tests for CustomerRepository
    - Test CRUD operations
    - Test email uniqueness validation
    - Test address loading
    - _Requirements: 22.1, 22.3_

  - [x] 7.12 Implement RegisterCustomerService application service
    - Create `application/customer-management/services/RegisterCustomerService.ts`
    - Implement customer registration workflow
    - _Requirements: 8.1_

  - [x] 7.13 Register Customer Management services in DI container
    - Register CustomerRepository, CustomerMapper, RegisterCustomerService
    - _Requirements: 19.2, 19.3, 19.4_

  - [x] 7.14 Add feature flag for Customer Management context
    - Add useDDDCustomer flag to feature flags module
    - Add environment variable USE_DDD_CUSTOMER
    - _Requirements: 20.1, 20.5_

  - [x] 7.15 Integrate DDD implementation in identity endpoints
    - Modify identity module endpoints to use feature flag
    - Wire RegisterCustomerService
    - _Requirements: 18.3, 20.1_

- [x] 8. Checkpoint - Customer Management complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Phase 5: Marketing Context (Week 9)
  - [x] 9.1 Implement Campaign aggregate root
    - Create `domain/marketing/aggregates/Campaign.ts`
    - Implement isEligible method with date range, usage limits, minimum purchase validation
    - Implement calculateDiscount method for different discount types
    - Implement redeem method
    - Raise CampaignRedeemed event
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [x] 9.2 Write unit tests for Campaign aggregate
    - Test eligibility validation (date range, usage limits, minimum purchase)
    - Test discount calculation for PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING types
    - Test redemption and event raising
    - _Requirements: 21.1, 21.4, 21.6_

  - [x] 9.3 Implement CampaignRedemption entity
    - Create `domain/marketing/entities/CampaignRedemption.ts`
    - Track campaign usage per customer
    - _Requirements: 13.9_

  - [x] 9.4 Implement marketing domain exceptions
    - Create `domain/marketing/errors/CampaignNotEligibleError.ts`
    - Create `domain/marketing/errors/CampaignExpiredError.ts`
    - _Requirements: 24.1, 24.5_

  - [x] 9.5 Define ICampaignRepository interface
    - Create `domain/marketing/repositories/ICampaignRepository.ts`
    - Define methods: findById, findByCouponCode, save, getCustomerUsageCount
    - _Requirements: 6.1_

  - [x] 9.6 Implement CampaignMapper
    - Create `infrastructure/persistence/mappers/CampaignMapper.ts`
    - Implement toDomain and toPersistence methods
    - _Requirements: 6.9_

  - [x] 9.7 Implement CampaignRepository
    - Create `infrastructure/persistence/repositories/CampaignRepository.ts`
    - Implement findById, findByCouponCode, save, getCustomerUsageCount methods
    - _Requirements: 6.8_

  - [x] 9.8 Write integration tests for CampaignRepository
    - Test CRUD operations
    - Test coupon code lookup
    - Test customer usage count tracking
    - _Requirements: 22.1, 22.3_

  - [x] 9.9 Integrate Campaign with PricingService
    - Update PricingService to use Campaign aggregate methods
    - _Requirements: 13.8_

  - [x] 9.10 Register Marketing services in DI container
    - Register CampaignRepository, CampaignMapper
    - _Requirements: 19.2, 19.3_

  - [x] 9.11 Add feature flag for Marketing context
    - Add useDDDMarketing flag to feature flags module
    - Add environment variable USE_DDD_MARKETING
    - _Requirements: 20.1, 20.5_

  - [x] 9.12 Subscribe to OrderPlaced events in Marketing context
    - Implement event handler for campaign redemption tracking
    - _Requirements: 5.8_

  - [x] 9.13 Write integration tests for marketing-order integration
    - Test campaign application during order placement
    - Test CampaignRedeemed event publishing
    - _Requirements: 22.1, 22.4_

- [x] 10. Checkpoint - Marketing complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Phase 6: Fulfillment Context (Week 10)
  - [x] 11.1 Implement ShippingMethod entity
    - Create `domain/fulfillment/entities/ShippingMethod.ts`
    - Implement calculateCost method
    - _Requirements: 16.1, 16.2, 16.3_

  - [x] 11.2 Write unit tests for ShippingMethod
    - Test cost calculation based on order details
    - Test validation rules
    - _Requirements: 21.1_

  - [x] 11.3 Define IShippingMethodRepository interface
    - Create `domain/fulfillment/repositories/IShippingMethodRepository.ts`
    - Define methods: findById, findAll, save
    - _Requirements: 6.1_

  - [x] 11.4 Implement ShippingMethodRepository
    - Create `infrastructure/persistence/repositories/ShippingMethodRepository.ts`
    - Implement repository methods
    - _Requirements: 6.8_

  - [x] 11.5 Integrate ShippingMethod with Order aggregate
    - Update Order aggregate to reference ShippingMethod by ID
    - Update PricingService to use ShippingMethod for cost calculation
    - _Requirements: 16.4, 16.5_

  - [x] 11.6 Register Fulfillment services in DI container
    - Register ShippingMethodRepository
    - _Requirements: 19.2, 19.3_

  - [x] 11.7 Add feature flag for Fulfillment context
    - Add useDDDFulfillment flag to feature flags module
    - Add environment variable USE_DDD_FULFILLMENT
    - _Requirements: 20.1, 20.5_

  - [x] 11.8 Subscribe to PaymentSettled events in Fulfillment context
    - Implement event handler for order fulfillment triggering
    - _Requirements: 5.8_

  - [x] 11.9 Write integration tests for fulfillment-order integration
    - Test shipping method integration with order placement
    - Test event-driven fulfillment workflow
    - _Requirements: 22.1, 22.4_

- [x] 12. Checkpoint - Fulfillment complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Phase 7: Cleanup and Optimization (Week 11-12)
  - [x] 13.1 Enable all feature flags by default
    - Set all USE_DDD_* environment variables to true
    - Update deployment configuration
    - _Requirements: 20.1_

  - [x] 13.2 Remove old Transaction Script implementations
    - Delete old checkout logic from endpoints
    - Delete old cart management logic
    - Delete old catalog logic
    - Remove feature flag conditional code
    - _Requirements: 20.2_

  - [x] 13.3 Optimize database queries
    - Add database indexes for common queries
    - Implement eager loading for aggregate relationships
    - Prevent N+1 query problems
    - _Requirements: 25.1, 25.2_

  - [x] 13.4 Implement caching for read-heavy operations
    - Create CachedProductRepository wrapper
    - Implement cache invalidation on ProductStockChanged events
    - Cache campaign data with TTL
    - _Requirements: 25.3_

  - [x] 13.5 Implement asynchronous event processing
    - Create AsyncEventBus with message queue integration
    - Move event handlers to background workers
    - _Requirements: 5.9, 25.5_

  - [x] 13.6 Add performance monitoring
    - Implement API latency tracking
    - Add database query time logging
    - Track cache hit rates
    - Monitor event processing time
    - _Requirements: 25.6_

  - [x] 13.7 Run performance benchmarks
    - Measure API response times (p50, p95, p99)
    - Compare against baseline measurements
    - Verify < 10% latency increase
    - Test concurrent load handling
    - _Requirements: 25.6, 25.7_

  - [x] 13.8 Create context map documentation
    - Document bounded context relationships
    - Create visual context map diagram
    - Document integration points and event flows
    - _Requirements: 2.7, 23.2_

  - [x] 13.9 Create aggregate diagrams
    - Document Order aggregate structure
    - Document Product aggregate structure
    - Document Customer aggregate structure
    - Document Campaign aggregate structure
    - _Requirements: 23.3_

  - [x] 13.10 Write domain glossary
    - Document all domain terms and ubiquitous language
    - Define aggregate, entity, value object, domain event concepts
    - _Requirements: 23.1_

  - [x] 13.11 Add JSDoc comments to domain methods
    - Document business semantics for all public domain methods
    - Explain invariants and business rules
    - _Requirements: 23.5_

  - [x] 13.12 Create README files for each bounded context
    - Document purpose and key concepts for each context
    - Explain aggregate boundaries and responsibilities
    - _Requirements: 23.6_

  - [x] 13.13 Run final integration test suite
    - Execute all unit tests (verify 90%+ domain coverage)
    - Execute all integration tests
    - Execute contract tests for API compatibility
    - _Requirements: 20.6, 22.1, 22.2_

  - [x] 13.14 Perform load testing
    - Test system under production-like load
    - Verify throughput and latency requirements
    - Identify and fix any performance bottlenecks
    - _Requirements: 25.6_

- [x] 14. Final checkpoint - Migration complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Insomnia API Collection
  - [x] 15.1 Create Insomnia collection file
    - Create `insomnia/workit-api.json` with full Insomnia v4 collection
    - Add environment variables for base URL, auth tokens, guest ID
    - _Requirements: 18.3, 18.4_

  - [x] 15.2 Add Auth requests
    - POST /auth/sign-in/email (admin sign-in — email + password)
    - POST /auth/sign-out (admin sign-out)
    - GET /auth/session (get admin session)
    - POST /api/auth/sign-in/email (storefront customer sign-in)
    - POST /api/auth/sign-up/email (storefront customer sign-up)
    - POST /api/auth/sign-out (storefront customer sign-out)
    - GET /api/auth/session (get storefront session)
    - POST /api/auth/sign-in/social (Google OAuth for storefront)

  - [x] 15.3 Add Storefront - Cart requests
    - GET /api/cart (get cart)
    - POST /api/cart (add item)
    - PUT /api/cart/:lineId (update quantity)
    - DELETE /api/cart/:lineId (remove item)
    - DELETE /api/cart (clear cart)

  - [x] 15.4 Add Storefront - Checkout requests
    - POST /api/checkout/initiate (place order)
    - POST /api/checkout/verify (verify payment)
    - POST /api/checkout/webhook (Paystack webhook)

  - [x] 15.5 Add Catalog - Public requests
    - GET /catalog/products (list products)
    - GET /catalog/products/search (search products)
    - GET /catalog/products/:idOrSlug (get product)

  - [x] 15.6 Add Catalog - Admin requests
    - GET /catalog/products/admin (list admin products)
    - POST /catalog/products/admin (create product)
    - GET /catalog/products/admin/:id (get product)
    - PUT /catalog/products/admin/:id (update product)
    - DELETE /catalog/products/admin/:id (delete product)
    - POST /catalog/products/admin/bulk-delete
    - GET /catalog/products/admin/template (CSV template)
    - GET /catalog/products/admin/export (export CSV)
    - POST /catalog/products/admin/import (import CSV)

  - [x] 15.7 Add Fulfillment - Orders requests
    - GET /fulfillment/orders (list orders)
    - GET /fulfillment/orders/:id (get order)
    - PATCH /fulfillment/orders/:id (update order state)

  - [x] 15.8 Add Fulfillment - Shipping requests
    - GET /fulfillment/shipping (list shipping methods)
    - POST /fulfillment/shipping (create shipping method)
    - PUT /fulfillment/shipping/:id (update shipping method)
    - DELETE /fulfillment/shipping/:id (delete shipping method)

  - [x] 15.9 Add Identity requests
    - GET /identity/customers (list customers)
    - GET /identity/customers/:id (get customer)
    - GET /identity/users (list users)

  - [x] 15.10 Add Marketing requests
    - GET /marketing/campaigns (list campaigns)
    - POST /marketing/campaigns (create campaign)
    - PUT /marketing/campaigns/:id (update campaign)
    - DELETE /marketing/campaigns/:id (delete campaign)
    - GET /marketing/banners (list banners)
    - GET /marketing/blog (list blog posts)

  - [x] 15.11 Add Store (Storefront Public API) requests
    - GET /store/products (storefront products)
    - GET /store/collections (storefront collections)
    - GET /store/settings (store settings)

  - [x] 15.12 Add Analytics requests
    - GET /analytics/dashboard (dashboard stats)

## Notes

- **All new DDD code lives in `backend-v2/` directory**
- **The existing `backend/` directory remains as reference and for shared resources**
- Shared resources (database connection, schemas, auth) can be imported from `backend/` into `backend-v2/`
- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at phase boundaries
- Feature flags enable safe rollout and instant rollback capability
- Migration follows 7 phases over 12 weeks with independent bounded context migration
- No database schema changes required - DDD implementation maps to existing schema
- All domain logic is testable without infrastructure dependencies
- **Insomnia collection lives at `insomnia/workit-api.json`** - import into Insomnia to test all APIs on the go
