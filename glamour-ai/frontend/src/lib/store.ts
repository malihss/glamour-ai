// src/lib/store.ts — Global state management with Zustand

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'

// ── Types ──────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  skinTone?: string
  skinType?: string
  preferences?: Record<string, unknown>
}

export interface Product {
  id: string
  name: string
  slug: string
  shortDescription: string
  description?: string
  price: number
  compareAtPrice?: number
  primaryImage?: string
  images?: ProductImage[]
  avgRating?: number
  reviewCount?: number
  brand?: { id: number; name: string; slug: string }
  category?: { id: number; name: string; slug: string }
  variants?: ProductVariant[]
  isFeatured?: boolean
  tags?: string[]
}

export interface ProductImage {
  id: string
  url: string
  altText?: string
  isPrimary: boolean
}

export interface ProductVariant {
  id: string
  name: string
  shadeHex?: string
  priceModifier?: number
  stockQuantity: number
}

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product?: Product
  variant?: ProductVariant
}

export interface Cart {
  id: string
  items: CartItem[]
  itemCount: number
  subtotal: number
}

// ── Auth Store ─────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  login: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),

      login: (user, accessToken, refreshToken) => {
        Cookies.set('access_token', accessToken, { expires: 1, sameSite: 'lax' })
        Cookies.set('refresh_token', refreshToken, { expires: 30, sameSite: 'lax' })
        set({ user, isAuthenticated: true, isLoading: false })
      },

      logout: () => {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'glamour-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// ── Cart Store ─────────────────────────────────────────────────────────────
interface CartState {
  cart: Cart | null
  isOpen: boolean
  isLoading: boolean
  setCart: (cart: Cart | null) => void
  setOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  addItemOptimistic: (item: CartItem) => void
  removeItemOptimistic: (itemId: string) => void
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  setCart: (cart) => set({ cart }),
  setOpen: (isOpen) => set({ isOpen }),
  setLoading: (isLoading) => set({ isLoading }),

  addItemOptimistic: (item) => {
    const { cart } = get()
    if (!cart) return
    const existing = cart.items.find(
      (i) => i.productId === item.productId && i.variantId === item.variantId
    )
    if (existing) {
      const updatedItems = cart.items.map((i) =>
        i.id === existing.id
          ? { ...i, quantity: i.quantity + item.quantity, totalPrice: (i.quantity + item.quantity) * i.unitPrice }
          : i
      )
      set({
        cart: {
          ...cart,
          items: updatedItems,
          itemCount: updatedItems.reduce((s, i) => s + i.quantity, 0),
          subtotal: updatedItems.reduce((s, i) => s + i.totalPrice, 0),
        }
      })
    } else {
      const items = [...cart.items, item]
      set({
        cart: {
          ...cart,
          items,
          itemCount: items.reduce((s, i) => s + i.quantity, 0),
          subtotal: items.reduce((s, i) => s + i.totalPrice, 0),
        }
      })
    }
  },

  removeItemOptimistic: (itemId) => {
    const { cart } = get()
    if (!cart) return
    const items = cart.items.filter((i) => i.id !== itemId)
    set({
      cart: {
        ...cart,
        items,
        itemCount: items.reduce((s, i) => s + i.quantity, 0),
        subtotal: items.reduce((s, i) => s + i.totalPrice, 0),
      }
    })
  },
}))

// ── UI Store ───────────────────────────────────────────────────────────────
interface UIState {
  searchOpen: boolean
  chatOpen: boolean
  mobileMenuOpen: boolean
  setSearchOpen: (open: boolean) => void
  setChatOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  searchOpen: false,
  chatOpen: false,
  mobileMenuOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setChatOpen: (chatOpen) => set({ chatOpen }),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
}))

// ── Wishlist Store ─────────────────────────────────────────────────────────
interface WishlistState {
  items: string[]
  toggleItem: (productId: string) => void
  hasItem: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (productId) => {
        const { items } = get()
        if (items.includes(productId)) {
          set({ items: items.filter(id => id !== productId) })
        } else {
          set({ items: [...items, productId] })
        }
      },

      hasItem: (productId) => get().items.includes(productId),
    }),
    {
      name: 'glamour-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
