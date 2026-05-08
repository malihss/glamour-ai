'use client'
// src/app/auth/signup/page.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const SKIN_TONES = ['Fair', 'Light', 'Medium', 'Tan', 'Deep']
const SKIN_TYPES = ['Dry', 'Normal', 'Oily', 'Combination', 'Sensitive']

export default function SignupPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    skinTone: '', skinType: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) e.email = 'Valid email required'
    if (form.password.length < 8) e.password = 'At least 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authAPI.signup(form)
      login(data.user, data.accessToken, data.refreshToken)
      toast.success('Welcome to Glamour AI!')
      router.push('/')
    } catch (err: any) {
      setErrors({ general: err.response?.data?.error || 'Signup failed' })
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Visual */}
      <div className="hidden lg:block relative bg-noir overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900"
          alt="Beauty"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 70% 40%, rgba(232,180,184,0.12), transparent 60%)' }} />
        <div className="absolute inset-0 flex flex-col justify-end p-16">
          <p className="font-display text-3xl text-ivory/80 mb-2 italic">
            "Luxury beauty, intelligently personalised"
          </p>
          <p className="font-sans text-xs tracking-widest uppercase text-champagne">
            Glamour AI
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-8 py-16 bg-ivory">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="block lg:hidden mb-10">
            <h2 className="font-display text-2xl text-noir tracking-[0.15em]">
              GLAMOUR<span className="text-champagne"> AI</span>
            </h2>
          </Link>

          <h2 className="font-display text-3xl text-noir mb-2">Create Account</h2>
          <p className="font-serif text-charcoal-soft mb-8">
            Step {step} of 2 — {step === 1 ? 'Personal Details' : 'Beauty Profile'}
          </p>

          {/* Progress bar */}
          <div className="h-0.5 bg-champagne/15 mb-10 relative">
            <div className="h-full bg-champagne transition-all duration-500"
              style={{ width: step === 1 ? '50%' : '100%' }} />
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 font-sans text-xs mb-6">
              {errors.general}
            </div>
          )}

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); validateStep1() && setStep(2) } : handleSubmit}>
            {step === 1 ? (
              <div className="space-y-7">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                      className="input-luxury"
                    />
                    {errors.firstName && <p className="font-sans text-xs text-red-500 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                      className="input-luxury"
                    />
                    {errors.lastName && <p className="font-sans text-xs text-red-500 mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className="input-luxury"
                  />
                  {errors.email && <p className="font-sans text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                      className="input-luxury pr-10"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-0 top-3 text-charcoal-soft">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="font-sans text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                <button type="submit" className="btn-primary w-full">Continue</button>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-4">
                    Your Skin Tone
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {SKIN_TONES.map(tone => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, skinTone: tone.toLowerCase() }))}
                        className={`px-5 py-2.5 font-sans text-xs border transition-all ${
                          form.skinTone === tone.toLowerCase()
                            ? 'bg-champagne border-champagne text-noir'
                            : 'border-charcoal/20 text-charcoal hover:border-champagne'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft block mb-4">
                    Your Skin Type
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {SKIN_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, skinType: type.toLowerCase() }))}
                        className={`px-5 py-2.5 font-sans text-xs border transition-all ${
                          form.skinType === type.toLowerCase()
                            ? 'bg-champagne border-champagne text-noir'
                            : 'border-charcoal/20 text-charcoal hover:border-champagne'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <p className="font-sans text-xs text-charcoal-soft mt-3">
                    This helps us personalise product recommendations for you.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>

                <p className="font-sans text-xs text-center text-charcoal-soft">
                  You can skip this step — we'll personalise as you shop.
                </p>
              </div>
            )}
          </form>

          <p className="font-sans text-xs text-center text-charcoal-soft mt-8">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-champagne hover:text-champagne-dark">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
