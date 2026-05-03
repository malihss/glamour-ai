'use client'
// src/components/layout/CartDrawer.tsx

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore, useAuthStore } from '@/lib/store'
import { cartAPI } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'

export function CartDrawer() {
  const { cart, isOpen, setOpen, setCart, removeItemOptimistic, setLoading } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      cartAPI.get().then(({ data }) => setCart(data.cart)).catch(() => {})
    }
  }, [isAuthenticated, setCart])

  const handleRemove = async (itemId: string) => {
    removeItemOptimistic(itemId)
    try {
      const { data } = await cartAPI.removeItem(itemId)
      setCart(data.cart)
    } catch {
      toast.error('Failed to remove item')
      cartAPI.get().then(({ data }) => setCart(data.cart)).catch(() => {})
    }
  }

  const handleUpdateQty = async (itemId: string, quantity: number) => {
    try {
      const { data } = await cartAPI.updateItem(itemId, quantity)
      setCart(data.cart)
    } catch {
      toast.error('Failed to update quantity')
    }
  }

  const freeShippingThreshold = 75
  const remaining = freeShippingThreshold - (cart?.subtotal || 0)

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-noir/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-ivory shadow-luxury-lg
                       flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-champagne/20">
              <h2 className="font-display text-xl tracking-wide">
                My Bag
                {cart?.itemCount ? (
                  <span className="font-sans text-sm text-champagne ml-2">({cart.itemCount})</span>
                ) : null}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-charcoal-soft hover:text-charcoal transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free shipping progress */}
            {cart && cart.subtotal > 0 && remaining > 0 && (
              <div className="px-6 py-3 bg-ivory-warm">
                <p className="font-sans text-xs text-charcoal-soft mb-2">
                  Spend <span className="text-champagne font-medium">${remaining.toFixed(2)}</span> more for free shipping
                </p>
                <div className="h-0.5 bg-champagne/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-champagne transition-all duration-500"
                    style={{ width: `${Math.min((cart.subtotal / freeShippingThreshold) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!cart?.items?.length ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <ShoppingBag size={48} className="text-champagne/40 mb-4" />
                  <p className="font-display text-xl text-charcoal mb-2">Your bag is empty</p>
                  <p className="font-sans text-sm text-charcoal-soft mb-8">
                    Discover our luxury collection
                  </p>
                  <Link
                    href="/products"
                    onClick={() => setOpen(false)}
                    className="btn-primary"
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4"
                    >
                      {/* Product image */}
                      <div className="w-20 h-24 bg-ivory-warm flex-shrink-0 overflow-hidden">
                        {item.product?.primaryImage ? (
                          <Image
                            src={item.product.primaryImage}
                            alt={item.product.name || ''}
                            width={80}
                            height={96}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={24} className="text-champagne/30" />
                          </div>
                        )}
                      </div>

                      {/* Product details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[10px] tracking-widest uppercase text-champagne mb-0.5">
                          {item.product?.brand?.name}
                        </p>
                        <p className="font-display text-sm text-charcoal leading-tight mb-1">
                          {item.product?.name}
                        </p>
                        {item.variant && (
                          <div className="flex items-center gap-1.5 mb-2">
                            {item.variant.shadeHex && (
                              <span
                                className="w-3 h-3 rounded-full border border-charcoal/20"
                                style={{ background: item.variant.shadeHex }}
                              />
                            )}
                            <p className="font-sans text-xs text-charcoal-soft">{item.variant.name}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          {/* Quantity controls */}
                          <div className="flex items-center gap-2 border border-champagne/30">
                            <button
                              onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-1.5 text-charcoal hover:text-champagne disabled:opacity-30 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-sans text-xs w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                              className="p-1.5 text-charcoal hover:text-champagne transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-sans text-sm font-medium">
                              ${item.totalPrice.toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="p-1 text-charcoal-soft hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart?.items?.length ? (
              <div className="px-6 py-6 border-t border-champagne/20 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm text-charcoal-soft">Subtotal</span>
                  <span className="font-display text-lg">${cart.subtotal.toFixed(2)}</span>
                </div>
                <p className="font-sans text-xs text-charcoal-soft">
                  Shipping and taxes calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="btn-primary block text-center"
                >
                  Checkout — ${cart.subtotal.toFixed(2)}
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full font-sans text-xs tracking-widest uppercase text-center
                             text-charcoal-soft hover:text-charcoal transition-colors py-2"
                >
                  Continue Shopping
                </button>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
