"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Crown, 
  MessageCircle, 
  Plus, 
  UserPlus, 
  Settings,
  ChevronRight,
  Clock
} from 'lucide-react';
import groupStorageService, { GroupInfo } from '@/lib/GroupStorageService'; // Import GroupInfo from GroupStorageService
import groupChatService from '@/lib/GroupChatService';

interface GroupListProps {
  userId: string;
  onSelectGroup: (groupInfo: GroupInfo) => void;
  onCreateGroup: () => void;
  onJoinGroup: () => void;
  selectedGroupId?: string;
}

export default function GroupList({ 
  userId, 
  onSelectGroup, 
  onCreateGroup, 
  onJoinGroup,
  selectedGroupId 
}: GroupListProps) {
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Load groups and unread counts
  useEffect(() => {
    const loadGroups = () => {
      const userGroups = groupChatService.getUserGroups(); // This can remain as groupChatService might aggregate or have other logic
      setGroups(userGroups);
      
      // Load unread counts for each group
      const counts: Record<string, number> = {};
      userGroups.forEach(group => {
        counts[group.groupId] = groupStorageService.getUnreadCount(group.groupId); // Use groupStorageService
      });
      setUnreadCounts(counts);
    };

    loadGroups();

    // Listen for changes
    const handleUnreadCountChange = (groupId: string, count: number) => {
      setUnreadCounts(prev => ({ ...prev, [groupId]: count }));
    };

    const handleGroupInfoChange = () => {
      loadGroups();
    };

    groupStorageService.onUnreadCountChange(handleUnreadCountChange); // Use groupStorageService
    groupStorageService.onGroupInfoChange(handleGroupInfoChange); // Use groupStorageService

    return () => {
      groupStorageService.removeUnreadCountChangeCallback(handleUnreadCountChange); // Use groupStorageService
      groupStorageService.removeGroupInfoChangeCallback(handleGroupInfoChange); // Use groupStorageService
    };
  }, []);

  const formatLastActivity = (lastActivity: Date) => {
    const now = new Date();
    const diff = now.getTime() - lastActivity.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Active now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return lastActivity.toLocaleDateString();
  };

  const handleGroupClick = (group: GroupInfo) => {
    onSelectGroup(group);
  };
  return (
    <div className="h-full flex flex-col bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm">
      {/* Enhanced Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-zinc-700/50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 border border-[hsl(263.4,70%,50.4%)] border-opacity-20">
              <Users className="h-5 w-5 text-[hsl(263.4,70%,50.4%)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Group Chats
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {groups.length} active groups
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 border border-[hsl(263.4,70%,50.4%)] border-opacity-20">
            <span className="text-xs font-semibold text-[hsl(263.4,70%,50.4%)]">{groups.length}</span>
          </div>
        </div>
        
        {/* Enhanced action buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onCreateGroup}
            size="sm"
            className="flex-1 h-11 bg-[hsl(263.4,70%,50.4%)] hover:bg-[hsl(263.4,70%,45%)] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
          
          <Button
            onClick={onJoinGroup}
            size="sm"
            className="flex-1 h-11 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Join
          </Button>
        </div>
      </div>      {/* Enhanced Groups list */}
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4">
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gray-400 bg-opacity-10 rounded-full blur-xl w-20 h-20 mx-auto animate-pulse"></div>
                <div className="relative w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Users className="h-8 w-8 text-gray-400 dark:text-zinc-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No group chats yet</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 max-w-xs mx-auto leading-relaxed">
                Create your first group or join an existing one to start chatting
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={onCreateGroup}
                  size="sm"
                  className="w-full bg-[hsl(263.4,70%,50.4%)] hover:bg-[hsl(263.4,70%,45%)] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first group
                </Button>
                <Button 
                  onClick={onJoinGroup}
                  size="sm"
                  className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join existing group
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <Card
                  key={group.groupId}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg backdrop-blur-sm rounded-2xl ${
                    selectedGroupId === group.groupId
                      ? 'ring-2 ring-[hsl(263.4,70%,50.4%)] bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 border-[hsl(263.4,70%,50.4%)] border-opacity-30'
                      : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50 border-gray-200/50 dark:border-zinc-700/50 hover:scale-[1.02]'
                  }`}
                  onClick={() => handleGroupClick(group)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <div className="w-12 h-12 bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 rounded-xl flex items-center justify-center border border-[hsl(263.4,70%,50.4%)] border-opacity-20">
                            <Users className="h-6 w-6 text-[hsl(263.4,70%,50.4%)]" />
                          </div>
                          {unreadCounts[group.groupId] > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {unreadCounts[group.groupId] > 9 ? '9+' : unreadCounts[group.groupId]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate mb-1">
                            {group.groupName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-zinc-400">
                              {group.members?.length || 0} members
                            </span>
                            <span className="text-xs text-slate-500 dark:text-zinc-400">•</span>
                            <span className="text-xs text-slate-500 dark:text-zinc-400">
                              {formatLastActivity(group.lastActivity)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {unreadCounts[group.groupId] > 0 && (
                        <div className="ml-2">
                          <div className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-semibold shadow-sm">
                            {unreadCounts[group.groupId]}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
                    

      {/* Footer with total unread count */}
      {groups.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Total groups: {groups.length}</span>
            {Object.values(unreadCounts).reduce((sum, count) => sum + count, 0) > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>
                  {Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)} unread
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
