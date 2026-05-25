# Marketing Bounded Context

## Overview

The Marketing context manages campaigns, discounts, promotional banners, and blog content. It provides campaign eligibility validation and discount calculations to the Order Management context.

## Purpose

- Create and manage marketing campaigns
- Define discount rules and eligibility criteria
- Track campaign usage and redemptions
- Manage promotional banners and content
- Provide blog content for content marketing

## Key Concepts

### Aggregates

#### Campaign Aggregate
The central aggregate representing a marketing campaign.

**Root Entity**: Campaign
**Entities**: CampaignRedemption
**Value Objects**: Money

**Key Methods**:
- `create()` - Create a new campaign
- `isEligible(params)` - Check if campaign can be redeemed
- `calculateDiscount(subtotal, shipping)` - Calculate discount amount
- `redeem(customerId, orderId)` - Record campaign redemption

### Value Objects

- **Money**: Discount amount with currency support

### Domain Services

None (campaign logic is encapsulated in the aggregate)

### Domain Events

- **CampaignRedeemed**: Published when a campaign is applied to an order

## Bounded Context Relationships

### Depends On
- **Catalog Context**: For product information (optional)
- **Order Management Context**: For order data

### Publishes Events To
- **Order Management Context**: CampaignRedeemed (for usage tracking)

### Subscribes To Events From
- **Order Management Context**: OrderPlaced (for campaign effectiveness tracking)

## Directory Structure

```
marketing/
├── aggregates/
│   └── Campaign.ts       # Campaign aggregate root
├── entities/
│   ├── CampaignRedemption.ts # Redemption tracking
│   ├── Banner.ts         # Promotional banner
│   └── BlogPost.ts       # Blog article
├── repositories/
│   └── ICampaignRepository.ts # Campaign repository interface
├── events/
│   └── CampaignRedeemed.ts # Redemption event
└── errors/
    ├── CampaignNotEligibleError.ts
    └── CampaignExpiredError.ts
```

## Key Business Rules

### Campaign Management
1. Campaign must have a name and description
2. Campaign must have a start date
3. Campaign can have an optional end date
4. Campaign must be ACTIVE to be redeemed
5. Campaign must be within its date range to be eligible

### Discount Types
1. **PERCENTAGE**: Discount as percentage of subtotal
   - Example: 10% off = (subtotal * 10) / 100
   - Can be capped by maxDiscountAmount

2. **FIXED_AMOUNT**: Fixed discount amount
   - Example: 500 KES off
   - Cannot exceed order total

3. **FREE_SHIPPING**: Free shipping on order
   - Discount = shipping cost
   - Cannot exceed order total

4. **BUY_X_GET_Y**: Bundle discount
   - Complex logic for bundle offers
   - Example: Buy 2 get 1 free

### Eligibility Rules
1. Campaign must be ACTIVE
2. Campaign must be within date range (startDate <= now <= endDate)
3. Order subtotal must meet minimum purchase requirement (if set)
4. Customer must not exceed usage limit per campaign (if set)
5. Total campaign usage must not exceed usage limit (if set)

### Redemption Tracking
1. Each redemption is recorded with campaign, customer, and order
2. Redemptions are used to enforce usage limits
3. Redemptions are immutable (cannot be deleted)
4. Redemptions track campaign effectiveness

## Integration Points

### With Order Management Context
- **Synchronous**: Check campaign eligibility and calculate discounts during order creation
- **Asynchronous**: Receive OrderPlaced events for campaign tracking

### With Catalog Context
- **Synchronous**: Query product data for campaign eligibility (optional)

## Testing Strategy

### Unit Tests
- Campaign creation and validation
- Eligibility checking (date range, usage limits, minimum purchase)
- Discount calculation for different discount types
- Redemption tracking
- Campaign expiration

### Integration Tests
- Campaign application during order creation
- Usage limit enforcement
- Event publishing on redemption
- Campaign effectiveness tracking

### Example Test Cases
```typescript
// Eligibility checking
test('Campaign is eligible within date range', () => {
  const campaign = Campaign.create({
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    ...
  });
  
  const isEligible = campaign.isEligible({
    orderSubtotal: Money.create(5000),
    customerId: 'customer-1',
    customerUsageCount: 0
  });
  
  expect(isEligible).toBe(true);
});

// Discount calculation
test('Percentage discount is calculated correctly', () => {
  const campaign = Campaign.create({
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
    ...
  });
  
  const discount = campaign.calculateDiscount(
    Money.create(10000),
    Money.create(1000)
  );
  
  expect(discount.amount).toBe(1000); // 10% of 10000
});

// Usage limit enforcement
test('Campaign cannot be redeemed after usage limit', () => {
  const campaign = Campaign.create({
    usageLimit: 1,
    currentUsageCount: 1,
    ...
  });
  
  const isEligible = campaign.isEligible({...});
  expect(isEligible).toBe(false);
});
```

## Performance Considerations

### Optimization Strategies
1. **Caching**: Cache campaign data with TTL (10-15 minutes)
2. **Indexing**: Index by coupon code and status
3. **Batch Loading**: Load multiple campaigns by IDs

### Query Patterns
- Find campaign by ID (frequently cached)
- Find campaign by coupon code (unique lookup)
- Find active campaigns (status-based query)

### Cache Invalidation
- Invalidate campaign cache on redemption
- Invalidate campaign cache on status change
- Use TTL-based expiration for automatic cleanup

## Analytics and Reporting

### Campaign Metrics
1. **Usage Metrics**: Total redemptions, redemptions per customer
2. **Revenue Impact**: Total discount amount, revenue from campaign
3. **Effectiveness**: Conversion rate, average order value
4. **Reach**: Number of customers reached, email open rates

### Tracking
1. Track campaign redemptions for analytics
2. Track campaign effectiveness over time
3. Track customer response to campaigns
4. Track revenue impact of campaigns

## Future Enhancements

1. **A/B Testing**: Support A/B testing of campaigns
2. **Segmentation**: Target campaigns to customer segments
3. **Personalization**: Personalized discount offers
4. **Automation**: Automated campaign scheduling
5. **Integration**: Integrate with email marketing (Brevo)
6. **Analytics**: Advanced campaign analytics and reporting
7. **Referral Programs**: Support referral-based campaigns
8. **Loyalty Programs**: Integrate with loyalty programs

## Related Documentation

- [Context Map](../../../docs/CONTEXT_MAP.md) - Relationships with other contexts
- [Aggregate Diagrams](../../../docs/AGGREGATES.md) - Campaign aggregate structure
- [Domain Glossary](../../../docs/GLOSSARY.md) - Domain terminology
