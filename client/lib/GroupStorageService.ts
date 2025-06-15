"use client";

interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName?: string;
  content: string;
  timestamp: Date;
  isSelf: boolean;
  isRead?: boolean;
}

interface GroupInfo {
  groupId: string;
  groupName: string;
  isOwner: boolean;
  ownerId: string;
  members: GroupMember[];
  inviteLink?: string;
  joinedAt: Date;
  lastActivity: Date;
}

interface GroupMember {
  userId: string;
  userName: string;
  joinedAt: Date;
  isOwner: boolean;
  status: 'online' | 'offline';
}

interface UnreadGroupCount {
  [groupId: string]: number;
}

class GroupStorageService {
  private readonly GROUP_MESSAGES_PREFIX = 'group_messages_';
  private readonly GROUP_UNREAD_PREFIX = 'group_unread_';
  private readonly GROUP_INFO_PREFIX = 'group_info_';
  private readonly USER_GROUPS_KEY = 'user_groups';
  private readonly MAX_MESSAGES_PER_GROUP = 200;
  
  // Callbacks for real-time updates
  private onNewMessageCallbacks: ((groupId: string, message: GroupMessage) => void)[] = [];
  private onUnreadCountChangeCallbacks: ((groupId: string, count: number) => void)[] = [];
  private onGroupInfoChangeCallbacks: ((groupId: string, info: GroupInfo) => void)[] = [];
  
  private currentUserId: string | null = null;

  /**
   * Initialize with current user ID
   */
  initialize(userId: string): void {
    this.currentUserId = userId;
  }

  /**
   * Save a group message to localStorage
   */
  saveMessage(groupId: string, message: GroupMessage): void {
    const messages = this.getMessages(groupId);
    
    const messageToSave = {
      ...message,
      timestamp: message.timestamp instanceof Date 
        ? message.timestamp 
        : new Date(message.timestamp),
      isRead: message.isSelf // Mark as read if it's from current user
    };
    
    messages.push(messageToSave);
    
    // Trim messages if we exceed our maximum
    if (messages.length > this.MAX_MESSAGES_PER_GROUP) {
      messages.splice(0, messages.length - this.MAX_MESSAGES_PER_GROUP);
    }
    
    this.saveMessages(groupId, messages);
    
    // Update unread count if it's not from current user
    if (!message.isSelf) {
      this.incrementUnreadCount(groupId);
    }
    
    // Update group's last activity
    this.updateGroupLastActivity(groupId);
    
    // Always notify listeners about new message
    this.notifyNewMessage(groupId, messageToSave);
  }

  /**
   * Save a background message (when group window is not open)
   */
  saveBackgroundMessage(groupId: string, message: GroupMessage): void {
    const messageToSave = {
      ...message,
      isRead: false,
      timestamp: message.timestamp instanceof Date 
        ? message.timestamp 
        : new Date(message.timestamp)
    };
    
    this.saveMessage(groupId, messageToSave);
  }

  /**
   * Save multiple messages to localStorage
   */
  private saveMessages(groupId: string, messages: GroupMessage[]): void {
    try {
      const key = this.getGroupMessagesKey(groupId);
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving group messages to localStorage:', error);
    }
  }

  /**
   * Get all messages for a specific group
   */
  getMessages(groupId: string): GroupMessage[] {
    try {
      const key = this.getGroupMessagesKey(groupId);
      const storedMessages = localStorage.getItem(key);
      
      if (!storedMessages) {
        return [];
      }

      return JSON.parse(storedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        isRead: msg.isRead !== undefined ? msg.isRead : true
      }));
    } catch (error) {
      console.error('Error retrieving group messages from localStorage:', error);
      return [];
    }
  }

  /**
   * Mark all messages in a group as read
   */
  markMessagesAsRead(groupId: string): void {
    const messages = this.getMessages(groupId);
    const updatedMessages = messages.map(msg => ({ ...msg, isRead: true }));
    this.saveMessages(groupId, updatedMessages);
    this.setUnreadCount(groupId, 0);
  }

  /**
   * Get unread message count for a group
   */
  getUnreadCount(groupId: string): number {
    try {
      const key = this.getGroupUnreadKey(groupId);
      const stored = localStorage.getItem(key);
      return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      console.error('Error getting group unread count:', error);
      return 0;
    }
  }

  /**
   * Set unread count for a group
   */
  setUnreadCount(groupId: string, count: number): void {
    try {
      const key = this.getGroupUnreadKey(groupId);
      localStorage.setItem(key, count.toString());
      this.notifyUnreadCountChange(groupId, count);
    } catch (error) {
      console.error('Error setting group unread count:', error);
    }
  }

  /**
   * Increment unread count for a group
   */
  incrementUnreadCount(groupId: string): void {
    const currentCount = this.getUnreadCount(groupId);
    this.setUnreadCount(groupId, currentCount + 1);
  }

  /**
   * Save group information
   */
  saveGroupInfo(groupInfo: GroupInfo): void {
    try {
      const key = this.getGroupInfoKey(groupInfo.groupId);
      localStorage.setItem(key, JSON.stringify({
        ...groupInfo,
        joinedAt: groupInfo.joinedAt.toISOString(),
        lastActivity: groupInfo.lastActivity.toISOString(),
        members: groupInfo.members.map(member => ({
          ...member,
          joinedAt: member.joinedAt.toISOString()
        }))
      }));
      
      // Add to user's group list
      this.addToUserGroups(groupInfo.groupId);
      
      this.notifyGroupInfoChange(groupInfo.groupId, groupInfo);
    } catch (error) {
      console.error('Error saving group info:', error);
    }
  }

  /**
   * Get group information
   */
  getGroupInfo(groupId: string): GroupInfo | null {
    try {
      const key = this.getGroupInfoKey(groupId);
      const stored = localStorage.getItem(key);
      
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        joinedAt: new Date(parsed.joinedAt),
        lastActivity: new Date(parsed.lastActivity),
        members: parsed.members.map((member: any) => ({
          ...member,
          joinedAt: new Date(member.joinedAt)
        }))
      };
    } catch (error) {
      console.error('Error getting group info:', error);
      return null;
    }
  }

  /**
   * Get all groups the user is part of
   */
  getUserGroups(): GroupInfo[] {
    try {
      const groupIds = this.getUserGroupIds();
      return groupIds
        .map(groupId => this.getGroupInfo(groupId))
        .filter(info => info !== null) as GroupInfo[];
    } catch (error) {
      console.error('Error getting user groups:', error);
      return [];
    }
  }

  /**
   * Get all groups with unread messages
   */
  getGroupsWithUnreadMessages(): { groupId: string; count: number; groupName: string }[] {
    const groups = this.getUserGroups();
    const groupsWithUnread: { groupId: string; count: number; groupName: string }[] = [];
    
    groups.forEach(group => {
      const count = this.getUnreadCount(group.groupId);
      if (count > 0) {
        groupsWithUnread.push({ 
          groupId: group.groupId, 
          count, 
          groupName: group.groupName 
        });
      }
    });
    
    return groupsWithUnread;
  }

  /**
   * Get total unread message count across all groups
   */
  getTotalUnreadCount(): number {
    return this.getGroupsWithUnreadMessages()
      .reduce((total, group) => total + group.count, 0);
  }

  /**
   * Update group member list
   */
  updateGroupMembers(groupId: string, members: GroupMember[]): void {
    const groupInfo = this.getGroupInfo(groupId);
    if (groupInfo) {
      groupInfo.members = members;
      groupInfo.lastActivity = new Date();
      this.saveGroupInfo(groupInfo);
    }
  }

  /**
   * Update group ownership
   */
  updateGroupOwner(groupId: string, newOwnerId: string): void {
    const groupInfo = this.getGroupInfo(groupId);
    if (groupInfo) {
      groupInfo.ownerId = newOwnerId;
      groupInfo.isOwner = newOwnerId === this.currentUserId;
      groupInfo.members = groupInfo.members.map(member => ({
        ...member,
        isOwner: member.userId === newOwnerId
      }));
      groupInfo.lastActivity = new Date();
      this.saveGroupInfo(groupInfo);
    }
  }

  /**
   * Remove group from user's groups (when leaving)
   */
  removeGroup(groupId: string): void {
    try {
      // Remove group info
      const infoKey = this.getGroupInfoKey(groupId);
      localStorage.removeItem(infoKey);
      
      // Remove messages
      const messagesKey = this.getGroupMessagesKey(groupId);
      localStorage.removeItem(messagesKey);
      
      // Remove unread count
      const unreadKey = this.getGroupUnreadKey(groupId);
      localStorage.removeItem(unreadKey);
      
      // Remove from user's group list
      this.removeFromUserGroups(groupId);
      
      this.notifyUnreadCountChange(groupId, 0);
    } catch (error) {
      console.error('Error removing group:', error);
    }
  }

  /**
   * Clear all group data (on logout)
   */
  clearAllGroups(): void {
    try {
      const groupIds = this.getUserGroupIds();
      groupIds.forEach(groupId => {
        this.removeGroup(groupId);
      });
      
      // Clear user groups list
      if (this.currentUserId) {
        localStorage.removeItem(this.getUserGroupsKey());
      }
    } catch (error) {
      console.error('Error clearing all groups:', error);
    }
  }

  /**
   * Update group's last activity timestamp
   */
  private updateGroupLastActivity(groupId: string): void {
    const groupInfo = this.getGroupInfo(groupId);
    if (groupInfo) {
      groupInfo.lastActivity = new Date();
      this.saveGroupInfo(groupInfo);
    }
  }

  /**
   * Add group to user's group list
   */
  private addToUserGroups(groupId: string): void {
    const groupIds = this.getUserGroupIds();
    if (!groupIds.includes(groupId)) {
      groupIds.push(groupId);
      localStorage.setItem(this.getUserGroupsKey(), JSON.stringify(groupIds));
    }
  }

  /**
   * Remove group from user's group list
   */
  private removeFromUserGroups(groupId: string): void {
    const groupIds = this.getUserGroupIds();
    const updatedIds = groupIds.filter(id => id !== groupId);
    localStorage.setItem(this.getUserGroupsKey(), JSON.stringify(updatedIds));
  }

  /**
   * Get user's group IDs
   */
  private getUserGroupIds(): string[] {
    try {
      const stored = localStorage.getItem(this.getUserGroupsKey());
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting user group IDs:', error);
      return [];
    }
  }

  /**
   * Storage key generators
   */
  private getGroupMessagesKey(groupId: string): string {
    return `${this.GROUP_MESSAGES_PREFIX}${this.currentUserId}_${groupId}`;
  }

  private getGroupUnreadKey(groupId: string): string {
    return `${this.GROUP_UNREAD_PREFIX}${this.currentUserId}_${groupId}`;
  }

  private getGroupInfoKey(groupId: string): string {
    return `${this.GROUP_INFO_PREFIX}${this.currentUserId}_${groupId}`;
  }

  private getUserGroupsKey(): string {
    return `${this.USER_GROUPS_KEY}_${this.currentUserId}`;
  }

  /**
   * Event handling
   */
  onNewMessage(callback: (groupId: string, message: GroupMessage) => void): void {
    this.onNewMessageCallbacks.push(callback);
  }

  onUnreadCountChange(callback: (groupId: string, count: number) => void): void {
    this.onUnreadCountChangeCallbacks.push(callback);
  }

  onGroupInfoChange(callback: (groupId: string, info: GroupInfo) => void): void {
    this.onGroupInfoChangeCallbacks.push(callback);
  }

  removeNewMessageCallback(callback: (groupId: string, message: GroupMessage) => void): void {
    const index = this.onNewMessageCallbacks.indexOf(callback);
    if (index > -1) {
      this.onNewMessageCallbacks.splice(index, 1);
    }
  }

  removeUnreadCountChangeCallback(callback: (groupId: string, count: number) => void): void {
    const index = this.onUnreadCountChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.onUnreadCountChangeCallbacks.splice(index, 1);
    }
  }

  removeGroupInfoChangeCallback(callback: (groupId: string, info: GroupInfo) => void): void {
    const index = this.onGroupInfoChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.onGroupInfoChangeCallbacks.splice(index, 1);
    }
  }

  private notifyNewMessage(groupId: string, message: GroupMessage): void {
    this.onNewMessageCallbacks.forEach(callback => {
      try {
        callback(groupId, message);
      } catch (error) {
        console.error('Error in new group message callback:', error);
      }
    });
  }

  private notifyUnreadCountChange(groupId: string, count: number): void {
    this.onUnreadCountChangeCallbacks.forEach(callback => {
      try {
        callback(groupId, count);
      } catch (error) {
        console.error('Error in group unread count change callback:', error);
      }
    });
  }

  private notifyGroupInfoChange(groupId: string, info: GroupInfo): void {
    this.onGroupInfoChangeCallbacks.forEach(callback => {
      try {
        callback(groupId, info);
      } catch (error) {
        console.error('Error in group info change callback:', error);
      }
    });
  }
}

// Create singleton instance
const groupStorageService = new GroupStorageService();
export default groupStorageService;
export type { GroupMessage, GroupInfo, GroupMember };
