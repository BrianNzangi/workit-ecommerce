# Storefront Integration Guide

This guide explains how to connect your frontend storefront to the WorkIt Vendure backend.

## 🔌 API Endpoints

### Shop API (Public)
- **URL**: `http://localhost:3000/shop-api` (development)
- **Purpose**: Customer-facing operations (products, cart, checkout, orders)
- **Authentication**: Optional (required for customer-specific operations)

### Admin API (Private)
- **URL**: `http://localhost:3000/admin-api` (development)
- **Purpose**: Administrative operations (managed via Admin UI)
- **Authentication**: Required

## 🚀 Quick Start Integration

### 1. Install GraphQL Client

Choose your preferred GraphQL client:

#### Option A: Apollo Client (Recommended for React)

```bash
npm install @apollo/client graphql
```

#### Option B: graphql-request (Lightweight)

```bash
npm install graphql-request graphql
```

#### Option C: urql (Alternative React client)

```bash
npm install urql graphql
```

### 2. Configure Client

#### Apollo Client Setup

```typescript
// lib/apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/shop-api',
  credentials: 'include', // Important for session cookies
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
```

#### graphql-request Setup

```typescript
// lib/graphql-client.ts
import { GraphQLClient } from 'graphql-request';

export const graphqlClient = new GraphQLClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/shop-api',
  {
    credentials: 'include',
  }
);
```

### 3. Environment Variables

Create `.env.local` in your storefront project:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/shop-api
```

## 📝 Common GraphQL Queries

### Product Catalog

#### Get All Products

```typescript
import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts($options: ProductListOptions) {
    products(options: $options) {
      items {
        id
        name
        slug
        description
        featuredAsset {
          id
          preview
          source
        }
        variants {
          id
          name
          sku
          price
          priceWithTax
          currencyCode
          stockOnHand
        }
        collections {
          id
          name
          slug
        }
      }
      totalItems
    }
  }
`;

// Usage
const { data, loading, error } = useQuery(GET_PRODUCTS, {
  variables: {
    options: {
      take: 20,
      skip: 0,
    },
  },
});
```

#### Get Product by Slug

```typescript
export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    product(slug: $slug) {
      id
      name
      slug
      description
      featuredAsset {
        id
        preview
        source
      }
      assets {
        id
        preview
        source
      }
      variants {
        id
        name
        sku
        price
        priceWithTax
        currencyCode
        stockOnHand
        options {
          id
          code
          name
        }
      }
      optionGroups {
        id
        code
        name
        options {
          id
          code
          name
        }
      }
      customFields {
        metaTitle
        metaDescription
      }
    }
  }
`;
```

#### Search Products

```typescript
export const SEARCH_PRODUCTS = gql`
  query SearchProducts($input: SearchInput!) {
    search(input: $input) {
      items {
        productId
        productName
        slug
        description
        productAsset {
          id
          preview
        }
        price {
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
        priceWithTax {
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
        currencyCode
      }
      totalItems
    }
  }
`;

// Usage
const { data } = useQuery(SEARCH_PRODUCTS, {
  variables: {
    input: {
      term: 'laptop',
      take: 20,
    },
  },
});
```

### Collections (Categories)

```typescript
export const GET_COLLECTIONS = gql`
  query GetCollections {
    collections {
      items {
        id
        name
        slug
        description
        featuredAsset {
          preview
        }
        parent {
          id
          name
        }
        children {
          id
          name
          slug
        }
      }
    }
  }
`;

export const GET_COLLECTION_BY_SLUG = gql`
  query GetCollectionBySlug($slug: String!) {
    collection(slug: $slug) {
      id
      name
      slug
      description
      featuredAsset {
        preview
      }
      breadcrumbs {
        id
        name
        slug
      }
      children {
        id
        name
        slug
      }
    }
  }
`;
```

### Cart Management

#### Get Active Order (Cart)

```typescript
export const GET_ACTIVE_ORDER = gql`
  query GetActiveOrder {
    activeOrder {
      id
      code
      state
      totalQuantity
      subTotal
      subTotalWithTax
      shipping
      shippingWithTax
      total
      totalWithTax
      currencyCode
      lines {
        id
        productVariant {
          id
          name
          sku
          price
          priceWithTax
          product {
            name
            slug
            featuredAsset {
              preview
            }
          }
        }
        quantity
        linePrice
        linePriceWithTax
      }
      shippingAddress {
        fullName
        streetLine1
        city
        postalCode
        country
      }
    }
  }
`;
```

#### Add Item to Cart

```typescript
export const ADD_TO_CART = gql`
  mutation AddItemToOrder($productVariantId: ID!, $quantity: Int!) {
    addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
      ... on Order {
        id
        code
        totalQuantity
        totalWithTax
        lines {
          id
          quantity
          linePrice
          productVariant {
            id
            name
          }
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

// Usage
const [addToCart] = useMutation(ADD_TO_CART);

const handleAddToCart = async (variantId: string, quantity: number) => {
  try {
    const { data } = await addToCart({
      variables: {
        productVariantId: variantId,
        quantity,
      },
      refetchQueries: [{ query: GET_ACTIVE_ORDER }],
    });
    
    if (data?.addItemToOrder?.__typename === 'Order') {
      // Success
      toast.success('Added to cart!');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
};
```

#### Update Cart Item Quantity

```typescript
export const ADJUST_ORDER_LINE = gql`
  mutation AdjustOrderLine($orderLineId: ID!, $quantity: Int!) {
    adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) {
      ... on Order {
        id
        totalQuantity
        totalWithTax
        lines {
          id
          quantity
          linePrice
        }
      }
    }
  }
`;
```

#### Remove from Cart

```typescript
export const REMOVE_ORDER_LINE = gql`
  mutation RemoveOrderLine($orderLineId: ID!) {
    removeOrderLine(orderLineId: $orderLineId) {
      ... on Order {
        id
        totalQuantity
        totalWithTax
        lines {
          id
          quantity
        }
      }
    }
  }
`;
```

### Customer Authentication

#### Register Customer

```typescript
export const REGISTER_CUSTOMER = gql`
  mutation RegisterCustomer($input: RegisterCustomerInput!) {
    registerCustomerAccount(input: $input) {
      ... on Success {
        success
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

// Usage
const [register] = useMutation(REGISTER_CUSTOMER);

const handleRegister = async (email: string, password: string, firstName: string, lastName: string) => {
  const { data } = await register({
    variables: {
      input: {
        emailAddress: email,
        password,
        firstName,
        lastName,
      },
    },
  });
};
```

#### Login

```typescript
export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      ... on CurrentUser {
        id
        identifier
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;
```

#### Logout

```typescript
export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;
```

#### Get Active Customer

```typescript
export const GET_ACTIVE_CUSTOMER = gql`
  query GetActiveCustomer {
    activeCustomer {
      id
      firstName
      lastName
      emailAddress
      phoneNumber
      addresses {
        id
        fullName
        streetLine1
        streetLine2
        city
        province
        postalCode
        country {
          code
          name
        }
        defaultShippingAddress
        defaultBillingAddress
      }
    }
  }
`;
```

### Checkout Flow

#### Set Shipping Address

```typescript
export const SET_SHIPPING_ADDRESS = gql`
  mutation SetShippingAddress($input: CreateAddressInput!) {
    setOrderShippingAddress(input: $input) {
      ... on Order {
        id
        shippingAddress {
          fullName
          streetLine1
          city
          postalCode
        }
      }
    }
  }
`;
```

#### Get Shipping Methods

```typescript
export const GET_SHIPPING_METHODS = gql`
  query GetShippingMethods {
    eligibleShippingMethods {
      id
      name
      description
      price
      priceWithTax
    }
  }
`;
```

#### Set Shipping Method

```typescript
export const SET_SHIPPING_METHOD = gql`
  mutation SetShippingMethod($shippingMethodId: [ID!]!) {
    setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
      ... on Order {
        id
        shipping
        shippingWithTax
        totalWithTax
      }
    }
  }
`;
```

#### Add Payment

```typescript
export const ADD_PAYMENT = gql`
  mutation AddPayment($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      ... on Order {
        id
        code
        state
        totalWithTax
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

// For Paystack integration
const handlePayment = async (orderId: string, paystackReference: string) => {
  await addPayment({
    variables: {
      input: {
        method: 'paystack',
        metadata: {
          reference: paystackReference,
        },
      },
    },
  });
};
```

## 🎨 Example React Components

### Product Card Component

```tsx
// components/ProductCard.tsx
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const price = product.variants[0]?.priceWithTax || 0;
  const formattedPrice = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(price / 100); // Convert from cents

  return (
    <div className="border rounded-lg overflow-hidden">
      <img
        src={product.featuredAsset?.preview || '/placeholder.png'}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold">{formattedPrice}</span>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Cart Component

```tsx
// components/Cart.tsx
import { useQuery, useMutation } from '@apollo/client';
import { GET_ACTIVE_ORDER, ADJUST_ORDER_LINE, REMOVE_ORDER_LINE } from '@/lib/queries';

export function Cart() {
  const { data, loading } = useQuery(GET_ACTIVE_ORDER);
  const [adjustLine] = useMutation(ADJUST_ORDER_LINE);
  const [removeLine] = useMutation(REMOVE_ORDER_LINE);

  const order = data?.activeOrder;

  if (loading) return <div>Loading cart...</div>;
  if (!order || order.lines.length === 0) {
    return <div>Your cart is empty</div>;
  }

  const total = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: order.currencyCode,
  }).format(order.totalWithTax / 100);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
      
      {order.lines.map((line) => (
        <div key={line.id} className="flex items-center gap-4 border-b py-4">
          <img
            src={line.productVariant.product.featuredAsset?.preview}
            alt={line.productVariant.name}
            className="w-20 h-20 object-cover rounded"
          />
          
          <div className="flex-1">
            <h3 className="font-semibold">{line.productVariant.product.name}</h3>
            <p className="text-sm text-gray-600">{line.productVariant.name}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustLine({
                variables: {
                  orderLineId: line.id,
                  quantity: line.quantity - 1,
                },
                refetchQueries: [{ query: GET_ACTIVE_ORDER }],
              })}
              className="px-2 py-1 border rounded"
            >
              -
            </button>
            <span>{line.quantity}</span>
            <button
              onClick={() => adjustLine({
                variables: {
                  orderLineId: line.id,
                  quantity: line.quantity + 1,
                },
                refetchQueries: [{ query: GET_ACTIVE_ORDER }],
              })}
              className="px-2 py-1 border rounded"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <p className="font-semibold">
              {new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: order.currencyCode,
              }).format(line.linePriceWithTax / 100)}
            </p>
            <button
              onClick={() => removeLine({
                variables: { orderLineId: line.id },
                refetchQueries: [{ query: GET_ACTIVE_ORDER }],
              })}
              className="text-red-600 text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <div className="mt-6 text-right">
        <p className="text-2xl font-bold">Total: {total}</p>
        <button className="mt-4 bg-blue-600 text-white px-8 py-3 rounded-lg">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
```

## 🔒 CORS Configuration

The backend is already configured to accept requests from common development ports. For production, update the CORS settings in `my-shop/src/vendure-config.ts`:

```typescript
cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
    credentials: true,
},
```

Then set the environment variable:
```env
ALLOWED_ORIGINS=https://yourstorefront.com,https://www.yourstorefront.com
```

## 💰 Currency Handling

All prices in Vendure are stored in **cents** (minor units). Always divide by 100 when displaying:

```typescript
const displayPrice = (priceInCents: number, currencyCode: string = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currencyCode,
  }).format(priceInCents / 100);
};
```

## 🧪 Testing Your Integration

1. **Start the backend**: `cd my-shop && npm run dev`
2. **Test GraphQL queries** in GraphiQL: http://localhost:3000/graphiql/shop
3. **Verify CORS** by making requests from your storefront
4. **Test authentication flow** (register, login, logout)
5. **Test cart operations** (add, update, remove items)
6. **Test checkout flow** (shipping address, payment)

## 📚 Additional Resources

- [Vendure GraphQL API Reference](https://docs.vendure.io/reference/graphql-api/)
- [Vendure Storefront Guide](https://docs.vendure.io/guides/storefront/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)

## 🆘 Troubleshooting

### CORS Errors
- Ensure `credentials: 'include'` is set in your GraphQL client
- Verify your storefront URL is in the CORS whitelist
- Check that cookies are enabled

### Session Not Persisting
- Make sure you're using `credentials: 'include'`
- Verify cookies are being sent with requests
- Check that your frontend and backend are on compatible domains

### Products Not Showing
- Ensure products are published (enabled) in the admin
- Check that variants exist and have stock
- Verify the GraphQL query is correct

## 🎯 Next Steps

1. Set up your storefront project
2. Install and configure a GraphQL client
3. Implement product listing and detail pages
4. Add cart functionality
5. Implement checkout flow
6. Integrate Paystack for payments
7. Add customer authentication
8. Deploy to production
