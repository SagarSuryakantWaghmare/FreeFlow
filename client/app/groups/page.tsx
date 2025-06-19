"use client";

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import GroupList from '@/components/GroupChat/GroupList';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function GroupsPage() {
  const { user, isLoaded } = useUser();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Groups</h1>
          <p className="text-muted-foreground">
            Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}!
            Manage your group conversations here.
          </p>
        </div>

        <GroupList />
      </div>
    </div>
  );
}
