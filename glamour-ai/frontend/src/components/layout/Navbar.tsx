'use client'
// src/components/layout/Navbar.tsx

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingBag, Search, User, Heart, Sparkles, Menu, X } from 'lucide-react'
import { useAuthStore, useCartStore, useUIStore, useWishlistStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchOverlay } from './SearchOverlay'

const NAV_LINKS = [
  { href: '/products?category=makeup', label: 'Makeup' },
  { href: '/products?category=skincare', label: 'Skincare' },
  { href: '/products?category=fragrance', label: 'Fragrance' },
  { href: '/products?category=tools', label: 'Tools' },
  { href: '/tryon', label: 'Try On', highlight: true },
]

export function Navbar() {
  const { user, isAuthenticated } = useAuthStore()
  const { cart, setOpen } = useCartStore()
  const { searchOpen, setSearchOpen, mobileMenuOpen, setMobileMenuOpen } = useUIStore()
  const wishlistCount = useWishlistStore(s => s.items.length)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const itemCount = cart?.itemCount || 0

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-ivory/95 backdrop-blur-md shadow-soft border-b border-champagne/20'
            : 'bg-transparent'
        }`}
      >
        {/* Announcement bar */}
        <div className="bg-noir text-ivory text-center py-2">
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase">
            Complimentary shipping on orders over $75 · Free returns
          </p>
        </div>

        <nav className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-charcoal hover:text-champagne transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            <h1 className="font-display text-xl md:text-2xl tracking-[0.15em] text-noir font-medium">
              GLAMOUR
              <span className="text-champagne"> AI</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-xs tracking-[0.12em] uppercase transition-colors duration-200 ${
                  link.highlight
                    ? 'text-champagne hover:text-champagne-dark font-medium'
                    : 'text-charcoal hover:text-champagne'
                }`}
              >
                {link.highlight && <Sparkles size={12} className="inline mr-1" />}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 text-charcoal hover:text-champagne transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <Link
              href="/wishlist"
              className="relative hidden md:block p-1.5 text-charcoal hover:text-champagne transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-400 text-white text-[9px] font-sans
                             font-medium w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </motion.span>
              )}
            </Link>

            <Link
              href={isAuthenticated ? '/account' : '/auth/login'}
              className="hidden md:block p-1.5 text-charcoal hover:text-champagne transition-colors"
              aria-label="Account"
            >
              <User size={18} />
            </Link>

            <button
              onClick={() => setOpen(true)}
              className="relative p-1.5 text-charcoal hover:text-champagne transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-champagne text-noir text-[9px] font-sans
                             font-medium w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-40 w-72 bg-ivory shadow-luxury-lg pt-24 px-8"
          >
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-display text-lg ${
                    link.highlight ? 'text-champagne' : 'text-charcoal'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-champagne/20 my-2" />
              <Link
                href={isAuthenticated ? '/account' : '/auth/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans text-xs tracking-widest uppercase text-charcoal"
              >
                {isAuthenticated ? `Hi, ${user?.firstName}` : 'Sign In'}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-noir/40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
