"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function P2PLanding() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Animation refs for features
  const [featureRef, featureInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  // For button hover animation
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  useEffect(() => {
    // Check if the user is already logged in
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');

    if (username && userId) {
      setIsLoggedIn(true);
    }

    // Set visibility for animation
    setIsVisible(true);
  }, []);

  // Feature animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const featureVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Button variants for animation
  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 300,
      },
    },
    tap: {
      scale: 0.95,
    },
  };
  return (
    <div className="min-h-screen mt-8 flex flex-col bg-background text-foreground">
      <main className="mt-4 md:mt-8 flex-1 container mx-auto px-2 md:px-4 py-8 md:py-16 flex flex-col items-center justify-center text-center">        <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
        transition={{ duration: 0.6 }}
        className="mb-6 md:mb-10 px-4"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl text-center font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-purple-300">
          Secure Peer-to-Peer Communication
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mb-8 md:mb-12 mx-auto">
          Experience truly private conversations with direct peer-to-peer technology.
          No servers storing your messages, no third parties—just you and the people you chat with.
        </p>
      </motion.div>        <motion.div
        ref={featureRef}
        variants={containerVariants}
        initial="hidden"
        animate={featureInView ? "visible" : "hidden"}
        className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12 px-4"
      >          <motion.div
        variants={featureVariants}
        className="bg-card hover:bg-card/90 rounded-xl p-4 md:p-6 shadow-md transition-all duration-200 border border-border hover:border-primary/30"
      >
            <Shield className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-primary mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">End-to-End Encryption</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              All your conversations are encrypted and decrypted only on your devices
            </p>
          </motion.div>          <motion.div
            variants={featureVariants}
            className="bg-card hover:bg-card/90 rounded-xl p-4 md:p-6 shadow-md transition-all duration-200 border border-border hover:border-primary/30"
          >
            <Lock className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-primary mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">No Message Storage</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Your messages never touch a server, eliminating the risk of data breaches
            </p>
          </motion.div>          <motion.div
            variants={featureVariants}
            className="bg-card hover:bg-card/90 rounded-xl p-4 md:p-6 shadow-md transition-all duration-200 border border-border hover:border-primary/30"
          >
            <Zap className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-primary mx-auto mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Direct Connection</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Peer-to-peer technology creates direct channels between users for maximum privacy
            </p>
          </motion.div>
        </motion.div>        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="px-4"
        >
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setIsButtonHovered(true)}
            onHoverEnd={() => setIsButtonHovered(false)}
          >            <Button
            size="lg"
            onClick={() => router.push('/simple-sign-in')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm md:text-base lg:text-lg px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-6 h-auto cursor-pointer rounded-lg shadow-lg transition-all duration-200 ease-in-out"
          >
              Start Secure Chatting
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: isButtonHovered ? 5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>
      </main>      <footer className="container mx-auto p-2 md:p-4 text-center text-muted-foreground text-xs md:text-sm">
        <p>© 2025 FreeFlow. All communications are peer-to-peer and not stored on our servers.</p>
      </footer>
    </div>
  );
}
