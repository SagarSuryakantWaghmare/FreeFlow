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
import { GroupInfo } from '@/lib/GroupStorageService';
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
      const userGroups = groupChatService.getUserGroups();
      setGroups(userGroups);
      
      // Load unread counts for each group
      const counts: Record<string, number> = {};
      userGroups.forEach(group => {
        counts[group.groupId] = groupChatService.getGroupUnreadCount(group.groupId);
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

    groupChatService.onUnreadCountChange(handleUnreadCountChange);
    groupChatService.onGroupInfoChange(handleGroupInfoChange);

    return () => {
      groupChatService.removeUnreadCountChangeCallback(handleUnreadCountChange);
      groupChatService.removeGroupInfoChangeCallback(handleGroupInfoChange);
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
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Group Chats
          </h2>
          <Badge variant="secondary" className="text-xs">
            {groups.length} groups
          </Badge>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onCreateGroup}
            size="sm"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create
          </Button>
          
          <Button
            onClick={onJoinGroup}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Join
          </Button>
        </div>
      </div>

      {/* Groups list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
                No group chats yet
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={onCreateGroup}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first group
                </Button>
                <br />
                <Button 
                  onClick={onJoinGroup}
                  size="sm"
                  variant="outline"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join existing group
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {groups.map((group) => (
                <Card
                  key={group.groupId}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedGroupId === group.groupId
                      ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/30'
                      : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                  onClick={() => handleGroupClick(group)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900 dark:text-white truncate">
                              {group.groupName}
                            </h3>
                            {group.isOwner && (
                              <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                            </p>
                            <Separator orientation="vertical" className="h-3" />
                            <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatLastActivity(group.lastActivity)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {unreadCounts[group.groupId] > 0 && (
                          <Badge 
                            variant="default" 
                            className="bg-red-500 text-white text-xs px-2 py-1 min-w-[20px] h-5 flex items-center justify-center"
                          >
                            {unreadCounts[group.groupId] > 99 ? '99+' : unreadCounts[group.groupId]}
                          </Badge>
                        )}
                        
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
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
