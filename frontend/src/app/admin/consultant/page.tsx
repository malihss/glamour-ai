'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { adminApi } from '@/lib/adminApi'
import {
  Search, User, Star, ShoppingBag, MessageSquare,
  Sparkles, ChevronRight, Plus, Send, Package,
  HeartHandshake, X, Check,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────────────────────────────

interface ClientRow {
  id: string
  email: string
  firstName: string
  lastName: string
  skinTone: string | null
  skinType: string | null
  orderCount: number
  totalSpent: number
  reviewCount: number
  hasNotes: boolean
  lastOrderAt: string | null
  createdAt: string | null
}

interface ClientDetail {
  id: string
  email: string
  firstName: string
  lastName: string
  skinTone: string | null
  skinType: string | null
  preferences: Record<string, unknown>
  createdAt: string | null
  orderCount: number
  totalSpent: number
  chatCount: number
  consultantNotes: { text: string; createdAt: string }[]
  recommendedProducts: {
    id: string; name: string; slug: string;
    price: number; primaryImage: string | null; brand: string | null
  }[]
  orders: {
    id: string; orderNumber: string; status: string;
    total: number; itemCount: number; createdAt: string | null
  }[]
  reviews: {
    id: string; productName: string; rating: number;
    title: string | null; body: string | null; createdAt: string | null
  }[]
}

type Tab = 'profile' | 'orders' | 'diagnostics' | 'recommendations' | 'notes'

const GOLD = '#C9A96E'
const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700',
  confirmed:  'bg-blue-50 text-blue-700',
  processing: 'bg-purple-50 text-purple-700',
  shipped:    'bg-indigo-50 text-indigo-700',
  delivered:  'bg-green-50 text-green-700',
  cancelled:  'bg-red-50 text-red-700',
  refunded:   'bg-gray-100 text-gray-600',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function SkinBadge({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: `${GOLD}15`, color: GOLD }}>
      {label}: {value}
    </span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ConsultantPage() {
  const [clients, setClients]       = useState<ClientRow[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [loadingList, setLoadingList] = useState(true)

  const [selected, setSelected]     = useState<ClientDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [activeTab, setActiveTab]   = useState<Tab>('profile')

  const [noteText, setNoteText]     = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const [productSearch, setProductSearch] = useState('')
  const [productResults, setProductResults] = useState<{ id: string; name: string; price: number; primaryImage: string | null; brand: string | null }[]>([])
  const [searchingProducts, setSearchingProducts] = useState(false)
  const [addingRec, setAddingRec] = useState<string | null>(null)

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch client list ──────────────────────────────────────────────────────

  const fetchClients = useCallback(async () => {
    setLoadingList(true)
    try {
      const params: Record<string, string> = { page: String(page), limit: '30' }
      if (search) params.search = search
      const data = await adminApi.consultantClients(params)
      setClients(data.clients)
      setTotal(data.pagination.total)
    } catch {
      toast.error('Failed to load clients')
    } finally {
      setLoadingList(false)
    }
  }, [page, search])

  useEffect(() => { fetchClients() }, [fetchClients])

  // ── Select client ──────────────────────────────────────────────────────────

  const selectClient = async (id: string) => {
    setLoadingDetail(true)
    setSelected(null)
    setActiveTab('profile')
    try {
      const data = await adminApi.consultantGetClient(id)
      setSelected(data.client)
    } catch {
      toast.error('Failed to load client')
    } finally {
      setLoadingDetail(false)
    }
  }

  // ── Add note ───────────────────────────────────────────────────────────────

  const addNote = async () => {
    if (!selected || !noteText.trim()) return
    setSavingNote(true)
    try {
      const data = await adminApi.consultantAddNote(selected.id, noteText.trim())
      setSelected(s => s ? { ...s, consultantNotes: data.notes } : s)
      setNoteText('')
      toast.success('Note saved')
    } catch {
      toast.error('Failed to save note')
    } finally {
      setSavingNote(false)
    }
  }

  // ── Product search for recommendations ────────────────────────────────────

  const searchProducts = useCallback(async (q: string) => {
    if (!q.trim()) { setProductResults([]); return }
    setSearchingProducts(true)
    try {
      const data = await adminApi.getProducts({ search: q, limit: '8' })
      setProductResults(data.products.map((p: any) => ({
        id: p.id, name: p.name, price: p.price,
        primaryImage: p.primaryImage, brand: p.brand?.name ?? null,
      })))
    } catch {
      //
    } finally {
      setSearchingProducts(false)
    }
  }, [])

  const onProductSearchChange = (val: string) => {
    setProductSearch(val)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => searchProducts(val), 350)
  }

  const recommendProduct = async (productId: string) => {
    if (!selected) return
    setAddingRec(productId)
    try {
      const data = await adminApi.consultantRecommend(selected.id, productId)
      setSelected(s => s ? {
        ...s,
        recommendedProducts: s.recommendedProducts.some(r => r.id === productId)
          ? s.recommendedProducts
          : [...s.recommendedProducts, data.product],
      } : s)
      toast.success('Recommendation added')
    } catch {
      toast.error('Failed to add recommendation')
    } finally {
      setAddingRec(null)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-6 h-[calc(100vh-112px)] min-h-0">

      {/* ── LEFT: Client list ─────────────────────────────────────────────── */}
      <div className="w-80 shrink-0 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <HeartHandshake size={16} style={{ color: GOLD }} />
            <h2 className="text-sm font-semibold text-gray-900">Beauty Clients</h2>
            <span className="ml-auto text-xs text-gray-400 font-medium">{total}</span>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200
                         focus:outline-none focus:border-[#C9A96E] transition-colors"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="flex items-center justify-center h-40 text-xs text-gray-400">Loading…</div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <User size={24} className="text-gray-200" />
              <p className="text-xs text-gray-400">No clients found</p>
            </div>
          ) : (
            clients.map(c => (
              <button
                key={c.id}
                onClick={() => selectClient(c.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
                  selected?.id === c.id ? 'bg-[#C9A96E]/8' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: `linear-gradient(135deg, ${GOLD}, #b8954f)` }}>
                      {(c.firstName?.[0] ?? c.email[0]).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 leading-tight">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {c.hasNotes && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} title="Has notes" />
                    )}
                    <ChevronRight size={11} className="text-gray-300" />
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-9">
                  {c.skinType && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: `${GOLD}15`, color: GOLD }}>
                      {c.skinType}
                    </span>
                  )}
                  <span className="text-[9px] text-gray-400">{c.orderCount} orders</span>
                  <span className="text-[9px] text-gray-300">·</span>
                  <span className="text-[9px] text-gray-400">${c.totalSpent.toFixed(0)} spent</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Pagination */}
        {total > 30 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <button disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="text-xs text-gray-500 disabled:opacity-40 hover:text-gray-800">
              ← Prev
            </button>
            <span className="text-[10px] text-gray-400">Page {page}</span>
            <button disabled={page * 30 >= total}
              onClick={() => setPage(p => p + 1)}
              className="text-xs text-gray-500 disabled:opacity-40 hover:text-gray-800">
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT: Detail panel ───────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden">

        {/* Empty state */}
        {!selected && !loadingDetail && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: `${GOLD}15` }}>
              <HeartHandshake size={28} style={{ color: GOLD }} />
            </div>
            <p className="text-sm font-medium text-gray-700">Select a client</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Choose a client from the list to view their skin profile, orders, and send personalized recommendations.
            </p>
          </div>
        )}

        {loadingDetail && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-200 rounded-full animate-spin"
              style={{ borderTopColor: GOLD }} />
          </div>
        )}

        {selected && (
          <>
            {/* Client header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: `linear-gradient(135deg, ${GOLD}, #b8954f)` }}>
                {(selected.firstName?.[0] ?? selected.email[0]).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{selected.firstName} {selected.lastName}</p>
                <p className="text-xs text-gray-400">{selected.email}</p>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">{selected.orderCount}</p>
                  <p className="text-[10px] text-gray-400">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">${selected.totalSpent.toFixed(0)}</p>
                  <p className="text-[10px] text-gray-400">Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">{selected.chatCount}</p>
                  <p className="text-[10px] text-gray-400">Chats</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6">
              {([
                { id: 'profile',         label: 'Profile',         icon: User },
                { id: 'orders',          label: 'Orders',          icon: ShoppingBag },
                { id: 'diagnostics',     label: 'Diagnostics',     icon: Sparkles },
                { id: 'recommendations', label: 'Recommendations', icon: Package },
                { id: 'notes',           label: 'Notes',           icon: MessageSquare },
              ] as { id: Tab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-[#C9A96E] text-[#C9A96E]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  <Icon size={13} />
                  {label}
                  {id === 'notes' && selected.consultantNotes.length > 0 && (
                    <span className="ml-0.5 text-[9px] px-1 py-0.5 rounded-full font-semibold"
                      style={{ background: `${GOLD}20`, color: GOLD }}>
                      {selected.consultantNotes.length}
                    </span>
                  )}
                  {id === 'recommendations' && selected.recommendedProducts.length > 0 && (
                    <span className="ml-0.5 text-[9px] px-1 py-0.5 rounded-full font-semibold"
                      style={{ background: `${GOLD}20`, color: GOLD }}>
                      {selected.recommendedProducts.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* ── Profile tab ── */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Account Info
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoRow label="First name"  value={selected.firstName} />
                      <InfoRow label="Last name"   value={selected.lastName} />
                      <InfoRow label="Email"       value={selected.email} />
                      <InfoRow label="Member since" value={fmt(selected.createdAt)} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Skin Profile
                    </h3>
                    {!selected.skinTone && !selected.skinType ? (
                      <p className="text-xs text-gray-400 italic">No skin profile completed yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <SkinBadge label="Tone" value={selected.skinTone} />
                        <SkinBadge label="Type" value={selected.skinType} />
                      </div>
                    )}
                  </div>

                  {selected.reviews.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Recent Reviews ({selected.reviews.length})
                      </h3>
                      <div className="space-y-3">
                        {selected.reviews.slice(0, 5).map(r => (
                          <div key={r.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-gray-800">{r.productName}</p>
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} size={9}
                                    style={{ fill: s <= r.rating ? GOLD : '#E5E7EB', color: s <= r.rating ? GOLD : '#E5E7EB' }} />
                                ))}
                              </div>
                            </div>
                            {r.body && <p className="text-[11px] text-gray-500 line-clamp-2">{r.body}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Orders tab ── */}
              {activeTab === 'orders' && (
                <div>
                  {selected.orders.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No orders yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selected.orders.map(o => (
                        <div key={o.id} className="flex items-center justify-between px-4 py-3
                                                    bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-xs font-semibold text-gray-800">#{o.orderNumber}</p>
                            <p className="text-[10px] text-gray-400">{fmt(o.createdAt)} · {o.itemCount} items</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {o.status}
                            </span>
                            <p className="text-xs font-semibold text-gray-800">${o.total.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Diagnostics tab ── */}
              {activeTab === 'diagnostics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <DiagCard icon={<Sparkles size={18} style={{ color: GOLD }} />}
                      label="Skin Tone" value={selected.skinTone ?? '—'} />
                    <DiagCard icon={<Sparkles size={18} style={{ color: GOLD }} />}
                      label="Skin Type" value={selected.skinType ?? '—'} />
                    <DiagCard icon={<MessageSquare size={18} style={{ color: GOLD }} />}
                      label="AI Chats" value={String(selected.chatCount)} />
                  </div>

                  {selected.preferences && Object.keys(selected.preferences).filter(k =>
                    !['consultant_notes', 'recommended_products'].includes(k)
                  ).length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Saved Preferences
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        {Object.entries(selected.preferences)
                          .filter(([k]) => !['consultant_notes', 'recommended_products'].includes(k))
                          .map(([k, v]) => (
                            <div key={k} className="flex gap-2 text-xs">
                              <span className="font-medium text-gray-500 capitalize min-w-[100px]">
                                {k.replace(/_/g, ' ')}:
                              </span>
                              <span className="text-gray-700">{JSON.stringify(v)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Recommendations tab ── */}
              {activeTab === 'recommendations' && (
                <div className="space-y-5">
                  {/* Product search */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Add Recommendation
                    </h3>
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200
                                   focus:outline-none focus:border-[#C9A96E] transition-colors"
                        placeholder="Search products to recommend…"
                        value={productSearch}
                        onChange={e => onProductSearchChange(e.target.value)}
                      />
                    </div>
                    {searchingProducts && (
                      <p className="text-[10px] text-gray-400 mt-2">Searching…</p>
                    )}
                    {productResults.length > 0 && (
                      <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden">
                        {productResults.map(p => {
                          const alreadyAdded = selected.recommendedProducts.some(r => r.id === p.id)
                          return (
                            <div key={p.id}
                              className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                              <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 shrink-0">
                                {p.primaryImage && (
                                  <img src={p.primaryImage} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                                <p className="text-[10px] text-gray-400">{p.brand} · ${p.price.toFixed(2)}</p>
                              </div>
                              <button
                                onClick={() => recommendProduct(p.id)}
                                disabled={alreadyAdded || addingRec === p.id}
                                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                                style={{
                                  background: alreadyAdded ? '#D1FAE5' : `${GOLD}20`,
                                  color: alreadyAdded ? '#059669' : GOLD,
                                }}>
                                {alreadyAdded ? <Check size={13} /> : addingRec === p.id ? '…' : <Plus size={13} />}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Current recommendations */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Recommended Products ({selected.recommendedProducts.length})
                    </h3>
                    {selected.recommendedProducts.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No recommendations yet. Search above to add products.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {selected.recommendedProducts.map(p => (
                          <div key={p.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                            <div className="w-12 h-12 rounded overflow-hidden bg-gray-200 shrink-0">
                              {p.primaryImage && (
                                <img src={p.primaryImage} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-800 line-clamp-2">{p.name}</p>
                              <p className="text-[10px] text-gray-400">{p.brand}</p>
                              <p className="text-xs font-semibold mt-0.5" style={{ color: GOLD }}>
                                ${p.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Notes tab ── */}
              {activeTab === 'notes' && (
                <div className="flex flex-col gap-4 h-full">
                  {/* Existing notes */}
                  <div className="flex-1 space-y-3">
                    {selected.consultantNotes.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No consultant notes yet.</p>
                    ) : (
                      [...selected.consultantNotes].reverse().map((n, i) => (
                        <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{n.text}</p>
                          <p className="text-[10px] text-gray-400 mt-2">{fmt(n.createdAt)}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* New note input */}
                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Add Note
                    </h3>
                    <div className="flex gap-2">
                      <textarea
                        rows={3}
                        className="flex-1 text-xs rounded-lg border border-gray-200 px-3 py-2
                                   focus:outline-none focus:border-[#C9A96E] resize-none transition-colors"
                        placeholder="Enter consultant note about this client…"
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote()
                        }}
                      />
                      <button
                        onClick={addNote}
                        disabled={!noteText.trim() || savingNote}
                        className="self-end px-3 py-2 rounded-lg text-white text-xs font-medium
                                   flex items-center gap-1.5 transition-opacity disabled:opacity-40"
                        style={{ background: GOLD }}>
                        <Send size={12} />
                        Save
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">⌘ + Enter to save</p>
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Small helper components ────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-xs font-medium text-gray-800">{value || '—'}</p>
    </div>
  )
}

function DiagCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center gap-2 text-center">
      {icon}
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
  )
}
