// src/lib/api.ts — Axios API client with auth interceptors

import axios, { AxiosError, AxiosInstance } from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = Cookies.get('refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, null, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          })
          const { accessToken } = response.data
          Cookies.set('access_token', accessToken, { expires: 1 })
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch {
          // Refresh failed, clear auth
          Cookies.remove('access_token')
          Cookies.remove('refresh_token')
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
        }
      }
    }

    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data: SignupData) => api.post('/auth/signup', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data: Partial<UserProfile>) => api.put('/auth/me', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
}

// ── Products ──────────────────────────────────────────────────────────────
export const productsAPI = {
  list: (params?: ProductQueryParams) => api.get('/products/', { params }),
  getFeatured: () => api.get('/products/featured'),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  getCategories: () => api.get('/products/categories'),
  getBrands: () => api.get('/products/brands'),
  searchSuggestions: (q: string) => api.get('/products/search/suggestions', { params: { q } }),
  addReview: (productId: string, data: ReviewData) =>
    api.post(`/products/${productId}/reviews`, data),
}

// ── Cart ──────────────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart/'),
  addItem: (productId: string, variantId?: string, quantity = 1) =>
    api.post('/cart/items', { productId, variantId, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart/clear'),
}

// ── Payment ───────────────────────────────────────────────────────────────
export const paymentAPI = {
  createIntent: () => api.post('/payment/create-intent'),
}

// ── Orders ────────────────────────────────────────────────────────────────
export const ordersAPI = {
  list: (page = 1) => api.get('/orders/', { params: { page } }),
  get: (orderId: string) => api.get(`/orders/${orderId}`),
  checkout: (data: CheckoutData) => api.post('/orders/checkout', data),
}

// ── Recommendations ───────────────────────────────────────────────────────
export const recommendationsAPI = {
  get: (context = 'homepage', limit = 8) =>
    api.get('/recommendations/', { params: { context, limit } }),
  similar: (productId: string, limit = 4) =>
    api.get(`/recommendations/similar/${productId}`, { params: { limit } }),
  track: (productId: string, type: string, metadata?: object) =>
    api.post('/recommendations/track', { productId, type, metadata }),
}

// ── Chatbot ───────────────────────────────────────────────────────────────
export const chatbotAPI = {
  createSession: () => api.post('/chatbot/session'),
  sendMessage: (sessionToken: string, message: string) =>
    api.post('/chatbot/message', { sessionToken, message }),
  getHistory: (sessionToken: string) => api.get(`/chatbot/history/${sessionToken}`),
}

// ── Try-On ────────────────────────────────────────────────────────────────
export const tryonAPI = {
  applyMakeup: (image: string, makeupConfig: MakeupConfig) =>
    api.post('/tryon/apply', { image, makeupConfig }),
  getShades: () => api.get('/tryon/shades'),
}

// ── Types ─────────────────────────────────────────────────────────────────
export interface SignupData {
  email: string
  password: string
  firstName: string
  lastName: string
  skinTone?: string
  skinType?: string
}

export interface UserProfile {
  firstName: string
  lastName: string
  skinTone: string
  skinType: string
  avatarUrl: string
  preferences: Record<string, unknown>
}

export interface ProductQueryParams {
  page?: number
  limit?: number
  ids?: string
  category?: string
  brand?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  sort?: string
  order?: string
  tags?: string[]
}

export interface ReviewData {
  rating: number
  title?: string
  body?: string
}

export interface CheckoutData {
  shippingAddress: Address
  billingAddress: Address
  notes?: string
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface MakeupConfig {
  lipstick?: { color: string; opacity: number } | null
  eyeshadow?: { color: string; opacity: number } | null
  blush?: { color: string; opacity: number } | null
  foundation?: { color: string; opacity: number } | null
}

export default api
