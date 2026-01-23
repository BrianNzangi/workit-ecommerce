'use client';

import Image from 'next/image';

export default function AboutWorkit() {
  return (
    <section className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-8 pb-12 font-sans">
      {/* START ADVERTISER: Awin (USD) from awin.com */}
      <div className="flex justify-center gap-6 mb-12">
        <a rel="sponsored" href="https://www.awin1.com/cread.php?s=531761&v=4032&q=173734&r=2523901">
          <Image src="https://www.awin1.com/cshow.php?s=531761&v=4032&q=173734&r=2523901" width={720} height={90} alt="Awin advertiser" style={{ border: '0' }} />
        </a>
      </div>
      {/* END ADVERTISER: Awin (USD) from awin.com */}

      <div>
        <h1 className="font-sans text-base md:text-lg lg:text-2xl font-bold text-gray-900">
          Your Go-To Electronics Store in Nairobi CBD
        </h1>
        <p className="font-sans text-gray-700 text-sm md:text-md lg:text-lg">
          {`Located on Moi Avenue in Nairobi, Workit is your one-stop destination for the latest electronics at unbeatable prices. From smartphones, laptops, and tablets to accessories, headphones, and smart home devices, we stock products that fit every tech need. Our team ensures genuine, high-quality products with competitive pricing and fast, reliable service. Whether you're upgrading your gadgets, shopping for essentials, or hunting for the newest tech releases, Workit makes electronics shopping in Nairobi effortless and enjoyable. Visit us in the heart of the CBD and experience seamless service, expert advice, and the latest tech at your fingertips.`}
        </p>
      </div>
    </section>
  );
}
