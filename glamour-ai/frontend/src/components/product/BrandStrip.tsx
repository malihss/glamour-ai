'use client'

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
    <div
      className="py-4 overflow-hidden"
      style={{
        background: '#FAF8F6',
        borderTop: '1px solid rgba(198,169,163,0.14)',
        borderBottom: '1px solid rgba(198,169,163,0.14)',
      }}
    >
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="flex gap-14 whitespace-nowrap will-change-transform"
      >
        {doubled.map((brand, i) => (
          <span
            key={i}
            className="font-display text-sm tracking-[0.12em] transition-colors duration-300 cursor-default flex items-center gap-14"
            style={{ color: 'rgba(122,115,111,0.40)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C6A9A3')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(122,115,111,0.40)')}
          >
            {brand}
            <span style={{ color: 'rgba(198,169,163,0.25)', fontSize: '8px' }}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
