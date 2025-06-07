"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { redirect } from 'next/navigation';
import GroupChatMain from '@/components/GroupChat/GroupChatMain';
import GroupList from '@/components/GroupChat/GroupList';
import { useWebRTC } from '@/providers/webrtc-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

function GroupChatContent() {
  const { user, isLoaded } = useUser();
  const { groups, activeGroup, setActiveGroup } = useWebRTC();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    if (isLoaded && user) {
      // Use email as userId to match the API specification
      setUserId(user.emailAddresses[0]?.emailAddress || user.id);
    }
  }, [user, isLoaded]);

  // Set active group based on URL parameter
  useEffect(() => {
    if (groupId && groups.length > 0) {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        setActiveGroup(group);
      }
    }
  }, [groupId, groups, setActiveGroup]);

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

  // If no group is selected, show the group list
  if (!groupId || !activeGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Group Chat</h1>
            <p className="text-muted-foreground">
              Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}! 
              Select a group to start chatting.
            </p>
          </div>
          
          <GroupList />
        </div>
      </div>
    );
  }

  // Show the selected group chat
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto py-8">
        <div className="mb-4 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setActiveGroup(null);
              window.history.pushState({}, '', '/group-chat');
            }}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Groups
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{activeGroup.name}</h1>
            {activeGroup.description && (
              <p className="text-muted-foreground text-sm">{activeGroup.description}</p>
            )}
          </div>
        </div>
        <GroupChatMain userId={userId} groupId={activeGroup.id} />
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
