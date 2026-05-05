'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Star } from 'lucide-react'

const HERO_PRODUCTS = [
  {
    image: 'https://images.unsplash.com/photo-1599733589046-833baccbfc2e?w=500&q=85',
    brand: 'Charlotte Tilbury',
    name: 'Matte Revolution',
    price: '$34',
    badge: 'Bestseller',
  },
  {
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=85',
    brand: 'La Mer',
    name: 'Crème de la Mer',
    price: '$195',
    badge: 'Iconic',
  },
  {
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&q=85',
    brand: 'Dior Beauty',
    name: 'Miss Dior EDP',
    price: '$135',
    badge: 'New',
  },
]

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(150deg, #FAF8F6 0%, #F4EFEb 55%, #FAF8F6 100%)' }}
    >
      {/* ── Decorative background ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #EDE5E3 0%, transparent 70%)', filter: 'blur(70px)' }} />
        <div className="absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #A8B5A2 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #C6A9A3 0%, transparent 70%)', filter: 'blur(80px)' }} />

        {/* Subtle dot pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]">
          <defs>
            <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#3E3A39" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Decorative ring */}
        <svg className="absolute top-20 left-12 opacity-[0.08] hidden xl:block" width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#C6A9A3" strokeWidth="0.8" strokeDasharray="4 6" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#C6A9A3" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="4" fill="#C6A9A3" opacity="0.4" />
        </svg>
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: copy ──────────────────────────────────── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="h-px w-10" style={{ background: '#C6A9A3' }} />
              <span className="font-sans text-[10px] tracking-[0.35em] uppercase"
                style={{ color: '#C6A9A3' }}>
                AI-Powered Luxury Beauty
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="font-display leading-[1.06] mb-8"
              style={{ fontSize: 'clamp(2.8rem, 5vw, 4.8rem)', color: '#3E3A39' }}
            >
              Beauty,{' '}
              <em className="not-italic" style={{ color: '#C6A9A3' }}>Reimagined</em>
              <br />
              <span className="font-light italic" style={{ color: '#A89E99', fontSize: '82%' }}>
                by Intelligence
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="font-body text-lg md:text-xl leading-relaxed mb-11 max-w-lg"
              style={{ color: '#7A736F' }}
            >
              Discover over 1,000 luxury products curated by experts.
              Try on any shade in real time with our AI, then shop with confidence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="flex flex-col sm:flex-row gap-4 mb-16"
            >
              <Link href="/tryon"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white
                           font-sans text-xs tracking-[0.15em] uppercase transition-all duration-300 group"
                style={{ background: '#C6A9A3', borderRadius: '20px' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#B09892')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#C6A9A3')}
              >
                <Sparkles size={13} />
                Try On Now
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4
                           font-sans text-xs tracking-[0.15em] uppercase transition-all duration-300"
                style={{ border: '1.5px solid #C6A9A3', color: '#C6A9A3', borderRadius: '20px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#F7F0EE' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
              >
                Shop Collection
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.52 }}
              className="grid grid-cols-3 gap-6 pt-10"
              style={{ borderTop: '1px solid rgba(198,169,163,0.20)' }}
            >
              {[
                { value: '1,000+',    label: 'Luxury Products' },
                { value: '25+',       label: 'Prestige Brands' },
                { value: 'Real-Time', label: 'AI Virtual Try-On' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="font-display text-xl md:text-2xl mb-1" style={{ color: '#C6A9A3' }}>{stat.value}</p>
                  <p className="font-sans text-[9px] tracking-[0.18em] uppercase" style={{ color: '#A89E99' }}>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: model + floating product cards ─────────── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22, duration: 0.85 }}
            className="relative hidden lg:block"
          >
            {/* Main portrait frame */}
            <div className="relative max-w-[340px] mx-auto">
              <div
                className="overflow-hidden"
                style={{
                  aspectRatio: '3/4',
                  borderRadius: '40px',
                  boxShadow: '0 24px 72px rgba(62,58,57,0.12)',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=700&q=90"
                  alt="Beauty model"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to bottom, transparent 65%, rgba(62,58,57,0.08) 100%)' }} />
              </div>

              {/* Decorative ring behind photo */}
              <div className="absolute -inset-4 rounded-[48px] border opacity-15 pointer-events-none"
                style={{ borderColor: '#C6A9A3' }} />

              {/* Floating card 1 — top left */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-16 top-[12%]"
              >
                <MiniCard {...HERO_PRODUCTS[0]} tall />
              </motion.div>

              {/* Floating card 2 — bottom right */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -right-14 bottom-[18%]"
              >
                <MiniCard {...HERO_PRODUCTS[1]} />
              </motion.div>

              {/* Floating card 3 — top right */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute -right-10 top-[10%]"
              >
                <MiniCard {...HERO_PRODUCTS[2]} />
              </motion.div>
            </div>

            {/* Scattered dots */}
            {[
              { x: '-5%', y: '50%', s: 7 },
              { x: '102%', y: '42%', s: 5 },
              { x: '105%', y: '65%', s: 4 },
              { x: '-8%', y: '72%', s: 5 },
            ].map((d, i) => (
              <div key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: d.x, top: d.y,
                  width: d.s, height: d.s,
                  background: i % 2 === 0 ? '#C6A9A3' : '#A8B5A2',
                  opacity: 0.45,
                }} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-10"
          style={{ background: 'linear-gradient(to bottom, #C6A9A3, transparent)' }}
        />
      </motion.div>
    </section>
  )
}

function MiniCard({
  image, brand, name, price, badge, tall,
}: {
  image: string; brand: string; name: string; price: string; badge: string; tall?: boolean
}) {
  return (
    <div
      className="bg-white p-3 group transition-shadow duration-300"
      style={{
        width: tall ? '148px' : '132px',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(62,58,57,0.09)',
        border: '1px solid rgba(198,169,163,0.12)',
      }}
    >
      <div
        className="relative overflow-hidden mb-2.5"
        style={{ aspectRatio: tall ? '3/4' : '1/1', borderRadius: '14px', background: '#F7F0EE' }}
      >
        <img src={image} alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span
          className="absolute top-2 left-2 font-sans text-[8px] tracking-widest uppercase px-2 py-0.5"
          style={{ background: '#EDE5E3', color: '#9A7E79', borderRadius: '20px' }}
        >
          {badge}
        </span>
      </div>
      <p className="font-sans text-[9px] tracking-[0.14em] uppercase truncate mb-0.5"
        style={{ color: '#C6A9A3' }}>
        {brand}
      </p>
      <p className="font-display text-[11px] leading-snug mb-1.5 line-clamp-2"
        style={{ color: '#3E3A39' }}>
        {name}
      </p>
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs font-medium" style={{ color: '#3E3A39' }}>{price}</span>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={7} style={{ fill: '#C6A9A3', color: '#C6A9A3' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
