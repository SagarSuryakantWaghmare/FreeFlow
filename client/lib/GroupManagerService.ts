"use client";

export interface JoinRequest {
  requestId: string;
  groupId: string;
  groupName: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

interface GroupMembershipInfo {
  groupId: string;
  groupName: string;
  isOwner: boolean;
  ownerId: string;
  memberCount: number;
  joinedAt: Date;
  inviteLink?: string;
}

class GroupManagerService {
  private readonly JOIN_REQUESTS_KEY = 'group_join_requests';
  private readonly PENDING_APPROVALS_KEY = 'pending_group_approvals';
  
  private pendingJoinRequests: Map<string, JoinRequest> = new Map();
  private currentUserId: string | null = null;
  
  // Callbacks
  private onJoinRequestCallbacks: ((request: JoinRequest) => void)[] = [];
  private onJoinApprovedCallbacks: ((groupId: string, groupName: string) => void)[] = [];
  private onJoinRejectedCallbacks: ((groupId: string, reason: string) => void)[] = [];
  private onOwnershipTransferCallbacks: ((groupId: string, newOwnerId: string) => void)[] = [];

  constructor() {
    this.loadPendingRequests();
  }

  /**
   * Initialize with current user ID
   */
  initialize(userId: string): void {
    this.currentUserId = userId;
    this.loadPendingRequests();
  }

  /**
   * Handle incoming join request for groups the user owns
   */
  handleJoinRequest(groupId: string, groupName: string, fromUserId: string, fromUserName: string): void {
    const requestId = `${groupId}_${fromUserId}_${Date.now()}`;
    
    const request: JoinRequest = {
      requestId,
      groupId,
      groupName,
      userId: fromUserId,
      userName: fromUserName,
      timestamp: new Date()
    };

    this.pendingJoinRequests.set(requestId, request);
    this.savePendingRequests();
    
    // Notify listeners
    this.onJoinRequestCallbacks.forEach(callback => {
      try {
        callback(request);
      } catch (error) {
        console.error('Error in join request callback:', error);
      }
    });
  }

  /**
   * Approve a join request
   */
  approveJoinRequest(requestId: string): boolean {
    const request = this.pendingJoinRequests.get(requestId);
    if (!request) {
      return false;
    }

    // Remove from pending requests
    this.pendingJoinRequests.delete(requestId);
    this.savePendingRequests();

    // Send approval notification (would be handled by WebSocket in real implementation)
    this.notifyJoinApproved(request.groupId, request.groupName);

    return true;
  }

  /**
   * Reject a join request
   */
  rejectJoinRequest(requestId: string, reason?: string): boolean {
    const request = this.pendingJoinRequests.get(requestId);
    if (!request) {
      return false;
    }

    // Remove from pending requests
    this.pendingJoinRequests.delete(requestId);
    this.savePendingRequests();

    // Send rejection notification
    this.notifyJoinRejected(request.groupId, reason || 'Request rejected by group owner');

    return true;
  }

  /**
   * Get all pending join requests for groups the user owns
   */
  getPendingJoinRequests(): JoinRequest[] {
    return Array.from(this.pendingJoinRequests.values());
  }

  /**
   * Check if there are pending join requests
   */
  hasPendingJoinRequests(): boolean {
    return this.pendingJoinRequests.size > 0;
  }

  /**
   * Transfer group ownership to another member
   */
  transferOwnership(groupId: string, newOwnerId: string): void {
    // This would typically send a request to the backend
    // For now, we'll just notify listeners
    this.notifyOwnershipTransfer(groupId, newOwnerId);
  }

  /**
   * Determine new owner when current owner leaves
   */
  determineNewOwner(groupId: string, members: { userId: string; joinedAt: Date }[]): string | null {
    if (members.length === 0) {
      return null;
    }

    // Find the member who joined earliest (excluding the current owner)
    const sortedMembers = members
      .filter(member => member.userId !== this.currentUserId)
      .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());

    return sortedMembers.length > 0 ? sortedMembers[0].userId : null;
  }

  /**
   * Handle group owner leaving
   */
  handleOwnerLeaving(groupId: string, members: { userId: string; joinedAt: Date }[]): string | null {
    const newOwnerId = this.determineNewOwner(groupId, members);
    
    if (newOwnerId) {
      this.transferOwnership(groupId, newOwnerId);
    }
    
    return newOwnerId;
  }

  /**
   * Validate if user can perform owner actions
   */
  canPerformOwnerAction(groupId: string): boolean {
    // This would check with backend/local storage if user is owner
    // For now, we'll assume they are if they have the group info
    return true; // Simplified for this implementation
  }

  /**
   * Get group membership info for all user's groups
   */
  getGroupMemberships(): GroupMembershipInfo[] {
    // This would typically fetch from backend or local storage
    // Simplified implementation
    return [];
  }

  /**
   * Clear all pending requests (for logout)
   */
  clearAll(): void {
    this.pendingJoinRequests.clear();
    this.savePendingRequests();
  }

  /**
   * Load pending requests from localStorage
   */
  private loadPendingRequests(): void {
    try {
      const key = this.getJoinRequestsKey();
      const stored = localStorage.getItem(key);
      if (stored) {
        const requests = JSON.parse(stored);
        this.pendingJoinRequests = new Map(
          requests.map((req: any) => [
            req.requestId,
            {
              ...req,
              timestamp: new Date(req.timestamp)
            }
          ])
        );
      }
    } catch (error) {
      console.error('Error loading pending join requests:', error);
    }
  }

  /**
   * Save pending requests to localStorage
   */
  private savePendingRequests(): void {
    try {
      const key = this.getJoinRequestsKey();
      const requests = Array.from(this.pendingJoinRequests.values()).map(req => ({
        ...req,
        timestamp: req.timestamp.toISOString()
      }));
      localStorage.setItem(key, JSON.stringify(requests));
    } catch (error) {
      console.error('Error saving pending join requests:', error);
    }
  }

  /**
   * Get user-specific join requests key
   */
  private getJoinRequestsKey(): string {
    return this.currentUserId ? `${this.JOIN_REQUESTS_KEY}_${this.currentUserId}` : this.JOIN_REQUESTS_KEY;
  }

  /**
   * Event listeners
   */
  onJoinRequest(callback: (request: JoinRequest) => void): void {
    this.onJoinRequestCallbacks.push(callback);
  }

  onJoinApproved(callback: (groupId: string, groupName: string) => void): void {
    this.onJoinApprovedCallbacks.push(callback);
  }

  onJoinRejected(callback: (groupId: string, reason: string) => void): void {
    this.onJoinRejectedCallbacks.push(callback);
  }

  onOwnershipTransfer(callback: (groupId: string, newOwnerId: string) => void): void {
    this.onOwnershipTransferCallbacks.push(callback);
  }

  removeJoinRequestCallback(callback: (request: JoinRequest) => void): void {
    const index = this.onJoinRequestCallbacks.indexOf(callback);
    if (index > -1) {
      this.onJoinRequestCallbacks.splice(index, 1);
    }
  }

  removeJoinApprovedCallback(callback: (groupId: string, groupName: string) => void): void {
    const index = this.onJoinApprovedCallbacks.indexOf(callback);
    if (index > -1) {
      this.onJoinApprovedCallbacks.splice(index, 1);
    }
  }

  removeJoinRejectedCallback(callback: (groupId: string, reason: string) => void): void {
    const index = this.onJoinRejectedCallbacks.indexOf(callback);
    if (index > -1) {
      this.onJoinRejectedCallbacks.splice(index, 1);
    }
  }

  removeOwnershipTransferCallback(callback: (groupId: string, newOwnerId: string) => void): void {
    const index = this.onOwnershipTransferCallbacks.indexOf(callback);
    if (index > -1) {
      this.onOwnershipTransferCallbacks.splice(index, 1);
    }
  }

  /**
   * Notification methods
   */
  private notifyJoinApproved(groupId: string, groupName: string): void {
    this.onJoinApprovedCallbacks.forEach(callback => {
      try {
        callback(groupId, groupName);
      } catch (error) {
        console.error('Error in join approved callback:', error);
      }
    });
  }

  private notifyJoinRejected(groupId: string, reason: string): void {
    this.onJoinRejectedCallbacks.forEach(callback => {
      try {
        callback(groupId, reason);
      } catch (error) {
        console.error('Error in join rejected callback:', error);
      }
    });
  }

  private notifyOwnershipTransfer(groupId: string, newOwnerId: string): void {
    this.onOwnershipTransferCallbacks.forEach(callback => {
      try {
        callback(groupId, newOwnerId);
      } catch (error) {
        console.error('Error in ownership transfer callback:', error);
      }
    });
  }
}

// Create singleton instance
const groupManagerService = new GroupManagerService();
export default groupManagerService;
export type { GroupMembershipInfo };
