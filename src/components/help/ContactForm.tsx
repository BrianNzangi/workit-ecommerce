import React from 'react';

const ContactForm = () => {
  return (
    <section className="pb-20 bg-accent-800 font-[DM_SANS]">
      <div className="container mx-auto px-8">
        <div className="mx-auto">
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <form>
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
            <button type="submit" className="bg-primary-900 text-white text-xl px-8 py-2 rounded-xs hover:bg-primary-800">
              Submit
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
