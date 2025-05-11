"use client";

/**
 * WebSocketService.js - Handles WebSocket connections to the signaling server
 * This service is responsible for establishing and maintaining the WebSocket 
 * connection, handling connection events, and providing methods to send messages.
 */

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectTimeout = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.userId = null;
    this.useMockMode = false;
  }

  /**
   * Connect to the WebSocket server
   * @param {string} userId - The ID of the user connecting
   * @returns {Promise} Promise that resolves when connection is established
   */
  connect(userId) {
    return new Promise((resolve, reject) => {
      this.userId = userId;
      // Use a fallback mechanism for WebSocket connection
      const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const serverUrl = isProduction 
        ? "wss://yourproductionserver.com/ws" 
        : "ws://localhost:8080/ws";
      
      if (this.socket && this.socket.readyState === 1) { // WebSocket.OPEN
        resolve();
        return;
      }

      try {
        // For development testing, we'll use mock mode if server is unreachable
        const useMockTimeout = setTimeout(() => {
          console.log("WebSocket connection timeout. Using mock mode for development");
          this.useMockMode = true;
          this.reconnectAttempts = 0;
          
          // Simulate receiving online users
          setTimeout(() => {
            this.notifyListeners('online_users', {
              type: 'online_users',
              users: ['user1', 'user2', 'user3', 'user4']
            });
          }, 1000);
          
          resolve();
        }, 3000);
        
        this.socket = new WebSocket(serverUrl);

        this.socket.onopen = () => {
          clearTimeout(useMockTimeout);
          console.log("WebSocket connection established");
          this.reconnectAttempts = 0;
          this.useMockMode = false;
          
          // Send user_online message once connected
          this.sendMessage({
            type: "user_online",
            userId: this.userId
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
        };

        this.socket.onclose = (event) => {
          clearTimeout(useMockTimeout);
          console.log("WebSocket connection closed", event.code, event.reason);
          this.attemptReconnect();
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          // Don't reject here, let the timeout handle it with mock mode
        };
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        this.useMockMode = true;
        resolve(); // Resolve anyway to allow app to function in mock mode
      }
    });
  }

  /**
   * Send a message through the WebSocket
   * @param {object} message - The message to send (will be JSON stringified)
   */
  sendMessage(message) {
    if (this.useMockMode) {
      console.log("Mock mode: Message would be sent", message);
      
      // For request_connection messages, simulate a connection response
      if (message.type === "request_connection") {
        setTimeout(() => {
          this.notifyListeners('connection_request', {
            type: 'connection_request',
            fromUserId: message.toUserId,
            toUserId: this.userId,
            offer: { type: 'mock-offer', sdp: 'mock-sdp' }
          });
        }, 500);
      }
      return;
    }
    
    if (this.socket && this.socket.readyState === 1) { // WebSocket.OPEN
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected. Message not sent:", message);
    }
  }

  /**
   * Add an event listener for a specific message type
   * @param {string} type - The message type to listen for
   * @param {function} callback - The function to call when that message type is received
   */
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.push(callback);
    }
  }
  
  /**
   * Remove an event listener
   * @param {string} type - The message type
   * @param {function} callback - The callback function to remove
   */
  removeEventListener(type, callback) {
    if (!this.listeners.has(type)) return;
    
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notify all listeners for a specific message type
   * @param {string} type - The message type
   * @param {object} data - The data to pass to the listeners
   */
  notifyListeners(type, data) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${type}:`, error);
        }
      });
    }
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn(`Maximum reconnect attempts (${this.maxReconnectAttempts}) reached. Giving up.`);
      this.useMockMode = true;
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId).catch(err => {
          console.error("Reconnection failed:", err);
        });
      }
    }, delay);
  }

  /**
   * Disconnects the WebSocket connection
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.useMockMode = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Returns whether the WebSocket is currently connected
   * @returns {boolean} True if connected, false otherwise
   */
  isConnected() {
    return this.socket !== null && this.socket.readyState === 1; // WebSocket.OPEN
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;
