import { HeroSection } from "@/components/Home/hero-section";
import { AnimatedFeaturesDemo } from "@/components/animated-features-demo";
import { AnimatedTestimonialsDemo } from "@/components/animated-testimonials-demo";
import { CtaSection } from "@/components/Home/cta-section";
import { Footer } from "@/components/Home/footer";
import TextHoverEffectDemo from "@/components/text-hover-effect-demo";

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <AnimatedFeaturesDemo />
      <AnimatedTestimonialsDemo />
      <CtaSection />
      <Footer />
      <TextHoverEffectDemo />
    </div>
  );
}