'use client'

import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-[#202020] text-gray-300 font-[DM_SANS] ">
      <div className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Row 1 - ABOUT */}
        <div>
          <h3 className="text-white font-semibold mb-4">ABOUT</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/about-workit" className="hover:text-white">About Workit</a></li>
            <li><Link href="/blog" className="hover:text-white">Our Blog</Link></li>
            <li><Link href="/reviews" className="hover:text-white">Customer Reviews</Link></li>
            <li><Link href="/careers" className="hover:text-white">We Are Hiring!</Link></li>
          </ul>
        </div>

        {/* Row 2 - TERMS */}
        <div>
          <h3 className="text-white font-semibold mb-4">TERMS</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/warranty-refunds" className="hover:text-white">Warranty & Refunds</a></li>
            <li><a href="/shipping-policy" className="hover:text-white">Shipping Policy</a></li>
            <li><a href="/terms-of-service" className="hover:text-white">Terms Of Service</a></li>
            <li><a href="/privacy-policy" className="hover:text-white">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Row 3 - HELP */}
        <div>
          <h3 className="text-white font-semibold mb-4">HELP</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Track My Order</a></li>
            <li><a href="#" className="hover:text-white">Help Center</a></li>
            <li><a href="#" className="hover:text-white">Returns & Claims</a></li>
            <li><a href="#" className="hover:text-white">Contact Us</a></li>
            <li>
              <button className="mt-2 w-36 bg-white text-black text-sm font-medium py-2 px-4 rounded hover:bg-gray-200 transition">
                Contact Us
              </button>
            </li>
            <li><a href="#" className="hover:text-white">Sell on Workit</a></li>
          </ul>
        </div>

        {/* Row 4 - Newsletter */}
        <div>
          <h3 className="text-white font-semibold mb-4">Unlock exclusive discounts, new arrivals, and daily deals.</h3>
          <form className="flex flex-col space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs mt-3 text-gray-400">
            By subscribing, you accept our Privacy Policy
          </p>
          <p className="text-xs mt-1 text-gray-500">
            This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-8 py-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-400">&copy; 2025 Workit. All rights reserved.</p>
          <div className="flex space-x-5 mt-4 md:mt-0">
            <a href="#" aria-label="Facebook" className="hover:text-white"><FaFacebookF /></a>
            <a href="#" aria-label="Instagram" className="hover:text-white"><FaInstagram /></a>
            <a href="#" aria-label="Twitter" className="hover:text-white"><FaTwitter /></a>
            <a href="#" aria-label="YouTube" className="hover:text-white"><FaYoutube /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
