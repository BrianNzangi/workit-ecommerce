import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Home, MapPin, Phone, Mail, Clock } from 'lucide-react';
import SectionContainer from '@/components/layout/SectionContainer';
import ContactForm from '@/components/help/ContactForm';

export const metadata: Metadata = {
  title: "Contact Us - Workit",
  description: "Get in touch with Workit. Visit our store in Nairobi CBD or reach out via phone or email.",
};

const contactDetails = [
  {
    icon: MapPin,
    label: "Location",
    lines: [
      "Biashara Street,",
      "Nairobi CBD,",
      "Kenya",
    ],
    extra: (
      <a
        href="https://maps.google.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-900 hover:underline text-sm font-medium inline-block mt-2"
      >
        View on Google Maps
      </a>
    ),
  },
  {
    icon: Phone,
    label: "Telephone",
    lines: ["+254 796-053143"],
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["sales@workit.co.ke"],
  },
  {
    icon: Clock,
    label: "Working Hours",
    lines: ["10:00 AM - 7:00 PM (Mon - Sat)"],
  },
];

export default function ContactUsPage() {
  return (
    <main className="min-h-screen bg-white">
      <SectionContainer className="mb-8 py-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary-900 transition inline-flex items-center gap-1.5">
            <Home size={14} />
            Home
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-secondary-900 font-medium">Contact Us</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-sm border border-gray-200 bg-white p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Store Information</h3>
              {contactDetails.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div key={detail.label} className="flex gap-4">
                    <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-sm border bg-primary-50">
                      <Icon className="h-5 w-5 text-primary-900" />
                    </div>
                    <div className="pt-1">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{detail.label}</h4>
                      {detail.lines.map((line, i) => (
                        <p key={i} className="text-sm text-gray-600 mt-0.5">{line}</p>
                      ))}
                      {detail.extra}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SectionContainer>
    </main>
  );
}
