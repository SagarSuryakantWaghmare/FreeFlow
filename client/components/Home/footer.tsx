"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Heart } from "lucide-react";
import logo from "@/public/1.png";
import DeveloperTooltip from "@/components/ui/animated-tooltip-demo";

export function Footer() {
  return (
    <footer className="bg-black  dark:bg-[hsl(0, 0.00%, 0.00%)] border-t border-gray-200 dark:border-[hsl(215,27.9%,16.9%)]">
      <div className="container max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Main Content */}
        <div className="text-center space-y-6">
          {/* Brand Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              <Image src={logo} alt="FreeFlow Logo" width={40} height={40} className="rounded-lg" />
              <span 
                className="text-2xl font-bold text-[hsl(263.4,70%,50.4%)]"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                FREEFLOW
              </span>
            </div>
            <p className="text-sm text-[hsl(217.9,10.6%,64.9%)] max-w-md">
              Seamless peer-to-peer communication that flows freely. Connect with anyone, anywhere.
            </p>
          </div>          {/* Legal Links */}
          <div className="flex justify-center space-x-6">
            <Link href="/about" className="text-sm text-[hsl(217.9,10.6%,64.9%)] hover:text-[hsl(263.4,70%,50.4%)] transition-colors">
              About
            </Link>
            <Link href="/terms" className="text-sm text-[hsl(217.9,10.6%,64.9%)] hover:text-[hsl(263.4,70%,50.4%)] transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-sm text-[hsl(217.9,10.6%,64.9%)] hover:text-[hsl(263.4,70%,50.4%)] transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>        {/* Bottom Section */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[hsl(215,27.9%,16.9%)]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            {/* Left Side - GitHub Link */}
            <div className="flex justify-center sm:justify-start">
              <Link 
                href="https://github.com/SagarSuryakantWaghmare/FreeFlow" 
                className="inline-flex items-center space-x-2 text-[hsl(217.9,10.6%,64.9%)] hover:text-[hsl(263.4,70%,50.4%)] transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
                <span className="text-sm">View on GitHub</span>
              </Link>
            </div>

            {/* Center - Copyright */}
            <div className="text-center text-sm text-[hsl(217.9,10.6%,64.9%)]">
              &copy; 2025 FreeFlow. All rights reserved.
            </div>

            {/* Right Side - Team Info */}
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <div className="flex items-center space-x-1 text-sm text-[hsl(217.9,10.6%,64.9%)]">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500 fill-current" />
                <span>by</span>
              </div>
              <DeveloperTooltip />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
