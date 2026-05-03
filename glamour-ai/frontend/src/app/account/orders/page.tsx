'use client'
// src/app/account/orders/page.tsx

import { useQuery } from 'react-query'
import { ordersAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Package, ChevronRight } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login')
  }, [isAuthenticated, router])

  const { data, isLoading } = useQuery(
    'orders',
    () => ordersAPI.list().then(r => r.data),
    { enabled: isAuthenticated }
  )

  return (
    <div className="pt-[88px] min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <h2 className="font-display text-2xl text-noir mb-6">
              {user?.firstName} {user?.lastName}
            </h2>
            <nav className="space-y-2">
              {[
                { href: '/account', label: 'Profile' },
                { href: '/account/orders', label: 'Orders', active: true },
                { href: '/wishlist', label: 'Wishlist' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block font-sans text-xs tracking-widest uppercase py-2 border-l-2 pl-4 transition-colors ${
                    link.active
                      ? 'border-champagne text-champagne'
                      : 'border-transparent text-charcoal-soft hover:text-charcoal hover:border-champagne/30'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Orders list */}
          <div className="md:col-span-3">
            <h3 className="font-display text-2xl text-noir mb-8">Order History</h3>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 skeleton" />
                ))}
              </div>
            ) : !data?.orders?.length ? (
              <div className="text-center py-20">
                <Package size={48} className="text-champagne/30 mx-auto mb-4" />
                <p className="font-display text-xl text-charcoal mb-6">No orders yet</p>
                <Link href="/products" className="btn-primary">Start Shopping</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {data.orders.map((order: any) => (
                  <div key={order.id} className="bg-ivory-warm border border-champagne/10 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-sans text-[10px] tracking-widest uppercase text-champagne mb-1">
                          Order #{order.orderNumber}
                        </p>
                        <p className="font-sans text-xs text-charcoal-soft">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-sans text-[10px] px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="font-display text-base">${order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {order.items.slice(0, 4).map((item: any, i: number) => (
                        <div key={item.id} className="flex-shrink-0">
                          <div className="w-16 h-20 bg-ivory overflow-hidden">
                            {item.snapshot?.primaryImage && (
                              <img src={item.snapshot.primaryImage} alt={item.productName}
                                className="w-full h-full object-cover" />
                            )}
                          </div>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-16 h-20 bg-ivory flex items-center justify-center flex-shrink-0">
                          <span className="font-sans text-xs text-charcoal-soft">
                            +{order.items.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
