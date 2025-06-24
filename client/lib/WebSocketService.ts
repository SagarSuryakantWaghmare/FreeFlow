"use client";

import { SafeLocalStorage } from './utils/SafeLocalStorage';

let backendUrl: string; // Default URL for developmentbackendUrl = "ws://localhost:8080/ws/p2p";
if (process.env.NODE_ENV === 'production') {
  backendUrl = 'https://freeflow-server.onrender.com/ws/p2p'
} else {
  backendUrl = "ws://localhost:8080/ws/p2p";
}

/**
 * WebSocketService.ts - Handles WebSocket connections to the signaling server
 * This service is responsible for establishing and maintaining the WebSocket 
 * connection, handling connection events, and providing methods to send messages.
 */

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0; private maxReconnectAttempts = 5;
  private userId: string | null = null;
  private connectionStableTimeout: NodeJS.Timeout | null = null;
  private connectionIsStable = false;

  constructor() {
  }
  /**
   * Connect to the WebSocket server
   * @param userId - The ID of the user connecting
   * @returns Promise that resolves when connection is established
   */
  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userId = userId;
      const serverUrl = backendUrl; // Use the backendUrl defined above

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      // If currently connecting, wait for that connection
      if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
        const checkConnection = () => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            resolve();
          } else if (this.socket?.readyState === WebSocket.CLOSED) {
            reject(new Error("Connection failed"));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      try {
        this.socket = new WebSocket(serverUrl); this.socket.onopen = () => {
          console.log("WebSocket connection established");
          this.reconnectAttempts = 0;
          // Mark connection as stable after a brief delay
          this.connectionStableTimeout = setTimeout(() => {
            this.connectionIsStable = true;
            console.log("WebSocket connection marked as stable");
          }, 2000);

          // Send user_online message with username
          const username = SafeLocalStorage.getItem('username');
          this.sendMessage({
            type: "user_online",
            userId: this.userId,
            userName: username || this.userId
          });

          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.notifyListeners(data.type, data);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        }; this.socket.onclose = (event) => {
          console.log("WebSocket connection closed", event.code, event.reason);
          this.connectionIsStable = false;

          // Clear stability timeout if connection closes early
          if (this.connectionStableTimeout) {
            clearTimeout(this.connectionStableTimeout);
            this.connectionStableTimeout = null;
          }

          // Handle different close codes
          if (event.code === 1011) {
            // Server error - likely backend crash
            console.warn("Server error detected (1011) - backend may have crashed");
          } else if (event.code === 1006) {
            // Abnormal closure
            console.warn("Abnormal WebSocket closure (1006) - connection lost unexpectedly");
          }

          // Only attempt reconnect if it wasn't a manual close (code 1000)
          if (event.code !== 1000) {
            this.attemptReconnect();
          }
        }; this.socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          // Don't reject here as we want to handle reconnection gracefully
          // reject(error);
        };
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        reject(error);
      }
    });
  }/**
   * Send a message through the WebSocket
   * @param message - The message to send (will be JSON stringified)
   */
  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected. Message not sent:", message);
      // Attempt immediate reconnection for critical messages
      if (this.userId && ['ice-candidate', 'offer', 'answer', 'connection_accepted'].includes(message.type)) {
        console.log("Attempting immediate reconnection for critical message");
        this.attemptImmediateReconnect(message);
      }
    }
  }

  /**
   * Attempt immediate reconnection and queue the message
   * @param message - The message to send after reconnection
   */
  private attemptImmediateReconnect(message: any): void {
    if (!this.userId) return;

    // Only attempt if not already connecting
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.connect(this.userId).then(() => {
        // Retry sending the message after successful reconnection
        setTimeout(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
            console.log("Message sent after reconnection:", message.type);
          }
        }, 100);
      }).catch(err => {
        console.error("Immediate reconnection failed:", err);
      });
    }
  }

  /**
   * Send logout notification to all connected peers
   * @param userId - The user ID that is logging out
   * @param connectedUserIds - Array of user IDs to notify
   */
  sendLogoutNotification(userId: string, connectedUserIds: string[]): void {
    connectedUserIds.forEach(targetUserId => {
      this.sendMessage({
        type: 'logout_notification',
        fromUserId: userId,
        toUserId: targetUserId,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Add an event listener for a specific message type
   * @param type - The message type to listen for
   * @param callback - The function to call when that message type is received
   */
  addEventListener(type: string, callback: (data: any) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(callback);
  }

  /**
   * Remove an event listener
   * @param type - The message type
   * @param callback - The callback function to remove
   */
  removeEventListener(type: string, callback: (data: any) => void): void {
    if (!this.listeners.has(type)) return;

    const callbacks = this.listeners.get(type) || [];
    const index = callbacks.indexOf(callback);

    if (index !== -1) {
      callbacks.splice(index, 1);
      this.listeners.set(type, callbacks);
    }
  }
  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      // Set close code to 1000 (normal closure) to prevent auto-reconnect
      this.socket.close(1000, "Manual disconnect");
      this.socket = null;
    }
  }
  /**
   * Get the current connection status
   * @returns Boolean indicating if the connection is open
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
  /**
   * Check if the connection is stable (has been open for a while)
   * @returns Boolean indicating if the connection is stable
   */
  isConnectionStable(): boolean {
    return this.isConnected() && this.connectionIsStable;
  }

  /**
   * Attempt to reconnect to the WebSocket server
   * @private
   */
  private attemptReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Maximum reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId).catch(err => {
          console.error("Reconnection failed:", err);
        });
      }
    }, delay);
  }

  /**
   * Notify all listeners of a specific message type
   * @param type - The message type
   * @param data - The message data
   * @private
   */
  private notifyListeners(type: string, data: any): void {
    const callbacks = this.listeners.get(type) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in listener for ${type}:`, error);
      }
    });
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;
