import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";


const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
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
      <body className={`${publicSans.variable} font-sans antialiased`}>
        <ApolloProvider>
          {children}
          <Toaster />
        </ApolloProvider>
      </body>
    </html>
  );
}

