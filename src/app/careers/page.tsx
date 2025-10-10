import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers at Workit - Nairobi Kenya',
  description: 'Join Workit in Nairobi, Kenya — a growing electronics store offering phones, laptops, and accessories at unbeatable prices. Check for new career opportunities soon.'
};

export default function CareersPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-center">
      <h1 className="text-3xl font-bold mb-6">We're Hiring at Workit</h1>

      <p className="text-gray-700 mb-6">
        Workit is a fast-growing electronics store based in <strong>Nairobi, Kenya</strong>, focused on helping customers
        find the best deals on phones, laptops, TVs, and accessories. As we continue to expand, we're always on the lookout
        for passionate, talented individuals who want to make a real impact in e-commerce and technology retail.
      </p>

      <p className="text-gray-700 mb-6">
        Our mission is simple — make quality tech more accessible, affordable, and reliable for everyone.
        We value creativity, teamwork, and a commitment to customer satisfaction above all else.
      </p>

      <p className="text-gray-700 mb-6">
        While we don't have any open positions at the moment, we're constantly growing.
        Please check back soon or follow us on social media to stay updated on new opportunities.
      </p>

      <div className="mt-10">
        <div className="inline-block px-6 py-3 border border-gray-300 rounded-lg text-gray-500">
          🚀 No openings right now — stay tuned!
        </div>
      </div>
    </div>
  );
}
