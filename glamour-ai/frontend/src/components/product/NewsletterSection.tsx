'use client'
// src/components/product/NewsletterSection.tsx

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    setEmail('')
  }

  return (
    <section className="relative overflow-hidden bg-charcoal">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(201,169,110,0.10) 0%, transparent 55%)' }} className="absolute inset-0" />
        <div style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(232,180,184,0.07) 0%, transparent 55%)' }} className="absolute inset-0" />
        {/* Fine grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,169,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 py-20 md:py-28">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <Sparkles size={12} className="text-champagne" />
            <span className="font-sans text-[10px] tracking-[0.35em] uppercase text-champagne">
              Exclusive Access
            </span>
            <Sparkles size={12} className="text-champagne" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl text-ivory leading-tight mb-5"
          >
            Stay in the{' '}
            <em className="not-italic text-champagne">Glow</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="font-serif text-ivory/55 text-base md:text-lg leading-relaxed mb-10"
          >
            Be the first to discover new luxury arrivals, exclusive member offers,
            and expert beauty tips curated by our AI.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto"
          >
            {submitted ? (
              <div className="flex-1 flex items-center justify-center gap-2 border border-champagne/40 py-4 px-6">
                <Sparkles size={14} className="text-champagne" />
                <span className="font-sans text-xs tracking-[0.15em] uppercase text-champagne">
                  Welcome to the inner circle
                </span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 bg-ivory/[0.06] border border-ivory/15 px-5 py-4
                             font-sans text-xs text-ivory placeholder-ivory/30
                             focus:outline-none focus:border-champagne/60 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-champagne text-noir px-7 py-4 font-sans text-xs tracking-[0.18em]
                             uppercase hover:bg-champagne-light transition-colors duration-200
                             flex items-center gap-2 justify-center shrink-0 group"
                >
                  Subscribe
                  <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </>
            )}
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            viewport={{ once: true }}
            className="font-sans text-[10px] text-ivory/25 tracking-wider mt-5"
          >
            No spam. Unsubscribe anytime. Your privacy is sacred.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
