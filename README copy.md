# WorkIt Backend

A comprehensive e-commerce backend built with [Vendure](https://www.vendure.io/) v3.5.1, featuring a custom React admin UI and WorkOS authentication.

## 📁 Project Structure

```
workit-backend/
├── admin-ui/              # Custom React Admin UI
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/          # GraphQL queries, client config
│   │   ├── routes/       # TanStack Router pages
│   │   └── config/       # Navigation and app config
│   ├── package.json
│   └── vite.config.ts
│
├── my-shop/              # Vendure Backend
│   ├── src/
│   │   ├── plugins/      # Custom Vendure plugins
│   │   │   ├── auth/     # WorkOS authentication
│   │   │   ├── banner/   # Banner management
│   │   │   ├── paystack/ # Paystack payment integration
│   │   │   └── roles/    # Custom role management
│   │   ├── index.ts      # Server entry point
│   │   ├── index-worker.ts # Worker entry point
│   │   └── vendure-config.ts # Main configuration
│   ├── static/           # Assets and email templates
│   └── package.json
│
└── .gemini/
    └── docs/             # Project documentation
```

## 🚀 Features

### Backend (Vendure)
- **Authentication**: Dual authentication with native Vendure auth and WorkOS SSO
- **Custom Plugins**:
  - Banner management system
  - Custom roles (Product Manager, Fulfillment Worker, Channel Admin)
  - Paystack payment integration
- **Custom Fields**:
  - Product: Meta title, meta description, OG image, custom attributes
  - Product Variant: Dimensions (width, height, length), shipping class, original price
- **APIs**:
  - Admin API: `http://localhost:3000/admin-api`
  - Shop API: `http://localhost:3000/shop-api`
  - GraphiQL Admin: `http://localhost:3000/graphiql/admin`
  - GraphiQL Shop: `http://localhost:3000/graphiql/shop`

### Admin UI (React)
- **Framework**: React 19 + TanStack Router + Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **GraphQL Client**: gql.tada + graphql-request
- **Features**:
  - Product management (create, edit, delete)
  - Collection management with nested categories
  - Brand management (via Facets)
  - Order management with fulfillment
  - Promotion management
  - Customer management
  - Settings (payment methods, shipping, tax, channels)
  - Asset management
  - WorkOS authentication integration

## 🛠️ Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- WorkOS account (for SSO authentication)
- Paystack account (for payment processing)

## ⚙️ Environment Setup

### Backend Environment Variables

Create a `.env` file in the `my-shop` directory:

```env
# Application
APP_ENV=dev
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=workit_db
DB_SCHEMA=public
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# Authentication
SUPERADMIN_USERNAME=admin@workit.com
SUPERADMIN_PASSWORD=your_secure_password
COOKIE_SECRET=your_cookie_secret_min_32_chars

# WorkOS
WORKOS_API_KEY=your_workos_api_key
WORKOS_CLIENT_ID=your_workos_client_id

# Paystack
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

### Admin UI Environment Variables

Create a `.env` file in the `admin-ui` directory:

```env
VITE_API_URL=http://localhost:3000/admin-api
VITE_WORKOS_CLIENT_ID=your_workos_client_id
VITE_WORKOS_REDIRECT_URI=http://localhost:3001/auth/callback
```

## 📦 Installation

### 1. Install Backend Dependencies

```bash
cd my-shop
npm install
```

### 2. Install Admin UI Dependencies

```bash
cd admin-ui
npm install
```

## 🏃 Running in Development

### Start Backend (Vendure)

```bash
cd my-shop
npm run dev
```

This starts:
- **Server** on port 3000 (Admin API, Shop API, GraphiQL)
- **Worker** for background jobs
- **Dashboard** (Vendure's built-in admin) on port 5174

### Start Admin UI

```bash
cd admin-ui
npm run dev
```

This starts the custom React admin UI on **port 3001**.

Access points:
- Custom Admin UI: http://localhost:3001
- Vendure Backend: http://localhost:3000
- Vendure Dashboard: http://localhost:5174/dashboard
- Admin API: http://localhost:3000/admin-api
- Shop API: http://localhost:3000/shop-api

## 🌐 Connecting to a Storefront

### Shop API Configuration

The Shop API is available at `http://localhost:3000/shop-api` and accepts GraphQL queries for:
- Product catalog browsing
- Collection/category navigation
- Customer authentication
- Cart management
- Order placement
- Customer account management

### CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3001` (Admin UI)
- `http://localhost:3002` (Alternative frontend port)

To add your storefront URL, update `my-shop/src/vendure-config.ts`:

```typescript
cors: {
    origin: IS_DEV 
        ? ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:YOUR_PORT'] 
        : true,
    credentials: true,
},
```

### GraphQL Client Setup (Storefront)

#### Example with Apollo Client (React)

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://localhost:3000/shop-api',
  credentials: 'include', // Important for cookies
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
```

#### Example with graphql-request

```typescript
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('http://localhost:3000/shop-api', {
  credentials: 'include',
});
```

### Sample Shop API Queries

#### Get Products

```graphql
query GetProducts {
  products {
    items {
      id
      name
      slug
      description
      featuredAsset {
        preview
      }
      variants {
        id
        name
        price
        priceWithTax
        sku
      }
    }
  }
}
```

#### Get Product by Slug

```graphql
query GetProduct($slug: String!) {
  product(slug: $slug) {
    id
    name
    description
    variants {
      id
      name
      price
      priceWithTax
      stockOnHand
    }
    assets {
      preview
    }
  }
}
```

#### Add to Cart

```graphql
mutation AddItemToOrder($productVariantId: ID!, $quantity: Int!) {
  addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
    ... on Order {
      id
      code
      totalWithTax
      lines {
        id
        productVariant {
          name
        }
        quantity
        linePrice
      }
    }
  }
}
```

### Authentication Flow (Storefront)

1. **Login**:
```graphql
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    ... on CurrentUser {
      id
      identifier
    }
  }
}
```

2. **Register**:
```graphql
mutation Register($input: RegisterCustomerInput!) {
  registerCustomerAccount(input: $input) {
    ... on Success {
      success
    }
  }
}
```

3. **Get Active Customer**:
```graphql
query GetActiveCustomer {
  activeCustomer {
    id
    firstName
    lastName
    emailAddress
  }
}
```

## 🏗️ Building for Production

### Build Backend

```bash
cd my-shop
npm run build
```

### Build Admin UI

```bash
cd admin-ui
npm run build
```

The built files will be in `admin-ui/dist`.

## 🚀 Deployment

### Backend Deployment

1. **Set environment variables** on your hosting platform
2. **Run migrations** (if using migrations instead of synchronize):
   ```bash
   npm run migration:run
   ```
3. **Start the server**:
   ```bash
   npm run start:server
   ```
4. **Start the worker**:
   ```bash
   npm run start:worker
   ```

### Admin UI Deployment

The admin UI is a static site that can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

**Important**: Update the `VITE_API_URL` environment variable to point to your production backend.

### Environment Variables for Production

Update these in `my-shop/src/vendure-config.ts`:
- `assetUrlPrefix`: Set to your production asset URL
- Email template URLs (verify, password reset, etc.)
- CORS origins: Set to your production frontend URLs

## 📚 API Documentation

- **GraphiQL Admin**: http://localhost:3000/graphiql/admin
- **GraphiQL Shop**: http://localhost:3000/graphiql/shop
- **Vendure Docs**: https://docs.vendure.io/

## 🔐 Authentication

### Admin Authentication
- **Native**: Email/password authentication
- **WorkOS SSO**: Enterprise SSO via WorkOS

### Customer Authentication (Shop API)
- Email/password registration and login
- Email verification
- Password reset

## 💳 Payment Integration

Currently integrated with **Paystack** for payment processing. The payment handler is configured in `my-shop/src/plugins/paystack/paystack-payment-handler.ts`.

## 📧 Email Configuration

Emails are configured in development mode to output to `my-shop/static/email/test-emails`. 

View test emails at: http://localhost:3000/mailbox

For production, configure a real email transport in `vendure-config.ts`.

## 🧪 Testing

### GraphQL Playground
Use GraphiQL to test queries:
- Admin API: http://localhost:3000/graphiql/admin
- Shop API: http://localhost:3000/graphiql/shop

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Private project - All rights reserved

## 🆘 Support

For issues or questions, please refer to the documentation in `.gemini/docs/`.

## 🔗 Useful Links

- [Vendure Documentation](https://docs.vendure.io/)
- [WorkOS Documentation](https://workos.com/docs)
- [TanStack Router](https://tanstack.com/router)
- [shadcn/ui](https://ui.shadcn.com/)
