"use client";

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import GroupList from '@/components/GroupChat/GroupList';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { GroupInfo } from '@/lib/GroupStorageService';

export default function GroupsPage() {
  const { user, isLoaded } = useUser();
  const [selectedGroup, setSelectedGroup] = useState<GroupInfo | null>(null);

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

  // Handlers for GroupList
  const handleSelectGroup = (groupInfo: GroupInfo) => setSelectedGroup(groupInfo);
  const handleCreateGroup = () => {/* open create group modal or logic */ };
  const handleJoinGroup = () => {/* open join group modal or logic */ };

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-background to-muted/20 overflow-hidden fixed inset-0">
      {/* Sidebar: Group List */}
      <aside className="w-full max-w-xs md:w-80 h-full border-r border-border bg-white dark:bg-zinc-900 flex flex-col overflow-y-auto">
        <GroupList
          userId={user.id}
          onSelectGroup={handleSelectGroup}
          onCreateGroup={handleCreateGroup}
          onJoinGroup={handleJoinGroup}
          selectedGroupId={selectedGroup?.groupId}
        />
      </aside>
      {/* Main Chat Area */}
      <main className="flex-1 h-full flex flex-col overflow-hidden">
        {/* If a group is selected, show chat, else show placeholder */}
        {selectedGroup ? (
          <div className="flex-1 flex flex-col h-full overflow-y-auto">
            {/* Place your GroupChat component here, passing selectedGroup */}
            {/* <GroupChat group={selectedGroup} userId={user.id} /> */}
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-lg">Group chat UI goes here</div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-lg h-full">Select a group to start chatting</div>
        )}
      </main>
    </div>
  );
}