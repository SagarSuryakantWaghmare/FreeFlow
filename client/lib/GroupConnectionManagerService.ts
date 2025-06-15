"use client";

interface GroupConnection {
  groupId: string;
  groupName: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastConnected?: Date;
  memberCount: number;
  isOwner: boolean;
}

class GroupConnectionManagerService {
  private readonly STORAGE_KEY = 'group_connections';
  private connections: Map<string, GroupConnection> = new Map();
  private statusChangeCallbacks: ((groupId: string, status: GroupConnection['status']) => void)[] = [];

  constructor() {
    this.loadConnections();
  }

  /**
   * Load connections from localStorage
   */
  private loadConnections(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([groupId, conn]: [string, any]) => {
          this.connections.set(groupId, {
            ...conn,
            lastConnected: conn.lastConnected ? new Date(conn.lastConnected) : undefined
          });
        });
      }
    } catch (error) {
      console.error('Error loading group connections:', error);
    }
  }

  /**
   * Save connections to localStorage
   */
  private saveConnections(): void {
    try {
      const data: Record<string, GroupConnection> = {};
      this.connections.forEach((connection, groupId) => {
        data[groupId] = connection;
      });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving group connections:', error);
    }
  }

  /**
   * Update connection status
   */
  updateConnectionStatus(groupId: string, status: GroupConnection['status'], groupInfo?: {
    groupName?: string;
    memberCount?: number;
    isOwner?: boolean;
  }): void {
    const existing = this.connections.get(groupId);
    const connection: GroupConnection = {
      groupId,
      groupName: groupInfo?.groupName || existing?.groupName || `Group ${groupId}`,
      status,
      lastConnected: status === 'connected' ? new Date() : existing?.lastConnected,
      memberCount: groupInfo?.memberCount || existing?.memberCount || 0,
      isOwner: groupInfo?.isOwner || existing?.isOwner || false
    };

    this.connections.set(groupId, connection);
    this.saveConnections();
    this.notifyStatusChange(groupId, status);
  }

  /**
   * Get connection status for a group
   */
  getConnectionStatus(groupId: string): GroupConnection['status'] {
    return this.connections.get(groupId)?.status || 'disconnected';
  }

  /**
   * Get connection info for a group
   */
  getConnection(groupId: string): GroupConnection | null {
    return this.connections.get(groupId) || null;
  }

  /**
   * Get all group connections
   */
  getAllConnections(): GroupConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get connected groups
   */
  getConnectedGroups(): GroupConnection[] {
    return Array.from(this.connections.values()).filter(conn => conn.status === 'connected');
  }

  /**
   * Remove connection (when leaving group)
   */
  removeConnection(groupId: string): void {
    this.connections.delete(groupId);
    this.saveConnections();
  }

  /**
   * Check if connected to a group
   */
  isConnectedToGroup(groupId: string): boolean {
    return this.getConnectionStatus(groupId) === 'connected';
  }

  /**
   * Mark group as active/inactive for connection priority
   */
  setGroupPriority(groupId: string, isHighPriority: boolean): void {
    const connection = this.connections.get(groupId);
    if (connection) {
      // You could add priority field to the interface if needed
      // For now, we'll just ensure the connection is tracked
      this.updateConnectionStatus(groupId, connection.status, {
        groupName: connection.groupName,
        memberCount: connection.memberCount,
        isOwner: connection.isOwner
      });
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    total: number;
    connected: number;
    connecting: number;
    disconnected: number;
    error: number;
  } {
    const connections = Array.from(this.connections.values());
    return {
      total: connections.length,
      connected: connections.filter(c => c.status === 'connected').length,
      connecting: connections.filter(c => c.status === 'connecting').length,
      disconnected: connections.filter(c => c.status === 'disconnected').length,
      error: connections.filter(c => c.status === 'error').length
    };
  }

  /**
   * Auto-reconnect to previously connected groups
   */
  getGroupsForAutoReconnect(): GroupConnection[] {
    const now = new Date();
    const reconnectWindow = 24 * 60 * 60 * 1000; // 24 hours

    return Array.from(this.connections.values()).filter(conn => {
      return conn.lastConnected && 
             (now.getTime() - conn.lastConnected.getTime()) < reconnectWindow &&
             conn.status === 'disconnected';
    });
  }

  /**
   * Register callback for connection status changes
   */
  onConnectionStatusChange(callback: (groupId: string, status: GroupConnection['status']) => void): void {
    this.statusChangeCallbacks.push(callback);
  }

  /**
   * Remove callback for connection status changes
   */
  removeConnectionStatusChangeCallback(callback: (groupId: string, status: GroupConnection['status']) => void): void {
    const index = this.statusChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.statusChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify all listeners about status change
   */
  private notifyStatusChange(groupId: string, status: GroupConnection['status']): void {
    this.statusChangeCallbacks.forEach(callback => {
      try {
        callback(groupId, status);
      } catch (error) {
        console.error('Error in connection status callback:', error);
      }
    });
  }

  /**
   * Clear all connections (for logout)
   */
  clearAllConnections(): void {
    this.connections.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Import connections from group storage service
   */
  syncWithGroupStorage(groups: any[]): void {
    groups.forEach(group => {
      if (!this.connections.has(group.groupId)) {
        this.updateConnectionStatus(group.groupId, 'disconnected', {
          groupName: group.groupName,
          memberCount: group.members?.length || 0,
          isOwner: group.isOwner
        });
      }
    });
  }
}

// Create singleton instance
const groupConnectionManagerService = new GroupConnectionManagerService();
export default groupConnectionManagerService;
export type { GroupConnection };
