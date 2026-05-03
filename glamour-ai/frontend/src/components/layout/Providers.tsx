'use client'
// src/components/layout/Providers.tsx

import { QueryClient, QueryClientProvider } from 'react-query'
import { useEffect, useState } from 'react'
import { useAuthStore, useCartStore } from '@/lib/store'
import { authAPI, cartAPI } from '@/lib/api'
import Cookies from 'js-cookie'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, logout } = useAuthStore()
  const { setCart } = useCartStore()

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('access_token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const { data } = await authAPI.getProfile()
        setUser(data.user)
        cartAPI.get().then(({ data: d }) => setCart(d.cart)).catch(() => {})
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [setUser, setLoading, logout, setCart])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
    </QueryClientProvider>
  )
}
