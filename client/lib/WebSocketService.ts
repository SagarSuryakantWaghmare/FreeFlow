"use client";

/**
 * WebSocketService.ts - Handles WebSocket connections to the signaling server
 * This service is responsible for establishing and maintaining the WebSocket 
 * connection, handling connection events, and providing methods to send messages.
 */

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private userId: string | null = null;
  private useMockMode = false; // Add mock mode support for development

  constructor() {
    // Intentionally empty - socket will be initialized when connect is called
  }

  /**
   * Connect to the WebSocket server
   * @param userId - The ID of the user connecting
   * @returns Promise that resolves when connection is established
   */  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userId = userId;
      // Use a fallback mechanism for WebSocket connection
      // Try secure connection first (wss) if in production, otherwise use local development (ws)
      const isProduction = window.location.protocol === 'https:';
      const serverUrl = isProduction
        ? "wss://yourproductionserver.com/ws"
        : "ws://localhost:8080/ws";

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      try {
        // For development testing, we'll use mock mode if server is unreachable
        // This allows UI development to continue even if backend is not available
        if (process.env.NODE_ENV === 'development') {
          console.log("WebSocket attempting connection to:", serverUrl);

          // Add a small delay to simulate network connection
          setTimeout(() => {
            // Check if the socket connection failed and use mock data
            if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
              console.log("Using mock WebSocket mode for development");
              this.useMockMode = true;
              this.reconnectAttempts = 0;
              resolve();

              // Simulate receiving online users after a short delay
              setTimeout(() => {
                this.notifyListeners('online_users', {
                  type: 'online_users',
                  users: ['user1', 'user2', 'user3', 'user4']
                });
              }, 1000);
            }
          }, 3000);
        }

        this.socket = new WebSocket(serverUrl);

        this.socket.onopen = () => {
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
          console.log("WebSocket connection closed", event.code, event.reason);
          this.attemptReconnect();
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        };
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        reject(error);
      }
    });
  }
  /**
   * Send a message through the WebSocket
   * @param message - The message to send (will be JSON stringified)
   */
  sendMessage(message: any): void {
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

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected. Message not sent:", message);
    }
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
      this.socket.close();
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
