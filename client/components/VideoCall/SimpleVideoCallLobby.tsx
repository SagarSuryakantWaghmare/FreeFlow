"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Users,
  Plus,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import simpleVideoCallService from '@/lib/SimpleVideoCallService';

interface VideoCallLobbyProps {
  onRoomCreated: (roomId: string) => void;
  onRoomJoined: (roomId: string) => void;
  userId: string;
  userName: string;
}

const VideoCallLobby: React.FC<VideoCallLobbyProps> = ({
  onRoomCreated,
  onRoomJoined,
  userId,
  userName
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [roomName, setRoomName] = useState('');
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [joinStatus, setJoinStatus] = useState<'idle' | 'requesting' | 'approved' | 'rejected'>('idle');

  useEffect(() => {
    // Set up event listeners for join process
    const handleJoinApproved = () => {
      setJoinStatus('approved');
      setSuccess('Join request approved! You can now enter the room.');
      setIsLoading(false);
    };

    const handleJoinRejected = () => {
      setJoinStatus('rejected');
      setError('Join request was rejected by the room owner.');
      setIsLoading(false);
    };

    const handleJoinError = ({ error }: { error: string }) => {
      setError(error);
      setIsLoading(false);
      setJoinStatus('idle');
    };

    const handleRoomCreated = () => {
      setSuccess('Room created successfully!');
      setIsLoading(false);
    };

    const handleJoinRequestSent = () => {
      setJoinStatus('requesting');
      setSuccess('Join request sent! Waiting for room owner approval...');
    };

    // Add event listeners
    simpleVideoCallService.addEventListener('join_approved', handleJoinApproved);
    simpleVideoCallService.addEventListener('join_rejected', handleJoinRejected);
    simpleVideoCallService.addEventListener('join_error', handleJoinError);
    simpleVideoCallService.addEventListener('room_created', handleRoomCreated);
    simpleVideoCallService.addEventListener('join_request_sent', handleJoinRequestSent);

    return () => {
      // Remove event listeners
      simpleVideoCallService.removeEventListener('join_approved', handleJoinApproved);
      simpleVideoCallService.removeEventListener('join_rejected', handleJoinRejected);
      simpleVideoCallService.removeEventListener('join_error', handleJoinError);
      simpleVideoCallService.removeEventListener('room_created', handleRoomCreated);
      simpleVideoCallService.removeEventListener('join_request_sent', handleJoinRequestSent);
    };
  }, []);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError('Please enter a room name');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const roomId = await simpleVideoCallService.createRoom(roomName, userId, userName);
      onRoomCreated(roomId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create room');
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomIdToJoin.trim()) {
      setError('Please enter a room ID');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setJoinStatus('idle');

    try {
      await simpleVideoCallService.joinRoom(roomIdToJoin, userId, userName);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join room');
      setIsLoading(false);
    }
  };

  const handleEnterApprovedRoom = () => {
    if (joinStatus === 'approved' && roomIdToJoin) {
      onRoomJoined(roomIdToJoin);
    }
  };

  const resetForm = () => {
    setRoomName('');
    setRoomIdToJoin('');
    setError('');
    setSuccess('');
    setJoinStatus('idle');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 text-white">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Video Chat</h1>
            <p className="text-gray-300">Create or join a video chat room</p>
          </div>

          {/* User Info */}
          <div className="bg-white/10 rounded-lg p-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Signed in as:</span>
              <Badge variant="secondary" className="bg-blue-500 text-white">
                {userName}
              </Badge>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-6 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => {
                setActiveTab('create');
                resetForm();
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'create'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Plus size={16} className="inline mr-2" />
              Create Room
            </button>
            <button
              onClick={() => {
                setActiveTab('join');
                resetForm();
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'join'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <UserPlus size={16} className="inline mr-2" />
              Join Room
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center">
              <AlertCircle size={16} className="text-red-400 mr-2" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center">
              <CheckCircle size={16} className="text-green-400 mr-2" />
              <span className="text-green-300 text-sm">{success}</span>
            </div>
          )}

          {/* Create Room Form */}
          {activeTab === 'create' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Room Name</label>
                <Input
                  type="text"
                  placeholder="Enter room name..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={handleCreateRoom}
                disabled={isLoading || !roomName.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Creating Room...
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Create Room
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-400 text-center">
                You will be the room owner and can control who joins
              </div>
            </div>
          )}

          {/* Join Room Form */}
          {activeTab === 'join' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Room ID</label>
                <Input
                  type="text"
                  placeholder="Enter room ID..."
                  value={roomIdToJoin}
                  onChange={(e) => setRoomIdToJoin(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  disabled={isLoading || joinStatus === 'requesting'}
                />
              </div>

              {joinStatus === 'idle' && (
                <Button
                  onClick={handleJoinRoom}
                  disabled={isLoading || !roomIdToJoin.trim()}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Requesting to Join...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} className="mr-2" />
                      Request to Join
                    </>
                  )}
                </Button>
              )}

              {joinStatus === 'requesting' && (
                <div className="text-center py-4">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-400" />
                  <p className="text-sm text-gray-300">Waiting for approval from room owner...</p>
                </div>
              )}

              {joinStatus === 'approved' && (
                <Button
                  onClick={handleEnterApprovedRoom}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Enter Room
                </Button>
              )}

              {joinStatus === 'rejected' && (
                <div className="text-center py-4">
                  <XCircle size={24} className="mx-auto mb-2 text-red-400" />
                  <p className="text-sm text-gray-300 mb-4">
                    Your request to join was rejected
                  </p>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Try Another Room
                  </Button>
                </div>
              )}

              <div className="text-xs text-gray-400 text-center">
                The room owner will need to approve your request
              </div>
            </div>
          )}

          {/* Features List */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <h3 className="text-sm font-medium mb-3 text-gray-300">Features:</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center">
                <Video size={12} className="mr-2 text-blue-400" />
                HD Video & Audio
              </li>
              <li className="flex items-center">
                <Users size={12} className="mr-2 text-green-400" />
                Owner Controls
              </li>
              <li className="flex items-center">
                <CheckCircle size={12} className="mr-2 text-purple-400" />
                Device Selection
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VideoCallLobby;
