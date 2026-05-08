'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { consultantApi } from '@/lib/consultantApi'
import {
  Search, User, Star, ShoppingBag, MessageSquare,
  Sparkles, ChevronRight, Plus, Send, Package,
  HeartHandshake, Check, Users,
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
    id: string; name: string; slug: string
    price: number; primaryImage: string | null; brand: string | null
  }[]
  orders: {
    id: string; orderNumber: string; status: string
    total: number; itemCount: number; createdAt: string | null
  }[]
  reviews: {
    id: string; productName: string; rating: number
    title: string | null; body: string | null; createdAt: string | null
  }[]
}

type Tab = 'profile' | 'orders' | 'diagnostics' | 'recommendations' | 'notes'

const CHAMPAGNE = '#C6A9A3'
const DARK = '#3E3A39'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#FFF8E7', color: '#A07840' },
  confirmed:  { bg: '#E8F4FD', color: '#2B7FC4' },
  processing: { bg: '#F3E8FD', color: '#7B3FC4' },
  shipped:    { bg: '#E8EDF8', color: '#3B5BC4' },
  delivered:  { bg: '#E8F8ED', color: '#2B8F4A' },
  cancelled:  { bg: '#FDE8E8', color: '#C43B3B' },
  refunded:   { bg: '#F5F5F5', color: '#888' },
}

function fmt(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Main ───────────────────────────────────────────────────────────────────────

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
  const [productResults, setProductResults] = useState<{
    id: string; name: string; price: number; primaryImage: string | null; brand: string | null
  }[]>([])
  const [searchingProducts, setSearchingProducts] = useState(false)
  const [addingRec, setAddingRec] = useState<string | null>(null)

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch clients ──────────────────────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    setLoadingList(true)
    try {
      const params: Record<string, string> = { page: String(page), limit: '30' }
      if (search) params.search = search
      const data = await consultantApi.getClients(params)
      setClients(data.clients)
      setTotal(data.pagination.total)
    } catch { toast.error('Failed to load clients') }
    finally { setLoadingList(false) }
  }, [page, search])

  useEffect(() => { fetchClients() }, [fetchClients])

  // ── Select client ──────────────────────────────────────────────────────────
  const selectClient = async (id: string) => {
    setLoadingDetail(true)
    setSelected(null)
    setActiveTab('profile')
    setProductSearch('')
    setProductResults([])
    try {
      const data = await consultantApi.getClient(id)
      setSelected(data.client)
    } catch { toast.error('Failed to load client') }
    finally { setLoadingDetail(false) }
  }

  // ── Add note ───────────────────────────────────────────────────────────────
  const addNote = async () => {
    if (!selected || !noteText.trim()) return
    setSavingNote(true)
    try {
      const data = await consultantApi.addNote(selected.id, noteText.trim())
      setSelected(s => s ? { ...s, consultantNotes: data.notes } : s)
      setNoteText('')
      toast.success('Note saved')
    } catch { toast.error('Failed to save note') }
    finally { setSavingNote(false) }
  }

  // ── Product search ─────────────────────────────────────────────────────────
  const doProductSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setProductResults([]); return }
    setSearchingProducts(true)
    try {
      const data = await consultantApi.searchProducts(q)
      setProductResults((data.products ?? []).map((p: any) => ({
        id: p.id, name: p.name, price: p.price,
        primaryImage: p.primaryImage, brand: p.brand?.name ?? null,
      })))
    } catch { /* silent */ }
    finally { setSearchingProducts(false) }
  }, [])

  const onProductSearchChange = (val: string) => {
    setProductSearch(val)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => doProductSearch(val), 350)
  }

  const recommendProduct = async (productId: string) => {
    if (!selected) return
    setAddingRec(productId)
    try {
      const data = await consultantApi.recommend(selected.id, productId)
      setSelected(s => {
        if (!s) return s
        const already = s.recommendedProducts.some(r => r.id === productId)
        return already ? s : { ...s, recommendedProducts: [...s.recommendedProducts, data.product] }
      })
      toast.success('Recommendation added')
    } catch { toast.error('Failed to add recommendation') }
    finally { setAddingRec(null) }
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-5 h-full">

      {/* ── LEFT panel ─────────────────────────────────────────────────────── */}
      <div className="w-[300px] shrink-0 flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#fff', border: '1px solid rgba(198,169,163,0.18)', boxShadow: '0 2px 24px rgba(62,58,57,0.05)' }}>

        {/* List header */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(198,169,163,0.12)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} style={{ color: CHAMPAGNE }} />
            <p className="font-sans text-xs tracking-[0.15em] uppercase font-semibold" style={{ color: DARK }}>
              Clients
            </p>
            <span className="ml-auto font-sans text-[10px]" style={{ color: '#A89E99' }}>{total}</span>
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#C6A9A3' }} />
            <input
              className="w-full pl-8 pr-3 py-2 font-sans text-xs rounded-lg outline-none transition-all"
              style={{
                border: '1px solid rgba(198,169,163,0.25)',
                background: '#FDFCFB',
                color: DARK,
              }}
              placeholder="Name or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              onFocus={e => (e.currentTarget.style.borderColor = CHAMPAGNE)}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(198,169,163,0.25)')}
            />
          </div>
        </div>

        {/* Client rows */}
        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="flex items-center justify-center h-32 font-sans text-xs" style={{ color: '#A89E99' }}>
              Loading…
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <User size={22} style={{ color: 'rgba(198,169,163,0.4)' }} />
              <p className="font-sans text-xs" style={{ color: '#A89E99' }}>No clients found</p>
            </div>
          ) : clients.map(c => (
            <button key={c.id} onClick={() => selectClient(c.id)}
              className="w-full text-left px-5 py-3.5 transition-all"
              style={{
                borderBottom: '1px solid rgba(198,169,163,0.08)',
                background: selected?.id === c.id ? 'rgba(198,169,163,0.08)' : 'transparent',
              }}
              onMouseEnter={e => { if (selected?.id !== c.id) (e.currentTarget as HTMLElement).style.background = 'rgba(198,169,163,0.04)' }}
              onMouseLeave={e => { if (selected?.id !== c.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center
                                font-sans text-[11px] font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)' }}>
                  {(c.firstName?.[0] ?? c.email[0]).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-[12px] font-semibold leading-tight truncate"
                      style={{ color: DARK }}>
                      {c.firstName} {c.lastName}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {c.hasNotes && (
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: CHAMPAGNE }} />
                      )}
                      <ChevronRight size={10} style={{ color: 'rgba(198,169,163,0.5)' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {c.skinType && (
                      <span className="font-sans text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(198,169,163,0.12)', color: CHAMPAGNE }}>
                        {c.skinType}
                      </span>
                    )}
                    <span className="font-sans text-[9px]" style={{ color: '#A89E99' }}>
                      {c.orderCount} orders
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Pagination */}
        {total > 30 && (
          <div className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(198,169,163,0.12)' }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="font-sans text-xs disabled:opacity-30 transition-colors"
              style={{ color: '#A89E99' }}>← Prev</button>
            <span className="font-sans text-[10px]" style={{ color: '#C6A9A3' }}>
              {page} / {Math.ceil(total / 30)}
            </span>
            <button disabled={page * 30 >= total} onClick={() => setPage(p => p + 1)}
              className="font-sans text-xs disabled:opacity-30 transition-colors"
              style={{ color: '#A89E99' }}>Next →</button>
          </div>
        )}
      </div>

      {/* ── RIGHT panel ────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#fff', border: '1px solid rgba(198,169,163,0.18)', boxShadow: '0 2px 24px rgba(62,58,57,0.05)' }}>

        {/* Empty state */}
        {!selected && !loadingDetail && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgba(198,169,163,0.15),rgba(198,169,163,0.05))' }}>
              <HeartHandshake size={32} style={{ color: CHAMPAGNE }} />
            </div>
            <div className="text-center">
              <p className="font-display text-xl mb-2" style={{ color: DARK }}>Select a client</p>
              <p className="font-sans text-xs leading-relaxed max-w-xs" style={{ color: '#A89E99' }}>
                Choose a client to view their skin profile, order history, and send personalized beauty recommendations.
              </p>
            </div>
          </div>
        )}

        {loadingDetail && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(198,169,163,0.2)', borderTopColor: CHAMPAGNE }} />
          </div>
        )}

        {selected && (
          <>
            {/* Client header */}
            <div className="px-6 py-4 flex items-center gap-4 shrink-0"
              style={{ borderBottom: '1px solid rgba(198,169,163,0.12)' }}>
              <div className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center
                              font-display text-base font-medium text-white"
                style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)' }}>
                {(selected.firstName?.[0] ?? selected.email[0]).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg leading-tight" style={{ color: DARK }}>
                  {selected.firstName} {selected.lastName}
                </p>
                <p className="font-sans text-xs" style={{ color: '#A89E99' }}>{selected.email}</p>
              </div>
              {/* Stats */}
              {[
                { label: 'Orders',  val: selected.orderCount },
                { label: 'Spent',   val: `$${selected.totalSpent.toFixed(0)}` },
                { label: 'AI Chats', val: selected.chatCount },
              ].map(s => (
                <div key={s.label} className="text-center px-4" style={{ borderLeft: '1px solid rgba(198,169,163,0.15)' }}>
                  <p className="font-display text-lg" style={{ color: DARK }}>{s.val}</p>
                  <p className="font-sans text-[9px] tracking-widest uppercase" style={{ color: '#A89E99' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex px-6 shrink-0" style={{ borderBottom: '1px solid rgba(198,169,163,0.12)' }}>
              {([
                { id: 'profile',         label: 'Profile',         icon: User },
                { id: 'orders',          label: 'Orders',          icon: ShoppingBag },
                { id: 'diagnostics',     label: 'Diagnostics',     icon: Sparkles },
                { id: 'recommendations', label: 'Recommendations', icon: Package },
                { id: 'notes',           label: 'Notes',           icon: MessageSquare },
              ] as { id: Tab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => {
                const active = activeTab === id
                const badge = id === 'notes' ? selected.consultantNotes.length
                            : id === 'recommendations' ? selected.recommendedProducts.length
                            : 0
                return (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className="flex items-center gap-1.5 px-3 py-3.5 font-sans text-[11px] tracking-wider uppercase
                               border-b-2 transition-all"
                    style={{
                      color: active ? CHAMPAGNE : '#A89E99',
                      borderColor: active ? CHAMPAGNE : 'transparent',
                    }}>
                    <Icon size={12} />
                    {label}
                    {badge > 0 && (
                      <span className="ml-0.5 font-sans text-[8px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(198,169,163,0.15)', color: CHAMPAGNE }}>
                        {badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* Profile */}
              {activeTab === 'profile' && (
                <div className="space-y-7">
                  <div>
                    <SectionTitle>Account</SectionTitle>
                    <div className="grid grid-cols-2 gap-5 mt-3">
                      <InfoRow label="First name"   value={selected.firstName} />
                      <InfoRow label="Last name"    value={selected.lastName} />
                      <InfoRow label="Email"        value={selected.email} />
                      <InfoRow label="Member since" value={fmt(selected.createdAt)} />
                    </div>
                  </div>

                  <div>
                    <SectionTitle>Skin Profile</SectionTitle>
                    {!selected.skinTone && !selected.skinType ? (
                      <p className="font-sans text-xs italic mt-3" style={{ color: '#A89E99' }}>
                        No skin profile yet.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selected.skinTone && (
                          <SkinTag label="Tone" value={selected.skinTone} />
                        )}
                        {selected.skinType && (
                          <SkinTag label="Type" value={selected.skinType} />
                        )}
                      </div>
                    )}
                  </div>

                  {selected.reviews.length > 0 && (
                    <div>
                      <SectionTitle>Reviews ({selected.reviews.length})</SectionTitle>
                      <div className="space-y-3 mt-3">
                        {selected.reviews.slice(0, 5).map(r => (
                          <div key={r.id} className="rounded-xl px-4 py-3"
                            style={{ background: 'rgba(198,169,163,0.06)', border: '1px solid rgba(198,169,163,0.1)' }}>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="font-sans text-xs font-semibold" style={{ color: DARK }}>{r.productName}</p>
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} size={9}
                                    style={{ fill: s <= r.rating ? CHAMPAGNE : 'rgba(198,169,163,0.2)',
                                             color: s <= r.rating ? CHAMPAGNE : 'rgba(198,169,163,0.2)' }} />
                                ))}
                              </div>
                            </div>
                            {r.body && (
                              <p className="font-sans text-[11px] leading-relaxed line-clamp-2" style={{ color: '#7A736F' }}>
                                {r.body}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Orders */}
              {activeTab === 'orders' && (
                <div className="space-y-2">
                  {selected.orders.length === 0 ? (
                    <p className="font-sans text-xs italic" style={{ color: '#A89E99' }}>No orders yet.</p>
                  ) : selected.orders.map(o => {
                    const sc = STATUS_COLORS[o.status] ?? { bg: '#F5F5F5', color: '#888' }
                    return (
                      <div key={o.id} className="flex items-center justify-between rounded-xl px-5 py-3.5"
                        style={{ background: 'rgba(198,169,163,0.04)', border: '1px solid rgba(198,169,163,0.1)' }}>
                        <div>
                          <p className="font-sans text-xs font-semibold" style={{ color: DARK }}>
                            #{o.orderNumber}
                          </p>
                          <p className="font-sans text-[10px] mt-0.5" style={{ color: '#A89E99' }}>
                            {fmt(o.createdAt)} · {o.itemCount} items
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-sans text-[9px] tracking-wider uppercase px-2.5 py-1 rounded-full"
                            style={{ background: sc.bg, color: sc.color }}>
                            {o.status}
                          </span>
                          <p className="font-display text-base" style={{ color: DARK }}>
                            ${o.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Diagnostics */}
              {activeTab === 'diagnostics' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    <DiagCard icon={<Sparkles size={20} style={{ color: CHAMPAGNE }} />}
                      label="Skin Tone" value={selected.skinTone ?? '—'} />
                    <DiagCard icon={<Sparkles size={20} style={{ color: CHAMPAGNE }} />}
                      label="Skin Type" value={selected.skinType ?? '—'} />
                    <DiagCard icon={<MessageSquare size={20} style={{ color: CHAMPAGNE }} />}
                      label="AI Sessions" value={String(selected.chatCount)} />
                  </div>

                  {Object.entries(selected.preferences ?? {})
                    .filter(([k]) => !['consultant_notes', 'recommended_products'].includes(k))
                    .length > 0 && (
                    <div>
                      <SectionTitle>Saved Preferences</SectionTitle>
                      <div className="mt-3 rounded-xl p-4 space-y-2"
                        style={{ background: 'rgba(198,169,163,0.05)', border: '1px solid rgba(198,169,163,0.1)' }}>
                        {Object.entries(selected.preferences)
                          .filter(([k]) => !['consultant_notes', 'recommended_products'].includes(k))
                          .map(([k, v]) => (
                            <div key={k} className="flex gap-3 font-sans text-xs">
                              <span className="font-medium capitalize min-w-[120px]" style={{ color: '#7A736F' }}>
                                {k.replace(/_/g, ' ')}
                              </span>
                              <span style={{ color: DARK }}>{JSON.stringify(v)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {activeTab === 'recommendations' && (
                <div className="space-y-6">
                  <div>
                    <SectionTitle>Add Recommendation</SectionTitle>
                    <div className="relative mt-3">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: CHAMPAGNE }} />
                      <input
                        className="w-full pl-8 pr-3 py-2.5 font-sans text-xs rounded-xl outline-none transition-all"
                        style={{
                          border: '1px solid rgba(198,169,163,0.25)',
                          background: '#FDFCFB', color: DARK,
                        }}
                        placeholder="Search products to recommend…"
                        value={productSearch}
                        onChange={e => onProductSearchChange(e.target.value)}
                        onFocus={e => (e.currentTarget.style.borderColor = CHAMPAGNE)}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(198,169,163,0.25)')}
                      />
                    </div>

                    {searchingProducts && (
                      <p className="font-sans text-[10px] mt-2" style={{ color: '#A89E99' }}>Searching…</p>
                    )}

                    {productResults.length > 0 && (
                      <div className="mt-2 rounded-xl overflow-hidden"
                        style={{ border: '1px solid rgba(198,169,163,0.15)' }}>
                        {productResults.map(p => {
                          const already = selected.recommendedProducts.some(r => r.id === p.id)
                          return (
                            <div key={p.id}
                              className="flex items-center gap-3 px-4 py-3 transition-colors"
                              style={{ borderBottom: '1px solid rgba(198,169,163,0.08)' }}
                              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(198,169,163,0.04)')}
                              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                            >
                              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0"
                                style={{ background: 'rgba(198,169,163,0.1)' }}>
                                {p.primaryImage && (
                                  <img src={p.primaryImage} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-sans text-[11px] font-medium truncate" style={{ color: DARK }}>
                                  {p.name}
                                </p>
                                <p className="font-sans text-[10px]" style={{ color: '#A89E99' }}>
                                  {p.brand} · ${p.price.toFixed(2)}
                                </p>
                              </div>
                              <button
                                onClick={() => recommendProduct(p.id)}
                                disabled={already || addingRec === p.id}
                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0
                                           transition-all disabled:opacity-60"
                                style={{
                                  background: already ? 'rgba(76,175,80,0.1)' : 'rgba(198,169,163,0.12)',
                                  color: already ? '#4CAF50' : CHAMPAGNE,
                                }}>
                                {already ? <Check size={13} /> : addingRec === p.id ? '…' : <Plus size={13} />}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <SectionTitle>
                      Sent Recommendations ({selected.recommendedProducts.length})
                    </SectionTitle>
                    {selected.recommendedProducts.length === 0 ? (
                      <p className="font-sans text-xs italic mt-3" style={{ color: '#A89E99' }}>
                        No recommendations yet. Search above to add products.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {selected.recommendedProducts.map(p => (
                          <div key={p.id} className="flex gap-3 rounded-xl p-3"
                            style={{ border: '1px solid rgba(198,169,163,0.12)', background: 'rgba(198,169,163,0.03)' }}>
                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0"
                              style={{ background: 'rgba(198,169,163,0.1)' }}>
                              {p.primaryImage && (
                                <img src={p.primaryImage} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-sans text-[11px] font-medium line-clamp-2 leading-snug" style={{ color: DARK }}>
                                {p.name}
                              </p>
                              <p className="font-sans text-[9px] mt-0.5" style={{ color: '#A89E99' }}>{p.brand}</p>
                              <p className="font-display text-sm mt-1" style={{ color: CHAMPAGNE }}>
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

              {/* Notes */}
              {activeTab === 'notes' && (
                <div className="flex flex-col gap-5 h-full">
                  <div className="flex-1 space-y-3">
                    <SectionTitle>Consultant Notes</SectionTitle>
                    {selected.consultantNotes.length === 0 ? (
                      <p className="font-sans text-xs italic mt-2" style={{ color: '#A89E99' }}>
                        No notes yet.
                      </p>
                    ) : (
                      [...selected.consultantNotes].reverse().map((n, i) => (
                        <div key={i} className="rounded-xl px-4 py-3"
                          style={{ background: 'rgba(198,169,163,0.06)', border: '1px solid rgba(198,169,163,0.12)' }}>
                          <p className="font-sans text-xs leading-relaxed whitespace-pre-wrap" style={{ color: DARK }}>
                            {n.text}
                          </p>
                          <p className="font-sans text-[9px] mt-2" style={{ color: '#A89E99' }}>
                            {fmt(n.createdAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Note input */}
                  <div className="pt-4" style={{ borderTop: '1px solid rgba(198,169,163,0.15)' }}>
                    <SectionTitle>Add Note</SectionTitle>
                    <div className="flex gap-3 mt-3">
                      <textarea
                        rows={3}
                        className="flex-1 font-sans text-xs rounded-xl px-4 py-3 outline-none resize-none transition-all"
                        style={{
                          border: '1px solid rgba(198,169,163,0.25)',
                          background: '#FDFCFB', color: DARK,
                        }}
                        placeholder="Write a note about this client…"
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        onFocus={e => (e.currentTarget.style.borderColor = CHAMPAGNE)}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(198,169,163,0.25)')}
                        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote() }}
                      />
                      <button
                        onClick={addNote}
                        disabled={!noteText.trim() || savingNote}
                        className="self-end px-4 py-3 rounded-xl font-sans text-xs tracking-wider uppercase
                                   text-white flex items-center gap-2 transition-opacity disabled:opacity-40"
                        style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)' }}
                      >
                        <Send size={12} />
                        Save
                      </button>
                    </div>
                    <p className="font-sans text-[9px] mt-1.5" style={{ color: '#C6A9A3' }}>
                      ⌘ + Enter to save
                    </p>
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

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: '#A89E99' }}>
      {children}
    </p>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="font-sans text-[9px] tracking-[0.15em] uppercase mb-1" style={{ color: '#A89E99' }}>{label}</p>
      <p className="font-sans text-sm font-medium" style={{ color: '#3E3A39' }}>{value || '—'}</p>
    </div>
  )
}

function SkinTag({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-xs font-medium"
      style={{ background: 'rgba(198,169,163,0.12)', color: '#C6A9A3' }}>
      {label}: {value}
    </span>
  )
}

function DiagCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl p-5 text-center"
      style={{ background: 'rgba(198,169,163,0.06)', border: '1px solid rgba(198,169,163,0.12)' }}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="font-display text-2xl mb-1" style={{ color: '#3E3A39' }}>{value}</p>
      <p className="font-sans text-[9px] tracking-[0.2em] uppercase" style={{ color: '#A89E99' }}>{label}</p>
    </div>
  )
}
