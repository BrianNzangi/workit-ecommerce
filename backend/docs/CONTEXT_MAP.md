# Context Map: Workit E-Commerce DDD Architecture

## Overview

This document describes the bounded contexts in the Workit e-commerce system and their relationships. The system is organized into five independent bounded contexts that communicate through domain events.

## Bounded Contexts

### 1. Catalog Context

**Purpose**: Manage product catalog, inventory, and search functionality.

**Core Concepts**:
- Product (Aggregate Root)
- Brand (Entity)
- Collection (Entity)
- Asset (Entity)
- ProductSKU (Value Object)
- Stock management

**Key Responsibilities**:
- Product creation and management
- Stock level tracking and updates
- Product search and filtering
- Brand and collection management

**Published Events**:
- `ProductStockChanged` - When product stock is reserved or released
- `ProductCreated` - When a new product is added
- `ProductUpdated` - When product details change

**Subscribed Events**: None (upstream context)

**Database Tables**:
- `Product` - Product aggregate root
- `Brand` - Brand entity
- `Collection` - Collection entity
- `Asset` - Media assets
- `ProductAsset` - Product-asset relationships
- `ProductCollection` - Product-collection relationships

---

### 2. Order Management Context

**Purpose**: Handle shopping cart, checkout, order processing, and payment verification.

**Core Concepts**:
- Order (Aggregate Root)
- Cart (Aggregate Root)
- OrderLine (Entity)
- CartLine (Entity)
- Payment (Entity)
- Money (Value Object)
- OrderCode (Value Object)

**Key Responsibilities**:
- Cart management (add/remove items, update quantities)
- Order creation from cart
- Order state transitions (CREATED → PAYMENT_SETTLED → FULFILLED)
- Payment verification and settlement
- Pricing calculations with discounts

**Published Events**:
- `OrderPlaced` - When an order is created
- `PaymentSettled` - When payment is verified
- `OrderStateChanged` - When order transitions to a new state

**Subscribed Events**:
- `ProductStockChanged` - To validate stock availability
- `CampaignRedeemed` - To track campaign usage

**Database Tables**:
- `Order` - Order aggregate root
- `OrderLine` - Order line items
- `Payment` - Payment information
- `Cart` - Shopping cart (from cart schema)
- `CartLine` - Cart line items

---

### 3. Customer Management Context

**Purpose**: Manage customer identity, profiles, and address information.

**Core Concepts**:
- Customer (Aggregate Root)
- Address (Value Object)
- Email (Value Object)
- PhoneNumber (Value Object)

**Key Responsibilities**:
- Customer registration and profile management
- Address management (shipping and billing)
- Email and phone validation
- Customer identity verification

**Published Events**:
- `CustomerRegistered` - When a new customer account is created
- `CustomerUpdated` - When customer profile changes

**Subscribed Events**: None (upstream context)

**Database Tables**:
- `user` - Customer aggregate root (from identity schema)
- `Address` - Customer addresses

---

### 4. Fulfillment Context

**Purpose**: Manage shipping methods, order fulfillment, and delivery.

**Core Concepts**:
- ShippingMethod (Entity)
- Fulfillment (Aggregate Root)
- DeliveryAddress (Value Object)

**Key Responsibilities**:
- Shipping method management
- Shipping cost calculation
- Order fulfillment workflow
- Delivery tracking

**Published Events**:
- `OrderFulfilled` - When order is prepared for shipment
- `OrderShipped` - When order is shipped

**Subscribed Events**:
- `PaymentSettled` - To trigger fulfillment workflow

**Database Tables**:
- `ShippingMethod` - Shipping method definitions
- `ShippingZone` - Geographic zones for shipping
- `ShippingCity` - City-level shipping costs

---

### 5. Marketing Context

**Purpose**: Manage campaigns, discounts, banners, and promotional content.

**Core Concepts**:
- Campaign (Aggregate Root)
- CampaignRedemption (Entity)
- Banner (Entity)
- BlogPost (Entity)

**Key Responsibilities**:
- Campaign creation and management
- Discount and coupon code management
- Campaign eligibility validation
- Promotional banner management
- Blog content management

**Published Events**:
- `CampaignRedeemed` - When a campaign/coupon is applied to an order

**Subscribed Events**:
- `OrderPlaced` - To track campaign effectiveness

**Database Tables**:
- `Campaign` - Campaign aggregate root
- `CampaignProduct` - Campaign-product relationships
- `CampaignRedemption` - Campaign usage tracking
- `Banner` - Promotional banners
- `Blog` - Blog posts

---

## Context Relationships

### Relationship Map

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Customer Management ◄──────────────────────────────────┐  │
│  (Upstream)                                             │  │
│                                                         │  │
│  Catalog ◄──────────────────────────────────────────┐  │  │
│  (Upstream)                                         │  │  │
│                                                     │  │  │
│  Marketing ◄──────────────────────────────────────┐│  │  │
│  (Upstream)                                       ││  │  │
│                                                   ││  │  │
│  Order Management (Core)                          ││  │  │
│  ├─ Depends on: Catalog, Customer, Marketing     ││  │  │
│  ├─ Publishes: OrderPlaced, PaymentSettled       ││  │  │
│  └─ Subscribes to: ProductStockChanged           ││  │  │
│                                                   ││  │  │
│  Fulfillment (Downstream)                         ││  │  │
│  ├─ Depends on: Order Management                 ││  │  │
│  ├─ Publishes: OrderFulfilled, OrderShipped      ││  │  │
│  └─ Subscribes to: PaymentSettled ───────────────┘│  │  │
│                                                    │  │  │
└────────────────────────────────────────────────────┘  │  │
                                                        │  │
                                                        │  │
                                                        └──┘
```

### Integration Points

#### 1. Catalog → Order Management
- **Type**: Customer/Supplier relationship
- **Flow**: Order Management depends on Catalog for product information
- **Events**: `ProductStockChanged` notifies Order Management of stock updates
- **Data Passed**: Product ID, SKU, current price, stock level

#### 2. Customer Management → Order Management
- **Type**: Conformist relationship
- **Flow**: Order Management uses Customer ID as-is
- **Events**: `CustomerRegistered` notifies other contexts of new customers
- **Data Passed**: Customer ID, email, addresses

#### 3. Marketing → Order Management
- **Type**: Partnership relationship
- **Flow**: Shared campaign validation logic
- **Events**: `CampaignRedeemed` tracks campaign usage
- **Data Passed**: Campaign ID, discount amount, coupon code

#### 4. Order Management → Fulfillment
- **Type**: Customer/Supplier relationship
- **Flow**: Fulfillment depends on Order Management for order data
- **Events**: `PaymentSettled` triggers fulfillment workflow
- **Data Passed**: Order ID, order lines, shipping address, shipping method

---

## Event Flow Diagrams

### Order Placement Flow

```
Customer places order
        │
        ▼
Order Management Context
├─ Validate cart contents
├─ Check product availability (Catalog)
├─ Validate customer (Customer Management)
├─ Apply campaign discount (Marketing)
├─ Create Order aggregate
├─ Publish: OrderPlaced
└─ Publish: PaymentSettled
        │
        ├─────────────────────────────────────┐
        │                                     │
        ▼                                     ▼
   Marketing Context              Fulfillment Context
   ├─ Track campaign usage        ├─ Receive PaymentSettled
   ├─ Update redemption count     ├─ Create fulfillment
   └─ Publish: CampaignRedeemed   └─ Publish: OrderFulfilled
```

### Stock Update Flow

```
Product stock changes
        │
        ▼
Catalog Context
├─ Update Product aggregate
├─ Publish: ProductStockChanged
        │
        ▼
Order Management Context
├─ Receive ProductStockChanged
├─ Validate pending orders
└─ Update order status if needed
```

---

## Communication Patterns

### Synchronous Communication
- **Order Management** → **Catalog**: Product lookup during order creation
- **Order Management** → **Customer Management**: Customer validation
- **Order Management** → **Marketing**: Campaign eligibility check

### Asynchronous Communication (Event-Driven)
- **Catalog** → **Order Management**: `ProductStockChanged` events
- **Order Management** → **Fulfillment**: `PaymentSettled` events
- **Order Management** → **Marketing**: `OrderPlaced` events
- **Marketing** → **Order Management**: `CampaignRedeemed` events

---

## Data Consistency Boundaries

### Aggregate Boundaries
Each bounded context owns its aggregates and is responsible for maintaining consistency within those aggregates:

- **Catalog**: Product aggregate (with stock)
- **Order Management**: Order and Cart aggregates
- **Customer Management**: Customer aggregate (with addresses)
- **Marketing**: Campaign aggregate
- **Fulfillment**: Fulfillment aggregate

### Eventual Consistency
Cross-context consistency is achieved through domain events:
- When an order is placed, the Catalog context eventually receives `OrderPlaced` event
- When stock changes, Order Management eventually receives `ProductStockChanged` event
- Consistency is eventual, not immediate

---

## Deployment Considerations

### Independent Deployment
Each bounded context can be deployed independently:
- Changes to Catalog don't require Order Management deployment
- Changes to Marketing don't affect Fulfillment
- Feature flags control which context implementation is active

### Database Isolation
Each context owns its database tables:
- Catalog: `Product`, `Brand`, `Collection`, `Asset`, etc.
- Order Management: `Order`, `OrderLine`, `Payment`, `Cart`, etc.
- Customer Management: `user`, `Address`
- Marketing: `Campaign`, `CampaignRedemption`, `Banner`, `Blog`
- Fulfillment: `ShippingMethod`, `ShippingZone`, `ShippingCity`

### Event Bus
All contexts connect through a shared event bus for asynchronous communication.

---

## Future Considerations

### Potential New Contexts
- **Analytics Context**: Order analytics, customer behavior tracking
- **Notification Context**: Email, SMS, push notifications
- **Review Context**: Product reviews and ratings
- **Wishlist Context**: Customer wishlists and saved items

### Scaling Opportunities
- Separate event bus for high-volume events
- Dedicated read models for reporting
- CQRS pattern for complex queries
- Saga pattern for distributed transactions
