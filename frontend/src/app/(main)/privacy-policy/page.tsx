import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';

export const metadata: Metadata = {
  title: "Privacy Policy - Workit",
  description: "Read Workit's privacy policy to learn how we protect your personal information and ensure your data security.",
};

export default function PrivacyPolicyPage() {
  return <PolicyPage slug="privacy-policy" />;
}
