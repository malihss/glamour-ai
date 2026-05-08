'use client'

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
      try {
        const res = isFeatured
          ? await productsAPI.getFeatured()
          : await productsAPI.list({ category: activeTab, limit: 8, sort: 'created_at', order: 'desc' })
        if (res.data?.products?.length > 0) return res.data.products
        throw new Error('empty')
      } catch {
        return isFeatured ? fetchFeaturedProducts(8) : fetchByCategory(activeTab, 8)
      }
    },
    { staleTime: 5 * 60 * 1000, retry: false }
  )

  const products = data ?? []

  return (
    <section className="section-padding" style={{ background: '#FAF8F6' }}>
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="h-px w-10" style={{ background: '#C6A9A3' }} />
              <span className="font-sans text-[10px] tracking-[0.32em] uppercase" style={{ color: '#C6A9A3' }}>
                Curated for You
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl" style={{ color: '#3E3A39' }}>
              The <em className="not-italic" style={{ color: '#C6A9A3' }}>Edit</em>
            </h2>
          </div>
          <Link
            href={isFeatured ? '/products?featured=true' : `/products?category=${activeTab}`}
            className="hidden md:flex items-center gap-2 font-sans text-xs tracking-widest uppercase transition-colors group shrink-0"
            style={{ color: '#A89E99' }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#3E3A39')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#A89E99')}
          >
            View All
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-10 overflow-x-auto pb-px"
          style={{ borderBottom: '1px solid rgba(198,169,163,0.18)' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative shrink-0 pb-3 px-5 font-sans text-xs tracking-[0.12em] uppercase
                         transition-colors duration-200 whitespace-nowrap"
              style={{ color: activeTab === tab.key ? '#3E3A39' : '#A89E99' }}
            >
              {tab.label}
              {activeTab === tab.key && (
                <MotionDiv
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: '#C6A9A3' }}
                  transition={{ duration: 0.25 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <MotionDiv
              key="skeleton"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-product skeleton" style={{ borderRadius: '16px' }} />
                  <div className="h-3 skeleton w-2/3" style={{ borderRadius: '8px' }} />
                  <div className="h-3 skeleton w-1/2" style={{ borderRadius: '8px' }} />
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

        {/* Mobile view-all */}
        <div className="mt-10 text-center md:hidden">
          <Link
            href={isFeatured ? '/products?featured=true' : `/products?category=${activeTab}`}
            className="inline-flex items-center justify-center px-8 py-4 font-sans text-xs tracking-widest uppercase transition-all duration-300"
            style={{ border: '1.5px solid #C6A9A3', color: '#C6A9A3', borderRadius: '20px' }}
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  )
}
