"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useInView } from "@/lib/hooks/use-intersection-observer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import omkar from '@/public/Home/omkar.jpg';
import Sourabh from '@/public/Home/Saurabh.jpg';
import rajat from '@/public/Home/rajat.png';
import Aniket from '@/public/Home/Aniket.jpg';
import p from '@/public/Home/p.jpg';
import vedant from '@/public/Home/Vedant.jpg';
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
      name: "Sourabh",
      title: "The Comeback Kid",
      company: "College Papers",
      quote: "I use this P2P platform to chat with toppers and get important questions, helping me score higher than others.",
      avatarUrl: Sourabh.src,
    },
    {
      name: "Omkar",
      title: "Project Coordinator",
      company: "Campus Innovation Cell",
      quote: "FreeFlow has been a lifesaver for coordinating college events. Whether it's connecting with guest speakers or conducting virtual meetings, it just works—no hassle.",
      avatarUrl: omkar.src,
    },
    {
      name: "Rajat",
      title: "Backend Developer",
      company: "Hackathon Squad",
      quote: "During our hackathon, FreeFlow helped us collaborate smoothly with teammates in different cities. The stable connection and zero downloads saved us a lot of time.",
      avatarUrl: rajat.src,
    },
    {
      name: "Aniket",
      title: "Student Representative",
      company: "Anime Club, College",
      quote: "This platform helps me coordinate with others anonymously, making collaboration easy and stress-free.",
      avatarUrl: Aniket.src,
    },
    {
      name: "Vedant Nirval",
      title: "College Events",
      company: "Technical Lead, Events",
      quote: "Using this platform makes managing technical aspects of college events faster, smarter, and more collaborative.",
      avatarUrl: vedant.src,
    },
    {
      name: "Pradyumna Sangamkar",
      title: "College events",
      company: "Vice -lead Coordinator, Campus Innovation Cell",
      quote: "This platform helps in organizing and coordinating college events smoothly by connecting everyone efficiently.",
      avatarUrl: p.src,
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
    <section id="testimonials" className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2
            className="text-3xl text-[hsl(263.4,70%,50.4%)] md:text-4xl font-bold mb-6"
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
                  <div className="relative mb-8 h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow">
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
                      <div className="font-semibold text-[hsl(263.4,70%,50.4%)] text-lg">{testimonials[activeIndex].name}</div>
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