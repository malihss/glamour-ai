'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Camera, Palette, Zap } from 'lucide-react'

export function TryOnBanner() {
  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: 'linear-gradient(150deg, #FAF8F6 0%, #F1EDE9 55%, #FAF8F6 100%)' }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #EDE5E3 0%, transparent 70%)', filter: 'blur(65px)' }} />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #A8B5A2 0%, transparent 70%)', filter: 'blur(70px)' }} />
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]">
          <defs>
            <pattern id="dots2" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#3E3A39" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots2)" />
        </svg>
      </div>

      <div className="max-w-screen-xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: copy ─────────────────────────────────────── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="flex items-center gap-2.5 mb-6"
            >
              <span className="h-px w-10" style={{ background: '#C6A9A3' }} />
              <Sparkles size={12} style={{ color: '#C6A9A3' }} />
              <span className="font-sans text-[10px] tracking-[0.32em] uppercase" style={{ color: '#C6A9A3' }}>
                AI Powered Feature
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }} viewport={{ once: true }}
              className="font-display text-4xl md:text-5xl mb-6 leading-tight"
              style={{ color: '#3E3A39' }}
            >
              See it on you{' '}
              <em className="not-italic italic" style={{ color: '#C6A9A3' }}>before</em>
              <br />you buy it
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }} viewport={{ once: true }}
              className="font-body text-lg leading-relaxed mb-10"
              style={{ color: '#7A736F' }}
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
                { icon: Camera,  label: 'Live Camera', sage: false },
                { icon: Palette, label: '40+ Shades',  sage: true  },
                { icon: Zap,     label: 'Real-Time',   sage: false },
              ].map(({ icon: Icon, label, sage }, i) => (
                <div key={label} className="text-center">
                  <div
                    className="w-11 h-11 flex items-center justify-center mx-auto mb-2"
                    style={{
                      borderRadius: '14px',
                      background: sage ? '#EDF0EC' : '#F7F0EE',
                      border: `1px solid ${sage ? 'rgba(168,181,162,0.28)' : 'rgba(198,169,163,0.28)'}`,
                    }}
                  >
                    <Icon size={17} style={{ color: sage ? '#A8B5A2' : '#C6A9A3' }} />
                  </div>
                  <p className="font-sans text-[10px] tracking-widest uppercase" style={{ color: '#A89E99' }}>{label}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }} viewport={{ once: true }}
            >
              <Link
                href="/tryon"
                className="inline-flex items-center gap-2 px-8 py-4 text-white font-sans text-xs tracking-[0.15em] uppercase transition-all duration-300"
                style={{ background: '#C6A9A3', borderRadius: '20px' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#B09892')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#C6A9A3')}
              >
                <Sparkles size={14} />
                Try On Now — It&apos;s Free
              </Link>
            </motion.div>
          </div>

          {/* ── Right: AR demo visual ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }} viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-square max-w-sm mx-auto">
              {/* Outer decorative rings */}
              <div className="absolute inset-0 rounded-full"
                style={{ border: '1px solid rgba(198,169,163,0.20)' }} />
              <div className="absolute inset-4 rounded-full"
                style={{ border: '1px solid rgba(198,169,163,0.12)' }} />

              {/* Model photo */}
              <div className="absolute inset-8 rounded-full overflow-hidden"
                style={{ border: '2px solid rgba(198,169,163,0.30)', boxShadow: '0 16px 56px rgba(62,58,57,0.10)' }}>
                <img
                  src="https://i.pinimg.com/736x/de/57/fe/de57fe307198178a503f11369646161a.jpg"
                  alt="Virtual try-on demo"
                  className="w-full h-full object-cover" style={{ objectPosition: 'center 20%' }}
                />
                <div className="absolute inset-0 opacity-[0.05]"
                  style={{ background: 'radial-gradient(ellipse at 50% 40%, #C6A9A3 0%, transparent 60%)' }} />

                {/* AR landmark SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                  <ellipse cx="100" cy="115" rx="44" ry="52" fill="none" stroke="#C6A9A3" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.45" />
                  <ellipse cx="76"  cy="92"  rx="14" ry="7" fill="none" stroke="#EDE5E3" strokeWidth="0.5" opacity="0.45" />
                  <ellipse cx="124" cy="92"  rx="14" ry="7" fill="none" stroke="#EDE5E3" strokeWidth="0.5" opacity="0.45" />
                  <ellipse cx="100" cy="133" rx="21" ry="9" fill="rgba(198,169,163,0.22)" stroke="#C6A9A3" strokeWidth="0.6" opacity="0.80" />
                  <path d="M 62 89 Q 76 85 90 89" fill="none" stroke="#3E3A39" strokeWidth="1.1" opacity="0.45" />
                  <path d="M 138 89 Q 124 85 110 89" fill="none" stroke="#3E3A39" strokeWidth="1.1" opacity="0.45" />
                </svg>

                {/* Scanning line */}
                <motion.div
                  animate={{ top: ['8%', '92%', '8%'] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-px"
                  style={{ position: 'absolute', background: 'rgba(198,169,163,0.45)' }}
                />
              </div>

              {/* Corner brackets */}
              {(['top-0 left-0','top-0 right-0','bottom-0 left-0','bottom-0 right-0'] as const).map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-5 h-5`} style={{
                  borderTop:    i < 2  ? '1.5px solid #C6A9A3' : 'none',
                  borderBottom: i >= 2 ? '1.5px solid #C6A9A3' : 'none',
                  borderLeft:   i % 2 === 0 ? '1.5px solid #C6A9A3' : 'none',
                  borderRight:  i % 2 !== 0 ? '1.5px solid #C6A9A3' : 'none',
                  opacity: 0.45,
                }} />
              ))}
            </div>

            {/* Floating shade chip */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -right-4 top-1/4 px-4 py-3"
              style={{
                background: 'rgba(250,248,246,0.92)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                border: '1px solid rgba(198,169,163,0.22)',
                boxShadow: '0 8px 28px rgba(62,58,57,0.08)',
              }}
            >
              <p className="font-sans text-[9px] tracking-widest uppercase mb-2" style={{ color: '#C6A9A3' }}>Active</p>
              <div className="flex gap-1.5">
                {['#C41E3A','#8B1A2E','#C6A9A3'].map(hex => (
                  <span key={hex} className="w-4 h-4 rounded-full shadow-sm" style={{ background: hex }} />
                ))}
              </div>
            </motion.div>

            {/* Floating product count */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute -left-4 bottom-1/4 px-4 py-3"
              style={{
                background: 'rgba(250,248,246,0.92)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                border: '1px solid rgba(168,181,162,0.22)',
                boxShadow: '0 8px 28px rgba(62,58,57,0.08)',
              }}
            >
              <p className="font-sans text-[9px] tracking-widest uppercase mb-2" style={{ color: '#A8B5A2' }}>7 Products</p>
              <div className="flex gap-1">
                {['#C41E3A','#C6A9A3','#FFAA80','#A8B5A2','#A07840'].map(hex => (
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
