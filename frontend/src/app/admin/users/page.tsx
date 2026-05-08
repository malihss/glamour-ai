'use client'

import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '@/lib/adminApi'
import { Search, Users as UsersIcon, Mail, ShoppingBag, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

const AVATAR_COLORS = [
  'from-violet-400 to-violet-600',
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-pink-400 to-pink-600',
  'from-sky-400 to-sky-600',
]

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)
  const perPage = 20

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page), limit: String(perPage) }
      if (search) params.search = search
      const data = await adminApi.getUsers(params)
      setUsers(data.users || [])
      setTotal(data.pagination?.total || 0)
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [fetchUsers, search])

  const totalPages = Math.ceil(total / perPage)

  const initials = (u: any) => {
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ')
    return name
      ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      : u.email?.[0]?.toUpperCase() ?? '?'
  }

  return (
    <div className="space-y-6 max-w-screen-xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-400 mt-0.5">{total.toLocaleString()} registered accounts</p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['User', 'Email', 'Joined', 'Orders', 'Total Spent'].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold tracking-widest uppercase text-gray-400 px-5 py-3.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${50 + (i * j * 11) % 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <UsersIcon size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-400">No users found</p>
                </td>
              </tr>
            ) : users.map((user, idx) => (
              <tr key={user.id} className="hover:bg-gray-50/40 transition-colors">
                {/* Avatar + name */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-[11px] font-bold text-white">{initials(user)}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {[user.firstName, user.lastName].filter(Boolean).join(' ') || <span className="text-gray-400 font-normal">—</span>}
                    </p>
                  </div>
                </td>

                {/* Email */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Mail size={11} className="text-gray-300 flex-shrink-0" />
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </td>

                {/* Joined */}
                <td className="px-5 py-3.5">
                  <p className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </td>

                {/* Orders */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag size={11} className="text-gray-300 flex-shrink-0" />
                    <span className={`text-xs font-bold ${user.orderCount > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                      {user.orderCount ?? 0}
                    </span>
                  </div>
                </td>

                {/* Spent */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <DollarSign size={11} className="text-gray-400" />
                    <span className={`text-sm font-bold ${(user.totalSpent || 0) > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                      {(user.totalSpent || 0).toFixed(2)}
                    </span>
                  </div>
                </td>
              </tr>
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
