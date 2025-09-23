import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Workit: The Ultimate Electronics Store for All Your Needs",
  description:
    "Discover top-quality electronics, unbeatable prices, and exceptional customer service at Workit. Shop now for the latest gadgets and accessories!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Workit Electronics",
    url: "https://www.workit.co.ke",
    logo: "https://www.workit.co.ke/logo.png", // update with your actual logo URL
    sameAs: [
      "https://www.facebook.com/workit",
      "https://www.instagram.com/workit",
      "https://twitter.com/workit",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+254-798-918-159", // update if needed
        contactType: "customer service",
        areaServed: "KE",
        availableLanguage: ["en"],
      },
    ],
  };

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Paystack Inline Script */}
          <Script
            src="https://js.paystack.co/v1/inline.js"
            strategy="afterInteractive"
          />

          {/* JSON-LD SEO */}
          <Script
            id="workit-jsonld"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="font-sans flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}