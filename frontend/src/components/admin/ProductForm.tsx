'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { adminApi } from '@/lib/adminApi'
import { ChevronLeft, Camera, X, Plus, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FragranceNotes {
  top: string[]
  middle: string[]
  base: string[]
  longevity: string
  sillage: string
  gender: string
  family: string
}

export interface ProductFormValues {
  name: string
  shortDescription: string
  description: string
  price: string
  compareAtPrice: string
  stockQuantity: string
  sku: string
  categoryId: string
  brandId: string
  primaryImage: string
  isFeatured: boolean
  isActive: boolean
  tags: string[]
  fragranceNotes: FragranceNotes
}

interface ProductFormProps {
  /** undefined = create mode; string uuid = edit mode */
  productId?: string
  initialValues?: ProductFormValues
  title: string
  submitLabel: string
  onSubmit: (values: ProductFormValues) => Promise<void>
}

const EMPTY_FRAGRANCE: FragranceNotes = {
  top: [], middle: [], base: [], longevity: '', sillage: '', gender: '', family: '',
}

const FRAGRANCE_SLUGS = ['fragrance', 'eau-de-parfum', 'eau-de-toilette', 'cologne', 'perfume']

const EMPTY: ProductFormValues = {
  name: '', shortDescription: '', description: '',
  price: '', compareAtPrice: '', stockQuantity: '50',
  sku: '', categoryId: '', brandId: '',
  primaryImage: '', isFeatured: false, isActive: true, tags: [],
  fragranceNotes: EMPTY_FRAGRANCE,
}

// ── Toggle helper ─────────────────────────────────────────────────────────────

function Toggle({ on, onChange, label, sub }: { on: boolean; onChange: () => void; label: string; sub: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <button
        type="button"
        onClick={onChange}
        className={`w-9 h-5 rounded-full relative transition-colors mt-0.5 flex-shrink-0
          ${on ? 'bg-gray-900' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
          ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
      <div>
        <p className="font-sans text-sm text-gray-700 leading-tight">{label}</p>
        <p className="font-sans text-[10px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </label>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProductForm({ initialValues, title, submitLabel, onSubmit }: ProductFormProps) {
  const router = useRouter()

  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands]         = useState<any[]>([])
  const [saving, setSaving]         = useState(false)
  const [tagInput, setTagInput]     = useState('')
  const [imageEditing, setImageEditing] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Fragrance note inputs (one per row: top / middle / base)
  const [noteInputs, setNoteInputs] = useState({ top: '', middle: '', base: '' })

  // New-brand panel
  const [showNewBrand, setShowNewBrand]     = useState(false)
  const [newBrand, setNewBrand]             = useState({ name: '', country: '' })
  const [creatingBrand, setCreatingBrand]   = useState(false)

  const [form, setForm] = useState<ProductFormValues>(initialValues ?? EMPTY)

  // When initialValues arrive (edit mode), populate form
  useEffect(() => {
    if (initialValues) setForm(initialValues)
  }, [initialValues])

  useEffect(() => {
    adminApi.getCategories()
      .then(d => setCategories(d.categories || []))
      .catch(() => toast.error('Could not load categories'))
    adminApi.getBrands()
      .then(d => setBrands(d.brands || []))
      .catch(() => toast.error('Could not load brands'))
  }, [])

  const set = (key: keyof ProductFormValues, value: any) =>
    setForm(f => ({ ...f, [key]: value }))

  // Detect if fragrance category is selected
  const selectedCat = categories.find(c => String(c.id) === form.categoryId)
  const isFragrance = selectedCat
    ? FRAGRANCE_SLUGS.some(s => selectedCat.slug?.includes(s) || selectedCat.name?.toLowerCase().includes('fragrance') || selectedCat.name?.toLowerCase().includes('parfum') || selectedCat.name?.toLowerCase().includes('cologne'))
    : false

  const setFn = (key: keyof FragranceNotes, value: any) =>
    setForm(f => ({ ...f, fragranceNotes: { ...f.fragranceNotes, [key]: value } }))

  const commitNote = (row: 'top' | 'middle' | 'base') => {
    const val = noteInputs[row].trim()
    if (!val) return
    const notes = val.split(',').map(n => n.trim()).filter(Boolean)
    const existing = form.fragranceNotes[row]
    const merged = [...existing, ...notes.filter(n => !existing.includes(n))]
    setFn(row, merged)
    setNoteInputs(n => ({ ...n, [row]: '' }))
  }

  // ── Tags ──────────────────────────────────────────────────────────────────
  const commitTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (!t || form.tags.includes(t)) { setTagInput(''); return }
    set('tags', [...form.tags, t])
    setTagInput('')
  }

  // ── Inline brand creation ─────────────────────────────────────────────────
  const handleCreateBrand = async () => {
    if (!newBrand.name.trim()) return
    setCreatingBrand(true)
    try {
      const token = Cookies.get('admin_token')
      const res = await fetch(`${API_URL}/admin/brands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: newBrand.name.trim(), country: newBrand.country.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create brand')
      const created = data.brand
      setBrands(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      set('brandId', String(created.id))
      setShowNewBrand(false)
      setNewBrand({ name: '', country: '' })
      toast.success(`Brand "${created.name}" created`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setCreatingBrand(false)
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Product name is required'); return }
    if (!form.price)       { toast.error('Price is required'); return }
    setSaving(true)
    try {
      await onSubmit(form)
    } finally {
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Link href="/admin/products"
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div>
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-0.5">Catalog</p>
          <h1 className="font-sans text-xl font-semibold text-gray-900">{title}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── IMAGE ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Product Image</p>

          <div className="flex gap-5 items-start">
            {/* Large preview — click to edit */}
            <button
              type="button"
              onClick={() => { setImageEditing(true); setTimeout(() => imageInputRef.current?.focus(), 50) }}
              className="relative w-36 h-36 rounded-xl overflow-hidden flex-shrink-0 group
                         border-2 border-dashed border-gray-200 bg-gray-50 hover:border-[#C9A96E]/50
                         transition-colors"
            >
              {form.primaryImage ? (
                <>
                  <img
                    src={form.primaryImage}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={() => set('primaryImage', '')}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors
                                  flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity
                                    bg-white/90 rounded-lg px-3 py-2 flex items-center gap-1.5">
                      <Camera size={13} className="text-gray-700" />
                      <span className="font-sans text-xs font-semibold text-gray-700">Change</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                  <Camera size={24} />
                  <span className="font-sans text-[10px] text-center px-2">Click to add image</span>
                </div>
              )}
            </button>

            {/* URL input area */}
            <div className="flex-1 min-w-0">
              <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-2">
                Image URL
              </label>
              <input
                ref={imageInputRef}
                value={form.primaryImage}
                onChange={e => set('primaryImage', e.target.value)}
                onFocus={() => setImageEditing(true)}
                onBlur={() => setImageEditing(false)}
                placeholder="Paste an image URL — preview updates instantly"
                className={`w-full border rounded-lg px-3.5 py-2.5 font-sans text-sm text-gray-700
                            placeholder-gray-300 focus:outline-none transition-all
                            ${imageEditing
                              ? 'border-[#C9A96E]/60 ring-2 ring-[#C9A96E]/15'
                              : 'border-gray-200 focus:ring-2 focus:ring-gray-200'}`}
              />
              <p className="font-sans text-[10px] text-gray-400 mt-2">
                Tip: paste any direct image link (Unsplash, brand CDN, etc.) — the preview above updates as you type.
              </p>
              {form.primaryImage && (
                <button
                  type="button"
                  onClick={() => set('primaryImage', '')}
                  className="mt-2 flex items-center gap-1 font-sans text-[10px] text-red-400 hover:text-red-600 transition-colors"
                >
                  <X size={10} /> Remove image
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── BASIC INFO ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
          <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Info</p>

          <div>
            <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">
              Product Name *
            </label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Vitamin C Brightening Serum"
              required
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm
                         text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Category + Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Category</label>
              <select
                value={form.categoryId}
                onChange={e => set('categoryId', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm
                           text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.parentId ? `  · ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-sans text-[10px] tracking-wider uppercase text-gray-400">Brand</label>
                <button
                  type="button"
                  onClick={() => setShowNewBrand(v => !v)}
                  className="font-sans text-[10px] text-[#C9A96E] hover:underline flex items-center gap-0.5"
                >
                  <Plus size={10} /> New brand
                </button>
              </div>
              <select
                value={form.brandId}
                onChange={e => set('brandId', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm
                           text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="">Select brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          {/* Inline new-brand */}
          {showNewBrand && (
            <div className="rounded-lg border border-[#C9A96E]/25 bg-amber-50/50 p-4 space-y-3">
              <p className="font-sans text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Create New Brand</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-sans text-[10px] text-gray-400 mb-1">Name *</label>
                  <input
                    value={newBrand.name}
                    onChange={e => setNewBrand(b => ({ ...b, name: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateBrand() } }}
                    placeholder="e.g. Rare Beauty"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/30"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[10px] text-gray-400 mb-1">Country</label>
                  <input
                    value={newBrand.country}
                    onChange={e => setNewBrand(b => ({ ...b, country: e.target.value }))}
                    placeholder="e.g. USA"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm
                               focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/30"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateBrand}
                  disabled={creatingBrand || !newBrand.name.trim()}
                  className="px-4 py-1.5 bg-gray-900 text-white font-sans text-xs rounded-lg
                             disabled:opacity-40 hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                >
                  {creatingBrand
                    ? <><Loader2 size={11} className="animate-spin" /> Creating…</>
                    : <><Check size={11} /> Create</>}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewBrand(false); setNewBrand({ name: '', country: '' }) }}
                  className="px-4 py-1.5 border border-gray-200 text-gray-500 font-sans text-xs rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── PRICING & INVENTORY ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
          <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing & Inventory</p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Price *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number" step="0.01" min="0" required
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-3.5 py-2.5 font-sans text-sm
                             focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>
            <div>
              <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Compare At</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number" step="0.01" min="0"
                  value={form.compareAtPrice}
                  onChange={e => set('compareAtPrice', e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-3.5 py-2.5 font-sans text-sm
                             focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>
            <div>
              <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Stock</label>
              <input
                type="number" min="0"
                value={form.stockQuantity}
                onChange={e => set('stockQuantity', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm
                           focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">SKU</label>
            <input
              value={form.sku}
              onChange={e => set('sku', e.target.value)}
              placeholder="e.g. CT-LIP-001  (optional — auto-generated if blank)"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm
                         text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        {/* ── DESCRIPTION ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
          <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</p>
          <div>
            <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Short Description</label>
            <input
              value={form.shortDescription}
              onChange={e => set('shortDescription', e.target.value)}
              placeholder="One-line tagline shown in product cards"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm
                         text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <div>
            <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Full Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              placeholder="Detailed product description…"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm
                         text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
            />
          </div>
        </div>

        {/* ── TAGS ───────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-3">
          <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</p>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitTag() } }}
              placeholder="Type a tag and press Enter  (e.g. bestseller, vegan)"
              className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm
                         placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <button
              type="button"
              onClick={commitTag}
              className="px-4 py-2 bg-gray-100 text-gray-600 font-sans text-xs rounded-lg hover:bg-gray-200 transition-colors"
            >
              Add
            </button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map(t => (
                <span key={t}
                  className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 font-sans text-xs px-2.5 py-1 rounded-full">
                  {t}
                  <button
                    type="button"
                    onClick={() => set('tags', form.tags.filter(x => x !== t))}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── FRAGRANCE NOTES (shown only for fragrance categories) ──────── */}
        {isFragrance && (
          <div className="bg-white rounded-xl border border-amber-100 p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">Fragrance Notes</p>
              <span className="font-sans text-[10px] text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Fragrance</span>
            </div>

            {/* Top / Heart / Base */}
            {(['top', 'middle', 'base'] as const).map(row => {
              const labels = { top: 'Top Notes', middle: 'Heart Notes', base: 'Base Notes' }
              const placeholders = {
                top:    'e.g. Bergamot, Lemon, Pink Pepper',
                middle: 'e.g. Rose, Jasmine, Iris',
                base:   'e.g. Sandalwood, Vanilla, Musk',
              }
              return (
                <div key={row}>
                  <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">
                    {labels[row]}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={noteInputs[row]}
                      onChange={e => setNoteInputs(n => ({ ...n, [row]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitNote(row) } }}
                      placeholder={placeholders[row]}
                      className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm
                                 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-200/60"
                    />
                    <button type="button" onClick={() => commitNote(row)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 font-sans text-xs rounded-lg hover:bg-gray-200 transition-colors">
                      Add
                    </button>
                  </div>
                  {form.fragranceNotes[row].length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {form.fragranceNotes[row].map((note: string) => (
                        <span key={note}
                          className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 font-sans text-xs px-2.5 py-1 rounded-full">
                          {note}
                          <button type="button"
                            onClick={() => setFn(row, form.fragranceNotes[row].filter((n: string) => n !== note))}
                            className="text-amber-400 hover:text-amber-700 transition-colors">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Family */}
            <div>
              <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Fragrance Family</label>
              <select
                value={form.fragranceNotes.family}
                onChange={e => setFn('family', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-200/60">
                <option value="">Select family</option>
                <option value="floral">🌸 Floral</option>
                <option value="oriental">🔮 Oriental</option>
                <option value="woody">🌿 Woody</option>
                <option value="fresh">💎 Fresh</option>
                <option value="citrus">🍋 Citrus</option>
                <option value="gourmand">🍫 Gourmand</option>
              </select>
            </div>

            {/* Longevity / Sillage / Gender */}
            <div className="grid grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Longevity</label>
                <select
                  value={form.fragranceNotes.longevity}
                  onChange={e => setFn('longevity', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-200/60">
                  <option value="">Select</option>
                  <option>Short (1–3 hrs)</option>
                  <option>Moderate (4–6 hrs)</option>
                  <option>Moderate (5–7 hrs)</option>
                  <option>Long-lasting (8+ hrs)</option>
                  <option>Very long-lasting (12+ hrs)</option>
                </select>
              </div>
              <div>
                <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Sillage</label>
                <select
                  value={form.fragranceNotes.sillage}
                  onChange={e => setFn('sillage', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-200/60">
                  <option value="">Select</option>
                  <option>Intimate</option>
                  <option>Light</option>
                  <option>Light to Moderate</option>
                  <option>Moderate</option>
                  <option>Strong</option>
                  <option>Very strong</option>
                </select>
              </div>
              <div>
                <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">For</label>
                <select
                  value={form.fragranceNotes.gender}
                  onChange={e => setFn('gender', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-200/60">
                  <option value="">Select</option>
                  <option>Feminine</option>
                  <option>Masculine</option>
                  <option>Unisex</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── VISIBILITY ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Visibility</p>
          <div className="flex gap-8">
            <Toggle
              on={form.isActive}
              onChange={() => set('isActive', !form.isActive)}
              label="Active"
              sub="Visible on the store"
            />
            <Toggle
              on={form.isFeatured}
              onChange={() => set('isFeatured', !form.isFeatured)}
              label="Featured"
              sub="Show on homepage"
            />
          </div>
        </div>

        {/* ── ACTIONS ────────────────────────────────────────────────────── */}
        <div className="flex gap-3 pb-10">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gray-900 text-white font-sans text-xs tracking-wider uppercase py-3.5
                       rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50
                       flex items-center justify-center gap-2"
          >
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : submitLabel}
          </button>
          <Link
            href="/admin/products"
            className="px-6 py-3.5 border border-gray-200 text-gray-600 font-sans text-xs tracking-wider
                       uppercase rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
