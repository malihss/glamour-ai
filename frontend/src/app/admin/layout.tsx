'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  LogOut, Menu, X, Sparkles, ExternalLink,
} from 'lucide-react'

const NAV = [
  { href: '/admin',          label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products',  icon: Package },
  { href: '/admin/orders',   label: 'Orders',    icon: ShoppingBag },
  { href: '/admin/users',    label: 'Users',     icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [open,   setOpen]   = useState(false)
  const [status, setStatus] = useState<'loading' | 'authed' | 'redirect'>('loading')

  useEffect(() => {
    if (pathname === '/admin/login') { router.replace('/auth/login?admin=1'); return }
    const token = Cookies.get('admin_token')
    if (!token) { setStatus('redirect'); router.replace('/auth/login?admin=1') }
    else setStatus('authed')
  }, [pathname, router])

  if (status !== 'authed') return null

  const isActive = (item: typeof NAV[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="fixed inset-0 z-[9999] flex overflow-hidden" style={{ fontFamily: 'var(--font-jost)' }}>

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-[220px] shrink-0
        bg-white border-r border-gray-100
        transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#C9A96E] flex items-center justify-center rounded-[4px]">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900 tracking-tight">Glamour AI</span>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-2 mb-2 text-[10px] font-semibold tracking-widest uppercase text-gray-400">Menu</p>
          {NAV.map(item => {
            const Icon   = item.icon
            const active = isActive(item)
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  active
                    ? 'bg-[#C9A96E]/8 text-[#b8954f] font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium'
                }`}>
                <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-100 space-y-0.5 shrink-0">
          <Link href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
            <ExternalLink size={14} strokeWidth={1.8} />
            View Store
          </Link>
          <button onClick={() => { Cookies.remove('admin_token'); router.replace('/auth/login?admin=1') }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <LogOut size={14} strokeWidth={1.8} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {open && <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setOpen(false)} />}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA]">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden -ml-1 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
              <Menu size={18} />
            </button>
            <nav className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-400 font-medium">Admin</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-800 font-semibold">
                {NAV.find(n => isActive(n))?.label ?? 'Panel'}
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C9A96E] to-[#b8954f] flex items-center justify-center">
                <span className="text-[11px] font-bold text-white">A</span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
