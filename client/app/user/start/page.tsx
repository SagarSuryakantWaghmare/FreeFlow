"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Login = () => {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    
    // In a real app, you'd handle authentication here
    localStorage.setItem('username', username);
    toast.success(`Welcome, ${username}!`);
    router.push('/user/chat');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center gradient-bg p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="border shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-4xl font-bold text-whisper-purple">
              Whisper
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Secure P2P Messaging</p>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    className="h-12 text-lg"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full h-12 text-lg font-medium bg-whisper-purple hover:bg-whisper-purple/90"
              onClick={handleLogin}
            >
              Join Chat
            </Button>
          </CardFooter>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          Your messages are end-to-end encrypted
        </p>
      </div>
    </div>
  );
};

export default Login;