"use client";

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import omkar from '@/public/Home/omkar.jpg';
import Sourabh from '@/public/Home/Saurabh.jpg';
import rajat from '@/public/Home/rajat.png';
import Aniket from '@/public/Home/Aniket.jpg';
import p from '@/public/Home/p.jpg';
import vedant from '@/public/Home/Vedant.jpg';

export function AnimatedTestimonialsDemo() {
  const testimonials = [
    {
      quote: "I use this P2P platform to chat with toppers and get important questions, helping me score higher than others.",
      name: "Sourabh",
      designation: "The Comeback Kid - College Papers",
      src: Sourabh.src,
    },
    {
      quote: "FreeFlow has been a lifesaver for coordinating college events. Whether it's connecting with guest speakers or conducting virtual meetings, it just works—no hassle.",
      name: "Omkar",
      designation: "Project Coordinator - Campus Innovation Cell",
      src: omkar.src,
    },
    {
      quote: "During our hackathon, FreeFlow helped us collaborate smoothly with teammates in different cities. The stable connection and zero downloads saved us a lot of time.",
      name: "Rajat",
      designation: "Backend Developer - Hackathon Squad",
      src: rajat.src,
    },
    {
      quote: "This platform helps me coordinate with others anonymously, making collaboration easy and stress-free.",
      name: "Aniket",
      designation: "Student Representative - Anime Club, College",
      src: Aniket.src,
    },
    {
      quote: "Using this platform makes managing technical aspects of college events faster, smarter, and more collaborative.",
      name: "Vedant Nirval",
      designation: "Technical Lead - College Events",
      src: vedant.src,
    },
    {
      quote: "This platform helps in organizing and coordinating college events smoothly by connecting everyone efficiently.",
      name: "Pradyumna Sangamkar",
      designation: "Vice-lead Coordinator - Campus Innovation Cell",
      src: p.src,
    },
  ];

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
        
        <div className="flex items-center justify-center">
          <AnimatedTestimonials 
            testimonials={testimonials} 
            autoplay={true}
            autoplayInterval={6000}
          />
        </div>
      </div>
    </section>
  );
}
