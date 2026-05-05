'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const CATEGORIES = [
  {
    slug: 'makeup',
    name: 'Makeup',
    description: 'Lips, eyes & face colour',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=700&q=85',
    accent: '#C6A9A3',
  },
  {
    slug: 'skincare',
    name: 'Skincare',
    description: 'Serums, moisturisers & treatments',
    image: 'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=700&q=85',
    accent: '#A8B5A2',
  },
  {
    slug: 'fragrance',
    name: 'Fragrance',
    description: 'Perfumes & luxury scents',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=85',
    accent: '#C6A9A3',
  },
  {
    slug: 'tools',
    name: 'Tools',
    description: 'Brushes, devices & accessories',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&q=85',
    accent: '#A8B5A2',
  },
]

export function CategoryGrid() {
  return (
    <section className="section-padding" style={{ background: '#F1EDE9' }}>
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="h-px w-10" style={{ background: '#C6A9A3' }} />
              <span className="font-sans text-[10px] tracking-[0.32em] uppercase" style={{ color: '#C6A9A3' }}>
                Explore
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl" style={{ color: '#3E3A39' }}>
              Shop by{' '}
              <em className="not-italic" style={{ color: '#C6A9A3' }}>Category</em>
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 font-sans text-xs tracking-widest uppercase transition-colors group"
            style={{ color: '#A89E99' }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#3E3A39')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#A89E99')}
          >
            All Products
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.09, duration: 0.55 }}
              viewport={{ once: true }}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className="group relative block overflow-hidden"
                style={{ aspectRatio: '3/4', borderRadius: '24px' }}
              >
                {/* Photo */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transition: 'transform 750ms cubic-bezier(0.25,0.46,0.45,0.94)' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />

                {/* Gradient overlay — slightly warmer */}
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(62,58,57,0.72) 0%, rgba(62,58,57,0.08) 50%, transparent 100%)' }} />

                {/* Hover accent glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at 50% 80%, ${cat.accent}22 0%, transparent 65%)` }}
                />

                {/* Text */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                  <p className="font-sans text-[9px] tracking-[0.22em] uppercase mb-1.5"
                    style={{ color: 'rgba(232,226,221,0.55)' }}>
                    {cat.description}
                  </p>
                  <h3 className="font-display text-xl md:text-2xl transition-colors duration-300"
                    style={{ color: '#F4EFEb' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = cat.accent)}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#F4EFEb')}
                  >
                    {cat.name}
                  </h3>
                  <div className="mt-2 h-px transition-all duration-500 w-0 group-hover:w-full"
                    style={{ background: cat.accent }} />
                  <div className="mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100
                                  translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="font-sans text-[9px] tracking-widest uppercase" style={{ color: cat.accent }}>Shop Now</span>
                    <ArrowRight size={10} style={{ color: cat.accent }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
