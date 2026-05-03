'use client'
// src/components/product/HeroSection.tsx

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Star } from 'lucide-react'

const HERO_PRODUCTS = [
  {
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=85',
    brand: 'Charlotte Tilbury',
    name: 'Matte Revolution',
    price: '$34',
    badge: 'Bestseller',
  },
  {
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=85',
    brand: 'La Mer',
    name: 'Crème de la Mer',
    price: '$195',
    badge: 'Iconic',
  },
  {
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=500&q=85',
    brand: 'Dior Beauty',
    name: 'Miss Dior EDP',
    price: '$135',
    badge: 'New',
  },
]

export function HeroSection() {
  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-noir">

      {/* Editorial model — right half, large */}
      <div className="absolute inset-y-0 right-0 w-[55%] pointer-events-none hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=90"
          alt=""
          className="w-full h-full object-cover object-top"
          style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 28%)' }}
        />
        {/* Gradient fade left */}
        <div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/60 to-transparent" />
        {/* Subtle champagne tint overlay */}
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ background: 'radial-gradient(ellipse at 70% 40%, #C9A96E 0%, transparent 60%)' }} />
      </div>

      {/* Global ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-20"
          style={{ background: 'radial-gradient(ellipse at 85% 30%, rgba(201,169,110,0.18) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-15"
          style={{ background: 'radial-gradient(ellipse at 15% 90%, rgba(232,180,184,0.15) 0%, transparent 60%)' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,169,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }} />
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 w-full py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">

          {/* ── Left: Content ──────────────────────────────────────────────── */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="h-px w-10 bg-champagne" />
              <span className="font-sans text-[10px] tracking-[0.35em] uppercase text-champagne">
                AI-Powered Luxury Beauty
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-5xl md:text-6xl lg:text-[4.5rem] text-ivory leading-[1.06] mb-8"
            >
              Beauty,{' '}
              <em className="not-italic text-champagne">Reimagined</em>
              <br />
              <span className="text-ivory/70 font-light">by Intelligence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="font-serif text-ivory/55 text-lg md:text-xl leading-relaxed mb-10 max-w-xl"
            >
              Discover over 1,000 luxury products curated by experts.
              Try on any shade in real time with our AI, then shop with confidence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="flex flex-col sm:flex-row gap-4 mb-16"
            >
              <Link href="/tryon"
                className="inline-flex items-center justify-center gap-2 bg-champagne text-noir
                           px-8 py-4 font-sans text-xs tracking-[0.15em] uppercase
                           hover:bg-champagne-light transition-all duration-300 group">
                <Sparkles size={13} />
                Try On Now
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/products"
                className="inline-flex items-center justify-center gap-2 border border-ivory/25
                           text-ivory px-8 py-4 font-sans text-xs tracking-[0.15em] uppercase
                           hover:border-champagne hover:text-champagne transition-all duration-300">
                Shop Collection
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.56 }}
              className="grid grid-cols-3 gap-6 pt-10 border-t border-ivory/10"
            >
              {[
                { value: '1,000+', label: 'Luxury Products' },
                { value: '25+',    label: 'Prestige Brands' },
                { value: 'Real-Time', label: 'AI Virtual Try-On' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-xl md:text-2xl text-champagne mb-1">{stat.value}</p>
                  <p className="font-sans text-[9px] tracking-[0.18em] uppercase text-ivory/35">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Floating product cards ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28, duration: 0.9 }}
            className="hidden lg:flex gap-4 items-end relative z-20"
          >
            {/* Tall card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="w-52"
            >
              <HeroCard {...HERO_PRODUCTS[0]} tall />
            </motion.div>

            {/* Short stack */}
            <div className="flex flex-col gap-4 mb-8">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="w-44"
              >
                <HeroCard {...HERO_PRODUCTS[1]} />
              </motion.div>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
                className="w-44"
              >
                <HeroCard {...HERO_PRODUCTS[2]} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-10 bg-gradient-to-b from-champagne/60 to-transparent"
        />
      </motion.div>
    </section>
  )
}

function HeroCard({
  image, brand, name, price, badge, tall,
}: {
  image: string; brand: string; name: string; price: string; badge: string; tall?: boolean
}) {
  return (
    <div className="bg-ivory/[0.06] backdrop-blur-sm border border-champagne/20 p-3 shadow-luxury group">
      <div className={`relative bg-ivory/10 mb-3 overflow-hidden ${tall ? 'aspect-[3/4]' : 'aspect-square'}`}>
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir/30 to-transparent" />
        <span className="absolute top-2 left-2 bg-champagne text-noir text-[8px] font-sans tracking-widest uppercase px-1.5 py-0.5">
          {badge}
        </span>
      </div>
      <p className="font-sans text-[9px] tracking-[0.18em] uppercase text-champagne mb-0.5">{brand}</p>
      <p className="font-display text-xs text-ivory leading-snug mb-2">{name}</p>
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs text-ivory/75">{price}</span>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(s => <Star key={s} size={8} className="fill-champagne text-champagne" />)}
        </div>
      </div>
    </div>
  )
}
