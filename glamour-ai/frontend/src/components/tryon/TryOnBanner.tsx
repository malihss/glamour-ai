'use client'
// src/components/tryon/TryOnBanner.tsx

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Camera, Palette, Zap } from 'lucide-react'

export function TryOnBanner() {
  return (
    <section className="section-padding bg-gradient-to-br from-noir via-charcoal to-noir relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(201,169,110,0.08) 0%, transparent 65%)' }} />

      <div className="max-w-screen-xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="flex items-center gap-2 mb-6"
            >
              <Sparkles size={14} className="text-champagne" />
              <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne">AI Powered Feature</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }} viewport={{ once: true }}
              className="font-display text-4xl md:text-5xl text-ivory mb-6 leading-tight"
            >
              See it on you{' '}
              <span className="italic text-champagne">before</span>{' '}
              you buy it
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }} viewport={{ once: true }}
              className="font-serif text-ivory/60 text-lg leading-relaxed mb-10"
            >
              Our AI detects your facial features in real time and applies lipstick, eyeshadow,
              eyeliner, contour, highlighter and more — with stunning precision. Try 40+ shades instantly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }} viewport={{ once: true }}
              className="grid grid-cols-3 gap-6 mb-10"
            >
              {[
                { icon: Camera,  label: 'Live Camera' },
                { icon: Palette, label: '40+ Shades' },
                { icon: Zap,     label: 'Real-Time' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center">
                  <div className="w-10 h-10 border border-champagne/30 flex items-center justify-center mx-auto mb-2">
                    <Icon size={18} className="text-champagne" />
                  </div>
                  <p className="font-sans text-[10px] tracking-widest uppercase text-ivory/50">{label}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }} viewport={{ once: true }}
            >
              <Link href="/tryon" className="btn-gold inline-flex items-center gap-2">
                <Sparkles size={14} />
                Try On Now — It's Free
              </Link>
            </motion.div>
          </div>

          {/* Visual — real model photo with AR overlay */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }} viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-square max-w-sm mx-auto">
              {/* Outer decorative rings */}
              <div className="absolute inset-0 border border-champagne/20 rounded-full" />
              <div className="absolute inset-4 border border-champagne/10 rounded-full" />

              {/* Model photo */}
              <div className="absolute inset-8 rounded-full overflow-hidden border border-champagne/25">
                <img
                  src="https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=600&q=85"
                  alt="Virtual try-on demo"
                  className="w-full h-full object-cover"
                />
                {/* Dark overlay for contrast */}
                <div className="absolute inset-0 bg-noir/20" />

                {/* AR landmark SVG overlay */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                  <ellipse cx="100" cy="115" rx="44" ry="52" fill="none" stroke="#C9A96E" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
                  <ellipse cx="76"  cy="92"  rx="14" ry="7" fill="none" stroke="#C9A96E" strokeWidth="0.5" opacity="0.45" />
                  <ellipse cx="124" cy="92"  rx="14" ry="7" fill="none" stroke="#C9A96E" strokeWidth="0.5" opacity="0.45" />
                  {/* Lip outline */}
                  <ellipse cx="100" cy="133" rx="21" ry="9" fill="rgba(196,30,58,0.35)" stroke="#C41E3A" strokeWidth="0.6" opacity="0.8" />
                  {/* Eyeliner hints */}
                  <path d="M 62 89 Q 76 85 90 89" fill="none" stroke="#1C1A1A" strokeWidth="1.2" opacity="0.7" />
                  <path d="M 138 89 Q 124 85 110 89" fill="none" stroke="#1C1A1A" strokeWidth="1.2" opacity="0.7" />
                </svg>

                {/* Animated scanning line */}
                <motion.div
                  animate={{ top: ['8%', '92%', '8%'] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-px bg-champagne/50"
                  style={{ position: 'absolute' }}
                />
              </div>

              {/* Corner decorations */}
              {(['top-0 left-0','top-0 right-0','bottom-0 left-0','bottom-0 right-0'] as const).map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-6 h-6`} style={{
                  borderTop:    i < 2  ? '1px solid #C9A96E' : 'none',
                  borderBottom: i >= 2 ? '1px solid #C9A96E' : 'none',
                  borderLeft:   i % 2 === 0 ? '1px solid #C9A96E' : 'none',
                  borderRight:  i % 2 !== 0 ? '1px solid #C9A96E' : 'none',
                  opacity: 0.5,
                }} />
              ))}
            </div>

            {/* Floating shade chip */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -right-4 top-1/4 bg-ivory/10 backdrop-blur-sm border border-champagne/20 px-4 py-3"
            >
              <p className="font-sans text-[9px] tracking-widest uppercase text-champagne mb-2">Active</p>
              <div className="flex gap-1.5">
                {['#C41E3A','#8B1A2E','#D4808E'].map(hex => (
                  <span key={hex} className="w-4 h-4 rounded-full" style={{ background: hex }} />
                ))}
              </div>
            </motion.div>

            {/* Floating makeup chip */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute -left-4 bottom-1/4 bg-ivory/10 backdrop-blur-sm border border-champagne/20 px-4 py-3"
            >
              <p className="font-sans text-[9px] tracking-widest uppercase text-champagne mb-2">7 Products</p>
              <div className="flex gap-1">
                {['#2E2E2E','#080808','#FFAA80','#FFD060','#A0663C'].map(hex => (
                  <span key={hex} className="w-3 h-3 rounded-full" style={{ background: hex }} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
