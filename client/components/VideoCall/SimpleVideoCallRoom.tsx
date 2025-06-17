"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  Users,
  UserCheck,
  UserX,
  Camera,
  Monitor
} from 'lucide-react';
import simpleVideoCallService, { VideoRoom, VideoParticipant, JoinRequest } from '@/lib/SimpleVideoCallService';

interface VideoCallRoomProps {
  room: VideoRoom;
  onLeave: () => void;
}

const VideoCallRoom: React.FC<VideoCallRoomProps> = ({ room, onLeave }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [participants, setParticipants] = useState<VideoParticipant[]>(room.participants);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<{
    videoDevices: MediaDeviceInfo[];
    audioDevices: MediaDeviceInfo[];
    audioOutputDevices: MediaDeviceInfo[];
  }>({ videoDevices: [], audioDevices: [], audioOutputDevices: [] });
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    // Set up event listeners
    const handleLocalStream = (stream: MediaStream) => {
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    };    const handleRemoteStream = ({ participantId, stream }: { participantId: string; stream: MediaStream }) => {
      console.log('VideoCallRoom: Received remote stream from participant:', participantId);
      console.log('VideoCallRoom: Stream tracks:', stream.getTracks().map(t => t.kind + ' - ' + t.id));
      
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(participantId, stream);
        console.log('VideoCallRoom: Total remote streams now:', newMap.size);
        return newMap;
      });
    };    const handleUserJoined = ({ participant }: { participant: VideoParticipant }) => {
      console.log('VideoCallRoom: New participant joined:', participant.name, 'ID:', participant.id);
      setParticipants(prev => {
        // Check if participant already exists to prevent duplicates
        const exists = prev.some(p => p.id === participant.id);
        if (exists) {
          console.log('VideoCallRoom: Participant already exists, ignoring duplicate:', participant.name);
          return prev;
        }
        const updated = [...prev, participant];
        console.log('VideoCallRoom: Total participants now:', updated.length);
        return updated;
      });
    };const handleUserLeft = ({ userId }: { userId: string }) => {
      console.log('VideoCallRoom: User left, cleaning up:', userId);
      
      setParticipants(prev => prev.filter(p => p.id !== userId));
      
      // Clean up remote stream and stop tracks
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        const stream = newMap.get(userId);
        if (stream) {
          // Stop all tracks in the stream
          stream.getTracks().forEach(track => {
            track.stop();
          });
        }
        newMap.delete(userId);
        return newMap;
      });
      
      // Clean up video element reference and clear srcObject
      const videoElement = remoteVideoRefs.current.get(userId);
      if (videoElement) {
        // Clear the video source to remove any paused frame
        videoElement.srcObject = null;
        videoElement.load(); // Force the video element to reload/clear
        remoteVideoRefs.current.delete(userId);
      }
      
      console.log('VideoCallRoom: Cleanup completed for user:', userId);
    };    const handleJoinRequestReceived = (request: JoinRequest) => {
      console.log('VideoCallRoom: Received join request from:', request.userName);
      console.log('VideoCallRoom: Request details:', request);
      console.log('VideoCallRoom: Current pending requests before:', pendingRequests);
      console.log('VideoCallRoom: Is room owner?', simpleVideoCallService.isRoomOwner());
      
      setPendingRequests(prev => {
        // Temporarily disable duplicate check to debug
        console.log('VideoCallRoom: Adding join request for:', request.userName);
        const updated = [...prev, request];
        console.log('VideoCallRoom: Updated pending requests:', updated);
        return updated;
      });
    };

    const handleVideoToggled = ({ enabled }: { enabled: boolean }) => {
      setIsVideoEnabled(enabled);
    };

    const handleAudioToggled = ({ enabled }: { enabled: boolean }) => {
      setIsAudioEnabled(enabled);
    };

    const handleParticipantMediaToggled = ({ participantId, mediaType, enabled }: { 
      participantId: string; 
      mediaType: string; 
      enabled: boolean; 
    }) => {
      setParticipants(prev => prev.map(p => {
        if (p.id === participantId) {
          return {
            ...p,
            [mediaType === 'video' ? 'isVideoEnabled' : 'isAudioEnabled']: enabled
          };
        }
        return p;
      }));
    };

    // Add event listeners
    simpleVideoCallService.addEventListener('local_stream', handleLocalStream);
    simpleVideoCallService.addEventListener('remote_stream', handleRemoteStream);
    simpleVideoCallService.addEventListener('user_joined', handleUserJoined);
    simpleVideoCallService.addEventListener('user_left', handleUserLeft);
    simpleVideoCallService.addEventListener('join_request_received', handleJoinRequestReceived);
    simpleVideoCallService.addEventListener('video_toggled', handleVideoToggled);
    simpleVideoCallService.addEventListener('audio_toggled', handleAudioToggled);
    simpleVideoCallService.addEventListener('participant_media_toggled', handleParticipantMediaToggled);

    // Get initial local stream if available
    const existingStream = simpleVideoCallService.getLocalStream();
    if (existingStream) {
      handleLocalStream(existingStream);
    }

    // Get pending requests if owner
    if (simpleVideoCallService.isRoomOwner()) {
      setPendingRequests(simpleVideoCallService.getPendingJoinRequests());
    }

    // Load available devices
    loadAvailableDevices();

    return () => {
      // Remove event listeners
      simpleVideoCallService.removeEventListener('local_stream', handleLocalStream);
      simpleVideoCallService.removeEventListener('remote_stream', handleRemoteStream);
      simpleVideoCallService.removeEventListener('user_joined', handleUserJoined);
      simpleVideoCallService.removeEventListener('user_left', handleUserLeft);
      simpleVideoCallService.removeEventListener('join_request_received', handleJoinRequestReceived);
      simpleVideoCallService.removeEventListener('video_toggled', handleVideoToggled);
      simpleVideoCallService.removeEventListener('audio_toggled', handleAudioToggled);
      simpleVideoCallService.removeEventListener('participant_media_toggled', handleParticipantMediaToggled);
    };
  }, []);

  useEffect(() => {
    // Update video elements when remote streams change
    remoteStreams.forEach((stream, participantId) => {
      const videoElement = remoteVideoRefs.current.get(participantId);
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  const loadAvailableDevices = async () => {
    try {
      const devices = await simpleVideoCallService.getAvailableDevices();
      setAvailableDevices(devices);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const handleToggleVideo = () => {
    simpleVideoCallService.toggleVideo();
  };

  const handleToggleAudio = () => {
    simpleVideoCallService.toggleAudio();
  };

  const handleLeaveRoom = () => {
    simpleVideoCallService.leaveRoom();
    onLeave();
  };
  const handleApproveJoinRequest = (request: JoinRequest) => {
    // Handle both Date object and number timestamp
    const timestampId = request.timestamp instanceof Date 
      ? request.timestamp.getTime().toString()
      : request.timestamp.toString();
    
    simpleVideoCallService.approveJoinRequest(timestampId, request.userId);
    setPendingRequests(prev => prev.filter(r => r.userId !== request.userId));
  };

  const handleRejectJoinRequest = (request: JoinRequest) => {
    // Handle both Date object and number timestamp
    const timestampId = request.timestamp instanceof Date 
      ? request.timestamp.getTime().toString()
      : request.timestamp.toString();
    
    simpleVideoCallService.rejectJoinRequest(timestampId, request.userId);
    setPendingRequests(prev => prev.filter(r => r.userId !== request.userId));
  };

  const handleSwitchCamera = async (deviceId: string) => {
    try {
      await simpleVideoCallService.switchCamera(deviceId);
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  const handleSwitchMicrophone = async (deviceId: string) => {
    try {
      await simpleVideoCallService.switchMicrophone(deviceId);
    } catch (error) {
      console.error('Error switching microphone:', error);
    }
  };
  return (
    <div className="video-call-room h-screen bg-gray-900 text-white flex flex-col">      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          top: '90px', 
          left: '10px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '5px', 
          zIndex: 9999,
          fontSize: '12px',
          maxWidth: '300px'
        }}>          <div><strong>Debug Info:</strong></div>
          <div>Participants: {participants.length}</div>
          <div>Remote Streams: {remoteStreams.size}</div>
          <div>Local Stream: {localStream ? 'Yes' : 'No'}</div>
          <div>Is Owner: {simpleVideoCallService.isRoomOwner() ? 'Yes' : 'No'}</div>
          <div>Pending Requests: {pendingRequests.length}</div>
          <div style={{ maxHeight: '100px', overflow: 'auto' }}>
            <strong>Participants:</strong>
            {participants.map(p => (
              <div key={p.id} style={{ fontSize: '10px' }}>
                • {p.name} ({p.id.slice(0, 8)}...)
              </div>
            ))}
          </div>          <div style={{ maxHeight: '100px', overflow: 'auto' }}>
            <strong>Remote Streams:</strong>
            {Array.from(remoteStreams.keys()).map(id => (
              <div key={id} style={{ fontSize: '10px' }}>
                • {id.slice(0, 8)}...
              </div>
            ))}
          </div>
          <div style={{ maxHeight: '100px', overflow: 'auto' }}>
            <strong>Pending Requests:</strong>
            {pendingRequests.map(req => (
              <div key={req.userId} style={{ fontSize: '10px' }}>
                • {req.userName} ({req.userId.slice(0, 8)}...)
              </div>
            ))}
          </div>
        </div>
      )}
        {/* Header with Controls */}
      <div className="fixed top-0 left-0 right-0 bg-gray-800 p-4 flex justify-between items-center z-50 shadow-lg">
        <div>
          <h2 className="text-xl font-bold">{room.name}</h2>
          <p className="text-sm text-gray-400">Room ID: {room.id}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users size={16} />
            {participants.length}
          </Badge>
          {simpleVideoCallService.isRoomOwner() && (
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              Owner
            </Badge>
          )}
          
          {/* Video Chat Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="sm"
              onClick={handleToggleAudio}
              className="rounded-full w-10 h-10"
            >
              {isAudioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
            </Button>

            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="sm"
              onClick={handleToggleVideo}
              className="rounded-full w-10 h-10"
            >
              {isVideoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-full w-10 h-10"
            >
              <Settings size={16} />
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLeaveRoom}
              className="rounded-full w-10 h-10"
            >
              <PhoneOff size={16} />
            </Button>
          </div>
        </div>
      </div>      {/* Join Requests (Only for room owner) */}
      {(() => {
        const isOwner = simpleVideoCallService.isRoomOwner();
        const hasRequests = pendingRequests.length > 0;
        console.log('VideoCallRoom Render: Is Owner?', isOwner, 'Has Requests?', hasRequests, 'Request Count:', pendingRequests.length);
        console.log('VideoCallRoom Render: Pending requests:', pendingRequests);
        
        if (isOwner && hasRequests) {
          return (
            <div className="fixed top-24 left-0 right-0 bg-yellow-600 border-b border-yellow-500 p-4 z-40 shadow-lg">
              <h3 className="font-semibold mb-3 text-black">🔔 Pending Join Requests ({pendingRequests.length}):</h3>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={`${request.userId}-${request.timestamp}`} className="flex items-center justify-between bg-yellow-700 p-3 rounded-lg shadow">
                    <span className="font-medium text-white">{request.userName} wants to join the room</span>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black font-medium"
                        onClick={() => handleApproveJoinRequest(request)}
                      >
                        <UserCheck size={16} />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-red-400 hover:bg-red-400 hover:text-black font-medium"
                        onClick={() => handleRejectJoinRequest(request)}
                      >
                        <UserX size={16} />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })()}{/* Video Grid */}
      <div className="flex-1 p-4" style={{ 
        marginTop: simpleVideoCallService.isRoomOwner() && pendingRequests.length > 0 ? '200px' : '96px' 
      }}>
        <div className={`grid gap-4 h-full ${
          participants.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
          participants.length <= 4 ? 'grid-cols-2' :
          'grid-cols-2 md:grid-cols-3'
        }`}>
          {/* Local Video */}
          <Card className="relative bg-gray-800 border-gray-700 overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
              You {!isVideoEnabled && '(Video Off)'}
            </div>
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                <VideoOff size={48} className="text-gray-400" />
              </div>
            )}
          </Card>          {/* Remote Videos */}
          {participants
            .filter(p => p.id !== simpleVideoCallService.getCurrentUserId())
            .map((participant) => (
            <Card key={`participant-${participant.id}`} className="relative bg-gray-800 border-gray-700 overflow-hidden">
              <video
                ref={(el) => {
                  if (el) {
                    remoteVideoRefs.current.set(participant.id, el);
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm flex items-center gap-1">
                {participant.name}
                {!participant.isAudioEnabled && <MicOff size={14} />}
                {participant.isOwner && <Badge variant="outline" className="text-xs">Owner</Badge>}
              </div>
              {!participant.isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                  <VideoOff size={48} className="text-gray-400" />
                </div>
              )}
            </Card>
          ))}        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-24 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 w-80 z-50">
          <h3 className="font-semibold mb-4">Device Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Camera</label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                onChange={(e) => handleSwitchCamera(e.target.value)}
              >
                {availableDevices.videoDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Microphone</label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                onChange={(e) => handleSwitchMicrophone(e.target.value)}
              >
                {availableDevices.audioDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(false)}
            className="mt-4 w-full"
          >
            Close Settings
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoCallRoom;
