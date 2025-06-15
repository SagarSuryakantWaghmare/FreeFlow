"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { redirect } from 'next/navigation';
import GroupChatMain from '@/components/GroupChat/GroupChatMain';
import MultiGroupChatInterface from '@/components/GroupChat/MultiGroupChatInterface';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MessageCircle, Sparkles } from 'lucide-react';

function GroupChatContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    if (isLoaded && user) {
      // Use email as userId to match the API specification
      setUserId(user.emailAddresses[0]?.emailAddress || user.id);
    }
  }, [user, isLoaded]);

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-[hsl(263.4,70%,50.4%)/0.05] flex items-center justify-center p-4">
        {/* Background decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[hsl(263.4,70%,50.4%)/0.1] rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[hsl(263.4,70%,50.4%)/0.1] rounded-full blur-3xl" />
        </div>
        
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-2 border-[hsl(263.4,70%,50.4%)/0.1 shadow-2xl relative z-10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-[hsl(263.4,70%,50.4%)] to-[hsl(263.4,70%,60.4%)] rounded-full flex items-center justify-center mb-6">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Loading FreeFlow
            </h3>
            <p className="text-muted-foreground text-center">Setting up your group chat experience...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect('/sign-in');
    return null; // This won't be reached but TypeScript needs it
  }
  // Show the enhanced multi-group chat interface
  return <MultiGroupChatInterface userId={userId} />;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[hsl(263.4,70%,50.4%)/0.05] flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[hsl(263.4,70%,50.4%)/0.1] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[hsl(263.4,70%,50.4%)/0.1] rounded-full blur-3xl" />
      </div>
      
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-2 border-[hsl(263.4,70%,50.4%)/0.1 shadow-2xl relative z-10">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-[hsl(263.4,70%,50.4%)] to-[hsl(263.4,70%,60.4%)] rounded-full flex items-center justify-center mb-6">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Initializing Chat
          </h3>
          <p className="text-muted-foreground text-center">Preparing your group communication...</p>
          <div className="flex items-center space-x-1 mt-4">
            <Sparkles className="h-4 w-4 text-[hsl(263.4,70%,50.4%)] animate-pulse" />
            <span className="text-xs text-[hsl(263.4,70%,50.4%)]">Powered by FreeFlow</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GroupChatPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GroupChatContent />
    </Suspense>
  );
}
