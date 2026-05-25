# Fulfillment Bounded Context

## Overview

The Fulfillment context manages shipping methods, order fulfillment, and delivery. It's a downstream context that reacts to order events and manages the fulfillment workflow.

## Purpose

- Define and manage shipping methods
- Calculate shipping costs based on location
- Manage order fulfillment workflow
- Track order shipment and delivery
- Provide shipping information to customers

## Key Concepts

### Entities

#### ShippingMethod
Represents a shipping method available to customers.

**Attributes**: ID, code, name, description, enabled, isExpress

**Key Methods**:
- `calculateCost(order)` - Calculate shipping cost for an order
- `isAvailable()` - Check if method is available

#### ShippingZone
A geographic zone for shipping cost calculation.

**Attributes**: ID, shippingMethodId, county

#### ShippingCity
A city within a shipping zone with specific costs.

**Attributes**: ID, zoneId, cityTown, standardPrice, expressPrice

### Domain Services

None (shipping logic is relatively simple)

### Domain Events

- **OrderFulfilled**: Published when order is prepared for shipment
- **OrderShipped**: Published when order is shipped

## Bounded Context Relationships

### Depends On
- **Order Management Context**: For order data and payment status

### Publishes Events To
- **Notification Context**: OrderFulfilled, OrderShipped (for notifications)

### Subscribes To Events From
- **Order Management Context**: PaymentSettled (to trigger fulfillment)

## Directory Structure

```
fulfillment/
├── entities/
│   ├── ShippingMethod.ts # Shipping method
│   ├── ShippingZone.ts   # Geographic zone
│   └── ShippingCity.ts   # City-level costs
├── repositories/
│   └── IShippingMethodRepository.ts # Shipping method repository
├── events/
│   ├── OrderFulfilled.ts # Fulfillment event
│   └── OrderShipped.ts   # Shipment event
└── errors/
    └── ShippingMethodNotFoundError.ts
```

## Key Business Rules

### Shipping Methods
1. Each shipping method must have a unique code
2. Shipping methods can be enabled or disabled
3. Shipping methods can be standard or express
4. Shipping costs vary by zone and city

### Shipping Zones
1. Zones are organized by county
2. Each zone belongs to one shipping method
3. Zones contain multiple cities

### Shipping Costs
1. Costs are defined at city level
2. Standard and express prices can differ
3. Costs are in cents (no floating-point)
4. Costs are fixed per city (no weight-based calculation)

### Fulfillment Workflow
1. Fulfillment starts when payment is settled
2. Order is prepared for shipment
3. Order is shipped with tracking information
4. Order is delivered to customer

## Integration Points

### With Order Management Context
- **Asynchronous**: Receive PaymentSettled events to trigger fulfillment
- **Synchronous**: Query order data during fulfillment

### With Notification Context
- **Asynchronous**: Publish OrderFulfilled and OrderShipped events

## Testing Strategy

### Unit Tests
- Shipping method creation and validation
- Shipping cost calculation
- Zone and city management
- Fulfillment workflow state transitions

### Integration Tests
- Fulfillment triggered by PaymentSettled event
- Shipping cost calculation for different zones
- Event publishing on fulfillment and shipment

### Example Test Cases
```typescript
// Shipping cost calculation
test('Shipping cost is calculated correctly', () => {
  const method = ShippingMethod.create({
    code: 'standard',
    name: 'Standard Shipping',
    ...
  });
  
  const cost = method.calculateCost({
    destination: 'Nairobi',
    isExpress: false
  });
  
  expect(cost).toBe(500); // 500 KES
});

// Fulfillment workflow
test('Order is fulfilled after payment settlement', async () => {
  const order = await orderRepository.findById('order-1');
  const fulfillment = Fulfillment.create({
    orderId: order.id,
    ...
  });
  
  expect(fulfillment.state).toBe('PENDING');
});
```

## Performance Considerations

### Optimization Strategies
1. **Caching**: Cache shipping methods and zones (rarely change)
2. **Indexing**: Index by code and enabled status
3. **Batch Loading**: Load multiple shipping methods

### Query Patterns
- Find shipping method by ID
- Find shipping method by code
- Find all enabled shipping methods
- Find shipping cost for city

## Shipping Configuration

### Supported Zones
The system supports shipping to various zones in Kenya:

**Standard Zones**:
- Nairobi (500 KES)
- Mombasa (800 KES)
- Kisumu (1000 KES)
- Nakuru (700 KES)
- Eldoret (900 KES)
- Other counties (1200 KES)

**Express Zones**:
- Nairobi (1000 KES)
- Mombasa (1500 KES)
- Other major cities (2000 KES)

## Future Enhancements

1. **Weight-Based Pricing**: Calculate shipping based on package weight
2. **Dimensional Pricing**: Calculate based on package dimensions
3. **Real-Time Tracking**: Integrate with courier APIs for tracking
4. **Multiple Couriers**: Support multiple courier providers
5. **Pickup Points**: Support customer pickup at designated points
6. **International Shipping**: Expand to international destinations
7. **Shipping Insurance**: Optional shipping insurance
8. **Delivery Notifications**: Automated delivery notifications
9. **Return Shipping**: Manage return shipments
10. **Shipping Analytics**: Track shipping performance and costs

## Related Documentation

- [Context Map](../../../docs/CONTEXT_MAP.md) - Relationships with other contexts
- [Domain Glossary](../../../docs/GLOSSARY.md) - Domain terminology
