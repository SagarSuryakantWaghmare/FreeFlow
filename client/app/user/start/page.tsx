"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Zap, Globe, Users, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SafeLocalStorage } from '@/lib/utils/SafeLocalStorage';

const StartPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  
  useEffect(() => {    // Check if user is already logged in
    const storedUsername = SafeLocalStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      // If not logged in, redirect to sign-in
      router.push('/simple-sign-in');
    }
  }, [router]);
  
  const handleStartChatting = () => {
    router.push('/user/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12 pt-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Welcome to FreeFlow P2P Chat</h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Experience truly private, serverless, peer-to-peer communication
          </p>
          {username && (
            <p className="text-lg text-indigo-200 mt-2">
              Welcome back, <span className="font-semibold">{username}</span>!
            </p>
          )}
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/10 backdrop-blur-lg border-none text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-300" />
                How It Works
              </CardTitle>
              <CardDescription className="text-indigo-200">
                Understanding the technology behind FreeFlow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-300" />
                  Direct Peer Connection
                </h3>
                <p className="text-sm text-indigo-200">
                  FreeFlow establishes direct WebRTC connections between browsers, 
                  eliminating the need for message storage on servers.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-300" />
                  Signaling Server
                </h3>
                <p className="text-sm text-indigo-200">
                  Our signaling server only helps establish the initial connection
                  between peers. Once connected, all messages flow directly between users.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-300" />
                  End-to-End Encryption
                </h3>
                <p className="text-sm text-indigo-200">
                  All communication is encrypted end-to-end, meaning only you and your
                  conversation partner can decrypt and read the messages.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-none text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-purple-300" />
                Getting Started
              </CardTitle>
              <CardDescription className="text-indigo-200">
                Simple steps to begin communicating securely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-300" />
                  Find Online Users
                </h3>
                <p className="text-sm text-indigo-200">
                  When you enter the chat, you'll see a list of all online users.
                  Select anyone from the list to initiate a connection.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-300" />
                  Establish Connection
                </h3>
                <p className="text-sm text-indigo-200">
                  Click on a user to request a connection. Once they accept,
                  you'll see a "Connected" status indicator.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-300" />
                  Start Messaging
                </h3>
                <p className="text-sm text-indigo-200">
                  Type your message and send! All messages are transmitted directly
                  to the recipient with no central server storing your conversation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center">
          <Button 
            onClick={handleStartChatting}
            className="bg-white text-indigo-900 hover:bg-white/90 px-8 py-6 h-auto text-lg font-medium"
            size="lg"
          >
            Start Chatting Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartPage;