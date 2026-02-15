import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';

export const metadata: Metadata = {
  title: "Returns and Refunds Policy - Workit",
  description: "Learn about Workit's returns and refund policies for phones, laptops, TVs, and accessories. Fast and reliable service guaranteed.",
  openGraph: {
    title: "Returns and Refunds Policy - Workit",
    description: "Learn about Workit's returns and refund policies for phones, laptops, TVs, and accessories. Fast and reliable service guaranteed.",
    url: "https://www.workit.co.ke/returns-refunds-policy",
    siteName: "Workit",
    type: "website",
    images: [
      {
        url: "/workit-logo.png",
        width: 1200,
        height: 630,
        alt: "Returns and Refunds Policy - Workit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Returns and Refunds Policy - Workit",
    description: "Learn about Workit's returns and refund policies for phones, laptops, TVs, and accessories. Fast and reliable service guaranteed.",
  },
};

export default function ReturnsRefundsPolicyPage() {
  return <PolicyPage slug="returns-refunds-policy" />;
}
