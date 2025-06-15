"use client";

interface ConnectionRequest {
  fromUserId: string;
  fromUserName: string;
  timestamp: Date;
}

interface Connection {
  userId: string;
  userName: string;
  status: 'connected' | 'connecting' | 'disconnected';
  lastActivity: Date;
}

class ConnectionManagerService {
  private readonly BLACKLIST_KEY = 'freeflow_blacklist';
  private readonly CONNECTIONS_KEY = 'freeflow_connections';
  
  private blacklistedUsers: Set<string> = new Set();
  private connections: Map<string, Connection> = new Map();
  private pendingRequests: Map<string, ConnectionRequest> = new Map();
  
  // Callbacks
  private onConnectionRequestCallbacks: ((request: ConnectionRequest) => void)[] = [];
  private onConnectionStatusChangeCallbacks: ((userId: string, status: string) => void)[] = [];

  constructor() {
    this.loadBlacklist();
    this.loadConnections();
  }

  /**
   * Load blacklisted users from localStorage
   */
  private loadBlacklist(): void {
    try {
      const stored = localStorage.getItem(this.BLACKLIST_KEY);
      if (stored) {
        this.blacklistedUsers = new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading blacklist:', error);
    }
  }

  /**
   * Save blacklisted users to localStorage
   */
  private saveBlacklist(): void {
    try {
      localStorage.setItem(this.BLACKLIST_KEY, JSON.stringify([...this.blacklistedUsers]));
    } catch (error) {
      console.error('Error saving blacklist:', error);
    }
  }

  /**
   * Load connections from localStorage
   */
  private loadConnections(): void {
    try {
      const stored = localStorage.getItem(this.CONNECTIONS_KEY);
      if (stored) {
        const connectionsArray = JSON.parse(stored);
        this.connections = new Map(
          connectionsArray.map((conn: any) => [
            conn.userId,
            {
              ...conn,
              lastActivity: new Date(conn.lastActivity)
            }
          ])
        );
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  }

  /**
   * Save connections to localStorage
   */
  private saveConnections(): void {
    try {
      const connectionsArray = Array.from(this.connections.entries()).map(([userId, conn]) => [
        userId,
        {
          ...conn,
          lastActivity: conn.lastActivity.toISOString()
        }
      ]);
      localStorage.setItem(this.CONNECTIONS_KEY, JSON.stringify(connectionsArray));
    } catch (error) {
      console.error('Error saving connections:', error);
    }
  }

  /**
   * Check if a user is blacklisted
   */
  isBlacklisted(userId: string): boolean {
    return this.blacklistedUsers.has(userId);
  }

  /**
   * Add a user to blacklist
   */
  blacklistUser(userId: string): void {
    this.blacklistedUsers.add(userId);
    this.saveBlacklist();
    
    // Remove any pending requests from this user
    this.pendingRequests.delete(userId);
    
    // Remove from connections
    this.connections.delete(userId);
    this.saveConnections();
  }

  /**
   * Remove a user from blacklist
   */
  unblacklistUser(userId: string): void {
    this.blacklistedUsers.delete(userId);
    this.saveBlacklist();
  }

  /**
   * Get all blacklisted users
   */
  getBlacklistedUsers(): string[] {
    return [...this.blacklistedUsers];
  }

  /**
   * Handle incoming connection request
   */
  handleConnectionRequest(fromUserId: string, fromUserName: string): boolean {
    // Check if user is blacklisted
    if (this.isBlacklisted(fromUserId)) {
      console.log(`Connection request from blacklisted user ${fromUserId} ignored`);
      return false;
    }

    // Check if already connected
    const existingConnection = this.connections.get(fromUserId);
    if (existingConnection && existingConnection.status === 'connected') {
      console.log(`User ${fromUserId} is already connected`);
      return false;
    }

    // Check if there's already a pending request from this user
    if (this.pendingRequests.has(fromUserId)) {
      console.log(`Duplicate connection request from ${fromUserId} ignored`);
      return false;
    }

    // Create new request
    const request: ConnectionRequest = {
      fromUserId,
      fromUserName,
      timestamp: new Date()
    };

    this.pendingRequests.set(fromUserId, request);
    
    // Notify listeners
    this.onConnectionRequestCallbacks.forEach(callback => {
      try {
        callback(request);
      } catch (error) {
        console.error('Error in connection request callback:', error);
      }
    });

    return true;
  }

  /**
   * Accept a connection request
   */
  acceptConnectionRequest(fromUserId: string): boolean {
    const request = this.pendingRequests.get(fromUserId);
    if (!request) {
      return false;
    }

    // Remove from pending requests
    this.pendingRequests.delete(fromUserId);

    // Add to connections
    this.connections.set(fromUserId, {
      userId: fromUserId,
      userName: request.fromUserName,
      status: 'connecting',
      lastActivity: new Date()
    });

    this.saveConnections();
    this.notifyConnectionStatusChange(fromUserId, 'connecting');

    return true;
  }

  /**
   * Reject and blacklist a connection request
   */
  rejectAndBlacklistConnectionRequest(fromUserId: string): boolean {
    const request = this.pendingRequests.get(fromUserId);
    if (!request) {
      return false;
    }

    // Remove from pending requests
    this.pendingRequests.delete(fromUserId);

    // Add to blacklist
    this.blacklistUser(fromUserId);

    return true;
  }

  /**
   * Ignore a connection request (just remove from pending)
   */
  ignoreConnectionRequest(fromUserId: string): boolean {
    return this.pendingRequests.delete(fromUserId);
  }

  /**
   * Update connection status
   */
  updateConnectionStatus(userId: string, status: 'connected' | 'connecting' | 'disconnected'): void {
    const connection = this.connections.get(userId);
    if (connection) {
      connection.status = status;
      connection.lastActivity = new Date();
      this.saveConnections();
      this.notifyConnectionStatusChange(userId, status);
    }
  }

  /**
   * Add a new connection
   */
  addConnection(userId: string, userName: string): void {
    this.connections.set(userId, {
      userId,
      userName,
      status: 'connecting',
      lastActivity: new Date()
    });
    this.saveConnections();
    this.notifyConnectionStatusChange(userId, 'connecting');
  }

  /**
   * Get connection info
   */
  getConnection(userId: string): Connection | undefined {
    return this.connections.get(userId);
  }

  /**
   * Get all connections
   */
  getAllConnections(): Connection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get pending requests
   */
  getPendingRequests(): ConnectionRequest[] {
    return Array.from(this.pendingRequests.values());
  }

  /**
   * Check if there are pending requests
   */
  hasPendingRequests(): boolean {
    return this.pendingRequests.size > 0;
  }

  /**
   * Get the next pending request
   */
  getNextPendingRequest(): ConnectionRequest | null {
    const requests = Array.from(this.pendingRequests.values());
    return requests.length > 0 ? requests[0] : null;
  }

  /**
   * Register callback for connection requests
   */
  onConnectionRequest(callback: (request: ConnectionRequest) => void): void {
    this.onConnectionRequestCallbacks.push(callback);
  }

  /**
   * Register callback for connection status changes
   */
  onConnectionStatusChange(callback: (userId: string, status: string) => void): void {
    this.onConnectionStatusChangeCallbacks.push(callback);
  }

  /**
   * Remove connection request callback
   */
  removeConnectionRequestCallback(callback: (request: ConnectionRequest) => void): void {
    const index = this.onConnectionRequestCallbacks.indexOf(callback);
    if (index > -1) {
      this.onConnectionRequestCallbacks.splice(index, 1);
    }
  }

  /**
   * Remove connection status change callback
   */
  removeConnectionStatusChangeCallback(callback: (userId: string, status: string) => void): void {
    const index = this.onConnectionStatusChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.onConnectionStatusChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * Clear all connections and pending requests (for logout)
   */
  clearAll(): void {
    this.connections.clear();
    this.pendingRequests.clear();
    this.saveConnections();
  }

  /**
   * Notify connection status change
   */
  private notifyConnectionStatusChange(userId: string, status: string): void {
    this.onConnectionStatusChangeCallbacks.forEach(callback => {
      try {
        callback(userId, status);
      } catch (error) {
        console.error('Error in connection status change callback:', error);
      }
    });
  }
}

// Create singleton instance
const connectionManagerService = new ConnectionManagerService();
export default connectionManagerService;
