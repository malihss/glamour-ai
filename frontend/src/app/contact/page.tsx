export const metadata = { title: 'Contact Us — GLAMOUR AI' }

export default function ContactPage() {
  return (
    <div className="pt-[88px] min-h-screen bg-ivory">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne mb-3">Support</p>
          <h1 className="font-display text-4xl text-noir">Contact Us</h1>
          <p className="font-serif text-charcoal-soft mt-3">We typically respond within 24 hours.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {[
            { label: 'Orders & Shipping', email: 'orders@glamour.ai', desc: 'Track orders, shipping issues, and delivery enquiries.' },
            { label: 'Returns & Refunds', email: 'returns@glamour.ai', desc: 'Initiate a return or check refund status.' },
            { label: 'Product Support', email: 'support@glamour.ai', desc: 'Questions about products, recommendations, or your account.' },
            { label: 'Privacy & Legal', email: 'privacy@glamour.ai', desc: 'Data requests, privacy concerns, or legal matters.' },
          ].map((c) => (
            <div key={c.label}
              className="p-6 bg-white border border-champagne/15"
              style={{ borderRadius: '16px' }}>
              <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-champagne mb-1">{c.label}</p>
              <a href={`mailto:${c.email}`}
                className="font-display text-base text-noir hover:text-champagne transition-colors block mb-2">
                {c.email}
              </a>
              <p className="font-serif text-sm text-charcoal-soft">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-ivory-warm border border-champagne/15 p-8" style={{ borderRadius: '16px' }}>
          <h2 className="font-display text-xl text-noir mb-2">Hours of Operation</h2>
          <p className="font-serif text-charcoal leading-relaxed">
            Monday – Friday: 9:00 AM – 6:00 PM EST<br />
            Saturday: 10:00 AM – 4:00 PM EST<br />
            Sunday: Closed
          </p>
        </div>
      </div>
    </div>
  )
}
