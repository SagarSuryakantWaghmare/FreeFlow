"use client";

import webSocketService from "./WebSocketService";

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
  private mockMode = false;
  private mockConnections: Set<string> = new Set();
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
    
    // Check if we need to use mock mode (for development)
    if (process.env.NODE_ENV === 'development' && (!webSocketService.isConnected || webSocketService.isConnected() === false)) {
      console.log("Using WebRTC mock mode for development (WebSocket is not connected)");
      this.mockMode = true;
    }
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
  }
  /**
   * Initiate a connection with another user
   */
  requestConnection(remoteUserId: string): void {
    if (!this.localUserId) {
      console.error("Local user ID not set. Call initialize first.");
      return;
    }
    
    // Handle mock mode
    if (this.mockMode) {
      // Add the user to mock connections and notify about connection
      setTimeout(() => {
        console.log(`Mock mode: Simulating connection to ${remoteUserId}`);
        this.mockConnections.add(remoteUserId);
        this.notifyConnectionStateChange(remoteUserId, 'connected');
      }, 1000);
      return;
    }

    webSocketService.sendMessage({
      type: 'connection_request',
      fromUserId: this.localUserId,
      toUserId: remoteUserId
    });
  }

  /**
   * Handle incoming connection request
   */
  private handleConnectionRequest(data: any): void {
    if (!this.localUserId) return;

    // Accept the connection request automatically
    webSocketService.sendMessage({
      type: 'connection_accepted',
      fromUserId: this.localUserId,
      toUserId: data.fromUserId
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
    });

    peerConnection.addEventListener('connectionstatechange', () => {
      if (peerConnection.connectionState === 'connected') {
        this.notifyConnectionStateChange(remoteUserId, 'connected');
      } else if (['disconnected', 'failed', 'closed'].includes(peerConnection.connectionState)) {
        this.notifyConnectionStateChange(remoteUserId, 'disconnected');
      }
    });

    return peerConnection;
  }

  /**
   * Set up a data channel for messaging
   */
  private setupDataChannel(remoteUserId: string, dataChannel: RTCDataChannel): void {
    dataChannel.addEventListener('open', () => {
      console.log(`Data channel opened with ${remoteUserId}`);
      this.notifyConnectionStateChange(remoteUserId, 'connected');
    });

    dataChannel.addEventListener('close', () => {
      console.log(`Data channel closed with ${remoteUserId}`);
      this.notifyConnectionStateChange(remoteUserId, 'disconnected');
    });

    dataChannel.addEventListener('message', event => {
      try {
        const message = JSON.parse(event.data);
        const formattedMessage: Message = {
          id: message.id,
          sender: message.sender,
          content: message.content,
          timestamp: new Date(message.timestamp),
          isSelf: false
        };
        this.notifyMessageReceived(formattedMessage);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
  }
  /**
   * Send a message to a remote peer
   */
  sendMessage(remoteUserId: string, message: Omit<Message, 'isSelf'>): boolean {
    // Handle mock mode for local testing without WebSocket server
    if (this.mockMode) {
      console.log(`Mock mode: Would send message to ${remoteUserId}:`, message);
      // Add user to mock connections if not already there
      if (!this.mockConnections.has(remoteUserId)) {
        this.mockConnections.add(remoteUserId);
        this.notifyConnectionStateChange(remoteUserId, 'connected');
      }
      
      // Echo the message back after a delay to simulate a response
      setTimeout(() => {
        this.notifyMessageReceived({
          id: `mock-${Date.now()}`,
          sender: remoteUserId,
          content: `Reply to: ${message.content}`,
          timestamp: new Date(),
          isSelf: false
        });
      }, 1000);
      
      return true;
    }
    
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
    // For mock mode, check the mock connections set
    if (this.mockMode) {
      return this.mockConnections.has(remoteUserId);
    }
    
    const peer = this.peers.get(remoteUserId);
    return !!peer && peer.peerConnection.connectionState === 'connected';
  }

  /**
   * Get all connected peer IDs
   */
  getConnectedPeers(): string[] {
    // For mock mode, return all mock connections
    if (this.mockMode) {
      return Array.from(this.mockConnections);
    }
    
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
    if (state === 'connected' && this.mockMode) {
      this.mockConnections.add(userId);
    } else if (state === 'disconnected' && this.mockMode) {
      this.mockConnections.delete(userId);
    }
    
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
