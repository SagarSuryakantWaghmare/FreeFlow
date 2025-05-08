"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useInView } from "@/lib/hooks/use-intersection-observer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Testimonial {
  name: string;
  title: string;
  company: string;
  quote: string;
  avatarUrl: string;
}

export function TestimonialsSection() {
  const [ref, inView] = useInView({ triggerOnce: true });
  const [activeIndex, setActiveIndex] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      title: "Marketing Director",
      company: "TechGlobe Inc.",
      quote: "FreeFlow has transformed how our remote team collaborates. The video quality is exceptional, and the fact that there's no download makes onboarding new team members incredibly easy.",
      avatarUrl: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    {
      name: "Michael Chen",
      title: "Lead Developer",
      company: "Quantum Solutions",
      quote: "As a developer, I appreciate how robust and reliable FreeFlow is. The API access in the enterprise plan has allowed us to integrate it seamlessly into our existing workflow tools.",
      avatarUrl: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    {
      name: "Emily Rodriguez",
      title: "Remote Learning Coordinator",
      company: "Global Education Alliance",
      quote: "Teaching students remotely requires a platform that's both reliable and simple to use. FreeFlow checks both boxes, and the screen-sharing annotation feature is a game-changer for interactive lessons.",
      avatarUrl: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    {
      name: "David Park",
      title: "CEO",
      company: "Startup Ventures",
      quote: "We've tried numerous video conferencing solutions, but FreeFlow stands out for its crystal clear quality and intuitive interface. It's become essential to our day-to-day operations.",
      avatarUrl: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
    {
      name: "Jessica Winters",
      title: "Telemedicine Specialist",
      company: "HealthFirst Services",
      quote: "The security and reliability of FreeFlow make it perfect for our telehealth consultations. Patients love how easy it is to join calls, and doctors appreciate the professional quality.",
      avatarUrl: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  ];

  const nextSlide = useCallback(() => {
    if (sliding) return;
    setSliding(true);
    setSlideDirection('right');
    setTimeout(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      setTimeout(() => {
        setSliding(false);
        setSlideDirection(null);
      }, 50);
    }, 300);
  }, [sliding, testimonials.length]);

  const prevSlide = useCallback(() => {
    if (sliding) return;
    setSliding(true);
    setSlideDirection('left');
    setTimeout(() => {
      setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
      setTimeout(() => {
        setSliding(false);
        setSlideDirection(null);
      }, 50);
    }, 300);
  }, [sliding, testimonials.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 8000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section id="testimonials" className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            What Our Users Say
          </h2>
          <p className="text-xl text-muted-foreground">
            Thousands of teams and individuals rely on FreeFlow for their communication needs.
            Here's what some of them have to say:
          </p>
        </div>

        <div 
          ref={ref}
          className={cn(
            "max-w-4xl mx-auto transition-all duration-1000",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <div className="relative">
            <Card className="border shadow-xl">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-8 h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow">
                    <img
                      src={testimonials[activeIndex].avatarUrl}
                      alt={testimonials[activeIndex].name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div 
                    className={cn(
                      "transition-all duration-300 max-w-2xl",
                      sliding ? (
                        slideDirection === 'right' 
                          ? "opacity-0 -translate-x-8" 
                          : "opacity-0 translate-x-8"
                      ) : "opacity-100 translate-x-0"
                    )}
                  >
                    <Quote className="h-8 w-8 text-primary/30 mx-auto mb-4" />
                    <blockquote className="mb-6 text-xl md:text-2xl font-medium italic">
                      "{testimonials[activeIndex].quote}"
                    </blockquote>
                    <footer>
                      <div className="font-semibold text-lg">{testimonials[activeIndex].name}</div>
                      <div className="text-muted-foreground">
                        {testimonials[activeIndex].title} at {testimonials[activeIndex].company}
                      </div>
                    </footer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="rounded-full"
                disabled={sliding}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Previous testimonial</span>
              </Button>

              {/* Indicator Dots */}
              <div className="flex space-x-2 items-center">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === activeIndex
                        ? "bg-primary w-4"
                        : "bg-gray-300 dark:bg-gray-700"
                    )}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="rounded-full"
                disabled={sliding}
              >
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Next testimonial</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}