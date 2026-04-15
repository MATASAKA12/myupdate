import { HeroSection } from "@/components/home/hero-section"
import { MarketList } from "@/components/home/market-list"
import { FeaturesSection } from "@/components/home/features-section"
import { PricingSection } from "@/components/home/pricing-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <MarketList />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </main>
  )
}
