import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Reviews - Workit Nairobi',
  description: 'See what customers in Nairobi, Kenya say about Workit — your trusted store for phones, laptops, and electronics.'
};

export default function ReviewsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 font-[DM_SANS]">
      <h1 className="text-3xl font-bold text-center mb-6">Customer Reviews</h1>

      <p className="text-gray-700 text-start mb-6">
        As a trusted electronics store in Nairobi, Kenya, Workit is dedicated to helping customers find
        the best deals on phones, laptops, TVs, and accessories. We focus on delivering affordable prices, reliable products, and
        excellent customer support that keeps shoppers coming back.
      </p>

      <p className="text-gray-700 text-start mb-6">
        Over the years, Workit has built a reputation as a dependable source for genuine electronics and fast delivery
        across Kenya. We work with verified suppliers and trusted partners to ensure every customer gets quality tech at unbeatable prices.
        Whether {'you\'re'} upgrading your smartphone or shopping for a new appliance, {'we\'re'} here to make your experience smooth and satisfying.
      </p>

      <p className="text-gray-700 text-start mb-6">
        Our customers inspire us to do better every day. Their satisfaction is what drives us and soon, {'you\'ll'} be able to read their
        honest reviews and experiences right here.
      </p>

      <div className="mt-10 text-center">
        <div className="inline-block px-6 py-3 border border-gray-300 rounded-xs text-gray-500">
          Reviews coming soon 
        </div>
      </div>
    </div>
  );
}
