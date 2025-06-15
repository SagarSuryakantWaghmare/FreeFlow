"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import SimpleVideoCallLobby from '@/components/VideoCall/SimpleVideoCallLobby';
import SimpleVideoCallRoom from '@/components/VideoCall/SimpleVideoCallRoom';
import simpleVideoCallService, { VideoRoom } from '@/lib/SimpleVideoCallService';
import { useToast } from '@/hooks/use-toast';
import { SafeLocalStorage } from '@/lib/utils/SafeLocalStorage';

export default function VideoCallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isSignedIn, isLoaded, user } = useUser();
  
  const [currentRoom, setCurrentRoom] = useState<VideoRoom | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded) return;

    // Redirect to sign-in if not authenticated
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use video calls",
        variant: "destructive"
      });
      router.push('/sign-in');
      return;
    }    // Get user info from Clerk
    if (user) {
      const clerkUserId = user.id;
      const clerkUserName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Unknown User';
      
      setUserId(clerkUserId);
      setUserName(clerkUserName);

      // Initialize the video call service with user information
      simpleVideoCallService.initialize(clerkUserId, clerkUserName);
    }

    // Check if there's an existing room
    const existingRoom = simpleVideoCallService.getCurrentRoom();
    if (existingRoom) {
      setCurrentRoom(existingRoom);
    }

    // Set up event listeners
    const handleRoomCreated = (room: VideoRoom) => {
      setCurrentRoom(room);
    };

    const handleRoomLeft = () => {
      setCurrentRoom(null);
    };

    simpleVideoCallService.addEventListener('room_created', handleRoomCreated);
    simpleVideoCallService.addEventListener('room_left', handleRoomLeft);

    return () => {
      simpleVideoCallService.removeEventListener('room_created', handleRoomCreated);
      simpleVideoCallService.removeEventListener('room_left', handleRoomLeft);
    };
  }, [isLoaded, isSignedIn, user, router, toast]);
  const generateUserId = (): string => {
    return 'user_' + Math.random().toString(36).substring(2, 15);
  };

  const handleRoomCreated = (roomId: string) => {
    toast({
      title: "Room Created!",
      description: `Room ID: ${roomId}`,
    });
  };

  const handleRoomJoined = (roomId: string) => {
    toast({
      title: "Joined Room!",
      description: `Successfully joined room: ${roomId}`,
    });
    
    // Create a mock room object for now (in real implementation, this would come from the service)
    const mockRoom: VideoRoom = {
      id: roomId,
      name: 'Joined Room',
      ownerId: 'other_user',
      ownerName: 'Room Owner',
      participants: [
        {
          id: userId,
          name: userName,
          isOwner: false,
          isVideoEnabled: true,
          isAudioEnabled: true
        }
      ],
      createdAt: new Date(),
      isActive: true
    };
    
    setCurrentRoom(mockRoom);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    toast({
      title: "Left Room",
      description: "You have left the video call",
    });
  };

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated (this shouldn't happen due to useEffect redirect)
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please sign in to use video calls</p>
          <button 
            onClick={() => router.push('/sign-in')}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // If we don't have user info, show loading
  if (!userId || !userName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  // If in a room, show the room component
  if (currentRoom) {
    return (
      <SimpleVideoCallRoom
        room={currentRoom}
        onLeave={handleLeaveRoom}
      />
    );
  }

  // Otherwise, show the lobby
  return (
    <SimpleVideoCallLobby
      onRoomCreated={handleRoomCreated}
      onRoomJoined={handleRoomJoined}
      userId={userId}
      userName={userName}
    />
  );
}
