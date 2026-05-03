import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

function authHeaders() {
  const token = Cookies.get('admin_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request(path: string, init?: RequestInit) {
  const res = await fetch(`${API_URL}/admin${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  })
  if (res.status === 401) {
    Cookies.remove('admin_token')
    window.location.href = '/auth/login?admin=1'
    throw new Error('Unauthorized')
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const adminApi = {
  getStats: () => request('/stats'),

  getProducts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/products${qs}`)
  },
  getProduct: (id: number) => request(`/products/${id}`),
  createProduct: (body: unknown) =>
    request('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: number, body: unknown) =>
    request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id: number) =>
    request(`/products/${id}`, { method: 'DELETE' }),

  getOrders: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/orders${qs}`)
  },
  getOrder: (id: number) => request(`/orders/${id}`),
  updateOrderStatus: (id: number, status: string) =>
    request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  getUsers: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/users${qs}`)
  },

  getCategories: () => request('/categories'),
  getBrands: () => request('/brands'),
}
