'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { cartAPI } from '@/lib/api'
import { Star, Heart, ShoppingBag, Sparkles, ChevronDown, ChevronUp, PenLine } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store'
import { ProductCard } from '@/components/product/ProductCard'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug

  const [product, setProduct]               = useState<any>(null)
  const [loading, setLoading]               = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [quantity, setQuantity]             = useState(1)
  const [addingToCart, setAddingToCart]     = useState(false)
  const [descOpen, setDescOpen]             = useState(true)

  // Review form state
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [reviewStar, setReviewStar]         = useState(0)
  const [reviewStarHover, setReviewStarHover] = useState(0)
  const [reviewTitle, setReviewTitle]       = useState('')
  const [reviewBody, setReviewBody]         = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const reviewRef = useRef<HTMLDivElement>(null)

  const { setCart, setOpen } = useCartStore()
  const { toggleItem, hasItem } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchProduct = useCallback(async () => {
    if (!slug) return
    setLoading(true)
    setProduct(null)
    try {
      const res = await fetch(`${API_URL}/products/${slug}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`${res.status}`)
      const json = await res.json()
      setProduct(json.product || null)
    } catch {
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { fetchProduct() }, [fetchProduct])

  // ── Add to cart ───────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please sign in to add items'); return }
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

  // ── Submit review ─────────────────────────────────────────────────────────
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Please sign in to leave a review'); return }
    if (reviewStar === 0) { toast.error('Please select a star rating'); return }
    if (!reviewBody.trim()) { toast.error('Please write a review'); return }
    setSubmittingReview(true)
    try {
      const token = Cookies.get('access_token')
      const res = await fetch(`${API_URL}/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: reviewStar, title: reviewTitle.trim() || undefined, body: reviewBody.trim() }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed')
      }
      toast.success('Review submitted — thank you!')
      setReviewStar(0)
      setReviewTitle('')
      setReviewBody('')
      setReviewFormOpen(false)
      fetchProduct()
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  // ── Loading / not found ───────────────────────────────────────────────────
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
  const currentImage    = images[selectedImageIdx]
  const isWishlisted    = hasItem(product.id)
  const effectivePrice  = product.price + (selectedVariant?.priceModifier || 0)
  const stars           = [1, 2, 3, 4, 5]
  const displayAvg      = product.avgRating ?? null
  const displayCount    = product.reviewCount ?? 0
  const breakdown       = product.ratingBreakdown ?? { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
  const maxBreakdown    = Math.max(...Object.values(breakdown as Record<string, number>), 1)

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

          {/* ── Images ── */}
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
                <motion.img key={selectedImageIdx} src={currentImage?.url}
                  alt={currentImage?.altText || product.name}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }} className="w-full h-full object-cover" />
              </AnimatePresence>
              <button
                onClick={() => { toggleItem(product.id); toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist') }}
                className="absolute top-4 right-4 p-2.5 bg-ivory/90 backdrop-blur-sm hover:bg-ivory shadow-soft">
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

          {/* ── Product info ── */}
          <div>
            {product.brand && (
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne mb-3">
                {product.brand.name}
              </p>
            )}
            <h1 className="font-display text-3xl md:text-4xl text-noir mb-4">{product.name}</h1>

            {/* Stars summary — click to scroll to review section */}
            <button
              onClick={() => { setReviewFormOpen(true); reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}
              className="flex items-center gap-3 mb-6 group"
            >
              <div className="flex gap-1">
                {stars.map(s => (
                  <Star key={s} size={17}
                    className={s <= Math.round(displayAvg ?? 0)
                      ? 'fill-champagne text-champagne'
                      : 'text-champagne/25'} />
                ))}
              </div>
              <span className="font-sans text-xs text-charcoal-soft group-hover:text-champagne transition-colors">
                {displayAvg != null ? `${displayAvg.toFixed(1)} · ` : ''}
                {displayCount} review{displayCount !== 1 ? 's' : ''}
                <span className="ml-2 underline underline-offset-2">Write one</span>
              </span>
            </button>

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

            {/* Shade variants */}
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
                      style={{ background: v.shadeHex }} />
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
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

            {/* CTA */}
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

            {/* Description accordion */}
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

        {/* ── Reviews section ── */}
        <div className="mb-20" ref={reviewRef}>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 className="font-display text-3xl text-noir">Customer Reviews</h2>
            <button
              onClick={() => setReviewFormOpen(v => !v)}
              className="flex items-center gap-2 font-sans text-xs tracking-widest uppercase
                         border border-champagne/40 px-5 py-2.5 text-champagne hover:bg-champagne
                         hover:text-white transition-colors">
              <PenLine size={13} />
              Write a Review
            </button>
          </div>

          {/* Rating overview */}
          {displayCount > 0 && (
            <div className="bg-ivory-warm p-6 mb-8 flex flex-col md:flex-row gap-8 items-center">
              {/* Big number */}
              <div className="text-center shrink-0">
                <p className="font-display text-6xl text-noir leading-none">
                  {displayAvg?.toFixed(1) ?? '—'}
                </p>
                <div className="flex gap-1 justify-center my-2">
                  {stars.map(s => (
                    <Star key={s} size={14}
                      className={s <= Math.round(displayAvg ?? 0) ? 'fill-champagne text-champagne' : 'text-champagne/20'} />
                  ))}
                </div>
                <p className="font-sans text-xs text-charcoal-soft">{displayCount} review{displayCount !== 1 ? 's' : ''}</p>
              </div>

              {/* Breakdown bars */}
              <div className="flex-1 w-full space-y-2">
                {[5, 4, 3, 2, 1].map(n => {
                  const count = (breakdown as any)[String(n)] ?? 0
                  const pct   = Math.round((count / maxBreakdown) * 100)
                  return (
                    <div key={n} className="flex items-center gap-3">
                      <span className="font-sans text-xs text-charcoal-soft w-4 shrink-0">{n}</span>
                      <Star size={10} className="fill-champagne text-champagne shrink-0" />
                      <div className="flex-1 h-2 bg-champagne/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-champagne transition-all duration-500"
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-sans text-xs text-charcoal-soft w-4 text-right shrink-0">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Write a review form */}
          <AnimatePresence>
            {reviewFormOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-8">
                <form onSubmit={handleSubmitReview}
                  className="bg-white border border-champagne/20 p-6 md:p-8 space-y-6">
                  <h3 className="font-display text-xl text-noir">Your Review</h3>

                  {/* Star picker */}
                  <div>
                    <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-3">
                      Rating *
                    </label>
                    <div className="flex gap-2">
                      {stars.map(s => (
                        <button key={s} type="button"
                          onClick={() => setReviewStar(s)}
                          onMouseEnter={() => setReviewStarHover(s)}
                          onMouseLeave={() => setReviewStarHover(0)}
                          className="transition-transform hover:scale-125">
                          <Star size={28}
                            className={s <= (reviewStarHover || reviewStar)
                              ? 'fill-champagne text-champagne'
                              : 'text-champagne/20'} />
                        </button>
                      ))}
                      {reviewStar > 0 && (
                        <span className="ml-2 font-sans text-xs text-charcoal-soft self-center">
                          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewStar]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={e => setReviewTitle(e.target.value)}
                      placeholder="Summarize your experience"
                      className="input-luxury"
                      maxLength={120}
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">
                      Review *
                    </label>
                    <textarea
                      value={reviewBody}
                      onChange={e => setReviewBody(e.target.value)}
                      placeholder="Tell others about your experience with this product…"
                      rows={4}
                      className="input-luxury resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" disabled={submittingReview || reviewStar === 0}
                      className="btn-primary disabled:opacity-50 flex items-center gap-2">
                      {submittingReview ? 'Submitting…' : 'Submit Review'}
                    </button>
                    <button type="button" onClick={() => setReviewFormOpen(false)}
                      className="btn-secondary px-5">
                      Cancel
                    </button>
                  </div>

                  {!isAuthenticated && (
                    <p className="font-sans text-xs text-charcoal-soft">
                      <Link href="/auth/login" className="text-champagne hover:underline">Sign in</Link>
                      {' '}to leave a review.
                    </p>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Existing reviews */}
          {product.reviews?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.reviews.map((review: any) => (
                <div key={review.id} className="bg-ivory-warm p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-0.5">
                      {stars.map(s => (
                        <Star key={s} size={12}
                          className={s <= review.rating ? 'fill-champagne text-champagne' : 'text-champagne/20'} />
                      ))}
                    </div>
                    {review.isVerifiedPurchase && (
                      <span className="font-sans text-[9px] tracking-wider uppercase text-champagne border border-champagne/30 px-2 py-0.5">
                        Verified
                      </span>
                    )}
                  </div>
                  {review.title && <p className="font-display text-sm text-noir mb-1">{review.title}</p>}
                  <p className="font-serif text-charcoal text-sm leading-relaxed mb-3">{review.body}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-xs text-charcoal-soft">{review.userName}</p>
                    {review.createdAt && (
                      <p className="font-sans text-[10px] text-charcoal-soft">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-ivory-warm">
              <Star size={32} className="text-champagne/20 mx-auto mb-3" />
              <p className="font-display text-lg text-charcoal-soft mb-2">No reviews yet</p>
              <p className="font-sans text-xs text-charcoal-soft mb-4">Be the first to share your thoughts</p>
              <button onClick={() => setReviewFormOpen(true)}
                className="btn-primary text-xs px-6 py-2.5">
                Write the First Review
              </button>
            </div>
          )}
        </div>

        {/* Related products */}
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
