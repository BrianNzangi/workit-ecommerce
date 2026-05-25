"use client";

import React, { useState } from 'react';
import { trackMetaEvent } from '@/lib/meta/meta-browser';

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
    <section className="pb-20 bg-accent-800 font-sans">
      <div className="container mx-auto px-8">
        <div className="mx-auto">
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-secondary-00 mb-2">Name</label>
              <input type="text" id="name" name="name" className="w-full p-2 border border-secondary-200 rounded-xs" />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-secondary-00 mb-2">Email</label>
              <input type="email" id="email" name="email" className="w-full p-2 border border-secondary-200 rounded-xs" />
            </div>
            <div className="mb-4">
              <label htmlFor="nature" className="block text-secondary-00 mb-2">Nature of Request</label>
              <select id="nature" name="nature" className="w-full p-2 border border-secondary-200 rounded-xs">
                <option value="">Select a request type</option>
                <option value="return-policy">Return Policy</option>
                <option value="warranty">Warranty</option>
                <option value="repair-request">Repair Request</option>
                <option value="other-inquiries">Other Inquiries</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-secondary-00 mb-2">Message</label>
              <textarea id="message" name="message" className="w-full p-2 border border-secondary-200 rounded-xs" rows={4}></textarea>
            </div>
            <button type="submit" disabled={isSubmitting} className="bg-primary-900 text-white text-xl px-8 py-2 rounded-xs hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            {statusMessage ? (
              <p className="mt-4 text-sm text-secondary-900">{statusMessage}</p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
