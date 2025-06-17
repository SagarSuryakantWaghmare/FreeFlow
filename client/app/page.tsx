import { HeroSection } from "@/components/Home/hero-section";
import { FeaturesSection } from "@/components/Home/features-section";
import { PricingSection } from "@/components/Home/pricing-section";
import { TestimonialsSection } from "@/components/Home/testimonials-section";
import { CtaSection } from "@/components/Home/cta-section";
import { Footer } from "@/components/Home/footer";
import TextHoverEffectDemo from "@/components/text-hover-effect-demo";

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
      <TextHoverEffectDemo />
    </div>
  );
}