"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

export default function SimpleSignIn() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-800 p-4">
      <div className="w-full max-w-md rounded-xl bg-white/10 p-8 backdrop-blur-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Welcome to FreeFlow</h1>
          <p className="text-gray-200">Enter a username to start chatting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-white">Username</label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter a username"
              className="bg-white/10 border-white/20 text-white focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 text-center text-white">
          <p>
            Don't want to chat now?{' '}
            <Link href="/" className="text-purple-300 hover:text-purple-200">
              Go back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
