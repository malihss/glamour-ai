'use client'

import { useEffect, useState, useCallback, Fragment } from 'react'
import { adminApi } from '@/lib/adminApi'
import { Search, ChevronDown, ShoppingBag, SlidersHorizontal, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

const STATUS_PILL: Record<string, string> = {
  pending:    'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
  confirmed:  'bg-sky-50 text-sky-600 ring-1 ring-sky-100',
  processing: 'bg-violet-50 text-violet-600 ring-1 ring-violet-100',
  shipped:    'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100',
  delivered:  'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
  cancelled:  'bg-red-50 text-red-500 ring-1 ring-red-100',
  refunded:   'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
}

export default function AdminOrdersPage() {
  const [orders,       setOrders]       = useState<any[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page,         setPage]         = useState(1)
  const [total,        setTotal]        = useState(0)
  const [updatingId,   setUpdatingId]   = useState<number | null>(null)
  const [expandedId,   setExpandedId]   = useState<number | null>(null)
  const [details,      setDetails]      = useState<Record<number, any>>({})
  const perPage = 20

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page), limit: String(perPage) }
      if (search)       params.search = search
      if (statusFilter) params.status = statusFilter
      const data = await adminApi.getOrders(params)
      setOrders(data.orders || [])
      setTotal(data.pagination?.total || 0)
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => {
    const t = setTimeout(fetchOrders, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [fetchOrders, search])

  const handleStatusChange = async (id: number, status: string) => {
    setUpdatingId(id)
    try {
      await adminApi.updateOrderStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      toast.success('Status updated')
    } catch (e: any) { toast.error(e.message) }
    finally { setUpdatingId(null) }
  }

  const toggleExpand = async (id: number) => {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id)
    if (details[id]) return
    try {
      const data = await adminApi.getOrder(id)
      setDetails(prev => ({ ...prev, [id]: data.order }))
    } catch (e: any) { toast.error(e.message) }
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6 max-w-screen-xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-400 mt-0.5">{total.toLocaleString()} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search order # or customer..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition" />
        </div>
        <div className="relative">
          <SlidersHorizontal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="pl-8 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10 appearance-none cursor-pointer">
            {STATUSES.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['Order', 'Customer', 'Date', 'Items', 'Total', 'Status', ''].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold tracking-widest uppercase text-gray-400 px-5 py-3.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${50 + (i * j * 7) % 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <ShoppingBag size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-400">No orders found</p>
                </td>
              </tr>
            ) : orders.map(order => (
              <Fragment key={order.id}>
                <tr className={`border-b border-gray-50 hover:bg-gray-50/40 transition-colors ${expandedId === order.id ? 'bg-blue-50/20' : ''}`}>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-bold text-gray-900">#{order.orderNumber}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-gray-700">{order.customerName}</p>
                    <p className="text-[10px] text-gray-400">{order.customerEmail}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{order.itemCount}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-bold text-gray-900">${order.total?.toFixed(2)}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <select value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-60 ${STATUS_PILL[order.status] || 'bg-gray-100 text-gray-500'}`}>
                      {STATUSES.filter(Boolean).map(s => (
                        <option key={s} value={s} className="text-gray-700 bg-white normal-case font-normal text-sm">
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3.5">
                    <button onClick={() => toggleExpand(order.id)}
                      className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                      style={{ transform: expandedId === order.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <ChevronDown size={14} />
                    </button>
                  </td>
                </tr>

                {expandedId === order.id && (
                  <tr className="border-b border-gray-100">
                    <td colSpan={7} className="px-5 py-4 bg-gray-50/50">
                      {details[order.id] ? (
                        <div className="space-y-2 max-w-2xl">
                          <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-3">Order Items</p>
                          {details[order.id].items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-xl">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                                {item.productImage
                                  ? <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center"><Package size={12} className="text-gray-300" /></div>
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{item.productName}</p>
                                {item.variantName && <p className="text-[10px] text-gray-400">{item.variantName}</p>}
                              </div>
                              <p className="text-xs text-gray-500 shrink-0">×{item.quantity}</p>
                              <p className="text-sm font-bold text-gray-800 shrink-0 w-16 text-right">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                          <div className="flex justify-end gap-6 pt-2 text-xs text-gray-500 font-medium">
                            <span>Subtotal: ${details[order.id].subtotal?.toFixed(2)}</span>
                            <span>Tax: ${details[order.id].taxAmount?.toFixed(2)}</span>
                            <span className="font-bold text-gray-900">Total: ${details[order.id].total?.toFixed(2)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400 py-2">
                          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                          <span className="text-xs">Loading...</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400 font-medium">
              {((page - 1) * perPage + 1).toLocaleString()}–{Math.min(page * perPage, total).toLocaleString()} of {total.toLocaleString()}
            </p>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 bg-white rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">← Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 bg-white rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
