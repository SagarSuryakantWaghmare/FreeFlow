"use client";

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isSelf: boolean;
}

class ChatStorageService {
  private readonly PREFIX = 'chat_messages_';
  private readonly MAX_MESSAGES_PER_PEER = 100; // Limit to avoid localStorage size issues

  /**
   * Save a message to localStorage
   */
  saveMessage(peerId: string, message: ChatMessage): void {
    const messages = this.getMessages(peerId);
    messages.push({
      ...message,
      timestamp: message.timestamp instanceof Date 
        ? message.timestamp 
        : new Date(message.timestamp) // Ensure timestamp is stored as a Date object
    });
    
    // Trim messages if we exceed our maximum
    if (messages.length > this.MAX_MESSAGES_PER_PEER) {
      messages.splice(0, messages.length - this.MAX_MESSAGES_PER_PEER);
    }
    
    this.saveMessages(peerId, messages);
  }
  /**
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
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.error('Error retrieving messages from localStorage:', error);
      return [];
    }
  }

  /**
   * Clear all messages for a specific peer
   */
  clearMessages(peerId: string): void {
    const key = this.getStorageKey(peerId);
    localStorage.removeItem(key);
  }

  /**
   * Clear all chat messages for all peers
   */
  clearAllMessages(): void {
    const keys = this.getAllChatKeys();
    keys.forEach(key => localStorage.removeItem(key));
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
   * Generate a storage key for a peer
   */
  private getStorageKey(peerId: string): string {
    return `${this.PREFIX}${peerId}`;
  }
}

// Create singleton instance
const chatStorageService = new ChatStorageService();
export default chatStorageService;
