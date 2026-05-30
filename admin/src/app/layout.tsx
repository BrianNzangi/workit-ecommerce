import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

const hanken = localFont({
  src: [
    {
      path: "./fonts/hanken-grotesk-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Workit Admin Panel",
  description: "Admin panel for Workit e-commerce platform",
};

import { ApolloProvider } from "@/lib/providers/apollo-provider";
import { Toaster } from "@/components/ui/toast-container";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body className={`${hanken.variable} font-sans antialiased`}>
        <ApolloProvider>
          {children}
          <Toaster />
        </ApolloProvider>
      </body>
    </html>
  );
}
