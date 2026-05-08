'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles, Bot, ChevronRight } from 'lucide-react'
import { chatbotAPI } from '@/lib/api'
import { useUIStore } from '@/lib/store'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestedProducts?: any[]
  followUps?: string[]
  timestamp: Date
}

// ── Starter topic categories ────────────────────────────────────────────────
const TOPIC_CATEGORIES = [
  {
    label: 'Skincare',
    icon: '✦',
    questions: [
      'Best routine for dry skin?',
      'How to treat acne-prone skin?',
      'What is retinol and how do I use it?',
      'How to fade dark spots?',
      'Do I need a serum?',
    ],
  },
  {
    label: 'Makeup',
    icon: '◈',
    questions: [
      'How to find my foundation shade?',
      'How to do a smoky eye look?',
      'Best long-wear lipstick?',
      'How to contour for beginners?',
      'What primer should I use?',
    ],
  },
  {
    label: 'Fragrance',
    icon: '◇',
    questions: [
      'Suggest a floral perfume',
      'Best scent for summer?',
      'What does woody fragrance mean?',
      'How to make perfume last longer?',
    ],
  },
  {
    label: 'Ingredients',
    icon: '◉',
    questions: [
      'What does niacinamide do?',
      'Explain hyaluronic acid',
      'Is vitamin C good for skin?',
      'What is SPF and do I need it daily?',
    ],
  },
]

// ── Contextual follow-ups based on keywords in assistant reply ───────────────
function getFollowUps(content: string): string[] {
  const c = content.toLowerCase()
  if (c.includes('moisturiz') || c.includes('hydrat'))
    return ['What ingredients to look for in a moisturizer?', 'Best moisturizer for oily skin?']
  if (c.includes('retinol') || c.includes('vitamin a'))
    return ['Can I use retinol with vitamin C?', 'When should I start using retinol?']
  if (c.includes('foundation') || c.includes('coverage'))
    return ['How to apply foundation without cakey finish?', 'What finish suits dry skin?']
  if (c.includes('lip') || c.includes('lipstick'))
    return ['How to make lip color last all day?', 'What lip shade suits warm skin tones?']
  if (c.includes('eye') || c.includes('shadow') || c.includes('mascara'))
    return ['How to prevent eyeshadow from creasing?', 'Best mascara for volume?']
  if (c.includes('perfume') || c.includes('fragrance') || c.includes('scent'))
    return ['What fragrance lasts the longest?', 'Best perfume for evening wear?']
  if (c.includes('spf') || c.includes('sunscreen'))
    return ['Can I use SPF under makeup?', 'Difference between mineral and chemical SPF?']
  if (c.includes('acne') || c.includes('breakout') || c.includes('pimple'))
    return ['What ingredients help with acne?', 'Should I moisturize acne-prone skin?']
  if (c.includes('dark spot') || c.includes('hyperpigment'))
    return ['How long until dark spots fade?', 'Best vitamin C serum for brightening?']
  if (c.includes('serum'))
    return ['Can I layer multiple serums?', 'What order do I apply serums?']
  return []
}

// ── Markdown-lite renderer ───────────────────────────────────────────────────
function renderContent(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Bold **text**
    const parts = line.split(/\*\*(.*?)\*\*/g)
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j} className="font-semibold text-noir">{part}</strong> : part
    )
    // Bullet lines
    if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
      return (
        <div key={i} className="flex gap-2 mt-1">
          <span className="text-champagne mt-0.5 flex-shrink-0">·</span>
          <span>{rendered}</span>
        </div>
      )
    }
    if (line.trim() === '') return <div key={i} className="h-2" />
    return <div key={i}>{rendered}</div>
  })
}

// ────────────────────────────────────────────────────────────────────────────

export function ChatWidget() {
  const { chatOpen, setChatOpen } = useUIStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [sessionError, setSessionError] = useState(false)
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const initSession = useCallback(() => {
    setSessionError(false)
    chatbotAPI.createSession()
      .then(({ data }) => setSessionToken(data.sessionToken))
      .catch(() => setSessionError(true))
  }, [])

  useEffect(() => { initSession() }, [initSession])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setHasNewMessage(false)
      if (messages.length === 0) {
        setMessages([{
          id: 'greeting',
          role: 'assistant',
          content: "Hello! I'm Glamour, your AI beauty advisor. ✨\n\nI can help you with skincare routines, makeup tips, fragrance advice, and finding the perfect products. Choose a topic below or type your question!",
          timestamp: new Date(),
        }])
      }
    }
  }, [chatOpen, messages.length])

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return
    if (!sessionToken) { initSession(); return }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setActiveTopic(null)
    setLoading(true)

    try {
      const { data } = await chatbotAPI.sendMessage(sessionToken, messageText)
      const content = data.message.content
      const assistantMsg: Message = {
        id: data.message.id,
        role: 'assistant',
        content,
        suggestedProducts: data.suggestedProducts,
        followUps: getFollowUps(content),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
      if (!chatOpen) setHasNewMessage(true)
    } catch {
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: 'I encountered an issue. Please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, sessionToken, chatOpen, initSession])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const isStartScreen = messages.length <= 1

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setChatOpen(!chatOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-champagne text-noir
                   flex items-center justify-center shadow-luxury-lg hover:bg-champagne-dark transition-colors"
        aria-label="Open beauty advisor"
      >
        <AnimatePresence mode="wait">
          {chatOpen
            ? <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }}><X size={22} /></motion.div>
            : <motion.div key="open" initial={{ rotate: 90 }} animate={{ rotate: 0 }}><MessageCircle size={22} /></motion.div>
          }
        </AnimatePresence>
        {hasNewMessage && !chatOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-40 w-[380px] max-h-[620px] bg-ivory
                       border border-champagne/15 shadow-luxury-lg flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-noir px-5 py-4 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 bg-champagne/10 border border-champagne/30 flex items-center justify-center">
                <Sparkles size={16} className="text-champagne" />
              </div>
              <div>
                <p className="font-sans text-xs font-medium text-ivory tracking-wider">Glamour AI</p>
                <p className="font-sans text-[10px] text-ivory/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Beauty Advisor · Online
                </p>
              </div>
              <button onClick={() => setChatOpen(false)}
                className="ml-auto p-1 text-ivory/40 hover:text-ivory transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 bg-champagne/10 border border-champagne/20 flex-shrink-0
                                    flex items-center justify-center mt-0.5">
                      <Bot size={12} className="text-champagne" />
                    </div>
                  )}
                  <div className={`max-w-[88%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 font-sans text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-champagne text-noir'
                        : 'bg-ivory-warm text-charcoal border border-champagne/10'
                    }`}>
                      {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
                    </div>

                    {/* Product suggestions */}
                    {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                      <div className="w-full space-y-1.5">
                        <p className="font-sans text-[9px] tracking-[0.15em] uppercase text-champagne">
                          Recommended for you
                        </p>
                        {msg.suggestedProducts.map((p: any) => (
                          <Link
                            key={p.id}
                            href={`/products/${p.slug}`}
                            onClick={() => setChatOpen(false)}
                            className="flex items-center gap-3 bg-white border border-champagne/20 p-2
                                       hover:border-champagne hover:shadow-sm transition-all group cursor-pointer"
                          >
                            {p.primaryImage && (
                              <img src={p.primaryImage} alt={p.name}
                                className="w-11 h-13 object-cover flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-sans text-[9px] text-champagne truncate uppercase tracking-wider">
                                {p.brand?.name}
                              </p>
                              <p className="font-display text-xs text-charcoal truncate leading-tight">{p.name}</p>
                              <p className="font-sans text-xs font-medium text-charcoal mt-0.5">${p.price.toFixed(2)}</p>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-champagne text-noir
                                            font-sans text-[9px] tracking-wider uppercase
                                            group-hover:bg-champagne-dark transition-colors whitespace-nowrap">
                              Shop <ChevronRight size={9} />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Follow-up questions */}
                    {msg.followUps && msg.followUps.length > 0 && (
                      <div className="w-full space-y-1">
                        {msg.followUps.map(q => (
                          <button
                            key={q}
                            onClick={() => sendMessage(q)}
                            className="w-full text-left font-sans text-[10px] text-charcoal-soft
                                       border border-champagne/15 px-3 py-2
                                       hover:border-champagne hover:text-champagne hover:bg-champagne/5
                                       transition-all flex items-center justify-between gap-2"
                          >
                            <span>{q}</span>
                            <ChevronRight size={10} className="flex-shrink-0 opacity-50" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 bg-champagne/10 border border-champagne/20 flex items-center justify-center mt-0.5">
                    <Bot size={12} className="text-champagne" />
                  </div>
                  <div className="bg-ivory-warm border border-champagne/10 px-4 py-3 flex gap-1.5 items-center">
                    {[0, 0.18, 0.36].map(delay => (
                      <motion.div key={delay}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay }}
                        className="w-1.5 h-1.5 rounded-full bg-champagne/60"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Topic selector (start screen) */}
            {isStartScreen && !loading && (
              <div className="px-4 pb-3 border-t border-champagne/10 pt-3 flex-shrink-0">
                {activeTopic === null ? (
                  <>
                    <p className="font-sans text-[9px] tracking-[0.15em] uppercase text-champagne/70 mb-2">
                      Browse by topic
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {TOPIC_CATEGORIES.map(cat => (
                        <button
                          key={cat.label}
                          onClick={() => setActiveTopic(cat.label)}
                          className="flex items-center gap-2 px-3 py-2 border border-champagne/20
                                     hover:border-champagne hover:bg-champagne/5 transition-all text-left"
                        >
                          <span className="text-champagne text-xs">{cat.icon}</span>
                          <span className="font-sans text-[10px] text-charcoal">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <button onClick={() => setActiveTopic(null)}
                        className="font-sans text-[9px] text-champagne/60 hover:text-champagne transition-colors">
                        ← Back
                      </button>
                      <span className="font-sans text-[9px] tracking-[0.15em] uppercase text-champagne/70">
                        {activeTopic}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {TOPIC_CATEGORIES.find(c => c.label === activeTopic)?.questions.map(q => (
                        <button key={q} onClick={() => sendMessage(q)}
                          className="w-full text-left font-sans text-[10px] text-charcoal-soft
                                     border border-champagne/15 px-3 py-2
                                     hover:border-champagne hover:text-champagne hover:bg-champagne/5
                                     transition-all flex items-center justify-between gap-2">
                          <span>{q}</span>
                          <ChevronRight size={10} className="flex-shrink-0 opacity-40" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Session error */}
            {sessionError && (
              <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center justify-between gap-2 flex-shrink-0">
                <p className="font-sans text-[10px] text-red-600">Connection failed.</p>
                <button onClick={initSession}
                  className="font-sans text-[10px] text-red-600 underline underline-offset-2">
                  Retry
                </button>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-champagne/15 px-4 py-3 flex gap-3 items-center flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about beauty…"
                className="flex-1 bg-transparent font-sans text-xs text-charcoal
                           placeholder-charcoal-soft/60 focus:outline-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-8 h-8 bg-champagne text-noir flex items-center justify-center
                           disabled:opacity-40 hover:bg-champagne-dark transition-colors flex-shrink-0"
              >
                <Send size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
