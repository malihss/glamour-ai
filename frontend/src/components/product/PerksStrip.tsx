'use client'

import { Truck, RotateCcw, Sparkles, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

const PERKS = [
  { icon: Truck,      title: 'Free Shipping',     description: 'On orders over $75',            sage: false },
  { icon: RotateCcw,  title: 'Free Returns',      description: '30-day hassle-free returns',    sage: true  },
  { icon: Sparkles,   title: 'AI Virtual Try-On', description: 'See it on you before you buy',  sage: false },
  { icon: Shield,     title: '100% Authentic',    description: 'Verified luxury products only', sage: true  },
]

export function PerksStrip() {
  return (
    <section
      className="py-11 px-4 md:px-8"
      style={{
        background: '#F1EDE9',
        borderTop: '1px solid rgba(198,169,163,0.18)',
        borderBottom: '1px solid rgba(198,169,163,0.18)',
      }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-[#E8E2DD]">
          {PERKS.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.09, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center md:px-8 gap-3.5"
            >
              <div
                className="w-11 h-11 flex items-center justify-center shrink-0"
                style={{
                  borderRadius: '14px',
                  background: perk.sage ? '#EDF0EC' : '#F7F0EE',
                  border: `1px solid ${perk.sage ? 'rgba(168,181,162,0.30)' : 'rgba(198,169,163,0.28)'}`,
                }}
              >
                <perk.icon size={17} style={{ color: perk.sage ? '#A8B5A2' : '#C6A9A3' }} />
              </div>
              <div>
                <p className="font-sans text-xs tracking-[0.12em] uppercase mb-1" style={{ color: '#3E3A39' }}>
                  {perk.title}
                </p>
                <p className="font-body italic text-sm leading-snug" style={{ color: '#A89E99' }}>
                  {perk.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
