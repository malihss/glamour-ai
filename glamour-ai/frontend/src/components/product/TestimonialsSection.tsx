'use client'
// src/components/product/TestimonialsSection.tsx

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Sophia M.',
    location: 'Paris, France',
    rating: 5,
    text: 'The AI try-on feature completely changed how I shop for makeup. I tried on 20 lipstick shades in minutes and found my perfect match. The products arrived beautifully packaged — pure luxury.',
    product: 'Charlotte Tilbury Matte Revolution',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=85',
  },
  {
    name: 'Isabelle R.',
    location: 'London, UK',
    rating: 5,
    text: 'I have been searching for the right fragrance for months. The chatbot asked me a few questions about my preferences and suggested Replica Jazz Club — it is absolutely perfect.',
    product: 'Maison Margiela Replica',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&q=85',
  },
  {
    name: 'Natalia V.',
    location: 'New York, USA',
    rating: 5,
    text: 'Glamour AI is the only beauty platform I trust for luxury skincare. The La Mer I ordered arrived in two days, sealed and authentic. The personalized recommendations have introduced me to brands I now love.',
    product: 'La Mer Crème de la Mer',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=85',
  },
]

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={12}
          className={s <= rating ? 'fill-champagne text-champagne' : 'text-champagne/20'} />
      ))}
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-noir relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(201,169,110,0.06) 0%, transparent 60%)' }} />

      <div className="max-w-screen-xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne mb-3 block">
            Client Stories
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-ivory">
            Loved by <em className="not-italic text-champagne">Thousands</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.55 }}
              viewport={{ once: true }}
              className="bg-ivory/[0.04] border border-champagne/12 p-8 flex flex-col gap-6
                         hover:border-champagne/30 hover:bg-ivory/[0.06] transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <StarRow rating={t.rating} />
                <Quote size={20} className="text-champagne/25" />
              </div>

              <p className="font-serif text-ivory/65 text-base leading-relaxed flex-1">
                "{t.text}"
              </p>

              <div className="pt-5 border-t border-champagne/10 flex items-center gap-4">
                {/* Real avatar photo */}
                <div className="w-10 h-10 rounded-full overflow-hidden border border-champagne/25 flex-shrink-0">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <p className="font-sans text-xs tracking-[0.12em] uppercase text-ivory">{t.name}</p>
                  <p className="font-sans text-[10px] text-ivory/35 mt-0.5">{t.location}</p>
                </div>
                <div className="ml-auto">
                  <p className="font-sans text-[9px] tracking-[0.1em] uppercase text-champagne/60 text-right">
                    Purchased
                  </p>
                  <p className="font-serif text-[11px] text-ivory/45 text-right">{t.product}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex items-center justify-center gap-3"
        >
          <div className="flex">
            {[...Array(5)].map((_,i) => (
              <Star key={i} size={14} className="fill-champagne text-champagne" />
            ))}
          </div>
          <span className="font-sans text-xs text-ivory/40 tracking-widest">
            4.9 / 5 from 2,400+ verified reviews
          </span>
        </motion.div>
      </div>
    </section>
  )
}
