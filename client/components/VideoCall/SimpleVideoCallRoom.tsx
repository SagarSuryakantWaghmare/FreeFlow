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
    };

    const handleRemoteStream = ({ participantId, stream }: { participantId: string; stream: MediaStream }) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(participantId, stream);
        return newMap;
      });
    };

    const handleUserJoined = ({ participant }: { participant: VideoParticipant }) => {
      setParticipants(prev => [...prev, participant]);
    };

    const handleUserLeft = ({ userId }: { userId: string }) => {
      setParticipants(prev => prev.filter(p => p.id !== userId));
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    };

    const handleJoinRequestReceived = (request: JoinRequest) => {
      setPendingRequests(prev => [...prev, request]);
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
    simpleVideoCallService.approveJoinRequest(request.timestamp.getTime().toString(), request.userId);
    setPendingRequests(prev => prev.filter(r => r.userId !== request.userId));
  };

  const handleRejectJoinRequest = (request: JoinRequest) => {
    simpleVideoCallService.rejectJoinRequest(request.timestamp.getTime().toString(), request.userId);
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
    <div className="video-call-room h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
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
        </div>
      </div>

      {/* Join Requests (Only for room owner) */}
      {simpleVideoCallService.isRoomOwner() && pendingRequests.length > 0 && (
        <div className="bg-yellow-900 border-b border-yellow-700 p-3">
          <h3 className="font-semibold mb-2">Pending Join Requests:</h3>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div key={request.userId} className="flex items-center justify-between bg-yellow-800 p-2 rounded">
                <span>{request.userName} wants to join</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black"
                    onClick={() => handleApproveJoinRequest(request)}
                  >
                    <UserCheck size={16} />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-black"
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
      )}

      {/* Video Grid */}
      <div className="flex-1 p-4">
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
          </Card>

          {/* Remote Videos */}
          {participants
            .filter(p => p.id !== simpleVideoCallService.getCurrentRoom()?.ownerId || !simpleVideoCallService.isRoomOwner())
            .map((participant) => (
            <Card key={participant.id} className="relative bg-gray-800 border-gray-700 overflow-hidden">
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
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center items-center gap-4">
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="lg"
          onClick={handleToggleAudio}
          className="rounded-full w-12 h-12"
        >
          {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </Button>

        <Button
          variant={isVideoEnabled ? "default" : "destructive"}
          size="lg"
          onClick={handleToggleVideo}
          className="rounded-full w-12 h-12"
        >
          {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-full w-12 h-12"
        >
          <Settings size={20} />
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={handleLeaveRoom}
          className="rounded-full w-12 h-12"
        >
          <PhoneOff size={20} />
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute bottom-20 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 w-80">
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
