"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellOff, 
  X, 
  MessageCircle, 
  Users, 
  Crown, 
  UserPlus, 
  UserMinus,
  CheckCircle,
  Trash2
} from 'lucide-react';
import groupNotificationService, { GroupNotification } from '@/lib/GroupNotificationService';

interface GroupNotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GroupNotificationPanel({ isOpen, onClose }: GroupNotificationPanelProps) {
  const [notifications, setNotifications] = useState<GroupNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Load notifications when panel opens
      setNotifications(groupNotificationService.getAllNotifications());
      setUnreadCount(groupNotificationService.getUnreadCount());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleNewNotification = (notification: GroupNotification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    const handleUnreadCountChange = (count: number) => {
      setUnreadCount(count);
    };

    groupNotificationService.onNewNotification(handleNewNotification);
    groupNotificationService.onUnreadCountChange(handleUnreadCountChange);

    return () => {
      groupNotificationService.removeNotificationCallback(handleNewNotification);
      groupNotificationService.removeUnreadCountCallback(handleUnreadCountChange);
    };
  }, []);

  const getNotificationIcon = (type: GroupNotification['type']) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'join_request':
        return <UserPlus className="h-4 w-4" />;
      case 'member_joined':
        return <Users className="h-4 w-4" />;
      case 'member_left':
        return <UserMinus className="h-4 w-4" />;
      case 'ownership_transfer':
        return <Crown className="h-4 w-4" />;
      case 'group_created':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: GroupNotification['type']) => {
    switch (type) {
      case 'message':
        return 'text-blue-600';
      case 'join_request':
        return 'text-green-600';
      case 'member_joined':
        return 'text-emerald-600';
      case 'member_left':
        return 'text-orange-600';
      case 'ownership_transfer':
        return 'text-yellow-600';
      case 'group_created':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleMarkAsRead = (notificationId: string) => {
    groupNotificationService.markAsRead(notificationId);
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  const handleMarkAllAsRead = () => {
    groupNotificationService.markAllAsRead();
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const handleDeleteNotification = (notificationId: string) => {
    groupNotificationService.deleteNotification(notificationId);
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const handleClearAll = () => {
    groupNotificationService.clearAll();
    setNotifications([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-zinc-900 border-2 border-purple-200 dark:border-purple-800 shadow-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Group Notifications</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh]">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No notifications
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors ${
                      notification.isRead 
                        ? 'border-gray-200 dark:border-gray-700' 
                        : 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {notification.groupName}
                            </Badge>
                            <div className="flex items-center space-x-2">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-xs h-6 px-2"
                                >
                                  Mark read
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="text-xs h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
