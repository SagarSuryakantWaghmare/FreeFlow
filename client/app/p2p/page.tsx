"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Zap, ArrowRight, MessageCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { Footer } from '@/components/Home/footer';

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
  };  return (
    <div className="min-h-screen">
        <div className="container relative z-10 mx-auto px-4 md:px-6 pt-36 pb-8 md:pt-40 md:pb-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-block rounded-full bg-[hsl(263.4,70%,50.4%)/0.1] px-4 py-2 text-sm font-semibold text-[hsl(263.4,70%,50.4%)] mb-6">
            Secure. Private. Direct.
          </div>
          
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-wide mb-6 relative z-20"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <span className="text-[hsl(263.4,70%,50.4%)]">PEER-TO-PEER</span>
            <br />
            Secure Communication
          </h1>
          
          <p className="text-lg md:text-xl text-[hsl(217.9,10.6%,64.9%)] max-w-3xl mx-auto mb-12 relative z-20">
            Experience truly private conversations with direct peer-to-peer technology.
            No servers storing your messages, no third parties—just you and the people you chat with.
          </p>

          {/* Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16"
          >
            <div className="group bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 rounded-2xl p-8 text-left hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <MessageCircle className="h-12 w-12 text-[hsl(263.4,70%,50.4%)] mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-white dark:text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                One-on-One P2P Chat
              </h3>
              <p className="text-[hsl(217.9,10.6%,64.9%)] mb-4">
                Direct encrypted communication between two users. No servers, maximum privacy.
              </p>
              <ul className="text-sm text-[hsl(217.9,10.6%,64.9%)] space-y-2">
                <li className="flex items-center"><span className="text-[hsl(263.4,70%,50.4%)] mr-2">•</span> Complete anonymity</li>
                <li className="flex items-center"><span className="text-[hsl(263.4,70%,50.4%)] mr-2">•</span> No message history stored</li>
                <li className="flex items-center"><span className="text-[hsl(263.4,70%,50.4%)] mr-2">•</span> Real-time direct connection</li>
              </ul>
            </div>
            
            <div className="group bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 rounded-2xl p-8 text-left hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <Users className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-white dark:text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                Group Chat
              </h3>
              <p className="text-[hsl(217.9,10.6%,64.9%)] mb-4">
                Secure group conversations with multiple participants. Create or join existing groups.
              </p>
              <ul className="text-sm text-[hsl(217.9,10.6%,64.9%)] space-y-2">
                <li className="flex items-center"><span className="text-green-500 mr-2">•</span> Multiple participants</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">•</span> Create custom groups</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">•</span> Join existing conversations</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>        {/* Features Section */}
        <motion.div
          ref={featureRef}
          variants={containerVariants}
          initial="hidden"
          animate={featureInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto"
        >
          <motion.div
            variants={featureVariants}
            className="group bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            <Shield className="h-16 w-16 text-[hsl(263.4,70%,50.4%)] mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-white dark:text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              End-to-End Encryption
            </h3>
            <p className="text-[hsl(217.9,10.6%,64.9%)]">
              All your conversations are encrypted and decrypted only on your devices
            </p>
          </motion.div>
          
          <motion.div
            variants={featureVariants}
            className="group bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            <Lock className="h-16 w-16 text-[hsl(263.4,70%,50.4%)] mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-white dark:text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              No Message Storage
            </h3>
            <p className="text-[hsl(217.9,10.6%,64.9%)]">
              Your messages never touch a server, eliminating the risk of data breaches
            </p>
          </motion.div>
          
          <motion.div
            variants={featureVariants}
            className="group bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 dark:hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            <Zap className="h-16 w-16 text-[hsl(263.4,70%,50.4%)] mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-white dark:text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Direct Connection
            </h3>
            <p className="text-[hsl(217.9,10.6%,64.9%)]">
              Peer-to-peer technology creates direct channels between users for maximum privacy
            </p>
          </motion.div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6 items-center justify-center"
        >
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setIsButtonHovered(true)}
            onHoverEnd={() => setIsButtonHovered(false)}
          >
            <Button
              size="lg"
              onClick={() => router.push('/simple-sign-in')}
              className="bg-[hsl(263.4,70%,50.4%)] hover:bg-[hsl(263.4,70%,45%)] text-white text-lg px-8 py-6 h-auto rounded-2xl shadow-2xl transition-all duration-300 relative z-20"
            >
              Start P2P Chatting
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: isButtonHovered ? 8 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="ml-3 h-5 w-5" />
              </motion.div>
            </Button>
          </motion.div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/group-chat')}
              className="border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-lg px-8 py-6 h-auto rounded-2xl shadow-2xl transition-all duration-300 backdrop-blur-sm relative z-20"
            >
              Join Group Chat
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>          </motion.div>
        </motion.div>
      </div>
     
      
    </div>
  );
}