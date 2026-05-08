'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, RotateCcw, Sun, Moon, Check, Sparkles } from 'lucide-react'

type SkinType = 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive'

interface Option { label: string; icon: string; scores: Partial<Record<SkinType, number>> }
interface Question { id: string; q: string; sub?: string; multi?: boolean; maxSelect?: number; options: Option[] }

const QUESTIONS: Question[] = [
  {
    id: 'feel', q: 'How does your skin feel a few hours after cleansing?',
    sub: 'No products applied — just bare skin',
    options: [
      { label: 'Very tight and uncomfortable', icon: '🌵', scores: { dry: 3 } },
      { label: 'Comfortable and balanced',     icon: '✨', scores: { normal: 3 } },
      { label: 'Oily in T-zone, dry on cheeks',icon: '⚖️', scores: { combination: 3 } },
      { label: 'Oily all over',                icon: '💧', scores: { oily: 3 } },
      { label: 'Itchy, red, or irritated',     icon: '🌸', scores: { sensitive: 3 } },
    ],
  },
  {
    id: 'look', q: 'How does your skin look by midday?',
    options: [
      { label: 'Dull, flaky, or tight',              icon: '🍂', scores: { dry: 3 } },
      { label: 'Fresh and even-toned',               icon: '🌟', scores: { normal: 3 } },
      { label: 'Shiny on forehead and nose only',    icon: '〰️', scores: { combination: 3 } },
      { label: 'Shiny and greasy everywhere',        icon: '💦', scores: { oily: 3 } },
      { label: 'Blotchy, uneven, or flushed',        icon: '🌹', scores: { sensitive: 3 } },
    ],
  },
  {
    id: 'breakouts', q: 'How often do you experience breakouts?',
    options: [
      { label: 'Rarely or never',                    icon: '😊', scores: { normal: 2, dry: 1 } },
      { label: 'Occasionally — a few times a year',  icon: '🙂', scores: { normal: 2, combination: 1 } },
      { label: 'Monthly or around my period',        icon: '📅', scores: { combination: 3 } },
      { label: 'Often — several times a month',      icon: '😕', scores: { oily: 3 } },
      { label: 'Almost constantly',                  icon: '😓', scores: { oily: 2, sensitive: 1 } },
    ],
  },
  {
    id: 'reaction', q: 'How does your skin react to new products?',
    options: [
      { label: 'Absorbs everything well, no issues', icon: '👍', scores: { normal: 2, oily: 1 } },
      { label: 'Needs rich formulas or feels tight',  icon: '🧴', scores: { dry: 3 } },
      { label: 'T-zone gets oily, cheeks stay dry',  icon: '⚖️', scores: { combination: 3 } },
      { label: 'Gets shiny quickly regardless',      icon: '✦', scores: { oily: 3 } },
      { label: 'Often stings, burns, or breaks out', icon: '⚠️', scores: { sensitive: 4 } },
    ],
  },
  {
    id: 'pores', q: 'How do your pores appear?',
    options: [
      { label: 'Nearly invisible, skin looks smooth',icon: '🔍', scores: { dry: 2, normal: 1 } },
      { label: 'Small and refined overall',          icon: '✦', scores: { normal: 3 } },
      { label: 'Visible on nose and forehead only',  icon: '◎', scores: { combination: 3 } },
      { label: 'Enlarged, especially around nose',   icon: '◉', scores: { oily: 3 } },
      { label: 'Hard to tell — skin is always reactive', icon: '🌀', scores: { sensitive: 2, combination: 1 } },
    ],
  },
  {
    id: 'weather', q: 'How does your skin behave in cold or dry weather?',
    options: [
      { label: 'Extremely tight, may crack or peel', icon: '❄️', scores: { dry: 3 } },
      { label: 'Slightly drier but manageable',      icon: '🌬️', scores: { normal: 2, combination: 1 } },
      { label: 'Dry patches appear but T-zone stays oily', icon: '🌡️', scores: { combination: 3 } },
      { label: 'Barely notice any change',           icon: '😌', scores: { oily: 2, normal: 1 } },
      { label: 'Redness and flare-ups get worse',    icon: '🥶', scores: { sensitive: 3 } },
    ],
  },
  {
    id: 'concerns', q: 'What are your top skin concerns?',
    sub: 'Pick up to 2',
    multi: true, maxSelect: 2,
    options: [
      { label: 'Dryness & flakiness',         icon: '🌵', scores: { dry: 2 } },
      { label: 'Excess oil & shine',           icon: '💧', scores: { oily: 2 } },
      { label: 'Acne & breakouts',             icon: '🔴', scores: { oily: 1, sensitive: 1 } },
      { label: 'Fine lines & aging',           icon: '🕰️', scores: { dry: 1 } },
      { label: 'Uneven tone & dark spots',     icon: '🌓', scores: { combination: 1, dry: 1 } },
      { label: 'Redness & sensitivity',        icon: '🌸', scores: { sensitive: 2 } },
      { label: 'Dullness & lack of glow',      icon: '✨', scores: { normal: 1, dry: 1 } },
      { label: 'Large pores & texture',        icon: '◉', scores: { oily: 1, combination: 1 } },
    ],
  },
]

interface RoutineStep { step: number; name: string; why: string; eg: string }
interface SkinProfile {
  type: string; badge: string; tagline: string; accent: string
  description: string; traits: string[]
  love: string[]; avoid: string[]
  am: RoutineStep[]; pm: RoutineStep[]
}

const RESULTS: Record<SkinType, SkinProfile> = {
  dry: {
    type: 'Dry Skin', badge: '🌵',
    tagline: 'Your skin craves moisture and nourishment',
    accent: '#C9A96E',
    description: 'Your skin produces less sebum than normal, leaving it prone to tightness, dullness, and early fine lines. The bright side? Dry skin ages beautifully with a consistent hydrating routine. Focus on sealing in moisture at every step.',
    traits: ['Tight feeling after cleansing', 'Dull or flaky patches', 'Nearly invisible pores', 'Prone to fine lines', 'Sensitive to cold and wind'],
    love: ['Hyaluronic Acid', 'Ceramides', 'Squalane', 'Glycerin', 'Shea Butter', 'Peptides'],
    avoid: ['Alcohol-heavy toners', 'Harsh foaming cleansers', 'Over-exfoliation', 'Matte formulas'],
    am: [
      { step:1, name:'Cream or Milk Cleanser',        why:'Cleanses without stripping natural oils',        eg:'CeraVe Hydrating Cleanser' },
      { step:2, name:'Hydrating Toner or Essence',    why:'First layer of moisture right after cleansing',  eg:'Hada Labo Gokujyun Lotion' },
      { step:3, name:'Hyaluronic Acid Serum',          why:'Draws and locks water deep into skin',           eg:'The Ordinary HA 2% + B5' },
      { step:4, name:'Rich Nourishing Moisturizer',    why:'Seals in all layers and repairs barrier',        eg:'La Roche-Posay Toleriane Rich' },
      { step:5, name:'SPF 30–50',                      why:'Protects and prevents premature aging',          eg:'EltaMD UV Clear SPF 46' },
    ],
    pm: [
      { step:1, name:'Oil or Balm Cleanser',           why:'Removes makeup while nourishing skin',          eg:'DHC Deep Cleansing Oil' },
      { step:2, name:'Hydrating Essence',              why:'Extra moisture boost before actives',            eg:'SK-II Facial Treatment Essence' },
      { step:3, name:'Peptide or Retinol Serum',       why:'Supports collagen production overnight',         eg:'The Inkey List Retinol' },
      { step:4, name:'Sleeping Mask or Night Cream',   why:'Deep overnight repair and plumping',             eg:'Laneige Water Sleeping Mask' },
    ],
  },
  oily: {
    type: 'Oily Skin', badge: '💧',
    tagline: 'Balance sebum — don\'t strip it',
    accent: '#2D9CDB',
    description: 'Your sebaceous glands are hyperactive, producing excess oil that leads to shine, clogged pores, and breakouts. The upside is that oily skin tends to age more slowly. The goal is regulation — not stripping — with lightweight, pore-refining ingredients.',
    traits: ['Shiny by midday', 'Enlarged pores', 'Prone to blackheads', 'Makeup doesn\'t last', 'Fewer wrinkles long-term'],
    love: ['Niacinamide', 'Salicylic Acid (BHA)', 'AHAs', 'Zinc', 'Clay', 'Retinol'],
    avoid: ['Heavy occlusive creams', 'Coconut oil', 'Thick butters', 'Skipping moisturizer', 'Over-washing'],
    am: [
      { step:1, name:'Foaming or Gel Cleanser',        why:'Removes excess oil without over-drying',         eg:'La Roche-Posay Effaclar' },
      { step:2, name:'Niacinamide Toner',              why:'Minimizes pores and regulates sebum',            eg:'Paula\'s Choice BHA Liquid Exfoliant' },
      { step:3, name:'Lightweight Niacinamide Serum',  why:'Reduces oil production and brightens',           eg:'The Ordinary Niacinamide 10% + Zinc' },
      { step:4, name:'Oil-Free Gel Moisturizer',       why:'Hydrates without adding shine',                  eg:'Neutrogena Hydro Boost Gel' },
      { step:5, name:'Matte Finish SPF',               why:'Protects without greasiness',                    eg:'Supergoop Unseen Sunscreen' },
    ],
    pm: [
      { step:1, name:'Micellar Water + Gel Cleanser',  why:'Double-cleanse thoroughly clears pores',         eg:'Bioderma Sensibio H2O' },
      { step:2, name:'BHA Exfoliant (2–3×/week)',      why:'Unclogs pores and prevents breakouts',           eg:'Paula\'s Choice 2% BHA Liquid' },
      { step:3, name:'Retinol Serum',                  why:'Refines pores and controls oil long-term',       eg:'Differin Adapalene Gel' },
      { step:4, name:'Light Gel Moisturizer',          why:'Hydrates overnight without clogging pores',      eg:'Belif Aqua Bomb Sleeping Mask' },
    ],
  },
  combination: {
    type: 'Combination Skin', badge: '⚖️',
    tagline: 'Two zones, one balanced routine',
    accent: '#9B59B6',
    description: 'Your T-zone (forehead, nose, chin) overproduces oil while your cheeks tend toward dryness. This is the most common skin type. The goal is balance — hydrate the dry areas while controlling shine in the T-zone without over-stripping either.',
    traits: ['Oily T-zone, drier cheeks', 'Visible pores on nose', 'Breakouts on forehead or chin', 'Uneven texture', 'Foundation wears unevenly'],
    love: ['Niacinamide', 'Hyaluronic Acid', 'Gentle AHAs', 'Ceramides', 'Lightweight Moisturizers'],
    avoid: ['Heavy creams on T-zone', 'Harsh astringents', 'Mattifying everything', 'Skipping cheek hydration'],
    am: [
      { step:1, name:'Gentle Gel or Foam Cleanser',    why:'Balanced cleanse for both zones',                eg:'Cetaphil Gentle Skin Cleanser' },
      { step:2, name:'Balancing Hydrating Toner',      why:'Preps without over-drying or adding oil',        eg:'Thayers Witch Hazel Toner' },
      { step:3, name:'Niacinamide + HA Serum',         why:'Controls T-zone while hydrating cheeks',         eg:'The Inkey List Niacinamide Serum' },
      { step:4, name:'Lightweight Moisturizer',        why:'Hydrates cheeks without overloading T-zone',     eg:'Clinique Dramatically Different Gel' },
      { step:5, name:'SPF 30+',                        why:'Daily protection for both zones',                eg:'Altruist Face Fluid SPF 50' },
    ],
    pm: [
      { step:1, name:'Micellar Water → Gel Cleanser',  why:'Double-cleanse removes all traces thoroughly',   eg:'Simple Kind-to-Skin Micellar Water' },
      { step:2, name:'AHA Toner (2–3×/week)',          why:'Gently exfoliates texture and unclogs pores',    eg:'The Ordinary Glycolic Toning Solution' },
      { step:3, name:'Vitamin C or Retinol Serum',     why:'Brightens tone and evens complexion',            eg:'The Ordinary Vitamin C Suspension' },
      { step:4, name:'Medium-Weight Night Moisturizer',why:'Repairs and balances both zones overnight',      eg:'Olay Regenerist Night Cream' },
    ],
  },
  normal: {
    type: 'Normal Skin', badge: '✨',
    tagline: 'Balanced and resilient — protect what you have',
    accent: '#E8B4B8',
    description: 'You produce just the right amount of sebum and have a healthy moisture balance. Your focus is maintenance and prevention. A consistent routine with antioxidants, SPF, and early anti-aging will keep your skin radiant for decades.',
    traits: ['Comfortable, not oily or dry', 'Even texture and tone', 'Small, barely visible pores', 'Rarely breaks out', 'Adapts well to most products'],
    love: ['Vitamin C', 'SPF', 'Retinol', 'Antioxidants', 'Gentle exfoliants', 'Peptides'],
    avoid: ['Skipping SPF', 'Over-exfoliating', 'Ignoring early prevention', 'Harsh unnecessary treatments'],
    am: [
      { step:1, name:'Gentle Cleanser (any texture)',  why:'Clean slate without disturbing natural balance',  eg:'Cetaphil Gentle Cleanser' },
      { step:2, name:'Vitamin C Antioxidant Serum',    why:'Protects against pollution and brightens',        eg:'TruSkin Vitamin C Serum' },
      { step:3, name:'Light Moisturizer',              why:'Hydrates and maintains your skin barrier',        eg:'Embryolisse Lait-Crème Concentré' },
      { step:4, name:'SPF 30–50',                      why:'Non-negotiable armor against aging',              eg:'Bioré UV Aqua Rich SPF 50' },
    ],
    pm: [
      { step:1, name:'Cleansing Oil or Micellar Water',why:'Gentle removal of SPF and daily impurities',     eg:'Bioderma Sensibio H2O' },
      { step:2, name:'Hydrating Toner or Mist',        why:'Preps skin to absorb serums better',             eg:'Avène Thermal Spring Water' },
      { step:3, name:'Retinol Serum (start low)',       why:'Proactive anti-aging at any age',                eg:'CeraVe Resurfacing Retinol Serum' },
      { step:4, name:'Nourishing Night Moisturizer',   why:'Locks in repair and hydration overnight',        eg:'First Aid Beauty Ultra Repair Cream' },
    ],
  },
  sensitive: {
    type: 'Sensitive Skin', badge: '🌸',
    tagline: 'Less is more — gentle and consistent wins',
    accent: '#F4878A',
    description: 'Your skin reacts easily to products, environmental changes, and stress. Redness, stinging, and flare-ups are your regulars. A minimal, fragrance-free routine focused on barrier repair is your golden rule. Every new product should be patch-tested first.',
    traits: ['Redness and flushing', 'Stings or burns with new products', 'Tight after cleansing', 'Visible capillaries', 'Reacts to fragrance and alcohol'],
    love: ['Ceramides', 'Centella Asiatica', 'Aloe Vera', 'Niacinamide', 'Allantoin', 'Panthenol'],
    avoid: ['Fragrance & essential oils', 'Alcohol', 'Strong AHAs/BHAs', 'Benzoyl peroxide', 'Physical scrubs'],
    am: [
      { step:1, name:'Fragrance-Free Cream Cleanser',  why:'Cleanses without aggravating reactivity',         eg:'Vanicream Gentle Facial Cleanser' },
      { step:2, name:'Centella Asiatica Toner',        why:'Calms redness and strengthens the barrier',       eg:'COSRX Centella Water Toner' },
      { step:3, name:'Ceramide or Niacinamide Serum',  why:'Repairs barrier and reduces redness',             eg:'CeraVe PM Facial Moisturizing Lotion' },
      { step:4, name:'Barrier Repair Moisturizer',     why:'Soothes and protects against irritants',          eg:'La Roche-Posay Cicaplast Baume B5' },
      { step:5, name:'Mineral SPF (zinc-based)',       why:'Least irritating SPF — sits on skin, not in it',  eg:'EltaMD UV Physical SPF 41' },
    ],
    pm: [
      { step:1, name:'Fragrance-Free Micellar Water',  why:'Removes makeup with zero friction or irritants',  eg:'Bioderma Sensibio H2O' },
      { step:2, name:'Calming Essence or Aloe Toner',  why:'Soothes and hydrates sensitised skin',            eg:'Klairs Supple Preparation Toner' },
      { step:3, name:'Bakuchiol Serum',                why:'Gentle retinol alternative — no irritation',      eg:'Herbivore Bakuchiol Retinol Alternative' },
      { step:4, name:'Occlusive Night Cream or Balm',  why:'Protective barrier seal while you sleep',         eg:'Weleda Skin Food Original' },
    ],
  },
}

function computeSkinType(answers: (string | string[])[]): SkinType {
  const scores: Record<SkinType, number> = { dry:0, oily:0, combination:0, normal:0, sensitive:0 }
  answers.forEach((ans, qi) => {
    const q = QUESTIONS[qi]
    const labels = Array.isArray(ans) ? ans : [ans]
    labels.forEach(label => {
      const opt = q.options.find(o => o.label === label)
      if (opt) Object.entries(opt.scores).forEach(([k, v]) => { scores[k as SkinType] += v as number })
    })
  })
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as SkinType
}

const ACCENT_GRADIENTS: Record<SkinType, string> = {
  dry:         'from-amber-50 via-orange-50 to-yellow-50',
  oily:        'from-teal-50 via-cyan-50 to-blue-50',
  combination: 'from-purple-50 via-fuchsia-50 to-pink-50',
  normal:      'from-rose-50 via-pink-50 to-amber-50',
  sensitive:   'from-pink-50 via-rose-50 to-red-50',
}

export default function SkincareDiagnosisPage() {
  const [step, setStep] = useState<'intro' | number | 'result'>('intro')
  const [answers, setAnswers] = useState<(string | string[])[]>([])
  const [dir, setDir] = useState(1)
  const [skinType, setSkinType] = useState<SkinType | null>(null)
  const [routineTab, setRoutineTab] = useState<'am' | 'pm'>('am')

  const currentQ = typeof step === 'number' ? QUESTIONS[step] : null
  const currentAnswer = typeof step === 'number' ? (answers[step] ?? (currentQ?.multi ? [] : '')) : ''

  const canProceed = () => {
    if (!currentQ) return false
    if (currentQ.multi) return (currentAnswer as string[]).length > 0
    return (currentAnswer as string) !== ''
  }

  const toggleMulti = (label: string) => {
    if (typeof step !== 'number') return
    const q = QUESTIONS[step]
    const prev = (answers[step] as string[]) ?? []
    let next: string[]
    if (prev.includes(label)) {
      next = prev.filter(l => l !== label)
    } else if (prev.length < (q.maxSelect ?? 99)) {
      next = [...prev, label]
    } else {
      next = [...prev.slice(1), label]
    }
    setAnswers(a => { const n = [...a]; n[step] = next; return n })
  }

  const selectSingle = (label: string) => {
    if (typeof step !== 'number') return
    setAnswers(a => { const n = [...a]; n[step] = label; return n })
  }

  const goNext = () => {
    if (typeof step !== 'number') return
    const nextStep = step + 1
    setDir(1)
    if (nextStep >= QUESTIONS.length) {
      const type = computeSkinType(answers)
      setSkinType(type)
      setStep('result')
    } else {
      setStep(nextStep)
    }
  }

  const goBack = () => {
    setDir(-1)
    if (step === 0) setStep('intro')
    else if (typeof step === 'number') setStep(step - 1)
  }

  const restart = () => {
    setAnswers([]); setSkinType(null); setRoutineTab('am'); setDir(-1); setStep('intro')
  }

  const profile = skinType ? RESULTS[skinType] : null

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-[88px]">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-gray-400">Glamour AI</p>
            <h1 className="font-display text-2xl font-semibold text-gray-900">Skin Diagnosis</h1>
          </div>
        </div>

        {/* Progress bar — only during quiz */}
        {typeof step === 'number' && (
          <div className="mt-6 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans text-[11px] text-gray-400">Question {step + 1} of {QUESTIONS.length}</span>
              <span className="font-sans text-[11px] text-gray-400">{Math.round(((step + 1) / QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#C9A96E] rounded-full"
                animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait" initial={false}>

          {/* INTRO */}
          {step === 'intro' && (
            <motion.div key="intro"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-amber-50 to-rose-50 px-8 py-12 text-center">
                  <div className="text-6xl mb-4">🧴</div>
                  <h2 className="font-display text-3xl font-semibold text-gray-900 mb-3">Know Your Skin</h2>
                  <p className="font-sans text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Answer 7 quick questions and get a complete skin type diagnosis with a personalised AM + PM routine.
                  </p>
                </div>
                <div className="px-8 py-8">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                      { icon: '⏱️', label: '2 minutes' },
                      { icon: '🎯', label: '5 skin types' },
                      { icon: '💊', label: 'Full routine' },
                    ].map(({ icon, label }) => (
                      <div key={label} className="text-center bg-gray-50 rounded-xl p-4">
                        <div className="text-2xl mb-1">{icon}</div>
                        <p className="font-sans text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => { setDir(1); setStep(0) }}
                    className="w-full bg-[#0f0f0f] text-white font-sans text-xs tracking-[0.15em] uppercase py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} />
                    Start My Skin Analysis
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* QUESTIONS */}
          {typeof step === 'number' && currentQ && (
            <motion.div key={`q-${step}`}
              initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.35 }}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <p className="font-display text-xl font-medium text-gray-900 mb-1">{currentQ.q}</p>
                {currentQ.sub && (
                  <p className="font-sans text-xs text-gray-400 mb-6">{currentQ.sub}</p>
                )}
                {!currentQ.sub && <div className="mb-6" />}

                <div className={`grid gap-3 ${currentQ.multi ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {currentQ.options.map(opt => {
                    const isSelected = currentQ.multi
                      ? (currentAnswer as string[]).includes(opt.label)
                      : currentAnswer === opt.label
                    return (
                      <button
                        key={opt.label}
                        onClick={() => currentQ.multi ? toggleMulti(opt.label) : selectSingle(opt.label)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-[#C9A96E] bg-amber-50/60 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-xl flex-shrink-0">{opt.icon}</span>
                        <span className="font-sans text-sm text-gray-700 leading-snug">{opt.label}</span>
                        {isSelected && (
                          <span className="ml-auto flex-shrink-0">
                            <Check size={14} className="text-[#C9A96E]" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={goBack}
                    className="px-5 py-3 border border-gray-200 text-gray-500 font-sans text-xs tracking-wider uppercase rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <ChevronLeft size={14} />Back
                  </button>
                  <button onClick={goNext} disabled={!canProceed()}
                    className="flex-1 bg-[#0f0f0f] text-white font-sans text-xs tracking-[0.15em] uppercase py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {step === QUESTIONS.length - 1 ? 'Get My Results' : 'Next'}
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS */}
          {step === 'result' && profile && skinType && (
            <motion.div key="result"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5 }}
            >
              {/* Hero */}
              <div className={`bg-gradient-to-br ${ACCENT_GRADIENTS[skinType]} rounded-2xl p-8 mb-5 text-center`}>
                <div className="text-5xl mb-3">{profile.badge}</div>
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1">Your skin type</p>
                <h2 className="font-display text-3xl font-semibold text-gray-900 mb-2">{profile.type}</h2>
                <p className="font-sans text-sm text-gray-500 italic">{profile.tagline}</p>
              </div>

              {/* Description + traits */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                <p className="font-sans text-sm text-gray-600 leading-relaxed mb-5">{profile.description}</p>
                <div className="flex flex-wrap gap-2">
                  {profile.traits.map(t => (
                    <span key={t} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full font-sans text-xs text-gray-600">{t}</span>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-green-600 font-semibold mb-3">✓ Your Skin Loves</p>
                  <div className="flex flex-col gap-2">
                    {profile.love.map(i => (
                      <span key={i} className="font-sans text-xs text-gray-700">• {i}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-red-500 font-semibold mb-3">✗ Avoid These</p>
                  <div className="flex flex-col gap-2">
                    {profile.avoid.map(i => (
                      <span key={i} className="font-sans text-xs text-gray-700">• {i}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Routine */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
                <div className="flex border-b border-gray-100">
                  {(['am', 'pm'] as const).map(tab => (
                    <button key={tab} onClick={() => setRoutineTab(tab)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 font-sans text-xs tracking-[0.15em] uppercase transition-colors ${
                        routineTab === tab ? 'bg-[#0f0f0f] text-white' : 'text-gray-500 hover:bg-gray-50'
                      }`}>
                      {tab === 'am' ? <Sun size={14} /> : <Moon size={14} />}
                      {tab === 'am' ? 'Morning Routine' : 'Evening Routine'}
                    </button>
                  ))}
                </div>
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div key={routineTab}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      {(routineTab === 'am' ? profile.am : profile.pm).map((s, idx) => (
                        <div key={s.step} className="flex gap-4">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0f0f0f] text-white flex items-center justify-center font-sans text-[11px] font-semibold">
                            {s.step}
                          </div>
                          <div className="flex-1 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                            <p className="font-sans text-sm font-semibold text-gray-900">{s.name}</p>
                            <p className="font-sans text-xs text-gray-400 mt-0.5">{s.why}</p>
                            <p className="font-sans text-[11px] text-[#C9A96E] mt-1">Try: {s.eg}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={restart}
                  className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-500 font-sans text-xs tracking-wider uppercase rounded-xl hover:bg-gray-50 transition-colors">
                  <RotateCcw size={13} />Retake
                </button>
                <Link href="/products?category=skincare"
                  className="flex-1 text-center bg-[#0f0f0f] text-white font-sans text-xs tracking-[0.15em] uppercase py-3 rounded-xl hover:bg-gray-800 transition-colors">
                  Shop Skincare
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
