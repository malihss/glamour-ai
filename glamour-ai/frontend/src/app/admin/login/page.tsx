'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { Sparkles, Eye, EyeOff, Lock, User } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (Cookies.get('admin_token')) router.replace('/admin')
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid credentials')
        return
      }
      Cookies.set('admin_token', data.access_token, { expires: 1 })
      router.replace('/admin')
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A96E]/5 via-transparent to-transparent" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(201,169,110,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(201,169,110,0.05) 0%, transparent 50%)',
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="w-8 h-8 border border-[#C9A96E]/30 flex items-center justify-center">
            <Sparkles size={14} className="text-[#C9A96E]" />
          </div>
          <span className="font-sans text-sm tracking-[0.25em] uppercase text-white/60">Glamour AI</span>
        </div>

        <div className="relative">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#C9A96E]/60 mb-4">Admin Portal</p>
          <h2 className="font-sans text-4xl font-light text-white leading-tight mb-6">
            Manage your<br />
            <span className="text-[#C9A96E]">luxury store</span>
          </h2>
          <p className="font-sans text-sm text-white/30 leading-relaxed max-w-xs">
            Products, orders, customers — everything in one beautiful interface.
          </p>
        </div>

        <div className="relative flex gap-6">
          {[['1,014', 'Products'], ['3', 'Users'], ['0', 'Orders']].map(([n, l]) => (
            <div key={l}>
              <p className="font-sans text-xl text-white/80 font-light">{n}</p>
              <p className="font-sans text-[10px] tracking-wider uppercase text-white/20">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-7 h-7 border border-[#C9A96E]/30 flex items-center justify-center">
              <Sparkles size={12} className="text-[#C9A96E]" />
            </div>
            <span className="font-sans text-sm tracking-[0.2em] uppercase text-white/60">Glamour AI Admin</span>
          </div>

          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#C9A96E]/60 mb-2">Welcome back</p>
          <h1 className="font-sans text-2xl font-light text-white mb-8">Sign in to continue</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/8 border border-red-500/20 px-4 py-3 rounded">
                <div className="w-1 h-1 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                <p className="font-sans text-xs text-red-400 leading-relaxed">{error}</p>
              </div>
            )}

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                <User size={14} />
              </div>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                autoFocus
                required
                className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/15 focus:border-[#C9A96E]/40 text-white placeholder-white/20 font-sans text-sm pl-11 pr-4 py-3.5 rounded outline-none transition-colors"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                <Lock size={14} />
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/15 focus:border-[#C9A96E]/40 text-white placeholder-white/20 font-sans text-sm pl-11 pr-11 py-3.5 rounded outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A96E] hover:bg-[#b8954f] disabled:opacity-50 text-[#0f0f0f] font-sans text-xs tracking-[0.2em] uppercase font-semibold py-3.5 rounded transition-colors mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-[#0f0f0f]/30 border-t-[#0f0f0f] rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 font-sans text-[10px] text-white/15 text-center">
            Glamour AI Admin — Restricted Access
          </p>
        </div>
      </div>
    </div>
  )
}
