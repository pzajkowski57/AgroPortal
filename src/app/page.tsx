import { HeroSection } from '@/components/home/HeroSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { FeaturedListings } from '@/components/home/FeaturedListings'
import { StatsSection } from '@/components/home/StatsSection'
import { CTASection } from '@/components/home/CTASection'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <CategoriesSection />
      <FeaturedListings />
      <StatsSection />
      <CTASection />
    </main>
  )
}
