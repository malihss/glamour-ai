'use client'
// src/app/guest/page.tsx — Guest / Visitor landing interface

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ShoppingBag, Eye, Star, ArrowRight, Heart, Zap } from 'lucide-react'
import { CATALOGUE } from '@/lib/makeupApi'

const FEATURED = CATALOGUE.filter(p => p.isFeatured).slice(0, 4)

const PERKS = [
  { icon: Sparkles, title: 'AI Virtual Try-On',    desc: 'See makeup on your face in real time — no app needed.' },
  { icon: Eye,      title: 'Personalised Picks',   desc: 'Products curated to your skin tone and type.' },
  { icon: Zap,      title: 'Instant Checkout',     desc: 'Save your details once, shop in seconds.' },
  { icon: Heart,    title: 'Wishlist & Saves',      desc: 'Bookmark favourites and come back any time.' },
]

const TESTIMONIALS = [
  { name: 'Sophie L.',  text: 'The virtual try-on is insane — I finally found my perfect red lip!', rating: 5 },
  { name: 'Amara K.',   text: 'Ordered La Mer and it arrived in 2 days. Packaging was gorgeous.', rating: 5 },
  { name: 'Isabelle M.',text: 'The AI recommendations are scarily accurate. Love this store.', rating: 5 },
]

export default function GuestPage() {
  return (
    <div className="min-h-screen bg-ivory">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-noir">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1400&q=85"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-noir/90 via-noir/60 to-transparent" />

        <div className="relative max-w-screen-xl mx-auto px-6 md:px-12 py-32">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-champagne flex items-center justify-center">
                <Sparkles size={12} className="text-noir" />
              </div>
              <span className="font-sans text-[10px] tracking-[0.35em] uppercase text-champagne">
                Glamour AI — Luxury Beauty
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl text-ivory leading-tight mb-6">
              Beauty,<br />
              <span className="text-champagne italic">Intelligently</span><br />
              Yours.
            </h1>

            <p className="font-serif text-ivory/60 text-xl leading-relaxed mb-10 max-w-lg">
              Discover luxury makeup, skincare and fragrance — with AI-powered virtual try-on
              and personalised recommendations built for you.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/auth/signup"
                className="inline-flex items-center gap-2 bg-champagne text-noir font-sans text-xs
                           tracking-[0.2em] uppercase px-8 py-4 hover:bg-champagne-light transition-colors">
                Create Free Account
                <ArrowRight size={14} />
              </Link>
              <Link href="/products"
                className="inline-flex items-center gap-2 border border-ivory/30 text-ivory font-sans
                           text-xs tracking-[0.2em] uppercase px-8 py-4 hover:border-ivory hover:bg-ivory/5 transition-colors">
                <ShoppingBag size={14} />
                Browse as Guest
              </Link>
            </div>

            <p className="font-sans text-[10px] text-ivory/30 mt-6 tracking-wider">
              No credit card required · Free to browse · Try-on available instantly
            </p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-ivory/30">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8 bg-gradient-to-b from-ivory/30 to-transparent"
          />
        </div>
      </section>

      {/* ── WHY CREATE AN ACCOUNT ── */}
      <section className="py-24 px-6 md:px-12 bg-ivory">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne block mb-3">
              Why Join
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-noir">
              More than a beauty store
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PERKS.map((perk, i) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-14 h-14 border border-champagne/30 flex items-center justify-center mx-auto mb-5">
                  <perk.icon size={22} className="text-champagne" />
                </div>
                <h3 className="font-display text-lg text-noir mb-2">{perk.title}</h3>
                <p className="font-serif text-charcoal-soft text-sm leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS PREVIEW ── */}
      <section className="py-24 px-6 md:px-12 bg-ivory-warm">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne block mb-3">
                The Edit
              </span>
              <h2 className="font-display text-4xl md:text-5xl text-noir">
                Bestsellers
              </h2>
            </div>
            <Link href="/products?featured=true"
              className="hidden md:flex items-center gap-2 font-sans text-xs tracking-widest uppercase
                         text-charcoal-soft hover:text-champagne transition-colors group">
              View All
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {FEATURED.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                viewport={{ once: true }}
                className="group bg-white"
                style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }}
              >
                <Link href="/auth/signup">
                  <div className="relative overflow-hidden bg-[#f8f6f4]" style={{ aspectRatio: '1/1.1' }}>
                    <img
                      src={product.primaryImage}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Overlay CTA */}
                    <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/40 transition-all duration-300
                                    flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                       bg-champagne text-noir font-sans text-[10px] tracking-widest uppercase px-4 py-2">
                        Sign in to Shop
                      </span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="bg-noir text-ivory font-sans text-[9px] tracking-widest uppercase px-2 py-1">
                        Bestseller
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-sans text-[10px] tracking-widest uppercase text-champagne mb-1">
                      {product.brand.name}
                    </p>
                    <h3 className="font-sans text-[13px] font-medium text-gray-900 leading-snug mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={9}
                          className={s <= Math.round(product.avgRating ?? 4)
                            ? 'fill-champagne text-champagne' : 'fill-gray-200 text-gray-200'} />
                      ))}
                    </div>
                    <p className="font-sans text-[13px] font-semibold text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/products"
              className="inline-flex items-center gap-2 border border-noir text-noir font-sans
                         text-xs tracking-widest uppercase px-8 py-4 hover:bg-noir hover:text-ivory transition-colors">
              Browse All Products
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRY-ON TEASER ── */}
      <section className="py-24 px-6 md:px-12 bg-noir overflow-hidden relative">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(201,169,110,0.08), transparent 60%)' }} />
        <div className="max-w-screen-xl mx-auto relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne block mb-4">
              AI Technology
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-ivory mb-6">
              Try before<br />
              <span className="text-champagne italic">you buy</span>
            </h2>
            <p className="font-serif text-ivory/50 text-lg leading-relaxed mb-8">
              Our real-time AI try-on uses your camera to apply lipstick, eyeshadow, blush,
              highlighter and more — instantly, on your actual face.
            </p>
            <Link href="/tryon"
              className="inline-flex items-center gap-2 bg-champagne text-noir font-sans
                         text-xs tracking-[0.2em] uppercase px-8 py-4 hover:bg-champagne-light transition-colors">
              <Sparkles size={14} />
              Try It Free — No Account Needed
            </Link>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=700&q=85"
              alt="Virtual Try-On"
              className="w-full aspect-square object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noir/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex gap-2 flex-wrap">
              {['Lipstick', 'Eyeshadow', 'Blush', 'Highlighter', 'Mascara'].map(tag => (
                <span key={tag}
                  className="bg-noir/70 backdrop-blur-sm text-ivory font-sans text-[9px]
                             tracking-widest uppercase px-3 py-1.5 border border-ivory/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6 md:px-12 bg-ivory">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne block mb-3">
              Reviews
            </span>
            <h2 className="font-display text-4xl text-noir">What our clients say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-ivory-warm border border-champagne/15 p-8"
              >
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12} className="fill-champagne text-champagne" />
                  ))}
                </div>
                <p className="font-serif text-charcoal text-lg leading-relaxed mb-5 italic">
                  "{t.text}"
                </p>
                <p className="font-sans text-[10px] tracking-widest uppercase text-champagne">
                  {t.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6 md:px-12 bg-noir text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-ivory mb-4">
            Ready to glow?
          </h2>
          <p className="font-serif text-ivory/50 text-lg mb-10">
            Join thousands of beauty lovers who shop smarter with Glamour AI.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/signup"
              className="inline-flex items-center gap-2 bg-champagne text-noir font-sans
                         text-xs tracking-[0.2em] uppercase px-10 py-4 hover:bg-champagne-light transition-colors">
              Create Free Account
              <ArrowRight size={14} />
            </Link>
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 border border-ivory/20 text-ivory font-sans
                         text-xs tracking-[0.2em] uppercase px-10 py-4 hover:border-ivory/50 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
