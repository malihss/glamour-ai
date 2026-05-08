'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const FALLBACKS = [
  {
    name: 'Sophia M.',
    rating: 5,
    body: 'The AI try-on feature completely changed how I shop for makeup. I tried on 20 lipstick shades in minutes and found my perfect match. The products arrived beautifully packaged — pure luxury.',
    productName: 'Charlotte Tilbury Matte Revolution',
  },
  {
    name: 'Isabelle R.',
    rating: 5,
    body: 'I have been searching for the right fragrance for months. The chatbot asked me a few questions about my preferences and suggested Replica Jazz Club — it is absolutely perfect.',
    productName: 'Maison Margiela Replica',
  },
  {
    name: 'Natalia V.',
    rating: 5,
    body: 'Glamour AI is the only beauty platform I trust for luxury skincare. The La Mer I ordered arrived in two days, sealed and authentic. The personalized recommendations have introduced me to brands I now love.',
    productName: 'La Mer Crème de la Mer',
  },
]

function InitialAvatar({ name }: { name: string }) {
  const initial = name.trim()[0]?.toUpperCase() ?? '?'
  return (
    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
                    font-display text-sm font-medium text-white"
      style={{
        background: 'linear-gradient(135deg,#C6A9A3,#A08070)',
        border: '2px solid rgba(198,169,163,0.28)',
      }}>
      {initial}
    </div>
  )
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={12}
          style={{ fill: s <= rating ? '#C6A9A3' : '#EDE5E3', color: s <= rating ? '#C6A9A3' : '#EDE5E3' }} />
      ))}
    </div>
  )
}

export function TestimonialsSection() {
  const [items, setItems] = useState(FALLBACKS)
  const [avg, setAvg] = useState<number | null>(null)
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/products/reviews/recent?limit=3`)
      .then(r => r.json())
      .then(d => {
        if (d.reviews?.length >= 1) {
          setItems(d.reviews.map((r: any) => ({
            name: r.name,
            rating: r.rating,
            body: r.body,
            productName: r.productName,
            productSlug: r.productSlug,
          })))
        }
      })
      .catch(() => {})

    // Fetch overall stats
    fetch(`${API_URL}/products/reviews/recent?limit=100`)
      .then(r => r.json())
      .then(d => {
        if (d.reviews?.length > 0) {
          const a = d.reviews.reduce((s: number, r: any) => s + r.rating, 0) / d.reviews.length
          setAvg(Math.round(a * 10) / 10)
          setTotal(d.reviews.length)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FAF8F6 0%, #F1EDE9 100%)' }}
    >
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #EDE5E3 0%, transparent 70%)', filter: 'blur(60px)', transform: 'translate(30%, -30%)' }} />

      <div className="max-w-screen-xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <span className="h-px w-8" style={{ background: '#C6A9A3' }} />
            <span className="font-sans text-[10px] tracking-[0.32em] uppercase" style={{ color: '#C6A9A3' }}>
              Client Stories
            </span>
            <span className="h-px w-8" style={{ background: '#C6A9A3' }} />
          </div>
          <h2 className="font-display text-4xl md:text-5xl" style={{ color: '#3E3A39' }}>
            Loved by <em className="not-italic" style={{ color: '#C6A9A3' }}>Thousands</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.55 }}
              viewport={{ once: true }}
              className="bg-white flex flex-col gap-6 p-8 transition-shadow duration-300"
              style={{
                borderRadius: '24px',
                boxShadow: '0 4px 24px rgba(62,58,57,0.06)',
                border: '1px solid rgba(198,169,163,0.14)',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 8px 40px rgba(62,58,57,0.10)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(62,58,57,0.06)')}
            >
              <div className="flex items-start justify-between">
                <StarRow rating={t.rating} />
                <Quote size={20} style={{ color: 'rgba(198,169,163,0.28)' }} />
              </div>

              <p className="font-body text-base leading-relaxed flex-1" style={{ color: '#7A736F' }}>
                &ldquo;{t.body}&rdquo;
              </p>

              <div className="pt-5 flex items-center gap-4"
                style={{ borderTop: '1px solid rgba(198,169,163,0.14)' }}>
                <InitialAvatar name={t.name} />
                <div>
                  <p className="font-sans text-xs tracking-[0.12em] uppercase" style={{ color: '#3E3A39' }}>
                    {t.name}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-sans text-[9px] tracking-[0.1em] uppercase" style={{ color: '#C6A9A3' }}>
                    Reviewed
                  </p>
                  <p className="font-body text-[11px] mt-0.5" style={{ color: '#A89E99' }}>
                    {t.productName}
                  </p>
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
              <Star key={i} size={13} style={{ fill: '#C6A9A3', color: '#C6A9A3' }} />
            ))}
          </div>
          <span className="font-sans text-xs tracking-widest" style={{ color: '#A89E99' }}>
            {avg != null && total != null
              ? `${avg.toFixed(1)} / 5 from ${total}+ verified review${total !== 1 ? 's' : ''}`
              : '4.9 / 5 from 2,400+ verified reviews'}
          </span>
        </motion.div>
      </div>
    </section>
  )
}
