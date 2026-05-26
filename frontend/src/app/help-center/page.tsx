import React from "react";
import type { Metadata } from 'next';
import HelpHero from "../../components/help/HelpHero";
import HelpFAQ from "../../components/help/HelpFAQ";
import ContactForm from "../../components/help/ContactForm";

export const metadata: Metadata = {
  title: "Help Center - Workit",
  description: "Find answers to frequently asked questions about orders, payments, shipping, and returns at the Workit Help Center.",
};

const HelpCenterPage = () => {
  return (
    <main className="min-h-screen bg-white">
      <HelpHero />

      <HelpFAQ />

      <ContactForm />
    </main>
  );
};

export default HelpCenterPage;
