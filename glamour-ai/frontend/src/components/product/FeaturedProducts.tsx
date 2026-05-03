'use client'
// src/components/product/FeaturedProducts.tsx

import { useState } from 'react'
import { useQuery } from 'react-query'
import { productsAPI } from '@/lib/api'
import { fetchFeaturedProducts, fetchByCategory } from '@/lib/makeupApi'
import { ProductCard } from './ProductCard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const MotionDiv = motion.div

const TABS = [
  { label: 'Bestsellers', key: 'featured' },
  { label: 'Makeup',      key: 'makeup' },
  { label: 'Skincare',    key: 'skincare' },
  { label: 'Fragrance',   key: 'fragrance' },
  { label: 'Tools',       key: 'tools' },
]

export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState('featured')
  const isFeatured = activeTab === 'featured'

  const { data, isLoading } = useQuery(
    ['home-products', activeTab],
    async () => {
      // Try backend first, fall back to static catalogue instantly
      try {
        const res = isFeatured
          ? await productsAPI.getFeatured()
          : await productsAPI.list({ category: activeTab, limit: 8, sort: 'created_at', order: 'desc' })
        if (res.data?.products?.length > 0) return res.data.products
        throw new Error('empty')
      } catch {
        // Backend unavailable — use static catalogue (synchronous, instant)
        return isFeatured
          ? fetchFeaturedProducts(8)
          : fetchByCategory(activeTab, 8)
      }
    },
    { staleTime: 5 * 60 * 1000, retry: false }
  )

  const products = data ?? []

  return (
    <section className="section-padding bg-ivory-warm">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne mb-3 block">
              Curated for You
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-noir">
              The <em className="not-italic text-champagne">Edit</em>
            </h2>
          </div>
          <Link
            href={isFeatured ? '/products?featured=true' : `/products?category=${activeTab}`}
            className="hidden md:flex items-center gap-2 font-sans text-xs tracking-widest
                       uppercase text-charcoal-soft hover:text-champagne transition-colors group shrink-0"
          >
            View All
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-10 border-b border-champagne/15 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative shrink-0 pb-3 px-4 font-sans text-xs tracking-[0.12em] uppercase
                          transition-colors duration-200 whitespace-nowrap ${
                            activeTab === tab.key
                              ? 'text-champagne'
                              : 'text-charcoal-soft hover:text-charcoal'
                          }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <MotionDiv
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-px bg-champagne"
                  transition={{ duration: 0.25 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <MotionDiv
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-product skeleton rounded-none" />
                  <div className="h-3 skeleton w-2/3" />
                  <div className="h-3 skeleton w-1/2" />
                </div>
              ))}
            </MotionDiv>
          ) : (
            <MotionDiv
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {products.map((product: any, i: number) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* Mobile view all */}
        <div className="mt-10 text-center md:hidden">
          <Link
            href={isFeatured ? '/products?featured=true' : `/products?category=${activeTab}`}
            className="btn-secondary inline-block"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  )
}
