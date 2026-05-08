'use client'
// src/components/layout/SearchOverlay.tsx

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, TrendingUp } from 'lucide-react'
import { productsAPI } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'
import { useDebounce } from '@/hooks/useDebounce'

interface Props {
  open: boolean
  onClose: () => void
}

const TRENDING = ['Charlotte Tilbury', 'Fenty Beauty', 'Foundation', 'Lipstick', 'La Mer']

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setSuggestions(null)
    }
  }, [open])

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions(null)
      return
    }
    setLoading(true)
    productsAPI.searchSuggestions(debouncedQuery)
      .then(({ data }) => setSuggestions(data.suggestions))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(query)}`
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-noir/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-50 bg-ivory shadow-luxury-lg"
          >
            <div className="max-w-3xl mx-auto px-6 py-8">
              <form onSubmit={handleSearch} className="relative">
                <Search size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-charcoal-soft" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="w-full pl-8 pr-12 py-3 bg-transparent border-b border-charcoal/30 focus:border-champagne
                             font-sans text-lg text-charcoal placeholder-charcoal-soft focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-charcoal-soft hover:text-charcoal"
                >
                  <X size={18} />
                </button>
              </form>

              {/* Suggestions */}
              {suggestions && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {suggestions.products?.length > 0 && (
                    <div>
                      <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase text-champagne mb-4">
                        Products
                      </h3>
                      <div className="space-y-3">
                        {suggestions.products.map((p: any) => (
                          <Link
                            key={p.id}
                            href={`/products/${p.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-3 group"
                          >
                            {p.image && (
                              <div className="w-10 h-12 bg-ivory-warm overflow-hidden flex-shrink-0">
                                <Image src={p.image} alt={p.name} width={40} height={48}
                                  className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                              </div>
                            )}
                            <span className="font-sans text-sm text-charcoal group-hover:text-champagne transition-colors">
                              {p.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {suggestions.brands?.length > 0 && (
                    <div>
                      <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase text-champagne mb-4">
                        Brands
                      </h3>
                      <div className="space-y-2">
                        {suggestions.brands.map((b: any) => (
                          <Link
                            key={b.id}
                            href={`/products?brand=${b.slug}`}
                            onClick={onClose}
                            className="block font-sans text-sm text-charcoal hover:text-champagne transition-colors"
                          >
                            {b.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Trending */}
              {!query && (
                <div className="mt-8">
                  <h3 className="font-sans text-[10px] tracking-[0.2em] uppercase text-champagne mb-4 flex items-center gap-2">
                    <TrendingUp size={12} />
                    Trending Now
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setQuery(term)
                          inputRef.current?.focus()
                        }}
                        className="px-4 py-2 border border-champagne/30 font-sans text-xs text-charcoal
                                   hover:border-champagne hover:text-champagne transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
