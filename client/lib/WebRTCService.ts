"use client";

import webSocketService from "./WebSocketService";
import { SyncRequest, SyncResponse } from "./types";
import chatStorageService from "./ChatStorageService";
import connectionManagerService from "./ConnectionManagerService";

interface RTCPeerData {
  peerConnection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isSelf: boolean;
}

type MessageCallback = (message: Message) => void;
type ConnectionStateCallback = (userId: string, state: 'connected' | 'disconnected') => void;

class WebRTCService {
  private peers: Map<string, RTCPeerData> = new Map();
  private localUserId: string | null = null;
  private messageCallbacks: MessageCallback[] = [];
  private connectionStateCallbacks: ConnectionStateCallback[] = [];
  private iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  constructor() {
    this.setupWebSocketListeners();
  }

  /**
   * Initialize WebRTC service with user ID
   */
  initialize(userId: string): void {
    this.localUserId = userId;
  }

  /**
   * Set up WebSocket event listeners for signaling
   */
  private setupWebSocketListeners(): void {
    // Listen for ICE candidates
    webSocketService.addEventListener('ice-candidate', data => {
      if (data.fromUserId !== this.localUserId) {
        this.handleIceCandidate(data);
      }
    });

    // Listen for offers to establish connection
    webSocketService.addEventListener('offer', data => {
      if (data.toUserId === this.localUserId) {
        this.handleOffer(data);
      }
    });

    // Listen for answers to our connection offers
    webSocketService.addEventListener('answer', data => {
      if (data.toUserId === this.localUserId) {
        this.handleAnswer(data);
      }
    });

    // Listen for connection requests
    webSocketService.addEventListener('connection_request', data => {
      if (data.toUserId === this.localUserId) {
        this.handleConnectionRequest(data);
      }
    });

    // Listen for accepted connection requests
    webSocketService.addEventListener('connection_accepted', data => {
      if (data.toUserId === this.localUserId) {
        this.createOffer(data.fromUserId);
      }
    });

    // Listen for rejected connection requests
    webSocketService.addEventListener('connection_rejected', data => {
      if (data.toUserId === this.localUserId) {
        console.log(`Connection request rejected by ${data.fromUserId}`);
        // Optionally notify the user
      }
    });
  }
  /**
   * Initiate a connection with another user (updated to check connection status)
   */
  requestConnection(remoteUserId: string): void {
    if (!this.localUserId) {
      console.error("Local user ID not set. Call initialize first.");
      return;
    }

    // Check if user is blacklisted
    if (connectionManagerService.isBlacklisted(remoteUserId)) {
      console.log(`Cannot connect to blacklisted user ${remoteUserId}`);
      return;
    }

    // Check if already connected
    if (this.isConnectedToPeer(remoteUserId)) {
      console.log(`Already connected to ${remoteUserId}`);
      return;
    }

    // Check if already have an existing connection
    const existingConnection = connectionManagerService.getConnection(remoteUserId);
    if (existingConnection && existingConnection.status === 'connecting') {
      console.log(`Connection already in progress with ${remoteUserId}`);
      return;
    }

    // Add to connection manager
    const username = localStorage.getItem('username') || this.localUserId;
    connectionManagerService.addConnection(remoteUserId, remoteUserId); // We don't know their username yet

    // Send connection request
    webSocketService.sendMessage({
      type: 'connection_request',
      fromUserId: this.localUserId,
      fromUserName: username,
      toUserId: remoteUserId
    });
  }
  /**
   * Handle incoming connection request - now routes through ConnectionManagerService
   */
  private handleConnectionRequest(data: any): void {
    if (!this.localUserId) return;

    // Get username from the request or use userId as fallback
    const fromUserName = data.fromUserName || data.fromUserId;
    
    // Let ConnectionManagerService handle the request (including blacklist check)
    const shouldProcess = connectionManagerService.handleConnectionRequest(data.fromUserId, fromUserName);
    
    if (!shouldProcess) {
      // Request was blocked (blacklisted or duplicate), send rejection
      webSocketService.sendMessage({
        type: 'connection_rejected',
        fromUserId: this.localUserId,
        toUserId: data.fromUserId,
        reason: 'rejected'
      });
      return;
    }

    // The ConnectionManagerService will trigger a popup for user decision
    // The actual acceptance/rejection will be handled by acceptConnectionRequest/rejectConnectionRequest methods
  }

  /**
   * Accept a connection request from another user
   */
  acceptConnectionRequest(fromUserId: string): void {
    if (!this.localUserId) return;

    // Update connection manager
    connectionManagerService.acceptConnectionRequest(fromUserId);

    // Send acceptance to the requesting user
    webSocketService.sendMessage({
      type: 'connection_accepted',
      fromUserId: this.localUserId,
      toUserId: fromUserId
    });
  }

  /**
   * Reject and blacklist a connection request from another user
   */
  rejectConnectionRequest(fromUserId: string): void {
    if (!this.localUserId) return;

    // Update connection manager (will blacklist the user)
    connectionManagerService.rejectAndBlacklistConnectionRequest(fromUserId);

    // Send rejection to the requesting user
    webSocketService.sendMessage({
      type: 'connection_rejected',
      fromUserId: this.localUserId,
      toUserId: fromUserId,
      reason: 'rejected_and_blocked'
    });
  }

  /**
   * Create and send an offer to a remote peer
   */
  private async createOffer(remoteUserId: string): Promise<void> {
    if (!this.localUserId) return;

    try {
      const peerConnection = this.createPeerConnection(remoteUserId);
      const dataChannel = peerConnection.createDataChannel('messageChannel');

      this.setupDataChannel(remoteUserId, dataChannel);

      this.peers.set(remoteUserId, { peerConnection, dataChannel });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      webSocketService.sendMessage({
        type: 'offer',
        fromUserId: this.localUserId,
        toUserId: remoteUserId,
        sdp: peerConnection.localDescription
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  /**
   * Handle an incoming offer
   */
  private async handleOffer(data: any): Promise<void> {
    if (!this.localUserId) return;

    try {
      const peerConnection = this.createPeerConnection(data.fromUserId);
      this.peers.set(data.fromUserId, { peerConnection });

      peerConnection.addEventListener('datachannel', event => {
        this.setupDataChannel(data.fromUserId, event.channel);
        this.peers.get(data.fromUserId)!.dataChannel = event.channel;
      });

      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      webSocketService.sendMessage({
        type: 'answer',
        fromUserId: this.localUserId,
        toUserId: data.fromUserId,
        sdp: peerConnection.localDescription
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  /**
   * Handle an incoming answer to our offer
   */
  private async handleAnswer(data: any): Promise<void> {
    const peer = this.peers.get(data.fromUserId);
    if (peer && peer.peerConnection) {
      try {
        await peer.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } catch (error) {
        console.error('Error setting remote description from answer:', error);
      }
    }
  }

  /**
   * Handle an incoming ICE candidate
   */
  private async handleIceCandidate(data: any): Promise<void> {
    const peer = this.peers.get(data.fromUserId);
    if (peer && peer.peerConnection) {
      try {
        if (data.candidate) {
          await peer.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  }

  /**
   * Create a new RTCPeerConnection
   */
  private createPeerConnection(remoteUserId: string): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });

    peerConnection.addEventListener('icecandidate', event => {
      if (!this.localUserId) return;

      if (event.candidate) {
        webSocketService.sendMessage({
          type: 'ice-candidate',
          fromUserId: this.localUserId,
          toUserId: remoteUserId,
          candidate: event.candidate
        });
      }
    });    peerConnection.addEventListener('connectionstatechange', () => {
      if (peerConnection.connectionState === 'connected') {
        connectionManagerService.updateConnectionStatus(remoteUserId, 'connected');
        this.notifyConnectionStateChange(remoteUserId, 'connected');
      } else if (['disconnected', 'failed', 'closed'].includes(peerConnection.connectionState)) {
        connectionManagerService.updateConnectionStatus(remoteUserId, 'disconnected');
        this.notifyConnectionStateChange(remoteUserId, 'disconnected');
      }
    });

    return peerConnection;
  }

  /**
   * Set up a data channel for messaging
   */  private setupDataChannel(remoteUserId: string, dataChannel: RTCDataChannel): void {
    dataChannel.addEventListener('open', () => {
      console.log(`Data channel opened with ${remoteUserId}`);
      this.notifyConnectionStateChange(remoteUserId, 'connected');

      // Request message sync when connection is established
      setTimeout(() => {
        this.requestMessageSync(remoteUserId);
      }, 500); // Small delay to ensure connection is stable
    });

    dataChannel.addEventListener('close', () => {
      console.log(`Data channel closed with ${remoteUserId}`);
      this.notifyConnectionStateChange(remoteUserId, 'disconnected');
    });    dataChannel.addEventListener('message', event => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'sync_request') {
          this.handleSyncRequest(remoteUserId, message);
        } else if (message.type === 'sync_response') {
          this.handleSyncResponse(remoteUserId, message);
        } else {
          const formattedMessage: Message = {
            id: message.id,
            sender: message.sender,
            content: message.content,
            timestamp: new Date(message.timestamp),
            isSelf: false
          };
          
          // Save message to storage (handles background messages automatically)
          chatStorageService.saveMessage(remoteUserId, formattedMessage);
          
          // Notify listeners (active chat windows)
          this.notifyMessageReceived(formattedMessage);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
  }

  /**
   * Request message synchronization from a peer
   * This is called when a connection is established to get any messages
   * that were sent while the user was offline
   */
  requestMessageSync(remoteUserId: string): void {
    const peer = this.peers.get(remoteUserId);
    if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
      console.warn(`Cannot request message sync - data channel not open for ${remoteUserId}`);
      return;
    }

    // Get the timestamp of the last message we have for this peer
    const messages = chatStorageService.getMessages(remoteUserId);
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    const syncRequest: SyncRequest = {
      type: 'sync_request',
      lastMessageTimestamp: lastMessage ? new Date(lastMessage.timestamp).getTime() : null
    };

    try {
      peer.dataChannel.send(JSON.stringify(syncRequest));
      console.log(`Sent sync request to ${remoteUserId}`);
    } catch (error) {
      console.error('Error sending sync request:', error);
    }
  }

  /**
   * Handle an incoming message sync request
   */
  private handleSyncRequest(remoteUserId: string, data: SyncRequest): void {
    const peer = this.peers.get(remoteUserId);
    if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
      console.warn(`Cannot handle sync request - data channel not open for ${remoteUserId}`);
      return;
    }

    // Get all messages for this peer
    const allMessages = chatStorageService.getMessages(remoteUserId);

    // Filter messages newer than the timestamp provided in the request
    let messagesToSync = allMessages;
    if (data.lastMessageTimestamp !== null) {
      messagesToSync = allMessages.filter(msg =>
        new Date(msg.timestamp).getTime() > data.lastMessageTimestamp!
      );
    }

    // Only send messages that originated from the current user (isSelf === true)
    // since the other user already has their own messages
    const messagesToSend = messagesToSync
      .filter(msg => msg.isSelf)
      .map(msg => ({
        id: msg.id,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp
      }));

    // Send sync response
    const syncResponse: SyncResponse = {
      type: 'sync_response',
      messages: messagesToSend
    };

    try {
      peer.dataChannel.send(JSON.stringify(syncResponse));
      console.log(`Sent ${messagesToSend.length} messages in sync response to ${remoteUserId}`);
    } catch (error) {
      console.error('Error sending sync response:', error);
    }
  }

  /**
   * Handle an incoming message sync response
   */
  private handleSyncResponse(remoteUserId: string, data: SyncResponse): void {
    console.log(`Received sync response from ${remoteUserId} with ${data.messages.length} messages`);

    // Process each synced message
    data.messages.forEach(message => {
      // Check if we already have this message (based on ID)
      const existingMessages = chatStorageService.getMessages(remoteUserId);
      const messageExists = existingMessages.some(msg => msg.id === message.id);

      if (!messageExists) {
        // Format the message and notify listeners
        const formattedMessage: Message = {
          id: message.id,
          sender: message.sender,
          content: message.content,
          timestamp: new Date(message.timestamp),
          isSelf: false
        };

        // Store the message
        chatStorageService.saveMessage(remoteUserId, formattedMessage);

        // Notify listeners
        this.notifyMessageReceived(formattedMessage);
      }
    });
  }

  /**
   * Send a message to a remote peer
   */
  sendMessage(remoteUserId: string, message: Omit<Message, 'isSelf'>): boolean {
    const peer = this.peers.get(remoteUserId);

    if (peer && peer.dataChannel && peer.dataChannel.readyState === 'open') {
      try {
        peer.dataChannel.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    } else {
      console.warn(`Cannot send message - data channel not open for ${remoteUserId}`);
      return false;
    }
  }

  /**
   * Close a peer connection
   */
  closePeerConnection(remoteUserId: string): void {
    const peer = this.peers.get(remoteUserId);
    if (peer) {
      if (peer.dataChannel) {
        peer.dataChannel.close();
      }
      peer.peerConnection.close();
      this.peers.delete(remoteUserId);
      this.notifyConnectionStateChange(remoteUserId, 'disconnected');
    }
  }

  /**
   * Close all peer connections
   */
  closeAllConnections(): void {
    this.peers.forEach((peer, userId) => {
      this.closePeerConnection(userId);
    });
  }

  /**
   * Register a callback for received messages
   */
  onMessage(callback: MessageCallback): void {
    this.messageCallbacks.push(callback);
  }

  /**
   * Register a callback for connection state changes
   */
  onConnectionStateChange(callback: ConnectionStateCallback): void {
    this.connectionStateCallbacks.push(callback);
  }

  /**
   * Check if connected to a specific peer
   */
  isConnectedToPeer(remoteUserId: string): boolean {
    const peer = this.peers.get(remoteUserId);
    return !!peer && peer.peerConnection.connectionState === 'connected';
  }

  /**
   * Get all connected peer IDs
   */
  getConnectedPeers(): string[] {
    const connectedPeers: string[] = [];
    this.peers.forEach((peer, userId) => {
      if (peer.peerConnection.connectionState === 'connected') {
        connectedPeers.push(userId);
      }
    });
    return connectedPeers;
  }

  /**
   * Notify all subscribers about a new message
   */
  private notifyMessageReceived(message: Message): void {
    this.messageCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in message callback:', error);
      }
    });
  }

  /**
   * Notify all subscribers about connection state changes
   */
  private notifyConnectionStateChange(userId: string, state: 'connected' | 'disconnected'): void {
    this.connectionStateCallbacks.forEach(callback => {
      try {
        callback(userId, state);
      } catch (error) {
        console.error('Error in connection state callback:', error);
      }
    });
  }
}

// Create singleton instance
const webRTCService = new WebRTCService();
export default webRTCService;
