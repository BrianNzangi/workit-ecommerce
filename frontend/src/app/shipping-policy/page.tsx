import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';

export const metadata: Metadata = {
  title: "Shipping Policy - Workit",
  description: "Read Workit's shipping policy to understand delivery times, costs, and methods for your electronics orders.",
};

export default function ShippingPolicyPage() {
  return <PolicyPage slug="shipping-policy" />;
}
