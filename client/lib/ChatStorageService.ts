"use client";

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isSelf: boolean;
  isRead?: boolean; // New field to track read status
}

interface UnreadCount {
  [peerId: string]: number;
}

class ChatStorageService {
  private readonly PREFIX = 'chat_messages_';
  private readonly UNREAD_PREFIX = 'unread_count_';
  private readonly MAX_MESSAGES_PER_PEER = 100; // Limit to avoid localStorage size issues
  
  // Callbacks for real-time updates
  private onNewMessageCallbacks: ((peerId: string, message: ChatMessage) => void)[] = [];
  private onUnreadCountChangeCallbacks: ((peerId: string, count: number) => void)[] = [];

  /**
   * Save a message to localStorage
   */
  saveMessage(peerId: string, message: ChatMessage): void {
    const messages = this.getMessages(peerId);
    
    // Check if message already exists (avoid duplicates)
    const existingMessage = messages.find(msg => msg.id === message.id);
    if (existingMessage) {
      return; // Don't save duplicate
    }
    
    const messageToSave = {
      ...message,
      timestamp: message.timestamp instanceof Date 
        ? message.timestamp 
        : new Date(message.timestamp), // Ensure timestamp is stored as a Date object
      isRead: message.isSelf // Mark as read if it's from current user
    };
    
    messages.push(messageToSave);
    
    // Trim messages if we exceed our maximum
    if (messages.length > this.MAX_MESSAGES_PER_PEER) {
      messages.splice(0, messages.length - this.MAX_MESSAGES_PER_PEER);
    }
    
    this.saveMessages(peerId, messages);
    
    // Update unread count if it's not from current user
    if (!message.isSelf) {
      this.incrementUnreadCount(peerId);
    }
    
    // Notify listeners about new message
    this.notifyNewMessage(peerId, messageToSave);
  }
  
  /**
   * Save a message in the background (when chat window is not open)
   */
  saveBackgroundMessage(peerId: string, message: ChatMessage): void {
    // Same as saveMessage but explicitly mark as unread
    const messageToSave = {
      ...message,
      isRead: false,
      timestamp: message.timestamp instanceof Date 
        ? message.timestamp 
        : new Date(message.timestamp)
    };
    
    this.saveMessage(peerId, messageToSave);
  }  /**
   * Save multiple messages to localStorage
   */
  saveMessages(peerId: string, messages: ChatMessage[]): void {
    try {
      const key = this.getStorageKey(peerId);
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
      
      // If we hit a quota error, try to reduce the number of messages
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, reducing message count');
        
        // Trim messages further to save space
        const reducedMessages = messages.slice(-Math.floor(this.MAX_MESSAGES_PER_PEER / 2));
        try {
          const storageKey = this.getStorageKey(peerId);
          localStorage.setItem(storageKey, JSON.stringify(reducedMessages));
        } catch (innerError) {
          console.error('Still unable to save messages after reduction:', innerError);
        }
      }
    }
  }

  /**
   * Get all messages for a specific peer
   */
  getMessages(peerId: string): ChatMessage[] {
    try {
      const key = this.getStorageKey(peerId);
      const storedMessages = localStorage.getItem(key);
      
      if (!storedMessages) {
        return [];
      }

      // Parse messages and ensure timestamps are Date objects
      return JSON.parse(storedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        isRead: msg.isRead !== undefined ? msg.isRead : true // Default to read for old messages
      }));
    } catch (error) {
      console.error('Error retrieving messages from localStorage:', error);
      return [];
    }
  }

  /**
   * Mark all messages from a peer as read
   */
  markMessagesAsRead(peerId: string): void {
    const messages = this.getMessages(peerId);
    const updatedMessages = messages.map(msg => ({ ...msg, isRead: true }));
    this.saveMessages(peerId, updatedMessages);
    this.setUnreadCount(peerId, 0);
  }

  /**
   * Get unread message count for a peer
   */
  getUnreadCount(peerId: string): number {
    try {
      const key = this.getUnreadCountKey(peerId);
      const stored = localStorage.getItem(key);
      return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Set unread count for a peer
   */
  setUnreadCount(peerId: string, count: number): void {
    try {
      const key = this.getUnreadCountKey(peerId);
      localStorage.setItem(key, count.toString());
      this.notifyUnreadCountChange(peerId, count);
    } catch (error) {
      console.error('Error setting unread count:', error);
    }
  }

  /**
   * Increment unread count for a peer
   */
  incrementUnreadCount(peerId: string): void {
    const currentCount = this.getUnreadCount(peerId);
    this.setUnreadCount(peerId, currentCount + 1);
  }

  /**
   * Get all peers with unread messages
   */
  getPeersWithUnreadMessages(): { peerId: string; count: number }[] {
    const peers: { peerId: string; count: number }[] = [];
    const storedPeerIds = this.getStoredPeerIds();
    
    storedPeerIds.forEach(peerId => {
      const count = this.getUnreadCount(peerId);
      if (count > 0) {
        peers.push({ peerId, count });
      }
    });
    
    return peers;
  }

  /**
   * Get total unread message count across all peers
   */
  getTotalUnreadCount(): number {
    return this.getPeersWithUnreadMessages()
      .reduce((total, peer) => total + peer.count, 0);
  }

  /**
   * Register callback for new messages
   */
  onNewMessage(callback: (peerId: string, message: ChatMessage) => void): void {
    this.onNewMessageCallbacks.push(callback);
  }

  /**
   * Register callback for unread count changes
   */
  onUnreadCountChange(callback: (peerId: string, count: number) => void): void {
    this.onUnreadCountChangeCallbacks.push(callback);
  }

  /**
   * Remove new message callback
   */
  removeNewMessageCallback(callback: (peerId: string, message: ChatMessage) => void): void {
    const index = this.onNewMessageCallbacks.indexOf(callback);
    if (index > -1) {
      this.onNewMessageCallbacks.splice(index, 1);
    }
  }

  /**
   * Remove unread count change callback
   */
  removeUnreadCountChangeCallback(callback: (peerId: string, count: number) => void): void {
    const index = this.onUnreadCountChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.onUnreadCountChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify listeners about new message
   */
  private notifyNewMessage(peerId: string, message: ChatMessage): void {
    this.onNewMessageCallbacks.forEach(callback => {
      try {
        callback(peerId, message);
      } catch (error) {
        console.error('Error in new message callback:', error);
      }
    });
  }

  /**
   * Notify listeners about unread count change
   */
  private notifyUnreadCountChange(peerId: string, count: number): void {
    this.onUnreadCountChangeCallbacks.forEach(callback => {
      try {
        callback(peerId, count);
      } catch (error) {
        console.error('Error in unread count change callback:', error);
      }
    });
  }
  /**
   * Clear all messages for a specific peer
   */
  clearMessages(peerId: string): void {
    const key = this.getStorageKey(peerId);
    localStorage.removeItem(key);
    this.setUnreadCount(peerId, 0);
  }

  /**
   * Clear all chat messages for all peers
   */
  clearAllMessages(): void {
    const keys = this.getAllChatKeys();
    keys.forEach(key => localStorage.removeItem(key));
    
    // Also clear all unread counts
    const unreadKeys = this.getAllUnreadCountKeys();
    unreadKeys.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Get all peer IDs that have stored messages
   */
  getStoredPeerIds(): string[] {
    return this.getAllChatKeys().map(key => key.replace(this.PREFIX, ''));
  }

  /**
   * Get total size of all stored messages (approximate)
   */
  getTotalStorageSize(): number {
    let totalSize = 0;
    this.getAllChatKeys().forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += value.length * 2; // Approximate size in bytes (2 bytes per character)
      }
    });
    return totalSize;
  }

  /**
   * Get all chat storage keys
   */
  private getAllChatKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Get all unread count storage keys
   */
  private getAllUnreadCountKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.UNREAD_PREFIX)) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Generate a storage key for a peer
   */
  private getStorageKey(peerId: string): string {
    return `${this.PREFIX}${peerId}`;
  }

  /**
   * Generate an unread count storage key for a peer
   */
  private getUnreadCountKey(peerId: string): string {
    return `${this.UNREAD_PREFIX}${peerId}`;
  }
}

// Create singleton instance
const chatStorageService = new ChatStorageService();
export default chatStorageService;
