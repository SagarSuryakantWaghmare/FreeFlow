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
  private connectionState = false;

  constructor() {
    // Initialize when needed, not immediately
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
    };

    this.stompClient.onDisconnect = () => {
      console.log('Disconnected from STOMP server');
      this.connectionState = false;
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
    }    const subscription = this.stompClient.subscribe(destination, (message) => {
      try {
        const receivedMessage = JSON.parse(message.body);
        console.log('Received raw message:', receivedMessage);
        
        // Convert backend message format to frontend format
        const groupMessage: GroupMessage = {
          groupId: String(receivedMessage.groupId), // Convert number to string for frontend
          senderId: receivedMessage.senderId,
          content: receivedMessage.content,
          timestamp: new Date()
        };
        
        console.log('Processed message:', groupMessage);
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
    this.stompClient.publish({
      destination: '/app/chat/send',
      body: JSON.stringify(backendMessage),
    });
  }
  isConnected(): boolean {
    return this.connectionState && (this.stompClient?.connected || false);
  }
}

// Create singleton instance
const groupChatService = new GroupChatService();
export default groupChatService;
