"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import groupChatService from '@/lib/GroupChatService';
import { useToast } from '@/hooks/use-toast';

interface GroupJoinerProps {
  userId: string;
  onGroupJoined: (groupId: string, groupName: string) => void;
}

export default function GroupJoiner({ userId, onGroupJoined }: GroupJoinerProps) {
  const [inviteToken, setInviteToken] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const handleJoinGroup = async () => {
    if (!inviteToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invite token",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      // Ensure connection before joining group
      if (!groupChatService.isConnected()) {
        await groupChatService.connect();
      }

      const response = await groupChatService.joinGroup(inviteToken.trim(), userId);
      
      toast({
        title: "Success",
        description: `Joined group "${response.groupName}" successfully!`,
      });

      onGroupJoined(response.groupId, response.groupName);
      setInviteToken('');
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join group. Please check the invite token.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Join Group</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="inviteToken" className="text-sm font-medium">
            Invite Token
          </label>
          <Input
            id="inviteToken"
            type="text"
            placeholder="Enter invite token"
            value={inviteToken}
            onChange={(e) => setInviteToken(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinGroup()}
            disabled={isJoining}
          />
        </div>
        <Button 
          onClick={handleJoinGroup} 
          disabled={isJoining || !inviteToken.trim()}
          className="w-full"
        >
          {isJoining ? 'Joining...' : 'Join Group'}
        </Button>
      </CardContent>
    </Card>
  );
}
