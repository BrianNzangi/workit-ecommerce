import type { Metadata } from 'next';
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import CheckoutClient from "@/components/checkout/CheckoutClient"

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
  const user = await currentUser()
  if (!user) redirect("/sign-in?redirect_url=/checkout")

  return (
    <CheckoutClient
      user={{
        id: user.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        email: user.emailAddresses?.[0]?.emailAddress || "",
      }}
    />
  )
}
