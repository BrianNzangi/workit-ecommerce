import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';

export const metadata: Metadata = {
  title: "Return Policy - Workit",
  description: "Learn about Workit's return policy. Fast and reliable service guaranteed.",
};

export default function ReturnPolicyPage() {
  return <PolicyPage slug="return-policy" />;
}
