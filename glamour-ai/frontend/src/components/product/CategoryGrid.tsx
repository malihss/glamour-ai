'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const CATEGORIES = [
  {
    slug: 'makeup',
    name: 'Makeup',
    description: 'Lips, eyes & face colour',
    image: 'https://i.pinimg.com/736x/be/16/53/be16539c68629eb749e45ed23a7c126c.jpg',
    accent: '#C6A9A3',
    label: '01',
  },
  {
    slug: 'skincare',
    name: 'Skincare',
    description: 'Serums, moisturisers & treatments',
    image: 'https://i.pinimg.com/1200x/f5/27/6a/f5276a3ae4602ac126edc0edd0cc1c7e.jpg',
    accent: '#A8B5A2',
    label: '02',
  },
  {
    slug: 'fragrance',
    name: 'Fragrance',
    description: 'Perfumes & luxury scents',
    image: 'https://i.pinimg.com/1200x/e5/a3/68/e5a36816072fa8a77a4f13b5a5a5138f.jpg',
    accent: '#C6A9A3',
    label: '03',
  },
  {
    slug: 'tools',
    name: 'Tools',
    description: 'Brushes, devices & accessories',
    image: 'https://i.pinimg.com/1200x/b9/05/a0/b905a0bb5b70e3a1a2f8995669451fda.jpg',
    accent: '#A8B5A2',
    label: '04',
  },
]

export function CategoryGrid() {
  return (
    <section
      className="py-20 md:py-28 px-4 md:px-8 lg:px-16"
      style={{ background: '#FAF8F6' }}
    >
      <div className="max-w-screen-xl mx-auto">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-12" style={{ background: '#C6A9A3' }} />
              <span className="font-sans text-[9px] tracking-[0.42em] uppercase" style={{ color: '#C6A9A3' }}>
                Explore
              </span>
            </div>
            <h2
              className="font-display leading-[1.06]"
              style={{ fontSize: 'clamp(2.4rem, 4vw, 3.6rem)', color: '#3E3A39', letterSpacing: '-0.01em' }}
            >
              Shop by{' '}
              <em style={{ fontStyle: 'italic', color: '#C6A9A3' }}>Category</em>
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 font-sans text-[9px] tracking-[0.3em] uppercase transition-all duration-300 group"
            style={{ color: '#A89E99', borderBottom: '1px solid transparent', paddingBottom: '2px' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#3E3A39'
              ;(e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'rgba(198,169,163,0.5)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#A89E99'
              ;(e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'transparent'
            }}
          >
            All Products
            <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── Editorial grid — desktop ─────────────────────────── */}
        <div
          className="hidden md:grid gap-4"
          style={{
            gridTemplateColumns: '3fr 1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            height: '700px',
          }}
        >
          {/* MAKEUP — tall left */}
          <CategoryCard cat={CATEGORIES[0]} style={{ gridRow: '1 / 3', gridColumn: '1' }} />
          {/* SKINCARE — wide top right */}
          <CategoryCard cat={CATEGORIES[1]} style={{ gridRow: '1', gridColumn: '2 / 4' }} />
          {/* FRAGRANCE — bottom mid */}
          <CategoryCard cat={CATEGORIES[2]} style={{ gridRow: '2', gridColumn: '2' }} />
          {/* TOOLS — bottom right */}
          <CategoryCard cat={CATEGORIES[3]} style={{ gridRow: '2', gridColumn: '3' }} />
        </div>

        {/* ── Mobile 2×2 grid ──────────────────────────────────── */}
        <div className="grid md:hidden grid-cols-2 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className="group relative block overflow-hidden"
                style={{ aspectRatio: '3/4', borderRadius: '16px' }}
              >
                <img src={cat.image} alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(62,58,57,0.72) 0%, transparent 55%)' }} />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <p className="font-sans text-[8px] tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(232,226,221,0.5)' }}>
                    {cat.description}
                  </p>
                  <p className="font-display text-xl" style={{ color: '#F4EFEb' }}>{cat.name}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoryCard({ cat, style }: {
  cat: typeof CATEGORIES[0]
  style: React.CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      style={style}
    >
      <Link
        href={`/products?category=${cat.slug}`}
        className="group relative block overflow-hidden h-full"
        style={{ borderRadius: '14px' }}
      >
        {/* Photo */}
        <img
          src={cat.image}
          alt={cat.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.05]"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(62,58,57,0.78) 0%, rgba(62,58,57,0.10) 45%, transparent 100%)' }} />

        {/* Hover color accent */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-600"
          style={{ background: `radial-gradient(ellipse at 50% 90%, ${cat.accent}18 0%, transparent 60%)` }}
        />

        {/* Top: editorial number */}
        <div className="absolute top-5 left-5">
          <span className="font-sans text-[9px] tracking-[0.4em] uppercase"
            style={{ color: 'rgba(232,226,221,0.40)' }}>{cat.label}</span>
        </div>

        {/* Bottom: text */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-7">
          <p className="font-sans text-[9px] tracking-[0.32em] uppercase mb-2 transition-colors duration-300"
            style={{ color: 'rgba(232,226,221,0.48)' }}>
            {cat.description}
          </p>
          <h3
            className="font-display leading-none transition-colors duration-300"
            style={{
              fontSize: 'clamp(1.4rem, 2.4vw, 2.1rem)',
              color: '#F4EFEb',
              letterSpacing: '-0.01em',
            }}
          >
            {cat.name}
          </h3>

          {/* Thin underline */}
          <div className="mt-3 h-px transition-all duration-500 w-0 group-hover:w-10"
            style={{ background: cat.accent }} />

          {/* Shop now */}
          <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span className="font-sans text-[9px] tracking-[0.3em] uppercase" style={{ color: cat.accent }}>
              Shop
            </span>
            <ArrowRight size={10} style={{ color: cat.accent }} />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
