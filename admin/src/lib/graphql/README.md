# GraphQL API

This directory contains the GraphQL API implementation for the Workit Admin Backend.

## Structure

- `schema.ts` - GraphQL type definitions (schema)
- `resolvers.ts` - GraphQL resolvers for queries and mutations
- `context.ts` - GraphQL context creation (includes Prisma client, user session)
- `errors.ts` - Structured error handling utilities
- `server.ts` - GraphQL Yoga server configuration with error handling middleware
- `index.ts` - Exports all GraphQL utilities

## Error Handling

All GraphQL errors follow a structured format with error codes:

```typescript
{
  errors: [
    {
      message: string;
      extensions: {
        code: string;        // Error code (e.g., VALIDATION_ERROR, NOT_FOUND)
        field?: string;      // Optional field name for validation errors
        details?: any;       // Optional additional details
      };
      path?: string[];       // GraphQL path where error occurred
    }
  ];
  data: null;
}
```

### Error Codes

- **Validation Errors**: `VALIDATION_ERROR`, `INVALID_INPUT`
- **Authentication Errors**: `INVALID_CREDENTIALS`, `TOKEN_EXPIRED`, `UNAUTHORIZED`
- **Authorization Errors**: `FORBIDDEN`, `INSUFFICIENT_PERMISSIONS`
- **Not Found Errors**: `NOT_FOUND`, `RESOURCE_NOT_FOUND`
- **Conflict Errors**: `DUPLICATE_ERROR`, `CONFLICT`
- **External Service Errors**: `EXTERNAL_SERVICE_ERROR`, `PAYMENT_GATEWAY_ERROR`
- **Internal Errors**: `INTERNAL_ERROR`, `DATABASE_ERROR`

### Error Helper Functions

```typescript
import { validationError, notFoundError, unauthorizedError } from '@/lib/graphql/errors';

// Validation error
throw validationError('Email is required', 'email');

// Not found error
throw notFoundError('Product not found', { productId: '123' });

// Unauthorized error
throw unauthorizedError('Invalid credentials');
```

## Usage

### Adding New Queries

1. Add the query to `schema.ts`:
```typescript
type Query {
  getProduct(id: ID!): Product
}
```

2. Add the resolver to `resolvers.ts`:
```typescript
Query: {
  getProduct: async (parent, { id }, context) => {
    const product = await context.prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      throw notFoundError('Product not found');
    }
    
    return product;
  },
}
```

### Adding New Mutations

1. Add the mutation to `schema.ts`:
```typescript
type Mutation {
  createProduct(input: CreateProductInput!): Product!
}

input CreateProductInput {
  name: String!
  slug: String!
  description: String
}
```

2. Add the resolver to `resolvers.ts`:
```typescript
Mutation: {
  createProduct: async (parent, { input }, context) => {
    // Validate input
    if (!input.name) {
      throw validationError('Name is required', 'name');
    }
    
    // Create product
    const product = await context.prisma.product.create({
      data: input,
    });
    
    return product;
  },
}
```

## Testing

The GraphQL API is tested using:

1. **Property-Based Tests**: Test error structure and consistency
2. **Integration Tests**: Test actual GraphQL endpoint responses
3. **Unit Tests**: Test individual resolvers and business logic

Run tests:
```bash
npm test
```

## Endpoint

The GraphQL endpoint is available at:
- Development: `http://localhost:3001/api/graphql`
- GraphQL Playground: Available in development mode at the same URL

## Next Steps

- Add authentication middleware
- Implement product management queries and mutations
- Add order management
- Add customer management
- Implement search functionality
