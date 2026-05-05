'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingBag, Search, User, Heart, Menu, X } from 'lucide-react'
import { useAuthStore, useCartStore, useUIStore, useWishlistStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchOverlay } from './SearchOverlay'

const NAV_LINKS = [
  { href: '/products?category=makeup',    label: 'Makeup' },
  { href: '/products?category=skincare',  label: 'Skincare' },
  { href: '/products?category=fragrance', label: 'Fragrance' },
  { href: '/products?category=tools',     label: 'Tools' },
]

export function Navbar() {
  const { user, isAuthenticated } = useAuthStore()
  const { cart, setOpen }         = useCartStore()
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
            ? 'bg-white/96 backdrop-blur-md shadow-[0_1px_20px_rgba(62,58,57,0.06)] border-b border-[#E8E2DD]'
            : 'bg-[#FAF8F6]/80 backdrop-blur-sm'
        }`}
      >
        {/* Announcement bar — muted taupe */}
        <div className="text-center py-2.5" style={{ background: '#3E3A39' }}>
          <p className="font-sans text-[10px] tracking-[0.25em] uppercase" style={{ color: 'rgba(232,226,221,0.85)' }}>
            Complimentary shipping on orders over $75 · Free returns
          </p>
        </div>

        <nav className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Mobile menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 transition-colors"
            style={{ color: '#7A736F' }}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            <h1 className="font-display text-xl md:text-2xl tracking-[0.18em] font-medium"
              style={{ color: '#3E3A39' }}>
              GLAMOUR
              <span style={{ color: '#C6A9A3' }}> AI</span>
            </h1>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-xs tracking-[0.14em] uppercase transition-all duration-200
                           relative group"
                style={{ color: '#7A736F' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#3E3A39')}
                onMouseLeave={e => (e.currentTarget.style.color = '#7A736F')}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                  style={{ background: '#C6A9A3' }} />
              </Link>
            ))}
          </nav>

          {/* Action icons */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)}
              className="p-1.5 transition-colors" style={{ color: '#A89E99' }}
              aria-label="Search"
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#3E3A39')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#A89E99')}
            >
              <Search size={18} />
            </button>

            <Link href="/wishlist"
              className="relative hidden md:block p-1.5 transition-colors"
              style={{ color: '#A89E99' }}
              aria-label="Wishlist"
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#3E3A39')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#A89E99')}
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 text-white text-[9px] font-sans font-medium
                             w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: '#C6A9A3' }}
                >
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </motion.span>
              )}
            </Link>

            <Link href={isAuthenticated ? '/account' : '/auth/login'}
              className="hidden md:block p-1.5 transition-colors"
              style={{ color: '#A89E99' }}
              aria-label="Account"
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#3E3A39')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#A89E99')}
            >
              <User size={18} />
            </Link>

            <button onClick={() => setOpen(true)}
              className="relative p-1.5 transition-colors"
              style={{ color: '#A89E99' }}
              aria-label="Cart"
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#3E3A39')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#A89E99')}
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 text-white text-[9px] font-sans font-medium
                             w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: '#C6A9A3' }}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-40 w-72 pt-24 px-8"
            style={{ background: '#FAF8F6', boxShadow: '4px 0 32px rgba(62,58,57,0.08)' }}
          >
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display text-lg tracking-wide"
                  style={{ color: '#3E3A39' }}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2" style={{ borderColor: 'rgba(198,169,163,0.25)' }} />
              <Link href={isAuthenticated ? '/account' : '/auth/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans text-xs tracking-widest uppercase"
                style={{ color: '#A89E99' }}
              >
                {isAuthenticated ? `Hi, ${user?.firstName}` : 'Sign In'}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(62,58,57,0.20)' }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
