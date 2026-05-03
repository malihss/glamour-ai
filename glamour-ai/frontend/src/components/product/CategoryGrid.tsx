'use client'
// src/components/product/CategoryGrid.tsx

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const CATEGORIES = [
  {
    slug: 'makeup',
    name: 'Makeup',
    description: 'Lips, eyes & face colour',
    // Real makeup flat-lay — Unsplash (free, no auth)
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=700&q=85',
    accent: '#E8B4B8',
  },
  {
    slug: 'skincare',
    name: 'Skincare',
    description: 'Serums, moisturisers & treatments',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&q=85',
    accent: '#C9A96E',
  },
  {
    slug: 'fragrance',
    name: 'Fragrance',
    description: 'Perfumes & luxury scents',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=700&q=85',
    accent: '#B07080',
  },
  {
    slug: 'tools',
    name: 'Tools',
    description: 'Brushes, devices & accessories',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&q=85',
    accent: '#8C5A2E',
  },
]

export function CategoryGrid() {
  return (
    <section className="section-padding bg-ivory">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne mb-3 block">
              Explore
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-noir">
              Shop by <em className="not-italic text-champagne">Category</em>
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 font-sans text-xs tracking-widest
                       uppercase text-charcoal-soft hover:text-champagne transition-colors group"
          >
            All Products
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className="group relative block overflow-hidden bg-ivory-warm"
                style={{ aspectRatio: '3/4' }}
              >
                {/* Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  style={{ transition: 'transform 700ms ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-noir/85 via-noir/25 to-transparent" />

                {/* Hover colour wash */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(ellipse at center, ${cat.accent}30, transparent 70%)`,
                  }}
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                  <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-ivory/55 mb-1.5">
                    {cat.description}
                  </p>
                  <h3 className="font-display text-xl md:text-2xl text-ivory group-hover:text-champagne transition-colors duration-300">
                    {cat.name}
                  </h3>
                  {/* Underline slide */}
                  <div
                    className="mt-2 h-px bg-champagne/70 transition-all duration-500 w-0 group-hover:w-full"
                  />
                  {/* Arrow */}
                  <div className="mt-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    <span className="font-sans text-[9px] tracking-widest uppercase text-champagne">
                      Shop Now
                    </span>
                    <ArrowRight size={10} className="text-champagne" />
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
