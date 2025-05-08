import { HeroSection } from "@/components/Home/hero-section";
import { FeaturesSection } from "@/components/Home/features-section";
import { PricingSection } from "@/components/Home/pricing-section";
import { TestimonialsSection } from "@/components/Home/testimonials-section";
import { CtaSection } from "@/components/Home/cta-section";

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}