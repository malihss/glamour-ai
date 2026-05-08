export const metadata = { title: 'Privacy Policy — GLAMOUR AI' }

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="font-display text-xl text-noir mb-4">{title}</h2>
    <div className="font-serif text-charcoal leading-relaxed space-y-3">{children}</div>
  </div>
)

export default function PrivacyPage() {
  return (
    <div className="pt-[88px] min-h-screen bg-ivory">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne mb-3">Legal</p>
          <h1 className="font-display text-4xl text-noir">Privacy Policy</h1>
          <p className="font-serif text-charcoal-soft mt-3">Last updated: January 2025</p>
        </div>

        <Section title="Information We Collect">
          <p>We collect information you provide when creating an account, placing orders, or interacting with our AI features — including name, email, shipping address, and payment information.</p>
          <p>When you use our Virtual Try-On, we process facial imagery locally on your device. We do not store or transmit your facial data to our servers.</p>
        </Section>

        <Section title="How We Use Your Information">
          <p>Your information is used to process orders, personalise your experience, provide AI-powered beauty recommendations, and communicate with you about your account and orders.</p>
          <p>We do not sell your personal data to third parties.</p>
        </Section>

        <Section title="AI & Personalisation">
          <p>Our AI systems use your purchase history, skin profile, and browsing behaviour to deliver personalised product recommendations. This data is processed securely and used solely to enhance your experience.</p>
        </Section>

        <Section title="Cookies">
          <p>We use cookies to maintain your session, remember your preferences, and analyse site usage. You may disable cookies in your browser settings, though some features may not function correctly.</p>
        </Section>

        <Section title="Data Security">
          <p>We implement industry-standard security measures including encryption in transit and at rest. Payment information is processed through PCI-compliant payment providers — we never store full card numbers.</p>
        </Section>

        <Section title="Your Rights">
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting <a href="mailto:privacy@glamour.ai" className="text-champagne hover:underline">privacy@glamour.ai</a>.</p>
        </Section>
      </div>
    </div>
  )
}
