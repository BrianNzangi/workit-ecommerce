# Order Management Bounded Context

## Overview

The Order Management context is responsible for handling the complete order lifecycle, from shopping cart management through checkout to order fulfillment. It manages orders, carts, payments, and pricing calculations.

## Purpose

- Manage shopping carts and checkout workflows
- Create and process customer orders
- Handle payment verification and settlement
- Calculate order pricing with discounts and taxes
- Enforce order state transitions and business rules

## Key Concepts

### Aggregates

#### Order Aggregate
The central aggregate representing a customer's purchase. Orders progress through states: CREATED → PAYMENT_SETTLED → FULFILLED.

**Root Entity**: Order
**Entities**: OrderLine, Payment
**Value Objects**: Money, OrderCode

**Key Methods**:
- `create()` - Create a new order
- `transitionTo(state)` - Move to a new state
- `settlePayment(payment)` - Record payment settlement

#### Cart Aggregate
A temporary collection of items before checkout. Carts are converted to orders during the checkout process.

**Root Entity**: Cart
**Entities**: CartLine
**Value Objects**: Money

**Key Methods**:
- `addLine(productId, quantity)` - Add item to cart
- `removeLine(lineId)` - Remove item from cart
- `updateLineQuantity(lineId, quantity)` - Update quantity
- `getTotal()` - Calculate cart total

### Value Objects

- **Money**: Monetary amounts with currency support
- **OrderCode**: Human-readable order identifier (ORD-YYYY-XXXXXX)

### Domain Services

#### PricingService
Calculates order totals including subtotal, shipping, tax, and discounts.

**Methods**:
- `calculateSubtotal(lines)` - Sum of line item prices
- `applyDiscount(subtotal, shipping, campaign)` - Apply campaign discount
- `calculateTotal(subtotal, shipping, tax, discount)` - Final total

#### OrderStateService
Manages valid order state transitions.

**Methods**:
- `isValidTransition(from, to)` - Check if transition is allowed
- `getValidNextStates(currentState)` - Get possible next states

#### PaymentVerificationService
Verifies payments against external payment providers (Paystack).

**Methods**:
- `verifyPayment(paymentRef, expectedAmount)` - Verify payment with provider
- `validatePaymentMetadata(metadata, orderId)` - Validate payment data

### Domain Events

- **OrderPlaced**: Published when an order is created
- **PaymentSettled**: Published when payment is verified
- **OrderStateChanged**: Published when order transitions to a new state

## Bounded Context Relationships

### Depends On
- **Catalog Context**: For product information and stock validation
- **Customer Context**: For customer validation and address information
- **Marketing Context**: For campaign eligibility and discount calculation

### Publishes Events To
- **Fulfillment Context**: OrderPlaced, PaymentSettled
- **Marketing Context**: OrderPlaced (for campaign tracking)

### Subscribes To Events From
- **Catalog Context**: ProductStockChanged (for stock validation)
- **Marketing Context**: CampaignRedeemed (for usage tracking)

## Directory Structure

```
order-management/
├── aggregates/
│   ├── Order.ts          # Order aggregate root
│   └── Cart.ts           # Cart aggregate root
├── entities/
│   ├── OrderLine.ts      # Order line item
│   ├── CartLine.ts       # Cart line item
│   └── Payment.ts        # Payment entity
├── value-objects/
│   ├── Money.ts          # Monetary value
│   └── OrderCode.ts      # Order identifier
├── services/
│   ├── PricingService.ts # Pricing calculations
│   ├── OrderStateService.ts # State management
│   └── PaymentVerificationService.ts # Payment verification
├── repositories/
│   ├── IOrderRepository.ts # Order repository interface
│   └── ICartRepository.ts  # Cart repository interface
├── events/
│   ├── OrderPlaced.ts    # Order placed event
│   ├── PaymentSettled.ts # Payment settled event
│   └── OrderStateChanged.ts # State change event
└── errors/
    ├── InvalidStateTransitionError.ts
    ├── PaymentVerificationError.ts
    └── InvalidMoneyOperationError.ts
```

## Key Business Rules

### Order Processing
1. Orders must have at least one line item
2. Orders progress through defined states only
3. Payment must be verified before fulfillment
4. Orders cannot be modified after payment settlement

### Pricing
1. All prices use the same currency (KES)
2. Prices are stored in cents (no floating-point)
3. Discounts cannot exceed order total
4. Tax is calculated on (subtotal + shipping - discount)

### Payment
1. Payment amount must equal order total
2. Payment currency must match order currency
3. Payment must be verified with external provider
4. Only one payment per order

### State Transitions
```
CREATED
├─ → PAYMENT_SETTLED (via settlePayment)
└─ → CANCELLED

PAYMENT_SETTLED
└─ → FULFILLED

FULFILLED
└─ (terminal state)

CANCELLED
└─ (terminal state)
```

## Integration Points

### With Catalog Context
- **Synchronous**: Validate product availability during order creation
- **Asynchronous**: Receive ProductStockChanged events for stock updates

### With Customer Context
- **Synchronous**: Validate customer and addresses during order creation

### With Marketing Context
- **Synchronous**: Check campaign eligibility and calculate discounts
- **Asynchronous**: Publish OrderPlaced events for campaign tracking

### With Fulfillment Context
- **Asynchronous**: Publish PaymentSettled events to trigger fulfillment

## Testing Strategy

### Unit Tests
- Order state machine transitions
- Payment settlement validation
- Pricing calculations with various discount types
- Cart line item management
- Money value object operations

### Integration Tests
- Order creation with product validation
- Payment verification workflow
- Cart to order conversion
- Event publishing and handling

### Example Test Cases
```typescript
// Order state transitions
test('Order can transition from CREATED to PAYMENT_SETTLED', () => {
  const order = Order.create({...});
  const payment = Payment.create({...});
  order.settlePayment(payment);
  expect(order.state).toBe(OrderState.PAYMENT_SETTLED);
});

// Pricing calculations
test('Discount is applied correctly', () => {
  const subtotal = Money.create(10000);
  const discount = Money.create(1000);
  const total = subtotal.subtract(discount);
  expect(total.amount).toBe(9000);
});

// Cart management
test('Cart line quantity can be updated', () => {
  const cart = Cart.create({...});
  cart.addLine('product-1', 2);
  cart.updateLineQuantity('line-1', 5);
  expect(cart.lines[0].quantity).toBe(5);
});
```

## Performance Considerations

### Optimization Strategies
1. **Eager Loading**: Load order lines and payments with order
2. **Caching**: Cache frequently accessed orders (read-only)
3. **Indexing**: Index by customerId and createdAt for fast queries
4. **Batch Operations**: Process multiple orders in parallel

### Query Patterns
- Find order by ID (with eager loading)
- Find orders by customer ID (paginated)
- Find order by code (unique lookup)

## Future Enhancements

1. **Order Modifications**: Allow limited modifications before payment
2. **Partial Fulfillment**: Support partial order shipments
3. **Order Returns**: Handle return and refund workflows
4. **Order History**: Track all order state changes
5. **Subscription Orders**: Support recurring orders
6. **Order Splitting**: Split orders across multiple shipments

## Related Documentation

- [Context Map](../../../docs/CONTEXT_MAP.md) - Relationships with other contexts
- [Aggregate Diagrams](../../../docs/AGGREGATES.md) - Order and Cart aggregate structures
- [Domain Glossary](../../../docs/GLOSSARY.md) - Domain terminology
