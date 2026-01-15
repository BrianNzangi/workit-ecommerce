import React from "react";
import HelpHero from "../../components/help/HelpHero";
import HelpFAQ from "../../components/help/HelpFAQ";
import ContactForm from "../../components/help/ContactForm";

const HelpCenterPage = () => {
  return (
    <main className="min-h-screen bg-primary-900">
      <HelpHero />

      <HelpFAQ />

      <ContactForm />
    </main>
  );
};

export default HelpCenterPage;
