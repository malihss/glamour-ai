'use client'
// src/app/checkout/page.tsx

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore, useAuthStore } from '@/lib/store'
import { ordersAPI, paymentAPI } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Lock, CreditCard, ShieldCheck, Truck, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// ── Stripe ────────────────────────────────────────────────────────────────────
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js'
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const IS_DEMO    = !STRIPE_KEY || STRIPE_KEY === 'pk_test_placeholder' || STRIPE_KEY.length < 20
const stripePromise = IS_DEMO ? null : loadStripe(STRIPE_KEY!)

const STRIPE_STYLE = {
  style: {
    base: {
      fontFamily: '"Inter", sans-serif', fontSize: '14px', color: '#1a1a1a',
      letterSpacing: '0.02em', '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
}

const EMPTY_ADDR = {
  firstName: '', lastName: '', street: '', city: '', state: '', postalCode: '', country: 'United States',
}

// ── Card validation utilities ─────────────────────────────────────────────────
function luhnCheck(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false
  let sum = 0, odd = true
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = +digits[i]
    if (!odd) { d *= 2; if (d > 9) d -= 9 }
    sum += d; odd = !odd
  }
  return sum % 10 === 0
}

function detectCardType(num: string): 'visa' | 'mastercard' | 'amex' | null {
  if (/^4/.test(num)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'mastercard'
  if (/^3[47]/.test(num)) return 'amex'
  return null
}

// ── Shared checkout logic — receives stripe/elements as props ─────────────────
interface CheckoutFormProps {
  stripe: Stripe | null
  elements: StripeElements | null
  onOrderComplete: React.Dispatch<React.SetStateAction<boolean>>
}

function CheckoutFormBase({ stripe, elements, onOrderComplete }: CheckoutFormProps) {
  const router    = useRouter()
  const { cart, setCart } = useCartStore()
  const { user }  = useAuthStore()

  const [step, setStep]         = useState<1 | 2 | 3>(1)
  const [shipping, setShipping] = useState({ ...EMPTY_ADDR, firstName: user?.firstName || '', lastName: user?.lastName || '' })
  const [sameBilling, setSameBilling] = useState(true)
  const [billing, setBilling]   = useState({ ...EMPTY_ADDR })
  const [cardName, setCardName] = useState('')
  const [loading, setLoading]   = useState(false)
  const [order, setOrder]       = useState<any>(null)
  const [cardError, setCardError] = useState<string | null>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc]       = useState('')
  const [showCvc, setShowCvc]       = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const cardType = useMemo(() => detectCardType(cardNumber.replace(/\s/g, '')), [cardNumber])

  const subtotal     = cart?.subtotal || 0
  const shippingCost = subtotal >= 75 ? 0 : 9.95
  const tax          = subtotal * 0.08
  const total        = subtotal + shippingCost + tax

  const validateAddress = (a: typeof EMPTY_ADDR) =>
    a.firstName && a.lastName && a.street && a.city && a.state && a.postalCode

  const handleContinue = () => {
    if (!validateAddress(shipping)) { toast.error('Please fill in all shipping fields'); return }
    if (!sameBilling && !validateAddress(billing)) { toast.error('Please fill in all billing fields'); return }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePay = useCallback(async () => {
    if (!cardName.trim()) { toast.error('Please enter the name on your card'); return }

    // ── Demo card validation ──────────────────────────────────────────────────
    if (IS_DEMO) {
      const errs: Record<string, string> = {}
      const raw = cardNumber.replace(/\s/g, '')
      const isAmex = /^3[47]/.test(raw)
      const expectedLen = isAmex ? 15 : 16
      if (raw.length < expectedLen) {
        errs.cardNumber = 'Enter a complete card number'
      } else if (!luhnCheck(raw)) {
        errs.cardNumber = 'Invalid card number — please check again'
      }
      const em = cardExpiry.match(/^(\d{2})\s*\/\s*(\d{2})$/)
      if (!em) {
        errs.cardExpiry = 'Enter expiry as MM / YY'
      } else {
        const m = parseInt(em[1]), y = 2000 + parseInt(em[2])
        if (m < 1 || m > 12) errs.cardExpiry = 'Invalid month'
        else if (new Date(y, m) <= new Date()) errs.cardExpiry = 'This card has expired'
      }
      const expectedCvc = isAmex ? 4 : 3
      if (!cardCvc || cardCvc.length < expectedCvc) errs.cardCvc = `CVC must be ${expectedCvc} digits`
      if (Object.keys(errs).length) { setFieldErrors(errs); return }
    }

    setLoading(true)
    setCardError(null)

    try {
      // ── Real Stripe payment (only when stripe + elements are available) ──
      if (!IS_DEMO && stripe && elements) {
        let clientSecret = ''
        try {
          const { data } = await paymentAPI.createIntent()
          clientSecret = data.clientSecret
        } catch { /* no Stripe key on backend — fall through */ }

        if (clientSecret) {
          const cardNumber = elements.getElement(CardNumberElement)
          if (!cardNumber) { setLoading(false); return }

          const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardNumber,
              billing_details: {
                name: cardName,
                address: {
                  line1:       (sameBilling ? shipping : billing).street,
                  city:        (sameBilling ? shipping : billing).city,
                  state:       (sameBilling ? shipping : billing).state,
                  postal_code: (sameBilling ? shipping : billing).postalCode,
                  country: 'US',
                },
              },
            },
          })
          if (stripeError) { setCardError(stripeError.message || 'Payment failed'); setLoading(false); return }
          if (paymentIntent?.status !== 'succeeded') { setCardError('Payment not completed'); setLoading(false); return }
        }
      }

      // ── Create order in backend ───────────────────────────────────────────
      const billingAddr = sameBilling ? shipping : billing
      const { data: orderData } = await ordersAPI.checkout({
        shippingAddress: { street: shipping.street,   city: shipping.city,   state: shipping.state,   postalCode: shipping.postalCode,   country: shipping.country },
        billingAddress:  { street: billingAddr.street, city: billingAddr.city, state: billingAddr.state, postalCode: billingAddr.postalCode, country: billingAddr.country },
      })
      setOrder(orderData.order)

      // Only clear cart + advance to success once the order is confirmed
      onOrderComplete(true)
      setCart(null)
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Something went wrong. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [stripe, elements, cardName, cardNumber, cardExpiry, cardCvc, shipping, billing, sameBilling, setCart, onOrderComplete])

  // ── Step 3 ──────────────────────────────────────────────────────────────────
  if (step === 3 && order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center py-16">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200 }} className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-champagne/15 flex items-center justify-center">
              <CheckCircle size={44} className="text-champagne" />
            </div>
          </motion.div>
          <h1 className="font-display text-4xl text-noir mb-3">Order Confirmed!</h1>
          <p className="font-serif text-charcoal-soft text-lg mb-2">Thank you for your purchase.</p>
          <p className="font-sans text-sm text-champagne font-medium mb-6 tracking-widest">{order.orderNumber}</p>
          <div className="bg-ivory-warm border border-champagne/20 p-5 mb-10 text-left space-y-3">
            <div className="flex items-center gap-3"><Truck size={16} className="text-champagne flex-shrink-0" /><p className="font-sans text-xs text-charcoal">Estimated delivery: 3–5 business days</p></div>
            <div className="flex items-center gap-3"><ShieldCheck size={16} className="text-champagne flex-shrink-0" /><p className="font-sans text-xs text-charcoal">Confirmation sent to {user?.email}</p></div>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/account/orders" className="btn-secondary">View Orders</Link>
            <Link href="/products" className="btn-primary">Continue Shopping</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* ── Left: form ────────────────────────────────────────────────────── */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">

          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
              <h2 className="font-display text-2xl text-noir mb-8">Shipping Address</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  {(['firstName', 'lastName'] as const).map(f => (
                    <div key={f}>
                      <label className="label-luxury">{f === 'firstName' ? 'First Name' : 'Last Name'}</label>
                      <input className="input-luxury" value={shipping[f]} onChange={e => setShipping(s => ({ ...s, [f]: e.target.value }))} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="label-luxury">Street Address</label>
                  <input className="input-luxury" value={shipping.street} onChange={e => setShipping(s => ({ ...s, street: e.target.value }))} />
                </div>
                <div>
                  <label className="label-luxury">City</label>
                  <input className="input-luxury" value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="label-luxury">State</label>
                    <input className="input-luxury" value={shipping.state} onChange={e => setShipping(s => ({ ...s, state: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label-luxury">Postal Code</label>
                    <input className="input-luxury" value={shipping.postalCode} onChange={e => setShipping(s => ({ ...s, postalCode: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label-luxury">Country</label>
                  <select className="input-luxury" value={shipping.country} onChange={e => setShipping(s => ({ ...s, country: e.target.value }))}>
                    {['United States','Canada','United Kingdom','France','Germany','Australia','Japan'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-3 cursor-pointer pt-1">
                  <input type="checkbox" checked={sameBilling} onChange={e => setSameBilling(e.target.checked)} className="accent-champagne w-4 h-4 rounded" />
                  <span className="font-sans text-xs text-charcoal">Billing address same as shipping</span>
                </label>
                {!sameBilling && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5 pt-4 border-t border-champagne/15">
                    <h3 className="font-display text-lg text-noir">Billing Address</h3>
                    <div className="grid grid-cols-2 gap-5">
                      {(['firstName', 'lastName'] as const).map(f => (
                        <div key={f}>
                          <label className="label-luxury">{f === 'firstName' ? 'First Name' : 'Last Name'}</label>
                          <input className="input-luxury" value={billing[f]} onChange={e => setBilling(b => ({ ...b, [f]: e.target.value }))} />
                        </div>
                      ))}
                    </div>
                    <div><label className="label-luxury">Street Address</label><input className="input-luxury" value={billing.street} onChange={e => setBilling(b => ({ ...b, street: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-5">
                      <div><label className="label-luxury">City</label><input className="input-luxury" value={billing.city} onChange={e => setBilling(b => ({ ...b, city: e.target.value }))} /></div>
                      <div><label className="label-luxury">State</label><input className="input-luxury" value={billing.state} onChange={e => setBilling(b => ({ ...b, state: e.target.value }))} /></div>
                    </div>
                    <div><label className="label-luxury">Postal Code</label><input className="input-luxury" value={billing.postalCode} onChange={e => setBilling(b => ({ ...b, postalCode: e.target.value }))} /></div>
                  </motion.div>
                )}
                <button onClick={handleContinue} className="btn-primary w-full mt-2">Continue to Payment</button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <h2 className="font-display text-2xl text-noir mb-8">Payment</h2>

              {/* Shipping summary */}
              <div className="bg-ivory-warm border border-champagne/15 p-5 mb-8 flex justify-between items-start">
                <div>
                  <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-champagne mb-2">Shipping To</p>
                  <p className="font-sans text-sm text-charcoal leading-relaxed">
                    {shipping.firstName} {shipping.lastName}<br />
                    {shipping.street}, {shipping.city}<br />
                    {shipping.state} {shipping.postalCode}, {shipping.country}
                  </p>
                </div>
                <button onClick={() => setStep(1)} className="font-sans text-xs text-champagne hover:underline shrink-0">Edit</button>
              </div>

              {/* ── Visual card preview (demo only) ─────────────────────── */}
              {IS_DEMO && (
                <motion.div
                  layout
                  className="relative h-48 rounded-2xl p-6 mb-8 overflow-hidden select-none"
                  style={{ background: 'linear-gradient(135deg, #1A1614 0%, #2D2825 50%, #3E3A39 100%)', boxShadow: '0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)' }}
                >
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-champagne/6 pointer-events-none" />
                  <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-champagne/4 pointer-events-none" />

                  {/* Chip */}
                  <div className="relative w-10 h-7 rounded-sm overflow-hidden mb-5"
                       style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #E8D5A3 55%, #A07840 100%)' }}>
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-px opacity-25">
                      {[...Array(6)].map((_, i) => <div key={i} className="bg-noir" />)}
                    </div>
                  </div>

                  {/* Number */}
                  <p className="font-mono text-ivory/75 tracking-[0.28em] mb-5 text-sm">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </p>

                  {/* Bottom */}
                  <div className="flex items-end justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-sans text-[8px] tracking-widest uppercase text-ivory/28 mb-0.5">Card Holder</p>
                      <p className="font-mono text-xs text-ivory/65 uppercase tracking-wider truncate">
                        {cardName || '— — — — — —'}
                      </p>
                    </div>
                    <div className="mr-5">
                      <p className="font-sans text-[8px] tracking-widest uppercase text-ivory/28 mb-0.5">Expires</p>
                      <p className="font-mono text-xs text-ivory/65">{cardExpiry || '•• / ••'}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center">
                      {cardType === 'visa'       && <span className="font-black text-blue-300/80 text-lg italic tracking-wide">VISA</span>}
                      {cardType === 'mastercard' && <div className="flex"><div className="w-7 h-7 bg-red-500/60 rounded-full -mr-2.5" /><div className="w-7 h-7 bg-orange-400/60 rounded-full" /></div>}
                      {cardType === 'amex'       && <span className="font-black text-blue-200/70 text-[10px] tracking-widest leading-tight text-right">AMERICAN<br/>EXPRESS</span>}
                      {!cardType                 && <CreditCard size={22} className="text-ivory/20" />}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Card brand badges */}
              <div className="flex items-center gap-2 mb-5">
                <CreditCard size={16} className="text-champagne" />
                <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-charcoal-soft">Card Details</span>
                <div className="ml-auto flex items-center gap-1.5">
                  {(['visa', 'mastercard', 'amex'] as const).map(brand => (
                    <div key={brand} className={`h-6 px-2 border rounded flex items-center transition-all duration-200 ${
                      cardType === brand ? 'bg-champagne/10 border-champagne/40' : 'bg-white border-charcoal/10'
                    }`}>
                      <span className={`font-sans text-[9px] font-bold uppercase tracking-wider ${
                        cardType === brand ? 'text-champagne' : 'text-charcoal/50'
                      }`}>{brand}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card fields */}
              <div className="space-y-5">
                <div>
                  <label className="label-luxury">Name on Card</label>
                  <input className="input-luxury" placeholder="Full name as on card"
                    value={cardName}
                    onChange={e => { setCardName(e.target.value); if (fieldErrors.cardName) setFieldErrors(p => ({ ...p, cardName: '' })) }}
                  />
                  {fieldErrors.cardName && <p className="font-sans text-[10px] text-red-500 mt-1.5">{fieldErrors.cardName}</p>}
                </div>

                {IS_DEMO ? (
                  <>
                    {/* Card Number */}
                    <div>
                      <label className="label-luxury">Card Number</label>
                      <div className="relative">
                        <input
                          className={`input-luxury font-mono pr-14 transition-colors ${fieldErrors.cardNumber ? 'border-red-400' : ''}`}
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          inputMode="numeric"
                          onChange={e => {
                            const raw = e.target.value.replace(/\D/g, '')
                            const isAmex = /^3[47]/.test(raw)
                            const limited = raw.slice(0, isAmex ? 15 : 16)
                            const fmt = isAmex
                              ? limited.replace(/^(\d{0,4})(\d{0,6})(\d{0,5})$/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '))
                              : limited.replace(/(\d{4})(?=\d)/g, '$1 ')
                            setCardNumber(fmt)
                            if (fieldErrors.cardNumber) setFieldErrors(p => ({ ...p, cardNumber: '' }))
                          }}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                          {cardType === 'visa'       && <span className="font-black text-blue-600 text-[10px] italic">VISA</span>}
                          {cardType === 'mastercard' && <div className="flex"><div className="w-3.5 h-3.5 bg-red-500 rounded-full -mr-1.5 opacity-80" /><div className="w-3.5 h-3.5 bg-orange-400 rounded-full opacity-80" /></div>}
                          {cardType === 'amex'       && <span className="font-bold text-blue-600 text-[9px] tracking-wide">AMEX</span>}
                          {!cardType                 && <CreditCard size={14} className="text-charcoal/25" />}
                        </div>
                      </div>
                      {fieldErrors.cardNumber && <p className="font-sans text-[10px] text-red-500 mt-1.5">{fieldErrors.cardNumber}</p>}
                    </div>

                    {/* Expiry + CVC */}
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="label-luxury">Expiry Date</label>
                        <input
                          className={`input-luxury ${fieldErrors.cardExpiry ? 'border-red-400' : ''}`}
                          placeholder="MM / YY"
                          value={cardExpiry}
                          inputMode="numeric"
                          onChange={e => {
                            const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
                            const fmt = raw.length > 2 ? raw.slice(0, 2) + ' / ' + raw.slice(2) : raw
                            setCardExpiry(fmt)
                            if (fieldErrors.cardExpiry) setFieldErrors(p => ({ ...p, cardExpiry: '' }))
                          }}
                        />
                        {fieldErrors.cardExpiry && <p className="font-sans text-[10px] text-red-500 mt-1.5">{fieldErrors.cardExpiry}</p>}
                      </div>
                      <div>
                        <label className="label-luxury">CVC {cardType === 'amex' ? '(4 digits)' : ''}</label>
                        <div className="relative">
                          <input
                            className={`input-luxury pr-10 ${fieldErrors.cardCvc ? 'border-red-400' : ''}`}
                            placeholder={cardType === 'amex' ? '1234' : '123'}
                            type={showCvc ? 'text' : 'password'}
                            value={cardCvc}
                            inputMode="numeric"
                            maxLength={cardType === 'amex' ? 4 : 3}
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, cardType === 'amex' ? 4 : 3)
                              setCardCvc(val)
                              if (fieldErrors.cardCvc) setFieldErrors(p => ({ ...p, cardCvc: '' }))
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCvc(v => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal/35 hover:text-charcoal transition-colors p-1"
                          >
                            {showCvc ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        {fieldErrors.cardCvc && <p className="font-sans text-[10px] text-red-500 mt-1.5">{fieldErrors.cardCvc}</p>}
                      </div>
                    </div>

                    {/* Hint */}
                    <div className="bg-ivory-warm border border-champagne/15 px-4 py-3">
                      <p className="font-sans text-[10px] tracking-widest uppercase text-champagne mb-1">Test Card</p>
                      <p className="font-sans text-xs text-charcoal-soft">Use <span className="font-mono text-charcoal">4242 4242 4242 4242</span> · any future date · any 3-digit CVC</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="label-luxury">Card Number</label>
                      <div className="input-luxury flex items-center gap-2">
                        <CardNumberElement options={STRIPE_STYLE} className="flex-1" />
                        <CreditCard size={16} className="text-charcoal/30 flex-shrink-0" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div><label className="label-luxury">Expiry Date</label><div className="input-luxury"><CardExpiryElement options={STRIPE_STYLE} /></div></div>
                      <div><label className="label-luxury">CVC</label><div className="input-luxury"><CardCvcElement options={STRIPE_STYLE} /></div></div>
                    </div>
                    <div className="bg-champagne/8 border border-champagne/20 p-4">
                      <p className="font-sans text-[10px] tracking-widest uppercase text-champagne mb-1">Test Card</p>
                      <p className="font-sans text-xs text-charcoal-soft">Use <span className="font-mono text-charcoal">4242 4242 4242 4242</span> · any future expiry · any CVC</p>
                    </div>
                  </>
                )}
              </div>

              {cardError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-sans text-xs text-red-500 bg-red-50 border border-red-200 px-4 py-3 mt-4">
                  {cardError}
                </motion.p>
              )}

              <div className="flex items-center gap-2 text-charcoal-soft mt-5">
                <Lock size={12} />
                <span className="font-sans text-[10px] tracking-wider">
                  {IS_DEMO ? 'Demo mode — no real charge' : 'Your payment is secured by Stripe'}
                </span>
              </div>

              <div className="flex gap-4 pt-5">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={handlePay} disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-ivory/40 border-t-ivory rounded-full animate-spin" />Processing…</>
                  ) : (
                    <><Lock size={13} />{IS_DEMO ? `Place Order — $${total.toFixed(2)}` : `Pay $${total.toFixed(2)}`}</>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right: order summary ──────────────────────────────────────────── */}
      <div className="lg:col-span-1">
        <div className="bg-ivory-warm border border-champagne/15 p-6 sticky top-24">
          <h3 className="font-display text-xl text-noir mb-6">Order Summary</h3>
          <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-1">
            {cart?.items?.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="w-14 h-16 bg-ivory overflow-hidden flex-shrink-0 border border-champagne/10">
                  {item.product?.primaryImage
                    ? <Image src={item.product.primaryImage} alt={item.product?.name || ''} width={56} height={64} className="object-cover w-full h-full" />
                    : <div className="w-full h-full bg-champagne/10" />}
                </div>
                <div className="flex-1 min-w-0">
                  {item.product?.brand && (
                    <p className="font-sans text-[9px] tracking-widest uppercase text-champagne mb-0.5">{(item.product as any).brand?.name}</p>
                  )}
                  <p className="font-sans text-xs text-charcoal leading-tight line-clamp-2">{item.product?.name}</p>
                  {item.variant && <p className="font-sans text-[10px] text-charcoal-soft mt-0.5">{item.variant.name}</p>}
                  <div className="flex justify-between mt-1.5">
                    <span className="font-sans text-[10px] text-charcoal-soft">×{item.quantity}</span>
                    <span className="font-sans text-xs font-medium text-charcoal">${item.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <hr className="border-champagne/20 mb-4" />
          <div className="space-y-2.5 mb-4">
            <div className="flex justify-between font-sans text-xs"><span className="text-charcoal-soft">Subtotal</span><span className="text-charcoal">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between font-sans text-xs">
              <span className="text-charcoal-soft">Shipping</span>
              <span className={shippingCost === 0 ? 'text-champagne font-medium' : 'text-charcoal'}>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-sans text-xs"><span className="text-charcoal-soft">Tax (8%)</span><span className="text-charcoal">${tax.toFixed(2)}</span></div>
          </div>
          <hr className="border-champagne/20 mb-4" />
          <div className="flex justify-between items-center">
            <span className="font-display text-base text-noir">Total</span>
            <span className="font-display text-xl text-noir">${total.toFixed(2)}</span>
          </div>
          {subtotal < 75 && <p className="font-sans text-[10px] text-champagne mt-3">Add ${(75 - subtotal).toFixed(2)} more for free shipping</p>}
          <div className="mt-6 pt-5 border-t border-champagne/15 flex flex-col gap-2">
            {[
              { icon: Lock,       text: IS_DEMO ? 'Demo checkout — no real charge' : 'SSL encrypted checkout' },
              { icon: ShieldCheck,text: IS_DEMO ? 'Order saved to your account'    : 'Secure payment by Stripe' },
              { icon: Truck,      text: 'Free returns within 30 days' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-charcoal-soft">
                <Icon size={12} className="text-champagne flex-shrink-0" />
                <span className="font-sans text-[10px]">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── When real Stripe is available: call hooks inside Elements ─────────────────
function StripeCheckoutForm({ onOrderComplete }: { onOrderComplete: React.Dispatch<React.SetStateAction<boolean>> }) {
  const stripe   = useStripe()
  const elements = useElements()
  return <CheckoutFormBase stripe={stripe} elements={elements} onOrderComplete={onOrderComplete} />
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter()
  const { cart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  // Tracks order completion so the success screen stays visible after cart is cleared
  const [orderComplete, setOrderComplete] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login?redirect=/checkout')
  }, [isAuthenticated, router])

  // Only show "bag is empty" on initial load — never after order is placed
  if (!cart?.items?.length && !orderComplete) {
    return (
      <div className="pt-[88px] min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-center">
          <p className="font-display text-2xl text-noir mb-4">Your bag is empty</p>
          <Link href="/products" className="btn-primary">Shop Now</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[88px] min-h-screen bg-ivory">
      <div className="max-w-screen-lg mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="font-display text-xl text-noir tracking-[0.15em]">
            GLAMOUR<span className="text-champagne"> AI</span>
          </Link>
          <div className="flex items-center gap-2 text-charcoal-soft">
            <Lock size={12} />
            <span className="font-sans text-[10px] tracking-widest uppercase">
              {IS_DEMO ? 'Demo Checkout' : 'Secure Checkout'}
            </span>
          </div>
        </div>

        {IS_DEMO ? (
          <CheckoutFormBase stripe={null} elements={null} onOrderComplete={setOrderComplete} />
        ) : (
          <Elements stripe={stripePromise!}>
            <StripeCheckoutForm onOrderComplete={setOrderComplete} />
          </Elements>
        )}
      </div>
    </div>
  )
}
