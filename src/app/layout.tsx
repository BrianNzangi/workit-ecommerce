import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Shop Phones, Laptops & Gadgets Online for less on Workit",
  description:
    "Find the best deals on phones, laptops, TVs, and accessories at Workit. Trusted electronics store with fast delivery and reliable customer support.",
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
    logo: "https://www.workit.co.ke/workit-logo.svg",
    sameAs: [
      "https://www.facebook.com/workit",
      "https://www.instagram.com/workit",
      "https://twitter.com/workit",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+254 796-053143",
        contactType: "customer service",
        areaServed: "KE",
        availableLanguage: ["en"],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
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
  );
}
