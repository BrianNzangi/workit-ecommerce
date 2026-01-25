import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "./globals.css";
import Script from "next/script";
import { Barlow } from 'next/font/google';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-barlow',
  display: 'swap',
});

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
    <html lang="en" className={barlow.variable}>
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
        <main className="grow">{children}</main>
        <Footer />
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
              fontFamily: 'var(--font-barlow), sans-serif',
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
