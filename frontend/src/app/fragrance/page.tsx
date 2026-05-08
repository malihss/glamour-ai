'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Heart, ChevronLeft, Sparkles, X, ExternalLink } from 'lucide-react'

type Family = 'floral' | 'oriental' | 'woody' | 'fresh' | 'citrus' | 'gourmand'

interface Fragrance {
  id: number; name: string; brand: string; family: Family; year: number
  concentration: string; gender: 'feminine' | 'masculine' | 'unisex'
  occasion: string[]; mood: string[]; intensity: number; longevity: number
  topNotes: string[]; heartNotes: string[]; baseNotes: string[]
  description: string; color: string; price: number; shopLink: string
}

const FRAGRANCES: Fragrance[] = [
  // ── FLORAL ──────────────────────────────────────────────────────────────────
  { id:1,  name:'Miss Dior',             brand:'Dior',                  family:'floral',    year:2011, concentration:'EDP', gender:'feminine',
    occasion:['date','everyday','spring'], mood:['romantic','feminine','fresh'],
    intensity:3, longevity:3, color:'#F4A0B8', price:155,
    shopLink:'https://www.dior.com/en_us/beauty/fragrance',
    topNotes:['Bergamot','Mandarin','Greens'],
    heartNotes:['Rose','Peony','Lily of the Valley'],
    baseNotes:['Musk','Patchouli','Sandalwood'],
    description:'A romantic bouquet of fresh florals over a soft musky base. Timeless and effortlessly feminine.' },
  { id:2,  name:'Chance Eau Tendre',     brand:'Chanel',                family:'floral',    year:2010, concentration:'EDP', gender:'feminine',
    occasion:['everyday','spring','office'], mood:['fresh','light','feminine'],
    intensity:2, longevity:3, color:'#FFD1DC', price:145,
    shopLink:'https://www.chanel.com/us/fragrance',
    topNotes:['Grapefruit','Quince'],
    heartNotes:['Jasmine','Rose'],
    baseNotes:['White Musk','Cedar','Amber'],
    description:'Airy and luminous — a sheer floral with a citrus sparkle and a whispery musk trail.' },
  { id:3,  name:'Peony & Blush Suede',   brand:'Jo Malone',             family:'floral',    year:2013, concentration:'Cologne', gender:'unisex',
    occasion:['date','wedding','everyday'], mood:['romantic','soft','feminine'],
    intensity:2, longevity:3, color:'#FFAABB', price:160,
    shopLink:'https://www.jomalone.com/collections/all-fragrances',
    topNotes:['Red Apple'],
    heartNotes:['Peony','Jasmine','Rose'],
    baseNotes:['Suede','Blush','Vetiver'],
    description:'Blush-pink petals wrapped in the softest suede — intimate, feminine, and utterly elegant.' },
  // ── ORIENTAL ─────────────────────────────────────────────────────────────────
  { id:4,  name:'Black Opium',            brand:'YSL',                   family:'oriental',  year:2014, concentration:'EDP', gender:'feminine',
    occasion:['night','date','fall'], mood:['seductive','bold','warm'],
    intensity:4, longevity:5, color:'#2D0040', price:120,
    shopLink:'https://www.yslbeauty.com/en-us/fragrances/women-fragrances',
    topNotes:['Pink Pepper','Orange Blossom','Pear'],
    heartNotes:['Coffee','Jasmine'],
    baseNotes:['Vanilla','Patchouli','Cashmere'],
    description:'Addictive black coffee and white florals over a warm vanilla cashmere base. A modern icon.' },
  { id:5,  name:'Black Orchid',           brand:'Tom Ford',              family:'oriental',  year:2006, concentration:'EDP', gender:'unisex',
    occasion:['night','date','winter'], mood:['seductive','dark','mysterious'],
    intensity:5, longevity:5, color:'#1A0028', price:195,
    shopLink:'https://www.tomford.com/fragrance',
    topNotes:['Truffle','Bergamot','Black Currant'],
    heartNotes:['Black Orchid','Ylang Ylang','Dark Spice'],
    baseNotes:['Sandalwood','Dark Chocolate','Incense'],
    description:'A shadowy, sensual masterpiece. Rich dark florals over truffle and chocolate — instantly iconic.' },
  { id:6,  name:'Flowerbomb',             brand:'Viktor & Rolf',         family:'oriental',  year:2005, concentration:'EDP', gender:'feminine',
    occasion:['date','night','winter'], mood:['romantic','warm','bold'],
    intensity:4, longevity:5, color:'#9B59B6', price:130,
    shopLink:'https://www.viktor-rolf.com/en/beauty/fragrance',
    topNotes:['Bergamot','Tea','Osmanthus'],
    heartNotes:['Jasmine','Rose','Freesia','Orchid'],
    baseNotes:['Patchouli','Musk','Vanilla'],
    description:'An explosion of lush florals that detonates into a warm, addictive oriental. Unforgettable.' },
  // ── WOODY ────────────────────────────────────────────────────────────────────
  { id:7,  name:'Oud Wood',               brand:'Tom Ford',              family:'woody',     year:2007, concentration:'EDP', gender:'unisex',
    occasion:['night','winter','date'], mood:['sophisticated','warm','mysterious'],
    intensity:4, longevity:5, color:'#5D4037', price:195,
    shopLink:'https://www.tomford.com/fragrance',
    topNotes:['Rosewood','Cardamom','Chinese Pepper'],
    heartNotes:['Oud','Sandalwood','Vetiver'],
    baseNotes:['Tonka Bean','Amber','Musk'],
    description:'Rare oud and sandalwood in perfect harmony. Instantly iconic, deeply sophisticated.' },
  { id:8,  name:'Jazz Club',              brand:'Maison Margiela Replica',family:'woody',    year:2013, concentration:'EDT', gender:'unisex',
    occasion:['night','fall','date'], mood:['sophisticated','nostalgic','warm'],
    intensity:3, longevity:3, color:'#795548', price:165,
    shopLink:'https://www.maisonmargiela.com/en-us/maison-margiela-fragrances/replica',
    topNotes:['Rum','Pink Pepper','Lemon'],
    heartNotes:['Tobacco','Vetiver','Clary Sage'],
    baseNotes:['Vanilla','Tonka Bean','Musk'],
    description:'A candlelit jazz bar: rum-soaked tobacco, warm spice, and a trailing vanilla smoke.' },
  { id:9,  name:'Mojave Ghost',           brand:'Byredo',                family:'woody',     year:2014, concentration:'EDP', gender:'unisex',
    occasion:['everyday','date','spring'], mood:['ethereal','clean','soft'],
    intensity:3, longevity:4, color:'#D4B896', price:210,
    shopLink:'https://www.byredo.com/en_us/fragrances',
    topNotes:['Ambrette','Nebula Wood'],
    heartNotes:['Magnolia','Violet','Sandalwood'],
    baseNotes:['Cedarwood','Amber','White Musk'],
    description:'Ghostly and sheer — pale desert flowers on warm dry wood. Minimalist and haunting.' },
  // ── FRESH ────────────────────────────────────────────────────────────────────
  { id:10, name:'Acqua di Giò',           brand:'Giorgio Armani',        family:'fresh',     year:1996, concentration:'EDT', gender:'masculine',
    occasion:['everyday','summer','office'], mood:['fresh','clean','aquatic'],
    intensity:2, longevity:3, color:'#64B5F6', price:85,
    shopLink:'https://www.giorgioarmani.com/en-us/beauty/fragrance',
    topNotes:['Calabrian Bergamot','Neroli','Green Tangerine'],
    heartNotes:['Jasmine','Rosemary','Persimmon'],
    baseNotes:['Patchouli','White Musk','Cedarwood'],
    description:'The quintessential aquatic fragrance. A Mediterranean breeze bottled — forever classic.' },
  { id:11, name:'Bleu de Chanel',         brand:'Chanel',                family:'fresh',     year:2010, concentration:'EDP', gender:'masculine',
    occasion:['everyday','office','date'], mood:['clean','sophisticated','fresh'],
    intensity:3, longevity:4, color:'#1565C0', price:150,
    shopLink:'https://www.chanel.com/us/fragrance',
    topNotes:['Grapefruit','Lemon','Pink Pepper'],
    heartNotes:['Ginger','Nutmeg','Jasmine'],
    baseNotes:['Incense','Sandalwood','White Musk'],
    description:'Effortlessly elegant. Fresh citrus and aromatic spices grounded in warm incense and wood.' },
  { id:12, name:'Cool Water',             brand:'Davidoff',              family:'fresh',     year:1988, concentration:'EDT', gender:'masculine',
    occasion:['everyday','summer','sport'], mood:['fresh','clean','aquatic'],
    intensity:2, longevity:2, color:'#29B6F6', price:55,
    shopLink:'https://www.sephora.com/brand/davidoff',
    topNotes:['Mint','Lavender','Green Nuances'],
    heartNotes:['Rosemary','Jasmine','Geranium'],
    baseNotes:['Sandalwood','Musk','Cedar'],
    description:'A timeless wave of cool aquatics and fresh herbs. Casual, clean, and carefree.' },
  // ── CITRUS ───────────────────────────────────────────────────────────────────
  { id:13, name:'Aventus',                brand:'Creed',                 family:'citrus',    year:2010, concentration:'EDP', gender:'masculine',
    occasion:['office','date','everyday'], mood:['powerful','fresh','sophisticated'],
    intensity:4, longevity:5, color:'#FF8F00', price:435,
    shopLink:'https://www.creedfragrances.com/collections/aventus',
    topNotes:['Pineapple','Bergamot','Black Currant','Apple'],
    heartNotes:['Birch','Patchouli','Rose','Jasmine'],
    baseNotes:['Oakmoss','Musk','Ambergris','Vanilla'],
    description:'Legendary. Smoky birch and sun-ripe pineapple on a commanding mossy base. Pure power.' },
  { id:14, name:'Light Blue',             brand:'Dolce & Gabbana',       family:'citrus',    year:2001, concentration:'EDT', gender:'feminine',
    occasion:['summer','everyday','beach'], mood:['fresh','light','carefree'],
    intensity:2, longevity:2, color:'#81D4FA', price:70,
    shopLink:'https://www.sephora.com/brand/dolce-gabbana',
    topNotes:['Sicilian Lemon','Apple','Cedar'],
    heartNotes:['Jasmine','White Rose','Bamboo'],
    baseNotes:['Cedar','Musk','Amberwood'],
    description:'Sun, sea, and Sicilian lemons. The definition of Mediterranean summer in a bottle.' },
  { id:15, name:'Un Jardin sur le Toit',  brand:'Hermès',                family:'citrus',    year:2011, concentration:'EDT', gender:'unisex',
    occasion:['spring','everyday','office'], mood:['fresh','green','peaceful'],
    intensity:2, longevity:3, color:'#A5D6A7', price:145,
    shopLink:'https://www.hermes.com/us/en/content/110316-fragrances.html',
    topNotes:['Apple','Pear','Grapefruit'],
    heartNotes:['Magnolia','Rose','White Lily'],
    baseNotes:['Grass','White Musk','Velvety Wood'],
    description:'A rooftop garden in Paris. Crisp apple, dewy florals, and warm sun-kissed grass.' },
  // ── GOURMAND ─────────────────────────────────────────────────────────────────
  { id:16, name:'Angel',                  brand:'Thierry Mugler',        family:'gourmand',  year:1992, concentration:'EDP', gender:'feminine',
    occasion:['night','fall','winter'], mood:['bold','warm','nostalgic'],
    intensity:5, longevity:5, color:'#7E57C2', price:110,
    shopLink:'https://www.mugler.com/en-us/fragrances',
    topNotes:['Bergamot','Melon','Mandarin'],
    heartNotes:['Red Berries','Orchid','Honey'],
    baseNotes:['Caramel','Patchouli','Dark Chocolate','Vanilla'],
    description:'The original gourmand — intoxicating caramel and chocolate swirled with dark patchouli.' },
  { id:17, name:'Mon Guerlain',           brand:'Guerlain',              family:'gourmand',  year:2017, concentration:'EDP', gender:'feminine',
    occasion:['everyday','spring','date'], mood:['soft','warm','romantic'],
    intensity:3, longevity:4, color:'#CE93D8', price:105,
    shopLink:'https://www.guerlain.com/us/en-us/c/fragrances.html',
    topNotes:['Bergamot','Lavender'],
    heartNotes:['Jasmine','Lavender Absolute'],
    baseNotes:['Tahitian Vanilla','Sandalwood','Coumarin'],
    description:'Dreamy lavender kissed by Tahitian vanilla — soft, warm, and utterly elegant.' },
  { id:18, name:'La Vie Est Belle',       brand:'Lancôme',               family:'gourmand',  year:2012, concentration:'EDP', gender:'feminine',
    occasion:['everyday','date','fall'], mood:['joyful','warm','feminine'],
    intensity:3, longevity:4, color:'#F48FB1', price:100,
    shopLink:'https://www.lancome.com/fragrance',
    topNotes:['Blackcurrant','Pear'],
    heartNotes:['Iris','Jasmine','Orange Blossom'],
    baseNotes:['Praline','Vanilla','Patchouli','Musk'],
    description:'The happiness fragrance — sweet iris and praline in a joyful, life-affirming bouquet.' },
]

const FAMILY_META: Record<Family, { label: string; emoji: string; color: string; bg: string }> = {
  floral:    { label:'Floral',    emoji:'🌸', color:'#E8B4B8', bg:'#FFF0F3' },
  oriental:  { label:'Oriental',  emoji:'🔮', color:'#9B59B6', bg:'#F5F0FF' },
  woody:     { label:'Woody',     emoji:'🌿', color:'#8B6914', bg:'#FFF8EE' },
  fresh:     { label:'Fresh',     emoji:'💎', color:'#2D9CDB', bg:'#F0F8FF' },
  citrus:    { label:'Citrus',    emoji:'🍋', color:'#F39C12', bg:'#FFFBF0' },
  gourmand:  { label:'Gourmand',  emoji:'🍫', color:'#8E44AD', bg:'#FBF0FF' },
}

function getSimilar(liked: number[]): Fragrance[] {
  if (!liked.length) return []
  const likedFrags = FRAGRANCES.filter(f => liked.includes(f.id))
  const likedNotes = new Set(likedFrags.flatMap(f => [...f.topNotes, ...f.heartNotes, ...f.baseNotes]))
  const likedFamilies = new Set(likedFrags.map(f => f.family))
  const likedOccasions = new Set(likedFrags.flatMap(f => f.occasion))
  const likedMoods = new Set(likedFrags.flatMap(f => f.mood))

  return FRAGRANCES
    .filter(f => !liked.includes(f.id))
    .map(f => {
      let score = 0
      if (likedFamilies.has(f.family)) score += 3
      ;[...f.topNotes, ...f.heartNotes, ...f.baseNotes].forEach(n => { if (likedNotes.has(n)) score += 2 })
      f.occasion.forEach(o => { if (likedOccasions.has(o)) score += 1 })
      f.mood.forEach(m => { if (likedMoods.has(m)) score += 1 })
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
  const meta = FAMILY_META[frag.family]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-200"
    >
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ background: frag.color }} />

      <div className="p-5" onClick={onClick}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-sans text-[9px] tracking-[0.15em] uppercase font-semibold" style={{ color: meta.color }}>
                {meta.emoji} {meta.label}
              </span>
              <span className="font-sans text-[9px] text-gray-400">· {frag.concentration}</span>
            </div>
            <h3 className="font-display text-base font-semibold text-gray-900">{frag.name}</h3>
            <p className="font-sans text-xs text-gray-400">{frag.brand}</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onToggle() }}
            className={`p-1.5 rounded-full transition-all duration-200 ${liked ? 'text-red-400 bg-red-50' : 'text-gray-300 hover:text-red-300 hover:bg-red-50'}`}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Notes pyramid */}
        <div className="space-y-2 mb-4">
          {[
            { label:'Top',   notes: frag.topNotes,   size:'text-[10px]', opacity:'opacity-60' },
            { label:'Heart', notes: frag.heartNotes,  size:'text-[11px]', opacity:'opacity-80' },
            { label:'Base',  notes: frag.baseNotes,   size:'text-xs',     opacity:'opacity-100' },
          ].map(({ label, notes, size, opacity }) => (
            <div key={label} className="flex items-start gap-2">
              <span className={`font-sans text-[9px] tracking-wider uppercase text-gray-400 w-9 flex-shrink-0 pt-0.5`}>{label}</span>
              <div className="flex flex-wrap gap-1">
                {notes.map(n => (
                  <span key={n} className={`font-sans ${size} ${opacity} text-gray-700 bg-gray-50 px-2 py-0.5 rounded-full`}>{n}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-sans text-[9px] text-gray-400 uppercase tracking-wider">Intensity</p>
              <IntensityDots value={frag.intensity} />
            </div>
            <div>
              <p className="font-sans text-[9px] text-gray-400 uppercase tracking-wider">Longevity</p>
              <IntensityDots value={frag.longevity} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-sans text-sm font-semibold text-gray-800">${frag.price}</p>
            <a href={frag.shopLink} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 bg-[#0f0f0f] text-white font-sans text-[10px] tracking-wider uppercase px-2.5 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
              Shop <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function FragranceDetail({ frag, liked, onToggle, onClose }: {
  frag: Fragrance; liked: boolean; onToggle: () => void; onClose: () => void
}) {
  const meta = FAMILY_META[frag.family]
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type:'spring', damping:28, stiffness:300 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Color bar */}
        <div className="h-2 w-full" style={{ background: frag.color }} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold" style={{ color: meta.color }}>
                {meta.emoji} {meta.label}
              </span>
              <h2 className="font-display text-2xl font-semibold text-gray-900 mt-0.5">{frag.name}</h2>
              <p className="font-sans text-sm text-gray-400">{frag.brand} · {frag.concentration} · {frag.year}</p>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Description */}
          <p className="font-sans text-sm text-gray-600 leading-relaxed mb-5 italic">&ldquo;{frag.description}&rdquo;</p>

          {/* Notes pyramid — larger */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-3">
            <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-3">Fragrance Notes</p>
            {[
              { label:'Top Notes',   notes: frag.topNotes,   sub:'First impression · fades in 30 min' },
              { label:'Heart Notes', notes: frag.heartNotes,  sub:'Character · lasts 30 min – 3 hrs' },
              { label:'Base Notes',  notes: frag.baseNotes,   sub:'Soul · lingers for hours' },
            ].map(({ label, notes, sub }) => (
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

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label:'Intensity', value: frag.intensity },
              { label:'Longevity', value: frag.longevity },
              { label:'Price', custom: `$${frag.price}` },
            ].map(({ label, value, custom }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
                {custom ? (
                  <p className="font-sans text-sm font-semibold text-gray-900">{custom}</p>
                ) : (
                  <div className="flex gap-1 justify-center">
                    <IntensityDots value={value!} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {[...frag.occasion, ...frag.mood].map(t => (
              <span key={t} className="font-sans text-[10px] text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full capitalize">{t}</span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onToggle}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-sans text-xs tracking-wider uppercase transition-all ${
                liked
                  ? 'border-red-200 bg-red-50 text-red-400'
                  : 'border-gray-200 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-400'
              }`}
            >
              <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
              {liked ? 'Liked' : 'Like'}
            </button>
            <a
              href={frag.shopLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#0f0f0f] text-white font-sans text-xs tracking-[0.15em] uppercase py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              Shop Now <ExternalLink size={13} />
            </a>
          </div>
          <p className="font-sans text-[10px] text-gray-400 text-center mt-3">
            Opens official brand website · Heart to find similar scents
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function FragrancePage() {
  const [liked, setLiked] = useState<number[]>([])
  const [activeFamily, setActiveFamily] = useState<'all' | Family>('all')
  const [selected, setSelected] = useState<Fragrance | null>(null)

  const toggle = (id: number) => setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const filtered = useMemo(() =>
    activeFamily === 'all' ? FRAGRANCES : FRAGRANCES.filter(f => f.family === activeFamily),
    [activeFamily]
  )

  const similar = useMemo(() => getSimilar(liked), [liked])

  const families: ('all' | Family)[] = ['all', 'floral', 'oriental', 'woody', 'fresh', 'citrus', 'gourmand']

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-[88px]">
      {/* Header */}
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

        {/* Hero banner */}
        <div className="relative bg-gradient-to-r from-[#0f0f0f] to-[#2D1B0E] rounded-2xl overflow-hidden mb-8 p-8">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #C9A96E 0%, transparent 60%)' }} />
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#C9A96E] mb-2">Discover Your Signature</p>
          <h2 className="font-display text-3xl text-white font-medium mb-2">Find Your Scent</h2>
          <p className="font-sans text-sm text-gray-400 max-w-sm leading-relaxed">
            Browse 18 iconic fragrances with full note breakdowns. Heart the ones you love and we&apos;ll find your perfect matches.
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

        {/* Similar fragrances (shown when liked) */}
        <AnimatePresence>
          {similar.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl p-6 border border-[#C9A96E]/20">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={15} className="text-[#C9A96E]" />
                  <p className="font-display text-lg font-semibold text-gray-900">Matched for You</p>
                  <p className="font-sans text-xs text-gray-400">Based on your {liked.length} liked fragrance{liked.length > 1 ? 's' : ''}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {similar.map(frag => {
                    const meta = FAMILY_META[frag.family]
                    return (
                      <div key={frag.id} className="bg-white rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-[#C9A96E]/40">
                        <div className="h-1 rounded-full mb-3" style={{ background: frag.color }} />
                        <p className="font-sans text-[9px] tracking-wider uppercase mb-1" style={{ color: meta.color }}>
                          {meta.emoji} {meta.label}
                        </p>
                        <button onClick={() => setSelected(frag)} className="text-left w-full">
                          <p className="font-display text-sm font-semibold text-gray-900 leading-tight">{frag.name}</p>
                          <p className="font-sans text-xs text-gray-400 mt-0.5">{frag.brand}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {frag.heartNotes.slice(0, 2).map(n => (
                              <span key={n} className="font-sans text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-full">{n}</span>
                            ))}
                          </div>
                        </button>
                        <a href={frag.shopLink} target="_blank" rel="noopener noreferrer"
                          className="mt-3 flex items-center justify-center gap-1 w-full bg-[#0f0f0f] text-white font-sans text-[10px] tracking-wider uppercase py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                          Shop <ExternalLink size={9} />
                        </a>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Family filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {families.map(fam => {
            const isAll = fam === 'all'
            const meta = isAll ? null : FAMILY_META[fam as Family]
            const isActive = activeFamily === fam
            return (
              <button key={fam} onClick={() => setActiveFamily(fam)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-sans text-xs tracking-wider uppercase transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0f0f0f] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {isAll ? '✦' : meta!.emoji}
                {isAll ? 'All' : meta!.label}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(frag => (
              <FragranceCard
                key={frag.id}
                frag={frag}
                liked={liked.includes(frag.id)}
                onToggle={() => toggle(frag.id)}
                onClick={() => setSelected(frag)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <FragranceDetail
            frag={selected}
            liked={liked.includes(selected.id)}
            onToggle={() => toggle(selected.id)}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
