'use client'

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
          style={{ fill: s <= rating ? '#C6A9A3' : '#EDE5E3', color: s <= rating ? '#C6A9A3' : '#EDE5E3' }} />
      ))}
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FAF8F6 0%, #F1EDE9 100%)' }}
    >
      {/* Decorative blob */}
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
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
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
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="pt-5 flex items-center gap-4"
                style={{ borderTop: '1px solid rgba(198,169,163,0.14)' }}>
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                  style={{ border: '2px solid rgba(198,169,163,0.28)' }}>
                  <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div>
                  <p className="font-sans text-xs tracking-[0.12em] uppercase" style={{ color: '#3E3A39' }}>{t.name}</p>
                  <p className="font-sans text-[10px] mt-0.5" style={{ color: '#A89E99' }}>{t.location}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-sans text-[9px] tracking-[0.1em] uppercase" style={{ color: '#C6A9A3' }}>Purchased</p>
                  <p className="font-body text-[11px] mt-0.5" style={{ color: '#A89E99' }}>{t.product}</p>
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
            4.9 / 5 from 2,400+ verified reviews
          </span>
        </motion.div>
      </div>
    </section>
  )
}
