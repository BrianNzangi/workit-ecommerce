import React from "react";
import type { Metadata } from 'next';
import HelpHero from "../../../components/help/HelpHero";
import HelpFAQ from "../../../components/help/HelpFAQ";
import ContactForm from "../../../components/help/ContactForm";
import SectionContainer from '@/components/layout/SectionContainer';

export const metadata: Metadata = {
  title: "Help Center - Workit",
  description: "Find answers to frequently asked questions about orders, payments, shipping, and returns at the Workit Help Center.",
};

const HelpCenterPage = () => {
  return (
    <main className="min-h-screen bg-white">
      <HelpHero />

      <HelpFAQ />

      <section className="pb-20 bg-white font-sans border-t border-gray-200">
        <SectionContainer>
          <ContactForm />
        </SectionContainer>
      </section>
    </main>
  );
};

export default HelpCenterPage;
