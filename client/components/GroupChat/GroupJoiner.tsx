"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import groupChatService from '@/lib/GroupChatService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, Key, Users, ArrowLeft } from 'lucide-react';

interface GroupJoinerProps {
  userId: string;
  onGroupJoined: (groupId: string, groupName: string) => void;
  onBack?: () => void;
}

export default function GroupJoiner({ userId, onGroupJoined, onBack }: GroupJoinerProps) {
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
  };  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Back button */}
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
      )}
      
      {/* Enhanced header */}
      <div className="text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-green-500 bg-opacity-10 rounded-full blur-xl w-20 h-20 mx-auto animate-pulse"></div>
          <div className="relative w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <LogIn className="h-8 w-8 text-white" />
          </div>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">Join Group</h3>
        <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
          Enter the invite token you received to join the conversation
        </p>
      </div>

      {/* Enhanced form */}
      <div className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="inviteToken" className="text-sm font-semibold text-slate-900 dark:text-white">
            Invite Token *
          </label>
          <div className="relative">
            <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-zinc-400" />
            <Input
              id="inviteToken"
              type="text"
              placeholder="Enter your invite token"
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
              disabled={isJoining}
              className="h-12 sm:h-14 pl-12 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:border-green-500 focus:ring-green-500 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-zinc-400 transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && !isJoining && handleJoinGroup()}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-500">
            Ask the group creator for this unique token
          </p>
        </div>

        <Button
          onClick={handleJoinGroup}
          disabled={!inviteToken.trim() || isJoining}
          className="w-full h-12 sm:h-14 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-zinc-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
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

      {/* Enhanced info card */}
      <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50 rounded-2xl shadow-sm">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-green-500 bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm sm:text-base mb-2 text-slate-900 dark:text-white">Joining a Group</h4>
              <ul className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 space-y-1.5 leading-relaxed">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Get an invite token from the group creator
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Token is unique and expires if unused
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  You'll see all previous messages once joined
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Start participating in the conversation immediately
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
