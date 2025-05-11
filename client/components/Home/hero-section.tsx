"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video, MessageCircle } from "lucide-react";
import ConnectionAnimation from "@/components/Home/ConnectionAnimation";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden pt-36 pb-16 md:pt-40 md:pb-24">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0" />
      {/* Changes in the ml for the desktop view */}

      {/* Hero content */}
      <div className="container relative z-10 mx-auto px-4 md:px-6 md:ml-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            className={`space-y-6 transition-all duration-1000 ease-out ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
              }`}
          >
            <div className="inline-block rounded-full bg-[hsl(263.4,70%,50.4%)/0.1] px-4 py-2 text-sm font-semibold text-[hsl(263.4,70%,50.4%)]">
              Simple. Secure. Free.
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-wide"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              <span className="text-[hsl(263.4,70%,50.4%)]">FREEFLOW</span>
              <br />
              Seamless Peer-to-Peer Communication
            </h1>
            <p className="text-lg md:text-xl text-[hsl(217.9,10.6%,64.9%)] max-w-xl">
              Connect with anyone, anywhere through secure video calls and text chat –
              no downloads, no hassle, just communication that flows freely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#features">Learn More</Link>
              </Button>
            </div>
            <div className="pt-4 text-[hsl(217.9,10.6%,64.9%)] text-sm">
              No credit card required. Free forever for personal use.
            </div>
          </div>

          <div
            className={`relative transition-all duration-1000 ease-out delay-300 ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
              }`}
          >
            {/* Decorative elements */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[hsl(263.4,70%,50.4%)/0.1] rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[hsl(263.4,70%,50.4%)/0.1] rounded-full blur-3xl" />

            {/* Animation container */}
            <div className="w-full flex justify-center items-center">
              <div className="w-full max-w-lg">
                <ConnectionAnimation />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 md:px-6 mt-16 md:mt-24">
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 py-8 px-4 md:px-8 bg-white dark:bg-[hsl(215,27.9%,16.9%)] rounded-xl shadow-lg border border-[hsl(215,27.9%,16.9%)] transition-all duration-1000 ease-out delay-500 ${isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
            }`}
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[hsl(263.4,70%,50.4%)] mb-2">100</div>
            <div className="text-sm text-[hsl(217.9,10.6%,64.9%)]">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[hsl(263.4,70%,50.4%)] mb-2">2000+</div>
            <div className="text-sm text-[hsl(217.9,10.6%,64.9%)]">Active Hours Monthly</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[hsl(263.4,70%,50.4%)] mb-2">2</div>
            <div className="text-sm text-[hsl(217.9,10.6%,64.9%)]">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-[hsl(263.4,70%,50.4%)] mb-2">4.9</div>
            <div className="text-sm text-[hsl(217.9,10.6%,64.9%)]">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}
