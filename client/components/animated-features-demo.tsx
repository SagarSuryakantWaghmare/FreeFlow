"use client";

import {
  Video,
  MessageCircle,
  Shield,
  Download,
  Zap,
  Globe,
  Smartphone,
  Users,
} from "lucide-react";
import { AnimatedFeatures, Feature } from "@/components/ui/animated-features";

const features: Feature[] = [
  {
    icon: <Video className="h-6 w-6" />,
    title: "Video Calls",
    description:
      "Crystal clear HD video calls with up to 50 participants. Perfect for team meetings or catching up with friends.",
    category: "Communication",
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: "Text Chat",
    description:
      "Real-time messaging with rich text formatting, file sharing, and emoji support integrated with your calls.",
    category: "Messaging",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "End-to-End Encryption",
    description:
      "Your conversations stay private with enterprise-grade security and end-to-end encryption on all communications.",
    category: "Security",
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: "No Downloads",
    description:
      "Works directly in your browser with WebRTC technology - no apps, plugins, or extensions required.",
    category: "Convenience",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Low Latency",
    description:
      "Engineered for real-time communication with minimal lag, even on slower connections.",
    category: "Performance",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Global Infrastructure",
    description:
      "Servers worldwide ensure the lowest possible latency regardless of your location.",
    category: "Infrastructure",
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: "Mobile Ready",
    description:
      "Fully responsive design works seamlessly across desktop, tablet, and mobile devices.",
    category: "Compatibility",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Screen Sharing",
    description:
      "Share your screen, applications, or specific windows during calls with a single click.",
    category: "Collaboration",
  },
];

export function AnimatedFeaturesDemo() {
  return (
    <section id="features" className="py-20 bg-black md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2
            className="text-3xl text-[hsl(263.4,70%,50.4%)] md:text-4xl font-bold mb-6"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Powerful Features For Seamless Communication
          </h2>
          <p className="text-xl text-muted-foreground">
            Our platform is designed with simplicity and reliability in mind,
            offering all the tools you need to connect effectively.
          </p>
        </div>

        {/* Animated Features Carousel */}
        <AnimatedFeatures
          features={features}
          autoplay={true}
          autoplayInterval={5000}
          itemsPerView={{
            mobile: 1,
            tablet: 2,
            desktop: 3,
          }}
          className="max-w-7xl mx-auto"
        />
      </div>
    </section>
  );
}
