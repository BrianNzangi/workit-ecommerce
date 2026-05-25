# Domain Glossary: Workit E-Commerce

This glossary defines all domain terms and concepts used in the Workit e-commerce system. It represents the Ubiquitous Language shared between developers and domain experts.

## Core DDD Concepts

### Aggregate
A cluster of domain objects (entities and value objects) treated as a single unit for data changes. An aggregate has a root entity (Aggregate Root) that controls access to all objects within the aggregate. All business rule enforcement happens at the aggregate boundary.

**Example**: An Order aggregate contains OrderLine entities and a Payment entity, all managed through the Order aggregate root.

### Aggregate Root
The entry point entity of an aggregate that enforces invariants and consistency boundaries. External objects can only reference the aggregate root, not internal entities.

**Example**: Order is the aggregate root of the Order aggregate. Other contexts reference orders by Order ID, not by OrderLine ID.

### Entity
A domain object with a unique identity that persists over time. Two entities are equal if they have the same identity, even if all their attributes differ.

**Example**: An Order entity has a unique ID. Two orders with the same data but different IDs are different entities.

### Value Object
An immutable object defined by its attributes rather than identity. Two value objects are equal if all their attributes are equal. Value objects have no identity.

**Example**: Money is a value object. Two Money objects with amount=1000 and currency='KES' are equal, regardless of when they were created.

### Domain Event
An event representing something significant that happened in the domain. Domain events are immutable records of past business occurrences that other bounded contexts can react to.

**Example**: OrderPlaced is a domain event published when an order is created. The Fulfillment context subscribes to this event to trigger fulfillment workflows.

### Domain Service
A stateless service containing business logic that doesn't naturally belong to a single entity or value object. Domain services operate on domain objects and enforce business rules.

**Example**: PricingService calculates order totals with discounts. It's a domain service because pricing logic spans multiple entities (Order, Campaign, ShippingMethod).

### Repository
An interface for accessing and persisting aggregates. Repositories abstract data access, allowing domain logic to remain independent of persistence technology.

**Example**: IOrderRepository defines methods to find and save Order aggregates. The infrastructure layer provides the Drizzle ORM implementation.

### Bounded Context
A logical boundary within which a particular domain model is defined and applicable. Each bounded context has its own ubiquitous language and domain model.

**Example**: The Catalog context manages products and stock. The Order Management context manages orders and payments. These are separate bounded contexts with different models.

### Ubiquitous Language
A common language shared by developers and domain experts. The ubiquitous language is reflected in code through class names, method names, and variable names.

**Example**: Instead of "item" or "product_order_line", we use "OrderLine" because that's the term domain experts use.

### Invariant
A business rule that must always be true for a domain object. Invariants are enforced by the aggregate root.

**Example**: An Order's payment amount must equal the order total. This invariant is enforced by the Order.settlePayment() method.

---

## Catalog Context

### Product
An item available for purchase in the catalog. Products have pricing, stock levels, and metadata.

**Attributes**: ID, SKU, name, description, originalPrice, salePrice, stockOnHand, enabled, brandId

**Invariants**: 
- Stock must be non-negative
- Sale price (if present) must be <= original price
- SKU must be unique

### Brand
A manufacturer or vendor of products. Brands group related products.

**Attributes**: ID, name, slug, description, logoUrl, enabled

### Collection
A grouping of products by category or theme. Collections can be nested.

**Attributes**: ID, name, slug, description, parentId, enabled, sortOrder

### Asset
A media file (image, video, etc.) associated with products or collections.

**Attributes**: ID, name, type, mimeType, fileSize, source, preview, width, height

### ProductSKU (Value Object)
Stock Keeping Unit - a unique identifier for a product variant. Used for inventory tracking.

**Format**: Alphanumeric string (e.g., "PROD-001-BLK-M")

### Stock Reservation
The process of allocating product inventory to an order. Reserved stock is no longer available for other orders.

**Example**: When an order is placed, the Product aggregate reserves the ordered quantity.

---

## Order Management Context

### Order
A customer's purchase request containing one or more line items. Orders progress through states: CREATED → PAYMENT_SETTLED → FULFILLED.

**Attributes**: ID, code, customerId, state, lines, payment, pricing, addresses, shippingMethod

**Invariants**:
- Must have at least one line item
- Payment amount must equal order total
- State transitions must be valid
- Both shipping and billing addresses required

### OrderCode (Value Object)
A human-readable unique identifier for an order. Format: ORD-YYYY-XXXXXX

**Example**: ORD-2024-000001

### OrderLine
A single item in an order. Contains product reference, quantity, and line price.

**Attributes**: ID, orderId, productId, quantity, linePrice

### OrderState
The current state of an order in its lifecycle.

**States**:
- **CREATED**: Order created, awaiting payment
- **PAYMENT_SETTLED**: Payment verified, ready for fulfillment
- **FULFILLED**: Order shipped to customer
- **CANCELLED**: Order cancelled by customer or system

### Cart
A temporary collection of items a customer intends to purchase. Carts are converted to orders during checkout.

**Attributes**: ID, customerId/guestId, lines, createdAt, updatedAt

### CartLine
A single item in a shopping cart.

**Attributes**: ID, cartId, productId, quantity, linePrice

### Payment
Payment information for an order. Contains payment method, amount, and verification status.

**Attributes**: ID, orderId, method, amount, state, transactionId, paystackRef, metadata

### PaymentState
The current state of a payment.

**States**:
- **PENDING**: Payment awaiting verification
- **SETTLED**: Payment verified and accepted
- **FAILED**: Payment verification failed
- **REFUNDED**: Payment refunded to customer

### Money (Value Object)
A monetary amount with currency. Immutable and supports arithmetic operations.

**Attributes**: amount (in cents), currency (e.g., 'KES')

**Invariants**: Amount must be non-negative

**Operations**: add, subtract, multiply

### Pricing
The calculation of order totals including subtotal, shipping, tax, and discounts.

**Components**:
- **Subtotal**: Sum of all line item prices
- **Shipping**: Shipping cost based on method and destination
- **Tax**: Sales tax or VAT
- **Discount**: Reduction from campaigns or coupons
- **Total**: Subtotal + Shipping + Tax - Discount

---

## Customer Management Context

### Customer
A registered user of the platform. Customers have profiles, addresses, and order history.

**Attributes**: ID, email, name, phoneNumber, addresses, defaultShippingAddressId, defaultBillingAddressId

**Invariants**: Email must be unique

### Address (Value Object)
A physical location for shipping or billing. Immutable once created.

**Attributes**: fullName, streetLine1, streetLine2, city, province, postalCode, country, phoneNumber

**Invariants**: All required fields must be present

### Email (Value Object)
A customer's email address. Immutable and must be unique.

**Format**: Valid email format (RFC 5322)

### PhoneNumber (Value Object)
A customer's phone number. Immutable and must be valid.

**Format**: International format with country code (e.g., +254712345678)

---

## Marketing Context

### Campaign
A promotional offer with discount rules and eligibility criteria. Campaigns can be time-limited or ongoing.

**Attributes**: ID, name, couponCode, discountType, discountValue, minPurchaseAmount, maxDiscountAmount, startDate, endDate, usageLimit, usagePerCustomer, status

**Invariants**:
- Start date must be before end date
- Usage count must not exceed usage limit
- Only ACTIVE campaigns can be redeemed

### DiscountType
The type of discount applied by a campaign.

**Types**:
- **PERCENTAGE**: Discount as percentage of subtotal (e.g., 10% off)
- **FIXED_AMOUNT**: Fixed discount amount (e.g., 500 KES off)
- **FREE_SHIPPING**: Free shipping on order
- **BUY_X_GET_Y**: Bundle discount (e.g., buy 2 get 1 free)

### CampaignRedemption
A record of a campaign being used by a customer on an order.

**Attributes**: ID, campaignId, customerId, orderId, createdAt

**Purpose**: Track campaign usage for analytics and eligibility enforcement

### Banner
A promotional banner displayed on the storefront.

**Attributes**: ID, title, description, position, enabled, desktopImageId, mobileImageId, collectionId, productId, campaignId

### BlogPost
A blog article for content marketing.

**Attributes**: ID, title, slug, content, excerpt, author, published, publishedAt, assetId

---

## Fulfillment Context

### ShippingMethod
A method for delivering orders to customers. Defines shipping cost calculation.

**Attributes**: ID, code, name, description, enabled, isExpress

**Example**: Standard (3-5 days), Express (1-2 days), Overnight

### ShippingZone
A geographic zone for shipping cost calculation. Typically a county or region.

**Attributes**: ID, shippingMethodId, county

### ShippingCity
A city within a shipping zone with specific shipping costs.

**Attributes**: ID, zoneId, cityTown, standardPrice, expressPrice

### Fulfillment
The process of preparing and shipping an order to the customer.

**States**:
- **PENDING**: Order awaiting fulfillment
- **PROCESSING**: Order being prepared
- **SHIPPED**: Order shipped to customer
- **DELIVERED**: Order delivered to customer

---

## Event Types

### OrderPlaced
Published when an order is created.

**Data**: orderId, customerId, totalAmount

**Subscribers**: Fulfillment, Marketing

### PaymentSettled
Published when payment is verified and accepted.

**Data**: orderId, paymentId, amount

**Subscribers**: Fulfillment

### ProductStockChanged
Published when product stock is reserved or released.

**Data**: productId, oldStock, newStock

**Subscribers**: Order Management

### CustomerRegistered
Published when a new customer account is created.

**Data**: customerId, email, name

**Subscribers**: All contexts

### CampaignRedeemed
Published when a campaign/coupon is applied to an order.

**Data**: campaignId, customerId, orderId

**Subscribers**: Marketing

### OrderFulfilled
Published when an order is prepared for shipment.

**Data**: orderId, fulfillmentId

**Subscribers**: Notification

### OrderShipped
Published when an order is shipped.

**Data**: orderId, trackingNumber

**Subscribers**: Notification

---

## Business Rules

### Stock Management
- Products have a finite stock level
- Stock is reserved when an order is placed
- Stock is released if an order is cancelled
- Stock cannot go negative

### Order Processing
- Orders must have at least one line item
- Orders progress through defined states
- Payment must be verified before fulfillment
- Orders cannot be modified after payment settlement

### Pricing
- Prices are stored in cents to avoid floating-point errors
- All prices use the same currency (KES)
- Discounts cannot exceed the order total
- Tax is calculated on subtotal + shipping - discount

### Campaign Eligibility
- Campaigns must be ACTIVE to be redeemed
- Campaigns must be within their date range
- Customer must not exceed usage limit per campaign
- Order subtotal must meet minimum purchase requirement

### Customer Management
- Email addresses must be unique
- Customers can have multiple addresses
- One default shipping address and one default billing address
- Addresses are immutable (new address created for changes)

---

## Relationships

### Cross-Context References
- **Order** references **Customer** by ID
- **Order** references **Product** by ID (via OrderLine)
- **Order** references **Campaign** by ID (for discount)
- **Order** references **ShippingMethod** by ID
- **Campaign** references **Product** by ID (for eligibility)

### Event-Driven Communication
- **Catalog** → **Order Management**: ProductStockChanged
- **Order Management** → **Fulfillment**: PaymentSettled
- **Order Management** → **Marketing**: OrderPlaced
- **Marketing** → **Order Management**: CampaignRedeemed

---

## Consistency Boundaries

### Strong Consistency (Within Aggregate)
- All changes within an aggregate are atomic
- Invariants are enforced immediately
- Example: Order and its OrderLines are always consistent

### Eventual Consistency (Between Contexts)
- Changes across contexts are eventually consistent
- Consistency is achieved through domain events
- Example: When stock changes, Order Management eventually receives ProductStockChanged event

---

## Naming Conventions

### Classes
- **Aggregates**: Noun (Order, Product, Campaign)
- **Entities**: Noun (OrderLine, Payment, Address)
- **Value Objects**: Noun (Money, OrderCode, Email)
- **Services**: Noun + Service (PricingService, StockAllocationService)
- **Repositories**: Noun + Repository (OrderRepository, ProductRepository)

### Methods
- **Queries**: get/find + Noun (findById, getTotal)
- **Commands**: Verb + Noun (addLine, settlePayment, reserveStock)
- **Predicates**: is/has + Adjective (isEligible, hasStock)

### Events
- **Format**: Noun + Past Tense (OrderPlaced, PaymentSettled, ProductStockChanged)

---

## Acronyms

- **DDD**: Domain-Driven Design
- **SKU**: Stock Keeping Unit
- **VAT**: Value Added Tax
- **UUID**: Universally Unique Identifier
- **ORM**: Object-Relational Mapping
- **CQRS**: Command Query Responsibility Segregation
- **TTL**: Time To Live (for caching)
