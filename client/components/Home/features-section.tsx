"use client";

import { useInView } from "react-intersection-observer";
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
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "bg-white  dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 transform transition-all duration-700 ease-out",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
      style={{ transitionDelay: `${delay * 100}ms` }}
    >
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl text-[hsl(263.4,70%,50.4%)] font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export function FeaturesSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: <Video className="h-6 w-6" />,
      title: "Video Calls",
      description:
        "Crystal clear HD video calls with up to 50 participants. Perfect for team meetings or catching up with friends.",
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Text Chat",
      description:
        "Real-time messaging with rich text formatting, file sharing, and emoji support integrated with your calls.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "End-to-End Encryption",
      description:
        "Your conversations stay private with enterprise-grade security and end-to-end encryption on all communications.",
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "No Downloads",
      description:
        "Works directly in your browser with WebRTC technology - no apps, plugins, or extensions required.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Low Latency",
      description:
        "Engineered for real-time communication with minimal lag, even on slower connections.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Infrastructure",
      description:
        "Servers worldwide ensure the lowest possible latency regardless of your location.",
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile Ready",
      description:
        "Fully responsive design works seamlessly across desktop, tablet, and mobile devices.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Screen Sharing",
      description:
        "Share your screen, applications, or specific windows during calls with a single click.",
    },
  ];

  return (
    <section
      id="features"
      className="py-20 md:py-28  "
    >
      <div className="container mx-auto px-4 md:px-6">
        <div
          ref={ref}
          className={cn(
            "text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h2
            className="text-3xl text-[hsl(263.4,70%,50.4%)] md:text-4xl font-bold mb-6 "
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Powerful Features For Seamless Communication
          </h2>
          <p className="text-xl text-muted-foreground">
            Our platform is designed with simplicity and reliability in mind,
            offering all the tools you need to connect effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
