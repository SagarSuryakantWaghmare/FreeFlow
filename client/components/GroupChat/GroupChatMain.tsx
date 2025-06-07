"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GroupCreator from './GroupCreator';
import GroupJoiner from './GroupJoiner';
import GroupChatRoom from './GroupChatRoom';
import groupChatService from '@/lib/GroupChatService';
import { useWebRTC } from '@/providers/webrtc-provider';
import { useToast } from '@/hooks/use-toast';
import { Users, MessageCircle, Plus, UserPlus } from 'lucide-react';

interface GroupChatMainProps {
  userId: string;
  groupId?: string;
}

interface ActiveGroup {
  groupId: string;
  groupName: string;
  inviteLink?: string;
}

export default function GroupChatMain({ userId, groupId }: GroupChatMainProps) {
  const [activeGroup, setActiveGroup] = useState<ActiveGroup | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { groups } = useWebRTC();
  const { toast } = useToast();

  useEffect(() => {
    // If groupId is provided, automatically join that group
    if (groupId && groups.length > 0) {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        setActiveGroup({
          groupId: group.id,
          groupName: group.name,
          inviteLink: undefined
        });
      }
    }
  }, [groupId, groups]);

  useEffect(() => {
    // Initialize connection when component mounts
    const initializeConnection = async () => {
      if (!groupChatService.isConnected()) {
        setIsConnecting(true);
        try {
          await groupChatService.connect();
          console.log('Group chat service connected');
        } catch (error) {
          console.error('Failed to connect to group chat service:', error);
          toast({
            title: "Connection Error",
            description: "Failed to connect to chat service",
            variant: "destructive",
          });
        } finally {
          setIsConnecting(false);
        }
      }
    };

    initializeConnection();

    // Cleanup on unmount
    return () => {
      if (activeGroup) {
        groupChatService.unsubscribeFromGroup(activeGroup.groupId);
      }
    };
  }, [toast, activeGroup]);

  const handleGroupCreated = (groupId: string, inviteLink: string) => {
    setActiveGroup({
      groupId,
      groupName: `Group ${groupId}`, // You might want to store the actual name
      inviteLink,
    });
  };

  const handleGroupJoined = (groupId: string, groupName: string) => {
    setActiveGroup({
      groupId,
      groupName,
    });
  };

  const handleLeaveGroup = () => {
    setActiveGroup(null);
  };

  if (activeGroup) {
    return (
      <div className="container mx-auto p-4">
        <GroupChatRoom
          groupId={activeGroup.groupId}
          groupName={activeGroup.groupName}
          userId={userId}
          inviteLink={activeGroup.inviteLink}
          onLeaveGroup={handleLeaveGroup}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <MessageCircle className="h-8 w-8" />
              <CardTitle className="text-2xl">Group Chat</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Create a new group or join an existing one to start chatting
            </p>
            {isConnecting && (
              <div className="text-sm text-muted-foreground">
                Connecting to chat service...
              </div>
            )}
          </CardHeader>
        </Card>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Group</span>
            </TabsTrigger>
            <TabsTrigger value="join" className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Join Group</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <GroupCreator
              userId={userId}
              onGroupCreated={handleGroupCreated}
            />
          </TabsContent>

          <TabsContent value="join" className="mt-6">
            <GroupJoiner
              userId={userId}
              onGroupJoined={handleGroupJoined}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">How it works</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Create a group to get an invite token</p>
                <p>• Share the invite token with others</p>
                <p>• Join groups using invite tokens</p>
                <p>• Chat in real-time with group members</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
