"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, LogIn, Sparkles } from 'lucide-react';
import GroupCreator from './GroupCreator';
import GroupJoiner from './GroupJoiner';
import GroupChatRoom from './GroupChatRoom';
import groupChatService from '@/lib/GroupChatService';

interface GroupChatMainProps {
  userId?: string;
  groupId?: string;
}

interface ActiveGroup {
  groupId: string;
  groupName: string;
  inviteLink?: string;
}

export default function GroupChatMain({ userId: propUserId, groupId }: GroupChatMainProps) {
  const [currentView, setCurrentView] = useState<'main' | 'create' | 'join' | 'chat'>('main');
  const [activeGroup, setActiveGroup] = useState<ActiveGroup | null>(null);
  const [userId] = useState(() => propUserId || `user-${Math.random().toString(36).substr(2, 9)}`);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeService = async () => {
      try {
        if (!groupChatService.isConnected()) {
          await groupChatService.connect();
        }
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat service",
          variant: "destructive",
        });
      }
    };

    initializeService();
  }, [toast]);

  const handleGroupCreated = (groupId: string, inviteLink: string, groupName?: string) => {
    const group: ActiveGroup = {
      groupId,
      groupName: groupName || `Group ${groupId}`,
      inviteLink,
    };
    setActiveGroup(group);
    setCurrentView('chat');
    toast({
      title: "Group Created! ✨",
      description: `Welcome to "${group.groupName}"`,
    });
  };

  const handleGroupJoined = (groupId: string, groupName: string) => {
    const group: ActiveGroup = {
      groupId,
      groupName,
    };
    setActiveGroup(group);
    setCurrentView('chat');
    toast({
      title: "Joined Successfully! 🎉",
      description: `You've joined "${group.groupName}"`,
    });
  };

  const handleLeaveGroup = () => {
    setActiveGroup(null);
    setCurrentView('main');
  };

  if (currentView === 'chat' && activeGroup) {
    return (
      <GroupChatRoom
        groupId={activeGroup.groupId}
        groupName={activeGroup.groupName}
        userId={userId}
        inviteLink={activeGroup.inviteLink}
        onLeaveGroup={handleLeaveGroup}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[hsl(263.4,70%,50.4%)/0.05] p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[hsl(263.4,70%,50.4%)/0.1] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[hsl(263.4,70%,50.4%)/0.1] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-block rounded-full bg-[hsl(263.4,70%,50.4%)/0.1] px-4 py-2 text-sm font-semibold text-[hsl(263.4,70%,50.4%)] mb-6">
            <Sparkles className="inline-block w-4 h-4 mr-2" />
            Group Communication
          </div>
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-[hsl(263.4,70%,50.4%)] bg-clip-text text-transparent"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            GROUP CHAT
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create or join group conversations. Connect with multiple people in real-time with our secure messaging platform.
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center mb-8">
          <Badge 
            variant={isConnected ? "default" : "secondary"} 
            className={`px-4 py-2 text-sm font-medium ${
              isConnected 
                ? "bg-[hsl(263.4,70%,50.4%)] text-primary-foreground border-[hsl(263.4,70%,50.4%)]" 
                : "bg-muted text-muted-foreground"
            }`}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
            {isConnected ? 'Connected' : 'Connecting...'}
          </Badge>
        </div>

        {currentView === 'main' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Create Group Card */}
            <Card className="group hover:shadow-2xl hover:shadow-[hsl(263.4,70%,50.4%)/0.25] transition-all duration-500 border-2 hover:border-[hsl(263.4,70%,50.4%)/0.5] bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(263.4,70%,50.4%)] to-[hsl(263.4,70%,60.4%)] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Create New Group</CardTitle>
                <p className="text-muted-foreground">
                  Start a new group conversation and invite others to join
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setCurrentView('create')}
                  disabled={!isConnected}
                  className="w-full bg-gradient-to-r from-[hsl(263.4,70%,50.4%)] to-[hsl(263.4,70%,60.4%)] hover:from-[hsl(263.4,70%,45.4%)] hover:to-[hsl(263.4,70%,55.4%)] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Group
                </Button>
              </CardContent>
            </Card>

            {/* Join Group Card */}
            <Card className="group hover:shadow-2xl hover:shadow-[hsl(263.4,70%,50.4%)/0.25] transition-all duration-500 border-2 hover:border-[hsl(263.4,70%,50.4%)/0.5] bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <LogIn className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Join Existing Group</CardTitle>
                <p className="text-muted-foreground">
                  Enter an invite token to join an existing group conversation
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setCurrentView('join')}
                  disabled={!isConnected}
                  variant="outline"
                  className="w-full border-2 border-[hsl(263.4,70%,50.4%)/0.5] text-[hsl(263.4,70%,50.4%)] hover:bg-[hsl(263.4,70%,50.4%)] hover:text-white transition-all duration-300"
                  size="lg"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Join Group
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'create' && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-[hsl(263.4,70%,50.4%)/0.2] bg-card/50 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[hsl(263.4,70%,50.4%)] to-[hsl(263.4,70%,60.4%)] rounded-xl flex items-center justify-center">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">Create New Group</CardTitle>
                    <p className="text-muted-foreground">Set up your group conversation</p>
                  </div>
                </div>
              </CardHeader>              <CardContent>
                <div className="mb-4">
                  <Button 
                    onClick={() => setCurrentView('main')}
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ← Back to Main
                  </Button>
                </div>
                <GroupCreator 
                  userId={userId} 
                  onGroupCreated={handleGroupCreated}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'join' && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-emerald-500/20 bg-card/50 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <LogIn className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">Join Group</CardTitle>
                    <p className="text-muted-foreground">Enter your invitation details</p>
                  </div>
                </div>
              </CardHeader>              <CardContent>
                <div className="mb-4">
                  <Button 
                    onClick={() => setCurrentView('main')}
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ← Back to Main
                  </Button>
                </div>
                <GroupJoiner 
                  userId={userId} 
                  onGroupJoined={handleGroupJoined}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
