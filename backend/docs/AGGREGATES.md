# Aggregate Diagrams: Workit E-Commerce DDD Architecture

## Overview

This document provides detailed diagrams and descriptions of the aggregates in each bounded context. Aggregates are clusters of domain objects treated as a single unit for data changes.

---

## 1. Order Aggregate

**Context**: Order Management

**Aggregate Root**: Order

**Purpose**: Represents a customer's order with all associated line items and payment information.

### Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Order (Aggregate Root)                   │
├─────────────────────────────────────────────────────────────┤
│ Properties:                                                 │
│ • id: string (UUID)                                         │
│ • code: OrderCode (Value Object)                            │
│ • customerId: string (reference to Customer)                │
│ • state: OrderState (CREATED | PAYMENT_SETTLED | FULFILLED) │
│ • lines: OrderLine[] (Entities)                             │
│ • payment: Payment (Entity, optional)                       │
│ • subTotal: Money (Value Object)                            │
│ • shipping: Money (Value Object)                            │
│ • tax: Money (Value Object)                                 │
│ • discount: Money (Value Object)                            │
│ • total: Money (Value Object)                               │
│ • shippingAddressId: string (reference to Address)          │
│ • billingAddressId: string (reference to Address)           │
│ • shippingMethodId: string (reference to ShippingMethod)    │
│ • createdAt: Date                                           │
│ • updatedAt: Date                                           │
├─────────────────────────────────────────────────────────────┤
│ Methods:                                                    │
│ • create(): Order                                           │
│ • transitionTo(newState): void                              │
│ • settlePayment(payment): void                              │
│ • isValidTransition(from, to): boolean                      │
├─────────────────────────────────────────────────────────────┤
│ Domain Events:                                              │
│ • OrderPlaced (on creation)                                 │
│ • OrderStateChanged (on state transition)                   │
└─────────────────────────────────────────────────────────────┘
         │
         ├─────────────────────────────────────────────────────┐
         │                                                     │
         ▼                                                     ▼
    ┌─────────────────────┐                          ┌──────────────────┐
    │   OrderLine         │                          │    Payment       │
    │   (Entity)          │                          │    (Entity)      │
    ├─────────────────────┤                          ├──────────────────┤
    │ • id: string        │                          │ • id: string     │
    │ • productId: string │                          │ • amount: Money  │
    │ • quantity: number  │                          │ • state: enum    │
    │ • linePrice: Money  │                          │ • method: string │
    │ • totalPrice: Money │                          │ • transactionId  │
    └─────────────────────┘                          │ • paystackRef    │
                                                     │ • metadata: JSON │
                                                     └──────────────────┘
```

### State Machine

```
┌─────────┐
│ CREATED │ ◄─── Order is created
└────┬────┘
     │ settlePayment()
     ▼
┌──────────────────┐
│ PAYMENT_SETTLED  │ ◄─── Payment verified
└────┬─────────────┘
     │ transitionTo(FULFILLED)
     ▼
┌───────────┐
│ FULFILLED │ ◄─── Order shipped
└───────────┘

Alternative:
┌─────────┐
│ CREATED │
└────┬────┘
     │ transitionTo(CANCELLED)
     ▼
┌───────────┐
│ CANCELLED │
└───────────┘
```

### Invariants

1. **State Transitions**: Only valid transitions are allowed (see state machine)
2. **Payment Amount**: Payment amount must equal order total
3. **Currency Consistency**: All Money values must use the same currency
4. **Line Items**: Order must have at least one line item
5. **Addresses**: Both shipping and billing addresses must be provided

---

## 2. Cart Aggregate

**Context**: Order Management

**Aggregate Root**: Cart

**Purpose**: Represents a customer's shopping cart before checkout.

### Structure

```
┌──────────────────────────────────────────────────────────┐
│              Cart (Aggregate Root)                       │
├──────────────────────────────────────────────────────────┤
│ Properties:                                              │
│ • id: string (UUID)                                      │
│ • customerId: string (optional, for guest carts)         │
│ • guestId: string (optional, for anonymous carts)        │
│ • lines: CartLine[] (Entities)                           │
│ • createdAt: Date                                        │
│ • updatedAt: Date                                        │
├──────────────────────────────────────────────────────────┤
│ Methods:                                                 │
│ • addLine(productId, quantity): void                     │
│ • removeLine(lineId): void                               │
│ • updateLineQuantity(lineId, quantity): void             │
│ • clear(): void                                          │
│ • getTotal(): Money                                      │
│ • validate(): void                                       │
├──────────────────────────────────────────────────────────┤
│ Domain Events: None (cart is transient)                  │
└──────────────────────────────────────────────────────────┘
         │
         ▼
    ┌──────────────────────┐
    │   CartLine           │
    │   (Entity)           │
    ├──────────────────────┤
    │ • id: string         │
    │ • productId: string  │
    │ • quantity: number   │
    │ • linePrice: Money   │
    │ • totalPrice: Money  │
    └──────────────────────┘
```

### Invariants

1. **Quantity**: Line item quantity must be positive
2. **Product Availability**: All products must exist and be enabled
3. **Stock Availability**: Quantity must not exceed available stock
4. **Uniqueness**: Each product can only appear once in cart

---

## 3. Product Aggregate

**Context**: Catalog

**Aggregate Root**: Product

**Purpose**: Represents a product in the catalog with pricing and stock information.

### Structure

```
┌──────────────────────────────────────────────────────────┐
│            Product (Aggregate Root)                      │
├──────────────────────────────────────────────────────────┤
│ Properties:                                              │
│ • id: string (UUID)                                      │
│ • sku: ProductSKU (Value Object)                         │
│ • name: string                                           │
│ • description: string                                    │
│ • originalPrice: Money (Value Object)                    │
│ • salePrice: Money (Value Object, optional)              │
│ • stockOnHand: number                                    │
│ • enabled: boolean                                       │
│ • brandId: string (reference to Brand)                   │
│ • createdAt: Date                                        │
│ • updatedAt: Date                                        │
├──────────────────────────────────────────────────────────┤
│ Methods:                                                 │
│ • create(): Product                                      │
│ • reserveStock(quantity): void                           │
│ • releaseStock(quantity): void                           │
│ • getCurrentPrice(): Money                               │
│ • validateInvariants(): void                             │
├──────────────────────────────────────────────────────────┤
│ Domain Events:                                           │
│ • ProductStockChanged (on stock update)                  │
│ • ProductCreated (on creation)                           │
│ • ProductUpdated (on modification)                       │
└──────────────────────────────────────────────────────────┘
```

### Invariants

1. **Stock Non-Negative**: stockOnHand must always be >= 0
2. **Price Validity**: salePrice (if present) must be <= originalPrice
3. **SKU Uniqueness**: SKU must be unique across all products
4. **Positive Prices**: Both originalPrice and salePrice must be positive

---

## 4. Customer Aggregate

**Context**: Customer Management

**Aggregate Root**: Customer

**Purpose**: Represents a customer with their profile and addresses.

### Structure

```
┌──────────────────────────────────────────────────────────┐
│           Customer (Aggregate Root)                      │
├──────────────────────────────────────────────────────────┤
│ Properties:                                              │
│ • id: string (UUID)                                      │
│ • email: Email (Value Object)                            │
│ • name: string                                           │
│ • phoneNumber: PhoneNumber (Value Object)                │
│ • addresses: Address[] (Value Objects)                   │
│ • defaultShippingAddressId: string (optional)            │
│ • defaultBillingAddressId: string (optional)             │
│ • createdAt: Date                                        │
│ • updatedAt: Date                                        │
├──────────────────────────────────────────────────────────┤
│ Methods:                                                 │
│ • create(): Customer                                     │
│ • addAddress(address): void                              │
│ • setDefaultShippingAddress(addressId): void             │
│ • setDefaultBillingAddress(addressId): void              │
│ • removeAddress(addressId): void                         │
├──────────────────────────────────────────────────────────┤
│ Domain Events:                                           │
│ • CustomerRegistered (on creation)                       │
│ • CustomerUpdated (on modification)                      │
└──────────────────────────────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────────┐
    │   Address (Value Object)             │
    ├──────────────────────────────────────┤
    │ • fullName: string                   │
    │ • streetLine1: string                │
    │ • streetLine2: string (optional)     │
    │ • city: string                       │
    │ • province: string                   │
    │ • postalCode: string                 │
    │ • country: string                    │
    │ • phoneNumber: PhoneNumber           │
    │ • defaultShipping: boolean           │
    │ • defaultBilling: boolean            │
    └──────────────────────────────────────┘
```

### Invariants

1. **Email Uniqueness**: Email must be unique across all customers
2. **Address Validation**: All required address fields must be present
3. **Default Addresses**: Default addresses must exist in the addresses collection
4. **Phone Format**: Phone number must be valid

---

## 5. Campaign Aggregate

**Context**: Marketing

**Aggregate Root**: Campaign

**Purpose**: Represents a marketing campaign with discount rules and eligibility criteria.

### Structure

```
┌──────────────────────────────────────────────────────────┐
│           Campaign (Aggregate Root)                      │
├──────────────────────────────────────────────────────────┤
│ Properties:                                              │
│ • id: string (UUID)                                      │
│ • name: string                                           │
│ • couponCode: string (optional)                          │
│ • discountType: DiscountType enum                        │
│ • discountValue: number                                  │
│ • minPurchaseAmount: Money (optional)                    │
│ • maxDiscountAmount: Money (optional)                    │
│ • startDate: Date                                        │
│ • endDate: Date (optional)                               │
│ • usageLimit: number (optional)                          │
│ • usagePerCustomer: number (optional)                    │
│ • currentUsageCount: number                              │
│ • status: 'ACTIVE' | 'INACTIVE'                          │
├──────────────────────────────────────────────────────────┤
│ Methods:                                                 │
│ • create(): Campaign                                     │
│ • isEligible(params): boolean                            │
│ • calculateDiscount(subtotal, shipping): Money           │
│ • redeem(customerId, orderId): void                      │
├──────────────────────────────────────────────────────────┤
│ Domain Events:                                           │
│ • CampaignRedeemed (on redemption)                       │
└──────────────────────────────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────────┐
    │ CampaignRedemption (Entity)          │
    ├──────────────────────────────────────┤
    │ • id: string                         │
    │ • customerId: string                 │
    │ • orderId: string                    │
    │ • createdAt: Date                    │
    └──────────────────────────────────────┘
```

### Discount Types

```
PERCENTAGE
├─ Discount = (subtotal * discountValue) / 100
├─ Capped by maxDiscountAmount if present
└─ Example: 10% off

FIXED_AMOUNT
├─ Discount = discountValue
└─ Example: 500 KES off

FREE_SHIPPING
├─ Discount = shipping cost
└─ Example: Free shipping

BUY_X_GET_Y
├─ Complex logic for bundle discounts
└─ Example: Buy 2 get 1 free
```

### Invariants

1. **Date Range**: startDate must be before endDate (if endDate present)
2. **Usage Limits**: currentUsageCount must not exceed usageLimit
3. **Discount Value**: discountValue must be positive
4. **Status Consistency**: Only ACTIVE campaigns can be redeemed
5. **Eligibility**: Campaign must pass all eligibility checks before redemption

---

## Value Objects

### Money

```
┌──────────────────────────────────────┐
│   Money (Value Object)               │
├──────────────────────────────────────┤
│ Properties:                          │
│ • amount: number (cents)             │
│ • currency: string (e.g., 'KES')     │
├──────────────────────────────────────┤
│ Methods:                             │
│ • add(other): Money                  │
│ • subtract(other): Money             │
│ • multiply(factor): Money            │
│ • equals(other): boolean             │
├──────────────────────────────────────┤
│ Invariants:                          │
│ • amount >= 0                        │
│ • currency must match for operations │
└──────────────────────────────────────┘
```

### OrderCode

```
┌──────────────────────────────────────┐
│   OrderCode (Value Object)           │
├──────────────────────────────────────┤
│ Properties:                          │
│ • value: string (e.g., 'ORD-2024-001')│
├──────────────────────────────────────┤
│ Methods:                             │
│ • create(): OrderCode                │
│ • equals(other): boolean             │
├──────────────────────────────────────┤
│ Invariants:                          │
│ • Format: ORD-YYYY-XXXXXX            │
│ • Unique across all orders           │
└──────────────────────────────────────┘
```

### ProductSKU

```
┌──────────────────────────────────────┐
│   ProductSKU (Value Object)          │
├──────────────────────────────────────┤
│ Properties:                          │
│ • value: string (e.g., 'PROD-001')   │
├──────────────────────────────────────┤
│ Methods:                             │
│ • create(value): ProductSKU          │
│ • equals(other): boolean             │
├──────────────────────────────────────┤
│ Invariants:                          │
│ • Non-empty string                   │
│ • Unique across all products         │
└──────────────────────────────────────┘
```

### Email

```
┌──────────────────────────────────────┐
│   Email (Value Object)               │
├──────────────────────────────────────┤
│ Properties:                          │
│ • value: string                      │
├──────────────────────────────────────┤
│ Methods:                             │
│ • create(value): Email               │
│ • equals(other): boolean             │
├──────────────────────────────────────┤
│ Invariants:                          │
│ • Valid email format                 │
│ • Unique across all customers        │
└──────────────────────────────────────┘
```

### PhoneNumber

```
┌──────────────────────────────────────┐
│   PhoneNumber (Value Object)         │
├──────────────────────────────────────┤
│ Properties:                          │
│ • value: string (e.g., '+254712345678')│
├──────────────────────────────────────┤
│ Methods:                             │
│ • create(value): PhoneNumber         │
│ • equals(other): boolean             │
├──────────────────────────────────────┤
│ Invariants:                          │
│ • Valid phone format                 │
│ • Includes country code              │
└──────────────────────────────────────┘
```

---

## Aggregate Lifecycle

### Order Aggregate Lifecycle

```
1. Creation
   └─ Order.create() → OrderPlaced event

2. Payment Settlement
   └─ Order.settlePayment() → PaymentSettled event

3. Fulfillment
   └─ Order.transitionTo(FULFILLED) → OrderStateChanged event

4. Completion
   └─ Order in FULFILLED state
```

### Product Aggregate Lifecycle

```
1. Creation
   └─ Product.create() → ProductCreated event

2. Stock Management
   ├─ Product.reserveStock() → ProductStockChanged event
   └─ Product.releaseStock() → ProductStockChanged event

3. Updates
   └─ Product modifications → ProductUpdated event

4. Soft Delete
   └─ Product.deletedAt set (not hard deleted)
```

### Campaign Aggregate Lifecycle

```
1. Creation
   └─ Campaign.create() → Campaign in DRAFT status

2. Activation
   └─ Campaign status → ACTIVE

3. Redemption
   ├─ Campaign.isEligible() → validation
   ├─ Campaign.calculateDiscount() → discount amount
   └─ Campaign.redeem() → CampaignRedeemed event

4. Expiration
   └─ Campaign.endDate passed → no longer eligible
```
