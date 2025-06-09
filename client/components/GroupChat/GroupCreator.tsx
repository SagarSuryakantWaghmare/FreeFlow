"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import groupChatService from '@/lib/GroupChatService';
import { useToast } from '@/hooks/use-toast';

interface GroupCreatorProps {
  userId: string;
  onGroupCreated: (groupId: string, inviteLink: string, groupName?: string) => void;
}

export default function GroupCreator({ userId, onGroupCreated }: GroupCreatorProps) {
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Ensure connection before creating group
      if (!groupChatService.isConnected()) {
        await groupChatService.connect();
      }

      const response = await groupChatService.createGroup(groupName.trim(), userId);
      
      toast({
        title: "Success",
        description: `Group "${groupName}" created successfully!`,
      });

      onGroupCreated(response.groupId, response.inviteLink, groupName.trim());
      setGroupName('');
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Create New Group</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="groupName" className="text-sm font-medium">
            Group Name
          </label>
          <Input
            id="groupName"
            type="text"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
            disabled={isCreating}
          />
        </div>
        <Button 
          onClick={handleCreateGroup} 
          disabled={isCreating || !groupName.trim()}
          className="w-full"
        >
          {isCreating ? 'Creating...' : 'Create Group'}
        </Button>
      </CardContent>
    </Card>
  );
}
