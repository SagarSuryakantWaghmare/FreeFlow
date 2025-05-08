import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 md:py-28 text-[hsl(263.4,70%,50.4%)] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full  " />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full " />
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 
            className="text-3xl md:text-5xl font-bold mb-6"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Ready to Transform Your Communication?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 md:mb-12">
            Join thousands of teams who've already made the switch to seamless, 
            secure peer-to-peer communication.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link href="/signup">Join Now Free</Link>
            </Button>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 text-left text-sm text-primary-foreground/90">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-white mt-px" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-white mt-px" />
                <span>Free plan available forever</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-white mt-px" />
                <span>No downloads needed</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-white mt-px" />
                <span>Works on all modern browsers</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-white mt-px" />
                <span>End-to-end encryption</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-white mt-px" />
                <span>14-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}