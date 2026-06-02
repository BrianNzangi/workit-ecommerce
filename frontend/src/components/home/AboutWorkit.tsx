import Image from 'next/image';
import Link from 'next/link';
import SectionContainer from '@/components/layout/SectionContainer';

export default function AboutWorkit() {
  return (
    <section>
      <SectionContainer className="mb-8 py-6">
      {/* START ADVERTISER: Awin (USD) from awin.com */}
      <div className="flex justify-center gap-6 mb-12">
        <a rel="sponsored" href="https://www.awin1.com/cread.php?s=531761&v=4032&q=173734&r=2523901">
          <Image
            src="https://www.awin1.com/cshow.php?s=531761&v=4032&q=173734&r=2523901"
            width={720}
            height={90}
            alt="Awin advertiser"
            className="border-0"
            style={{ width: 'auto', height: 'auto' }}
            unoptimized
          />
        </a>
      </div>
      {/* END ADVERTISER: Awin (USD) from awin.com */}

      <div>
        <h1 className="font-sans text-base md:text-md lg:text-lg font-bold text-gray-900 mb-4">
          Your Go-To Electronics Store in Biashara Street, Nairobi CBD
        </h1>
        <div className="space-y-4">
          <p className="font-sans text-gray-700 text-md">
            Located on Biashara Street in the heart of the Nairobi CBD, Workit is your ultimate one-stop destination for cutting-edge technology and premium electronics at unbeatable prices. We cater to every aspect of your digital lifestyle, offering an extensive, handpicked selection of top-tier categories. Whether you are looking to upgrade your personal devices with the latest{' '}
            <Link href="/shop/collections/mobile-phones" className="text-primary-900 hover:underline">Mobile & Tablets</Link>
            , high-performance{' '}
            <Link href="/shop/collections/laptops" className="text-primary-900 hover:underline">Laptops</Link>
            , or specialized{' '}
            <Link href="/shop/collections/gaming-consoles" className="text-primary-900 hover:underline">Gaming Consoles and PC gear</Link>
            , we have you covered. We also power your home and business infrastructure with robust{' '}
            <Link href="/shop/collections/desktops-monitors" className="text-primary-900 hover:underline">Desktops & Monitors</Link>
            , advanced{' '}
            <Link href="/shop/collections/networking" className="text-primary-900 hover:underline">Networking Devices</Link>
            , and state-of-the-art{' '}
            <Link href="/shop/collections/surveillance-security" className="text-primary-900 hover:underline">Surveillance & Security systems</Link>
            {' '}to keep you safe and connected.
          </p>
          <p className="font-sans text-gray-700 text-md">
            Beyond personal tech, Workit brings entertainment and comfort into your living space. Explore our{' '}
            <Link href="/shop/collections/electronics" className="text-primary-900 hover:underline">Electronics</Link>
            {' '}section, featuring immersive{' '}
            <Link href="/shop/collections/tvs-video" className="text-primary-900 hover:underline">Television & Video</Link>
            {' '}setups,{' '}
            <Link href="/shop/collections/smart-tvs" className="text-primary-900 hover:underline">Smart TVs</Link>
            , and{' '}
            <Link href="/shop/collections/home-audio" className="text-primary-900 hover:underline">Home Audio</Link>
            {' '}equipment, alongside a comprehensive range of modern{' '}
            <Link href="/shop/collections/kitchen-appliances" className="text-primary-900 hover:underline">Kitchen</Link>
            ,{' '}
            <Link href="/shop/collections/small-appliances" className="text-primary-900 hover:underline">Small</Link>
            , and{' '}
            <Link href="/shop/collections/large-appliances" className="text-primary-900 hover:underline">Large Appliances</Link>
            {' '}designed to make daily living effortless. Every single item in our inventory, from standard Computer Hardware to essential everyday Accessories is guaranteed genuine and sourced from world-class brands like Lenovo.
          </p>
          <p className="font-sans text-gray-700 text-md">
            At Workit, we don't just sell gadgets; we deliver an exceptional shopping experience. Our expert team is dedicated to providing friendly advice, highly competitive pricing, and fast, reliable delivery services across Kenya. Visit our physical store on Biashara Street today to experience seamless customer service, or{' '}
            <Link href="/shop/collections" className="text-primary-900 hover:underline">browse our collections online</Link>
            {' '}to find the perfect tech solution tailored just for you. With Workit, you can shop with confidence, knowing you're getting the best deals on the latest technology, all backed by our commitment to quality and customer satisfaction. Join the Workit family and elevate your tech game today!
          </p>
        </div>
      </div>
      </SectionContainer>
    </section>
  );
}
