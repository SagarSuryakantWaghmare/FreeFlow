"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video, MessageCircle, Shield, Monitor } from "lucide-react";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden pt-36 pb-16 md:pt-40 md:pb-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0" />
      
      {/* Hero content */}
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div 
            className={`space-y-6 transition-all duration-1000 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Simple. Secure. Free.
            </div>
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-wide"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              <span className="text-primary">FREEFLOW</span>
              <br />
              Seamless Peer-to-Peer Communication
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Connect with anyone, anywhere through secure video calls and text chat - 
              no downloads, no hassle, just communication that flows freely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#features">
                  Learn More
                </Link>
              </Button>
            </div>
            <div className="pt-4 text-muted-foreground text-sm">
              No credit card required. Free forever for personal use.
            </div>
          </div>

          <div 
            className={`relative transition-all duration-1000 ease-out delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* Decorative elements */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl" />
            
            {/* Hero image/mockup */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border">
              <div className="h-8 bg-gray-100 dark:bg-gray-700 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xs text-center flex-1 text-muted-foreground">FreeFlow Call in Progress</div>
              </div>
              <div className="aspect-video bg-gray-900 relative">
                <div className="absolute inset-0 grid grid-cols-2 gap-2 p-4">
                  <div className="rounded-lg bg-gray-800 overflow-hidden">
                    <img 
                      src="https://images.pexels.com/photos/3771089/pexels-photo-3771089.jpeg" 
                      alt="Video call participant" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="rounded-lg bg-gray-800 overflow-hidden">
                    <img 
                      src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" 
                      alt="Video call participant" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Call controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 bg-gray-900/80 backdrop-blur-sm rounded-full p-2">
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                    <span className="sr-only">End Call</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 2v4" />
                      <path d="M8 2v4" />
                      <path d="M22 9s0 11-10 11S2 9 2 9" />
                      <path d="M18.5 13a4 4 0 0 1-7 0" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Chat portion */}
              <div className="h-36 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    J
                  </div>
                  <div className="bg-primary/10 rounded-lg p-2 text-sm">
                    Can you see the shared document now?
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2 justify-end">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-sm">
                    Yes, I can see it perfectly. Let's discuss the changes.
                  </div>
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-500 text-xs font-bold">
                    S
                  </div>
                </div>
                <div className="mt-auto pt-2 flex gap-2">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-10" />
                  <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 md:px-6 mt-16 md:mt-24">
        <div 
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 py-8 px-4 md:px-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-1000 ease-out delay-500 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">2M+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10M+</div>
            <div className="text-sm text-muted-foreground">Calls Monthly</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">150+</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">4.9</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}