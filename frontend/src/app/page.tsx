// src/app/page.tsx — Homepage

import { HeroSection }         from '@/components/product/HeroSection'
import { PerksStrip }          from '@/components/product/PerksStrip'
import { BrandStrip }          from '@/components/product/BrandStrip'
import { CategoryGrid }        from '@/components/product/CategoryGrid'
import { FeaturedProducts }    from '@/components/product/FeaturedProducts'
import { TryOnBanner }         from '@/components/tryon/TryOnBanner'
import { TestimonialsSection } from '@/components/product/TestimonialsSection'
import { NewsletterSection }   from '@/components/product/NewsletterSection'
import { RecommendedProducts } from '@/components/product/RecommendedProducts'

export default function HomePage() {
  return (
    <div className="pt-[88px]">
      <HeroSection />
      <PerksStrip />
      <BrandStrip />
      <CategoryGrid />
      <FeaturedProducts />
      <TryOnBanner />
      <TestimonialsSection />
      <NewsletterSection />
      <RecommendedProducts />
    </div>
  )
}
