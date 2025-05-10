"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Zap } from 'lucide-react';

export default function P2PLanding() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if the user is already logged in
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    
    if (username && userId) {
      setIsLoggedIn(true);
    }
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 to-indigo-800">
      <header className="w-full p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">FreeFlow P2P</h1>
          
          {isLoggedIn ? (
            <Button 
              onClick={() => router.push('/user/chat')}
              className="bg-white text-purple-900 hover:bg-white/90"
            >
              Go to Chat
            </Button>
          ) : (
            <Button 
              onClick={() => router.push('/simple-sign-in')}
              className="bg-white text-purple-900 hover:bg-white/90"
            >
              Get Started
            </Button>
          )}
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <h2 className="text-5xl font-bold text-white mb-6">Secure Peer-to-Peer Communication</h2>
        <p className="text-xl text-white/80 max-w-2xl mb-12">
          Experience truly private conversations with direct peer-to-peer technology.
          No servers storing your messages, no third parties—just you and the people you chat with.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
            <Shield className="h-12 w-12 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">End-to-End Encryption</h3>
            <p className="text-white/70">
              All your conversations are encrypted and decrypted only on your devices
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
            <Lock className="h-12 w-12 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Message Storage</h3>
            <p className="text-white/70">
              Your messages never touch a server, eliminating the risk of data breaches
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
            <Zap className="h-12 w-12 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Direct Connection</h3>
            <p className="text-white/70">
              Peer-to-peer technology creates direct channels between users for maximum privacy
            </p>
          </div>
        </div>
        
        {(
          <Button 
            size="lg" 
            onClick={() => router.push('/simple-sign-in')}
            className="bg-white text-purple-900 hover:bg-white/90 text-lg px-8 py-6 h-auto"
          >
            Start Secure Chatting
          </Button>
        )}
      </main>
      
      <footer className="container mx-auto p-4 text-center text-white/60 text-sm">
        <p>© 2025 FreeFlow. All communications are peer-to-peer and not stored on our servers.</p>
      </footer>
    </div>
  );
}
