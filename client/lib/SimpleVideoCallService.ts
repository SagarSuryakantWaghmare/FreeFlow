"use client";

import { SafeLocalStorage } from "./utils/SafeLocalStorage";

export interface VideoRoom {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  participants: VideoParticipant[];
  createdAt: Date;
  isActive: boolean;
}

export interface VideoParticipant {
  id: string;
  name: string;
  isOwner: boolean;
  videoStream?: MediaStream;
  audioStream?: MediaStream;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  peerConnection?: RTCPeerConnection;
}

export interface JoinRequest {
  userId: string;
  userName: string;
  roomId: string;
  timestamp: Date | number; // Can be either Date or number
}

class SimpleVideoCallService {
  private currentRoom: VideoRoom | null = null;
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private pendingJoinRequests: JoinRequest[] = [];
  private isInitialized: boolean = false;
  private pendingMessages: any[] = [];
  private wsConnected: boolean = false;

  // WebSocket connection (using existing service if available)
  private ws: WebSocket | null = null;

  private readonly iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];

  constructor() {
    // Don't auto-connect in constructor
  }

  // Initialize the service with user information
  initialize(userId: string, userName: string) {
    console.log('SimpleVideoCallService: Initialize called with:', { userId, userName });

    // Store user info for later use
    if (typeof window !== 'undefined') {
      SafeLocalStorage.setItem('userId', userId);
      SafeLocalStorage.setItem('username', userName);
    }

    // Don't initialize if already initialized and connected
    if (this.isInitialized && this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('SimpleVideoCallService: Already initialized and connected');
      return;
    }

    this.isInitialized = true;
    this.setupWebSocket();
  }

  private setupWebSocket() {
    // Use the same WebSocket URL as the main WebSocketService
    let backendUrl = "ws://localhost:8080/ws/p2p";

    console.log('SimpleVideoCallService: Attempting WebSocket connection to:', backendUrl);

    if (typeof window !== 'undefined') {
      try {
        this.ws = new WebSocket(backendUrl);
        this.ws.onopen = () => {
          console.log('SimpleVideoCallService: WebSocket connected successfully');
          this.wsConnected = true;

          // Send user_online message to register with the server
          this.sendUserOnline();

          // Flush any pending messages
          this.flushPendingMessages();
        };

        this.ws.onmessage = (event) => {
          console.log('SimpleVideoCallService: Received message:', event.data);
          this.handleWebSocketMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error('SimpleVideoCallService: WebSocket error:', error);
        }; this.ws.onclose = (event) => {
          console.log('SimpleVideoCallService: WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
          this.wsConnected = false;

          // Only attempt to reconnect if the service was properly initialized
          if (this.isInitialized) {
            console.log('SimpleVideoCallService: Attempting to reconnect in 3 seconds...');
            setTimeout(() => this.setupWebSocket(), 3000);
          }
        };
      } catch (error) {
        console.error('Failed to setup WebSocket:', error);
      }
    }
  }

  private handleWebSocketMessage(message: any) {
    switch (message.type) {
      case 'join_request':
        this.handleJoinRequest(message.data);
        break;
      case 'join_approved':
        this.handleJoinApproved(message.data);
        break;
      case 'join_rejected':
        this.handleJoinRejected(message.data);
        break;
      case 'user_joined':
        this.handleUserJoined(message.data);
        break;
      case 'user_left':
        this.handleUserLeft(message.data);
        break;
      case 'offer':
        this.handleOffer(message.data);
        break;
      case 'answer':
        this.handleAnswer(message.data);
        break;
      case 'ice_candidate':
        this.handleIceCandidate(message.data);
        break;
      case 'media_toggle':
        this.handleMediaToggle(message.data);
        break;
    }
  }

  // Event system
  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Media device management
  async getAvailableDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        videoDevices: devices.filter(device => device.kind === 'videoinput'),
        audioDevices: devices.filter(device => device.kind === 'audioinput'),
        audioOutputDevices: devices.filter(device => device.kind === 'audiooutput')
      };
    } catch (error) {
      console.error('Error getting devices:', error);
      return { videoDevices: [], audioDevices: [], audioOutputDevices: [] };
    }
  }

  async switchCamera(deviceId: string) {
    try {
      if (this.localStream) {
        // Stop current video track
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
        }

        // Get new video stream
        const newVideoStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } },
          audio: false
        });

        // Replace video track in local stream
        const newVideoTrack = newVideoStream.getVideoTracks()[0];
        this.localStream.removeTrack(videoTrack);
        this.localStream.addTrack(newVideoTrack);

        // Update all peer connections
        for (const [peerId, peerConnection] of this.peerConnections) {
          const sender = peerConnection.getSenders().find(s =>
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(newVideoTrack);
          }
        }

        this.emit('camera_switched', { deviceId });
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      throw error;
    }
  }

  async switchMicrophone(deviceId: string) {
    try {
      if (this.localStream) {
        // Stop current audio track
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.stop();
        }

        // Get new audio stream
        const newAudioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: { deviceId: { exact: deviceId } }
        });

        // Replace audio track in local stream
        const newAudioTrack = newAudioStream.getAudioTracks()[0];
        this.localStream.removeTrack(audioTrack);
        this.localStream.addTrack(newAudioTrack);

        // Update all peer connections
        for (const [peerId, peerConnection] of this.peerConnections) {
          const sender = peerConnection.getSenders().find(s =>
            s.track && s.track.kind === 'audio'
          );
          if (sender) {
            await sender.replaceTrack(newAudioTrack);
          }
        }

        this.emit('microphone_switched', { deviceId });
      }
    } catch (error) {
      console.error('Error switching microphone:', error);
      throw error;
    }
  }

  // Room management
  async createRoom(roomName: string, ownerId: string, ownerName: string): Promise<string> {
    const roomId = this.generateRoomId();

    const room: VideoRoom = {
      id: roomId,
      name: roomName,
      ownerId,
      ownerName,
      participants: [{
        id: ownerId,
        name: ownerName,
        isOwner: true,
        isVideoEnabled: true,
        isAudioEnabled: true
      }],
      createdAt: new Date(),
      isActive: true
    };

    this.currentRoom = room;

    // Get user media
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      this.emit('room_created', room);
      this.emit('local_stream', this.localStream);

      // Notify server about room creation
      this.sendWebSocketMessage({
        type: 'create_room',
        data: { roomId, roomName, ownerId, ownerName }
      });

      return roomId;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Could not access camera/microphone');
    }
  }

  async joinRoom(roomId: string, userId: string, userName: string): Promise<void> {
    try {
      // Request to join room
      this.sendWebSocketMessage({
        type: 'request_join',
        data: { roomId, userId, userName }
      });

      this.emit('join_request_sent', { roomId });
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  // Owner controls
  approveJoinRequest(requestId: string, userId: string) {
    if (!this.currentRoom || !this.isOwner()) {
      throw new Error('Only room owner can approve join requests');
    }

    this.sendWebSocketMessage({
      type: 'approve_join',
      data: { roomId: this.currentRoom.id, userId, requestId }
    });

    // Remove from pending requests
    this.pendingJoinRequests = this.pendingJoinRequests.filter(
      req => req.userId !== userId
    );

    this.emit('join_request_approved', { userId });
  }

  rejectJoinRequest(requestId: string, userId: string) {
    if (!this.currentRoom || !this.isOwner()) {
      throw new Error('Only room owner can reject join requests');
    }

    this.sendWebSocketMessage({
      type: 'reject_join',
      data: { roomId: this.currentRoom.id, userId, requestId }
    });

    // Remove from pending requests
    this.pendingJoinRequests = this.pendingJoinRequests.filter(
      req => req.userId !== userId
    );

    this.emit('join_request_rejected', { userId });
  }

  removeParticipant(userId: string) {
    if (!this.currentRoom || !this.isOwner()) {
      throw new Error('Only room owner can remove participants');
    }

    this.sendWebSocketMessage({
      type: 'remove_participant',
      data: { roomId: this.currentRoom.id, userId }
    });
  }

  // Media controls
  toggleVideo() {
    if (this.localStream && this.currentRoom) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;

        const participant = this.currentRoom.participants.find(p => p.id === this.getCurrentUserId());
        if (participant) {
          participant.isVideoEnabled = videoTrack.enabled;
        }

        this.sendWebSocketMessage({
          type: 'toggle_media',
          data: {
            roomId: this.currentRoom.id,
            userId: this.getCurrentUserId(),
            mediaType: 'video',
            enabled: videoTrack.enabled
          }
        });

        this.emit('video_toggled', { enabled: videoTrack.enabled });
      }
    }
  }
  toggleAudio() {
    if (this.localStream && this.currentRoom) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;

        const participant = this.currentRoom.participants.find(p => p.id === this.getCurrentUserId());
        if (participant) {
          participant.isAudioEnabled = audioTrack.enabled;
        }

        this.sendWebSocketMessage({
          type: 'toggle_media',
          data: {
            roomId: this.currentRoom.id,
            userId: this.getCurrentUserId(),
            mediaType: 'audio',
            enabled: audioTrack.enabled
          }
        });

        this.emit('audio_toggled', { enabled: audioTrack.enabled });
      }
    }
  }

  // WebRTC handling
  private async createPeerConnection(participantId: string): Promise<RTCPeerConnection> {
    // Check if peer connection already exists
    const existingConnection = this.peerConnections.get(participantId);
    if (existingConnection && existingConnection.connectionState !== 'closed' && existingConnection.connectionState !== 'failed') {
      console.log('SimpleVideoCallService: Reusing existing peer connection for', participantId, 'state:', existingConnection.connectionState);
      return existingConnection;
    }

    console.log('SimpleVideoCallService: Creating new peer connection for', participantId);
    const peerConnection = new RTCPeerConnection({ iceServers: this.iceServers });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendWebSocketMessage({
          type: 'ice_candidate',
          data: {
            roomId: this.currentRoom?.id,
            targetId: participantId,
            fromId: this.getCurrentUserId(),
            candidate: event.candidate
          }
        });
      }
    };

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      console.log('SimpleVideoCallService: Received remote stream from', participantId);
      console.log('SimpleVideoCallService: Remote stream tracks:', remoteStream.getTracks().map(t => t.kind));
      this.emit('remote_stream', { participantId, stream: remoteStream });
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('SimpleVideoCallService: Connection state changed for', participantId, ':', peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
        console.warn('SimpleVideoCallService: Peer connection failed for', participantId);
        // Optionally try to reconnect or clean up
        setTimeout(() => {
          if (peerConnection.connectionState === 'failed') {
            console.log('SimpleVideoCallService: Removing failed peer connection for', participantId);
            this.peerConnections.delete(participantId);
          }
        }, 5000);
      }
    };

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
        console.log('SimpleVideoCallService: Added', track.kind, 'track to peer connection for', participantId);
      });
      console.log('SimpleVideoCallService: Added local stream tracks to peer connection for', participantId);
    } else {
      console.warn('SimpleVideoCallService: No local stream available when creating peer connection for', participantId);
    }

    this.peerConnections.set(participantId, peerConnection);
    return peerConnection;
  }

  // WebSocket message handlers
  private handleJoinRequest(data: any) {
    console.log('SimpleVideoCallService: Received join request data:', data);

    if (this.isOwner()) {
      // Convert timestamp from number to Date object
      const joinRequest: JoinRequest = {
        userId: data.userId,
        userName: data.userName,
        roomId: data.roomId,
        timestamp: new Date(data.timestamp) // Convert number to Date
      };

      console.log('SimpleVideoCallService: Processed join request:', joinRequest);
      this.pendingJoinRequests.push(joinRequest);
      this.emit('join_request_received', joinRequest);
    } else {
      console.log('SimpleVideoCallService: Not room owner, ignoring join request');
    }
  }

  private async handleJoinApproved(data: any) {
    // User was approved to join, now get media and setup peer connections
    try {
      // Set current room data
      this.currentRoom = {
        id: data.roomId,
        name: data.roomName || data.roomId,
        ownerId: data.ownerId || '',
        ownerName: data.ownerName || '',
        participants: [],
        isActive: true,
        createdAt: new Date()
      };

      // Add existing participants to the room
      if (data.existingParticipants && Array.isArray(data.existingParticipants)) {
        for (const participant of data.existingParticipants) {
          const videoParticipant: VideoParticipant = {
            id: participant.userId,
            name: participant.userName,
            isOwner: participant.isOwner || false,
            isVideoEnabled: true,
            isAudioEnabled: true
          };
          this.currentRoom.participants.push(videoParticipant);
        }
        console.log('SimpleVideoCallService: Added', data.existingParticipants.length, 'existing participants to room');
      }

      // Add ourselves to the participants list
      const currentUserId = this.getCurrentUserId();
      const currentUserName = SafeLocalStorage.getItem('username') || 'Unknown';
      const selfParticipant: VideoParticipant = {
        id: currentUserId,
        name: currentUserName,
        isOwner: false,
        isVideoEnabled: true,
        isAudioEnabled: true
      };
      this.currentRoom.participants.push(selfParticipant);

      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // Pre-create peer connections for existing participants
      // They will send us offers which we'll handle in handleOffer
      if (data.existingParticipants && Array.isArray(data.existingParticipants)) {
        for (const participant of data.existingParticipants) {
          console.log('SimpleVideoCallService: Pre-creating peer connection for existing participant:', participant.userId);
          await this.createPeerConnection(participant.userId);
        }
      }

      this.emit('join_approved', data);
      this.emit('local_stream', this.localStream);
    } catch (error) {
      console.error('Error accessing media after approval:', error);
      this.emit('join_error', { error: 'Could not access camera/microphone' });
    }
  }

  private handleJoinRejected(data: any) {
    this.emit('join_rejected', data);
  } private async handleUserJoined(data: any) {
    if (this.currentRoom) {
      const currentUserId = this.getCurrentUserId();

      // If this is about us joining, we already handled this in handleJoinApproved
      if (data.userId === currentUserId) {
        console.log('SimpleVideoCallService: Ignoring user_joined for self (already handled in join_approved)');
        return;
      }

      const newParticipant: VideoParticipant = {
        id: data.userId,
        name: data.userName,
        isOwner: false,
        isVideoEnabled: true,
        isAudioEnabled: true
      };

      // Only add to participants if not already present
      const existingParticipant = this.currentRoom.participants.find(p => p.id === data.userId);
      if (!existingParticipant) {
        this.currentRoom.participants.push(newParticipant);
        console.log('SimpleVideoCallService: Added new participant:', data.userName);
      } else {
        console.log('SimpleVideoCallService: Participant already exists:', data.userName);
      }

      // Only existing users should create offers for the new user
      // The new user will receive these offers and create answers
      console.log('SimpleVideoCallService: Existing user creating offer for new participant:', data.userId);
      try {
        // Create peer connection for new user
        const peerConnection = await this.createPeerConnection(data.userId);

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        this.sendWebSocketMessage({
          type: 'offer',
          data: {
            roomId: this.currentRoom.id,
            targetId: data.userId,
            fromId: currentUserId,
            offer
          }
        });

        console.log('SimpleVideoCallService: Sent offer to new participant:', data.userId);
      } catch (error) {
        console.error('SimpleVideoCallService: Error creating offer for new participant:', error);
      }

      this.emit('user_joined', { participant: newParticipant });
    }
  }
  private handleUserLeft(data: any) {
    if (this.currentRoom) {
      console.log('SimpleVideoCallService: User left:', data.userId);

      // Remove from participants list
      this.currentRoom.participants = this.currentRoom.participants.filter(
        p => p.id !== data.userId
      );

      // Clean up peer connection and close all streams
      const peerConnection = this.peerConnections.get(data.userId);
      if (peerConnection) {
        console.log('SimpleVideoCallService: Closing peer connection for:', data.userId);

        // Close all remote tracks/streams
        peerConnection.getReceivers().forEach(receiver => {
          if (receiver.track) {
            receiver.track.stop();
          }
        });

        peerConnection.close();
        this.peerConnections.delete(data.userId);
      }

      this.emit('user_left', { userId: data.userId });
    }
  }

  private async handleOffer(data: any) {
    console.log('SimpleVideoCallService: Received offer from', data.fromId);
    console.log('SimpleVideoCallService: Local stream available:', !!this.localStream);

    // Ensure we have a local stream before creating peer connection
    if (!this.localStream) {
      console.warn('SimpleVideoCallService: No local stream available when receiving offer, attempting to get media');
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        this.emit('local_stream', this.localStream);
      } catch (error) {
        console.error('SimpleVideoCallService: Failed to get local media when receiving offer:', error);
        return; // Can't proceed without local media
      }
    }

    // Get or create peer connection for the sender
    let peerConnection = this.peerConnections.get(data.fromId);
    if (!peerConnection) {
      console.log('SimpleVideoCallService: Creating new peer connection for offer from', data.fromId);
      peerConnection = await this.createPeerConnection(data.fromId);
    } else {
      console.log('SimpleVideoCallService: Using existing peer connection for offer from', data.fromId);
    }

    try {
      await peerConnection.setRemoteDescription(data.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      console.log('SimpleVideoCallService: Created answer, sending to', data.fromId);

      this.sendWebSocketMessage({
        type: 'answer',
        data: {
          roomId: this.currentRoom?.id,
          targetId: data.fromId,
          fromId: this.getCurrentUserId(),
          answer
        }
      });
    } catch (error) {
      console.error('SimpleVideoCallService: Error handling offer from', data.fromId, ':', error);
    }
  }

  private async handleAnswer(data: any) {
    const peerConnection = this.peerConnections.get(data.fromId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(data.answer);
    }
  }
  private async handleIceCandidate(data: any) {
    const peerConnection = this.peerConnections.get(data.fromId);
    if (peerConnection && peerConnection.remoteDescription) {
      try {
        await peerConnection.addIceCandidate(data.candidate);
        console.log('SimpleVideoCallService: Added ICE candidate from', data.fromId);
      } catch (error) {
        console.error('SimpleVideoCallService: Error adding ICE candidate from', data.fromId, ':', error);
      }
    } else {
      console.warn('SimpleVideoCallService: Cannot add ICE candidate from', data.fromId, '- no peer connection or remote description not set');
    }
  }

  private handleMediaToggle(data: any) {
    if (this.currentRoom) {
      const participant = this.currentRoom.participants.find(p => p.id === data.userId);
      if (participant) {
        if (data.mediaType === 'video') {
          participant.isVideoEnabled = data.enabled;
        } else if (data.mediaType === 'audio') {
          participant.isAudioEnabled = data.enabled;
        }
        this.emit('participant_media_toggled', { participantId: data.userId, mediaType: data.mediaType, enabled: data.enabled });
      }
    }
  }

  // Utility methods
  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  } private sendWebSocketMessage(message: any) {
    console.log('SimpleVideoCallService: Attempting to send message:', message);
    console.log('SimpleVideoCallService: WebSocket ready state:', this.ws?.readyState);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const messageStr = JSON.stringify(message);
      console.log('SimpleVideoCallService: Sending WebSocket message:', messageStr);
      this.ws.send(messageStr);
    } else {
      console.error('SimpleVideoCallService: Cannot send message - WebSocket not ready. State:', this.ws?.readyState);
      console.log('SimpleVideoCallService: Queuing message for later:', message);
      this.pendingMessages.push(message);
    }
  }

  private flushPendingMessages() {
    console.log('SimpleVideoCallService: Flushing', this.pendingMessages.length, 'pending messages');
    const messages = [...this.pendingMessages];
    this.pendingMessages = [];

    messages.forEach(message => {
      this.sendWebSocketMessage(message);
    });
  } private sendUserOnline() {
    // Get user info from SafeLocalStorage (set by the video call page)
    const userId = typeof window !== 'undefined' ? SafeLocalStorage.getItem('userId') : null;
    const userName = typeof window !== 'undefined' ? SafeLocalStorage.getItem('username') : null;

    console.log('SimpleVideoCallService: Attempting to send user_online with:', { userId, userName });
    console.log('SimpleVideoCallService: WebSocket state:', this.ws?.readyState);

    if (userId && userName) {
      const message = {
        type: 'user_online',
        userId: userId,
        userName: userName
      };

      console.log('SimpleVideoCallService: Sending user_online message:', message);
      this.sendWebSocketMessage(message);
    } else {
      console.error('SimpleVideoCallService: Cannot send user_online - missing userId or userName:', { userId, userName });
    }
  }

  getCurrentUserId(): string {
    // Get from SafeLocalStorage or return a generated ID
    return SafeLocalStorage.getItem('userId') || 'anonymous';
  }

  private isOwner(): boolean {
    return this.currentRoom?.ownerId === this.getCurrentUserId();
  }

  // Debug methods
  getConnectionStatus() {
    return {
      isInitialized: this.isInitialized,
      websocketState: this.ws?.readyState,
      websocketStateString: this.ws?.readyState === WebSocket.CONNECTING ? 'CONNECTING' :
        this.ws?.readyState === WebSocket.OPEN ? 'OPEN' :
          this.ws?.readyState === WebSocket.CLOSING ? 'CLOSING' :
            this.ws?.readyState === WebSocket.CLOSED ? 'CLOSED' : 'UNKNOWN'
    };
  }

  testConnection() {
    console.log('SimpleVideoCallService: Connection Status:', this.getConnectionStatus());
    const userData = typeof window !== 'undefined' ? {
      userId: SafeLocalStorage.getItem('userId'),
      username: SafeLocalStorage.getItem('username')
    } : null;
    console.log('SimpleVideoCallService: User Data:', userData);
  }

  // Public getters
  getCurrentRoom(): VideoRoom | null {
    return this.currentRoom;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getPendingJoinRequests(): JoinRequest[] {
    return this.pendingJoinRequests;
  }

  isRoomOwner(): boolean {
    return this.isOwner();
  }

  // Cleanup
  leaveRoom() {
    if (this.currentRoom) {
      this.sendWebSocketMessage({
        type: 'leave_room',
        data: { roomId: this.currentRoom.id }
      });
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close all peer connections
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    this.currentRoom = null;
    this.pendingJoinRequests = [];

    this.emit('room_left');
  }

  destroy() {
    this.leaveRoom();
    if (this.ws) {
      this.ws.close();
    }
    this.eventListeners.clear();
  }
}

// Create singleton instance
const simpleVideoCallService = new SimpleVideoCallService();
export default simpleVideoCallService;
