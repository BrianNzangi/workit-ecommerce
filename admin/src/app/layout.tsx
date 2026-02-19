import type { Metadata } from "next";
import "./globals.css";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="ibm-plex-sans-admin font-sans antialiased">
        <ApolloProvider>
          {children}
          <Toaster />
        </ApolloProvider>
      </body>
    </html>
  );
}

