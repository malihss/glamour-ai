'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Heart, ChevronLeft, Sparkles, X, ExternalLink, ShoppingBag } from 'lucide-react'

type Family = 'floral' | 'oriental' | 'woody' | 'fresh' | 'citrus' | 'gourmand'

interface Fragrance {
  id: string
  name: string
  brand: string
  family: Family
  concentration: string
  gender: string
  longevity: string
  sillage: string
  topNotes: string[]
  heartNotes: string[]
  baseNotes: string[]
  description: string
  color: string
  price: number
  slug: string
  image: string | null
}

const FAMILY_META: Record<Family, { label: string; emoji: string; color: string; bg: string }> = {
  floral:   { label: 'Floral',    emoji: '🌸', color: '#E8B4B8', bg: '#FFF0F3' },
  oriental: { label: 'Oriental',  emoji: '🔮', color: '#9B59B6', bg: '#F5F0FF' },
  woody:    { label: 'Woody',     emoji: '🌿', color: '#8B6914', bg: '#FFF8EE' },
  fresh:    { label: 'Fresh',     emoji: '💎', color: '#2D9CDB', bg: '#F0F8FF' },
  citrus:   { label: 'Citrus',    emoji: '🍋', color: '#F39C12', bg: '#FFFBF0' },
  gourmand: { label: 'Gourmand',  emoji: '🍫', color: '#8E44AD', bg: '#FBF0FF' },
}

const FAMILY_COLORS: Record<Family, string> = {
  floral: '#F4A0B8', oriental: '#9B59B6', woody: '#8B6914',
  fresh: '#2D9CDB', citrus: '#F39C12', gourmand: '#8E44AD',
}

const SILLAGE_TO_NUM: Record<string, number> = {
  'Intimate': 1, 'Light': 2, 'Light to Moderate': 2, 'Moderate': 3, 'Strong': 4, 'Very strong': 5,
}
const LONGEVITY_TO_NUM: Record<string, number> = {
  'Short (1–3 hrs)': 1, 'Moderate (4–6 hrs)': 2, 'Moderate (5–7 hrs)': 2,
  'Long-lasting (8+ hrs)': 4, 'Very long-lasting (12+ hrs)': 5,
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

function getSimilar(liked: string[], all: Fragrance[]): Fragrance[] {
  if (!liked.length) return []
  const likedFrags = all.filter(f => liked.includes(f.id))
  const likedNotes = new Set(likedFrags.flatMap(f => [...f.topNotes, ...f.heartNotes, ...f.baseNotes]))
  const likedFamilies = new Set(likedFrags.map(f => f.family))

  return all
    .filter(f => !liked.includes(f.id))
    .map(f => {
      let score = 0
      if (likedFamilies.has(f.family)) score += 3
      ;[...f.topNotes, ...f.heartNotes, ...f.baseNotes].forEach(n => { if (likedNotes.has(n)) score += 2 })
      return { frag: f, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(x => x.frag)
}

function IntensityDots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < value ? 'bg-[#C9A96E]' : 'bg-gray-200'}`} />
      ))}
    </div>
  )
}

function FragranceCard({ frag, liked, onToggle, onClick }: {
  frag: Fragrance; liked: boolean; onToggle: () => void; onClick: () => void
}) {
  const meta = FAMILY_META[frag.family] ?? FAMILY_META.floral
  const intensity = SILLAGE_TO_NUM[frag.sillage] ?? 3
  const longevity = LONGEVITY_TO_NUM[frag.longevity] ?? 3

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="h-1.5 w-full" style={{ background: FAMILY_COLORS[frag.family] ?? '#C9A96E' }} />

      <div className="p-5" onClick={onClick}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-sans text-[9px] tracking-[0.15em] uppercase font-semibold" style={{ color: meta.color }}>
                {meta.emoji} {meta.label}
              </span>
              {frag.concentration && (
                <span className="font-sans text-[9px] text-gray-400">· {frag.concentration}</span>
              )}
            </div>
            <h3 className="font-display text-base font-semibold text-gray-900">{frag.name}</h3>
            <p className="font-sans text-xs text-gray-400">{frag.brand}</p>
          </div>
          <button onClick={e => { e.stopPropagation(); onToggle() }}
            className={`p-1.5 rounded-full transition-all duration-200 ${liked ? 'text-red-400 bg-red-50' : 'text-gray-300 hover:text-red-300 hover:bg-red-50'}`}>
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Notes */}
        <div className="space-y-2 mb-4 min-h-[60px]">
          {frag.topNotes.length === 0 && frag.heartNotes.length === 0 && frag.baseNotes.length === 0 ? (
            <p className="font-sans text-[10px] text-gray-300 italic">No fragrance notes added yet</p>
          ) : [
            { label: 'Top',   notes: frag.topNotes,   size: 'text-[10px]', opacity: 'opacity-60' },
            { label: 'Heart', notes: frag.heartNotes, size: 'text-[11px]', opacity: 'opacity-80' },
            { label: 'Base',  notes: frag.baseNotes,  size: 'text-xs',     opacity: 'opacity-100' },
          ].map(({ label, notes, size, opacity }) => notes.length > 0 && (
            <div key={label} className="flex items-start gap-2">
              <span className="font-sans text-[9px] tracking-wider uppercase text-gray-400 w-9 flex-shrink-0 pt-0.5">{label}</span>
              <div className="flex flex-wrap gap-1">
                {notes.map(n => (
                  <span key={n} className={`font-sans ${size} ${opacity} text-gray-700 bg-gray-50 px-2 py-0.5 rounded-full`}>{n}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-sans text-[9px] text-gray-400 uppercase tracking-wider">Intensity</p>
              <IntensityDots value={intensity} />
            </div>
            <div>
              <p className="font-sans text-[9px] text-gray-400 uppercase tracking-wider">Longevity</p>
              <IntensityDots value={longevity} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-sans text-sm font-semibold text-gray-800">${frag.price}</p>
            <Link href={`/products/${frag.slug}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 bg-[#0f0f0f] text-white font-sans text-[10px] tracking-wider uppercase px-2.5 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
              Shop <ShoppingBag size={10} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function FragranceDetail({ frag, liked, onToggle, onClose }: {
  frag: Fragrance; liked: boolean; onToggle: () => void; onClose: () => void
}) {
  const meta = FAMILY_META[frag.family] ?? FAMILY_META.floral
  const intensity = SILLAGE_TO_NUM[frag.sillage] ?? 3
  const longevity = LONGEVITY_TO_NUM[frag.longevity] ?? 3

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="h-2 w-full" style={{ background: FAMILY_COLORS[frag.family] ?? '#C9A96E' }} />

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold" style={{ color: meta.color }}>
                {meta.emoji} {meta.label}
              </span>
              <h2 className="font-display text-2xl font-semibold text-gray-900 mt-0.5">{frag.name}</h2>
              <p className="font-sans text-sm text-gray-400">{frag.brand} · {frag.concentration} · {frag.gender}</p>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          {frag.description && (
            <p className="font-sans text-sm text-gray-600 leading-relaxed mb-5 italic">&ldquo;{frag.description}&rdquo;</p>
          )}

          <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-3">
            <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-3">Fragrance Notes</p>
            {[
              { label: 'Top Notes',   notes: frag.topNotes,   sub: 'First impression · fades in 30 min' },
              { label: 'Heart Notes', notes: frag.heartNotes, sub: 'Character · lasts 30 min – 3 hrs' },
              { label: 'Base Notes',  notes: frag.baseNotes,  sub: 'Soul · lingers for hours' },
            ].map(({ label, notes, sub }) => notes.length > 0 && (
              <div key={label}>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="font-sans text-xs font-semibold text-gray-800">{label}</span>
                  <span className="font-sans text-[10px] text-gray-400">{sub}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {notes.map(n => (
                    <span key={n} className="font-sans text-xs text-gray-700 bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-sm">{n}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Intensity', value: intensity },
              { label: 'Longevity', value: longevity },
              { label: 'Price', custom: `$${frag.price}` },
            ].map(({ label, value, custom }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
                {custom
                  ? <p className="font-sans text-sm font-semibold text-gray-900">{custom}</p>
                  : <div className="flex gap-1 justify-center"><IntensityDots value={value!} /></div>}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={onToggle}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-sans text-xs tracking-wider uppercase transition-all ${
                liked ? 'border-red-200 bg-red-50 text-red-400' : 'border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-400'
              }`}>
              <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
              {liked ? 'Liked' : 'Like'}
            </button>
            <Link href={`/products/${frag.slug}`}
              className="flex-1 bg-[#0f0f0f] text-white font-sans text-xs tracking-[0.15em] uppercase py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
              Shop Now <ShoppingBag size={13} />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function FragrancePage() {
  const [fragrances, setFragrances] = useState<Fragrance[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState<string[]>([])
  const [activeFamily, setActiveFamily] = useState<'all' | Family>('all')
  const [selected, setSelected] = useState<Fragrance | null>(null)

  useEffect(() => {
    const fetchFragrances = async () => {
      try {
        // Fetch from all fragrance-related categories
        const slugs = ['eau-de-parfum', 'fragrance', 'eau-de-toilette', 'cologne']
        const results = await Promise.all(
          slugs.map(s => fetch(`${API}/products?category=${s}&limit=50`).then(r => r.json()).catch(() => ({ products: [] })))
        )
        const seen = new Set<string>()
        const all: Fragrance[] = []
        for (const r of results) {
          for (const p of (r.products || [])) {
            if (seen.has(p.id)) continue
            seen.add(p.id)
            all.push({
              id:          p.id,
              name:        p.name,
              brand:       p.brand?.name ?? '',
              family:      (p.fragrance_family as Family) ?? 'floral',
              concentration: p.category?.name ?? '',
              gender:      p.gender ?? '',
              longevity:   p.longevity ?? '',
              sillage:     p.sillage ?? '',
              topNotes:    p.notes_top    ?? [],
              heartNotes:  p.notes_middle ?? [],
              baseNotes:   p.notes_base   ?? [],
              description: p.shortDescription ?? '',
              color:       FAMILY_COLORS[(p.fragrance_family as Family)] ?? '#C9A96E',
              price:       p.price,
              slug:        p.slug,
              image:       p.primaryImage ?? null,
            })
          }
        }
        setFragrances(all)
      } catch {
        setFragrances([])
      } finally {
        setLoading(false)
      }
    }
    fetchFragrances()
  }, [])

  const toggle = (id: string) => setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const filtered = useMemo(() =>
    activeFamily === 'all' ? fragrances : fragrances.filter(f => f.family === activeFamily),
    [activeFamily, fragrances]
  )

  const similar = useMemo(() => getSimilar(liked, fragrances), [liked, fragrances])

  const families: ('all' | Family)[] = ['all', 'floral', 'oriental', 'woody', 'fresh', 'citrus', 'gourmand']

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-[88px]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-gray-400">Glamour AI</p>
            <h1 className="font-display text-2xl font-semibold text-gray-900">Fragrance Explorer</h1>
          </div>
        </div>

        {/* Hero */}
        <div className="relative bg-gradient-to-r from-[#0f0f0f] to-[#2D1B0E] rounded-2xl overflow-hidden mb-8 p-8">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #C9A96E 0%, transparent 60%)' }} />
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">Discover Your Signature</p>
          <h2 className="font-display text-3xl text-white font-medium mb-2">Find Your Scent</h2>
          <p className="font-sans text-sm text-gray-400 max-w-sm leading-relaxed">
            Browse our fragrances with full note breakdowns. Heart the ones you love and we&apos;ll find your perfect matches.
          </p>
          {liked.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white font-sans text-xs px-3 py-1.5 rounded-full">
                <Heart size={12} fill="currentColor" className="text-red-400" />
                {liked.length} liked · {similar.length} match{similar.length !== 1 ? 'es' : ''} found
              </span>
            </div>
          )}
        </div>

        {/* Similar */}
        <AnimatePresence>
          {similar.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden">
              <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl p-6 border border-[#C9A96E]/20">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={15} className="text-[#C9A96E]" />
                  <p className="font-display text-lg font-semibold text-gray-900">Matched for You</p>
                  <p className="font-sans text-xs text-gray-400">Based on your {liked.length} liked fragrance{liked.length > 1 ? 's' : ''}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {similar.map(frag => {
                    const m = FAMILY_META[frag.family] ?? FAMILY_META.floral
                    return (
                      <button key={frag.id} onClick={() => setSelected(frag)}
                        className="bg-white rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-[#C9A96E]/40">
                        <div className="h-1 rounded-full mb-3" style={{ background: frag.color }} />
                        <p className="font-sans text-[9px] tracking-wider uppercase mb-1" style={{ color: m.color }}>
                          {m.emoji} {m.label}
                        </p>
                        <p className="font-display text-sm font-semibold text-gray-900 leading-tight">{frag.name}</p>
                        <p className="font-sans text-xs text-gray-400 mt-0.5">{frag.brand}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {frag.heartNotes.slice(0, 2).map(n => (
                            <span key={n} className="font-sans text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-full">{n}</span>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Family filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {families.map(fam => {
            const isAll = fam === 'all'
            const m = isAll ? null : FAMILY_META[fam as Family]
            const isActive = activeFamily === fam
            return (
              <button key={fam} onClick={() => setActiveFamily(fam)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-sans text-xs tracking-wider uppercase transition-all duration-200 ${
                  isActive ? 'bg-[#0f0f0f] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>
                {isAll ? '✦' : m!.emoji}
                {isAll ? 'All' : m!.label}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-xl text-gray-400 mb-2">No fragrances found</p>
            <p className="font-sans text-sm text-gray-400">Add perfumes in the admin panel with a fragrance family assigned.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map(frag => (
                <FragranceCard key={frag.id} frag={frag}
                  liked={liked.includes(frag.id)}
                  onToggle={() => toggle(frag.id)}
                  onClick={() => setSelected(frag)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <FragranceDetail frag={selected}
            liked={liked.includes(selected.id)}
            onToggle={() => toggle(selected.id)}
            onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
