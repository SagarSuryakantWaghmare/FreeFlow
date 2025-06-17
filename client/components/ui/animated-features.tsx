"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  category?: string;
}

interface AnimatedFeaturesProps {
  features: Feature[];
  autoplay?: boolean;
  autoplayInterval?: number;
  className?: string;
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export function AnimatedFeatures({
  features,
  autoplay = true,
  autoplayInterval = 4000,
  className,
  itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
}: AnimatedFeaturesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleItems, setVisibleItems] = useState(itemsPerView.desktop);

  // Update visible items based on screen size
  useEffect(() => {
    const updateVisibleItems = () => {
      if (window.innerWidth < 768) {
        setVisibleItems(itemsPerView.mobile);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(itemsPerView.tablet);
      } else {
        setVisibleItems(itemsPerView.desktop);
      }
    };

    updateVisibleItems();
    window.addEventListener("resize", updateVisibleItems);
    return () => window.removeEventListener("resize", updateVisibleItems);
  }, [itemsPerView]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoplay || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, features.length - visibleItems);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [autoplay, autoplayInterval, isPaused, features.length, visibleItems]);

  const nextSlide = () => {
    const maxIndex = Math.max(0, features.length - visibleItems);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    const maxIndex = Math.max(0, features.length - visibleItems);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index: number) => {
    const maxIndex = Math.max(0, features.length - visibleItems);
    setCurrentIndex(Math.min(index, maxIndex));
  };

  const maxIndex = Math.max(0, features.length - visibleItems);

  return (
    <div
      className={cn("relative w-full", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main carousel container */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex"
          initial={false}
          animate={{
            x: `-${(currentIndex * 100) / visibleItems}%`,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={cn(
                "flex-shrink-0 px-3",
                visibleItems === 1 && "w-full",
                visibleItems === 2 && "w-1/2",
                visibleItems === 3 && "w-1/3"
              )}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 h-full"
                whileHover={{
                  scale: 1.02,
                  y: -5,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                {/* Icon */}
                <motion.div
                  className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4"
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 10,
                  }}
                >
                  {feature.icon}
                </motion.div>

                {/* Category (if provided) */}
                {feature.category && (
                  <motion.span
                    className="text-xs font-medium text-primary/70 bg-primary/10 px-2 py-1 rounded-full mb-3 inline-block"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {feature.category}
                  </motion.span>
                )}

                {/* Title */}
                <motion.h3
                  className="text-xl text-[hsl(263.4,70%,50.4%)] font-semibold mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {feature.title}
                </motion.h3>

                {/* Description */}
                <motion.p
                  className="text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Navigation arrows */}
      <AnimatePresence>
        {maxIndex > 0 && (
          <>
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Dots indicator */}
      {maxIndex > 0 && (
        <div className="flex justify-center space-x-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentIndex
                  ? "bg-primary"
                  : "bg-gray-300 dark:bg-gray-600"
              )}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              initial={false}
              animate={{
                scale: index === currentIndex ? 1.2 : 1,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
