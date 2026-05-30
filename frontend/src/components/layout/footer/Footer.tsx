import Link from 'next/link'
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa'
import SectionContainer from '@/components/layout/SectionContainer'

export default function Footer() {
  return (
    <footer className=" text-gray-300 font-sans ">

      {/* Store Contact Details */}
      <div className="border-b border-t border-gray-300 bg-secondary-100/15">
        <SectionContainer className="px-10 sm:px-12 lg:px-16 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-32">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
              <FaPhone className="text-secondary-500 text-lg" />
            </div>
            <div>
              <p className="text-semibold font-bold text-secondary-900">+254 700 000 000</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
              <FaEnvelope className="text-secondary-500 text-lg" />
            </div>
            <div>
              <p className="text-semibold font-bold text-secondary-900">hello@shopworkit.co.ke</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
              <FaMapMarkerAlt className="text-secondary-500 text-lg" />
            </div>
            <div>
              <p className="text-semibold font-bold text-secondary-900">Biashara Street, Nairobi CBD, Kenya</p>
            </div>
          </div>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer className="px-10 sm:px-12 lg:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Row 1 - ABOUT */}
        <div>
          <h3 className="text-secondary-900 font-semibold mb-4">ABOUT</h3>
          <ul className="space-y-2 text-secondary-900 text-sm">
            <li><Link href="/about-workit" className="hover:text-primary-900">About Workit</Link></li>
            <li><Link href="/blog" className="hover:text-primary-900">Our Blog</Link></li>
            <li><Link href="/reviews" className="hover:text-primary-900">Customer Reviews</Link></li>
            <li><Link href="/careers" className="hover:text-primary-900">Careers</Link></li>
          </ul>
        </div>

        {/* Row 2 - TERMS */}
        <div>
          <h3 className="text-secondary-900 font-semibold mb-4">TERMS</h3>
          <ul className="space-y-2 text-secondary-900 text-sm">
            <li><Link href="/returns-refunds-policy" className="hover:text-primary-900">Returns and Refunds Policy</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-primary-900">Shipping Policy</Link></li>
            <li><Link href="/terms-of-service" className="hover:text-primary-900">Terms of Service</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-primary-900">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Row 3 - HELP */}
        <div>
          <h3 className="text-secondary-900 font-semibold mb-4">HELP</h3>
          <ul className="space-y-2 text-secondary-900 text-sm">
            <li><Link href="/dashboard" className="hover:text-primary-900">Track My Order</Link></li>
            <li><Link href="/help-center" className="hover:text-primary-900">Help Center</Link></li>
            <li><Link href="/advertising-policy" className="hover:text-primary-900">Advertising Policy</Link></li>
            <li>
              <Link href="/contact-us" className="mt-2 w-36 bg-secondary-800 text-white text-sm font-medium py-2 px-2 rounded-xs hover:bg-primary-900 transition inline-block text-center">
                Contact Us
              </Link>
            </li>
            {/* <li><a href="/help-center" className="hover:text-primary-900">Sell on Workit</a></li> */}
          </ul>
        </div>

        {/* Row 4 - Newsletter */}
        <div>
          <h3 className="text-secondary-900 font-semibold mb-4">Unlock exclusive discounts, new arrivals, and daily deals.</h3>
          <form className="flex flex-col space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-xs bg-secondary-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="bg-primary-900 text-white py-2 px-4 rounded-xs hover:bg-primary-800 transition"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs mt-3 text-gray-400">
            By subscribing, you accept our <Link href="/privacy-policy" className="hover:text-primary-900 underline">Privacy Policy</Link>
          </p>
          {/** <p className="text-xs mt-1 text-gray-500">
            This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
          </p>**/}
        </div>
        </div>
      </SectionContainer>

      {/* Bottom bar */}
      <div className="border-t-4 border-primary-900 bg-secondary-900">
        <SectionContainer className="px-10 sm:px-12 lg:px-16 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-white">&copy; 2020 - {new Date().getFullYear()} Workit. All rights reserved.</p>
          <div className="flex space-x-5 mt-4 md:mt-0">
            <a href="https://www.facebook.com/shopworkitkenya" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white *:**:hover:text-primary-900"><FaFacebookF /></a>
            <a href="https://www.instagram.com/shopworkitkenya/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white *:**:hover:text-primary-900"><FaInstagram /></a>
            {/** <a href="https://www.tiktok.com/@shopworkitkenya" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-white *:**:hover:text-primary-900"><FaTiktok /></a> **/}
          </div>
          </div>
        </SectionContainer>
      </div>
    </footer>
  )
}
