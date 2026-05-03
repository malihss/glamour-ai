'use client'
// src/components/product/BrandStrip.tsx

import { motion } from 'framer-motion'

const BRANDS = [
  'Charlotte Tilbury', 'Tom Ford', 'Dior Beauty', 'Chanel', 'YSL Beauty',
  'La Mer', 'Byredo', 'Jo Malone', 'Guerlain', 'Hermès', 'Mugler',
  'Lancôme', 'Tatcha', 'NARS', 'Pat McGrath', 'Skinceuticals',
  'Fenty Beauty', 'Rare Beauty', 'The Ordinary', 'FOREO', 'Armani Beauty',
]

export function BrandStrip() {
  const doubled = [...BRANDS, ...BRANDS]

  return (
    <div className="bg-ivory border-y border-champagne/12 py-4 overflow-hidden">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="flex gap-14 whitespace-nowrap will-change-transform"
      >
        {doubled.map((brand, i) => (
          <span
            key={i}
            className="font-display text-sm tracking-[0.12em] text-charcoal/50 hover:text-champagne
                       transition-colors duration-300 cursor-default flex items-center gap-14"
          >
            {brand}
            <span className="text-champagne/25 text-[8px]">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
