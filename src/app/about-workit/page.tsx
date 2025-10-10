import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';

export const metadata: Metadata = {
  title: "About Workit - Trusted Electronics Store",
  description: "Learn more about Workit, our mission, and how we provide the best deals on electronics with fast delivery and reliable customer support.",
  openGraph: {
    title: "About Workit - Trusted Electronics Store",
    description: "Learn more about Workit, our mission, and how we provide the best deals on electronics with fast delivery and reliable customer support.",
    url: "https://www.workit.co.ke/about-workit",
    siteName: "Workit",
    type: "website",
    images: [
      {
        url: "/workit-logo.png",
        width: 1200,
        height: 630,
        alt: "About Workit - Trusted Electronics Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Workit - Trusted Electronics Store",
    description: "Learn more about Workit, our mission, and how we provide the best deals on electronics with fast delivery and reliable customer support.",
  },
};

export default function AboutWorkitPage() {
  return <PolicyPage slug="about-workit" />;
}
