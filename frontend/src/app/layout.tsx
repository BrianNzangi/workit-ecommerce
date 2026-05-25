import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Header from "../components/layout/header/Header";
import CartInitializer from "../components/providers/CartInitializer";
import MetaCookieInitializer from "../components/providers/MetaCookieInitializer";
import QueryProvider from "../components/providers/QueryProvider";
import Footer from "../components/layout/footer/Footer";
import "./globals.css";
import Script from "next/script";
import { Hanken_Grotesk } from "next/font/google";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

import dynamic from "next/dynamic";
import { Suspense } from "react";
const AuthModalWrapper = dynamic(() => import("../components/auth/AuthModalWrapper"));

import { SITE_CONFIG, DEFAULT_OG, DEFAULT_TWITTER } from "@/lib/meta/meta";

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
        <Script
          id="google-tag-script"
          strategy="beforeInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-Y0DN0MB5CV"
        />
        <Script
          id="google-tag-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-Y0DN0MB5CV');`,
          }}
        />
        <Script
          id="microsoft-clarity"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "vylyphkwcr");`,
          }}
        />

        {/* JSON-LD SEO */}
        <Script
          id="workit-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className={`${hankenGrotesk.className} font-sans flex flex-col min-h-screen`}>
        <QueryProvider>
          <CartInitializer />
          <MetaCookieInitializer />
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
              fontFamily: '"Hanken Grotesk", sans-serif',
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
