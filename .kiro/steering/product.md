# Workit Ecommerce - Product Overview

Workit is a Kenyan ecommerce platform (workit.co.ke) that enables customers to browse and purchase products online. The platform consists of:

- **Frontend Storefront** (workit.co.ke) - Customer-facing product browsing and checkout
- **Admin Panel** (admin.workit.co.ke) - Merchant and order management interface
- **Backend API** (api.workit.co.ke) - Fastify-based REST API serving both frontend and admin

## Core Capabilities

- Product catalog browsing with collections and filtering
- Shopping cart and checkout flow
- Multiple shipping methods with cost calculation
- Payment processing via Paystack
- Order management and tracking
- Blog content management
- Media uploads stored in MinIO (S3-compatible)

## Technology Stack

- **Monorepo**: pnpm workspace with Turbo for build orchestration
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: MinIO for media files
- **Authentication**: Better Auth
- **Search**: Algolia (optional)

## Key Endpoints

- Storefront: `http://localhost:3000`
- Admin: `http://localhost:3002`
- Backend API: `http://localhost:3001`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`
- Drizzle Studio: `http://localhost:4983`