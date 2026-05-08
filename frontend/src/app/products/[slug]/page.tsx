'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { cartAPI } from '@/lib/api'
import { Star, Heart, ShoppingBag, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore, useWishlistStore, useAuthStore, useRatingsStore } from '@/lib/store'
import { ProductCard } from '@/components/product/ProductCard'
import Link from 'next/link'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [descOpen, setDescOpen] = useState(true)
  const [starHover, setStarHover] = useState(0)

  const { setCart, setOpen } = useCartStore()
  const { toggleItem, hasItem } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  const { rate, getAvg, getCount, getUserRating } = useRatingsStore()

  const fetchProduct = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    setProduct(null)
    try {
      const res = await fetch(`${API_URL}/products/${slug}`, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const json = await res.json()
      setProduct(json.product || null)
    } catch (e) {
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items')
      return
    }
    setAddingToCart(true)
    try {
      const { data: cartData } = await cartAPI.addItem(product.id, selectedVariant?.id, quantity)
      setCart(cartData.cart)
      setOpen(true)
      toast.success('Added to bag!')
    } catch {
      toast.error('Failed to add to bag')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="pt-[88px] min-h-screen">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="aspect-square skeleton" />
            <div className="space-y-6">
              <div className="h-4 skeleton w-1/4" />
              <div className="h-8 skeleton w-3/4" />
              <div className="h-4 skeleton w-1/3" />
              <div className="h-12 skeleton w-1/4" />
              <div className="h-10 skeleton" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pt-[88px] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="font-display text-2xl text-noir">Product not found</p>
          <Link href="/products" className="btn-primary inline-block">Browse Products</Link>
        </div>
      </div>
    )
  }

  const images = product.images?.length
    ? product.images
    : [{ url: product.primaryImage, altText: product.name }]
  const currentImage = images[selectedImageIdx]
  const isWishlisted = hasItem(product.id)
  const effectivePrice = product.price + (selectedVariant?.priceModifier || 0)
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)

  const localAvg    = getAvg(product.id)
  const localCount  = getCount(product.id)
  const userRating  = getUserRating(product.id)
  const displayAvg  = localAvg ?? product.avgRating ?? null
  const displayCount = localCount > 0
    ? localCount
    : (product.reviewCount ?? 0)

  return (
    <div className="pt-[88px]">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex gap-2 font-sans text-xs text-charcoal-soft mb-10 flex-wrap">
          <Link href="/" className="hover:text-champagne">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-champagne">Products</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/products?category=${product.category.slug}`}
                className="hover:text-champagne capitalize">{product.category.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-charcoal">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Images */}
          <div className="flex gap-4">
            {images.length > 1 && (
              <div className="flex flex-col gap-3 w-20 flex-shrink-0">
                {images.map((img: any, idx: number) => (
                  <button key={idx} onClick={() => setSelectedImageIdx(idx)}
                    className={`aspect-square overflow-hidden border-2 transition-all ${
                      selectedImageIdx === idx ? 'border-champagne' : 'border-transparent'
                    }`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 relative aspect-square bg-ivory-warm overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImageIdx}
                  src={currentImage?.url}
                  alt={currentImage?.altText || product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              <button
                onClick={() => { toggleItem(product.id); toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist') }}
                className="absolute top-4 right-4 p-2.5 bg-ivory/90 backdrop-blur-sm hover:bg-ivory shadow-soft"
              >
                <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-charcoal'} />
              </button>

              <Link href={`/tryon?product=${product.id}`}
                className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-noir/80 backdrop-blur-sm
                           text-ivory px-3 py-2 font-sans text-[10px] tracking-widest uppercase
                           hover:bg-champagne hover:text-noir transition-colors">
                <Sparkles size={11} />
                Try On
              </Link>
            </div>
          </div>

          {/* Product Info */}
          <div>
            {product.brand && (
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne mb-3">
                {product.brand.name}
              </p>
            )}
            <h1 className="font-display text-3xl md:text-4xl text-noir mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1">
                {stars.map(s => {
                  const filled = s <= (starHover || Math.round(displayAvg ?? 0))
                  const isOwn  = s <= (userRating ?? 0)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { rate(product.id, s); toast.success('Merci pour votre note !') }}
                      onMouseEnter={() => setStarHover(s)}
                      onMouseLeave={() => setStarHover(0)}
                      title={`${s} étoile${s > 1 ? 's' : ''}`}
                      className="transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        size={18}
                        className={
                          starHover > 0
                            ? (s <= starHover ? 'fill-champagne text-champagne' : 'text-champagne/20')
                            : isOwn
                            ? 'fill-champagne text-champagne'
                            : filled
                            ? 'fill-champagne text-champagne'
                            : 'text-champagne/20'
                        }
                      />
                    </button>
                  )
                })}
              </div>
              <span className="font-sans text-xs text-charcoal-soft">
                {displayAvg != null ? `${displayAvg.toFixed(1)} · ` : ''}
                {displayCount} avis
                {userRating ? ` · Votre note : ${userRating}★` : ''}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-display text-3xl text-noir">${effectivePrice.toFixed(2)}</span>
              {product.compareAtPrice && (
                <span className="font-sans text-base text-charcoal-soft line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="font-serif text-charcoal text-lg leading-relaxed mb-8">
              {product.shortDescription}
            </p>

            {product.variants?.length > 0 && product.variants[0].shadeHex && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-sans text-xs tracking-widest uppercase text-charcoal">Shade</span>
                  {selectedVariant && (
                    <span className="font-sans text-xs text-champagne">{selectedVariant.name}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v: any) => (
                    <button key={v.id}
                      onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                      title={v.name}
                      className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedVariant?.id === v.id ? 'border-charcoal scale-110 shadow-md' : 'border-transparent shadow'
                      }`}
                      style={{ background: v.shadeHex }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
              <span className="font-sans text-xs tracking-widest uppercase text-charcoal">Qty</span>
              <div className="flex items-center border border-champagne/30">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2.5 text-charcoal hover:text-champagne">−</button>
                <span className="font-sans text-sm w-10 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2.5 text-charcoal hover:text-champagne">+</button>
              </div>
            </div>

            <div className="flex gap-3 mb-10">
              <button onClick={handleAddToCart} disabled={addingToCart}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                <ShoppingBag size={14} />
                {addingToCart ? 'Adding...' : 'Add to Bag'}
              </button>
              <Link href={`/tryon?product=${product.id}`}
                className="flex items-center gap-1.5 btn-secondary px-5">
                <Sparkles size={14} />
                Try On
              </Link>
            </div>

            <div className="border-t border-champagne/20">
              <button onClick={() => setDescOpen(!descOpen)}
                className="flex items-center justify-between w-full py-5 font-sans text-xs tracking-widest uppercase">
                <span>Description</span>
                {descOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <AnimatePresence>
                {descOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <p className="font-serif text-charcoal leading-relaxed pb-6">{product.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {product.reviews?.length > 0 && (
          <div className="mb-20">
            <h2 className="font-display text-3xl text-noir mb-8">Avis clients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {product.reviews.map((review: any) => (
                <div key={review.id} className="bg-ivory-warm p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-0.5">
                      {stars.map(s => (
                        <Star key={s} size={12}
                          className={s <= review.rating ? 'fill-champagne text-champagne' : 'text-champagne/20'} />
                      ))}
                    </div>
                    {review.isVerifiedPurchase && (
                      <span className="font-sans text-[9px] tracking-wider uppercase text-champagne border border-champagne/30 px-2 py-0.5">
                        Vérifié
                      </span>
                    )}
                  </div>
                  {review.title && <p className="font-display text-sm text-noir mb-2">{review.title}</p>}
                  <p className="font-serif text-charcoal text-sm leading-relaxed mb-3">{review.body}</p>
                  <p className="font-sans text-xs text-charcoal-soft">{review.userName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {product.relatedProducts?.length > 0 && (
          <div>
            <h2 className="font-display text-3xl text-noir mb-8">You May Also Love</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {product.relatedProducts.map((p: any, i: number) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
