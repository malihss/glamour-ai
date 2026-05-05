'use client'

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
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F1EDE9 0%, #FAF8F6 50%, #F1EDE9 100%)' }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #EDE5E3 0%, transparent 70%)', filter: 'blur(70px)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #A8B5A2 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 py-20 md:py-28">
        <div className="max-w-2xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <Sparkles size={11} style={{ color: '#C6A9A3' }} />
            <span className="font-sans text-[10px] tracking-[0.35em] uppercase" style={{ color: '#C6A9A3' }}>
              Exclusive Access
            </span>
            <Sparkles size={11} style={{ color: '#C6A9A3' }} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }} viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl leading-tight mb-5"
            style={{ color: '#3E3A39' }}
          >
            Stay in the{' '}
            <em className="not-italic" style={{ color: '#C6A9A3' }}>Glow</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }} viewport={{ once: true }}
            className="font-body text-base md:text-lg leading-relaxed mb-10"
            style={{ color: '#7A736F' }}
          >
            Be the first to discover new luxury arrivals, exclusive member offers,
            and expert beauty tips curated by our AI.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }} viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto"
            style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 36px rgba(62,58,57,0.08)' }}
          >
            {submitted ? (
              <div className="flex-1 flex items-center justify-center gap-2 bg-white py-4 px-6">
                <Sparkles size={14} style={{ color: '#C6A9A3' }} />
                <span className="font-sans text-xs tracking-[0.15em] uppercase" style={{ color: '#C6A9A3' }}>
                  Welcome to the inner circle
                </span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 bg-white px-6 py-4 font-sans text-xs
                             focus:outline-none transition-colors"
                  style={{ color: '#3E3A39' }}
                />
                <button
                  type="submit"
                  className="text-white px-7 py-4 font-sans text-xs tracking-[0.18em] uppercase
                             transition-all duration-200 flex items-center gap-2 justify-center shrink-0 group"
                  style={{ background: '#C6A9A3' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#B09892')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#C6A9A3')}
                >
                  Subscribe
                  <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </>
            )}
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            transition={{ delay: 0.45 }} viewport={{ once: true }}
            className="font-sans text-[10px] tracking-wider mt-5"
            style={{ color: '#A89E99' }}
          >
            No spam. Unsubscribe anytime. Your privacy is sacred.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
