// src/app/layout.tsx — Root layout

import type { Metadata } from 'next'
import { Playfair_Display, Cormorant_Garamond, Jost } from 'next/font/google'
import '../styles/globals.css'
import { Providers } from '@/components/layout/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { ChatWidget } from '@/components/chatbot/ChatWidget'
import { AIToolsWidget } from '@/components/ai/AIToolsWidget'
import { Toaster } from 'react-hot-toast'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'GLAMOUR AI — Luxury Beauty',
    template: '%s | GLAMOUR AI',
  },
  description: 'Discover luxury beauty with AI-powered virtual try-on, personalized recommendations, and an expertly curated collection of makeup, skincare, and fragrance.',
  keywords: ['luxury beauty', 'makeup', 'skincare', 'virtual try-on', 'AI beauty'],
  openGraph: {
    type: 'website',
    siteName: 'GLAMOUR AI',
    title: 'GLAMOUR AI — Where Beauty Meets Intelligence',
    description: 'AI-powered luxury beauty shopping with virtual try-on',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${cormorant.variable} ${jost.variable}`}>
      <body className="bg-ivory text-charcoal antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartDrawer />
          <AIToolsWidget />
          <ChatWidget />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0A0A0A',
                color: '#FAF7F2',
                fontFamily: 'var(--font-jost)',
                fontSize: '13px',
                letterSpacing: '0.05em',
              },
              success: {
                iconTheme: { primary: '#C9A96E', secondary: '#FAF7F2' },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
