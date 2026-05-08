import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

function authHeaders() {
  const token = Cookies.get('consultant_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function req(path: string, init?: RequestInit) {
  const res = await fetch(`${API_URL}/admin${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  })
  if (res.status === 401) {
    Cookies.remove('consultant_token')
    window.location.href = '/consultant/login'
    throw new Error('Unauthorized')
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const consultantApi = {
  login: async (password: string) => {
    const res = await fetch(`${API_URL}/admin/consultant/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Invalid password')
    return data
  },

  getClients: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return req(`/consultant/clients${qs}`)
  },
  getClient:   (id: string)                         => req(`/consultant/clients/${id}`),
  addNote:     (id: string, note: string)           => req(`/consultant/clients/${id}/notes`,    { method: 'POST', body: JSON.stringify({ note }) }),
  recommend:   (id: string, productId: string)      => req(`/consultant/clients/${id}/recommend`, { method: 'POST', body: JSON.stringify({ productId }) }),
  searchProducts: async (search: string) => {
    const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(search)}&limit=8`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Search failed')
    return data
  },
}
