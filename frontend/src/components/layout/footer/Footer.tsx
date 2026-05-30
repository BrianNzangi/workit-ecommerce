import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SectionContainer from '@/components/layout/SectionContainer'

export default function Footer() {
  return (
    <footer>
      {/* Store Contact Details */}
      <div className="border-b border-t border-gray-300 bg-gray-100/50">
        <SectionContainer className="px-10 sm:px-12 lg:px-16 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Left column - heading */}
            <div className="flex flex-col justify-center">
              <h2 className="text-secondary-900 font-bold text-xl">We&apos;re Always Here To Help</h2>
              <p className="text-secondary-600 text-sm mt-1">Reach out to us through any of these support channels</p>
            </div>

            {/* Right column - contact items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-self-end">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="text-secondary-500 size-4" />
                </div>
                <div>
                  <p className="text-secondary-500 font-semibold text-[11px] tracking-widest mb-0.5">CALL CENTER</p>
                  <p className="font-semibold text-secondary-900">+254 796 053 143</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="text-secondary-500 size-4" />
                </div>
                <div>
                  <p className="text-secondary-500 font-semibold text-[11px] tracking-widest mb-0.5">EMAIL SUPPORT</p>
                  <p className="font-semibold text-secondary-900">hello@workit.co.ke</p>
                </div>
              </div>
            </div>
          </div>
        </SectionContainer>
      </div>

      {/* Main Links */}
      <div className="bg-secondary-900">
        <SectionContainer className="px-10 sm:px-12 lg:px-16 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* SHOP - Categories */}
            <div>
              <h3 className="text-white font-semibold mb-4">POPULAR CATEGORIES</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/shop/collections/laptops" className="text-gray-400 hover:text-white transition-colors">Laptops</Link></li>
                <li><Link href="/shop/collections/mobile-phones" className="text-gray-400 hover:text-white transition-colors">Mobile Phones & Tablets</Link></li>
                <li><Link href="/shop/collections/desktops-monitors" className="text-gray-400 hover:text-white transition-colors">Desktops & Monitors</Link></li>
                <li><Link href="/shop/collections/gaming-consoles" className="text-gray-400 hover:text-white transition-colors">Gaming & PC</Link></li>
                <li><Link href="/shop/collections/tvs-video" className="text-gray-400 hover:text-white transition-colors">TVs & Video</Link></li>
                <li><Link href="/shop/collections/home-audio" className="text-gray-400 hover:text-white transition-colors">Home Audio</Link></li>
                <li className="pt-1"><Link href="/shop/collections" className="text-primary-400 hover:text-white transition-colors font-medium">All Categories →</Link></li>
              </ul>
            </div>

            {/* CUSTOMER SERVICE */}
            <div>
              <h3 className="text-white font-semibold mb-4">CUSTOMER SERVICE</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help-center" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Track My Order</Link></li>
                <li><Link href="/contact-us" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/shipping-policy" className="text-gray-400 hover:text-white transition-colors">Shipping Policy</Link></li>
                <li><Link href="/returns-refunds-policy" className="text-gray-400 hover:text-white transition-colors">Returns & Refunds</Link></li>
                <li><Link href="/advertising-policy" className="text-gray-400 hover:text-white transition-colors">Advertising Policy</Link></li>
              </ul>
            </div>

            {/* ABOUT */}
            <div>
              <h3 className="text-white font-semibold mb-4">ABOUT</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about-workit" className="text-gray-400 hover:text-white transition-colors">About Workit</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Our Blog</Link></li>
                <li><Link href="/reviews" className="text-gray-400 hover:text-white transition-colors">Customer Reviews</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* NEWSLETTER */}
            <div>
              <h3 className="text-white font-semibold mb-4">Unlock exclusive discounts, new arrivals, and daily deals.</h3>
              <form className="flex flex-col space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-secondary-800 border-secondary-700 text-gray-200 placeholder:text-gray-500 focus-visible:ring-primary-900"
                />
                <Button
                  type="submit"
                  className="bg-primary-900 hover:bg-primary-800 text-white"
                >
                  Subscribe
                </Button>
              </form>
              <p className="text-xs mt-3 text-gray-500">
                By subscribing, you accept our{' '}
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white underline transition-colors">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </SectionContainer>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-secondary-800 bg-secondary-900">
        <SectionContainer className="px-10 sm:px-12 lg:px-16 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">&copy; 2020 - {new Date().getFullYear()} Workit. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <a href="https://www.facebook.com/shopworkitkenya" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-primary-900 transition-colors">
                <Facebook className="size-5" />
              </a>
              <a href="https://www.instagram.com/shopworkitkenya/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-primary-900 transition-colors">
                <Instagram className="size-5" />
              </a>
            </div>
          </div>
        </SectionContainer>
      </div>
    </footer>
  )
}
