"use client";

interface GroupNotification {
  id: string;
  type: 'message' | 'join_request' | 'member_joined' | 'member_left' | 'ownership_transfer' | 'group_created' | 'group_updated';
  groupId: string;
  groupName: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  data?: any; // Additional data specific to notification type
}

class GroupNotificationService {
  private readonly STORAGE_KEY = 'group_notifications';
  private readonly MAX_NOTIFICATIONS = 100;
  
  private notifications: GroupNotification[] = [];
  private notificationCallbacks: ((notification: GroupNotification) => void)[] = [];
  private unreadCountCallbacks: ((count: number) => void)[] = [];

  constructor() {
    this.loadNotifications();
  }

  /**
   * Load notifications from localStorage
   */
  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.notifications = data.map((notif: any) => ({
          ...notif,
          timestamp: new Date(notif.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading group notifications:', error);
    }
  }

  /**
   * Save notifications to localStorage
   */
  private saveNotifications(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving group notifications:', error);
    }
  }

  /**
   * Create a new notification
   */
  createNotification(
    type: GroupNotification['type'],
    groupId: string,
    groupName: string,
    title: string,
    message: string,
    data?: any
  ): void {
    const notification: GroupNotification = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      groupId,
      groupName,
      title,
      message,
      timestamp: new Date(),
      isRead: false,
      data
    };

    this.notifications.unshift(notification);

    // Trim notifications if we exceed max
    if (this.notifications.length > this.MAX_NOTIFICATIONS) {
      this.notifications = this.notifications.slice(0, this.MAX_NOTIFICATIONS);
    }

    this.saveNotifications();
    this.notifyCallbacks(notification);
    this.notifyUnreadCountChange();
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.saveNotifications();
      this.notifyUnreadCountChange();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    let hasChanges = false;
    this.notifications.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.saveNotifications();
      this.notifyUnreadCountChange();
    }
  }

  /**
   * Mark all notifications for a specific group as read
   */
  markGroupNotificationsAsRead(groupId: string): void {
    let hasChanges = false;
    this.notifications.forEach(notification => {
      if (notification.groupId === groupId && !notification.isRead) {
        notification.isRead = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.saveNotifications();
      this.notifyUnreadCountChange();
    }
  }

  /**
   * Get all notifications
   */
  getAllNotifications(): GroupNotification[] {
    return this.notifications;
  }

  /**
   * Get notifications for a specific group
   */
  getGroupNotifications(groupId: string): GroupNotification[] {
    return this.notifications.filter(n => n.groupId === groupId);
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): GroupNotification[] {
    return this.notifications.filter(n => !n.isRead);
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  /**
   * Get unread count for a specific group
   */
  getGroupUnreadCount(groupId: string): number {
    return this.notifications.filter(n => n.groupId === groupId && !n.isRead).length;
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): void {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.saveNotifications();
      this.notifyUnreadCountChange();
    }
  }

  /**
   * Delete all notifications for a group
   */
  deleteGroupNotifications(groupId: string): void {
    const initialLength = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.groupId !== groupId);
    
    if (this.notifications.length !== initialLength) {
      this.saveNotifications();
      this.notifyUnreadCountChange();
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
    localStorage.removeItem(this.STORAGE_KEY);
    this.notifyUnreadCountChange();
  }

  /**
   * Convenience methods for creating specific notification types
   */
  notifyNewMessage(groupId: string, groupName: string, senderName: string, messagePreview: string): void {
    this.createNotification(
      'message',
      groupId,
      groupName,
      `New message in ${groupName}`,
      `${senderName}: ${messagePreview}`,
      { senderName, messagePreview }
    );
  }

  notifyJoinRequest(groupId: string, groupName: string, userName: string, userId: string): void {
    this.createNotification(
      'join_request',
      groupId,
      groupName,
      'New Join Request',
      `${userName} wants to join ${groupName}`,
      { userName, userId }
    );
  }

  notifyMemberJoined(groupId: string, groupName: string, userName: string): void {
    this.createNotification(
      'member_joined',
      groupId,
      groupName,
      'Member Joined',
      `${userName} joined ${groupName}`,
      { userName }
    );
  }

  notifyMemberLeft(groupId: string, groupName: string, userName: string): void {
    this.createNotification(
      'member_left',
      groupId,
      groupName,
      'Member Left',
      `${userName} left ${groupName}`,
      { userName }
    );
  }

  notifyOwnershipTransfer(groupId: string, groupName: string, newOwnerName: string): void {
    this.createNotification(
      'ownership_transfer',
      groupId,
      groupName,
      'Ownership Transferred',
      `${newOwnerName} is now the owner of ${groupName}`,
      { newOwnerName }
    );
  }

  notifyGroupCreated(groupId: string, groupName: string): void {
    this.createNotification(
      'group_created',
      groupId,
      groupName,
      'Group Created',
      `Successfully created ${groupName}`,
      {}
    );
  }

  /**
   * Register callback for new notifications
   */
  onNewNotification(callback: (notification: GroupNotification) => void): void {
    this.notificationCallbacks.push(callback);
  }

  /**
   * Register callback for unread count changes
   */
  onUnreadCountChange(callback: (count: number) => void): void {
    this.unreadCountCallbacks.push(callback);
  }

  /**
   * Remove notification callback
   */
  removeNotificationCallback(callback: (notification: GroupNotification) => void): void {
    const index = this.notificationCallbacks.indexOf(callback);
    if (index > -1) {
      this.notificationCallbacks.splice(index, 1);
    }
  }

  /**
   * Remove unread count callback
   */
  removeUnreadCountCallback(callback: (count: number) => void): void {
    const index = this.unreadCountCallbacks.indexOf(callback);
    if (index > -1) {
      this.unreadCountCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify all callbacks about new notification
   */
  private notifyCallbacks(notification: GroupNotification): void {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  /**
   * Notify all callbacks about unread count change
   */
  private notifyUnreadCountChange(): void {
    const count = this.getUnreadCount();
    this.unreadCountCallbacks.forEach(callback => {
      try {
        callback(count);
      } catch (error) {
        console.error('Error in unread count callback:', error);
      }
    });
  }
}

// Create singleton instance
const groupNotificationService = new GroupNotificationService();
export default groupNotificationService;
export type { GroupNotification };
