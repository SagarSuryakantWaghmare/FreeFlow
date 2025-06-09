"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { redirect } from 'next/navigation';
import GroupChatMain from '@/components/GroupChat/GroupChatMain';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect('/sign-in');
  }

  // Show the group chat interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Group Chat</h1>
          <p className="text-muted-foreground">
            Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}!
            Create or join a group to start chatting.
          </p>
        </div>

        <GroupChatMain userId={userId} groupId={groupId || undefined} />
      </div>
    </div>
  );
}

export default function GroupChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <GroupChatContent />
    </Suspense>
  );
}
