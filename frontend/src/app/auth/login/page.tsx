'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuthStore()

  const [tab, setTab] = useState<'user' | 'admin' | 'consultant'>(
    searchParams?.get('admin') === '1' ? 'admin' : 'user'
  )
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [userForm, setUserForm] = useState({ email: '', password: '' })
  const [adminForm, setAdminForm] = useState({ username: '', password: '' })
  const [consultantPassword, setConsultantPassword] = useState('')

  const switchTab = (t: 'user' | 'admin' | 'consultant') => {
    setTab(t)
    setError('')
    setShowPass(false)
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!userForm.email || !userForm.password) { setError('Please fill in all fields'); return }
    setLoading(true)
    try {
      const { data } = await authAPI.login(userForm.email, userForm.password)
      login(data.user, data.accessToken, data.refreshToken)
      toast.success(`Welcome back, ${data.user.firstName}!`)
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleConsultantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!consultantPassword) { setError('Please enter your password'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/consultant/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: consultantPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid password'); return }
      Cookies.set('consultant_token', data.access_token, { expires: 0.5, sameSite: 'lax' })
      toast.success('Welcome, Beauty Expert!')
      router.push('/consultant')
    } catch {
      setError('Cannot connect to server.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!adminForm.username || !adminForm.password) { setError('Please fill in all fields'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminForm.username, password: adminForm.password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid credentials'); return }
      Cookies.set('admin_token', data.access_token, { expires: 1 })
      toast.success('Welcome, Admin!')
      router.push('/admin')
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left visual */}
      <div className="hidden lg:flex relative bg-noir overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(201,169,110,0.15), transparent 60%)' }} />
        <img
          src="https://i.pinimg.com/736x/de/57/fe/de57fe307198178a503f11369646161a.jpg"
          alt="Beauty"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-16">
          <h1 className="font-display text-5xl text-ivory mb-4">
            GLAMOUR<span className="text-champagne"> AI</span>
          </h1>
          <p className="font-serif text-ivory/50 text-xl">Where beauty meets intelligence</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center px-8 py-16 bg-ivory">
        <div className="w-full max-w-md">
          <Link href="/" className="block lg:hidden mb-10">
            <h2 className="font-display text-2xl text-noir tracking-[0.15em]">
              GLAMOUR<span className="text-champagne"> AI</span>
            </h2>
          </Link>

          {/* Tabs */}
          <div className="flex mb-8 border-b border-champagne/20">
            <button
              onClick={() => switchTab('user')}
              className={`flex-1 pb-3 font-sans text-xs tracking-widest uppercase transition-colors ${
                tab === 'user'
                  ? 'text-noir border-b-2 border-noir -mb-px'
                  : 'text-charcoal-soft hover:text-charcoal'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => switchTab('admin')}
              className={`flex-1 pb-3 font-sans text-xs tracking-widest uppercase transition-colors ${
                tab === 'admin'
                  ? 'text-champagne border-b-2 border-champagne -mb-px'
                  : 'text-charcoal-soft hover:text-charcoal'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => switchTab('consultant')}
              className={`flex-1 pb-3 font-sans text-xs tracking-widest uppercase transition-colors ${
                tab === 'consultant'
                  ? 'border-b-2 -mb-px'
                  : 'text-charcoal-soft hover:text-charcoal'
              }`}
              style={tab === 'consultant' ? { color: '#C6A9A3', borderColor: '#C6A9A3' } : {}}
            >
              Consultant
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === 'user' ? (
              <motion.div key="user"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.15 }}>

                <h2 className="font-display text-3xl text-noir mb-2">Welcome Back</h2>
                <p className="font-serif text-charcoal-soft mb-8">Sign in to your account</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 font-sans text-xs mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleUserSubmit} className="space-y-6">
                  <div>
                    <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-soft/40" />
                      <input
                        type="email"
                        value={userForm.email}
                        onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="input-luxury pl-9"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={userForm.password}
                        onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••"
                        className="input-luxury pr-10"
                        autoComplete="current-password"
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-soft hover:text-charcoal">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <p className="font-sans text-xs text-center text-charcoal-soft mt-8">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="text-champagne hover:underline">Create one</Link>
                </p>
                <div className="mt-6 p-4 bg-ivory-warm border border-champagne/15">
                  <p className="font-sans text-[10px] tracking-wider uppercase text-champagne mb-1.5">Demo</p>
                  <p className="font-sans text-xs text-charcoal-soft">
                    Email: demo@glamour.ai · Password: glamour123
                  </p>
                </div>
              </motion.div>

            ) : tab === 'consultant' ? (
              <motion.div key="consultant"
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}>

                <h2 className="font-display text-3xl text-noir mb-2">Beauty Expert</h2>
                <p className="font-serif text-charcoal-soft mb-8">Sign in to your consultant console</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 font-sans text-xs mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleConsultantSubmit} className="space-y-6">
                  <div>
                    <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-soft/40" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={consultantPassword}
                        onChange={e => { setConsultantPassword(e.target.value); setError('') }}
                        placeholder="••••••••"
                        className="input-luxury pl-9 pr-10"
                        autoFocus
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-soft hover:text-charcoal">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full font-sans text-[11px] tracking-widest uppercase py-3.5 text-white
                               transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)' }}>
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : 'Access Consultant Console'}
                  </button>
                </form>

                <p className="font-sans text-xs text-center text-charcoal-soft mt-8">
                  <Link href="/" className="hover:text-champagne transition-colors">← Back to store</Link>
                </p>
              </motion.div>

            ) : (
              <motion.div key="admin"
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}>

                <h2 className="font-display text-3xl text-noir mb-2">Admin Portal</h2>
                <p className="font-serif text-charcoal-soft mb-8">Sign in to manage your store</p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 font-sans text-xs mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-6">
                  <div>
                    <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-soft/40" />
                      <input
                        type="text"
                        value={adminForm.username}
                        onChange={e => setAdminForm(f => ({ ...f, username: e.target.value }))}
                        placeholder="admin"
                        className="input-luxury pl-9"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-soft/40" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={adminForm.password}
                        onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••"
                        className="input-luxury pl-9 pr-10"
                        autoComplete="current-password"
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-soft hover:text-charcoal">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-noir text-ivory font-sans text-[11px] tracking-widest uppercase py-3.5 hover:bg-champagne hover:text-noir transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : 'Access Admin Panel'}
                  </button>
                </form>

                <p className="font-sans text-xs text-center text-charcoal-soft mt-8">
                  <Link href="/" className="hover:text-champagne transition-colors">← Back to store</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
