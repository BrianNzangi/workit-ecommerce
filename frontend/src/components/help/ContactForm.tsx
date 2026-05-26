"use client";

import React, { useState } from 'react';
import { trackMetaEvent } from '@/lib/meta/meta-browser';
import SectionContainer from '@/components/layout/SectionContainer';

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const nature = String(formData.get('nature') || '').trim();
    const message = String(formData.get('message') || '').trim();

    try {
      await trackMetaEvent({
        eventName: 'Contact',
        eventId: `contact:${Date.now()}`,
        userData: {
          email,
          firstName: name.split(' ')[0] || null,
        },
        customData: {
          contact_category: nature || 'general',
          message_length: message.length,
        },
      });

      event.currentTarget.reset();
      setStatusMessage('Thanks, your request has been received.');
    } catch {
      setStatusMessage('We could not submit your request right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="pb-20 bg-white font-sans border-t border-gray-200">
      <SectionContainer className="px-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Contact Us</h2>
          <form onSubmit={handleSubmit} className="max-w-lg">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" id="name" name="name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent" />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="email" name="email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent" />
            </div>
            <div className="mb-4">
              <label htmlFor="nature" className="block text-sm font-medium text-gray-700 mb-1">Nature of Request</label>
              <select id="nature" name="nature" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent">
                <option value="">Select a request type</option>
                <option value="return-policy">Return Policy</option>
                <option value="warranty">Warranty</option>
                <option value="repair-request">Repair Request</option>
                <option value="other-inquiries">Other Inquiries</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea id="message" name="message" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent" rows={4}></textarea>
            </div>
            <button type="submit" disabled={isSubmitting} className="bg-primary-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-70 transition-colors">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            {statusMessage ? (
              <p className="mt-4 text-sm text-gray-600">{statusMessage}</p>
            ) : null}
          </form>
      </SectionContainer>
    </section>
  );
};

export default ContactForm;
