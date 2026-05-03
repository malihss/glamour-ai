// src/components/layout/Footer.tsx

import Link from 'next/link'
import { Instagram, Youtube, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-noir text-ivory/80">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <h2 className="font-display text-2xl text-ivory tracking-[0.15em] mb-4">
              GLAMOUR<span className="text-champagne"> AI</span>
            </h2>
            <p className="font-serif text-ivory/60 text-sm leading-relaxed mb-6">
              Where luxury beauty meets artificial intelligence. Discover, try, and fall in love.
            </p>
            <div className="flex gap-4">
              {[Instagram, Youtube, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="p-2 text-ivory/40 hover:text-champagne transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase text-champagne mb-6">Shop</h3>
            <ul className="space-y-3">
              {['Makeup', 'Skincare', 'Fragrance', 'Tools & Brushes', 'New Arrivals', 'Best Sellers'].map((item) => (
                <li key={item}>
                  <Link href="/products" className="font-sans text-xs text-ivory/60 hover:text-champagne transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Features */}
          <div>
            <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase text-champagne mb-6">Beauty Tech</h3>
            <ul className="space-y-3">
              {[
                { label: 'Virtual Try-On', href: '/tryon' },
                { label: 'AI Recommendations', href: '/products' },
                { label: 'Beauty Chatbot', href: '#' },
                { label: 'Skin Analysis', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="font-sans text-xs text-ivory/60 hover:text-champagne transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase text-champagne mb-6">Help</h3>
            <ul className="space-y-3">
              {['Shipping & Returns', 'Order Status', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map((item) => (
                <li key={item}>
                  <a href="#" className="font-sans text-xs text-ivory/60 hover:text-champagne transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-ivory/10 pt-12 mb-12">
          <div className="max-w-md">
            <h3 className="font-display text-xl text-ivory mb-2">Stay in the glow</h3>
            <p className="font-sans text-xs text-ivory/50 mb-6">
              Subscribe for exclusive offers, beauty tips, and first access to new arrivals.
            </p>
            <div className="flex gap-0">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-ivory/10 border border-ivory/20 px-4 py-3 font-sans text-xs
                           text-ivory placeholder-ivory/30 focus:outline-none focus:border-champagne transition-colors"
              />
              <button className="bg-champagne text-noir px-6 py-3 font-sans text-xs tracking-widest uppercase
                                  hover:bg-champagne-light transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-ivory/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-[10px] text-ivory/40 tracking-wider">
            © 2025 GLAMOUR AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Visa', 'Mastercard', 'PayPal', 'Apple Pay'].map((method) => (
              <span key={method} className="font-sans text-[10px] text-ivory/30">{method}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
