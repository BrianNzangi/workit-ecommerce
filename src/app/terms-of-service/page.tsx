import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';

export const metadata: Metadata = {
  title: "Terms of Service - Workit",
  description: "Read Workit's terms of service to understand your rights and responsibilities when shopping for electronics online.",
  openGraph: {
    title: "Terms of Service - Workit",
    description: "Read Workit's terms of service to understand your rights and responsibilities when shopping for electronics online.",
    url: "https://www.workit.co.ke/terms-of-service",
    siteName: "Workit",
    type: "website",
    images: [
      {
        url: "/workit-logo.png",
        width: 1200,
        height: 630,
        alt: "Terms of Service - Workit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - Workit",
    description: "Read Workit's terms of service to understand your rights and responsibilities when shopping for electronics online.",
  },
};

export default function TermsOfServicePage() {
  return <PolicyPage slug="terms-of-service" />;
}
