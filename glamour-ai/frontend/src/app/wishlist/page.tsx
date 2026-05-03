'use client'
// src/app/wishlist/page.tsx

import { useWishlistStore } from '@/lib/store'
import { useQuery } from 'react-query'
import { productsAPI } from '@/lib/api'
import { ProductCard } from '@/components/product/ProductCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function WishlistPage() {
  const { items } = useWishlistStore()

  return (
    <div className="pt-[88px] min-h-screen bg-ivory">
      {/* Header */}
      <div className="bg-noir py-12 px-4 md:px-8">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl text-ivory flex items-center gap-4">
            My Wishlist
            {items.length > 0 && (
              <span className="font-sans text-base text-champagne">({items.length})</span>
            )}
          </h1>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-16">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="w-20 h-20 border border-champagne/20 flex items-center justify-center mx-auto mb-6"
            >
              <Heart size={32} className="text-champagne/40" />
            </motion.div>
            <p className="font-display text-2xl text-charcoal mb-4">Your wishlist is empty</p>
            <p className="font-serif text-charcoal-soft mb-10">
              Save items you love and come back to them later
            </p>
            <Link href="/products" className="btn-primary">Discover Products</Link>
          </div>
        ) : (
          <WishlistProducts ids={items} />
        )}
      </div>
    </div>
  )
}

function WishlistProducts({ ids }: { ids: string[] }) {
  const { data, isLoading, isError } = useQuery(
    ['wishlist-products', ids.join(',')],
    () => productsAPI.list({ ids: ids.join(','), limit: ids.length }).then(r => r.data),
    { enabled: ids.length > 0 }
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {ids.map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-product skeleton" />
            <div className="h-3 skeleton w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (isError || !data?.products?.length) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-xl text-charcoal mb-2">Couldn't load your wishlist</p>
        <p className="font-sans text-sm text-charcoal-soft mb-8">Please try refreshing the page</p>
        <Link href="/products" className="btn-primary">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      {data.products.map((product: any, i: number) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  )
}
