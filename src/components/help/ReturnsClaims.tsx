"use client";

import React, { useState } from "react";

const faqs = [
  {
    category: "Warranty & Returns",
    items: [
      {
        q: "How to return, replace or refund your order?",
        a: "Log into your Workit account, open the order, and start a return or replacement request. Follow the guided steps and upload any required photos. Our support team will review and provide shipping instructions. If eligible, refunds are processed after we receive and inspect the item."
      }
    ]
  },
  {
    category: "Warranty FAQs",
    items: [
      {
        q: "Returning an item under the 30 Day Return Policy",
        a: "If your purchase is eligible, initiate a return within 30 days of delivery from your account. Ensure the item is in the same condition and includes original accessories. After we receive and verify the return, we will issue a refund to the original payment method."
      },
      {
        q: "Returning an Item under Warranty",
        a: "If the issue is covered by warranty, open a warranty claim from your order page. Provide details and required photos. We'll evaluate and either repair, replace, or refund based on the warranty terms."
      },
      {
        q: "Workit's 12-Month Warranty and its Exclusions",
        a: "Workit provides a 12-month limited warranty on qualifying products. The warranty covers manufacturing defects and device faults not caused by misuse. Exclusions include accidental damage, water damage, unauthorized repairs, and cosmetic wear. Check the product page for specific warranty eligibility."
      }
    ]
  },
  {
    category: "Photo Submission Guidelines",
    items: [
      {
        q: "What photos do I need to submit?",
        a: "Provide clear photos showing the front and back of the device, product label or serial number, and close-ups of the defect or issue. Include a photo of the original packaging and any accessories if relevant. Use good lighting and avoid reflections."
      },
      {
        q: "How to name or format photos?",
        a: "Use descriptive filenames (e.g., order1234_front.jpg). JPEG or PNG formats are preferred. Keep file size under 5MB per photo."
      }
    ]
  },
  {
    category: "Refund & Return Policies",
    items: [
      {
        q: "What is Workit's Refund Policy?",
        a: "Refunds are issued after we receive and inspect the returned item. Eligible refunds are processed to the original payment method within 5–10 business days from approval. Shipping costs may be deducted if not caused by Workit's error."
      },
      {
        q: "What is the 30 Days Return Policy?",
        a: "Customers can return eligible items within 30 days of delivery for a refund or replacement. Items must be returned in the same condition with original accessories. Certain categories (clearance or final-sale items) may be excluded; check the product page for details."
      }
    ]
  },
  {
    category: "My Orders",
    items: [
      {
        q: "I received a wrong device model. What should I do?",
        a: "Open a return request in your account and select 'Wrong item received'. Upload photos showing the item and packaging. We'll arrange return shipping and send the correct model or issue a refund."
      },
      {
        q: "I received a device with different specifications than ordered. What do I do?",
        a: "Start a return via your order and choose 'Incorrect specifications'. Provide photos and order details. Our team will verify and offer replacement or refund."
      },
      {
        q: "I received my device in a different condition. What are my options?",
        a: "If the condition differs from the product listing, request a return citing 'Condition mismatch'. Provide photos. We will offer replacement or refund after inspection."
      },
      {
        q: "I received my device in a faulty condition. What do I do?",
        a: "Report the fault from your order page and include diagnostic photos or short video. We'll guide you through warranty or return steps and offer repair, replacement, or refund based on outcome."
      },
      {
        q: "I have an issue with my item, what should I do?",
        a: "Open a support ticket in your Workit account with order details and photos. Our support team will respond with next steps within two business days."
      },
      {
        q: "I received my device and it is password locked. How do I unlock it?",
        a: "If a device is password locked, do not attempt unauthorized unlocking. Contact support with proof of purchase and device photos. We'll advise if the device is eligible for unlocking or return under warranty."
      }
    ]
  }
];

const Accordion = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-secondary-300 rounded-xs bg-white p-4">
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex justify-between items-center">
          <span className="font-medium">{q}</span>
          <span className="text-gray-500">{open ? "−" : "+"}</span>
        </div>
      </button>
      {open && <p className="mt-3 text-gray-700">{a}</p>}
    </div>
  );
};

const ReturnsClaims = () => {
  return (
    <section className="py-16 bg-accent-800 font-[DM_SANS]">
      <div className="container mx-auto px-8">
        <h1 className="text-3xl font-bold mb-8">Returns & Claims</h1>
        {faqs.map((block) => (
          <div key={block.category} className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">{block.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {block.items.map((item, idx) => (
                <Accordion key={idx} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        <div className="mt-8">
          <p className="text-gray-700 mb-4">
            Still need help? Submit a claim or return request through your Workit account. If you don't have an account,
            please contact our support team at <a href="mailto:support@workit.co.ke" className="text-primary-800">support@workit.co.ke</a>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReturnsClaims;
