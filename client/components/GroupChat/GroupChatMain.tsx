"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, LogIn, Sparkles, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-4 sm:p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[hsl(263.4,70%,50.4%)] opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[hsl(263.4,70%,50.4%)] opacity-5 blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Enhanced header */}
        <div className="text-center mb-12 sm:mb-16 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 border border-[hsl(263.4,70%,50.4%)] border-opacity-20 text-[hsl(263.4,70%,50.4%)] text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Group Communication
          </div>
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-slate-900 dark:text-white"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            GROUP CHAT HUB
          </h1>
          <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Create or join group conversations. Connect with multiple people in real-time with our secure messaging platform.
          </p>
        </div>

        {/* Enhanced connection status */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className={`px-6 py-3 rounded-2xl border backdrop-blur-sm transition-all duration-200 ${
            isConnected 
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300" 
              : "bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="font-medium">
                {isConnected ? 'Connected ✨ Ready for group chat' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>        {currentView === 'main' && (
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Create Group Card */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-zinc-700/50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl hover:scale-105">
              <CardHeader className="pb-6 text-center">
                <div className="relative mx-auto mb-6">
                  <div className="absolute inset-0 bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 rounded-full blur-xl w-20 h-20 animate-pulse"></div>
                  <div className="relative w-16 h-16 bg-[hsl(263.4,70%,50.4%)] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">Create New Group</CardTitle>
                <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Start a new group conversation and invite others to join
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setCurrentView('create')}
                  disabled={!isConnected}
                  className="w-full h-12 sm:h-14 bg-[hsl(263.4,70%,50.4%)] hover:bg-[hsl(263.4,70%,45%)] disabled:bg-gray-300 dark:disabled:bg-zinc-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Group
                </Button>
              </CardContent>
            </Card>

            {/* Join Group Card */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-zinc-700/50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl hover:scale-105">
              <CardHeader className="pb-6 text-center">
                <div className="relative mx-auto mb-6">
                  <div className="absolute inset-0 bg-green-500 bg-opacity-10 rounded-full blur-xl w-20 h-20 animate-pulse"></div>
                  <div className="relative w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <LogIn className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">Join Existing Group</CardTitle>
                <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Enter an invite token to join an existing group conversation
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setCurrentView('join')}
                  disabled={!isConnected}
                  className="w-full h-12 sm:h-14 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-zinc-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Join Group
                </Button>
              </CardContent>
            </Card>
          </div>
        )}        {currentView === 'create' && (
          <div className="max-w-2xl mx-auto">
            <Card className="border border-gray-200/50 dark:border-zinc-700/50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-2xl rounded-2xl">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[hsl(263.4,70%,50.4%)] rounded-xl flex items-center justify-center shadow-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Create New Group</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-zinc-400">Set up your group conversation</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-6">
                  <Button 
                    onClick={() => setCurrentView('main')}
                    variant="ghost"
                    className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Main
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
            <Card className="border border-gray-200/50 dark:border-zinc-700/50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-2xl rounded-2xl">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                    <LogIn className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Join Group</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-zinc-400">Enter your invitation details</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-6">
                  <Button 
                    onClick={() => setCurrentView('main')}
                    variant="ghost"
                    className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Main
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
