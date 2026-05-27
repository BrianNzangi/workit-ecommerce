"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Package, CreditCard, Undo2, Headphones } from "lucide-react";
import SectionContainer from "@/components/layout/SectionContainer";

const helpTopics = [
  { icon: Package, label: "Orders", color: "bg-blue-100 text-blue-600" },
  { icon: CreditCard, label: "Payments", color: "bg-emerald-100 text-emerald-600" },
  { icon: Undo2, label: "Returns & Refunds", color: "bg-amber-100 text-amber-600" },
  { icon: Headphones, label: "Technical Support", color: "bg-purple-100 text-purple-600" },
];

const HelpHero = () => {
  const router = useRouter();

  return (
    <section className="bg-white py-16 font-sans border-b border-gray-200">
      <SectionContainer className="px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">Help Center</h1>
            <p className="text-lg text-gray-600 mb-2">
              Find answers to frequently asked questions about orders, payments, and technical issues.
            </p>
            <p className="text-gray-500">
              Need more help? <button onClick={() => router.push('/login')} className="text-primary-900 font-medium hover:underline">Sign in</button> for personalized support or use the contact form below.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {helpTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <div
                  key={topic.label}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer bg-white"
                >
                  <span className={`rounded-full p-3 mb-3 ${topic.color}`}>
                    <Icon size={24} />
                  </span>
                  <span className="text-sm font-semibold text-gray-900 text-center">{topic.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};

export default HelpHero;
