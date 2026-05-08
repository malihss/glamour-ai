'use client'
// src/components/product/RecommendedProducts.tsx

import { useQuery } from 'react-query'
import { recommendationsAPI } from '@/lib/api'
import { ProductCard } from './ProductCard'
import { Sparkles } from 'lucide-react'

export function RecommendedProducts() {
  const { data, isLoading } = useQuery('recommendations', () =>
    recommendationsAPI.get('homepage', 4).then(r => r.data)
  )

  if (!data?.products?.length && !isLoading) return null

  return (
    <section className="section-padding bg-ivory-warm">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles size={16} className="text-champagne" />
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne">
              {data?.personalized ? 'Picked For You' : 'You May Also Love'}
            </span>
          </div>
          <h2 className="font-display text-4xl text-noir">
            AI <span className="italic text-champagne">Recommendations</span>
          </h2>
          <p className="font-serif text-charcoal-soft mt-3">
            Personalised beauty discoveries based on your preferences
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-product skeleton" />
                <div className="h-3 skeleton w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {data?.products?.map((product: any, i: number) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
