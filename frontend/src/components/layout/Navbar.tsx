'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ShoppingBag, Search, User, Heart, Menu, X, ChevronDown } from 'lucide-react'
import { useAuthStore, useCartStore, useUIStore, useWishlistStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchOverlay } from './SearchOverlay'

const SHOP_COLS = [
  {
    heading: 'Categories',
    links: [
      { href: '/products?category=makeup',    label: 'Makeup' },
      { href: '/products?category=skincare',  label: 'Skincare' },
      { href: '/products?category=fragrance', label: 'Fragrance' },
      { href: '/products?category=tools',     label: 'Tools & Brushes' },
    ],
  },
  {
    heading: 'Collections',
    links: [
      { href: '/products?sort=created_at&order=desc', label: 'New Arrivals' },
      { href: '/products?sort=rating&order=desc',     label: 'Best Sellers' },
      { href: '/routine',                             label: 'Routine Generator' },
      { href: '/products',                            label: 'All Products' },
    ],
  },
]

const MOBILE_LINKS = [
  { href: '/products?category=makeup',            label: 'Makeup' },
  { href: '/products?category=skincare',          label: 'Skincare' },
  { href: '/products?category=fragrance',         label: 'Fragrance' },
  { href: '/products?category=tools',             label: 'Tools & Brushes' },
  { href: '/products?sort=created_at&order=desc', label: 'New Arrivals' },
  { href: '/products?sort=rating&order=desc',     label: 'Best Sellers' },
  { href: '/journey',                             label: 'Beauty Journey' },
  { href: '/routine',                             label: 'My Routine' },
  { href: '/shop-the-look',                       label: 'Shop the Look' },
]

export function Navbar() {
  const { user, isAuthenticated } = useAuthStore()
  const { cart, setOpen }         = useCartStore()
  const { searchOpen, setSearchOpen, mobileMenuOpen, setMobileMenuOpen } = useUIStore()
  const wishlistCount = useWishlistStore(s => s.items.length)

  const [scrolled, setScrolled]   = useState(false)
  const [shopOpen, setShopOpen]   = useState(false)
  const shopRef                   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const itemCount = cart?.itemCount || 0

  const linkStyle = { color: '#7A736F' }
  const linkHover = (e: React.MouseEvent<HTMLElement>, enter: boolean) => {
    (e.currentTarget as HTMLElement).style.color = enter ? '#3E3A39' : '#7A736F'
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/96 backdrop-blur-md shadow-[0_1px_20px_rgba(62,58,57,0.06)] border-b border-[#E8E2DD]'
          : 'bg-[#FAF8F6]/80 backdrop-blur-sm'
      }`}>

        {/* Announcement bar */}
        <div className="text-center py-2.5" style={{ background: '#3E3A39' }}>
          <p className="font-sans text-[10px] tracking-[0.25em] uppercase"
            style={{ color: 'rgba(232,226,221,0.85)' }}>
            Complimentary shipping on orders over $75 · Free returns
          </p>
        </div>

        <nav className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

          {/* Mobile burger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2" style={{ color: '#7A736F' }} aria-label="Menu">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            <h1 className="font-display text-xl md:text-2xl tracking-[0.18em] font-medium"
              style={{ color: '#3E3A39' }}>
              GLAMOUR<span style={{ color: '#C6A9A3' }}> AI</span>
            </h1>
          </Link>

          {/* ── Desktop nav — 3 items ── */}
          <div className="hidden md:flex items-center gap-10">

            {/* SHOP dropdown */}
            <div ref={shopRef} className="relative">
              <button
                onClick={() => setShopOpen(v => !v)}
                onMouseEnter={() => setShopOpen(true)}
                className="flex items-center gap-1 font-sans text-xs tracking-[0.14em] uppercase
                           transition-colors duration-200 relative group"
                style={linkStyle}
                onMouseLeave={e => { linkHover(e, false); }}
              >
                <span
                  onMouseEnter={e => linkHover(e, true)}
                  onMouseLeave={e => linkHover(e, false)}
                  style={{ color: 'inherit' }}>
                  Shop
                </span>
                <ChevronDown size={11} className={`transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`} />
                <span className="absolute -bottom-0.5 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                  style={{ background: '#C6A9A3' }} />
              </button>

              <AnimatePresence>
                {shopOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={() => setShopOpen(true)}
                    onMouseLeave={() => setShopOpen(false)}
                    className="absolute left-0 top-full mt-3 w-72 p-5"
                    style={{
                      background: '#fff',
                      borderRadius: 16,
                      border: '1px solid rgba(198,169,163,0.18)',
                      boxShadow: '0 12px 40px rgba(62,58,57,0.10)',
                    }}
                  >
                    <div className="grid grid-cols-2 gap-x-6 gap-y-0">
                      {SHOP_COLS.map(col => (
                        <div key={col.heading}>
                          <p className="font-sans text-[9px] tracking-[0.25em] uppercase mb-3"
                            style={{ color: '#C6A9A3' }}>
                            {col.heading}
                          </p>
                          <ul className="space-y-2.5">
                            {col.links.map(l => (
                              <li key={l.href}>
                                <Link href={l.href}
                                  onClick={() => setShopOpen(false)}
                                  className="font-sans text-xs transition-colors"
                                  style={{ color: '#7A736F' }}
                                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#3E3A39')}
                                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#7A736F')}
                                >
                                  {l.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(198,169,163,0.15)' }}>
                      <Link href="/products"
                        onClick={() => setShopOpen(false)}
                        className="font-sans text-[10px] tracking-widest uppercase transition-colors"
                        style={{ color: '#C6A9A3' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#A08070')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#C6A9A3')}
                      >
                        View All →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* BEAUTY JOURNEY */}
            <Link href="/journey"
              className="font-sans text-xs tracking-[0.14em] uppercase transition-colors duration-200 relative group"
              style={linkStyle}
              onMouseEnter={e => linkHover(e, true)}
              onMouseLeave={e => linkHover(e, false)}
            >
              Beauty Journey
              <span className="absolute -bottom-0.5 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                style={{ background: '#C6A9A3' }} />
            </Link>

            {/* ROUTINE */}
            <Link href="/routine"
              className="font-sans text-xs tracking-[0.14em] uppercase transition-colors duration-200 relative group"
              style={linkStyle}
              onMouseEnter={e => linkHover(e, true)}
              onMouseLeave={e => linkHover(e, false)}
            >
              My Routine
              <span className="absolute -bottom-0.5 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                style={{ background: '#C6A9A3' }} />
            </Link>

            {/* SHOP THE LOOK */}
            <Link href="/shop-the-look"
              className="font-sans text-xs tracking-[0.14em] uppercase transition-colors duration-200 relative group"
              style={{ color: '#C6A9A3' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#A08070')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#C6A9A3')}
            >
              ✦ Shop the Look
              <span className="absolute -bottom-0.5 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                style={{ background: '#C6A9A3' }} />
            </Link>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)} className="p-1.5 transition-colors"
              style={{ color: '#A89E99' }} aria-label="Search"
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#3E3A39')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#A89E99')}>
              <Search size={18} />
            </button>

            <Link href="/wishlist" className="relative hidden md:block p-1.5 transition-colors"
              style={{ color: '#A89E99' }} aria-label="Wishlist"
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#3E3A39')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#A89E99')}>
              <Heart size={18} />
              {wishlistCount > 0 && (
                <motion.span key={wishlistCount} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 text-white text-[9px] font-sans font-medium
                             w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: '#C6A9A3' }}>
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </motion.span>
              )}
            </Link>

            <Link href={isAuthenticated ? '/account' : '/auth/login'}
              className="hidden md:block p-1.5 transition-colors"
              style={{ color: '#A89E99' }} aria-label="Account"
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#3E3A39')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#A89E99')}>
              <User size={18} />
            </Link>

            <button onClick={() => setOpen(true)} className="relative p-1.5 transition-colors"
              style={{ color: '#A89E99' }} aria-label="Cart"
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#3E3A39')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#A89E99')}>
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 text-white text-[9px] font-sans font-medium
                             w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: '#C6A9A3' }}>
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile slide-in */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }} transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-40 w-72 pt-24 px-8 overflow-y-auto"
            style={{ background: '#FAF8F6', boxShadow: '4px 0 32px rgba(62,58,57,0.08)' }}
          >
            <nav className="flex flex-col gap-5">
              {MOBILE_LINKS.map(link => (
                <Link key={link.href} href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display text-lg tracking-wide text-noir">
                  {link.label}
                </Link>
              ))}
              <hr style={{ borderColor: 'rgba(198,169,163,0.25)' }} />
              <Link href={isAuthenticated ? '/account' : '/auth/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="font-sans text-xs tracking-widest uppercase"
                style={{ color: '#A89E99' }}>
                {isAuthenticated ? `Hi, ${user?.firstName}` : 'Sign In'}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30" style={{ background: 'rgba(62,58,57,0.20)' }}
            onClick={() => setMobileMenuOpen(false)} />
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
