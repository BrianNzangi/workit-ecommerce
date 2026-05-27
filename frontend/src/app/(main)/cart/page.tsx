import type { Metadata } from 'next';
import CartPageClient from './CartPageClient';

export const metadata: Metadata = {
  title: "Your Shopping Cart - Workit",
  description: "Review your selected electronics items in your Workit shopping cart. Update quantities, remove items, or proceed to checkout.",
  robots: "noindex, nofollow",
  openGraph: {
    title: "Your Shopping Cart - Workit",
    description: "Review your selected electronics items in your Workit shopping cart. Update quantities, remove items, or proceed to checkout.",
    url: "https://www.workit.co.ke/cart",
    siteName: "Workit",
    type: "website",
    images: [
      {
        url: "/workit-logo.png",
        width: 1200,
        height: 630,
        alt: "Your Shopping Cart - Workit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Shopping Cart - Workit",
    description: "Review your selected electronics items in your Workit shopping cart. Update quantities, remove items, or proceed to checkout.",
  },
};

export default function CartPage() {
  return <CartPageClient />;
}
