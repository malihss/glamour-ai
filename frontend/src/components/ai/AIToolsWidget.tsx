'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, X, Camera, Droplets, Wind, ChevronRight } from 'lucide-react'

const TOOLS = [
  {
    href: '/tryon',
    icon: Camera,
    label: 'Virtual Try-On',
    desc: 'Apply makeup live with your camera',
    accent: '#C9A96E',
    gradient: 'from-amber-50 to-orange-50',
    dot: 'bg-[#C9A96E]',
  },
  {
    href: '/skincare',
    icon: Droplets,
    label: 'Skin Diagnosis',
    desc: '7 questions → your full skin routine',
    accent: '#E8707A',
    gradient: 'from-rose-50 to-pink-50',
    dot: 'bg-rose-400',
  },
  {
    href: '/fragrance',
    icon: Wind,
    label: 'Fragrance Notes',
    desc: 'Explore scents & find your match',
    accent: '#9B59B6',
    gradient: 'from-purple-50 to-fuchsia-50',
    dot: 'bg-purple-400',
  },
]

export function AIToolsWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-3">
      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-br from-[#0f0f0f] to-[#1a0e06]">
              <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-[#C9A96E] mb-0.5">Powered by AI</p>
              <p className="font-display text-lg text-white font-semibold leading-tight">Beauty Tools</p>
              <p className="font-sans text-[11px] text-gray-400 mt-0.5">Your personal beauty assistant</p>
            </div>

            {/* Tool cards */}
            <div className="p-3 space-y-2">
              {TOOLS.map(tool => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-gradient-to-r ${tool.gradient} hover:shadow-sm transition-all duration-200 group`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${tool.accent}22` }}
                  >
                    <tool.icon size={17} style={{ color: tool.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-semibold text-gray-900 leading-tight">{tool.label}</p>
                    <p className="font-sans text-[11px] text-gray-500 leading-tight mt-0.5">{tool.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                </Link>
              ))}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="font-sans text-[10px] text-gray-400 text-center tracking-wide">
                ✦ Tap a tool to get started
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger button */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 bg-[#0f0f0f] text-white pl-4 pr-5 py-3 rounded-full shadow-xl hover:bg-gray-800 transition-colors border border-white/10"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={15} />
            </motion.span>
          ) : (
            <motion.span key="s" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles size={15} className="text-[#C9A96E]" />
            </motion.span>
          )}
        </AnimatePresence>
        <span className="font-sans text-[11px] tracking-[0.14em] uppercase font-medium">
          {open ? 'Close' : 'Beauty AI'}
        </span>

        {/* Pulse dot when closed */}
        {!open && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A96E] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C9A96E]" />
          </span>
        )}
      </motion.button>
    </div>
  )
}
