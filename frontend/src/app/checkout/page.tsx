import type { Metadata } from 'next';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CheckoutClient from "@/components/checkout/CheckoutClient"
import Script from "next/script"

export const metadata: Metadata = {
  title: "Checkout - Workit",
  description: "Complete your purchase of electronics items safely and securely with Workit checkout.",
  robots: "noindex, nofollow",
  openGraph: {
    title: "Checkout - Workit",
    description: "Complete your purchase of electronics items safely and securely with Workit checkout.",
    url: "https://www.workit.co.ke/checkout",
    siteName: "Workit",
    type: "website",
    images: [
      {
        url: "/workit-logo.png",
        width: 1200,
        height: 630,
        alt: "Checkout - Workit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Checkout - Workit",
    description: "Complete your purchase of electronics items safely and securely with Workit checkout.",
  },
};

export default async function CheckoutPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/?auth=login');
  }

  const { user } = session;

  return (
    <>
      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="afterInteractive"
      />
      <CheckoutClient
        user={{
          id: user.id,
          name: user.name || `${(user as any).firstName ?? ""} ${(user as any).lastName ?? ""}`.trim(),
          email: user.email || "",
        }}
      />
    </>
  )
}
