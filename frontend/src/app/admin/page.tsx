'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { Package, ShoppingBag, Users, DollarSign, Clock, Star, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

const STATUS_PILL: Record<string, string> = {
  pending:    'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
  confirmed:  'bg-sky-50 text-sky-600 ring-1 ring-sky-100',
  processing: 'bg-violet-50 text-violet-600 ring-1 ring-violet-100',
  shipped:    'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100',
  delivered:  'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
  cancelled:  'bg-red-50 text-red-500 ring-1 ring-red-100',
  refunded:   'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then(d => setStats({ ...d.stats, monthlyRevenue: d.monthlyRevenue || [], recentOrders: d.recentOrders || [] }))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total Products', value: stats?.totalProducts ?? 0,  icon: Package,      accent: '#8B5CF6', href: '/admin/products' },
    { label: 'Total Orders',   value: stats?.totalOrders   ?? 0,  icon: ShoppingBag,  accent: '#3B82F6', href: '/admin/orders' },
    { label: 'Total Users',    value: stats?.totalUsers    ?? 0,  icon: Users,        accent: '#10B981', href: '/admin/users' },
    { label: 'Revenue',        value: `$${Number(stats?.totalRevenue ?? 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign, accent: '#C9A96E' },
    { label: 'Pending Orders', value: stats?.pendingOrders   ?? 0, icon: Clock,  accent: '#F59E0B', href: '/admin/orders?status=pending' },
    { label: 'Featured',       value: stats?.featuredProducts ?? 0, icon: Star,  accent: '#EC4899', href: '/admin/products?featured=true' },
  ]

  const maxRev = Math.max(...(stats?.monthlyRevenue?.map((m: any) => m.revenue) ?? [1]), 1)

  return (
    <div className="space-y-7 max-w-screen-xl">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Welcome back, here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          : cards.map(card => {
              const Icon = card.icon
              const inner = (
                <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 rounded-t-xl" style={{ background: card.accent }} />
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg" style={{ background: `${card.accent}15` }}>
                      <Icon size={15} style={{ color: card.accent }} />
                    </div>
                    {card.href && <ArrowUpRight size={13} className="text-gray-200 group-hover:text-gray-400 transition-colors" />}
                  </div>
                  <p className="text-[22px] font-bold text-gray-900 leading-none mb-1">{card.value}</p>
                  <p className="text-xs text-gray-400 font-medium">{card.label}</p>
                </div>
              )
              return card.href
                ? <Link key={card.label} href={card.href}>{inner}</Link>
                : <div key={card.label}>{inner}</div>
            })
        }
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Bar chart */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Monthly Revenue</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
              ${Number(stats?.totalRevenue ?? 0).toLocaleString('en', { minimumFractionDigits: 0 })}
            </span>
          </div>

          {loading ? (
            <div className="flex items-end gap-3 h-36">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-1 bg-gray-100 rounded-t-md animate-pulse" style={{ height: `${30 + Math.random() * 60}%` }} />
              ))}
            </div>
          ) : stats?.monthlyRevenue?.length > 0 ? (
            <div className="relative">
              {/* Grid lines */}
              <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="border-t border-gray-50" />
                ))}
              </div>
              <div className="flex items-end gap-2.5 h-36 relative">
                {stats.monthlyRevenue.map((m: any, i: number) => {
                  const pct    = (m.revenue / maxRev) * 100
                  const isLast = i === stats.monthlyRevenue.length - 1
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group/bar">
                      <span className="text-[9px] text-gray-400 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        {m.revenue > 0 ? `$${m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(1)}k` : m.revenue.toFixed(0)}` : '–'}
                      </span>
                      <div className={`w-full rounded-t-md transition-all cursor-default ${isLast ? 'bg-[#C9A96E]' : 'bg-gray-200 group-hover/bar:bg-gray-300'}`}
                        style={{ height: `${Math.max(pct, 3)}%` }} />
                      <span className="text-[9px] text-gray-400 font-medium">{m.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="h-36 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <DollarSign size={18} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No revenue data yet</p>
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-[#C9A96E] hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : stats?.recentOrders?.length > 0 ? (
            <div className="flex-1 space-y-1 overflow-y-auto">
              {stats.recentOrders.slice(0, 7).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between px-3 py-2.5 -mx-1 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800">#{order.orderNumber}</p>
                    <p className="text-[10px] text-gray-400 truncate">{order.customerName}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_PILL[order.status] || 'bg-gray-100 text-gray-500'}`}>
                      {order.status}
                    </span>
                    <span className="text-xs font-bold text-gray-700 w-14 text-right">${order.total?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <ShoppingBag size={18} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
