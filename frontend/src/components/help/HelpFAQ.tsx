"use client";

import React from "react";

const faqItems = [
  {
    category: "About Workit",
    faqs: [
      { question: "What is Workit?", answer: "Workit is a trusted electronics store offering phones, laptops, TVs, and accessories with fast delivery and reliable customer support." },
      { question: "Does Workit have a Physical Store?", answer: "Workit is based at Moi Avenue, Ghale House, Nairobi, and operates primarily online through workit.co.ke." },
      { question: "What do the product conditions mean?", answer: "All products are carefully inspected. New items are brand new, while refurbished items are tested, fully functional, and ready to use." }
    ]
  },
  {
    category: "Account",
    faqs: [
      { question: "How do I create an account?", answer: "Click on 'Create an Account' at the top right and follow the registration steps." },
      { question: "How do I log in to my account?", answer: "Click 'Log in' and enter your registered email and password to access your account." },
      { question: "How do I unsubscribe from newsletters?", answer: "You can unsubscribe anytime from the link at the bottom of any Workit newsletter email." }
    ]
  },
  {
    category: "Shipping",
    faqs: [
      { question: "How do I track my order?", answer: "Log into your account and view your orders to see tracking details." },
      { question: "How long does it take to receive my order?", answer: "Orders typically arrive within 2-5 business days depending on your location." },
      { question: "What is Workit's delivery area?", answer: "We currently deliver across Nairobi and select regions in Kenya. More areas will be added soon." }
    ]
  },
  {
    category: "Warranty & Returns",
    faqs: [
      { question: "What is Workit's Refund Policy?", answer: "We offer a 30-day return policy on eligible products and a 1-year warranty for defective items." },
      { question: "Returning an Item under Warranty", answer: "Submit a request through your account, and our team will guide you through the warranty return process." },
      { question: "Returning an Item under 30 days Return Policy", answer: "Initiate a return through your account within 30 days of purchase for a full refund on eligible items." }
    ]
  },
  {
    category: "Payments",
    faqs: [
      { question: "What payment options do I have?", answer: "We accept credit/debit cards, M-Pesa, and PayPal for online payments." },
      { question: "Do you accept instalments / monthly payments?", answer: "Currently, we only support full payment upfront." },
      { question: "How do I download my Invoice?", answer: "Invoices are available in your account under 'Orders' after completing your purchase." }
    ]
  },
  {
    category: "Other",
    faqs: [
      { question: "Can I purchase in bulk?", answer: "Yes! Contact our support team via your account for bulk order requests." },
      { question: "Do you accept company orders?", answer: "Yes, we cater to company orders. Please contact our support team for assistance." }
    ]
  }
];

const HelpFAQ = () => {
  return (
    <section className="pt-20 pb-8 bg-accent-800 font-sans">
      <div className="container mx-auto px-8">
        {faqItems.map((category) => (
          <div key={category.category} className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.faqs.map((faq, index) => (
                <div key={index} className="bg-white border border-secondary-300 rounded-xs p-6 shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-secondary-700 text-md">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HelpFAQ;
