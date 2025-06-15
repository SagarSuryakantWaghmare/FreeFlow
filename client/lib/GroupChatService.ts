"use client";

import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import groupStorageService, { GroupMessage as StorageGroupMessage, GroupInfo, GroupMember } from './GroupStorageService';
import groupManagerService from './GroupManagerService';
import groupConnectionManagerService from './GroupConnectionManagerService';
import groupNotificationService from './GroupNotificationService';

export interface GroupMessage {
  groupId: string;
  senderId: string;
  senderName?: string;
  content: string;
  timestamp?: Date;
}

export interface Group {
  groupId: string;
  groupName: string;
  inviteLink?: string;
  isOwner?: boolean;
  memberCount?: number;
}

export interface CreateGroupResponse {
  groupId: string;
  inviteLink: string;
}

export interface JoinGroupResponse {
  groupId: string;
  groupName: string;
}

export interface GroupMemberInfo {
  userId: string;
  userName: string;
  isOwner: boolean;
  joinedAt: string;
  status: 'online' | 'offline';
}

class GroupChatService {
  private stompClient: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private messageListeners: Map<string, ((message: GroupMessage) => void)[]> = new Map();
  private activeGroups: Set<string> = new Set(); // Track currently active/open groups
  private baseUrl = 'http://localhost:8080'; 
  private connectionState = false;
  private currentUserId: string | null = null;

  constructor() {
    // Initialize when needed, not immediately
  }

  /**
   * Initialize with current user ID
   */
  initialize(userId: string): void {
    this.currentUserId = userId;
    groupStorageService.initialize(userId);
    groupManagerService.initialize(userId);
    
    // Sync connection manager with existing groups
    const userGroups = groupStorageService.getUserGroups();
    groupConnectionManagerService.syncWithGroupStorage(userGroups);
  }

  private initializeStompClient(): void {
    if (this.stompClient) {
      return; // Already initialized
    }

    const socket = new SockJS(`${this.baseUrl}/ws/group`);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = () => {
      console.log('Connected to STOMP server for group chat');
      this.connectionState = true;
      
      // Update connection status for all groups
      const userGroups = this.getUserGroups();
      userGroups.forEach(group => {
        groupConnectionManagerService.updateConnectionStatus(group.groupId, 'connected', {
          groupName: group.groupName,
          memberCount: group.members.length,
          isOwner: group.isOwner
        });
      });
    };

    this.stompClient.onDisconnect = () => {
      console.log('Disconnected from STOMP server');
      this.connectionState = false;
      
      // Update connection status for all groups
      const userGroups = this.getUserGroups();
      userGroups.forEach(group => {
        groupConnectionManagerService.updateConnectionStatus(group.groupId, 'disconnected');
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      this.connectionState = false;
    };
  }  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.initializeStompClient();
      
      if (!this.stompClient) {
        reject(new Error('STOMP client not initialized'));
        return;
      }

      if (this.stompClient.connected) {
        this.connectionState = true;
        resolve();
        return;
      }

      this.stompClient.onConnect = () => {
        console.log('Connected to STOMP server for group chat');
        this.connectionState = true;
        resolve();
      };

      this.stompClient.onStompError = (frame) => {
        console.error('STOMP connection error:', frame);
        this.connectionState = false;
        reject(new Error(`Failed to connect to STOMP server: ${frame.headers['message'] || 'Unknown error'}`));
      };

      try {
        this.stompClient.activate();
      } catch (error) {
        console.error('Error activating STOMP client:', error);
        this.connectionState = false;
        reject(error);
      }
    });
  }  disconnect(): void {
    if (this.stompClient) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.stompClient.deactivate();
      this.connectionState = false;
    }
  }
  async createGroup(groupName: string, userId: string): Promise<CreateGroupResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/groups/create?name=${encodeURIComponent(groupName)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to create group: ${response.statusText}`);
      }

      const result: CreateGroupResponse = await response.json();
      
      // Store group info locally with owner status
      const groupInfo: GroupInfo = {
        groupId: result.groupId,
        groupName,
        isOwner: true,
        ownerId: userId,
        members: [{
          userId,
          userName: this.getUserNameFromId(userId),
          joinedAt: new Date(),
          isOwner: true,
          status: 'online'
        }],
        inviteLink: result.inviteLink,
        joinedAt: new Date(),
        lastActivity: new Date()
      };
      
      groupStorageService.saveGroupInfo(groupInfo);
      
      // Update connection manager
      groupConnectionManagerService.updateConnectionStatus(result.groupId, 'connected', {
        groupName,
        memberCount: 1,
        isOwner: true
      });
      
      // Create notification for group creation
      groupNotificationService.notifyGroupCreated(result.groupId, groupName);
      
      return result;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async joinGroup(token: string, userId: string): Promise<JoinGroupResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/groups/join/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to join group: ${response.statusText}`);
      }

      const result: JoinGroupResponse = await response.json();
      
      // Store group info locally
      const groupInfo: GroupInfo = {
        groupId: result.groupId,
        groupName: result.groupName,
        isOwner: false,
        ownerId: '', // Would be provided by backend in real implementation
        members: [{
          userId,
          userName: this.getUserNameFromId(userId),
          joinedAt: new Date(),
          isOwner: false,
          status: 'online'
        }],
        joinedAt: new Date(),
        lastActivity: new Date()
      };
      
      groupStorageService.saveGroupInfo(groupInfo);
      
      return result;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  /**
   * Request to join a group (with approval system)
   */
  async requestJoinGroup(token: string, userId: string, userName: string): Promise<{ success: boolean; message: string }> {
    try {
      // This would send a join request to the group owner
      // For demonstration, we'll simulate the approval process
      
      // In real implementation, this would:
      // 1. Validate the token
      // 2. Get group info
      // 3. Send join request to group owner
      // 4. Wait for approval
      
      return {
        success: true,
        message: 'Join request sent to group owner. Awaiting approval.'
      };
    } catch (error) {
      console.error('Error requesting to join group:', error);
      return {
        success: false,
        message: 'Failed to send join request.'
      };
    }
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      const groupInfo = groupStorageService.getGroupInfo(groupId);
      
      // Handle ownership transfer if current user is owner
      if (groupInfo?.isOwner && groupInfo.members.length > 1) {
        const newOwnerId = groupManagerService.handleOwnerLeaving(groupId, groupInfo.members);
        if (newOwnerId) {
          // In real implementation, this would notify the backend
          console.log(`Ownership of group ${groupId} transferred to ${newOwnerId}`);
        }
      }
      
      const response = await fetch(`${this.baseUrl}/api/groups/leave/${groupId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to leave group: ${response.statusText}`);
      }

      // Remove group from local storage
      groupStorageService.removeGroup(groupId);
      
      // Unsubscribe from group messages
      this.unsubscribeFromGroup(groupId);
      
      // Remove from active groups
      this.activeGroups.delete(groupId);
      
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }
  subscribeToGroup(groupId: string, onMessage: (message: GroupMessage) => void): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('STOMP client not connected');
      return;
    }

    const destination = `/topic/group/${groupId}`;
    
    // Unsubscribe if already subscribed
    if (this.subscriptions.has(groupId)) {
      this.subscriptions.get(groupId)?.unsubscribe();
    }

    const subscription = this.stompClient.subscribe(destination, (message) => {
      try {
        const receivedMessage = JSON.parse(message.body);
        console.log('Received raw message:', receivedMessage);
        
        // Convert backend message format to frontend format
        const groupMessage: GroupMessage = {
          groupId: String(receivedMessage.groupId), // Convert number to string for frontend
          senderId: receivedMessage.senderId,
          senderName: receivedMessage.senderName || receivedMessage.senderId,
          content: receivedMessage.content,
          timestamp: receivedMessage.timestamp ? new Date(receivedMessage.timestamp) : new Date()
        };
          console.log('Processed message:', groupMessage);
        
        // Save message using enhanced method
        this.saveMessageWithUserInfo(groupMessage.groupId, groupMessage, groupMessage.senderId === this.currentUserId);
        
        // Create notification for background messages
        if (!this.activeGroups.has(groupId)) {
          const messagePreview = groupMessage.content.length > 50 
            ? groupMessage.content.substring(0, 50) + '...'
            : groupMessage.content;
          groupNotificationService.notifyNewMessage(
            groupId,
            this.getGroupInfo(groupId)?.groupName || `Group ${groupId}`,
            this.getUserDisplayName(groupMessage.senderId),
            messagePreview
          );
        }
        
        onMessage(groupMessage);
      } catch (error) {
        console.error('Error parsing group message:', error);
      }
    });

    this.subscriptions.set(groupId, subscription);
    console.log(`Subscribed to group ${groupId}`);
  }

  unsubscribeFromGroup(groupId: string): void {
    const subscription = this.subscriptions.get(groupId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(groupId);
      console.log(`Unsubscribed from group ${groupId}`);
    }
    
    // Remove from active groups
    this.activeGroups.delete(groupId);
  }

  /**
   * Mark a group as active (user is currently viewing it)
   */
  setGroupActive(groupId: string): void {
    this.activeGroups.add(groupId);
    // Mark all messages as read when group becomes active
    groupStorageService.markMessagesAsRead(groupId);
  }

  /**
   * Mark a group as inactive (user switched away)
   */
  setGroupInactive(groupId: string): void {
    this.activeGroups.delete(groupId);
  }

  /**
   * Get all user's groups
   */
  getUserGroups(): GroupInfo[] {
    return groupStorageService.getUserGroups();
  }

  /**
   * Get unread count for a specific group
   */
  getGroupUnreadCount(groupId: string): number {
    return groupStorageService.getUnreadCount(groupId);
  }

  /**
   * Get total unread count across all groups
   */
  getTotalUnreadCount(): number {
    return groupStorageService.getTotalUnreadCount();
  }

  /**
   * Get group messages from storage
   */
  getGroupMessages(groupId: string): StorageGroupMessage[] {
    return groupStorageService.getMessages(groupId);
  }

  /**
   * Get group information
   */
  getGroupInfo(groupId: string): GroupInfo | null {
    return groupStorageService.getGroupInfo(groupId);
  }

  /**
   * Subscribe to all user's groups for background message handling
   */
  subscribeToAllUserGroups(): void {
    const userGroups = this.getUserGroups();
    userGroups.forEach(group => {
      if (!this.subscriptions.has(group.groupId)) {
        this.subscribeToGroup(group.groupId, () => {
          // Background message handling is done in subscribeToGroup
        });
      }
    });
  }

  /**
   * Helper method to get user name from ID
   */
  private getUserNameFromId(userId: string): string {
    // Extract name from email or use the userId
    if (userId.includes('@')) {
      return userId.split('@')[0];
    }
    return userId;
  }  sendMessage(message: GroupMessage): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('STOMP client not connected');
      return;
    }

    // Convert frontend message format to backend format
    const backendMessage = {
      groupId: parseInt(message.groupId), // Convert string to number for backend
      senderId: message.senderId,
      content: message.content
    };

    console.log('Sending message:', backendMessage);
    
    // Save message locally before sending
    this.saveMessageWithUserInfo(message.groupId, message, true);
    
    // Send to backend
    this.stompClient.publish({
      destination: '/app/chat/send',
      body: JSON.stringify(backendMessage),
    });
  }

  /**
   * Enhanced message saving with better user info
   */
  private saveMessageWithUserInfo(groupId: string, message: GroupMessage, isSelf: boolean): void {
    const storageMessage: StorageGroupMessage = {
      id: `${groupId}_${Date.now()}_${Math.random()}`,
      groupId: groupId,
      senderId: message.senderId,
      senderName: this.getUserDisplayName(message.senderId),
      content: message.content,
      timestamp: message.timestamp || new Date(),
      isSelf: isSelf,
      isRead: isSelf || this.activeGroups.has(groupId)
    };
    
    groupStorageService.saveMessage(groupId, storageMessage);
  }

  /**
   * Get user display name (enhanced)
   */
  private getUserDisplayName(userId: string): string {
    // Try to get real username from localStorage
    const username = localStorage.getItem('username');
    if (userId === this.currentUserId && username) {
      return username;
    }
    
    // Check if it's an email and extract the name part
    if (userId.includes('@')) {
      const emailPart = userId.split('@')[0];
      // Convert dot notation to space and capitalize
      return emailPart.split('.').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ');
    }
    
    // Fallback to userId
    return userId;
  }

  /**
   * Clear all group data (for logout)
   */
  clearAllData(): void {
    // Unsubscribe from all groups
    this.subscriptions.forEach((subscription, groupId) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.activeGroups.clear();
    
    // Clear storage
    groupStorageService.clearAllGroups();
    groupManagerService.clearAll();
  }

  /**
   * Event listener management
   */
  onNewMessage(callback: (groupId: string, message: StorageGroupMessage) => void): void {
    groupStorageService.onNewMessage(callback);
  }

  onUnreadCountChange(callback: (groupId: string, count: number) => void): void {
    groupStorageService.onUnreadCountChange(callback);
  }

  onGroupInfoChange(callback: (groupId: string, info: GroupInfo) => void): void {
    groupStorageService.onGroupInfoChange(callback);
  }

  removeNewMessageCallback(callback: (groupId: string, message: StorageGroupMessage) => void): void {
    groupStorageService.removeNewMessageCallback(callback);
  }

  removeUnreadCountChangeCallback(callback: (groupId: string, count: number) => void): void {
    groupStorageService.removeUnreadCountChangeCallback(callback);
  }

  removeGroupInfoChangeCallback(callback: (groupId: string, info: GroupInfo) => void): void {
    groupStorageService.removeGroupInfoChangeCallback(callback);
  }

  isConnected(): boolean {
    return this.connectionState && (this.stompClient?.connected || false);
  }

  /**
   * Get group connection status
   */
  getGroupConnectionStatus(groupId: string): string {
    return groupConnectionManagerService.getConnectionStatus(groupId);
  }

  /**
   * Check if connected to a specific group
   */
  isConnectedToGroup(groupId: string): boolean {
    return groupConnectionManagerService.isConnectedToGroup(groupId);
  }

  /**
   * Get all connected groups
   */
  getConnectedGroups(): any[] {
    return groupConnectionManagerService.getConnectedGroups();
  }

  /**
   * Auto-reconnect to previously connected groups
   */
  async autoReconnectGroups(): Promise<void> {
    const groupsToReconnect = groupConnectionManagerService.getGroupsForAutoReconnect();
    
    for (const groupConnection of groupsToReconnect) {
      try {
        groupConnectionManagerService.updateConnectionStatus(groupConnection.groupId, 'connecting');
        // Re-subscribe to the group
        this.subscribeToGroup(groupConnection.groupId, () => {
          // Background message handling
        });
        console.log(`Auto-reconnected to group: ${groupConnection.groupName}`);
      } catch (error) {
        console.error(`Failed to auto-reconnect to group ${groupConnection.groupId}:`, error);
        groupConnectionManagerService.updateConnectionStatus(groupConnection.groupId, 'error');
      }
    }
  }

  /**
   * Enhanced connection management
   */
  onGroupConnectionStatusChange(callback: (groupId: string, status: string) => void): void {
    groupConnectionManagerService.onConnectionStatusChange(callback);
  }

  removeGroupConnectionStatusChangeCallback(callback: (groupId: string, status: string) => void): void {
    groupConnectionManagerService.removeConnectionStatusChangeCallback(callback);
  }
}

// Create singleton instance
const groupChatService = new GroupChatService();
export default groupChatService;
