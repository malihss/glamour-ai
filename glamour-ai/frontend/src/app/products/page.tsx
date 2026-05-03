'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from 'react-query'
import { productsAPI } from '@/lib/api'
import { ProductCard } from '@/components/product/ProductCard'
import { ChevronDown, SlidersHorizontal, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Newest'              },
  { value: 'price:asc',       label: 'Price: Low to High'  },
  { value: 'price:desc',      label: 'Price: High to Low'  },
  { value: 'rating:desc',     label: 'Top Rated'           },
  { value: 'name:asc',        label: 'Name: A – Z'         },
]

const PRICE_RANGES = [
  { label: 'Under $30',   min: 0,   max: 30   },
  { label: '$30 – $60',   min: 30,  max: 60   },
  { label: '$60 – $100',  min: 60,  max: 100  },
  { label: 'Over $100',   min: 100, max: 9999 },
]

const MAIN_TABS = [
  { key: '',          label: 'All'       },
  { key: 'makeup',    label: 'Makeup'    },
  { key: 'skincare',  label: 'Skincare'  },
  { key: 'fragrance', label: 'Fragrance' },
  { key: 'tools',     label: 'Tools'     },
]

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 pb-5 mb-5 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-gray-700">
          {title}
        </span>
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProductsPageInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [page,         setPage]        = useState(1)
  const [sort,         setSort]        = useState('created_at:desc')
  const [priceRange,   setPriceRange]  = useState<{ min?: number; max?: number }>({})
  const [activeBrand,  setActiveBrand] = useState<string | undefined>()
  const [mobileFOpen,  setMobileFOpen] = useState(false)

  const category = searchParams.get('category') || ''
  const search   = searchParams.get('search')   || undefined
  const featured = searchParams.get('featured') === 'true' ? true : undefined

  const [sortField, sortOrder] = sort.split(':')

  useEffect(() => { setPage(1) }, [category, search, sort, priceRange, activeBrand])

  // ── Products query ─────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery(
    ['products', { page, category, search, featured, sort, priceRange, activeBrand }],
    () =>
      productsAPI.list({
        page,
        limit: 16,
        category: category || undefined,
        brand:    activeBrand,
        search,
        featured,
        sort:     sortField,
        order:    sortOrder,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      }).then(r => r.data),
    { keepPreviousData: true }
  )

  // ── Categories (for sidebar) ──────────────────────────────────────────────
  const { data: categoriesData } = useQuery('categories', () =>
    productsAPI.getCategories().then(r => r.data)
  )

  // ── Active root: find root even when a subcategory is selected ────────────
  const allRootCats: any[] = categoriesData?.categories ?? []

  const activeRoot: any =
    allRootCats.find((c: any) => c.slug === category) ??
    allRootCats.find((c: any) =>
      (c.subcategories ?? []).some((s: any) => s.slug === category)
    ) ??
    null

  // Slug used to highlight the correct main tab
  const activeTabSlug = activeRoot?.slug ?? ''

  // Subcategories to show in sidebar
  const subcats: any[] = activeRoot?.subcategories ?? []

  // ── Navigation helpers ────────────────────────────────────────────────────
  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) params.set('category', slug)
    else      params.delete('category')
    params.delete('brand')
    setActiveBrand(undefined)
    router.push(`/products${params.toString() ? '?' + params.toString() : ''}`)
    setPage(1)
  }

  const clearFilters = () => {
    setPriceRange({})
    setActiveBrand(undefined)
    setPage(1)
  }

  // ── Breadcrumb label ──────────────────────────────────────────────────────
  const rootLabel  = MAIN_TABS.find(t => t.key === activeRoot?.slug)?.label ?? activeRoot?.name
  const subLabel   = subcats.find((s: any) => s.slug === category)?.name
  const pageTitle  = search   ? `"${search}"`
                  : featured  ? 'Bestsellers'
                  : subLabel  ?? rootLabel
                  ?? 'All Products'

  const anyFilterActive = !!priceRange.min || !!priceRange.max || !!activeBrand

  return (
    <div className="pt-[88px] bg-[#f6f5f3] min-h-screen">

      {/* ── TOP NAV ── */}
      <div className="bg-white border-b border-gray-200 sticky top-[88px] z-20">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 py-3 font-sans text-[11px] text-gray-400">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/products" className="hover:text-gray-700 transition-colors">Products</Link>
            {activeRoot && (
              <>
                <ChevronRight size={11} />
                <button
                  onClick={() => setCategory(activeRoot.slug)}
                  className="hover:text-gray-700 transition-colors"
                >
                  {rootLabel}
                </button>
              </>
            )}
            {subLabel && (
              <>
                <ChevronRight size={11} />
                <span className="text-gray-700">{subLabel}</span>
              </>
            )}
          </nav>

          {/* Main category tabs */}
          <div className="flex gap-0 border-t border-gray-100 overflow-x-auto scrollbar-none">
            {MAIN_TABS.map((tab) => {
              const active = tab.key === activeTabSlug && !search && !featured
              return (
                <button
                  key={tab.key}
                  onClick={() => setCategory(tab.key)}
                  className={`relative shrink-0 px-5 py-3.5 font-sans text-[12px] tracking-wide
                               whitespace-nowrap transition-colors
                               ${active
                                 ? 'text-gray-900 font-semibold'
                                 : 'text-gray-500 hover:text-gray-800 font-medium'}`}
                >
                  {tab.label}
                  {active && (
                    <motion.span
                      layoutId="tab-line"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">

        {/* ── PAGE HEADER ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-sans text-2xl font-semibold text-gray-900">{pageTitle}</h1>
            <p className="font-sans text-xs text-gray-400 mt-0.5">
              {data?.pagination?.total ?? '…'} products
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFOpen(true)}
              className="lg:hidden flex items-center gap-1.5 font-sans text-xs text-gray-700
                         border border-gray-200 bg-white px-3 py-2 hover:border-gray-400"
            >
              <SlidersHorizontal size={13} />
              Filters
              {anyFilterActive && (
                <span className="ml-1 w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center">
                  !
                </span>
              )}
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="appearance-none bg-white font-sans text-xs text-gray-700
                           border border-gray-200 px-4 py-2 pr-8 focus:outline-none
                           focus:border-gray-400 cursor-pointer hover:border-gray-400"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">

          {/* ── DESKTOP SIDEBAR ── */}
          <aside className="hidden lg:block w-52 flex-shrink-0">

            {/* Clear filters pill */}
            {anyFilterActive && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-[10px] font-sans text-gray-500
                           border border-gray-200 px-3 py-1.5 mb-4 hover:border-gray-900 hover:text-gray-900 transition-colors"
              >
                <X size={10} /> Clear filters
              </button>
            )}

            {/* Category */}
            <FilterSection title="Category">
              <div className="space-y-0.5">
                <button
                  onClick={() => setCategory('')}
                  className={`block w-full text-left font-sans text-[12px] py-1.5 px-2 transition-colors rounded-sm ${
                    !category ? 'text-gray-900 font-semibold bg-gray-50' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  All Products
                </button>
                {MAIN_TABS.filter(t => t.key).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setCategory(tab.key)}
                    className={`block w-full text-left font-sans text-[12px] py-1.5 px-2 transition-colors rounded-sm ${
                      activeTabSlug === tab.key && !search
                        ? 'text-gray-900 font-semibold bg-gray-50'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Subcategories — only shown when a root is active */}
            {subcats.length > 0 && (
              <FilterSection title={`${rootLabel} Types`}>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setCategory(activeRoot.slug)}
                    className={`block w-full text-left font-sans text-[12px] py-1.5 px-2 transition-colors rounded-sm ${
                      category === activeRoot.slug ? 'text-gray-900 font-semibold bg-gray-50' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    All {rootLabel}
                  </button>
                  {subcats.map((sub: any) => (
                    <button
                      key={sub.slug}
                      onClick={() => setCategory(sub.slug)}
                      className={`block w-full text-left font-sans text-[12px] py-1.5 px-2 transition-colors rounded-sm ${
                        category === sub.slug ? 'text-gray-900 font-semibold bg-gray-50' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Price */}
            <FilterSection title="Price">
              <div className="space-y-0.5">
                <button
                  onClick={() => setPriceRange({})}
                  className={`block w-full text-left font-sans text-[12px] py-1.5 px-2 transition-colors rounded-sm ${
                    !priceRange.min && !priceRange.max ? 'text-gray-900 font-semibold bg-gray-50' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  All Prices
                </button>
                {PRICE_RANGES.map(r => (
                  <button
                    key={r.label}
                    onClick={() => setPriceRange({ min: r.min, max: r.max })}
                    className={`block w-full text-left font-sans text-[12px] py-1.5 px-2 transition-colors rounded-sm ${
                      priceRange.min === r.min ? 'text-gray-900 font-semibold bg-gray-50' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </FilterSection>

          </aside>

          {/* ── MOBILE DRAWER ── */}
          <AnimatePresence>
            {mobileFOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                  onClick={() => setMobileFOpen(false)}
                />
                <motion.div
                  initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                  transition={{ type: 'tween', duration: 0.25 }}
                  className="fixed top-0 left-0 bottom-0 z-40 w-72 bg-white p-6 overflow-y-auto lg:hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-sans text-sm font-semibold text-gray-900">Filters</span>
                    <button onClick={() => setMobileFOpen(false)} className="text-gray-400 hover:text-gray-700">
                      <X size={16} />
                    </button>
                  </div>

                  <FilterSection title="Category">
                    <div className="space-y-0.5">
                      {MAIN_TABS.map(tab => (
                        <button key={tab.key} onClick={() => { setCategory(tab.key); setMobileFOpen(false) }}
                          className={`block w-full text-left font-sans text-[12px] py-2 px-2 ${
                            (tab.key === '' && !category) || activeTabSlug === tab.key
                              ? 'text-gray-900 font-semibold' : 'text-gray-500'
                          }`}>
                          {tab.label || 'All Products'}
                        </button>
                      ))}
                    </div>
                  </FilterSection>

                  {subcats.length > 0 && (
                    <FilterSection title={`${rootLabel} Types`}>
                      <div className="space-y-0.5">
                        {subcats.map((sub: any) => (
                          <button key={sub.slug} onClick={() => { setCategory(sub.slug); setMobileFOpen(false) }}
                            className={`block w-full text-left font-sans text-[12px] py-2 px-2 ${
                              category === sub.slug ? 'text-gray-900 font-semibold' : 'text-gray-500'
                            }`}>
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    </FilterSection>
                  )}

                  <FilterSection title="Price">
                    <div className="space-y-0.5">
                      {PRICE_RANGES.map(r => (
                        <button key={r.label} onClick={() => { setPriceRange({ min: r.min, max: r.max }); setMobileFOpen(false) }}
                          className={`block w-full text-left font-sans text-[12px] py-2 px-2 ${
                            priceRange.min === r.min ? 'text-gray-900 font-semibold' : 'text-gray-500'
                          }`}>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </FilterSection>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── PRODUCT GRID ── */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="bg-white">
                    <div className="bg-gray-100 animate-pulse" style={{ aspectRatio: '1/1.1' }} />
                    <div className="p-3 space-y-2">
                      <div className="h-2.5 bg-gray-100 animate-pulse w-1/3 rounded" />
                      <div className="h-3 bg-gray-100 animate-pulse w-4/5 rounded" />
                      <div className="h-3 bg-gray-100 animate-pulse w-1/4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !data?.products?.length ? (
              <div className="text-center py-24">
                <p className="font-sans text-lg font-medium text-gray-700 mb-2">No products found</p>
                <p className="font-sans text-sm text-gray-400 mb-6">Try adjusting your filters</p>
                <button
                  onClick={() => { setCategory(''); clearFilters() }}
                  className="bg-black text-white font-sans text-xs tracking-widest uppercase px-8 py-3 hover:bg-gray-800"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <motion.div
                  key={`${category}-${page}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isFetching ? 0.5 : 1 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {data.products.map((product: any, i: number) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>

                {/* Pagination */}
                {data.pagination?.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1.5 mt-12 flex-wrap">
                    {page > 1 && (
                      <button
                        onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        className="px-4 h-9 font-sans text-xs border border-gray-200 bg-white
                                   text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all"
                      >
                        ←
                      </button>
                    )}
                    {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1)
                      .filter(n => n === 1 || n === data.pagination.totalPages ||
                                  Math.abs(n - page) <= 2)
                      .reduce((acc: (number | string)[], n, idx, arr) => {
                        if (idx > 0 && (n as number) - (arr[idx - 1] as number) > 1) acc.push('…')
                        acc.push(n)
                        return acc
                      }, [])
                      .map((n, i) =>
                        n === '…' ? (
                          <span key={`ellipsis-${i}`} className="px-2 font-sans text-xs text-gray-400">…</span>
                        ) : (
                          <button
                            key={n}
                            onClick={() => { setPage(n as number); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                            className={`w-9 h-9 font-sans text-xs transition-all border ${
                              page === n
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900'
                            }`}
                          >
                            {n}
                          </button>
                        )
                      )
                    }
                    {page < data.pagination.totalPages && (
                      <button
                        onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        className="px-4 h-9 font-sans text-xs border border-gray-200 bg-white
                                   text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all"
                      >
                        →
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageInner />
    </Suspense>
  )
}
