'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { consultantApi } from '@/lib/consultantApi'
import { Sparkles, Eye, EyeOff } from 'lucide-react'

export default function ConsultantLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError('')
    try {
      const data = await consultantApi.login(password)
      Cookies.set('consultant_token', data.access_token, { expires: 0.5, sameSite: 'lax' })
      router.replace('/consultant')
    } catch (err: any) {
      setError(err.message || 'Invalid password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #FAF8F6 0%, #F0E8E5 100%)' }}>

      {/* Card */}
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)' }}>
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="font-display text-2xl tracking-[0.15em] mb-1" style={{ color: '#3E3A39' }}>
            GLAMOUR <span style={{ color: '#C6A9A3' }}>AI</span>
          </h1>
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase" style={{ color: '#C6A9A3' }}>
            Beauty Expert Console
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_8px_48px_rgba(62,58,57,0.08)]"
          style={{ border: '1px solid rgba(198,169,163,0.15)' }}>
          <h2 className="font-display text-xl mb-1" style={{ color: '#3E3A39' }}>Welcome back</h2>
          <p className="font-sans text-xs mb-7" style={{ color: '#A89E99' }}>
            Sign in to access your client console
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block font-sans text-[10px] tracking-[0.2em] uppercase mb-2"
                style={{ color: '#7A736F' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="Enter consultant password"
                  className="w-full pr-10 pl-4 py-3 font-sans text-sm rounded-lg border outline-none transition-all"
                  style={{
                    borderColor: error ? '#E57373' : 'rgba(198,169,163,0.3)',
                    color: '#3E3A39',
                    background: '#FDFCFB',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#C6A9A3')}
                  onBlur={e => (e.currentTarget.style.borderColor = error ? '#E57373' : 'rgba(198,169,163,0.3)')}
                  autoFocus
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#A89E99' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {error && (
                <p className="mt-2 font-sans text-xs" style={{ color: '#E57373' }}>{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!password || loading}
              className="w-full py-3 font-sans text-xs tracking-[0.2em] uppercase text-white
                         rounded-lg transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 font-sans text-[10px]" style={{ color: '#C6A9A3' }}>
          © 2026 Glamour AI · Beauty Expert Console
        </p>
      </div>
    </div>
  )
}
