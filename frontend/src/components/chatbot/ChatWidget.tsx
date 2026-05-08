'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Send, Sparkles, Bot, ChevronRight,
  Wand2, Camera, Flame, FlaskConical, MessageCircle,
} from 'lucide-react'
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

// ── AI Feature cards ───────────────────────────────────────────────────────────
const AI_FEATURES = [
  { href: '/routine',  label: 'Routine\nGenerator', icon: Wand2,       color: '#C6A9A3', bg: 'rgba(198,169,163,0.12)' },
  { href: '/tryon',    label: 'Virtual\nTry-On',    icon: Camera,       color: '#A8C5DA', bg: 'rgba(168,197,218,0.12)' },
  { href: '/journey',  label: 'Skin\nTracker',      icon: Flame,        color: '#E8A87C', bg: 'rgba(232,168,124,0.12)' },
  { href: '/skincare', label: 'Skin\nAnalysis',     icon: FlaskConical, color: '#B8C9B0', bg: 'rgba(184,201,176,0.12)' },
]

// ── Topic starters ─────────────────────────────────────────────────────────────
const TOPICS = [
  { label: 'Skincare', icon: '✦', questions: ['Best routine for dry skin?', 'How to treat acne-prone skin?', 'Do I need a serum?', 'How to fade dark spots?'] },
  { label: 'Makeup',   icon: '◈', questions: ['How to find my foundation shade?', 'Best long-wear lipstick?', 'How to do a smoky eye?', 'What primer should I use?'] },
  { label: 'Fragrance',icon: '◇', questions: ['Suggest a floral perfume', 'Best scent for summer?', 'How to make perfume last longer?'] },
  { label: 'Ingredients',icon:'◉',questions: ['What does niacinamide do?', 'Explain hyaluronic acid', 'Is vitamin C good for skin?'] },
]

function getFollowUps(content: string): string[] {
  const c = content.toLowerCase()
  if (c.includes('moisturiz') || c.includes('hydrat'))  return ['What ingredients to look for in a moisturizer?', 'Best moisturizer for oily skin?']
  if (c.includes('retinol'))                             return ['Can I use retinol with vitamin C?', 'When should I start using retinol?']
  if (c.includes('foundation'))                          return ['How to apply foundation without cakey finish?', 'What finish suits dry skin?']
  if (c.includes('serum'))                               return ['Can I layer multiple serums?', 'What order do I apply serums?']
  if (c.includes('acne') || c.includes('breakout'))      return ['What ingredients help with acne?', 'Should I moisturize acne-prone skin?']
  if (c.includes('dark spot') || c.includes('hyperpig')) return ['How long until dark spots fade?', 'Best vitamin C serum for brightening?']
  if (c.includes('perfume') || c.includes('fragrance'))  return ['What fragrance lasts the longest?', 'Best perfume for evening wear?']
  return []
}

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g)
    const rendered = parts.map((p, j) =>
      j % 2 === 1 ? <strong key={j} className="font-semibold text-noir">{p}</strong> : p
    )
    if (line.trim().startsWith('•') || line.trim().startsWith('-'))
      return <div key={i} className="flex gap-2 mt-1"><span className="text-champagne flex-shrink-0">·</span><span>{rendered}</span></div>
    if (line.trim() === '') return <div key={i} className="h-2" />
    return <div key={i}>{rendered}</div>
  })
}

// ── Widget ─────────────────────────────────────────────────────────────────────
export function ChatWidget() {
  const { chatOpen, setChatOpen } = useUIStore()
  const [view, setView]               = useState<'hub' | 'chat'>('hub')
  const [messages, setMessages]       = useState<Message[]>([])
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState(false)
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [hasNew, setHasNew]           = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  const initSession = useCallback(() => {
    setSessionError(false)
    chatbotAPI.createSession()
      .then(({ data }) => setSessionToken(data.sessionToken))
      .catch(() => setSessionError(true))
  }, [])

  useEffect(() => { initSession() }, [initSession])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (chatOpen) {
      setHasNew(false)
      if (view === 'chat' && messages.length === 0) {
        setMessages([{
          id: 'greeting', role: 'assistant', timestamp: new Date(),
          content: "Hello! I'm Glamour, your AI beauty advisor. ✨\n\nI can help with skincare routines, makeup tips, fragrance advice, and finding the perfect products. Choose a topic or type your question!",
        }])
      }
      if (view === 'chat') setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [chatOpen, view, messages.length])

  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    if (!sessionToken) { initSession(); return }
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() }])
    setInput('')
    setActiveTopic(null)
    setLoading(true)
    try {
      const { data } = await chatbotAPI.sendMessage(sessionToken, msg)
      const content = data.message.content
      setMessages(prev => [...prev, {
        id: data.message.id, role: 'assistant', content,
        suggestedProducts: data.suggestedProducts,
        followUps: getFollowUps(content),
        timestamp: new Date(),
      }])
      if (!chatOpen) setHasNew(true)
    } catch {
      setMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'assistant', content: 'Something went wrong. Please try again.', timestamp: new Date() }])
    } finally { setLoading(false) }
  }, [input, loading, sessionToken, chatOpen, initSession])

  const openChat = (question?: string) => {
    setView('chat')
    if (messages.length === 0) {
      setMessages([{
        id: 'greeting', role: 'assistant', timestamp: new Date(),
        content: "Hello! I'm Glamour, your AI beauty advisor. ✨\n\nI can help with skincare routines, makeup tips, fragrance advice, and finding the perfect products. Choose a topic or type your question!",
      }])
    }
    if (question) setTimeout(() => sendMessage(question), 200)
    else setTimeout(() => inputRef.current?.focus(), 100)
  }

  const isStartScreen = messages.length <= 1

  return (
    <>
      {/* ── Launcher button — bottom LEFT ── */}
      <motion.button
        onClick={() => setChatOpen(!chatOpen)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 h-11 shadow-lg transition-colors"
        style={{
          background: chatOpen ? '#3E3A39' : 'linear-gradient(135deg,#C6A9A3,#A08070)',
          borderRadius: 99,
        }}
        aria-label="Beauty AI"
      >
        <Sparkles size={14} className="text-white" />
        <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-white">Beauty AI</span>
        {hasNew && !chatOpen && (
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        )}
      </motion.button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-20 left-6 z-40 w-[370px] max-h-[620px] flex flex-col overflow-hidden"
            style={{
              background: '#FDFCFB',
              borderRadius: 20,
              border: '1px solid rgba(198,169,163,0.2)',
              boxShadow: '0 20px 60px rgba(62,58,57,0.15)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
              style={{ background: '#3E3A39', borderRadius: '20px 20px 0 0' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)' }}>
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-sans text-xs font-medium text-white tracking-wider">
                  {view === 'chat' ? 'Beauty Advisor' : 'Beauty AI'}
                </p>
                <p className="font-sans text-[10px] flex items-center gap-1" style={{ color: 'rgba(232,226,221,0.5)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  {view === 'chat' ? 'Chatbot · Online' : 'Your AI beauty suite'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {view === 'chat' && (
                  <button onClick={() => setView('hub')}
                    className="font-sans text-[9px] tracking-widest uppercase px-2 py-1 rounded-full transition-colors"
                    style={{ color: 'rgba(198,169,163,0.7)', border: '1px solid rgba(198,169,163,0.2)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C6A9A3')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(198,169,163,0.7)')}>
                    ← Hub
                  </button>
                )}
                <button onClick={() => setChatOpen(false)}
                  className="p-1 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#fff')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)')}>
                  <X size={15} />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">

              {/* ── HUB VIEW ─────────────────────────────────────────────── */}
              {view === 'hub' && (
                <motion.div key="hub"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col overflow-y-auto">

                  {/* AI Features grid */}
                  <div className="p-4">
                    <p className="font-sans text-[9px] tracking-[0.25em] uppercase mb-3"
                      style={{ color: '#C6A9A3' }}>
                      AI Features
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {AI_FEATURES.map(f => (
                        <Link key={f.href} href={f.href} onClick={() => setChatOpen(false)}
                          className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all group"
                          style={{ background: f.bg, border: `1px solid ${f.color}25` }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(0)')}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: `${f.color}20` }}>
                            <f.icon size={16} style={{ color: f.color }} />
                          </div>
                          <span className="font-sans text-[8px] tracking-wide text-center leading-tight"
                            style={{ color: '#7A736F', whiteSpace: 'pre-line' }}>
                            {f.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mx-4 mb-3" style={{ borderTop: '1px solid rgba(198,169,163,0.15)' }} />

                  {/* Chat entry */}
                  <div className="px-4 pb-2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-sans text-[9px] tracking-[0.25em] uppercase" style={{ color: '#C6A9A3' }}>
                        Beauty Advisor Chat
                      </p>
                      <button onClick={() => openChat()}
                        className="flex items-center gap-1 font-sans text-[9px] tracking-widest uppercase transition-colors"
                        style={{ color: '#C6A9A3' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#A08070')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#C6A9A3')}>
                        Open <ChevronRight size={10} />
                      </button>
                    </div>

                    {/* Topic quick-launch */}
                    <div className="space-y-4 pb-4">
                      {TOPICS.map(topic => (
                        <div key={topic.label}>
                          <p className="font-sans text-[9px] tracking-widest uppercase mb-1.5"
                            style={{ color: '#A89E99' }}>
                            <span className="mr-1.5">{topic.icon}</span>{topic.label}
                          </p>
                          <div className="space-y-1">
                            {topic.questions.slice(0, 2).map(q => (
                              <button key={q} onClick={() => openChat(q)}
                                className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-all"
                                style={{ background: 'rgba(198,169,163,0.06)', border: '1px solid rgba(198,169,163,0.12)' }}
                                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(198,169,163,0.12)')}
                                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(198,169,163,0.06)')}>
                                <span className="font-serif text-[11px]" style={{ color: '#5C5450' }}>{q}</span>
                                <ChevronRight size={10} style={{ color: '#C6A9A3', flexShrink: 0 }} />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── CHAT VIEW ─────────────────────────────────────────────── */}
              {view === 'chat' && (
                <motion.div key="chat"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col flex-1 min-h-0" style={{ maxHeight: 540 }}>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        {msg.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                            style={{ background: 'rgba(198,169,163,0.15)' }}>
                            <Bot size={12} style={{ color: '#C6A9A3' }} />
                          </div>
                        )}
                        <div className={`max-w-[88%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-3 font-sans text-xs leading-relaxed rounded-2xl ${
                            msg.role === 'user'
                              ? 'text-white'
                              : 'text-charcoal'
                          }`}
                            style={msg.role === 'user'
                              ? { background: 'linear-gradient(135deg,#C6A9A3,#A08070)' }
                              : { background: '#F5F2EF', border: '1px solid rgba(198,169,163,0.15)' }}>
                            {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
                          </div>

                          {msg.suggestedProducts?.length > 0 && (
                            <div className="w-full space-y-1.5">
                              <p className="font-sans text-[9px] tracking-[0.15em] uppercase" style={{ color: '#C6A9A3' }}>
                                Recommended for you
                              </p>
                              {msg.suggestedProducts.map((p: any) => (
                                <Link key={p.id} href={`/products/${p.slug}`}
                                  onClick={() => setChatOpen(false)}
                                  className="flex items-center gap-3 p-2 rounded-xl transition-all group"
                                  style={{ background: '#fff', border: '1px solid rgba(198,169,163,0.15)' }}
                                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#C6A9A3')}
                                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(198,169,163,0.15)')}>
                                  {p.primaryImage && <img src={p.primaryImage} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                                  <div className="min-w-0 flex-1">
                                    <p className="font-sans text-[9px] uppercase tracking-wider" style={{ color: '#C6A9A3' }}>{p.brand?.name}</p>
                                    <p className="font-display text-xs text-noir truncate">{p.name}</p>
                                    <p className="font-sans text-xs" style={{ color: '#A89E99' }}>${p.price?.toFixed(2)}</p>
                                  </div>
                                  <ChevronRight size={12} style={{ color: '#C6A9A3', flexShrink: 0 }} />
                                </Link>
                              ))}
                            </div>
                          )}

                          {msg.followUps?.length > 0 && (
                            <div className="w-full space-y-1">
                              {msg.followUps.map(q => (
                                <button key={q} onClick={() => sendMessage(q)}
                                  className="w-full text-left font-sans text-[10px] px-3 py-2 rounded-xl
                                             flex items-center justify-between gap-2 transition-all"
                                  style={{ background: 'rgba(198,169,163,0.06)', border: '1px solid rgba(198,169,163,0.12)', color: '#7A736F' }}
                                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(198,169,163,0.12)')}
                                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(198,169,163,0.06)')}>
                                  <span>{q}</span>
                                  <ChevronRight size={10} style={{ color: '#C6A9A3', flexShrink: 0 }} />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(198,169,163,0.15)' }}>
                          <Bot size={12} style={{ color: '#C6A9A3' }} />
                        </div>
                        <div className="px-4 py-3 rounded-2xl flex gap-1.5 items-center"
                          style={{ background: '#F5F2EF' }}>
                          {[0, 0.18, 0.36].map(delay => (
                            <motion.div key={delay}
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.7, repeat: Infinity, delay }}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: '#C6A9A3' }} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Topic selector on start screen */}
                    {isStartScreen && !loading && (
                      <div className="space-y-1.5">
                        <p className="font-sans text-[9px] tracking-[0.2em] uppercase" style={{ color: '#C6A9A3' }}>
                          Quick topics
                        </p>
                        {activeTopic === null
                          ? TOPICS.map(t => (
                            <button key={t.label} onClick={() => setActiveTopic(t.label)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                              style={{ background: 'rgba(198,169,163,0.06)', border: '1px solid rgba(198,169,163,0.12)' }}
                              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(198,169,163,0.12)')}
                              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(198,169,163,0.06)')}>
                              <span className="text-xs" style={{ color: '#C6A9A3' }}>{t.icon}</span>
                              <span className="font-sans text-[10px]" style={{ color: '#5C5450' }}>{t.label}</span>
                              <ChevronRight size={10} className="ml-auto" style={{ color: '#C6A9A3' }} />
                            </button>
                          ))
                          : <>
                            <button onClick={() => setActiveTopic(null)}
                              className="font-sans text-[9px] mb-1 transition-colors"
                              style={{ color: '#A89E99' }}
                              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#C6A9A3')}
                              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#A89E99')}>
                              ← Back
                            </button>
                            {TOPICS.find(t => t.label === activeTopic)?.questions.map(q => (
                              <button key={q} onClick={() => sendMessage(q)}
                                className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-all"
                                style={{ background: 'rgba(198,169,163,0.06)', border: '1px solid rgba(198,169,163,0.12)' }}
                                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(198,169,163,0.12)')}
                                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(198,169,163,0.06)')}>
                                <span className="font-serif text-[11px]" style={{ color: '#5C5450' }}>{q}</span>
                                <ChevronRight size={10} style={{ color: '#C6A9A3', flexShrink: 0 }} />
                              </button>
                            ))}
                          </>
                        }
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {sessionError && (
                    <div className="px-4 py-2 flex items-center justify-between gap-2 flex-shrink-0"
                      style={{ background: '#FEF2F2', borderTop: '1px solid #FECACA' }}>
                      <p className="font-sans text-[10px] text-red-600">Connection failed.</p>
                      <button onClick={initSession} className="font-sans text-[10px] text-red-600 underline">Retry</button>
                    </div>
                  )}

                  {/* Input */}
                  <div className="flex gap-3 items-center px-4 py-3 flex-shrink-0"
                    style={{ borderTop: '1px solid rgba(198,169,163,0.15)' }}>
                    <input ref={inputRef} type="text" value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                      placeholder="Ask me anything about beauty…"
                      className="flex-1 bg-transparent font-sans text-xs focus:outline-none"
                      style={{ color: '#3E3A39' }} />
                    <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                      className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity"
                      style={{ background: 'linear-gradient(135deg,#C6A9A3,#A08070)' }}>
                      <Send size={12} className="text-white" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
