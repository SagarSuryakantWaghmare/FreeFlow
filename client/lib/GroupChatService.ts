"use client";

import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface GroupMessage {
  groupId: string;
  senderId: string;
  content: string;
  timestamp?: Date;
}

export interface Group {
  groupId: string;
  groupName: string;
  inviteLink?: string;
}

export interface CreateGroupResponse {
  groupId: string;
  inviteLink: string;
}

export interface JoinGroupResponse {
  groupId: string;
  groupName: string;
}

class GroupChatService {
  private stompClient: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private messageListeners: Map<string, ((message: GroupMessage) => void)[]> = new Map();
  private baseUrl = 'http://localhost:8080'; 

  constructor() {
    this.initializeStompClient();
  }

  private initializeStompClient(): void {
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
      console.log('Connected to STOMP server');
    };

    this.stompClient.onDisconnect = () => {
      console.log('Disconnected from STOMP server');
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
    };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.stompClient) {
        reject(new Error('STOMP client not initialized'));
        return;
      }

      if (this.stompClient.connected) {
        resolve();
        return;
      }

      this.stompClient.onConnect = () => {
        console.log('Connected to STOMP server');
        resolve();
      };

      this.stompClient.onStompError = (frame) => {
        console.error('STOMP connection error:', frame);
        reject(new Error('Failed to connect to STOMP server'));
      };

      this.stompClient.activate();
    });
  }

  disconnect(): void {
    if (this.stompClient) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.stompClient.deactivate();
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

      return await response.json();
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

      return await response.json();
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
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

      // Unsubscribe from group messages
      this.unsubscribeFromGroup(groupId);
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
        const groupMessage: GroupMessage = JSON.parse(message.body);
        groupMessage.timestamp = new Date();
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
  }

  sendMessage(message: GroupMessage): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('STOMP client not connected');
      return;
    }

    this.stompClient.publish({
      destination: '/app/chat/send',
      body: JSON.stringify(message),
    });
  }

  isConnected(): boolean {
    return this.stompClient?.connected || false;
  }
}

// Create singleton instance
const groupChatService = new GroupChatService();
export default groupChatService;
