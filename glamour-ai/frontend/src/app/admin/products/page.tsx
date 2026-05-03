'use client'

import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '@/lib/adminApi'
import Link from 'next/link'
import { Plus, Search, Star, Eye, Trash2, Edit2, Package, SlidersHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminProductsPage() {
  const [products, setProducts]   = useState<any[]>([])
  const [loading,  setLoading]    = useState(true)
  const [search,   setSearch]     = useState('')
  const [catFilter,setCatFilter]  = useState('')
  const [categories,setCategories]= useState<any[]>([])
  const [page,     setPage]       = useState(1)
  const [total,    setTotal]      = useState(0)
  const perPage = 20

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page), limit: String(perPage) }
      if (search)    params.search   = search
      if (catFilter) params.category = catFilter
      const data = await adminApi.getProducts(params)
      setProducts(data.products || [])
      setTotal(data.pagination?.total || 0)
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }, [page, search, catFilter])

  useEffect(() => {
    adminApi.getCategories().then(d => setCategories(d.categories || [])).catch(() => {})
  }, [])
  useEffect(() => {
    const t = setTimeout(fetchProducts, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [fetchProducts, search])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Deactivate "${name}"?`)) return
    try { await adminApi.deleteProduct(id); toast.success('Deactivated'); fetchProducts() }
    catch (e: any) { toast.error(e.message) }
  }

  const handleToggleFeatured = async (product: any) => {
    try {
      await adminApi.updateProduct(product.id, { isFeatured: !product.isFeatured })
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p))
    } catch (e: any) { toast.error(e.message) }
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6 max-w-screen-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total.toLocaleString()} items in catalog</p>
        </div>
        <Link href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors">
          <Plus size={14} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition" />
        </div>
        <div className="relative">
          <SlidersHorizontal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }}
            className="pl-8 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10 appearance-none cursor-pointer">
            <option value="">All Categories</option>
            {categories.map((c: any) => <option key={c.id} value={c.slug ?? c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['Product', 'Category', 'Price', 'Stock', 'Status', ''].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold tracking-widest uppercase text-gray-400 px-5 py-3.5 first:pl-5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${50 + (i * j * 13) % 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <Package size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-400">No products found</p>
                  <Link href="/admin/products/new" className="mt-2 inline-block text-xs text-[#C9A96E] hover:underline font-semibold">
                    + Add first product
                  </Link>
                </td>
              </tr>
            ) : products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/40 transition-colors">
                {/* Product */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {p.primaryImage
                        ? <img src={p.primaryImage} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package size={13} className="text-gray-300" /></div>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.brand?.name ?? p.brand ?? ''}</p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-5 py-3.5">
                  <span className="inline-block text-[10px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {p.category?.name ?? p.category ?? '—'}
                  </span>
                </td>

                {/* Price */}
                <td className="px-5 py-3.5">
                  <p className="text-sm font-bold text-gray-800">${p.price?.toFixed(2)}</p>
                  {p.compareAtPrice && (
                    <p className="text-[10px] text-gray-400 line-through">${p.compareAtPrice?.toFixed(2)}</p>
                  )}
                </td>

                {/* Stock */}
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-bold ${p.stock > 10 ? 'text-emerald-600' : p.stock > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                    {p.stock ?? '—'}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full ${p.isActive ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-gray-100 text-gray-400'}`}>
                      {p.isActive ? 'Active' : 'Off'}
                    </span>
                    {p.isFeatured && (
                      <span className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                        Featured
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-0.5">
                    <button onClick={() => handleToggleFeatured(p)} title={p.isFeatured ? 'Unfeature' : 'Feature'}
                      className={`p-2 rounded-lg transition-colors ${p.isFeatured ? 'text-amber-400 hover:bg-amber-50' : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50'}`}>
                      <Star size={13} className={p.isFeatured ? 'fill-current' : ''} />
                    </button>
                    <Link href={`/products/${p.slug}`} target="_blank"
                      className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye size={13} />
                    </Link>
                    <Link href={`/admin/products/${p.id}/edit`}
                      className="p-2 text-gray-300 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit2 size={13} />
                    </Link>
                    <button onClick={() => handleDelete(p.id, p.name)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400 font-medium">
              {((page - 1) * perPage + 1).toLocaleString()}–{Math.min(page * perPage, total).toLocaleString()} of {total.toLocaleString()}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 bg-white rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const n = page <= 3 ? i + 1 : page - 2 + i
                if (n < 1 || n > totalPages) return null
                return (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 py-1.5 text-xs font-medium rounded-lg border transition-colors ${n === page ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                    {n}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 bg-white rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
