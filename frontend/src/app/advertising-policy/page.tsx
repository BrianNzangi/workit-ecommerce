import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';

export const metadata: Metadata = {
  title: "Advertising Policy - Workit",
  description: "Learn about Workit's advertising policy. Fast and reliable service guaranteed.",
};

export default function AdvertisingPolicyPage() {
  return <PolicyPage slug="advertising-policy" />;
}
