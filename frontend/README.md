# Workit - Modern E-commerce Platform

Workit is a modern, full-featured e-commerce platform built with Next.js and powered by Vendure, designed for electronics retailers in Nairobi, Kenya. The platform offers a seamless shopping experience with Vendure backend integration, secure payments via Paystack, and a comprehensive user dashboard.

## 🚀 Features

### 🛒 E-commerce Core
- **Product Catalog**: Browse electronics, smartphones, laptops, and accessories
- **Product Collections**: Featured deals, popular devices, recommended products
- **Categories & Filters**: Advanced product filtering and categorization
- **Search Functionality**: Find products quickly with search bar
- **Product Details**: Detailed product pages with specifications

### 👤 User Management
- **Authentication**: Vendure native customer authentication
- **User Dashboard**: Personal account management
- **Order History**: Track past orders and order status
- **Billing Address**: Manage shipping and billing information
- **Profile Management**: Update account details

### 💳 Payments & Checkout
- **Paystack Integration**: Secure payment processing for M-Pesa, Airtel, and cards
- **Multi-step Checkout**: Streamlined checkout process
- **Order Management**: Real-time order tracking and status updates
- **Vendure Backend**: Seamless integration with Vendure e-commerce backend

### 📱 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, intuitive interface with Radix UI components
- **Loading States**: Skeleton loaders and smooth transitions
- **Error Handling**: Comprehensive error states and user feedback

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
- **Vendure** - Headless e-commerce backend
- **Apollo Client** - GraphQL client for Vendure Shop API
- **Paystack** - Payment processing for Kenyan market

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
│   │   │   ├── auth/          # Authentication (login, register, logout)
│   │   │   ├── collections/   # Product collections
│   │   │   ├── orders/        # Order management
│   │   │   ├── paystack/      # Payment processing
│   │   │   └── products/      # Product catalog
│   │   ├── cart/             # Shopping cart page
│   │   ├── checkout/         # Checkout flow
│   │   ├── collection/       # Collection pages
│   │   ├── dashboard/        # User dashboard
│   │   └── orders/           # Order history
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   │   ├── vendure-client.ts # Vendure GraphQL client
│   │   ├── vendure-queries.ts# GraphQL queries/mutations
│   │   └── auth.ts           # Authentication utilities
│   ├── store/                # Zustand stores
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Helper functions
├── public/                   # Static assets
└── package.json             # Dependencies
```

## 🔧 API Routes

### Products & Catalog
- `GET /api/products` - Fetch products with filtering and search
- `GET /api/collections/[slug]` - Product collections

### Authentication
- `POST /api/auth/login` - Customer login
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/logout` - Customer logout
- `GET /api/auth/me` - Get active customer

### Orders & Payments
- `GET /api/orders` - User order history
- `POST /api/orders/create` - Create new order
- `POST /api/paystack/initialize` - Initialize payment
- `GET /api/paystack/verify` - Verify payment status

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- Vendure backend running (see [workit-backend](https://github.com/BrianNzangi/workit-backend))
- Paystack account for payments

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BrianNzangi/workit.git
   cd workit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   # Vendure Backend
   NEXT_PUBLIC_VENDURE_SHOP_API=http://localhost:3000/shop-api

   # Paystack Payment
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
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
| `NEXT_PUBLIC_VENDURE_SHOP_API` | Vendure Shop API URL | Yes |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key | Yes |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | Yes |

## 🔗 Related Projects

- **Backend**: [workit-backend](https://github.com/BrianNzangi/workit-backend) - Vendure e-commerce backend

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
