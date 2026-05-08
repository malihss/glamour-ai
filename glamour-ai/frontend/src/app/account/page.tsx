'use client'
// src/app/account/page.tsx — Full client dashboard with sidebar and tabbed content

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useWishlistStore } from '@/lib/store'
import { authAPI, ordersAPI } from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  LogOut, User, ShoppingBag, Heart, Sparkles, Settings,
  Package, ChevronRight, Star, Camera, Shield,
} from 'lucide-react'

// ── Constants ──────────────────────────────────────────────────────────────
const SKIN_TONES = ['Fair', 'Light', 'Medium', 'Tan', 'Deep']
const SKIN_TYPES = ['Dry', 'Normal', 'Oily', 'Combination', 'Sensitive']

type Tab = 'overview' | 'orders' | 'wishlist' | 'profile' | 'security'

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-amber-100 text-amber-700',
  confirmed:  'bg-sky-100 text-sky-700',
  processing: 'bg-violet-100 text-violet-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-600',
}

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',  label: 'Overview',      icon: <Star size={15} /> },
  { id: 'orders',    label: 'My Orders',     icon: <Package size={15} /> },
  { id: 'wishlist',  label: 'Wishlist',      icon: <Heart size={15} /> },
  { id: 'profile',   label: 'Edit Profile',  icon: <User size={15} /> },
  { id: 'security',  label: 'Security',      icon: <Shield size={15} /> },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status?.toLowerCase()] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium capitalize ${cls}`}>
      {status}
    </span>
  )
}

// ── Component ──────────────────────────────────────────────────────────────
export default function AccountPage() {
  const { isAuthenticated, user, logout, setUser } = useAuthStore()
  const { items: wishlistItems } = useWishlistStore()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [form, setForm] = useState({ firstName: '', lastName: '', skinTone: '', skinType: '' })
  const [orders, setOrders] = useState<any[]>([])
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwSaving, setPwSaving] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  // Populate form from user
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName:  user.lastName  || '',
        skinTone:  user.skinTone  || '',
        skinType:  user.skinType  || '',
      })
    }
  }, [user])

  // Fetch orders when relevant tab is active
  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'orders') {
      setOrdersLoading(true)
      ordersAPI.list()
        .then(({ data }) => {
          setOrders(data.orders ?? [])
          setOrdersTotal(data.pagination?.total ?? data.orders?.length ?? 0)
        })
        .catch(() => { setOrders([]); setOrdersTotal(0) })
        .finally(() => setOrdersLoading(false))
    }
  }, [activeTab])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await authAPI.updateProfile(form)
      setUser(data.user)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (pwForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setPwSaving(true)
    try {
      await authAPI.changePassword(pwForm.currentPassword, pwForm.newPassword)
      toast.success('Password updated successfully')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update password')
    } finally {
      setPwSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Signed out successfully')
    router.push('/')
  }

  if (!user) return null

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
  const wishlistCount = wishlistItems.length

  return (
    <div className="pt-[88px] min-h-screen bg-[#f6f5f3]">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-28">

              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-3">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display font-semibold text-white select-none"
                    style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #E8D5A3 50%, #A07840 100%)' }}
                  >
                    {initials}
                  </div>
                  <button
                    className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full
                               flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                    aria-label="Change avatar"
                  >
                    <Camera size={13} className="text-charcoal-soft" />
                  </button>
                </div>
                <p className="font-display text-lg text-charcoal font-semibold text-center leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="font-sans text-xs text-charcoal-soft text-center mt-0.5">{user.email}</p>

                {/* Skin badges */}
                {(user.skinTone || user.skinType) && (
                  <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                    {user.skinTone && (
                      <span className="px-2.5 py-0.5 bg-champagne/10 text-champagne-dark border border-champagne/20 rounded-full text-[11px] font-sans capitalize">
                        {user.skinTone}
                      </span>
                    )}
                    {user.skinType && (
                      <span className="px-2.5 py-0.5 bg-champagne/10 text-champagne-dark border border-champagne/20 rounded-full text-[11px] font-sans capitalize">
                        {user.skinType}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Nav */}
              <nav className="space-y-1 mb-6">
                {NAV_ITEMS.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-sans text-sm transition-all ${
                      activeTab === id
                        ? 'bg-champagne/8 text-champagne font-semibold'
                        : 'text-charcoal-soft hover:text-charcoal hover:bg-gray-50'
                    }`}
                  >
                    <span className={activeTab === id ? 'text-champagne' : 'text-charcoal-soft'}>
                      {icon}
                    </span>
                    {label}
                    {activeTab === id && <ChevronRight size={13} className="ml-auto text-champagne" />}
                  </button>
                ))}
              </nav>

              {/* Quick links */}
              <div className="border-t border-gray-100 pt-4 mb-4 space-y-1">
                <Link
                  href="/tryon"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm
                             text-charcoal-soft hover:text-charcoal hover:bg-gray-50 transition-all"
                >
                  <Sparkles size={15} className="text-charcoal-soft" />
                  Virtual Try-On
                </Link>
                <Link
                  href="/products"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm
                             text-charcoal-soft hover:text-charcoal hover:bg-gray-50 transition-all"
                >
                  <ShoppingBag size={15} className="text-charcoal-soft" />
                  Shop Products
                </Link>
              </div>

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm
                           text-charcoal-soft hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <main className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >

              {/* ── Overview ──────────────────────────────────────────── */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="font-display text-3xl text-charcoal">
                      Welcome back, {user.firstName} ✨
                    </h1>
                    <p className="font-sans text-sm text-charcoal-soft mt-1">
                      Here's a summary of your account activity.
                    </p>
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Orders',     value: ordersLoading ? '—' : ordersTotal,   icon: <Package size={18} className="text-champagne" /> },
                      { label: 'Wishlist',   value: wishlistCount,                        icon: <Heart size={18} className="text-champagne" /> },
                      { label: 'Skin Tone',  value: user.skinTone  ? user.skinTone  : '—', icon: <Star size={18} className="text-champagne" /> },
                      { label: 'Skin Type',  value: user.skinType  ? user.skinType  : '—', icon: <Sparkles size={18} className="text-champagne" /> },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-sans text-xs text-charcoal-soft uppercase tracking-wider">{label}</span>
                          {icon}
                        </div>
                        <p className="font-display text-2xl text-charcoal capitalize">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent orders */}
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-display text-xl text-charcoal">Recent Orders</h2>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="font-sans text-xs text-champagne hover:text-champagne-dark transition-colors flex items-center gap-1"
                      >
                        View all <ChevronRight size={13} />
                      </button>
                    </div>
                    {ordersLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="skeleton h-14 rounded-xl" />
                        ))}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-10">
                        <Package size={36} className="text-gray-200 mx-auto mb-3" />
                        <p className="font-sans text-sm text-charcoal-soft">No orders yet</p>
                        <button
                          onClick={() => router.push('/products')}
                          className="mt-4 btn-primary text-xs px-6 py-3"
                        >
                          Start Shopping
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 3).map((order: any) => (
                          <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                            <div>
                              <p className="font-sans text-sm font-medium text-charcoal">
                                #{order.orderNumber ?? order.id?.slice(0, 8)}
                              </p>
                              <p className="font-sans text-xs text-charcoal-soft mt-0.5">
                                {order.createdAt ? formatDate(order.createdAt) : '—'}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <StatusBadge status={order.status} />
                              <span className="font-sans text-sm font-semibold text-charcoal">
                                ${Number(order.total ?? 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      href="/tryon"
                      className="bg-charcoal rounded-2xl p-6 flex items-center justify-between group hover:bg-charcoal-light transition-colors"
                    >
                      <div>
                        <p className="font-display text-lg text-white mb-1">Virtual Try-On</p>
                        <p className="font-sans text-xs text-white/60">See makeup on your face</p>
                      </div>
                      <Sparkles size={28} className="text-champagne group-hover:scale-110 transition-transform" />
                    </Link>
                    <Link
                      href="/products"
                      className="rounded-2xl p-6 flex items-center justify-between group hover:opacity-90 transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #E8D5A3 100%)' }}
                    >
                      <div>
                        <p className="font-display text-lg text-noir mb-1">Shop Now</p>
                        <p className="font-sans text-xs text-noir/60">Explore our collection</p>
                      </div>
                      <ShoppingBag size={28} className="text-noir group-hover:scale-110 transition-transform" />
                    </Link>
                  </div>
                </div>
              )}

              {/* ── Orders ────────────────────────────────────────────── */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h1 className="font-display text-3xl text-charcoal">My Orders</h1>
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                    {ordersLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="skeleton h-20 rounded-xl" />
                        ))}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-16">
                        <Package size={48} className="text-gray-200 mx-auto mb-4" />
                        <p className="font-display text-xl text-charcoal mb-2">No orders yet</p>
                        <p className="font-sans text-sm text-charcoal-soft mb-6">
                          When you place an order, it will appear here.
                        </p>
                        <Link href="/products" className="btn-primary">
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order: any) => (
                          <div
                            key={order.id}
                            className="border border-gray-100 rounded-xl p-4 hover:border-champagne/30 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <p className="font-sans text-sm font-semibold text-charcoal">
                                    Order #{order.orderNumber ?? order.id?.slice(0, 8)}
                                  </p>
                                  <StatusBadge status={order.status} />
                                </div>
                                <p className="font-sans text-xs text-charcoal-soft mt-1">
                                  {order.createdAt ? formatDate(order.createdAt) : '—'}
                                </p>
                                {/* Product thumbnails */}
                                {order.items?.length > 0 && (
                                  <div className="flex gap-2 mt-3">
                                    {order.items.slice(0, 4).map((item: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0"
                                      >
                                        {item.snapshot?.primaryImage ? (
                                          <img
                                            src={item.snapshot.primaryImage}
                                            alt={item.productName ?? 'Product'}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag size={16} className="text-gray-300" />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    {order.items.length > 4 && (
                                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                        <span className="font-sans text-xs text-charcoal-soft">
                                          +{order.items.length - 4}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-sans text-base font-semibold text-charcoal">
                                  ${Number(order.total ?? 0).toFixed(2)}
                                </p>
                                {order.items?.length > 0 && (
                                  <p className="font-sans text-xs text-charcoal-soft mt-0.5">
                                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Wishlist ───────────────────────────────────────────── */}
              {activeTab === 'wishlist' && (
                <div className="space-y-6">
                  <h1 className="font-display text-3xl text-charcoal">Wishlist</h1>
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                    {wishlistCount === 0 ? (
                      <div className="text-center py-16">
                        <Heart size={48} className="text-gray-200 mx-auto mb-4" />
                        <p className="font-display text-xl text-charcoal mb-2">Your wishlist is empty</p>
                        <p className="font-sans text-sm text-charcoal-soft mb-6">
                          Save products you love and come back to them anytime.
                        </p>
                        <Link href="/products" className="btn-primary">
                          Discover Products
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <p className="font-sans text-sm text-charcoal-soft">
                            {wishlistCount} saved item{wishlistCount !== 1 ? 's' : ''}
                          </p>
                          <Link
                            href="/wishlist"
                            className="font-sans text-xs text-champagne hover:text-champagne-dark transition-colors flex items-center gap-1"
                          >
                            View full wishlist <ChevronRight size={13} />
                          </Link>
                        </div>
                        <Link href="/wishlist" className="btn-primary inline-flex items-center gap-2">
                          <Heart size={14} />
                          Go to Wishlist
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Profile ───────────────────────────────────────────── */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h1 className="font-display text-3xl text-charcoal">Edit Profile</h1>
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
                    <form onSubmit={handleSave} className="space-y-8 max-w-lg">

                      {/* Name row */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="label-luxury">First Name</label>
                          <input
                            type="text"
                            value={form.firstName}
                            onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                            className="input-luxury"
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <label className="label-luxury">Last Name</label>
                          <input
                            type="text"
                            value={form.lastName}
                            onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                            className="input-luxury"
                            placeholder="Last name"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="label-luxury">Email</label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="input-luxury opacity-50 cursor-not-allowed"
                        />
                      </div>

                      {/* Skin tone */}
                      <div>
                        <label className="label-luxury">Skin Tone</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {SKIN_TONES.map(tone => (
                            <button
                              key={tone}
                              type="button"
                              onClick={() => setForm(f => ({ ...f, skinTone: tone.toLowerCase() }))}
                              className={`px-4 py-2 rounded-lg font-sans text-xs border transition-all ${
                                form.skinTone === tone.toLowerCase()
                                  ? 'bg-champagne border-champagne text-noir font-semibold'
                                  : 'border-gray-200 text-charcoal-soft hover:border-champagne/50'
                              }`}
                            >
                              {tone}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Skin type */}
                      <div>
                        <label className="label-luxury">Skin Type</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {SKIN_TYPES.map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setForm(f => ({ ...f, skinType: type.toLowerCase() }))}
                              className={`px-4 py-2 rounded-lg font-sans text-xs border transition-all ${
                                form.skinType === type.toLowerCase()
                                  ? 'bg-champagne border-champagne text-noir font-semibold'
                                  : 'border-gray-200 text-charcoal-soft hover:border-champagne/50'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ── Security ──────────────────────────────────────────── */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h1 className="font-display text-3xl text-charcoal">Security</h1>
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
                    <h2 className="font-display text-xl text-charcoal mb-6">Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-8 max-w-md">

                      <div>
                        <label className="label-luxury">Current Password</label>
                        <input
                          type="password"
                          value={pwForm.currentPassword}
                          onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                          className="input-luxury"
                          placeholder="Enter current password"
                          required
                        />
                      </div>

                      <div>
                        <label className="label-luxury">New Password</label>
                        <input
                          type="password"
                          value={pwForm.newPassword}
                          onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                          className="input-luxury"
                          placeholder="At least 8 characters"
                          required
                        />
                      </div>

                      <div>
                        <label className="label-luxury">Confirm New Password</label>
                        <input
                          type="password"
                          value={pwForm.confirmPassword}
                          onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                          className="input-luxury"
                          placeholder="Repeat new password"
                          required
                        />
                      </div>

                      <button type="submit" disabled={pwSaving} className="btn-primary disabled:opacity-60">
                        {pwSaving ? 'Updating…' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </motion.div>
          </main>

        </div>
      </div>
    </div>
  )
}
