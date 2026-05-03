'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/adminApi'
import Link from 'next/link'
import { ChevronLeft, ImageOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    shortDescription: '',
    description: '',
    price: '',
    compareAtPrice: '',
    stockQuantity: '0',
    categoryId: '',
    brandId: '',
    primaryImage: '',
    isFeatured: false,
    isActive: true,
  })

  useEffect(() => {
    adminApi.getCategories().then(d => setCategories(d.categories || [])).catch(() => {})
    adminApi.getBrands().then(d => setBrands(d.brands || [])).catch(() => {})
  }, [])

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price) { toast.error('Name and price are required'); return }
    setSaving(true)
    try {
      await adminApi.createProduct({
        name: form.name,
        shortDescription: form.shortDescription,
        description: form.description,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        stock: parseInt(form.stockQuantity) || 0,
        imageUrl: form.primaryImage || '',
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        brandId: form.brandId ? parseInt(form.brandId) : null,
      })
      toast.success('Product created!')
      router.push('/admin/products')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products"
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div>
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-0.5">Catalog</p>
          <h1 className="font-sans text-xl font-semibold text-gray-900">New Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image preview + name */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
          <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Info</p>

          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {form.primaryImage ? (
                <img src={form.primaryImage} alt="" className="w-full h-full object-cover" onError={() => set('primaryImage', '')} />
              ) : (
                <ImageOff size={20} className="text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Image URL</label>
              <input
                value={form.primaryImage}
                onChange={e => set('primaryImage', e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Product Name *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Vitamin C Brightening Serum"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Category</label>
              <select
                value={form.categoryId}
                onChange={e => set('categoryId', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Brand</label>
              <select
                value={form.brandId}
                onChange={e => set('brandId', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="">Select brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
          <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing & Inventory</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Price *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-sans text-sm">$</span>
                <input
                  type="number" step="0.01" min="0"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-3.5 py-2.5 font-sans text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Compare At</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-sans text-sm">$</span>
                <input
                  type="number" step="0.01" min="0"
                  value={form.compareAtPrice}
                  onChange={e => set('compareAtPrice', e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-3.5 py-2.5 font-sans text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>
            <div>
              <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Stock</label>
              <input
                type="number" min="0"
                value={form.stockQuantity}
                onChange={e => set('stockQuantity', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
          <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</p>
          <div>
            <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Short Description</label>
            <input
              value={form.shortDescription}
              onChange={e => set('shortDescription', e.target.value)}
              placeholder="Brief tagline shown in product cards"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <div>
            <label className="block font-sans text-[10px] tracking-wider uppercase text-gray-400 mb-1.5">Full Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              placeholder="Detailed product description..."
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 font-sans text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
            />
          </div>
        </div>

        {/* Flags */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Visibility</p>
          <div className="flex gap-6">
            {[
              { key: 'isActive', label: 'Active', sub: 'Visible on the store' },
              { key: 'isFeatured', label: 'Featured', sub: 'Show on homepage' },
            ].map(({ key, label, sub }) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer group">
                <div className={`w-9 h-5 rounded-full relative transition-colors mt-0.5 ${(form as any)[key] ? 'bg-[#0f0f0f]' : 'bg-gray-200'}`}
                  onClick={() => set(key, !(form as any)[key])}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${(form as any)[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <div>
                  <p className="font-sans text-sm text-gray-700">{label}</p>
                  <p className="font-sans text-[10px] text-gray-400">{sub}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#0f0f0f] text-white font-sans text-xs tracking-wider uppercase py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : 'Create Product'}
          </button>
          <Link href="/admin/products"
            className="px-6 py-3 border border-gray-200 text-gray-600 font-sans text-xs tracking-wider uppercase rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
