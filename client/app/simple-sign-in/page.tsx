"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { User, ArrowLeft } from 'lucide-react';

export default function SimpleSignIn() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setIsLoading(true);

    // Generate a unique user ID
    const userId = uuidv4();

    // Store the username and userId in localStorage
    localStorage.setItem('username', username);
    localStorage.setItem('userId', userId);

    // Navigate to the chat page
    toast.success(`Welcome, ${username}!`);
    router.push('/user/chat');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const inputVariants = {
    focus: { 
      scale: 1.02,
      boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.5)",
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.03 },
    tap: { scale: 0.97 }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <motion.div 
        className="w-full max-w-md rounded-xl bg-card p-8 shadow-lg border border-border"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        <motion.div variants={itemVariants} className="mb-6 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Welcome to FreeFlow</h1>
          <p className="text-muted-foreground mt-2">Enter a username to start chatting</p>
        </motion.div>

        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
          <motion.div className="space-y-2">
            <label htmlFor="username" className="text-foreground text-sm font-medium">Username</label>
            <motion.div
              whileFocus="focus"
              variants={inputVariants}
            >
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
                className="bg-background border-input focus:ring-primary/30 focus:border-primary"
                required
              />
            </motion.div>
          </motion.div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </motion.div>
        </motion.form>

        <motion.div variants={itemVariants} className="mt-6 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
