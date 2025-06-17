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
  private activeGroups: Set<string> = new Set();
  private baseUrl = 'http://localhost:8080';
  private connectionState = false;
  private currentUserId: string | null = null;

  constructor() {
    // Initialization can be deferred or done here if needed
  }

  initialize(userId: string): void {
    this.currentUserId = userId;
    groupStorageService.initialize(userId);
    groupManagerService.initialize(userId);
    const userGroups = groupStorageService.getUserGroups();
    groupConnectionManagerService.syncWithGroupStorage(userGroups);
  }

  // Add public getter for connection state
  public isConnected(): boolean {
    return this.connectionState && this.stompClient?.connected === true;
  }

  private initializeStompClient(): void {
    if (this.stompClient) {
      return;
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
      const userGroups = this.getUserGroups();
      userGroups.forEach(group => {
        groupConnectionManagerService.updateConnectionStatus(group.groupId, 'disconnected');
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      this.connectionState = false;
    };
  }

  async connect(): Promise<void> {
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

      this.stompClient.onConnect = () => { // Re-assign onConnect for this specific promise
        console.log('Connected to STOMP server for group chat (connect method)');
        this.connectionState = true;
        resolve();
      };

      this.stompClient.onStompError = (frame) => { // Re-assign onStompError for this specific promise
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
  }

  disconnect(): void {
    if (this.stompClient) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.stompClient.deactivate();
      this.connectionState = false;
      console.log('STOMP client deactivated');
    }
  }

  async createGroup(groupName: string, userId: string, userName: string): Promise<CreateGroupResponse> {
    if (!this.currentUserId) throw new Error("User not initialized");
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

      const groupInfo: GroupInfo = {
        groupId: result.groupId,
        groupName,
        isOwner: true,
        ownerId: userId,
        members: [{
          userId,
          userName: userName, // Use provided userName
          joinedAt: new Date(),
          isOwner: true,
          status: 'online'
        }],
        inviteLink: result.inviteLink,
        joinedAt: new Date(),
        lastActivity: new Date()
      };

      groupStorageService.saveGroupInfo(groupInfo);
      groupConnectionManagerService.updateConnectionStatus(result.groupId, 'connected', {
        groupName,
        memberCount: 1,
        isOwner: true
      });
      groupNotificationService.notifyGroupCreated(result.groupId, groupName);
      return result;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async joinGroup(token: string, userId: string, userName: string): Promise<JoinGroupResponse> {
    if (!this.currentUserId) throw new Error("User not initialized");
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

      const groupInfo: GroupInfo = {
        groupId: result.groupId,
        groupName: result.groupName,
        isOwner: false,
        ownerId: '', // This should ideally be fetched or provided by backend
        members: [{ // Add the joining user to members list
          userId,
          userName: userName, // Use provided userName
          joinedAt: new Date(),
          isOwner: false,
          status: 'online'
        }],
        joinedAt: new Date(),
        lastActivity: new Date()
      };

      groupStorageService.saveGroupInfo(groupInfo);
      // After joining, it's good practice to fetch the full member list
      this.fetchAndUpdateGroupMembers(result.groupId);

      groupConnectionManagerService.updateConnectionStatus(result.groupId, 'connected', {
        groupName: result.groupName,
        memberCount: groupStorageService.getGroupInfo(result.groupId)?.members.length || 1, // Update with actual count
        isOwner: false
      });
      // groupNotificationService.notifyGroupJoined(result.groupId, result.groupName, userName);
      groupNotificationService.createNotification(
        'member_joined',
        result.groupId,
        result.groupName,
        `${userName} joined the group`,
        `Welcome ${userName}!`
      );


      return result;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  async fetchAndUpdateGroupMembers(groupId: string): Promise<void> {
    try {
      // Placeholder: In a real app, fetch members from backend
      // const response = await fetch(`${this.baseUrl}/api/groups/${groupId}/members`);
      // if (!response.ok) throw new Error('Failed to fetch members');
      // const members: GroupMember[] = await response.json();
      // const groupInfo = groupStorageService.getGroupInfo(groupId);
      // if (groupInfo) {
      //   groupInfo.members = members; // Update with fetched members
      //   groupStorageService.saveGroupInfo(groupInfo);
      //   console.log(`Updated members for group ${groupId}`);
      // }
      console.log(`Simulating fetch/update members for group ${groupId}. In a real app, call backend.`);
      // For now, ensure the current user is in the member list if they are part of the group
      const groupInfo = groupStorageService.getGroupInfo(groupId);
      if (groupInfo && this.currentUserId && !groupInfo.members.find(m => m.userId === this.currentUserId)) {
        // This part is tricky without knowing the current user's name for this group
        // It's better if the backend provides the full member list on join or via this fetch
      }

    } catch (error) {
      console.error(`Error fetching/updating members for group ${groupId}:`, error);
    }
  }

  async requestJoinGroup(token: string, userId: string, userName: string): Promise<{ success: boolean; message: string }> {
    try {
      // Simulate sending request to backend
      console.log(`User ${userName} (${userId}) requested to join group via token ${token}`);
      // In a real app, this would involve backend logic for approval.
      // For now, let's assume it sends a notification or creates a pending request.
      // The group owner would then approve/deny.
      // We can notify the requester that the request has been sent.
      // groupNotificationService.notifyJoinRequestSent(token, userName);
      groupNotificationService.notifyJoinRequest(token, userName, "group_id_placeholder", "group_name_placeholder"); // Placeholder for groupId and groupName if needed by notifyJoinRequest

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
      if (groupInfo?.isOwner && groupInfo.members.length > 1) {
        const newOwnerId = groupManagerService.handleOwnerLeaving(groupId, groupInfo.members);
        if (newOwnerId) {
          console.log(`Ownership of group ${groupId} transferred to ${newOwnerId}`);
          // Notify backend about ownership change
        }
      }

      // const response = await fetch(`${this.baseUrl}/api/groups/leave/${groupId}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', 'X-User-Id': userId },
      // });
      // if (!response.ok) throw new Error(`Failed to leave group: ${response.statusText}`);

      console.log(`User ${userId} leaving group ${groupId} (simulated backend call)`);


      groupStorageService.removeGroup(groupId);
      this.unsubscribeFromGroup(groupId);
      this.activeGroups.delete(groupId);
      // groupConnectionManagerService.removeGroup(groupId); // This method doesn't exist
      // Instead, update its status or handle removal if the service supports it.
      // For now, we can ensure its connection status is marked as disconnected if it was tracked.
      if (groupConnectionManagerService.getConnectionStatus(groupId) !== 'disconnected') {
        groupConnectionManagerService.updateConnectionStatus(groupId, 'disconnected');
      }
      // groupNotificationService.notifyGroupLeft(groupId, groupInfo?.groupName || groupId, this.getUserDisplayName(userId, groupId));
      groupNotificationService.createNotification(
        'member_left',
        groupId,
        groupInfo?.groupName || groupId,
        `${this.getUserDisplayName(userId, groupId)} left the group`,
        `${this.getUserDisplayName(userId, groupId)} has departed.`
      );

    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  subscribeToGroup(groupId: string, onMessage: (message: GroupMessage) => void): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('STOMP client not connected, cannot subscribe to group', groupId);
      // Optionally, queue subscription or attempt to connect
      return;
    }

    const destination = `/topic/group/${groupId}`;
    if (this.subscriptions.has(groupId)) {
      console.log('Already subscribed to group:', groupId);
      // Potentially update listener if different, or just return
      // this.subscriptions.get(groupId)?.unsubscribe(); // If re-subscription with new handler is needed
    }

    const subscription = this.stompClient.subscribe(destination, (message) => {
      try {
        const receivedMessage = JSON.parse(message.body);
        const senderName = receivedMessage.senderName || this.getUserDisplayName(receivedMessage.senderId, groupId);

        const groupMessage: GroupMessage = {
          groupId: String(receivedMessage.groupId),
          senderId: receivedMessage.senderId,
          senderName: senderName,
          content: receivedMessage.content,
          timestamp: receivedMessage.timestamp ? new Date(receivedMessage.timestamp) : new Date()
        };

        this.saveMessageWithUserInfo(groupMessage.groupId, groupMessage, groupMessage.senderId === this.currentUserId);

        if (!this.activeGroups.has(groupId)) {
          const messagePreview = groupMessage.content.length > 50
            ? groupMessage.content.substring(0, 50) + '...'
            : groupMessage.content;
          groupNotificationService.notifyNewMessage(
            groupId,
            this.getGroupInfo(groupId)?.groupName || `Group ${groupId}`,
            senderName, // Use the resolved senderName
            messagePreview
          );
        }
        onMessage(groupMessage);
      } catch (error) {
        console.error('Error parsing group message:', error, message.body);
      }
    });

    this.subscriptions.set(groupId, subscription);
    // Add to messageListeners if specific callbacks per group are needed beyond the main onMessage
    if (!this.messageListeners.has(groupId)) {
      this.messageListeners.set(groupId, []);
    }
    this.messageListeners.get(groupId)?.push(onMessage);

    console.log(`Subscribed to group ${groupId}`);
  }

  unsubscribeFromGroup(groupId: string): void {
    const subscription = this.subscriptions.get(groupId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(groupId);
      console.log(`Unsubscribed from group ${groupId}`);
    }
    this.messageListeners.delete(groupId);
    this.activeGroups.delete(groupId); // Also remove from active if unsubscribing
  }

  setGroupActive(groupId: string): void {
    this.activeGroups.add(groupId);
    groupStorageService.markMessagesAsRead(groupId);
  }

  setGroupInactive(groupId: string): void {
    this.activeGroups.delete(groupId);
  }

  getUserGroups(): GroupInfo[] {
    return groupStorageService.getUserGroups();
  }

  getGroupUnreadCount(groupId: string): number {
    return groupStorageService.getUnreadCount(groupId);
  }

  getTotalUnreadCount(): number {
    return groupStorageService.getTotalUnreadCount();
  }

  getGroupMessages(groupId: string): StorageGroupMessage[] {
    return groupStorageService.getMessages(groupId);
  }

  getGroupInfo(groupId: string): GroupInfo | null {
    return groupStorageService.getGroupInfo(groupId);
  }

  subscribeToAllUserGroups(): void {
    const userGroups = this.getUserGroups();
    userGroups.forEach(group => {
      if (!this.subscriptions.has(group.groupId)) {
        // The onMessage callback for background subscriptions might be minimal
        // or could trigger a generic update mechanism (e.g., update unread counts)
        this.subscribeToGroup(group.groupId, (message) => {
          console.log('Background message received for group:', message.groupId);
          // Potentially update UI elements showing unread counts or notifications
          // This callback is distinct from the one used when a group chat is active
        });
      }
    });
  }

  private getUserDisplayName(userId: string, groupId?: string): string {
    if (this.currentUserId && userId === this.currentUserId) {
      return 'You';
    }

    if (groupId) {
      const groupInfo = groupStorageService.getGroupInfo(groupId);
      if (groupInfo && groupInfo.members) {
        const member = groupInfo.members.find(m => m.userId === userId);
        if (member && member.userName && member.userName.trim() !== '' && member.userName !== userId) {
          return member.userName;
        }
      }
    }

    // Fallback heuristics if not found in group members or no groupId provided
    if (userId.includes('@')) {
      const namePart = userId.split('@')[0];
      if (namePart.length > 0) {
        const parts = namePart.split(/[._-]/);
        return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      }
    }

    if (userId.startsWith('user_')) { // Clerk-like user IDs
      return `User ${userId.substring(5, 13)}`;
    }

    return `User ${userId.substring(0, 8)}...`; // Generic fallback
  }

  sendMessage(message: GroupMessage): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('STOMP client not connected, cannot send message');
      // Optionally, queue message or attempt to connect
      return;
    }

    if (!this.currentUserId) {
      console.error("Cannot send message, current user ID is not set.");
      return;
    }

    // Ensure senderId is current user
    message.senderId = this.currentUserId;

    // Resolve senderName if not already set
    if (!message.senderName) {
      message.senderName = this.getUserDisplayName(message.senderId, message.groupId);
    }

    const backendMessage = {
      groupId: parseInt(message.groupId), // Backend might expect number
      senderId: message.senderId,
      senderName: message.senderName,
      content: message.content,
      timestamp: new Date().toISOString() // Add timestamp if backend expects it
    };

    this.saveMessageWithUserInfo(message.groupId, message, true); // Save locally immediately

    this.stompClient.publish({
      destination: '/app/chat/send', // Ensure this matches backend STOMP mapping
      body: JSON.stringify(backendMessage),
    });
    console.log('Message sent to backend:', backendMessage);
  }

  private saveMessageWithUserInfo(groupId: string, message: GroupMessage, isSelf: boolean): void {
    const groupInfo = groupStorageService.getGroupInfo(groupId);
    let senderName = message.senderName;

    if (!senderName) { // Fallback if senderName wasn't resolved before calling this
      senderName = this.getUserDisplayName(message.senderId, groupId);
    }

    const storageMessage: StorageGroupMessage = {
      ...message,
      // id: message.id || `${Date.now()}_${message.senderId}`, // GroupMessage doesn't have id, StorageGroupMessage does.
      // The spread operator should handle this if id is part of StorageGroupMessage but not GroupMessage.
      // If id is mandatory and not in message, it needs to be generated here.
      // Assuming StorageGroupMessage expects an id that might not be in GroupMessage.
      id: (message as any).id || `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`, // Ensure a unique ID for storage
      senderName: senderName, // Ensure senderName is set
      isSelf: isSelf,
      isRead: isSelf || this.activeGroups.has(groupId), // Changed 'read' to 'isRead'
      timestamp: message.timestamp || new Date() // Ensure timestamp
    };
    groupStorageService.saveMessage(groupId, storageMessage);

    // Update last activity for the group
    if (groupInfo) {
      groupInfo.lastActivity = new Date();
      // If the message sender is not in members list (e.g. first message from them), add them.
      // This is a client-side heuristic; ideally, backend manages member lists.
      if (!groupInfo.members.find(m => m.userId === message.senderId)) {
        groupInfo.members.push({
          userId: message.senderId,
          userName: senderName, // Use the resolved senderName
          joinedAt: new Date(), // Approximate join time
          isOwner: false, // Cannot determine owner status client-side reliably here
          status: 'online' // Assume online if sending messages
        });
      }
      groupStorageService.saveGroupInfo(groupInfo);
    }
  }

  // Method to add a message listener (e.g., for UI updates)
  addMessageListener(groupId: string, listener: (message: GroupMessage) => void): void {
    if (!this.messageListeners.has(groupId)) {
      this.messageListeners.set(groupId, []);
    }
    this.messageListeners.get(groupId)?.push(listener);
  }

  // Method to remove a message listener
  removeMessageListener(groupId: string, listener: (message: GroupMessage) => void): void {
    const listeners = this.messageListeners.get(groupId);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

const groupChatService = new GroupChatService();
export default groupChatService;