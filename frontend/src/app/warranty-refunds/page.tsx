import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';

export const metadata: Metadata = {
  title: "Warranty & Refunds - Workit",
  description: "Learn about Workit's warranty and refund policies for phones, laptops, TVs, and accessories. Fast and reliable service guaranteed.",
  openGraph: {
    title: "Warranty & Refunds - Workit",
    description: "Learn about Workit's warranty and refund policies for phones, laptops, TVs, and accessories. Fast and reliable service guaranteed.",
    url: "https://www.workit.co.ke/warranty-refunds",
    siteName: "Workit",
    type: "website",
    images: [
      {
        url: "/workit-logo.png",
        width: 1200,
        height: 630,
        alt: "Warranty & Refunds - Workit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Warranty & Refunds - Workit",
    description: "Learn about Workit's warranty and refund policies for phones, laptops, TVs, and accessories. Fast and reliable service guaranteed.",
  },
};

export default function WarrantyRefundsPage() {
  return <PolicyPage slug="warranty-refunds" />;
}
