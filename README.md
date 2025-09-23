# Workit - Modern E-commerce Platform

Workit is a modern, full-featured e-commerce platform built with Next.js, designed for electronics retailers in Nairobi, Kenya. The platform offers a seamless shopping experience with WooCommerce integration, secure payments via Paystack, and a comprehensive user dashboard.

## 🚀 Features

### 🛒 E-commerce Core
- **Product Catalog**: Browse electronics, smartphones, laptops, and accessories
- **Product Collections**: Featured deals, popular devices, recommended products
- **Categories & Filters**: Advanced product filtering and categorization
- **Search Functionality**: Find products quickly with search bar
- **Product Details**: Detailed product pages with specifications

### 👤 User Management
- **Authentication**: Secure login/signup with Clerk
- **User Dashboard**: Personal account management
- **Order History**: Track past orders and order status
- **Billing Address**: Manage shipping and billing information
- **Profile Management**: Update account details

### 💳 Payments & Checkout
- **Paystack Integration**: Secure payment processing for M-Pesa, Airtel, and cards
- **Multi-step Checkout**: Streamlined checkout process
- **Order Management**: Real-time order tracking and status updates
- **WooCommerce Sync**: Seamless integration with WooCommerce backend

### 📱 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, intuitive interface with Radix UI components
- **Loading States**: Skeleton loaders and smooth transitions
- **Error Handling**: Comprehensive error states and user feedback

### 📝 Content Management
- **Blog System**: Tech-focused blog with Sanity CMS integration
- **Featured Content**: Highlighted blog posts and articles
- **SEO Optimized**: Meta tags and structured data

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions

### UI Components
- **Radix UI** - Accessible, unstyled UI primitives
- **Lucide React** - Beautiful icon library
- **React Icons** - Additional icon sets

### Backend & APIs
- **WooCommerce** - E-commerce backend and product management
- **Paystack** - Payment processing for Kenyan market
- **Sanity** - Content management for blogs
- **Clerk** - Authentication and user management

### State Management
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling and validation

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **TypeScript** - Type checking

## 📁 Project Structure

```
workit-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── blogs/         # Blog content API
│   │   │   ├── brands/        # Brand management
│   │   │   ├── categories/    # Product categories
│   │   │   ├── collections/   # Product collections
│   │   │   ├── customer/      # Customer billing data
│   │   │   ├── home-collection/# Homepage collections
│   │   │   ├── orders/        # Order management
│   │   │   ├── paystack/      # Payment processing
│   │   │   └── products/      # Product catalog
│   │   ├── cart/             # Shopping cart page
│   │   ├── checkout/         # Checkout flow
│   │   ├── collection/       # Collection pages
│   │   ├── dashboard/        # User dashboard
│   │   ├── orders/           # Order history
│   │   └── sign-in/          # Authentication
│   ├── components/           # React components
│   │   ├── banners/          # Hero banners
│   │   ├── blog/             # Blog components
│   │   ├── cart/             # Cart components
│   │   ├── categories-grid/  # Category display
│   │   ├── checkout/         # Checkout components
│   │   ├── collections/      # Collection components
│   │   ├── filters/          # Product filters
│   │   ├── home/             # Homepage components
│   │   ├── layout/           # Layout components
│   │   ├── menu/             # Navigation menus
│   │   ├── product/          # Product components
│   │   ├── ui/               # Reusable UI components
│   │   └── user/             # User account components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   ├── store/                # Zustand stores
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Helper functions
├── public/                   # Static assets
├── .env.local               # Environment variables
└── package.json             # Dependencies
```

## 🔧 API Routes

### Products & Catalog
- `GET /api/products` - Fetch products with filtering
- `GET /api/categories` - Product categories
- `GET /api/collections/[slug]` - Product collections
- `GET /api/home-collection` - Homepage collections

### User Management
- `GET /api/customer` - Customer billing information
- `PUT /api/customer` - Update customer billing data

### Orders & Payments
- `GET /api/orders` - User order history
- `POST /api/orders/create` - Create new order
- `POST /api/paystack/initialize` - Initialize payment
- `GET /api/paystack/verify` - Verify payment status

### Content
- `GET /api/blogs` - Blog posts and articles
- `GET /api/brands` - Brand information

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- WooCommerce store with REST API enabled
- Paystack account for payments
- Sanity account for content management
- Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BrianNzangi/workit.git
   cd workit
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   # Next.js
   NEXT_PUBLIC_BASE_URL=http://localhost:3000

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # WooCommerce
   NEXT_PUBLIC_WORDPRESS_URL=https://yourstore.com
   WC_CONSUMER_KEY=your_woocommerce_consumer_key
   WC_CONSUMER_SECRET=your_woocommerce_consumer_secret

   # Paystack
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   PAYSTACK_SECRET_KEY=your_paystack_secret_key

   # Sanity (for blogs)
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
   SANITY_API_TOKEN=your_sanity_api_token
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Build & Deployment

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Deploy to Vercel
The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_BASE_URL` | Base URL for API calls | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk authentication | Yes |
| `CLERK_SECRET_KEY` | Clerk server-side key | Yes |
| `NEXT_PUBLIC_WORDPRESS_URL` | WooCommerce site URL | Yes |
| `WC_CONSUMER_KEY` | WooCommerce API key | Yes |
| `WC_CONSUMER_SECRET` | WooCommerce API secret | Yes |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key | Yes |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | Yes |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID | Optional |
| `SANITY_API_TOKEN` | Sanity API token | Optional |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary to Workit Enterprises.

## 📞 Support

For support or questions, please contact the development team or create an issue in the repository.

---

Built with ❤️ for the Nairobi electronics community
