'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Plus, Trash2, Camera, X, ChevronDown, ChevronUp,
  Droplets, Eye, Layers, Star, TrendingUp, Calendar, Flame, Wand2
} from 'lucide-react'
import Cookies from 'js-cookie'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

const API = process.env.NEXT_PUBLIC_API_URL || '/api'

// ── Types ──────────────────────────────────────────────────────────────────────
interface SkinEntry {
  id: string
  date: string
  photo: string | null
  overall: number | null
  hydration: number | null
  clarity: number | null
  texture: number | null
  productsUsed: { id?: string; name: string }[]
  notes: string | null
  aiInsights: string | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const auth = () => ({ Authorization: `Bearer ${Cookies.get('access_token')}`, 'Content-Type': 'application/json' })

function fmt(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ScoreRing({ value, color, size = 64 }: { value: number | null; color: string; size?: number }) {
  const r = (size / 2) - 6
  const circ = 2 * Math.PI * r
  const pct = value != null ? value / 10 : 0
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(198,169,163,0.12)" strokeWidth={5} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - pct * circ }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  )
}

// ── Minimal SVG line chart ─────────────────────────────────────────────────────
function LineChart({ entries }: { entries: SkinEntry[] }) {
  const W = 600, H = 140, PAD = 24
  if (entries.length < 2) return (
    <div className="flex items-center justify-center h-36 font-serif text-sm" style={{ color: '#C6A9A3' }}>
      Log at least 2 days to see your trend
    </div>
  )

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const series = [
    { key: 'overall'  as const, color: '#C6A9A3', label: 'Overall' },
    { key: 'hydration'as const, color: '#A8C5DA', label: 'Hydration' },
    { key: 'clarity'  as const, color: '#C6B5A3', label: 'Clarity' },
    { key: 'texture'  as const, color: '#B8C9B0', label: 'Texture' },
  ]

  const xStep = (W - PAD * 2) / (sorted.length - 1)
  const yScale = (v: number) => PAD + (H - PAD * 2) * (1 - v / 10)

  const points = (key: keyof SkinEntry) =>
    sorted
      .map((e, i) => {
        const v = e[key] as number | null
        return v != null ? `${PAD + i * xStep},${yScale(v)}` : null
      })
      .filter(Boolean)
      .join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }}>
        {/* Y gridlines */}
        {[2, 4, 6, 8, 10].map(v => (
          <line key={v} x1={PAD} y1={yScale(v)} x2={W - PAD} y2={yScale(v)}
            stroke="rgba(198,169,163,0.10)" strokeWidth={1} />
        ))}
        {/* Lines */}
        {series.map(s => {
          const pts = sorted.map((e, i) => {
            const v = e[s.key] as number | null
            return v != null ? [PAD + i * xStep, yScale(v)] : null
          })
          const d = pts.reduce((acc, pt, i) => {
            if (!pt) return acc
            const prev = pts.slice(0, i).reverse().find(Boolean)
            return acc + (prev ? `L${pt[0]},${pt[1]}` : `M${pt[0]},${pt[1]}`)
          }, '')
          return (
            <motion.path key={s.key} d={d} fill="none" stroke={s.color} strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }} />
          )
        })}
        {/* Dots for overall */}
        {sorted.map((e, i) => e.overall != null && (
          <circle key={i} cx={PAD + i * xStep} cy={yScale(e.overall)}
            r={3} fill="#C6A9A3" />
        ))}
      </svg>

      {/* X labels */}
      <div className="flex justify-between px-6 mt-1">
        {sorted.map((e, i) => (
          (i === 0 || i === sorted.length - 1 || sorted.length <= 7) && (
            <span key={i} className="font-sans text-[9px] tracking-wider" style={{ color: '#A89E99' }}>
              {fmt(e.date)}
            </span>
          )
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 px-1">
        {series.map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ background: s.color }} />
            <span className="font-sans text-[9px] tracking-widest uppercase" style={{ color: '#A89E99' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Slider ─────────────────────────────────────────────────────────────────────
function ScoreSlider({ label, icon, color, value, onChange }: {
  label: string; icon: React.ReactNode; color: string
  value: number; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span style={{ color }}>{icon}</span>
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase" style={{ color: '#7A736F' }}>{label}</span>
        </div>
        <span className="font-display text-lg" style={{ color }}>{value}/10</span>
      </div>
      <input type="range" min={1} max={10} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: color, background: `linear-gradient(to right, ${color} ${value * 10}%, rgba(198,169,163,0.15) ${value * 10}%)` }}
      />
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function JourneyPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [entries, setEntries]         = useState<SkinEntry[]>([])
  const [loading, setLoading]         = useState(true)
  const [formOpen, setFormOpen]       = useState(false)
  const [insights, setInsights]       = useState<string | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [compareA, setCompareA]       = useState<string | null>(null)
  const [compareB, setCompareB]       = useState<string | null>(null)

  // Form state
  const [formDate, setFormDate]       = useState(new Date().toISOString().slice(0, 10))
  const [formPhoto, setFormPhoto]     = useState<string | null>(null)
  const [formOverall, setFormOverall] = useState(7)
  const [formHydration, setFormHydration] = useState(7)
  const [formClarity, setFormClarity] = useState(7)
  const [formTexture, setFormTexture] = useState(7)
  const [formProducts, setFormProducts] = useState('')
  const [formNotes, setFormNotes]     = useState('')
  const [saving, setSaving]           = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchEntries = useCallback(async () => {
    if (!isAuthenticated) { setLoading(false); return }
    try {
      const r = await fetch(`${API}/tracker/?days=60`, { headers: auth() })
      const d = await r.json()
      setEntries(d.entries || [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [isAuthenticated])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  // Pre-fill form if entry for today exists
  useEffect(() => {
    const today = entries.find(e => e.date === formDate)
    if (today) {
      setFormOverall(today.overall ?? 7)
      setFormHydration(today.hydration ?? 7)
      setFormClarity(today.clarity ?? 7)
      setFormTexture(today.texture ?? 7)
      setFormProducts(today.productsUsed.map(p => p.name).join(', '))
      setFormNotes(today.notes ?? '')
      setFormPhoto(today.photo ?? null)
    } else {
      setFormOverall(7); setFormHydration(7); setFormClarity(7); setFormTexture(7)
      setFormProducts(''); setFormNotes(''); setFormPhoto(null)
    }
  }, [formDate, entries])

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setFormPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!isAuthenticated) { toast.error('Please sign in'); return }
    setSaving(true)
    try {
      const products = formProducts.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name }))
      const r = await fetch(`${API}/tracker/`, {
        method: 'POST',
        headers: auth(),
        body: JSON.stringify({
          date: formDate,
          photo: formPhoto,
          overall: formOverall, hydration: formHydration,
          clarity: formClarity, texture: formTexture,
          productsUsed: products,
          notes: formNotes.trim() || null,
        }),
      })
      if (!r.ok) throw new Error()
      toast.success('Entry saved!')
      setFormOpen(false)
      fetchEntries()
    } catch {
      toast.error('Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    await fetch(`${API}/tracker/${id}`, { method: 'DELETE', headers: auth() })
    setEntries(prev => prev.filter(e => e.id !== id))
    toast.success('Entry deleted')
  }

  const fetchInsights = async () => {
    setInsightsLoading(true)
    try {
      const r = await fetch(`${API}/tracker/insights`, { method: 'POST', headers: auth() })
      const d = await r.json()
      setInsights(d.insights)
    } catch {
      setInsights('Could not load insights right now.')
    } finally { setInsightsLoading(false) }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const last7  = entries.slice(0, 7)
  const avgOverall = last7.length
    ? Math.round(last7.reduce((s, e) => s + (e.overall ?? 0), 0) / last7.filter(e => e.overall).length * 10) / 10
    : null
  const streak = (() => {
    let s = 0
    const today = new Date().toISOString().slice(0, 10)
    const dateSet = new Set(entries.map(e => e.date))
    let d = new Date()
    while (dateSet.has(d.toISOString().slice(0, 10))) {
      s++
      d.setDate(d.getDate() - 1)
    }
    return s
  })()

  const withPhotos = entries.filter(e => e.photo)
  const entryA = withPhotos.find(e => e.date === compareA)
  const entryB = withPhotos.find(e => e.date === compareB)

  if (!isAuthenticated) {
    return (
      <div className="pt-[88px] min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles size={32} style={{ color: '#C6A9A3', margin: '0 auto' }} />
          <h1 className="font-display text-3xl text-noir">Beauty Journey</h1>
          <p className="font-serif text-charcoal-soft">Sign in to track your skin over time.</p>
          <Link href="/auth/login" className="btn-primary inline-block mt-2">Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[88px] min-h-screen" style={{ background: '#FAF8F6' }}>
      <div className="max-w-screen-lg mx-auto px-4 md:px-8 py-12">

        {/* Header */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: '#C6A9A3' }}>
              Beauty Journey
            </p>
            <h1 className="font-display text-4xl text-noir">
              {user?.firstName ? `${user.firstName}'s` : 'Your'} Skin Tracker
            </h1>
            <p className="font-serif text-charcoal-soft mt-1">Track your glow every day.</p>
          </div>
          <button
            onClick={() => setFormOpen(v => !v)}
            className="flex items-center gap-2 font-sans text-[11px] tracking-widest uppercase
                       px-5 py-3 text-white transition-colors"
            style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)' }}
          >
            <Plus size={13} />
            Log Today
          </button>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Avg Score', value: avgOverall != null ? `${avgOverall}/10` : '—', icon: <Star size={16} />, color: '#C6A9A3' },
            { label: 'Day Streak', value: `${streak}`, icon: <Flame size={16} />, color: '#E8A87C' },
            { label: 'Entries', value: `${entries.length}`, icon: <Calendar size={16} />, color: '#A8C5DA' },
            { label: 'With Photos', value: `${withPhotos.length}`, icon: <Camera size={16} />, color: '#B8C9B0' },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-5 flex items-center gap-4"
              style={{ borderRadius: 16, border: '1px solid rgba(198,169,163,0.14)', boxShadow: '0 2px 12px rgba(62,58,57,0.05)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `${stat.color}20`, color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <p className="font-display text-xl text-noir leading-none">{stat.value}</p>
                <p className="font-sans text-[9px] tracking-widest uppercase mt-0.5" style={{ color: '#A89E99' }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Log form ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {formOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-8">
              <div className="bg-white p-6 md:p-8 space-y-6"
                style={{ borderRadius: 20, border: '1px solid rgba(198,169,163,0.18)', boxShadow: '0 4px 24px rgba(62,58,57,0.07)' }}>

                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl text-noir">Log Your Skin Check</h2>
                  <button onClick={() => setFormOpen(false)}><X size={16} style={{ color: '#A89E99' }} /></button>
                </div>

                {/* Date */}
                <div>
                  <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">Date</label>
                  <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                    className="input-luxury" max={new Date().toISOString().slice(0,10)} />
                </div>

                {/* Photo */}
                <div>
                  <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">Photo (optional)</label>
                  <div className="flex items-center gap-4">
                    {formPhoto ? (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-champagne/20">
                        <img src={formPhoto} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setFormPhoto(null)}
                          className="absolute top-1 right-1 bg-noir/50 rounded-full p-0.5">
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => fileRef.current?.click()}
                        className="w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors"
                        style={{ borderColor: 'rgba(198,169,163,0.4)', color: '#C6A9A3' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#C6A9A3')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(198,169,163,0.4)')}>
                        <Camera size={16} />
                        <span className="font-sans text-[9px]">Add</span>
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                    <p className="font-serif text-xs text-charcoal-soft">Your photo is stored privately and never shared.</p>
                  </div>
                </div>

                {/* Score sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ScoreSlider label="Overall" icon={<Star size={13}/>} color="#C6A9A3" value={formOverall} onChange={setFormOverall} />
                  <ScoreSlider label="Hydration" icon={<Droplets size={13}/>} color="#A8C5DA" value={formHydration} onChange={setFormHydration} />
                  <ScoreSlider label="Clarity" icon={<Eye size={13}/>} color="#C6B5A3" value={formClarity} onChange={setFormClarity} />
                  <ScoreSlider label="Texture" icon={<Layers size={13}/>} color="#B8C9B0" value={formTexture} onChange={setFormTexture} />
                </div>

                {/* Products used */}
                <div>
                  <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">
                    Products Used Today
                  </label>
                  <input type="text" value={formProducts}
                    onChange={e => setFormProducts(e.target.value)}
                    placeholder="La Mer Crème, Tatcha Essence, SPF50…  (comma separated)"
                    className="input-luxury" />
                </div>

                {/* Notes */}
                <div>
                  <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">Notes</label>
                  <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)}
                    rows={3} placeholder="How does your skin feel today? Any reactions?"
                    className="input-luxury resize-none" />
                </div>

                <button onClick={handleSave} disabled={saving}
                  className="w-full font-sans text-[11px] tracking-widest uppercase py-3.5 text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)' }}>
                  {saving ? 'Saving…' : 'Save Entry'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Trend Chart ────────────────────────────────────────────────── */}
        {entries.length > 0 && (
          <div className="bg-white p-6 md:p-8 mb-8"
            style={{ borderRadius: 20, border: '1px solid rgba(198,169,163,0.14)', boxShadow: '0 4px 24px rgba(62,58,57,0.06)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} style={{ color: '#C6A9A3' }} />
                <h2 className="font-display text-xl text-noir">Skin Score Trend</h2>
              </div>
              <span className="font-sans text-[10px] tracking-widest uppercase text-charcoal-soft">
                Last {Math.min(entries.length, 60)} days
              </span>
            </div>
            <LineChart entries={entries} />
          </div>
        )}

        {/* ── AI Insights ────────────────────────────────────────────────── */}
        {entries.length >= 3 && (
          <div className="mb-8 p-6 md:p-8"
            style={{ borderRadius: 20, background: 'linear-gradient(135deg,rgba(198,169,163,0.08),rgba(160,128,112,0.05))', border: '1px solid rgba(198,169,163,0.18)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)' }}>
                  <Wand2 size={14} className="text-white" />
                </div>
                <h2 className="font-display text-xl text-noir">AI Skin Insights</h2>
              </div>
              {!insights && (
                <button onClick={fetchInsights} disabled={insightsLoading}
                  className="font-sans text-[10px] tracking-widest uppercase px-4 py-2 transition-colors disabled:opacity-60"
                  style={{ border: '1px solid rgba(198,169,163,0.4)', color: '#C6A9A3', borderRadius: 8 }}>
                  {insightsLoading ? 'Analysing…' : 'Analyse My Skin'}
                </button>
              )}
            </div>
            {insights && (
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="font-serif text-base leading-relaxed mt-4" style={{ color: '#5C5450' }}>
                {insights}
              </motion.p>
            )}
            {!insights && !insightsLoading && (
              <p className="font-serif text-sm text-charcoal-soft mt-3">
                Your AI beauty advisor analyses your entries and spots trends, pattern changes, and personalised tips.
              </p>
            )}
          </div>
        )}

        {/* ── Before / After ─────────────────────────────────────────────── */}
        {withPhotos.length >= 2 && (
          <div className="bg-white p-6 md:p-8 mb-8"
            style={{ borderRadius: 20, border: '1px solid rgba(198,169,163,0.14)', boxShadow: '0 4px 24px rgba(62,58,57,0.06)' }}>
            <h2 className="font-display text-xl text-noir mb-5">Before / After</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {(['A', 'B'] as const).map((slot, idx) => {
                const val = idx === 0 ? compareA : compareB
                const setVal = idx === 0 ? setCompareA : setCompareB
                return (
                  <div key={slot}>
                    <label className="font-sans text-[9px] tracking-widest uppercase text-charcoal-soft block mb-2">
                      {idx === 0 ? 'Before' : 'After'}
                    </label>
                    <select value={val ?? ''} onChange={e => setVal(e.target.value || null)}
                      className="input-luxury font-sans text-xs">
                      <option value="">Select date</option>
                      {withPhotos.map(e => (
                        <option key={e.date} value={e.date}>{fmt(e.date)}</option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
            {entryA && entryB && (
              <div className="grid grid-cols-2 gap-4">
                {[entryA, entryB].map((e, i) => (
                  <div key={i}>
                    <div className="aspect-square rounded-xl overflow-hidden bg-ivory-warm">
                      <img src={e.photo!} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-2 flex gap-3 justify-center">
                      <span className="font-sans text-[10px] tracking-widest uppercase" style={{ color: '#A89E99' }}>{fmt(e.date)}</span>
                      {e.overall && (
                        <span className="font-sans text-[10px]" style={{ color: '#C6A9A3' }}>⋆ {e.overall}/10</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Entry History ──────────────────────────────────────────────── */}
        <div>
          <h2 className="font-display text-2xl text-noir mb-5">History</h2>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles size={28} className="mx-auto mb-4" style={{ color: '#C6A9A3' }} />
              <p className="font-display text-xl text-noir mb-2">Start your journey</p>
              <p className="font-serif text-charcoal-soft mb-6">Log your first skin check-in above.</p>
              <button onClick={() => setFormOpen(true)}
                className="btn-primary inline-flex items-center gap-2">
                <Plus size={13} /> Log Today
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, i) => (
                <motion.div key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white flex gap-4 items-center p-5"
                  style={{ borderRadius: 16, border: '1px solid rgba(198,169,163,0.12)', boxShadow: '0 2px 12px rgba(62,58,57,0.05)' }}
                >
                  {/* Photo or score ring */}
                  <div className="relative shrink-0 w-14 h-14">
                    {entry.photo ? (
                      <img src={entry.photo} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                      <div className="relative w-14 h-14 flex items-center justify-center">
                        <ScoreRing value={entry.overall} color="#C6A9A3" size={56} />
                        <span className="absolute font-display text-sm" style={{ color: '#3E3A39' }}>
                          {entry.overall ?? '—'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-sans text-xs tracking-widest uppercase text-noir">{fmt(entry.date)}</span>
                      {entry.overall && (
                        <span className="font-sans text-[9px] px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(198,169,163,0.12)', color: '#C6A9A3' }}>
                          ⋆ {entry.overall}/10
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-1.5 flex-wrap">
                      {entry.hydration && <span className="font-sans text-[9px] text-charcoal-soft">💧 {entry.hydration}</span>}
                      {entry.clarity   && <span className="font-sans text-[9px] text-charcoal-soft">✦ {entry.clarity}</span>}
                      {entry.texture   && <span className="font-sans text-[9px] text-charcoal-soft">~ {entry.texture}</span>}
                    </div>
                    {entry.notes && (
                      <p className="font-serif text-xs text-charcoal-soft mt-1 truncate">{entry.notes}</p>
                    )}
                    {entry.productsUsed?.length > 0 && (
                      <p className="font-sans text-[9px] text-charcoal-soft mt-1 truncate">
                        {entry.productsUsed.map(p => p.name).join(' · ')}
                      </p>
                    )}
                  </div>

                  {/* Delete */}
                  <button onClick={() => handleDelete(entry.id)}
                    className="shrink-0 p-2 transition-colors"
                    style={{ color: 'rgba(198,169,163,0.4)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C6A9A3')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(198,169,163,0.4)')}>
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
