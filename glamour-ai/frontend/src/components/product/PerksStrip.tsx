'use client'
// src/components/product/PerksStrip.tsx

import { Truck, RotateCcw, Sparkles, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

const PERKS = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $75',
  },
  {
    icon: RotateCcw,
    title: 'Free Returns',
    description: '30-day hassle-free returns',
  },
  {
    icon: Sparkles,
    title: 'AI Virtual Try-On',
    description: 'See it on you before you buy',
  },
  {
    icon: Shield,
    title: '100% Authentic',
    description: 'Verified luxury products only',
  },
]

export function PerksStrip() {
  return (
    <section className="bg-noir py-10 px-4 md:px-8 border-y border-champagne/10">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-champagne/15">
          {PERKS.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center md:px-8 gap-3"
            >
              <div className="w-10 h-10 border border-champagne/30 flex items-center justify-center shrink-0">
                <perk.icon size={18} className="text-champagne" />
              </div>
              <div>
                <p className="font-sans text-xs tracking-[0.12em] uppercase text-ivory mb-1">
                  {perk.title}
                </p>
                <p className="font-serif text-ivory/40 text-sm">{perk.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
