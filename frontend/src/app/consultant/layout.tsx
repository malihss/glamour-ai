'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { LogOut, Sparkles } from 'lucide-react'

export default function ConsultantLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (pathname === '/consultant/login') { setReady(true); return }
    const token = Cookies.get('consultant_token')
    if (!token) {
      router.replace('/consultant/login')
    } else {
      setReady(true)
    }
  }, [pathname, router])

  if (!ready) return null

  if (pathname === '/consultant/login') return <>{children}</>

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: '#FAF8F6', fontFamily: 'var(--font-jost)' }}>

      {/* Top bar */}
      <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b"
        style={{ background: '#fff', borderColor: 'rgba(198,169,163,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)' }}>
            <Sparkles size={13} className="text-white" />
          </div>
          <div>
            <span className="font-display text-base tracking-[0.12em]" style={{ color: '#3E3A39' }}>
              GLAMOUR <span style={{ color: '#C6A9A3' }}>AI</span>
            </span>
            <span className="ml-3 font-sans text-[10px] tracking-[0.2em] uppercase"
              style={{ color: '#C6A9A3' }}>
              Beauty Expert
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" target="_blank"
            className="font-sans text-xs tracking-widest uppercase transition-colors"
            style={{ color: '#A89E99' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#3E3A39')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#A89E99')}
          >
            View Store
          </Link>
          <button
            onClick={() => { Cookies.remove('consultant_token'); router.replace('/consultant/login') }}
            className="flex items-center gap-1.5 font-sans text-xs tracking-widest uppercase transition-colors"
            style={{ color: '#A89E99' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C6A9A3')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#A89E99')}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden p-6">
        {children}
      </main>
    </div>
  )
}
