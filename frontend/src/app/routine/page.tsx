'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Sun, Moon, Calendar, ChevronRight, RotateCcw, ShoppingBag, Wand2, Check } from 'lucide-react'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

const API = process.env.NEXT_PUBLIC_API_URL || '/api'

// ── Types ──────────────────────────────────────────────────────────────────────
interface RoutineStep {
  step: number
  category: string
  instruction: string
  frequency?: string
  tip: string
  productName: string | null
  product: { id: string; name: string; slug: string; brand: string; price: number; image: string | null } | null
}
interface Routine {
  morning:  RoutineStep[]
  evening:  RoutineStep[]
  weekly:   RoutineStep[]
  insight:  string
}

// ── Static data ────────────────────────────────────────────────────────────────
const SKIN_TYPES = ['Dry', 'Normal', 'Oily', 'Combination', 'Sensitive']
const CONCERNS   = ['Acne', 'Dark spots', 'Wrinkles', 'Redness', 'Dullness', 'Large pores', 'Dehydration', 'Uneven texture']
const GOALS      = ['Glow', 'Anti-aging', 'Hydration', 'Clarifying', 'Even tone', 'Minimalist routine']
const TIMES      = ['5 min', '10 min', '15 min', '20+ min']

const STEP_COLORS: Record<string, string> = {
  Cleanser: '#A8C5DA', Toner: '#C6B5A3', Essence: '#C6B5A3',
  Serum: '#C6A9A3', Moisturizer: '#B8C9B0', SPF: '#E8D5A3',
  'Eye Cream': '#D4C5B8', Treatment: '#C6A9A3',
  Mask: '#D4B8C8', Exfoliant: '#C9B8A8', 'Facial Oil': '#E8C9A0',
  default: '#C6A9A3',
}
const stepColor = (cat: string) => STEP_COLORS[cat] ?? STEP_COLORS.default

// ── Loading animation ──────────────────────────────────────────────────────────
function GeneratingScreen() {
  const steps = ['Analysing your skin profile…', 'Selecting the right ingredients…', 'Matching products from our catalog…', 'Crafting your routine…']
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % steps.length), 1400)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="relative w-24 h-24">
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: '#C6A9A3' }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <Wand2 size={28} style={{ color: '#C6A9A3' }} />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={idx}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
          className="font-serif text-lg text-charcoal-soft">
          {steps[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

// ── Single step card ───────────────────────────────────────────────────────────
function StepCard({ step, index }: { step: RoutineStep; index: number }) {
  const color = stepColor(step.category)
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex gap-4 items-start"
    >
      {/* Step number */}
      <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-display text-sm text-white mt-0.5"
        style={{ background: color }}>
        {step.step}
      </div>

      <div className="flex-1 bg-white rounded-2xl p-4"
        style={{ border: '1px solid rgba(198,169,163,0.12)', boxShadow: '0 2px 10px rgba(62,58,57,0.05)' }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-sans text-[10px] tracking-[0.2em] uppercase"
              style={{ color }}>
              {step.category}
              {step.frequency && <span className="ml-2 text-charcoal-soft normal-case tracking-normal">— {step.frequency}</span>}
            </span>
            <p className="font-serif text-sm text-charcoal mt-1 leading-relaxed">{step.instruction}</p>
            {step.tip && (
              <p className="font-sans text-[10px] text-charcoal-soft mt-1.5 italic">✦ {step.tip}</p>
            )}
          </div>
        </div>

        {/* Product card */}
        {step.product ? (
          <Link href={`/products/${step.product.slug}`}
            className="mt-3 flex items-center gap-3 p-2.5 rounded-xl transition-colors group"
            style={{ background: 'rgba(198,169,163,0.06)', border: '1px solid rgba(198,169,163,0.14)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(198,169,163,0.12)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(198,169,163,0.06)')}
          >
            {step.product.image && (
              <img src={step.product.image} alt={step.product.name}
                className="w-10 h-10 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[9px] tracking-widest uppercase" style={{ color: '#A89E99' }}>
                {step.product.brand}
              </p>
              <p className="font-serif text-xs text-noir truncate">{step.product.name}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-display text-sm" style={{ color: '#C6A9A3' }}>
                ${step.product.price.toFixed(0)}
              </span>
              <ChevronRight size={12} style={{ color: '#C6A9A3' }} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ) : step.productName ? (
          <p className="mt-2 font-sans text-[10px] tracking-wider text-charcoal-soft">
            Recommended: {step.productName}
          </p>
        ) : null}
      </div>
    </motion.div>
  )
}

// ── Section ────────────────────────────────────────────────────────────────────
function RoutineSection({ icon, title, subtitle, steps, color }: {
  icon: React.ReactNode; title: string; subtitle: string
  steps: RoutineStep[]; color: string
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: `${color}20`, color }}>
          {icon}
        </div>
        <div>
          <h2 className="font-display text-xl text-noir">{title}</h2>
          <p className="font-sans text-[10px] tracking-widest uppercase" style={{ color: '#A89E99' }}>{subtitle}</p>
        </div>
      </div>
      <div className="space-y-3 pl-1">
        {steps.map((s, i) => <StepCard key={i} step={s} index={i} />)}
      </div>
    </div>
  )
}

// ── Toggle chip ────────────────────────────────────────────────────────────────
function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="px-3.5 py-1.5 font-sans text-[10px] tracking-wider uppercase rounded-full border transition-all"
      style={{
        background:   selected ? '#C6A9A3' : 'transparent',
        color:        selected ? '#fff' : '#7A736F',
        borderColor:  selected ? '#C6A9A3' : 'rgba(198,169,163,0.35)',
      }}>
      {selected && <span className="mr-1">✓</span>}
      {label}
    </button>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function RoutinePage() {
  const { isAuthenticated, user } = useAuthStore()

  const [step,        setStep]        = useState<'form' | 'generating' | 'result'>('form')
  const [routine,     setRoutine]     = useState<Routine | null>(null)
  const [savedAt,     setSavedAt]     = useState<string | null>(null)

  // Form state
  const [skinType,     setSkinType]     = useState(user?.skinType  || '')
  const [concerns,     setConcerns]     = useState<string[]>([])
  const [goals,        setGoals]        = useState<string[]>([])
  const [timeMorning,  setTimeMorning]  = useState('10 min')
  const [timeEvening,  setTimeEvening]  = useState('15 min')

  // Load saved routine if logged in
  useEffect(() => {
    if (!isAuthenticated) return
    fetch(`${API}/routine/saved`, {
      headers: { Authorization: `Bearer ${Cookies.get('access_token')}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.saved?.routine) {
          setRoutine(d.saved.routine)
          setSavedAt(d.saved.generatedAt)
          const p = d.saved.profile
          if (p) {
            if (p.skinType) setSkinType(p.skinType)
            if (p.concerns) setConcerns(p.concerns)
            if (p.goals)    setGoals(p.goals)
          }
        }
      })
      .catch(() => {})
  }, [isAuthenticated])

  const toggleArr = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const handleGenerate = async () => {
    if (!skinType) { toast.error('Please select your skin type'); return }
    setStep('generating')
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const token = Cookies.get('access_token')
      if (token) headers.Authorization = `Bearer ${token}`

      const r = await fetch(`${API}/routine/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ skinType, concerns, goals, timeMorning, timeEvening }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      setRoutine(d.routine)
      setSavedAt(new Date().toISOString())
      setStep('result')
    } catch (err: any) {
      toast.error(err.message || 'Generation failed')
      setStep('form')
    }
  }

  const totalProducts = routine
    ? [...(routine.morning || []), ...(routine.evening || []), ...(routine.weekly || [])].filter(s => s.product).length
    : 0

  return (
    <div className="pt-[88px] min-h-screen" style={{ background: '#FAF8F6' }}>
      <div className="max-w-screen-md mx-auto px-4 md:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(198,169,163,0.12)', border: '1px solid rgba(198,169,163,0.2)' }}>
            <Sparkles size={11} style={{ color: '#C6A9A3' }} />
            <span className="font-sans text-[9px] tracking-[0.25em] uppercase" style={{ color: '#C6A9A3' }}>
              AI-Powered
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-noir mb-3">Beauty Routine</h1>
          <p className="font-serif text-lg text-charcoal-soft">
            Your complete personalized daily routine — morning, evening &amp; weekly.
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── FORM ──────────────────────────────────────────────────────── */}
          {step === 'form' && (
            <motion.div key="form"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white p-6 md:p-10 space-y-8"
              style={{ borderRadius: 24, border: '1px solid rgba(198,169,163,0.18)', boxShadow: '0 8px 40px rgba(62,58,57,0.07)' }}>

              {savedAt && routine && (
                <div className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: 'rgba(198,169,163,0.08)', border: '1px solid rgba(198,169,163,0.2)' }}>
                  <div>
                    <p className="font-sans text-[10px] tracking-widest uppercase" style={{ color: '#C6A9A3' }}>
                      Saved routine
                    </p>
                    <p className="font-serif text-sm text-charcoal-soft">
                      Generated {new Date(savedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <button onClick={() => setStep('result')}
                    className="font-sans text-xs tracking-widest uppercase px-4 py-2 transition-colors"
                    style={{ color: '#C6A9A3', border: '1px solid rgba(198,169,163,0.4)', borderRadius: 8 }}>
                    View it →
                  </button>
                </div>
              )}

              {/* Skin type */}
              <div>
                <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-3">
                  Your Skin Type *
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKIN_TYPES.map(t => (
                    <Chip key={t} label={t} selected={skinType === t}
                      onClick={() => setSkinType(skinType === t ? '' : t)} />
                  ))}
                </div>
              </div>

              {/* Concerns */}
              <div>
                <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-3">
                  Skin Concerns
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONCERNS.map(c => (
                    <Chip key={c} label={c} selected={concerns.includes(c)}
                      onClick={() => toggleArr(concerns, setConcerns, c)} />
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-3">
                  Routine Goals
                </label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(g => (
                    <Chip key={g} label={g} selected={goals.includes(g)}
                      onClick={() => toggleArr(goals, setGoals, g)} />
                  ))}
                </div>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-3">
                    <Sun size={11} className="inline mr-1.5" />Morning time
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TIMES.map(t => (
                      <Chip key={t} label={t} selected={timeMorning === t} onClick={() => setTimeMorning(t)} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-3">
                    <Moon size={11} className="inline mr-1.5" />Evening time
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TIMES.map(t => (
                      <Chip key={t} label={t} selected={timeEvening === t} onClick={() => setTimeEvening(t)} />
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleGenerate}
                className="w-full py-4 font-sans text-[11px] tracking-[0.25em] uppercase text-white
                           flex items-center justify-center gap-3 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)', borderRadius: 12 }}>
                <Wand2 size={15} />
                Generate My Routine
              </button>

              {!isAuthenticated && (
                <p className="font-serif text-xs text-center text-charcoal-soft">
                  <Link href="/auth/login" className="text-champagne hover:underline">Sign in</Link>
                  {' '}to save your routine and sync with your skin tracker.
                </p>
              )}
            </motion.div>
          )}

          {/* ── GENERATING ────────────────────────────────────────────────── */}
          {step === 'generating' && (
            <motion.div key="generating"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GeneratingScreen />
            </motion.div>
          )}

          {/* ── RESULT ────────────────────────────────────────────────────── */}
          {step === 'result' && routine && (
            <motion.div key="result"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}>

              {/* Summary bar */}
              <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    { label: `${routine.morning.length} Morning steps`, color: '#E8D5A3' },
                    { label: `${routine.evening.length} Evening steps`, color: '#A8C5DA' },
                    { label: `${routine.weekly.length} Weekly treatments`, color: '#B8C9B0' },
                    { label: `${totalProducts} store products`, color: '#C6A9A3' },
                  ].map(b => (
                    <span key={b.label}
                      className="font-sans text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-full"
                      style={{ background: `${b.color}25`, color: b.color }}>
                      {b.label}
                    </span>
                  ))}
                </div>
                <button onClick={() => setStep('form')}
                  className="flex items-center gap-1.5 font-sans text-[10px] tracking-widest uppercase transition-colors"
                  style={{ color: '#A89E99' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C6A9A3')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#A89E99')}>
                  <RotateCcw size={11} /> Regenerate
                </button>
              </div>

              {/* AI insight */}
              {routine.insight && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="mb-8 p-5 flex gap-4 items-start"
                  style={{ background: 'rgba(198,169,163,0.07)', borderRadius: 16, border: '1px solid rgba(198,169,163,0.18)' }}>
                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)' }}>
                    <Sparkles size={13} className="text-white" />
                  </div>
                  <p className="font-serif text-sm leading-relaxed" style={{ color: '#5C5450' }}>
                    {routine.insight}
                  </p>
                </motion.div>
              )}

              {/* Morning */}
              <RoutineSection
                icon={<Sun size={16} />} color="#E8C56E"
                title="Morning Routine" subtitle={`${timeMorning} · ${routine.morning.length} steps`}
                steps={routine.morning}
              />

              {/* Evening */}
              <RoutineSection
                icon={<Moon size={16} />} color="#A8C5DA"
                title="Evening Routine" subtitle={`${timeEvening} · ${routine.evening.length} steps`}
                steps={routine.evening}
              />

              {/* Weekly */}
              <RoutineSection
                icon={<Calendar size={16} />} color="#B8C9B0"
                title="Weekly Treatments" subtitle={`${routine.weekly.length} treatments`}
                steps={routine.weekly}
              />

              {/* Shop CTA */}
              {totalProducts > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="mt-4 p-6 text-center"
                  style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)', borderRadius: 20 }}>
                  <p className="font-display text-xl text-white mb-1">
                    {totalProducts} products from your routine are in our store
                  </p>
                  <p className="font-serif text-white/70 text-sm mb-4">
                    Shop your complete routine in one place.
                  </p>
                  <Link href="/products?category=skincare"
                    className="inline-flex items-center gap-2 bg-white font-sans text-[10px] tracking-widest uppercase
                               px-6 py-3 transition-opacity hover:opacity-90"
                    style={{ color: '#A08070', borderRadius: 8 }}>
                    <ShoppingBag size={12} />
                    Shop Skincare
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
