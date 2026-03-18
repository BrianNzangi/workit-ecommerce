import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Header from "../components/layout/Header";
import CartInitializer from "../components/providers/CartInitializer";
import QueryProvider from "../components/providers/QueryProvider";
import Footer from "../components/layout/Footer";
import "./globals.css";
import Script from "next/script";

import dynamic from "next/dynamic";
import { Suspense } from "react";
const AuthModalWrapper = dynamic(() => import("../components/auth/AuthModalWrapper"));

import { SITE_CONFIG, DEFAULT_OG, DEFAULT_TWITTER } from "@/lib/meta";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  openGraph: DEFAULT_OG,
  twitter: DEFAULT_TWITTER,
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap"
          rel="stylesheet"
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
        <QueryProvider>
          <CartInitializer />
          <Suspense fallback={<div className="h-20" />}>
            <Header />
          </Suspense>
          <main className="grow">{children}</main>
          <Footer />
          <Suspense fallback={null}>
            <AuthModalWrapper />
          </Suspense>
        </QueryProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            // Default options
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1F2323',
              borderRadius: '0.25rem', // rounded-xs
              border: '1px solid #E5E7EB', // border-gray-200
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-lg
              padding: '16px',
              fontSize: '14px',
              fontFamily: '"IBM Plex Sans", sans-serif',
            },
            // Success toast
            success: {
              style: {
                background: '#fff',
                color: '#1F2323',
                border: '1px solid #E5E7EB',
              },
            },
            // Error toast
            error: {
              style: {
                background: '#fff',
                color: '#1F2323',
                border: '1px solid #E5E7EB',
              },
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
