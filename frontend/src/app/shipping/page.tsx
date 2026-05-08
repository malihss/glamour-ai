import Link from 'next/link'

export const metadata = { title: 'Shipping & Returns — GLAMOUR AI' }

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="font-display text-xl text-noir mb-4">{title}</h2>
    <div className="font-serif text-charcoal leading-relaxed space-y-3">{children}</div>
  </div>
)

export default function ShippingPage() {
  return (
    <div className="pt-[88px] min-h-screen bg-ivory">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne mb-3">Policies</p>
          <h1 className="font-display text-4xl text-noir">Shipping & Returns</h1>
        </div>

        <Section title="Complimentary Shipping">
          <p>All orders over $75 qualify for complimentary standard shipping. Orders under $75 are subject to a flat $8 shipping fee.</p>
          <p>Express shipping (1–2 business days) is available at checkout for $18.</p>
        </Section>

        <Section title="Delivery Times">
          <p><strong className="font-sans text-xs tracking-widest uppercase text-charcoal">Standard</strong> — 4–7 business days</p>
          <p><strong className="font-sans text-xs tracking-widest uppercase text-charcoal">Express</strong> — 1–2 business days</p>
          <p>Orders placed before 12:00 PM EST are processed same day. Orders placed after are processed the following business day.</p>
        </Section>

        <Section title="Free Returns">
          <p>We offer hassle-free returns within 30 days of delivery for all unopened and unused items in their original packaging.</p>
          <p>To initiate a return, contact us at <a href="mailto:returns@glamour.ai" className="text-champagne hover:underline">returns@glamour.ai</a> with your order number.</p>
          <p>Refunds are processed within 5–7 business days of receiving your return.</p>
        </Section>

        <Section title="Damaged or Incorrect Items">
          <p>If your order arrives damaged or you received the wrong item, please contact us within 48 hours at <a href="mailto:support@glamour.ai" className="text-champagne hover:underline">support@glamour.ai</a>. We will arrange a replacement or full refund at no cost to you.</p>
        </Section>

        <div className="mt-12 pt-8 border-t border-champagne/20">
          <p className="font-sans text-xs text-charcoal-soft">
            Questions? <Link href="/contact" className="text-champagne hover:underline">Contact our team</Link> or check your{' '}
            <Link href="/account" className="text-champagne hover:underline">order status</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
