"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Plus, 
  LogIn, 
  X, 
  Crown,
  MessageCircle,
  Settings,
  Bell,
  BellOff
} from 'lucide-react';
import GroupCreator from './GroupCreator';
import GroupJoiner from './GroupJoiner';
import GroupChatRoom from './GroupChatRoom';
import GroupList from './GroupList';
import GroupJoinRequestDialog from './GroupJoinRequestDialog';
import GroupNotificationPanel from './GroupNotificationPanel';
import groupChatService from '@/lib/GroupChatService';
import groupStorageService, { GroupInfo, GroupMessage } from '@/lib/GroupStorageService';
import groupManagerService from '@/lib/GroupManagerService';
import groupNotificationService from '@/lib/GroupNotificationService';

interface MultiGroupChatInterfaceProps {
  userId?: string;
}

interface ActiveGroup extends GroupInfo {
  isActive: boolean;
}

export default function MultiGroupChatInterface({ userId: propUserId }: MultiGroupChatInterfaceProps) {
  const [userId] = useState(() => propUserId || `user-${Math.random().toString(36).substr(2, 9)}`);
  const [isConnected, setIsConnected] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'create' | 'join'>('main');
  
  // Multi-group state
  const [activeGroups, setActiveGroups] = useState<ActiveGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  
  // Join request dialog
  const [showJoinRequestDialog, setShowJoinRequestDialog] = useState(false);
  const [pendingJoinRequests, setPendingJoinRequests] = useState<any[]>([]);
  
  // Notification panel
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  const { toast } = useToast();

  // Initialize service and load existing groups
  useEffect(() => {
    const initializeService = async () => {
      try {
        // Initialize services
        groupChatService.initialize(userId);
        
        // Connect to WebSocket
        if (!groupChatService.isConnected()) {
          await groupChatService.connect();
        }
        setIsConnected(true);

        // Load existing groups
        const userGroups = groupChatService.getUserGroups();
        const groupsWithStatus = userGroups.map(group => ({
          ...group,
          isActive: false
        }));
        setActiveGroups(groupsWithStatus);

        // Subscribe to all groups for background message handling
        groupChatService.subscribeToAllUserGroups();

        // Load unread counts
        updateUnreadCounts();

        // Load notification count
        setNotificationCount(groupNotificationService.getUnreadCount());

        toast({
          title: "Connected ✨",
          description: "Ready for group chat",
        });
      } catch (error) {
        console.error('Failed to initialize:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat service",
          variant: "destructive",
        });
      }
    };

    initializeService();
  }, [userId, toast]);

  // Setup real-time listeners
  useEffect(() => {
    const handleNewMessage = (groupId: string, message: GroupMessage) => {
      updateUnreadCounts();
      
      // Show notification if group is not currently active
      const activeGroup = activeGroups.find(g => g.groupId === groupId && g.isActive);
      if (!activeGroup) {
        toast({
          title: `New message in ${getGroupName(groupId)}`,
          description: `${message.senderName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
        });
      }
    };

    const handleUnreadCountChange = (groupId: string, count: number) => {
      setUnreadCounts(prev => ({ ...prev, [groupId]: count }));
      updateTotalUnreadCount();
    };

    const handleGroupInfoChange = (groupId: string, info: GroupInfo) => {
      setActiveGroups(prev => prev.map(group => 
        group.groupId === groupId 
          ? { ...info, isActive: group.isActive }
          : group
      ));
    };

    const handleJoinRequest = (request: any) => {
      setPendingJoinRequests(prev => [...prev, request]);
      setShowJoinRequestDialog(true);
      toast({
        title: "New Join Request",
        description: `${request.userName} wants to join ${request.groupName}`,
      });
    };

    const handleNotificationCountChange = (count: number) => {
      setNotificationCount(count);
    };    // Register listeners
    groupChatService.onNewMessage(handleNewMessage);
    groupChatService.onUnreadCountChange(handleUnreadCountChange);
    groupChatService.onGroupInfoChange(handleGroupInfoChange);
    groupManagerService.onJoinRequest(handleJoinRequest);
    groupNotificationService.onUnreadCountChange(handleNotificationCountChange);

    return () => {
      // Cleanup listeners
      groupChatService.removeNewMessageCallback(handleNewMessage);
      groupChatService.removeUnreadCountChangeCallback(handleUnreadCountChange);
      groupChatService.removeGroupInfoChangeCallback(handleGroupInfoChange);
      groupManagerService.removeJoinRequestCallback(handleJoinRequest);
      groupNotificationService.removeUnreadCountCallback(handleNotificationCountChange);
    };
  }, [activeGroups, toast]);

  const updateUnreadCounts = () => {
    const counts: Record<string, number> = {};
    activeGroups.forEach(group => {
      counts[group.groupId] = groupChatService.getGroupUnreadCount(group.groupId);
    });
    setUnreadCounts(counts);
    updateTotalUnreadCount();
  };

  const updateTotalUnreadCount = () => {
    const total = groupChatService.getTotalUnreadCount();
    setTotalUnreadCount(total);
  };

  const getGroupName = (groupId: string): string => {
    const group = activeGroups.find(g => g.groupId === groupId);
    return group?.groupName || 'Unknown Group';
  };

  const handleSelectGroup = (groupInfo: GroupInfo) => {
    // Add to active groups if not already there
    const existingGroup = activeGroups.find(g => g.groupId === groupInfo.groupId);
    if (!existingGroup) {
      setActiveGroups(prev => [...prev, { ...groupInfo, isActive: false }]);
    }
    
    // Set as selected and mark as active
    setSelectedGroupId(groupInfo.groupId);
    handleGroupTabClick(groupInfo.groupId);
    setCurrentView('main');
  };

  const handleGroupTabClick = (groupId: string) => {
    // Update active status
    setActiveGroups(prev => prev.map(group => ({
      ...group,
      isActive: group.groupId === groupId
    })));
    
    // Mark group as active in service
    groupChatService.setGroupActive(groupId);
    
    // Set as selected
    setSelectedGroupId(groupId);
  };

  const handleCloseGroup = (groupId: string) => {
    // Mark as inactive in service
    groupChatService.setGroupInactive(groupId);
    
    // Remove from active groups
    setActiveGroups(prev => prev.filter(group => group.groupId !== groupId));
    
    // Update selected group if this was selected
    if (selectedGroupId === groupId) {
      const remainingGroups = activeGroups.filter(group => group.groupId !== groupId);
      setSelectedGroupId(remainingGroups.length > 0 ? remainingGroups[0].groupId : null);
    }
  };

  const handleGroupCreated = (groupId: string, inviteLink: string, groupName?: string) => {
    const groupInfo: GroupInfo = {
      groupId,
      groupName: groupName || `Group ${groupId}`,
      isOwner: true,
      ownerId: userId,
      members: [{
        userId,
        userName: userId,
        joinedAt: new Date(),
        isOwner: true,
        status: 'online'
      }],
      inviteLink,
      joinedAt: new Date(),
      lastActivity: new Date()
    };
    
    handleSelectGroup(groupInfo);
    setCurrentView('main');
    toast({
      title: "Group Created! ✨",
      description: `Welcome to "${groupInfo.groupName}"`,
    });
  };

  const handleGroupJoined = (groupId: string, groupName: string) => {
    const groupInfo: GroupInfo = {
      groupId,
      groupName,
      isOwner: false,
      ownerId: '',
      members: [{
        userId,
        userName: userId,
        joinedAt: new Date(),
        isOwner: false,
        status: 'online'
      }],
      joinedAt: new Date(),
      lastActivity: new Date()
    };
    
    handleSelectGroup(groupInfo);
    setCurrentView('main');
    toast({
      title: "Joined Successfully! 🎉",
      description: `You've joined "${groupName}"`,
    });
  };

  const handleLeaveGroup = (groupId: string) => {
    groupChatService.leaveGroup(groupId, userId);
    handleCloseGroup(groupId);
    toast({
      title: "Left Group",
      description: "You've left the group",
    });
  };

  // Render view based on current state
  if (currentView === 'create') {
    return (
      <GroupCreator
        userId={userId}
        onGroupCreated={handleGroupCreated}
        onBack={() => setCurrentView('main')}
      />
    );
  }

  if (currentView === 'join') {
    return (
      <GroupJoiner
        userId={userId}
        onGroupJoined={handleGroupJoined}
        onBack={() => setCurrentView('main')}
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

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[hsl(263.4,70%,50.4%)] to-[hsl(263.4,70%,70.4%)] bg-clip-text text-transparent mb-2">
            Group Chat Hub
          </h1>
          <p className="text-muted-foreground mb-4">
            Connect with multiple groups simultaneously
          </p>
          <div className="flex items-center justify-center gap-4">
            {totalUnreadCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                {totalUnreadCount} unread messages
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotificationPanel(true)}
              className="relative"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {notificationCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Group List */}
          <div className="lg:col-span-1">
            <Card className="border-[hsl(263.4,70%,50.4%)/20 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Groups
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentView('create')}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentView('join')}
                      className="h-8 w-8 p-0"
                    >
                      <LogIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <GroupList
                  userId={userId}
                  onSelectGroup={handleSelectGroup}
                  onCreateGroup={() => setCurrentView('create')}
                  onJoinGroup={() => setCurrentView('join')}
                  selectedGroupId={selectedGroupId || undefined}
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            {activeGroups.length === 0 ? (
              <Card className="border-[hsl(263.4,70%,50.4%)/20 bg-card/50 backdrop-blur-sm h-[600px]">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto" />
                    <h3 className="text-xl font-semibold">No Active Groups</h3>
                    <p className="text-muted-foreground">
                      Create a group or join an existing one to start chatting
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => setCurrentView('create')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Group
                      </Button>
                      <Button variant="outline" onClick={() => setCurrentView('join')}>
                        <LogIn className="h-4 w-4 mr-2" />
                        Join Group
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Tabs value={selectedGroupId || undefined} onValueChange={handleGroupTabClick}>
                <TabsList className="grid w-full mb-4" style={{ gridTemplateColumns: `repeat(${activeGroups.length}, minmax(0, 1fr))` }}>
                  {activeGroups.map((group) => (
                    <div key={group.groupId} className="relative">
                      <TabsTrigger
                        value={group.groupId}
                        className="flex items-center gap-2 relative pr-8"
                      >
                        {group.isOwner && <Crown className="h-3 w-3 text-yellow-500" />}
                        <span className="truncate max-w-[100px]">{group.groupName}</span>
                        {unreadCounts[group.groupId] > 0 && (
                          <Badge variant="destructive" className="h-4 text-xs px-1">
                            {unreadCounts[group.groupId]}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseGroup(group.groupId);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </TabsList>

                {activeGroups.map((group) => (
                  <TabsContent key={group.groupId} value={group.groupId} className="mt-0">
                    <GroupChatRoom
                      groupId={group.groupId}
                      groupName={group.groupName}
                      userId={userId}
                      inviteLink={group.inviteLink}
                      onLeaveGroup={() => handleLeaveGroup(group.groupId)}
                      isMultiChat={true}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </div>
      </div>

      {/* Join Request Dialog */}
      {showJoinRequestDialog && (
        <GroupJoinRequestDialog
          requests={pendingJoinRequests}
          onApprove={(requestId) => {
            groupManagerService.approveJoinRequest(requestId);
            setPendingJoinRequests(prev => prev.filter(r => r.requestId !== requestId));
            if (pendingJoinRequests.length <= 1) {
              setShowJoinRequestDialog(false);
            }
          }}
          onReject={(requestId) => {
            groupManagerService.rejectJoinRequest(requestId);
            setPendingJoinRequests(prev => prev.filter(r => r.requestId !== requestId));
            if (pendingJoinRequests.length <= 1) {
              setShowJoinRequestDialog(false);
            }
          }}
          onClose={() => setShowJoinRequestDialog(false)}
        />
      )}

      {/* Notification Panel */}
      <GroupNotificationPanel
        isOpen={showNotificationPanel}
        onClose={() => setShowNotificationPanel(false)}
      />
    </div>
  );
}
