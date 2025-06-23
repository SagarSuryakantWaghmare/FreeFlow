"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import groupChatService from '@/lib/GroupChatService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Users, ArrowLeft } from 'lucide-react';

interface GroupCreatorProps {
  userId: string;
  onGroupCreated: (groupId: string, inviteLink: string, groupName?: string) => void;
  onBack?: () => void;
}

export default function GroupCreator({ userId, onGroupCreated, onBack }: GroupCreatorProps) {
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Group Name Required",
        description: "Please enter a name for your group",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await groupChatService.createGroup(groupName, userId);
      
      toast({
        title: "Group Created Successfully! ✨",
        description: `"${groupName}" is ready for members`,
      });

      onGroupCreated(response.groupId, response.inviteLink, groupName);
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
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
          <div className="absolute inset-0 bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 rounded-full blur-xl w-20 h-20 mx-auto animate-pulse"></div>
          <div className="relative w-16 h-16 bg-[hsl(263.4,70%,50.4%)] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">Create New Group</h3>
        <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
          Give your group a memorable name that reflects its purpose
        </p>
      </div>

      {/* Enhanced form */}
      <div className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="groupName" className="text-sm font-semibold text-slate-900 dark:text-white">
            Group Name *
          </label>
          <Input
            id="groupName"
            type="text"
            placeholder="Enter group name (e.g., Team Project, Study Group)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            disabled={isCreating}
            className="h-12 sm:h-14 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 focus:border-[hsl(263.4,70%,50.4%)] focus:ring-[hsl(263.4,70%,50.4%)] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-zinc-400 transition-all duration-200"
            onKeyPress={(e) => e.key === 'Enter' && !isCreating && handleCreateGroup()}
          />
        </div>

        <Button
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || isCreating}
          className="w-full h-12 sm:h-14 bg-[hsl(263.4,70%,50.4%)] hover:bg-[hsl(263.4,70%,45%)] disabled:bg-gray-300 dark:disabled:bg-zinc-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Creating Group...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Create Group
            </>
          )}
        </Button>
      </div>

      {/* Enhanced info card */}
      <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50 rounded-2xl shadow-sm">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-[hsl(263.4,70%,50.4%)]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm sm:text-base mb-2 text-slate-900 dark:text-white">What happens next?</h4>
              <ul className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 space-y-1.5 leading-relaxed">
                <li className="flex items-start">
                  <span className="text-[hsl(263.4,70%,50.4%)] mr-2">•</span>
                  You'll get an invite link to share with others
                </li>
                <li className="flex items-start">
                  <span className="text-[hsl(263.4,70%,50.4%)] mr-2">•</span>
                  Members can join using the invite token
                </li>
                <li className="flex items-start">
                  <span className="text-[hsl(263.4,70%,50.4%)] mr-2">•</span>
                  Start chatting instantly with real-time messaging
                </li>
                <li className="flex items-start">
                  <span className="text-[hsl(263.4,70%,50.4%)] mr-2">•</span>
                  All conversations are secure and private
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
