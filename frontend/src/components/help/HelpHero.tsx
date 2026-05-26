"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SectionContainer from "@/components/layout/SectionContainer";

const HelpHero = () => {
  const router = useRouter();

  return (
    <section className="bg-white py-16 font-sans border-b border-gray-200">
      <SectionContainer className="px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Help Center</h1>
          <p className="text-lg text-gray-600 mb-2">
            Find answers to frequently asked questions about orders, payments, and technical issues.
          </p>
          <p className="text-gray-500">
            Need more help? <button onClick={() => router.push('/login')} className="text-primary-900 font-medium hover:underline">Sign in</button> for personalized support or use the contact form below.
          </p>
        </div>
      </SectionContainer>
    </section>
  );
};

export default HelpHero;
