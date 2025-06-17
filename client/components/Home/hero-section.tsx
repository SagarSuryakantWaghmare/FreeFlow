"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video, MessageCircle } from "lucide-react";
import ConnectionAnimation from "@/components/Home/ConnectionAnimation";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  return (
    <BackgroundBeamsWithCollision className="relative overflow-hidden pt-36 pb-16 md:pt-40 md:pb-24 min-h-screen bg-black dark:from-[hsl(224,71.4%,4.1%)] dark:via-[hsl(263.4,70%,50.4%)]/5 dark:to-[hsl(224,71.4%,4.1%)]">
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
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-wide relative z-20"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              <span className="text-[hsl(263.4,70%,50.4%)]">FREEFLOW</span>
              <br />
              Seamless Peer-to-Peer Communication
            </h1>
            <p className="text-lg md:text-xl text-[hsl(217.9,10.6%,64.9%)] max-w-xl relative z-20">
              Connect with anyone, anywhere through secure video calls and text chat –
              no downloads, no hassle, just communication that flows freely.
            </p>            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-20">
              <Button size="lg" asChild>
                <Link href="/p2p">Go Private Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/video-call">
                  <Video className="mr-2 h-5 w-5" />
                  Video Call
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#features">Learn More</Link>
              </Button>
            </div>
            <div className="pt-4 text-[hsl(217.9,10.6%,64.9%)] text-sm relative z-20">
              No credit card required. Free forever for personal use.
            </div>
          </div>

          <div
            className={`relative transition-all duration-1000 ease-out delay-300 z-20 ${isVisible
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

    </BackgroundBeamsWithCollision>
  );
}
