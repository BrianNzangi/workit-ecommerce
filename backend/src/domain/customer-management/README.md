# Customer Management Bounded Context

## Overview

The Customer Management context manages customer identity, profiles, and address information. It maintains customer data and provides customer validation to other contexts.

## Purpose

- Manage customer registration and profiles
- Store and validate customer addresses
- Maintain customer contact information
- Provide customer identity verification
- Track customer information changes

## Key Concepts

### Aggregates

#### Customer Aggregate
The central aggregate representing a customer.

**Root Entity**: Customer
**Value Objects**: Email, PhoneNumber, Address

**Key Methods**:
- `create()` - Create a new customer
- `addAddress(address)` - Add a new address
- `setDefaultShippingAddress(addressId)` - Set default shipping address
- `setDefaultBillingAddress(addressId)` - Set default billing address
- `removeAddress(addressId)` - Remove an address

### Value Objects

- **Email**: Customer email address with format validation
- **PhoneNumber**: Customer phone number with format validation
- **Address**: Physical address with required fields validation

### Domain Events

- **CustomerRegistered**: Published when a new customer account is created
- **CustomerUpdated**: Published when customer profile changes

## Bounded Context Relationships

### Depends On
- None (upstream context)

### Publishes Events To
- **Order Management Context**: CustomerRegistered (for customer validation)
- **All Contexts**: CustomerRegistered (for customer awareness)

### Subscribes To Events From
- None

## Directory Structure

```
customer-management/
├── aggregates/
│   └── Customer.ts       # Customer aggregate root
├── value-objects/
│   ├── Email.ts          # Email address
│   ├── PhoneNumber.ts    # Phone number
│   └── Address.ts        # Physical address
├── repositories/
│   └── ICustomerRepository.ts # Customer repository interface
├── events/
│   ├── CustomerRegistered.ts # Registration event
│   └── CustomerUpdated.ts # Update event
└── errors/
    ├── ValidationError.ts
    └── DuplicateEmailError.ts
```

## Key Business Rules

### Customer Registration
1. Email must be unique across all customers
2. Email must be in valid format
3. Phone number must be in valid format
4. Customer must have at least one address

### Address Management
1. All required address fields must be present
2. Phone number must be valid
3. Country defaults to 'KE' (Kenya)
4. Customer can have multiple addresses
5. One default shipping address and one default billing address

### Email Validation
1. Email must be unique
2. Email must follow RFC 5322 format
3. Email is case-insensitive for uniqueness

### Phone Number Validation
1. Phone number must include country code
2. Phone number must be in international format
3. Phone number must be valid for the country

## Integration Points

### With Order Management Context
- **Synchronous**: Order Management validates customer during order creation
- **Asynchronous**: Publish CustomerRegistered events for customer awareness

### With Other Contexts
- **Asynchronous**: Publish CustomerRegistered events for new customer notifications

## Testing Strategy

### Unit Tests
- Customer creation and validation
- Email format validation and uniqueness
- Phone number format validation
- Address validation and management
- Default address setting

### Integration Tests
- Customer registration workflow
- Email uniqueness enforcement
- Address CRUD operations
- Event publishing on customer changes

### Example Test Cases
```typescript
// Email validation
test('Email must be unique', async () => {
  const customer1 = Customer.create({
    email: Email.create('test@example.com'),
    ...
  });
  await repository.save(customer1);
  
  expect(() => {
    Customer.create({
      email: Email.create('test@example.com'),
      ...
    });
  }).toThrow(DuplicateEmailError);
});

// Address management
test('Customer can add multiple addresses', () => {
  const customer = Customer.create({...});
  customer.addAddress(address1);
  customer.addAddress(address2);
  expect(customer.addresses.length).toBe(2);
});

// Default address
test('Default shipping address must exist', () => {
  const customer = Customer.create({...});
  expect(() => {
    customer.setDefaultShippingAddress('non-existent-id');
  }).toThrow();
});
```

## Performance Considerations

### Optimization Strategies
1. **Indexing**: Index by email for fast lookups
2. **Caching**: Cache customer data (read-heavy)
3. **Batch Loading**: Load multiple customers by IDs

### Query Patterns
- Find customer by ID
- Find customer by email (unique lookup)
- Find customers by IDs (batch operation)

## Data Privacy Considerations

1. **Email Privacy**: Email addresses are sensitive PII
2. **Phone Privacy**: Phone numbers are sensitive PII
3. **Address Privacy**: Addresses are sensitive PII
4. **Data Retention**: Follow GDPR/local privacy regulations
5. **Data Deletion**: Support customer data deletion requests

## Future Enhancements

1. **Customer Preferences**: Store customer preferences and settings
2. **Loyalty Program**: Track customer loyalty points
3. **Customer Segments**: Segment customers for marketing
4. **Customer History**: Track customer activity and purchases
5. **Customer Communication**: Manage customer communication preferences
6. **Customer Verification**: Email and phone verification workflows
7. **Customer Deactivation**: Support customer account deactivation

## Related Documentation

- [Context Map](../../../docs/CONTEXT_MAP.md) - Relationships with other contexts
- [Aggregate Diagrams](../../../docs/AGGREGATES.md) - Customer aggregate structure
- [Domain Glossary](../../../docs/GLOSSARY.md) - Domain terminology
