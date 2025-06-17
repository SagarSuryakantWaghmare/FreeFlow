"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Github, Heart, Users, Zap, Shield, Globe, ArrowRight, Star, Code, Rocket } from "lucide-react";
import logo from "@/public/1.png";
import DeveloperTooltip from "@/components/ui/animated-tooltip-demo";

export default function AboutPage() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Peer-to-Peer Connection",
      description: "Direct communication without intermediary servers, ensuring faster and more private conversations.",
      details: "Built on WebRTC technology for real-time, secure peer-to-peer connections."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "End-to-End Security",
      description: "Your conversations are encrypted and secure, with no data stored on external servers.",
      details: "Military-grade encryption ensures your privacy and data security at all times."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Real-time communication with minimal latency for seamless conversations.",
      details: "Optimized for speed with advanced connection management and data compression."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Reach",
      description: "Connect with anyone, anywhere in the world, breaking down communication barriers.",
      details: "Global infrastructure ensures reliable connections across continents."
    }
  ];

  const stats = [
    { number: "100%", label: "Open Source" },
    { number: "0", label: "Data Stored" },
    { number: "∞", label: "Connections" },
    { number: "24/7", label: "Available" }
  ];

  const timeline = [
    {
      year: "2024",
      title: "Project Inception",
      description: "FreeFlow was born from a vision to create truly free and secure communication."
    },
    {
      year: "2025",
      title: "Beta Launch",
      description: "Released with core P2P chat, video calling, and group communication features."
    },
    {
      year: "Future",
      title: "Advanced Features",
      description: "Planned features include file sharing, screen sharing, and enhanced group collaboration."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 dark:from-[hsl(224,71.4%,4.1%)] dark:via-[hsl(224,71.4%,4.1%)] dark:to-[hsl(224,71.4%,4.1%)]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-8">
            {/* Logo and Brand */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-2xl opacity-20 scale-150"></div>
                <Image 
                  src={logo} 
                  alt="FreeFlow Logo" 
                  width={120} 
                  height={120} 
                  className="rounded-2xl relative z-10 shadow-2xl" 
                />
              </div>
              
              <div className="space-y-4">
                <h1 
                  className="text-6xl md:text-7xl font-bold text-[hsl(263.4,70%,50.4%)] tracking-tight"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  FREEFLOW
                </h1>
                <p className="text-xl md:text-2xl text-[hsl(217.9,10.6%,64.9%)] max-w-3xl mx-auto leading-relaxed">
                  The future of peer-to-peer communication. 
                  <span className="text-[hsl(263.4,70%,50.4%)] font-semibold"> Free. Secure. Limitless.</span>
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-[hsl(263.4,70%,50.4%)]">
                    {stat.number}
                  </div>
                  <div className="text-sm text-[hsl(217.9,10.6%,64.9%)]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white/50 dark:bg-[hsl(224,71.4%,4.1%)] backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-[hsl(263.4,70%,50.4%)]">
                Our Mission
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="text-lg md:text-xl text-[hsl(217.9,10.6%,64.9%)] leading-relaxed space-y-6">
              <p>
                At FreeFlow, we believe communication should be <strong className="text-[hsl(263.4,70%,50.4%)]">truly free</strong> – 
                free from surveillance, free from data collection, and free from the constraints of traditional platforms.
              </p>
              <p>
                We're building the next generation of communication tools that put <strong className="text-[hsl(263.4,70%,50.4%)]">privacy first</strong>, 
                <strong className="text-[hsl(263.4,70%,50.4%)]"> security by design</strong>, and 
                <strong className="text-[hsl(263.4,70%,50.4%)]"> user freedom</strong> at the core of everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[hsl(263.4,70%,50.4%)]">
                Why Choose FreeFlow?
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                    activeFeature === index
                      ? "bg-[hsl(263.4,70%,50.4%)]/10 border-[hsl(263.4,70%,50.4%)] shadow-lg scale-105"
                      : "bg-white/50 dark:bg-[hsl(224,71.4%,4.1%)]/50 border-gray-200 dark:border-[hsl(215,27.9%,16.9%)] hover:border-[hsl(263.4,70%,50.4%)]/50"
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className={`mb-4 transition-colors ${
                    activeFeature === index ? "text-[hsl(263.4,70%,50.4%)]" : "text-[hsl(217.9,10.6%,64.9%)]"
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-[hsl(263.4,70%,50.4%)]">
                    {feature.title}
                  </h3>
                  <p className="text-[hsl(217.9,10.6%,64.9%)] mb-3 leading-relaxed">
                    {feature.description}
                  </p>
                  <p className="text-sm text-[hsl(217.9,10.6%,64.9%)] opacity-80">
                    {feature.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white/50 dark:bg-[hsl(224,71.4%,4.1%)] backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-[hsl(263.4,70%,50.4%)]">
                Our Journey
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>
              
              {timeline.map((item, index) => (
                <div key={index} className={`relative flex items-center mb-16 ${
                  index % 2 === 0 ? "justify-start" : "justify-end"
                }`}>
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[hsl(263.4,70%,50.4%)] rounded-full border-4 border-white dark:border-[hsl(224,71.4%,4.1%)] shadow-lg z-10"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <div className="bg-white dark:bg-[hsl(224,71.4%,4.1%)] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-[hsl(215,27.9%,16.9%)]">
                      <div className="text-2xl font-bold text-[hsl(263.4,70%,50.4%)] mb-2">
                        {item.year}
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-[hsl(263.4,70%,50.4%)]">
                        {item.title}
                      </h3>
                      <p className="text-[hsl(217.9,10.6%,64.9%)] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-[hsl(263.4,70%,50.4%)]">
                Meet Our Team
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"></div>
              <p className="text-lg text-[hsl(217.9,10.6%,64.9%)] max-w-2xl mx-auto">
                The passionate developers behind FreeFlow, working together to create the future of communication.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-center space-x-3 text-lg text-[hsl(217.9,10.6%,64.9%)]">
                <span>Made with</span>
                <Heart className="h-6 w-6 text-red-500 fill-current" />
                <span>by our amazing team</span>
              </div>
              <DeveloperTooltip />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-600/5 dark:to-blue-600/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-[hsl(263.4,70%,50.4%)]">
                Join the Revolution
              </h2>
              <p className="text-lg text-[hsl(217.9,10.6%,64.9%)] max-w-2xl mx-auto leading-relaxed">
                Experience the future of communication. Start your journey with FreeFlow today and 
                discover what truly free communication feels like.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/user"
                className="inline-flex items-center space-x-2 bg-[hsl(263.4,70%,50.4%)] hover:bg-[hsl(263.4,70%,45%)] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Rocket className="h-5 w-5" />
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <Link
                href="https://github.com/SagarSuryakantWaghmare/FreeFlow"
                className="inline-flex items-center space-x-2 border border-[hsl(263.4,70%,50.4%)] text-[hsl(263.4,70%,50.4%)] hover:bg-[hsl(263.4,70%,50.4%)] hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300"
              >
                <Github className="h-5 w-5" />
                <span>View Source</span>
                <Star className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
