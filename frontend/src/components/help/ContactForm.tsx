"use client";

import React, { useState } from 'react';
import { trackMetaEvent } from '@/lib/meta/meta-browser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    <>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Contact Us</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
          <Input type="text" id="name" name="name" placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <Input type="email" id="email" name="email" placeholder="your@email.com" />
        </div>
        <div>
          <label htmlFor="nature" className="block text-sm font-medium text-gray-700 mb-1.5">Nature of Request</label>
          <select id="nature" name="nature" className="flex h-12 w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none">
            <option value="">Select a request type</option>
            <option value="return-policy">Return Policy</option>
            <option value="warranty">Warranty</option>
            <option value="repair-request">Repair Request</option>
            <option value="other-inquiries">Other Inquiries</option>
          </select>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
          <textarea id="message" name="message" className="flex min-h-24 w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none placeholder:text-muted-foreground" rows={4} placeholder="How can we help?"></textarea>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full bg-primary-900 text-white py-2 px-8 rounded-xs hover:bg-primary-800 transition sm:w-auto">
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
        {statusMessage ? (
          <p className="text-sm text-gray-600">{statusMessage}</p>
        ) : null}
      </form>
    </>
  );
};

export default ContactForm;
