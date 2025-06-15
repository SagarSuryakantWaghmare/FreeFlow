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
  };
  return (
    <div className="space-y-6">
      {/* Back button */}
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
      )}
      
      {/* Decorative header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[hsl(263.4,70%,50.4%)] to-[hsl(263.4,70%,60.4%)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-white" />
        </div>
        <p className="text-sm text-muted-foreground">
          Give your group a memorable name that reflects its purpose
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="groupName" className="text-sm font-medium text-foreground">
            Group Name *
          </label>
          <Input
            id="groupName"
            type="text"
            placeholder="Enter group name (e.g., Team Project, Study Group)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            disabled={isCreating}
            className="h-12 bg-background/50 border-2 border-[hsl(263.4,70%,50.4%)/0.2] focus:border-[hsl(263.4,70%,50.4%)] transition-colors"
            onKeyPress={(e) => e.key === 'Enter' && !isCreating && handleCreateGroup()}
          />
        </div>

        <Button
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || isCreating}
          className="w-full h-12 bg-gradient-to-r from-[hsl(263.4,70%,50.4%)] to-[hsl(263.4,70%,60.4%)] hover:from-[hsl(263.4,70%,45.4%)] hover:to-[hsl(263.4,70%,55.4%)] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
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

      {/* Info card */}
      <Card className="bg-[hsl(263.4,70%,50.4%)/0.05] border-[hsl(263.4,70%,50.4%)/0.2">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[hsl(263.4,70%,50.4%)/0.1] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">What happens next?</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• You'll get an invite link to share with others</li>
                <li>• Members can join using the invite token</li>
                <li>• Start chatting instantly with real-time messaging</li>
                <li>• All conversations are secure and private</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
