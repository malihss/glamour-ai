'use client'
// src/components/product/ProductCard.tsx

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Star, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useCartStore, useWishlistStore, useAuthStore, type Product } from '@/lib/store'
import { cartAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface Props {
  product: Product
  index?: number
}

// Category-appropriate fallback images when a product image URL fails
const FALLBACKS: Record<string, string[]> = {
  eyes:          ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&q=90',
                  'https://images.unsplash.com/photo-1571781926291-c5e941e1f4bd?w=700&q=90',
                  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=700&q=90'],
  face:          ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&q=90',
                  'https://images.unsplash.com/photo-1597225244516-8b9a3a8b4a4a?w=700&q=90',
                  'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=700&q=90'],
  lip:           ['https://images.unsplash.com/photo-1599733589046-833baccbfc2e?w=700&q=90',
                  'https://images.unsplash.com/photo-1614875555888-6b9b5a54c32d?w=700&q=90',
                  'https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=700&q=90'],
  serums:        ['https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=700&q=90',
                  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&q=90'],
  moisturizers:  ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=700&q=90',
                  'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=700&q=90'],
  cleansers:     ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=700&q=90'],
  'eau-de-parfum':['https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=700&q=90',
                   'https://images.unsplash.com/photo-1541643600914-78b084683702?w=700&q=90'],
  cologne:       ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=90',
                  'https://images.unsplash.com/photo-1547887538-047f5d4b6a2c?w=700&q=90'],
  brushes:       ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&q=90'],
}

function getFallback(catSlug?: string, productId?: string): string {
  const pool = FALLBACKS[catSlug ?? ''] ?? FALLBACKS.face
  const idx  = productId ? parseInt(productId.slice(-4), 16) % pool.length : 0
  return pool[idx] ?? pool[0]
}

export function ProductCard({ product, index = 0 }: Props) {
  const [addingToCart, setAddingToCart] = useState(false)
  const [hovered, setHovered]           = useState(false)
  const [imgSrc, setImgSrc]             = useState(product.primaryImage || '')
  const { setCart, setOpen }            = useCartStore()
  const { toggleItem, hasItem }         = useWishlistStore()
  const { isAuthenticated }             = useAuthStore()
  const isWishlisted                    = hasItem(product.id)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your bag')
      return
    }
    setAddingToCart(true)
    try {
      const { data } = await cartAPI.addItem(product.id, undefined, 1)
      setCart(data.cart)
      setOpen(true)
      toast.success(`${product.name} added to bag`)
    } catch {
      toast.error('Failed to add to bag')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleItem(product.id)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist')
  }

  const stars = Array.from({ length: 5 }, (_, i) => i + 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative bg-white"
      style={{ boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.09)' : '0 0 0 1px rgba(0,0,0,0.06)', transition: 'box-shadow 0.25s ease' }}
    >
      <Link href={`/products/${product.slug}`} className="block">

        {/* ── IMAGE ── */}
        <div className="relative bg-[#f8f6f4] overflow-hidden" style={{ aspectRatio: '1 / 1.1' }}>
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() =>
                setImgSrc(getFallback(product.category?.slug, product.id))
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={36} className="text-gray-200" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isFeatured && (
              <span className="bg-black text-white font-sans text-[9px] tracking-widest uppercase px-2 py-1">
                Best Seller
              </span>
            )}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="bg-red-500 text-white font-sans text-[9px] tracking-widest uppercase px-2 py-1">
                Sale
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm z-10
                       opacity-0 group-hover:opacity-100 transition-all duration-200
                       hover:bg-white shadow-sm"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={15}
              className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}
            />
          </button>

          {/* Try-On chip */}
          <Link
            href={`/tryon?product=${product.id}`}
            onClick={e => e.stopPropagation()}
            className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-sm
                       text-white px-2.5 py-1.5 font-sans text-[9px] tracking-widest uppercase z-10
                       opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black"
          >
            <Sparkles size={9} />
            Try On
          </Link>

          {/* Add to Bag */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="absolute bottom-0 left-0 right-0 bg-black text-white py-3.5
                       font-sans text-[10px] tracking-[0.18em] uppercase z-10
                       translate-y-full group-hover:translate-y-0 transition-transform duration-300
                       hover:bg-[#1a1a1a] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <ShoppingBag size={11} />
            {addingToCart ? 'Adding…' : 'Add to Bag'}
          </button>
        </div>

        {/* ── INFO ── */}
        <div className="px-3 py-3.5">
          {product.brand && (
            <p className="font-sans text-[10px] tracking-[0.12em] uppercase text-gray-400 mb-1">
              {product.brand.name}
            </p>
          )}

          <h3 className="font-sans text-[13px] font-medium text-gray-900 leading-snug mb-2
                         line-clamp-2 group-hover:text-[#b8954f] transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.avgRating != null ? (
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="flex gap-0.5">
                {stars.map(s => (
                  <Star
                    key={s}
                    size={10}
                    className={s <= Math.round(product.avgRating!)
                      ? 'fill-[#C9A96E] text-[#C9A96E]' : 'fill-gray-200 text-gray-200'}
                  />
                ))}
              </div>
              <span className="font-sans text-[10px] text-gray-400">
                ({product.reviewCount})
              </span>
            </div>
          ) : (
            <div className="mb-2.5" />
          )}

          {/* Shade swatches */}
          {product.variants && product.variants.length > 0 && product.variants[0]?.shadeHex && (
            <div className="flex items-center gap-1.5 mb-2.5">
              {product.variants.slice(0, 7).map((v) => (
                <span
                  key={v.id}
                  title={v.name}
                  className="w-3.5 h-3.5 rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,0.12)]
                             cursor-pointer hover:scale-125 transition-transform"
                  style={{ background: v.shadeHex || '#ccc' }}
                />
              ))}
              {product.variants.length > 7 && (
                <span className="font-sans text-[9px] text-gray-400">
                  +{product.variants.length - 7}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-sans text-[13px] font-semibold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="font-sans text-[12px] text-gray-400 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
