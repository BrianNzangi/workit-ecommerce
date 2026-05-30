import Image from 'next/image';
import SectionContainer from '@/components/layout/SectionContainer';

export default function AboutWorkit() {
  return (
    <section>
      <SectionContainer className="px-10 sm:px-12 lg:px-16 mb-8 py-6">
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
        <h1 className="font-sans text-base md:text-lg lg:text-2xl font-bold text-gray-900">
          Your Go-To Electronics Store in Biashara Street, Nairobi CBD
        </h1>
        <div className="space-y-4">
          <p className="font-sans text-gray-700 text-sm md:text-md lg:text-lg">
            {`Located on Biashara Street in the heart of the Nairobi CBD, Workit is your ultimate one-stop destination for cutting-edge technology and premium electronics at unbeatable prices. We cater to every aspect of your digital lifestyle, offering an extensive, handpicked selection of top-tier categories. Whether you are looking to upgrade your personal devices with the latest Mobile & Tablets, high-performance Laptops, or specialized Gaming Consoles and PC gear, we have you covered. We also power your home and business infrastructure with robust Desktops & Monitors, advanced Networking Devices, and state-of-the-art Surveillance & Security systems to keep you safe and connected.`}
          </p>
          <p className="font-sans text-gray-700 text-sm md:text-md lg:text-lg">
            {`Beyond personal tech, Workit brings entertainment and comfort into your living space. Explore our premium Electronics section, featuring immersive Television & Video setups, Smart TVs, and Home Audio equipment, alongside a comprehensive range of modern Kitchen, Small, and Large Appliances designed to make daily living effortless. Every single item in our inventory—from standard Computer Hardware to essential everyday Accessories—is guaranteed genuine and sourced from world-class brands like Lenovo.`}
          </p>
          <p className="font-sans text-gray-700 text-sm md:text-md lg:text-lg">
            {`At Workit, we don't just sell gadgets; we deliver an exceptional shopping experience. Our expert team is dedicated to providing friendly advice, highly competitive pricing, and fast, reliable delivery services across Kenya. Visit our physical store on Biashara Street today to experience seamless customer service, or browse our collections online to find the perfect tech solution tailored just for you. With Workit, you can shop with confidence, knowing you're getting the best deals on the latest technology, all backed by our commitment to quality and customer satisfaction. Join the Workit family and elevate your tech game today!`}
          </p>
        </div>
      </div>
      </SectionContainer>
    </section>
  );
}
