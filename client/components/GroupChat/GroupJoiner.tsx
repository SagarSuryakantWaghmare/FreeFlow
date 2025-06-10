"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import groupChatService from '@/lib/GroupChatService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, Key, Users } from 'lucide-react';

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
        title: "Invite Token Required",
        description: "Please enter a valid invite token",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);

    try {
      const response = await groupChatService.joinGroup(inviteToken, userId);

      toast({
        title: "Successfully Joined! 🎉",
        description: `Welcome to "${response.groupName}"`,
      });

      onGroupJoined(response.groupId, response.groupName);
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Failed to Join",
        description: "Invalid invite token or group no longer exists",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Decorative header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="h-8 w-8 text-white" />
        </div>
        <p className="text-sm text-muted-foreground">
          Enter the invite token you received to join the conversation
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="inviteToken" className="text-sm font-medium text-foreground">
            Invite Token *
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="inviteToken"
              type="text"
              placeholder="Enter your invite token"
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
              disabled={isJoining}
              className="h-12 pl-10 bg-background/50 border-2 border-emerald-500/20 focus:border-emerald-500 transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && !isJoining && handleJoinGroup()}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Ask the group creator for this unique token
          </p>
        </div>

        <Button
          onClick={handleJoinGroup}
          disabled={!inviteToken.trim() || isJoining}
          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          {isJoining ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Joining Group...
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5 mr-2" />
              Join Group
            </>
          )}
        </Button>
      </div>

      {/* Info card */}
      <Card className="bg-emerald-500/5 border-emerald-500/20">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Joining a Group</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Get an invite token from the group creator</li>
                <li>• Token is unique and expires if unused</li>
                <li>• You'll see all previous messages once joined</li>
                <li>• Start participating in the conversation immediately</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
