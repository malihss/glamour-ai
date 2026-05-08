export const metadata = { title: 'Terms of Service — GLAMOUR AI' }

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="font-display text-xl text-noir mb-4">{title}</h2>
    <div className="font-serif text-charcoal leading-relaxed space-y-3">{children}</div>
  </div>
)

export default function TermsPage() {
  return (
    <div className="pt-[88px] min-h-screen bg-ivory">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-champagne mb-3">Legal</p>
          <h1 className="font-display text-4xl text-noir">Terms of Service</h1>
          <p className="font-serif text-charcoal-soft mt-3">Last updated: January 2025</p>
        </div>

        <Section title="Acceptance of Terms">
          <p>By accessing or using GLAMOUR AI, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
        </Section>

        <Section title="Use of the Platform">
          <p>You may use GLAMOUR AI only for lawful purposes and in accordance with these terms. You agree not to use our platform to transmit harmful, fraudulent, or unlawful content.</p>
          <p>You are responsible for maintaining the confidentiality of your account credentials.</p>
        </Section>

        <Section title="AI Features">
          <p>Our AI-powered features — including Virtual Try-On, beauty recommendations, and the Beauty Chatbot — are provided for informational and entertainment purposes. Results may vary. We do not guarantee that AI recommendations will suit every individual.</p>
        </Section>

        <Section title="Purchases & Payments">
          <p>All prices are listed in USD. We reserve the right to modify prices at any time. Orders are confirmed only upon receipt of payment and order confirmation email.</p>
        </Section>

        <Section title="Intellectual Property">
          <p>All content on GLAMOUR AI — including text, images, AI models, and software — is the property of GLAMOUR AI and protected by applicable intellectual property laws.</p>
        </Section>

        <Section title="Limitation of Liability">
          <p>GLAMOUR AI is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
        </Section>

        <Section title="Contact">
          <p>For questions about these terms, contact us at <a href="mailto:legal@glamour.ai" className="text-champagne hover:underline">legal@glamour.ai</a>.</p>
        </Section>
      </div>
    </div>
  )
}
