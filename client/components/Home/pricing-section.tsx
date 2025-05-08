"use client";

import { useState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function PricingSection() {
  const [annualBilling, setAnnualBilling] = useState(true);
  const { ref, inView } = useInView({ triggerOnce: true });

  const toggleBilling = () => {
    setAnnualBilling(!annualBilling);
  };

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, annual: 0 },
      description: "For personal use and small projects",
      features: [
        "1-on-1 video calls",
        "Text chat during calls",
        "Screen sharing",
        "45-minute call limit",
        "Basic quality (720p)",
      ],
      limitations: [
        "No recording",
        "No multi-participant rooms",
        "Limited customer support",
      ],
      cta: "Get Started Free",
      href: "/signup",
      popular: false,
    },
    {
      name: "Premium",
      price: { monthly: 12, annual: 9 },
      description: "For professionals and teams",
      features: [
        "Unlimited call duration",
        "Up to 50 participants",
        "HD quality (1080p)",
        "Call recording",
        "Screen sharing with annotation",
        "Custom backgrounds",
        "Priority support",
        "Analytics dashboard",
        "Admin controls",
      ],
      limitations: [],
      cta: "Start 14-day Free Trial",
      href: "/signup?plan=premium",
      popular: true,
    },
    {
      name: "Enterprise",
      price: { monthly: "Custom", annual: "Custom" },
      description: "For large organizations with custom needs",
      features: [
        "Everything in Premium",
        "Dedicated account manager",
        "Custom branding",
        "API access",
        "SSO integration",
        "Advanced analytics",
        "99.9% uptime SLA",
        "Unlimited storage",
        "Compliance & regulatory support",
      ],
      limitations: [],
      cta: "Contact Sales",
      href: "/contact",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Plans For Everyone
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Choose the plan that works best for you and your team.
            All plans come with a 14-day money-back guarantee.
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={cn(
              "text-sm font-medium transition-colors",
              !annualBilling ? "text-foreground" : "text-muted-foreground"
            )}>
              Monthly
            </span>
            <Switch 
              checked={annualBilling} 
              onCheckedChange={toggleBilling}
              className="data-[state=checked]:bg-primary"
            />
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-sm font-medium transition-colors",
                annualBilling ? "text-foreground" : "text-muted-foreground"
              )}>
                Annual
              </span>
              <Badge variant="outline" className="text-green-600 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
                Save 25%
              </Badge>
            </div>
          </div>
        </div>

        <div 
          ref={ref}
          className={cn(
            "grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={cn(
                "border",
                plan.popular 
                  ? "border-primary shadow-lg shadow-primary/10 relative overflow-hidden"
                  : "border-border shadow"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg shadow-sm">
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <span className="text-4xl font-bold">
                    {typeof plan.price[annualBilling ? 'annual' : 'monthly'] === 'number'
                      ? `$${plan.price[annualBilling ? 'annual' : 'monthly']}`
                      : plan.price[annualBilling ? 'annual' : 'monthly']}
                  </span>
                  {typeof plan.price[annualBilling ? 'annual' : 'monthly'] === 'number' && (
                    <span className="text-muted-foreground ml-1">
                      /mo{annualBilling && ', billed annually'}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">What's included:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {plan.limitations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Limitations:</p>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className={cn(
                    "w-full", 
                    plan.popular ? "" : "variant-outline"
                  )} 
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href={plan.href}>
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}