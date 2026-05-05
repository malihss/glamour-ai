'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Star } from 'lucide-react'

const HERO_PRODUCTS = [
  {
    image: 'https://images.unsplash.com/photo-1599733589046-833baccbfc2e?w=500&q=88',
    brand: 'Charlotte Tilbury',
    name: 'Matte Revolution',
    price: '$34',
    badge: 'Bestseller',
  },
  {
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&q=88',
    brand: 'Dior Beauty',
    name: 'Miss Dior EDP',
    price: '$135',
    badge: 'Nouveau',
  },
]

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: '95vh', background: '#FAF8F6' }}
    >
      {/* Subtle right-side warmth */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #F1EDE9 0%, transparent 42%)' }} />

      <div
        className="relative z-10 grid grid-cols-1 lg:grid-cols-2"
        style={{ minHeight: '95vh' }}
      >
        {/* ── LEFT: EDITORIAL COPY ─────────────────────────────── */}
        <div className="flex flex-col justify-center px-8 md:px-16 xl:px-24 py-36 lg:py-0">

          {/* Issue label */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.06 }}
            className="flex items-center gap-4 mb-12"
          >
            <span className="h-px w-14" style={{ background: '#C6A9A3' }} />
            <span className="font-sans text-[9px] tracking-[0.46em] uppercase" style={{ color: '#C6A9A3' }}>
              Luxury Beauty · AI-Curated
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="font-display leading-[1.01] mb-10"
            style={{ fontSize: 'clamp(3.6rem, 5.8vw, 6.4rem)', color: '#3E3A39', letterSpacing: '-0.018em' }}
          >
            The Art of<br />
            <em style={{ fontStyle: 'italic', color: '#C6A9A3' }}>Luxury</em><br />
            <span style={{ fontWeight: 300, fontStyle: 'italic', color: '#A89E99', fontSize: '68%' }}>
              Beauty
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
            className="font-body text-[17px] leading-[1.95] mb-14"
            style={{ color: '#7A736F', fontStyle: 'italic', maxWidth: '320px' }}
          >
            Over 1,000 prestige products curated by connoisseurs.
            Experience AI virtual try-on with true precision.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
            className="flex items-center gap-7 mb-20"
          >
            <Link
              href="/tryon"
              className="inline-flex items-center gap-2.5 text-white font-sans text-[9px] tracking-[0.3em] uppercase transition-all duration-400 group"
              style={{ background: '#3E3A39', padding: '14px 34px', borderRadius: '3px' }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#C6A9A3')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#3E3A39')}
            >
              <Sparkles size={10} />
              Virtual Try-On
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 font-sans text-[9px] tracking-[0.3em] uppercase transition-all duration-300 group"
              style={{ color: '#7A736F', borderBottom: '1px solid rgba(198,169,163,0.5)', paddingBottom: '3px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#3E3A39' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#7A736F' }}
            >
              Discover
              <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex gap-10 pt-9"
            style={{ borderTop: '1px solid rgba(198,169,163,0.18)' }}
          >
            {[
              { value: '1,000+',  label: 'Luxury Products' },
              { value: '25+',     label: 'Prestige Brands' },
              { value: '4.9 ★',  label: 'Client Rating' },
            ].map(s => (
              <div key={s.label}>
                <p className="font-display text-2xl mb-0.5 tracking-tight" style={{ color: '#3E3A39' }}>{s.value}</p>
                <p className="font-sans text-[9px] tracking-[0.2em] uppercase" style={{ color: '#A89E99' }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: FULL-HEIGHT EDITORIAL PHOTO ───────────────── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08, duration: 1.3 }}
          className="relative hidden lg:block"
        >
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1000&q=92"
              alt="Luxury beauty editorial"
              className="w-full h-full object-cover object-center"
            />
            {/* Left bleed into background */}
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, #FAF8F6 0%, rgba(250,248,246,0.04) 16%)' }} />
            {/* Bottom vignette */}
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(250,248,246,0.25) 0%, transparent 28%)' }} />
          </div>

          {/* Floating card — lower left */}
          <motion.div
            animate={{ y: [0, -11, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-24 left-8 z-10"
          >
            <MiniCard {...HERO_PRODUCTS[0]} />
          </motion.div>

          {/* Floating card — upper right */}
          <motion.div
            animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
            className="absolute top-28 right-10 z-10"
          >
            <MiniCard {...HERO_PRODUCTS[1]} />
          </motion.div>

          {/* Editorial vertical text */}
          <div className="absolute bottom-10 right-7 z-10">
            <p className="font-sans text-[8px] tracking-[0.55em] uppercase"
              style={{ color: 'rgba(250,248,246,0.45)', writingMode: 'vertical-rl' }}>
              Collection 2024
            </p>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, 14, 0] }} transition={{ duration: 2.8, repeat: Infinity }}
          className="w-px h-14" style={{ background: 'linear-gradient(to bottom, #C6A9A3, transparent)' }}
        />
      </motion.div>
    </section>
  )
}

function MiniCard({ image, brand, name, price, badge }: {
  image: string; brand: string; name: string; price: string; badge: string
}) {
  return (
    <div
      className="bg-white p-3 group transition-all duration-300"
      style={{
        width: '148px',
        borderRadius: '10px',
        boxShadow: '0 20px 60px rgba(62,58,57,0.16)',
        border: '1px solid rgba(198,169,163,0.12)',
      }}
    >
      <div className="relative overflow-hidden mb-3"
        style={{ aspectRatio: '1/1', borderRadius: '6px', background: '#F7F0EE' }}>
        <img src={image} alt={name}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.06]" />
        <span
          className="absolute top-2 left-2 font-sans text-[8px] tracking-[0.2em] uppercase px-2 py-0.5"
          style={{ background: 'rgba(250,248,246,0.95)', color: '#7A736F', borderRadius: '3px' }}
        >
          {badge}
        </span>
      </div>
      <p className="font-sans text-[9px] tracking-[0.2em] uppercase truncate mb-0.5" style={{ color: '#C6A9A3' }}>{brand}</p>
      <p className="font-display text-[12px] leading-snug mb-2 line-clamp-2" style={{ color: '#3E3A39' }}>{name}</p>
      <div className="flex items-center justify-between">
        <span className="font-sans text-[12px] font-semibold" style={{ color: '#3E3A39' }}>{price}</span>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(s => <Star key={s} size={7} style={{ fill: '#C6A9A3', color: '#C6A9A3' }} />)}
        </div>
      </div>
    </div>
  )
}
